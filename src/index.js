import getEnvVars from "../environment.js";
import { AnalyzeDocumentCommand, TextractClient } from  "@aws-sdk/client-textract";
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as readline from 'readline';

const ENV_VARS = getEnvVars();

// Create SNS service object.
const textractClient = new TextractClient({ 
  credentials: {
    accessKeyId: ENV_VARS.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV_VARS.AWS_SECRET_ACCESS_KEY,
  },
  region: ENV_VARS.AWS_REGION,
});

const processTheResponse = async (response) => {
  try {
    if (response.Blocks) {
      const results = {};
      for (const block of response.Blocks) {
        if (block.BlockType !== "QUERY") continue;
        if (block.Relationships) {
          for (const relation of block.Relationships) {
            if (relation.Type === "ANSWER") {
              for (const blockValue of response.Blocks) {
                if (blockValue.Id === relation.Ids[0]) {
                  results[block.Query.Alias] = blockValue.Text;
                }
              }
            }
          }
        }
      }
      if (Object.keys(results).length === 0) {
        return 'No answer found';
      }
      return {
        serial_number: results?.serial_number || '',
        model: results?.model || '',
        manufacturer: results?.manufacturer || '',
      };
    } else {
      return 'No answer found';
    }
  } catch (err) {
    console.log("Error", err);
    return 'No answer found';
  }
}

const analyzeDocumentText = async (params) => {
  try {
    const analyzeDoc = new AnalyzeDocumentCommand(params);
    const response = await textractClient.send(analyzeDoc);
    return response;
  } catch (err) {
    console.log("Error", err);
  }
}

const readInput = (message) => {
  const interfaceRL = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => interfaceRL.question(message, answer => {
    interfaceRL.close();
    resolve(answer);
  }))
}

const isBase64 = (value) => {
  return (
    value.includes('data:image/jpeg;base64') ||
    value.includes('data:image/gif;base64') ||
    value.includes('data:image/png;base64')
  );
}

const imageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    // Read the image file
    fs.readFile(imagePath, 'base64', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

(async () => {
  const imagePath = await readInput('Enter image path: ');
  const imageBase64 = await imageToBase64(imagePath);
  // Convert base64 to a Buffer object
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  // Set params
  const params = {
    Document: {
      Bytes: imageBuffer,
    },
    FeatureTypes: ['QUERIES'],
    QueriesConfig: {
      Queries: [
        {
          Alias: "serial_number",
          Pages: ['1'],
          Text: "What is the serial number?",
        },
        {
          Alias: "model",
          Pages: ['1'],
          Text: "What is the model?",
        },
        {
          Alias: "manufacturer",
          Pages: ['1'],
          Text: "What is the manufacturer?",
        },
      ],
    }
  };
  
  const response = await analyzeDocumentText(params);

  const wantToSaveResponse = await readInput('Do you want to save the response in json file? (y/n): ');
  if (wantToSaveResponse === 'y') {
    const fileName = await readInput('Write file name: ');
    const filePath = `jsonDir/${fileName.replace('.json', '')}.json`;
    // Save the response data to a JSON file
    fse.outputFile(filePath, JSON.stringify(response));
  }
  const result = processTheResponse(response)
  console.log(result);
})();

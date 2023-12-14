# aws_textract_example

Dummy prototype to use AWS Textract service with queries.

Amazon Textract is a service provided by Amazon Web Services (AWS) that makes it easy to extract text and data from scanned documents. It uses machine learning algorithms to automatically analyze documents and extract information.

> IMPORTANT: The free tier for AWS Textract allows you to make 100 requests to Analyze the image. You'll need to pay for the service if you exceed this amount.

## Set Up AWS Account

If you don't have an AWS account, create one [here](https://aws.amazon.com/).

## Create an IAM Role

Create an IAM (Identity and Access Management) role with the necessary permissions to use Textract. The policy should include AmazonTextractFullAccess or specific Textract-related permissions.

## Set your environment

On your console run

```cmd
cp environment.example.js environment.js
```

and populate the information needed.

## install package

```cmd
npm install
```

## Start the project

```cmd
npm run start
```

### Notes

- The script will ask you for the image path; after that, it will get the raw data from the aws if the process works as expected, it will ask you if you want to save this data in a JSON file. If you select `y`, then it will ask you to name the document. Otherwise, it will finish with the data processed displayed in the console.

- Every JSON file will store in the folder `jsonDir/`.

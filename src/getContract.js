const AWS = require("aws-sdk");
const { checkJwt } = require("./functions/checkJwt");

const getContract = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  });

  const { id } = event.queryStringParameters;

  let tokenWithBearer = event.headers.Authorization;
  let decoded = checkJwt(tokenWithBearer);

  if (decoded) {
    try {
      const result = await dynamodb
        .scan({
          TableName: "ContractsTable",
        })
        .promise();

      let contract = [];

      result.Items.forEach((element) => {
        if (element.contractID === id) {
          contract.push(element);
        }
      });

      if (contract.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 400: "Bad Request. No such contract ID" }),
        };
      }

      return {
        status: 200,
        body: contract,
      };
    } catch (queryError) {
      console.log("There was an error attempting to retrieve this contract");
      console.log("queryError", queryError);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "There was an error retrieving the contracts",
        }),
      };
    }
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ 401: "Unauthorized" }),
    };
  }
};

module.exports = {
  getContract,
};

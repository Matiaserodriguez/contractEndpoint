const { v4 } = require("uuid");
const AWS = require("aws-sdk");
const { checkJwt } = require("./functions/checkJwt");

const addContract = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  });

  let tokenWithBearer = event.headers.Authorization;
  let decoded = checkJwt(tokenWithBearer);

  if (decoded) {
    const { contractName } = JSON.parse(event.body);
    const userID = v4();
    const templateID = v4();
    const contractID = v4();

    if (contractName === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          400: "Bad Request. Make sure you have contractName in the request's body",
        }),
      };
    }
    const newContract = {
      userID,
      contractName,
      templateID,
      contractID,
    };

    try {
      await dynamodb
        .put({
          TableName: "ContractsTable",
          Item: newContract,
        })
        .promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ contractID: contractID }),
      };
    } catch (queryError) {
      console.log("There was an error attempting to retrieve the contracts");
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
  addContract,
};

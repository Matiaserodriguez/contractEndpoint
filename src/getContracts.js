const AWS = require("aws-sdk");
const { checkJwt } = require("./functions/checkJwt");

getContracts = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY",
    secretAccessKey: "DEFAULT_SECRET",
  });

  let tokenWithBearer = event.headers.Authorization;
  let decoded = checkJwt(tokenWithBearer);

  if (decoded) {
    try {
      const result = await dynamodb
        .scan({
          TableName: "ContractsTable",
        })
        .promise();

      const contracts = [];

      result.Items.forEach((item) => {
        contracts.push({
          contractID: item.contractID,
        });
      });

      return {
        status: 200,
        body: {
          contracts,
        },
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
  getContracts,
};

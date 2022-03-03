const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");

module.exports.createUser = async (event) => {
  const body = JSON.parse(event.body);

  const username = body.username;
  const password = bcrypt.hashSync(body.password, 10);

  const newUserParams = {
    TableName: "UsersTable",
    Item: {
      username,
      password,
    },
  };
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_SECRET",
    });

    await dynamodb.put(newUserParams).promise();

    console.log(
      await dynamodb
        .scan({
          TableName: "UsersTable",
        })
        .promise()
    );

    return {
      statusCode: 201,
      body: JSON.stringify({ created: "Ok" }),
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
};

const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

module.exports.login = async (event) => {
  const body = JSON.parse(event.body);

  const username = body.username;
  const password = body.password;

  const queryUserParams = {
    TableName: "UsersTable",
    Key: {
      username,
    },
  };

  let userResult = {};
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_SECRET",
    });
    userResult = await dynamodb.get(queryUserParams).promise();
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

  if (userResult) {
    const compareResult = bcrypt.compareSync(
      password,
      userResult.Item.password
    );
    if (compareResult) {
      let token = jwt.sign(
        {
          username: userResult.Item.username,
        },
        (JWT_SECRET = "secret"),
        {
          expiresIn: "60s",
        }
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          token: token,
        }),
      };
    }
  }
  return {
    statusCode: 404,
    body: JSON.stringify({
      statusCode: 404,
      message: "User or password is incorrect",
    }),
  };
};

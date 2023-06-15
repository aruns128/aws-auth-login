import { default as AWS } from "aws-sdk";
import * as bcrypt from "bcrypt";

export const handler = async (event) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();

  AWS.config.update({
    region: "eu-north-1",
  });
  console.log("Request event: ", event);
  let response;
  switch (true) {
    case event.httpMethod === "POST" && event.path === "/create-user":
      response = createUser(event, dynamodb);
      break;
    case event.httpMethod === "POST" && event.path === "/login":
      response = await loginUser(event, dynamodb);
      break;
    default:
      response = {
        statusCode: 404,
        body: "method not found",
      };
  }
  return response;
};

function createUser(event, dynamodb) {
  const { email, password } = JSON.parse(event.body);

  return bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      const params = {
        TableName: "auth",
        Item: {
          email: email,
          password: hashedPassword,
        },
      };

      return dynamodb
        .put(params)
        .promise()
        .then(() => {
          return {
            statusCode: 200,
            body: "User created successfully",
          };
        })
        .catch(() => {
          return {
            statusCode: 500,
            body: "Failed to create user",
          };
        });
    })
    .catch(() => {
      return {
        statusCode: 500,
        body: "Failed to hash password",
      };
    });
}

function loginUser(event, dynamodb) {
  const { email, password } = JSON.parse(event.body);

  const params = {
    TableName: "auth",
    Key: {
      email: email,
    },
  };

  return dynamodb
    .get(params)
    .promise()
    .then(({ Item }) => {
      if (!Item) {
        return {
          statusCode: 401,
          body: "User not found",
        };
      }

      const storedPassword = Item.password;

      return bcrypt
        .compare(password, storedPassword)
        .then((isPasswordValid) => {
          if (isPasswordValid) {
            return {
              statusCode: 200,
              body: "Login successful",
            };
          } else {
            return {
              statusCode: 401,
              body: "Invalid credentials",
            };
          }
        })
        .catch(() => {
          return {
            statusCode: 500,
            body: "Failed to compare passwords",
          };
        });
    })
    .catch(() => {
      return {
        statusCode: 500,
        body: "Failed to retrieve user",
      };
    });
}

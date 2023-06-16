import { default as AWS } from "aws-sdk";
import { createUser } from "./createUser.js";
import { login } from "./login.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: "eu-north-1",
});

export const handler = async (event, context) => {
  console.log(event, "event");
  const { httpMethod, path } = event;

  if (httpMethod === "POST" && path === "/auth/create-user") {
    const { email, password } = JSON.parse(event.body);
    const result = createUser(email, password, dynamoDB);
    return result;
  } else if (httpMethod === "POST" && path === "/auth/login") {
    const { email, password } = JSON.parse(event.body);
    const result = login(email, password, dynamoDB);
    return result;
  } else {
    return { statusCode: 400, body: "Method not exist" };
  }
};

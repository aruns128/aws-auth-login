import * as bcrypt from "bcrypt";
export const login = async (email, password, dynamoDB) => {
  const params = {
    TableName: "auth",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  try {
    const result = await dynamoDB.scan(params).promise();
    const users = result.Items;
    if (users.length === 1 && bcrypt.compareSync(password, users[0].password)) {
      return { statusCode: 200, body: "Login successful" };
    } else {
      return { statusCode: 401, body: "Invalid credentials" };
    }
  } catch (error) {
    return { statusCode: 500, body: "Login failed" };
  }
};

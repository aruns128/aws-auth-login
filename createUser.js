import * as bcrypt from "bcrypt";
export const createUser = async (email, password, dynamoDB) => {
  console.log(email, password);

  const existingEmailParams = {
    TableName: "auth",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  const result = await dynamoDB.scan(existingEmailParams).promise();
  const users = result.Items;

  if (users.length) {
    return { statusCode: 500, body: "User already exist" };
  } else {
    const id = Date.now();
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const params = {
      TableName: "auth",
      Item: {
        email: email,
        password: hashedPassword,
        id: `${id}`,
      },
    };
    console.log(params);
    try {
      await dynamoDB.put(params).promise();
      const body = { statusCode: 200, body: "User created successfully" };
      return body;
    } catch (error) {
      console.log(error);
      return { statusCode: 500, body: "Failed to create user" };
    }
  }
};

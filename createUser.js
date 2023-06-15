export function createUser(event, bcrypt, dynamodb) {
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

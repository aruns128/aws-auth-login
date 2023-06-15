export function loginUser(event, bcrypt, dynamodb) {
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

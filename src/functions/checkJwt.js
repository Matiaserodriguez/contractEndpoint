const jwt = require("jsonwebtoken");

const checkJwt = (jwtToken) => {
  try {
    let token = jwtToken.replace("Bearer ", "");
    return (decoded = jwt.verify(token, "secret"));
  } catch {
    return (decoded = false);
  }
};

module.exports = {
  checkJwt,
};

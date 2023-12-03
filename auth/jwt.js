const jwt = require("jsonwebtoken");
const { token } = require("morgan");

const verifyToken = (req, res, next) => {
  // const token = req.cookies.access_token;
  const token = req.headers["authorization"];
  console.log(req.headers);
  if (!token) {
    return next(new Error("You dont have JWT"));
  }
  const bearer = token.split(" ")[1];
  jwt.verify(bearer, "Secret", (error, user) => {
    if (error) {
      return next(new Error("Invalid JWT"));
    }
    req.user = user;
    next();
  });
};
module.exports = { verifyToken };

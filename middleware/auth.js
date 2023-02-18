const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
async function checkAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const decodedToken = jwt.verify(token, process.env.JSON_SIGNATURE);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized"});
  }
}

module.exports = checkAuth;

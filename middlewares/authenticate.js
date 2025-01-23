const jwt = require("jsonwebtoken");
const { queryRunner } = require("../helpers/queryRunner");
const { selectQuery } = require("../constant/queries");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ulweoslsdjf4534");
    // console.log(decoded,"decode")

        
    const result = await queryRunner(selectQuery("user_register", "id"), [decoded.id]);
    // console.log(result[0][0].id);



    if (!result[0].length) {
      return res.status(404).json({ message: "User not found" });
    }   
    req.user ={
        userId: result[0][0].id,
    }; 
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = {
  verifyToken,
};
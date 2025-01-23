const bcrypt = require("bcrypt");
const { hashedPassword } = require("../helpers/hashPassword");
const jwt = require("jsonwebtoken");
const { queryRunner } = require("../helpers/queryRunner");
const { selectQuery, insertSignUpQuery } = require("../constant/queries");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dyapf84jc",
  api_key: "496521674925892",
  api_secret: "YzzczoQJnZ4ePhqsqd-zAZqcCX0",
});
exports.signIn = async function (req, res) {
  const { email, password } = req.body;
  // console.log(req.body);

  try {
    const selectResult = await queryRunner(
      selectQuery("user_register", "email"),
      [email]
    );

    if (selectResult[0].length === 0) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    const user = selectResult[0][0];
    // console.log(user.password,"user");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    // console.log(isPasswordValid,"isPasswordValid");
    if (!isPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || "ulweoslsdjf4534",
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Sign-in successful",
      token,
      id: user.id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login",
      error: error.message,
    });
  }
};


  
exports.register = async function (req, res) {
  const { fname, lname, email, password, phoneNumber, region, city, country, address } = req.body;
  console.log(req.body);

  // if (!fname || !lname || !email || !password) {
  //   return res.status(400).json({
  //     statusCode: 400,
  //     message: "Missing required fields (fname, lname, email, password)",
  //   });
  // }

  const currentDate = new Date();

  try {

    const selectResult = await queryRunner(selectQuery("user_register", "email"), [email]);

    if (selectResult[0].length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: `User already exists with this email: ${email}`,
      });
    }

    
    const hashPassword = await hashedPassword(password);

    // Handle file upload to Cloudinary
    cloudinary.uploader.upload_stream({ resource_type: "auto" }, async (error, result) => {
      if (error) {
        return res.status(500).json({
          statusCode: 500,
          message: "Error while uploading file to Cloudinary",
          error: error.message,
        });
      }

      const imageUrl = result.secure_url;
      // console.log(imageUrl,"imageurl");

      // Generate unique ID for the user
      const salt = bcrypt.genSaltSync(10);
      const id = bcrypt.hashSync(fname + new Date().getTime().toString(), salt).substring(0, 10);

      // Insert user into the database
      const insertResult = await queryRunner(insertSignUpQuery, [
        fname,
        lname,
        email,
        hashPassword,
        phoneNumber,
        region,
        city,
        country,
        address,
        imageUrl,
        currentDate,
      ]);

      if (insertResult[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: "User added successfully",
          id: insertResult[0].insertId,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to add user",
        });
      }
    }).end(req.file.buffer);

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};

exports.getProfile = async function (req, res) {
  const { userId } = req.user;
  // console.log(userId,"user");
  try {
    const selectResult = await queryRunner(selectQuery("user_register", "id"), [userId]);

    if (selectResult[0].length > 0) {
      
      delete selectResult[0][0].password;
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0][0],
      });
    } else {
      res.status(404).json({ message: "User Not Found" });
    }

    

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "An error occurred while fetching the user",
      error: error.message,
    });
  }
}

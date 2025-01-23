exports.selectQuery = (table, ...field) => {
    if (field.length === 1) {
      return `SELECT * FROM ${table} WHERE ${field[0]} = ?`;
    } 
    else if (field.length > 1) {
      return `SELECT * FROM ${table} WHERE ${field[0]} = ? and ${field[1]} = ?`;
    } else {
      return `SELECT * FROM ${table}`;
    }
  };


  exports.insertSignUpQuery = "INSERT INTO user_register(fname,lname,email,password,phoneNumber,region,city,country,address,profilePic,currentdate) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  // exports.insertSignUpQuery = "INSERT INTO user_register(id,fname,lname,email,password) VALUES (?,?,?,?,?)";

  exports.insertMessgeQuery = "INSERT INTO messages (fromId, toId, message,role) VALUES (?, ?, ?,?)";
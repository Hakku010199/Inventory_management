 
 const mysql = require("mysql2");
 require("dotenv").config();

const connection = mysql.createConnection(
    {
        
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.name
})

  connection.connect((err) => {
    if (err) {
        console.log(err);
        return;
       }

    console.log("mysql connection is ready");
});

  module.exports = connection;
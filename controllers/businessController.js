
const db = require("../dbConnection/db");

const createBusiness = (req, res) => {
    const {name, strategy } = req.body;

    const sql = "INSERT INTO business(name, strategy) VALUES(?, ?)";

            db.query(sql, [name, strategy], (err, result) => {
                if (err) {
                    return res.status(500).json({
                        message: err.message
                 });
                 }

                res.status(201).json({
                    message: "Business created successfully",
                    id: result.insertId
                });
            })
        };


module.exports = {
    createBusiness
}
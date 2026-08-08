 const db = require("../dbConnection/db");

const addInventory = (req, res) => {
    const {
        product_id,
        batch_no,
        quantity,
        purchase_date,
         expiry_date,
         cost_price
    } = req.body;

    const sql = `
        INSERT INTO inventory_batches
        (product_id, batch_no, quantity, purchase_date, expiry_date, cost_price)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

 db.query( sql,
        [
        product_id,
          batch_no,
        quantity,
            purchase_date,
            expiry_date,
            cost_price
        ],

    (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: err.message
                        });
                    }

        res.status(201).json({
                        message: "inventory is added successfully",
                        id: result.insertId
                    });
                }
            )
}

    module.exports = {     addInventor  }
    
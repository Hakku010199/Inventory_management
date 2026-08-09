 const db = require("../dbConnection/db");

        const createSale = (req, res) => {
            const {
                business_id,
                product_id,
                quantity,
                batch_no
            } = req.body;

            
       

            if (quantity <= 0) {
                return res.status(400).json({
                    message: "Quantity must be greater than 0"
                });
               }
 



    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }


            const strategySql = `
                SELECT strategy
                FROM business
                WHERE id = ?
            `;

       db.query(strategySql, [business_id], (err, businessResult) => {
            if (err) {
                return rollback(err);
            }

            if (businessResult.length === 0) {
                return rollback(new Error("Business not found"));
            }

        const strategy = businessResult[0].strategy;

                if (strategy === "BATCH" && !batch_no) {
                    return rollback(
                        new Error("batch_no is required for BATCH strategy")
                    );
                }

            
                let inventorySql = `
                    SELECT *
                    FROM inventory_batches
                        WHERE product_id = ?
                        AND quantity > 0
                `;

     const params = [product_id];

            if (strategy === "FIFO") {

                inventorySql += `
                    ORDER BY purchase_date ASC, id ASC
                `;

                } 
              else if (strategy === "FEFO") {

                    inventorySql += `
                        AND (
                       expiry_date IS NULL
                            OR expiry_date >= CURDATE()
                        )
                        ORDER BY
                            expiry_date IS NULL,
                            expiry_date ASC,
                            id ASC
                    `;

            } 
            else if (strategy === "BATCH") {

                inventorySql += `
                    AND batch_no = ?
                `;

                params.push(batch_no);
            }

      db.query(inventorySql, params, (err, batches) => {
                if (err) {
                    return rollback(err);
                }

                    if (batches.length === 0) {
                        return rollback(
                            new Error("No available inventory found")
                        );
                    }

                    const totalStock = batches.reduce(
                        (total, batch) => total + batch.quantity,
                        0
                    );

              
                if (totalStock < quantity) {
                    return rollback(
                        new Error("Insufficient stock")
                    );
                }

            let remainingQuantity = quantity;

                const deductions = [];

                for (const batch of batches) {

                        if (remainingQuantity <= 0) {
                            break;
                        }

                    const deductQuantity = Math.min(
                        batch.quantity,
                        remainingQuantity
                    );

                    deductions.push({
                            batch_id: batch.id,
                            batch_no: batch.batch_no,
                            quantity: deductQuantity
                        })

                    remainingQuantity -= deductQuantity;
                }

               
                const saleSql = `
                    INSERT INTO sales (business_id)
                    VALUES (?)
                `;

                db.query(
                    saleSql,
                    [business_id],
                    (err, saleResult) => {

                        if (err) {
                            return rollback(err)
                        }

                     const saleId = saleResult.insertId

                        // batch deduction
                     processDeduction
                     (
                        deductions,
                            saleId,
                            0
                        );
                    }
                );
              });
        })



        function processDeduction(
            deductions,
            saleId,
            index
        ) 
        {

            // All deductions completed
            if (index >= deductions.length) {

                return db.commit((err) => {

                    if (err) {
                        return rollback(err);
                    }

                    return res.status(201).json({
                        message: "Sale created ",
                        sale_id: saleId,
                        deductions: deductions
                    })
                })
            }

            const deduction = deductions[index];

            // 9. Reduce  quantity
            const updateSql = `
                UPDATE inventory_batches
                SET quantity = quantity - ?
                WHERE id = ?
                AND quantity >= ?
            `;

            db.query(
                updateSql,
                [
                    deduction.quantity,
                    deduction.batch_id,
                    deduction.quantity
                ],
                (err, result) => {

                    if (err) {
                        return rollback(err);
                    }

                
                    if (result.affectedRows === 0) {
                        return rollback(
                            new Error(
                                "Stock changed. Sale cannot be completed."
                            )
                        );
                    }

                  
                    const itemSql = `
                        INSERT INTO sale_items
                        (sale_id, batch_id, quantity)
                        VALUES (?, ?, ?)
                    `;

                    db.query(
                        itemSql,
                        [
                            saleId,
                            deduction.batch_id,
                            deduction.quantity
                        ],
                     (err) => {

                            if (err) {
                                return rollback(err);
                           }


                            processDeduction(
                                deductions,
                                saleId,
                                index + 1
                            );
                        }
                        );
                  }
             );
        }


        function rollback(error) {

            db.rollback(() => {
                return res.status(500).json({
                    message: error.message
            });

            });
         }
    });
    };

    module.exports = { createSale }
    
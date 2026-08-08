 Inventory Management System

1.Backend inventory management system built using Node.js, Express.js, and MySQL.

-- Tech Stack

Node.js
 Express.js
 MySQL
 mysql2
 dotenv
update scripts of package.json

-- Setup

npm install


2 . Create .env
host=localhost
user=user
password=mysql_password
database-name=inventory_db

3 . Setup Database and tables

Database Schema

The application uses five main tables:

business - stores business and inventory strategy
products - stores products
inventory_batches - stores inventory batches
sales - stores sales
sale_items - stores batches consumed in each sale

Relationships:

business → sales → sale_items → inventory_batches → products

Run the SQL schema to create the required database and tables:

--bash
sudo mysql < database/schema.sql

 4 . Start Server
npm run dev

Server:

http://localhost:5000

inventory-management/
├── controllers/
├── routes/
├── dbConnection/
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md


Inventory-logic

The inventory is stored batch-wise. Whenever new stock comes in, we create a batch with the product, batch number, quantity, purchase date, expiry date, and cost price.

When a customer makes a sale, the system first checks which strategy the business is using — FIFO, FEFO, or BATCH.

For FIFO, we take stock from the oldest batch first. So we sort the batches by purchase date and start deducting from the oldest one. If that batch doesn't have enough stock, we move to the next batch.

For FEFO, we do basically the same thing, but instead of looking at the purchase date, we look at the expiry date. The batch that expires first is used first.

For BATCH, the user has to tell us which batch they want. The system checks that batch and deducts the requested quantity from it.

If one batch isn't enough, the sale can use multiple batches. For example, if the customer wants 25 units and the first batch has only 20, we take 20 from the first batch and 5 from the next batch.

Before making the sale, we also check whether enough stock is available.  Don't allow the quantity to become negative.

Finally, the sale and all its batch deductions are saved together using a transaction. If something goes wrong, everything is rolled back.


---POST Requests---

1.http://localhost:5000/business
body:
    {
        "name": "A",
        "strategy": "FIFO"
    }

2.http://localhost:5000/inventory/inward
body:
    {
    "product_id": 1,
    "batch_no": "B1",
    "quantity": 20,
    "purchase_date": "2026-08-01",
    "expiry_date": "2026-12-01",
    "cost_price": 40
}

3.http://localhost:5000/sales
body:{
    "business_id": 1,
    "product_id": 1,
    "quantity": 25
}

4.

require("./dbConnection/db");
const express = require("express");
const app = express();

 require("dotenv").config();

const businessRoutes = require("./routes/businessRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const salesRoutes = require("./routes/salesRoutes");


app.use(express.json());

//const PORT=3000 || process.env.PORT

app.use("/business", businessRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/sales", salesRoutes);


app.listen(5000, () => {
    console.log("Server running on port 5000")
});
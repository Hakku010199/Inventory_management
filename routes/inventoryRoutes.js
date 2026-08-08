const express = require("express");
const router = express.Router();

const { addInventory } = require("../controllers/inventoryController");

router.post("/inward", addInventory);

module.exports = router;
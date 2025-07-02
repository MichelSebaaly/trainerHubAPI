const express = require("express");
const ProgramSales = require("../models/program-sales");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const router = express.Router();

const calculateCommission = (program_price) => {
  const percentage_for_platform = 0.2;
  const platform_fee = program_price * percentage_for_platform;
  const trainer_earnings = program_price - platform_fee;
  return { platform_fee, trainer_earnings };
};

//Buy Program (POST)
router.post("/", authenticate, async (req, res) => {
  checkUser(req, res, "user", "Please sign up as user to purchase!");
  try {
    const { program_id, price } = req.body;
    const user_id = req.user.id;
    const { platform_fee, trainer_earnings } = calculateCommission(price);
    const purchaseDetails = {
      user_id,
      program_id,
      platform_fee,
      trainer_earnings,
    };
    const confirmPurchase = await ProgramSales.create(purchaseDetails);
    res.status(201).json({ message: "Program purchased", confirmPurchase });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get all purchases (GET)
router.get("/all", authenticate, async (req, res) => {
  checkUser(req, res, "admin", "UnAuthorized!");
  try {
    const purchases = await ProgramSales.findAll();
    if (!purchases) {
      return res.status(201).json({ message: "No program purchased" });
    }
    res.send(purchases);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get purchased programs by user (GET
router.get("/", authenticate, async (req, res) => {
  checkUser(
    req,
    res,
    "user",
    "Sorry trainer you're not allowed to perform this action"
  );
  try {
    const purchasedPrograms = await ProgramSales.findAll({
      where: (user_id = req.user.id),
    });
    if (!purchasedPrograms) {
      return res.status(201).json({ message: "You don't have any programs" });
    }
    res.send(purchasedPrograms);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const User = require("../models/users");
const authenticate = require("../utils/authenticate");
const checkUser = require("../utils/checkUser");
const ProgramSales = require("../models/program-sales");
const { fn, col } = require("sequelize");
const Program = require("../models/programs");
const upload = require("../utils/multer-config");

const router = express.Router();

router.use(cookieParser());

dotenv.config();
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
const REFRESH_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "15min" }
  );

  const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_KEY, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};
//User register (POST)
router.post("/register", async (req, res) => {
  const user = req.body;
  const { password } = user;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userWithHashedPass = { ...user, password: hashedPassword };
    await User.create(userWithHashedPass);
    res.status(201).json({ message: "registered" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
//User login (POST)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const matchedUser = await User.findOne({ where: { email } });
    if (!matchedUser) {
      return res.status(403).json({ message: "User not found" });
    } else {
      const matchPass = await bcrypt.compare(password, matchedUser.password);
      if (!matchPass) {
        return res.status(403).json({ message: "Bad credentials!" });
      }
      const { accessToken, refreshToken } = generateTokens(matchedUser);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/api/user/refresh",
      });

      res.send({
        id: matchedUser.id,
        role: matchedUser.role,
        token: accessToken,
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//refresh token (POST)
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }
  jwt.verify(refreshToken, REFRESH_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const { accessToken } = generateTokens(decoded);
    res.send({ id: user.id, role: user.role, token: accessToken });
  });
});

//Get all users (GET)
router.get("/", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "You're not allowed to perform this action!" });
  }
  try {
    const users = await User.findAll();
    res.send(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Trainer, view total Earnings per program (GET)
router.get("/earnings", authenticate, async (req, res) => {
  checkUser(req, res, "trainer", "Not Allowed!");
  try {
    const totalEarnings = await ProgramSales.findAll({
      attributes: [
        [fn("SUM", col("trainer_earnings")), "total_earnings"],
        [fn("COUNT", "*"), "No_saled_programs"],
      ],
      include: {
        model: Program,
        as: "program",
        attributes: ["title"],
        where: { trainer_id: req.user.id },
      },
      group: ["program.id", "program.title"],
    });
    res.send(totalEarnings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Update Profile Pic (PUT)
router.put("/", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const userId = req.user.id;
    const imageURL = req.file.filename;
    const [update] = await User.update(
      { profile_pic: imageURL },
      { where: { id: userId } }
    );
    if (!update) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile updated", profile_pic: imageURL });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

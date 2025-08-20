const Program = require("../models/programs");
const express = require("express");
const authenticate = require("../utils/authenticate");
const upload = require("../utils/multer-config");
const path = require("path");
const fs = require("fs");
const checkUser = require("../utils/checkUser");
const User = require("../models/users");
const { where } = require("sequelize");
const sequelize = require("../db");
const router = express.Router();

//Add a program (POST)
router.post("/", authenticate, upload.single("file"), async (req, res) => {
  const { role } = req.user;
  const file_url = req.file.filename;
  if (role !== "trainer") {
    return res
      .status(403)
      .json({ message: "You are not allowed to add a program" });
  }
  const program = { ...req.body, trainer_id: req.user.id, file_url };
  try {
    const result = await Program.create(program);
    res.status(201).json({ program: result, message: "Program added." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get all programs (GET)
router.get("/", async (req, res) => {
  try {
    const programs = await Program.findAll({
      attributes: [
        "id",
        "trainer_id",
        "title",
        "description",
        "price",
        "equipment",
        "goal",
        "cover_photo",
        "file_url",
      ],
      include: [
        {
          model: User,
          attributes: ["name", "profile_pic"],
        },
      ],
    });
    res.send(programs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Search a program (GET)
router.get("/search", async (req, res) => {
  const searchText = req.query.searchText;
  try {
    const programs = await Program.findAll({
      where: sequelize.where(
        sequelize.fn(
          "to_tsvector",
          "english",
          sequelize.fn("lower", sequelize.col("title"))
        ),
        "@@",
        sequelize.fn("to_tsquery", "english", searchText.toLowerCase())
      ),
    });
    if (programs.length === 0) {
      return res.status(200).json({ message: "No program found!" });
    }
    res.status(200).json({ programs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//download program (GET)
router.get("/download/:filename", authenticate, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(400).json({ message: "File Not Found" });
  }
});

//Update program information (PUT)
router.put("/:id", authenticate, upload.single("file"), async (req, res) => {
  checkUser(req, res, "trainer", "Only trainers are allowed for this action");
  try {
    const programId = req.params.id;
    const file_url = req.file.filename;
    const updatedProgram = { ...req.body, file_url };
    const [update] = await Program.update(updatedProgram, {
      where: { id: programId, trainer_id: req.user.id },
    });
    if (!update) {
      return res.status(400).json({ message: "Something went wrong!" });
    } else {
      res.status(200).json({ message: "Program updated successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Update cover Photo for the program (PATCH)
router.patch("/:id", authenticate, upload.single("image"), async (req, res) => {
  checkUser(req, res, "trainer", "Only trainer allowed for this action");
  try {
    const programId = req.params.id;
    const cover_photo = req.file.filename;

    const [update] = await Program.update(
      { cover_photo },
      { where: { id: programId, trainer_id: req.user.id } }
    );

    if (!update) {
      return res.status(400).json({ message: "Something went wrong!" });
    } else {
      res
        .status(200)
        .json({ message: "cover photo updated successfully", cover_photo });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//delete program (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer");
  try {
    const id = req.params.id;
    const programToDelete = await Program.findOne({
      where: {
        id,
        trainer_id: req.user.id,
      },
    });
    if (!programToDelete) {
      return res.status(403).json({ message: "Program Not Found!" });
    } else {
      const result = await Program.destroy({ where: { id } });
      res.status(200).json({ id, message: "Program deleted!" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

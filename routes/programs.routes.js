const Program = require("../models/programs");
const express = require("express");
const authenticate = require("../utils/authenticate");
const upload = require("../utils/multer-config");
const path = require("path");
const fs = require("fs");
const checkUser = require("../utils/checkUser");
const router = express.Router();

//Add a program (POST)
router.post("/", authenticate, upload.single("file"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  const { role } = req.user;
  const file_url = req.file.filename;
  if (role !== "trainer") {
    return res
      .status(403)
      .json({ message: "You are not allowed to add a program" });
  }
  const program = { ...req.body, trainer_id: req.user.id, file_url };
  console.log(program);
  try {
    const result = await Program.create(program);
    res.status(201).json({ result, message: "Program added." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get all programs (GET)
router.get("/", authenticate, async (req, res) => {
  try {
    const programs = await Program.findAll();
    res.send(programs);
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

//delete program (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  checkUser(req, res, "trainer");
  try {
    const id = req.params.id;
    const programToDelete = Program.findOne({
      where: {
        id,
        trainer_id: req.user.params,
      },
    });
    if (!programToDelete) {
      return res.status(403).json({ message: "Program Not Found!" });
    } else {
      const result = await Program.destroy({ where: { id } });
      res.status(201).json({ result, message: "Program deleted!" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

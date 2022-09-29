var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var db = require("../database/nedb");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/** POST upload files page */
router.post("/upload", (req, res, next) => {
  const form = formidable({
    uploadDir: "./upload",
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      next(err);
      return;
    }
    res.json(files);
  });
});

/** POST save information files in db */
router.post("/save", (req, res, next) => {
  db.insert(req.body, (err, file) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      res.status(200).json(file);
    }
  });
});

/** GET list files db */
router.get("/list", (req, res) => {
  db.find({})
    .sort({ mtime: 1 })
    .exec((err, files) => {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json(files);
      }
    });
});

module.exports = router;

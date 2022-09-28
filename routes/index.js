var express = require("express");
var router = express.Router();
var formidable = require("formidable");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/** POST upload page */
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

module.exports = router;

var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var db = require("../database/nedb");

const fs = require('fs');
const dir = (__dirname + '/../upload');

/** create directory upload if not exists */
const verifyDirectoryUpload = () => {
 if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/** POST upload files page */
router.post("/upload", (req, res, next) => {
  
  verifyDirectoryUpload();
  
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

/** PUT update file nam */
router.put('/update/:id', (req, res) => {
  const { id } = req.params
  const { originalFilename } = req.body

  console.log(id, originalFilename)

  if (!req.body || !id) return res.status(400).json({ error: 'invalid params' })

  db.update({ _id: id }, req.body , err => {
    if (err) return res.status(400).json({ error: err })
    res.status(200).json(req.body);
  })

})



module.exports = router;

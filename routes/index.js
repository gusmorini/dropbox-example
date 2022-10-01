var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var db = require("../database/nedb");

const fs = require('fs');
const dir = './upload';

/** create directory upload if not exists */
const verifyDirectoryUpload = () => {
 if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}
}
/** delete item directory upload */
const deleteFileDirectoryUpload = filename => {
  const test = dir + '/' + filename 
  if (fs.existsSync(test)) {
    fs.unlinkSync(test)
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
    uploadDir: dir,
    keepExtensions: true,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    const { originalFilename, size, newFilename } = files['input-file']
    // retorno no formato do objeto do projeto
    const file = { 
      name: originalFilename,
      path: newFilename,
      type: originalFilename.split('.')[1],
      size,
    }
    res.status(200).json(file);
  });
});

/** GET list files db */
router.get("/list", (req, res) => {
  db.find({})
    .sort({ createdAt: 1 })
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
  if (!req.body || !id) return res.status(400).json({ error: 'invalid params' })
  db.update({ _id: id }, req.body , err => {
    if (err) return res.status(400).json({ error: err })
    res.status(200).json(req.body);
  })
})

/** DELETE remove file database and file disk server */
router.delete('/delete/:id', (req, res) => {
  try {
    const { id } = req.params
    const { path } = req.body
    db.remove({ _id: id }, {}, err => {
      if (err) throw new Error(err) 
    })
    deleteFileDirectoryUpload(path)
    res.status(200).json({ id, path })
  } catch (e) {
    res.status(400).json({ error: e })
  }
});

module.exports = router;

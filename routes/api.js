const { Router } = require("express");
const router = Router();

const {
  getData,
  setData,
  deleteData,
  updateData,
} = require("../database/realtime");
const formidable = require("formidable");
const fs = require("fs");
const __dir = "./upload";

router.get("/", async function (req, res, next) {
  const index = `home/${req.query.id ? req.query.id : ""}/`;
  getData(index).then((resp) => {
    res.status(200).json(resp);
  });
});

router.post("/save", (req, res) => {
  const data = req.body;
  const prefix = data.type == "folder" ? "dir_" : "file_";
  const id = prefix + Date.now();
  const index = data.index + "/" + id;
  delete data.index;
  setData(index, { id, ...data }).then((resp) => res.status(200).json(resp));
});

router.get("/list", (req, res) => {
  const { index } = req.query;
  getData(index).then((resp) => {
    res.status(200).json(resp);
  });
});

router.patch("/update", (req, res) => {
  const { group, name, id } = req.body;
  const index = [group, id].join("/");
  updateData(index, { name }).then((data) => {
    res.status(200).json({ name, id });
  });
  res.json(req.body);
});

router.delete("/delete", (req, res) => {
  const file = req.body;
  let index = file.index + "/" + file.id;
  if (file.type == "folder") {
    console.log("TRATATIVA FOLDER");
  } else {
    console.log("TRATATIVA ARQUIVO");
  }
  deleteData(index).then((data) => {
    deleteFileDirectoryUpload(file.path);
    res.json(index);
  });
});

router.post("/upload", (req, res) => {
  verifyDirectoryUpload();
  const form = formidable({
    uploadDir: __dir,
    keepExtensions: true,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    const { originalFilename, size, newFilename } = files["input-file"];
    // retorno no formato do objeto do projeto
    const file = {
      name: originalFilename,
      path: newFilename,
      type: originalFilename.split(".")[1],
      size,
    };
    res.status(200).json(file);
  });
});

/** create directory upload if not exists */
const verifyDirectoryUpload = () => {
  if (!fs.existsSync(__dir)) {
    fs.mkdirSync(__dir);
  }
};

/** delete item directory upload */
const deleteFileDirectoryUpload = (filename) => {
  const __path = __dir + "/" + filename;
  if (fs.existsSync(__path)) {
    fs.unlinkSync(__path);
  }
};

module.exports = router;

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

/** open file */
router.get("/file", (req, res) => {
  // path recebido na query string
  const { path, group } = req.query;
  // montando o path completo
  const __path = completePath([group, path]);
  // verifica se o diretorio existe
  if (fs.existsSync(__path)) {
    // verifica se o arquivo é válido
    fs.readFile(__path, (err, data) => {
      if (err) res.status(400).json({ error: err });
      res.status(200).end(data);
    });
  } else {
    res.status(404).json({ error: "file not found" });
  }
});

/** save file in database */
router.post("/save", (req, res) => {
  const data = req.body;
  const prefix = data.type == "folder" ? "dir_" : "file_";
  const id = prefix + Date.now();
  const index = joinArray([data.index, id]);
  delete data.index;
  setData(index, { id, ...data }).then((resp) => res.status(200).json(resp));
});

/** get files database */
router.get("/list", (req, res) => {
  const { index } = req.query;
  getData(index).then((resp) => {
    res.status(200).json(resp);
  });
});

/** update file */
router.patch("/update", (req, res) => {
  const { group, name, id } = req.body;
  const index = joinArray([group, id]);
  updateData(index, { name })
    .then((data) => {
      res.status(200).json({ name, id });
    })
    .catch((e) => res.status(400).json({ error: e }));
});

/** delete file or folder */
router.delete("/delete", (req, res) => {
  const { file, group } = req.body;
  let index = joinArray([group, file.id]);
  deleteData(index).then((data) => {
    if (file.type == "folder") {
      const __path = completePath([index]);
      deleteDirectory(__path);
    } else {
      const __path = completePath([group, file.path]);
      deleteFile(__path);
    }
    res.json(index);
  });
});

/** upload file */
router.post("/upload", (req, res) => {
  const { group } = req.query;
  const __path = completePath([group]);
  verifyDirectory(__path);
  const form = formidable({
    uploadDir: __path,
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

/** return array join (/) */
const joinArray = (array) => {
  return array.join("/");
};

/** return complete path */
const completePath = (dir = []) => {
  return joinArray([__dir].concat(dir));
};

/** create directory upload if not exists */
const verifyDirectory = (__path) => {
  if (!fs.existsSync(__path)) {
    fs.mkdirSync(__path, { recursive: true });
  }
};

/** delete item directory upload */
const deleteFile = (__path) => {
  if (fs.existsSync(__path)) {
    fs.unlinkSync(__path);
  }
};

/** delete directory */
const deleteDirectory = (__path) => {
  if (fs.existsSync(__path)) {
    fs.rmSync(__path, { recursive: true });
  }
};

module.exports = router;

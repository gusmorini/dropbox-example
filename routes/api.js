const { Router } = require("express");
const router = Router();

const { getData, setData } = require("../database/realtime");

const { ref, set, onValue, get, child } = require("firebase/database");

/* GET home page. */
router.get("/", async function (req, res, next) {

  const index = `files/${req.query.id ? req.query.id : ''}`;

  // set(ref(db, index + "/" + Date.now()), {
  //   name: "teste.pdf",
  //   type: "pdf",
  // });

  // get
  // getData(index).then(resp => {
  //   res.status(200).json(resp);
  // })

  //delete item
  // setData('files/banana', null)
  // .then(resp => res.status(200).json(resp));

});

module.exports = router;

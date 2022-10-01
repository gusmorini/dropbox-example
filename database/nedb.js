const NeDB = require("nedb");

const db = new NeDB({
  filename: "dropbox.db",
  autoload: true,
  timestampData: true,
});

module.exports = db;

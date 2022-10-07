const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyCaLmcACKnTGwam1A6hRPx8tbA4fogvfwQ",
  authDomain: "dropbox-example-91ca0.firebaseapp.com",
  databaseURL: "https://dropbox-example-91ca0-default-rtdb.firebaseio.com",
  projectId: "dropbox-example-91ca0",
  storageBucket: "dropbox-example-91ca0.appspot.com",
  messagingSenderId: "848031554868",
  appId: "1:848031554868:web:96d603578f6be77b1ad961",
  measurementId: "G-FY7WTJFLNT",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { app, db };

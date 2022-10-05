const {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  child,
} = require("firebase/database");
const firebase = require("./firebase");

const db = getDatabase(firebase);
const dbRef = ref(db);

const getData = (index) => {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `${index}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        resolve(data);
      } else {
        reject("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
      reject(error)
    });
  })
};

const setData = (index, data) => {
  return new Promise((resolve, reject) => {
    set(ref(db, index), data)
      .then(() => {
        resolve({
          index,
          ...data,
        })
      })
      .catch(e => reject(e))
  })
}

module.exports = { getData, setData };

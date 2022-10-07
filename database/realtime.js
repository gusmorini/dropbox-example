const { ref, set, get, child, update } = require("firebase/database");

const { db } = require("./firebase");

const dbRef = ref(db);

const getData = (index) => {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `${index}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve([]);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
};

const setData = (index, data) => {
  return new Promise((resolve, reject) => {
    // set(ref(db, index), data)
    set(ref(db, index), data)
      .then(() => {
        resolve(data);
      })
      .catch((e) => reject(e));
  });
};

const updateData = (index, data) => {
  return new Promise((resolve, reject) => {
    update(ref(db, index), data)
      .then(() => {
        resolve(data);
      })
      .catch((e) => reject(e));
  });
};

const deleteData = (index) => {
  return new Promise((resolve, reject) => {
    set(ref(db, index), null)
      .then(() => {
        resolve({ index });
      })
      .catch((e) => reject(e));
  });
};

module.exports = { getData, setData, deleteData, updateData };

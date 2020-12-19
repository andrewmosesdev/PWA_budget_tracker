let db;
// assign db request
const request = window.indexedDB.open("budget", 1);

// create object store 
request.onupgradeneeded = (e) => {
  const db = e.target.result;
  const pending = db.createObjectStore("pending", {
    autoIncrement: true,
  });
};

// success
request.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

// handle error
request.onerror = (e) => console.log(err);

// creates new transaction and adds to pending (need to include readwrite access)
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const pending = transaction.objectStore("pending");
  pending.add(record);
}

// open transaction, access pending, and get records
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const pending = transaction.objectStore("pending");
  const getAll = pending.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        // if success, open transactions, access pending, and clear items from store
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const pending = transaction.objectStore("pending");
          pending.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);

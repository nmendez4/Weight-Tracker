const indexedDB = 
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("weight", 1);

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending", {
        keyPath: "id",
        autoIncrement: true
    });
};

request.onerror = (err) => {
    console.log(err.message);
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

//this function is called in index.js
//when user creates a change while offline
function saveRecord(record) {
    const change = db.change("pending", "readwrite");
    const store = change.objectStore("pending");
    store.add(record);
}

//called when user goes online to send changes stored in db to server
function checkDatabase() {
    const change = db.change("pending", "readonly");
    const store = change.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/change/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then((response) => response.json())
            .then(() => {
                const change = db.change("pending", "readwrite");
                const store = change.objectStore("pending");
                store.clear();
            });
        }
    };
}

//listen for app coming back online
window.addEventListener("online", checkDatabase);
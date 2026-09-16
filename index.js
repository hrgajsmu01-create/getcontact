const UripGetContact = require('urip-getcontact');

const getContact = new UripGetContact(
    "bezQlo44aa7aa10a94d7477ff23827e230497ed83e74317005a0cf0a81", 
    "ee1869a18df98108e4adf7f65613c1df672764cb9b950dd5acef2f366a07045a"
);

console.log("Menguji koneksi GetContact...");

getContact.checkNumber("081218111154")
    .then((data) => {
        console.log("HASIL BERHASIL:", JSON.stringify(data, null, 2));
    })
    .catch((err) => {
        console.log("TERJADI ERROR:", err);
    });
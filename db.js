/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if(process.env.NODE_ENV === "test") {
    DB_URI = "biztime_test";
} else {
    DB_URI = "biztime"
}

let db = new Client({
    host: "/var/run/postgresql",
    database: DB_URI
    // connectionString: DB_URI
});

db.connect();

// function getDatabaseURI() {
//     return(process.env.NODE_ENV === "test")
//     ? "biztime_test"
//     : process.env.DATABASE_URL || "postgres:///melissabutler:catbutts@127.0.0.1:5432/biztime";
// }

module.exports = db;
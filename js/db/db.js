import sqlite3 from 'sqlite3';
const fileName = (process.env.DB_FILE_NAME || 'storage') + '.db';
const db = new sqlite3.Database(fileName);

let called;
function cleanup() {
    if (!called) {
        called = true;
        console.log('Closing database...');
        db.close();
    }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

export default db;
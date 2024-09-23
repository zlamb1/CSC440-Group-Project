import sqlite3 from 'sqlite3';
const fileName = (process.env.DB_FILE_NAME || 'storage') + '.db';
const db = new sqlite3.Database(fileName);

let called;
function cleanup(evt) {
    if (!called) {
        called = true;
        // flush stdout buffer
        if (evt === 'SIGINT') console.log();
        console.log('Stopping database.');
        db.close();
    }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

export default db;
import sqlite3 from 'sqlite3';
const fileName = (process.env.DB_FILE_NAME || 'storage') + '.db';
const db = new sqlite3.Database(fileName);

export default db;
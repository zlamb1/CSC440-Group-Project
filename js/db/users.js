import bcrypt from "bcrypt";
import client from "./db.js";

export async function isUsernameAvailable(username) {
    const res = await client.query('SELECT * FROM users WHERE user_name = $1;', [username]);
    return res.rows.length === 0;
}

export async function doesUserExist(id) {
    const res = await client.query('SELECT id FROM users WHERE id = $1', [id]);
    return res.rows.length > 0;
}

export async function createUser(username, password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            if (err) reject(err);
            try {
                const res = await client.query('INSERT INTO users (user_name, password_hash) VALUES ($1, $2) RETURNING id;', [username, hash]);
                resolve(res.rows[0].id);
            } catch (err) {
                reject(err);
            }
        });
    });
}

export async function validateUser(username, password) {
    const res = await client.query('SELECT id, password_hash FROM users WHERE user_name = $1;', [username]);
    if (res.rows.length === 0) return false;
    return new Promise((resolve, reject) => bcrypt.compare(password, res.rows[0].password_hash, (err, matched) => {
       if (err) reject(err);
       return resolve({ validated: matched, userId: matched ? res.rows[0].id : null });
    }));
}

export async function getUser(id) {
    const res = await client.query('SELECT * FROM users WHERE id = $1;', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
}
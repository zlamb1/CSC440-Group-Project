import bcrypt from "bcrypt";
import client from "./db.js";

export async function isUsernameAvailable(username) {
    const res = await client.query('SELECT * FROM users WHERE user_name = $1', [username]);
    return res.rows.length === 0;
}

export async function createUser(username, password) {
    return new Promise((resolve, reject) => {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            if (err) reject(err);
            try {
                await client.query('INSERT INTO users (user_name, password_hash) VALUES ($1, $2);', [username, hash]);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
}
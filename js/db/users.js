import bcrypt from "bcrypt";
import client, {DBClient, DBError, throwDBError} from "./db.js";

DBClient.prototype.isUsernameAvailable = async function(username) {
    try {
        const res = await client.query('SELECT id FROM users WHERE user_name = $1;', [username]);
        return res.rows.length === 0;
    } catch (err) {
        console.error('Failed to check if username is available: ', err);
        throw new DBError();
    }
}

DBClient.prototype.createUser = async function(username, password) {
    const errors = {};
    if (typeof username === 'string') {
        if (username.length < 4) {
            errors.username = 'Username must be at least 4 characters.';
        } else if (username.length > 25) {
            errors.username = 'Username must be less than 25 characters.';
        } else {
            try {
                const res = await client.query('SELECT id FROM users WHERE user_name = $1;', [username]);
                if (res.rows.length !== 0) {
                    errors.username = 'That username is unavailable.';
                }
            } catch (err) {
                console.error('Failed to create user: ', err);
                throw new DBError();
            }
        }
    } else {
        errors.username = 'Username is required.';
    }
    if (typeof password === 'string') {
        if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        } else if (password.length > 50) {
            errors.password = 'Password must be less than 50 characters.';
        }
    } else {
        errors.password = 'Password is required.'
    }
    throwDBError(errors);
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        const res = await client.query('INSERT INTO users (user_name, password_hash) VALUES ($1, $2) RETURNING id;', [username, hash]);
        return res.rows[0].id;
    } catch (err) {
        console.error('Failed to create user: ', err);
        throw DBError();
    }
}

DBClient.prototype.authenticateUser = async function(username, password) {
    const errors = {};
    if (!username) {
        errors.username = "Username is required.";
    }
    if (!password) {
        errors.password = "Password is required.";
    }
    throwDBError(errors);
    try {
        const res = await client.query('SELECT id, password_hash FROM users WHERE user_name = $1;', [username]);
        if (res.rows.length === 0) {
            return { loggedIn: false }
        }
        const matched = await bcrypt.compare(password, res.rows[0].password_hash);
        return { loggedIn: matched, id: matched ? res.rows[0].id : undefined }
    } catch (err) {
        console.error('Failed to authenticate user: ', err);
        throw new DBError();
    }
}

export async function getUser(id) {
    const res = await client.query('SELECT * FROM users WHERE id = $1;', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
}

DBClient.prototype.getUser = getUser;
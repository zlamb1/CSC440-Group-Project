import bcrypt from "bcrypt";
import client, {DBClient, DBError, throwDBError} from "./db.js";

function formatUser(data) {
    return {
        id: data.id,
        userName: data.user_name,
        joinedAt: data.joined_at,
        avatarPath: data.avatar_path,
        role: data.role,
        privacyStatus: data.privacy_status,
        displayName: data.display_name,
        bio: data.bio,
    }
}

DBClient.prototype.isUsernameAvailable = async function(username) {
    try {
        const res = await client.query('SELECT id FROM users WHERE user_name = $1;', [username]);
        return res.rows.length === 0;
    } catch (err) {
        console.error('isUsernameAvailable: ', err);
        throw new DBError();
    }
}

DBClient.prototype.registerUser = async function(username, password) {
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
        const res = await client.query('CALL register_user($1, $2, $3);', [username, hash, null]);
        return res.rows[0]._id;
    } catch (err) {
        console.error('createUser: ', err);
        throw new DBError();
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
        console.error('authenticateUser: ', err);
        throw new DBError();
    }
}

export async function getUser(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('SELECT * FROM users WHERE id = $1;', [id]);
            if (res.rows.length === 0) {
                return reject(new DBError('User not found.'));
            }
            return resolve(formatUser(res.rows[0]));
        } catch (err) {
            console.error('getUser: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.getUser = getUser;

DBClient.prototype.getUserByUsername = async function(userName) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query(`SELECT * FROM users WHERE user_name = $1 AND (privacy_status = 'public' OR id = $2);`, [userName, this.user.id]);
            if (res.rows.length === 0) {
                return reject(new DBError('User not found.'));
            }
            return resolve(formatUser(res.rows[0]));
        } catch (err) {
            console.error('getUserByUsername: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.updateUser = async function(data) {
    await this.throwAuth();
    try {
        if (data.isUpdatingAvatar) {
            await client.query('UPDATE users SET avatar_path = $1 WHERE id = $2;', [data.avatar, this.user.id]);
        }
    } catch (err) {
        console.error('updateUser: ', err);
        throw new DBError();
    }
}
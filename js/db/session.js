import crypto from 'crypto';

import db from './db.js';

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS Session (' +
        'SessionID TEXT NOT NULL UNIQUE,' +
        'UserID INTEGER NOT NULL,' +
        'FOREIGN KEY (UserID) REFERENCES User(UserID))', (err) => {
        if (err) {
            console.error('failed to create Session table: ', err);
            process.exit(1);
        }
    });
});

function generateSessionID() {
    return crypto.randomBytes(32).toString('hex');
}

async function insertSession(userID, sessionID) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO Session (SessionID, UserID) VALUES (?, ?)', [1234, userID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(sessionID);
            }
        });
    });
}

export async function generateUserSession(userID) {
    return new Promise(async (resolve, reject) => {
        let attempt = 3;
        while (attempt >= 0) {
            const sessionID = generateSessionID();
            try {
                await insertSession(userID, sessionID);
                return resolve(sessionID);
            } catch (err) {
                if (attempt === 0) {
                    return reject(err);
                }
                if (err.errno !== 19 || !err?.message?.includes('UNIQUE constraint failed')) {
                    return reject(err);
                }
            }
            attempt--;
        }
    });
}

export async function getUserSessions(userID) {
    return new Promise(async (resolve, reject) => {
        db.all('SELECT * FROM Session WHERE UserID = ?', [userID], (err, rows) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(rows?.map(row => row.SessionID));
            }
        });
    });
}
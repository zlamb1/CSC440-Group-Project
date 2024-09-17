import db from './db.js';

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS User (' +
        'UserID INTEGER NOT NULL PRIMARY KEY,' +
        'DisplayName TEXT NOT NULL, ' +
        'Email TEXT NOT NULL, ' +
        'ProfileImage TEXT, ' +
        'ProfileBio TEXT, ' +
        'DateJoined TEXT)', (err) => {
        if (err) {
            console.error('failed to create User table: ', err);
            process.exit(1);
        }
    });
});
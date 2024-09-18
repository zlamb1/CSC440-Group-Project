import db from './db.js';

const RequestStatus = Object.freeze({
    Pending: 0,
    Rejected: 1,
    Accepted: 2,
});

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS Friend (' +
        'FriendID INTEGER NOT NULL PRIMARY KEY,' +
        'User1ID INTEGER NOT NULL,' +
        'User2ID INTEGER NOT NULL,' +
        'RequestStatus INTEGER NOT NULL,' +
        'FOREIGN KEY(User1ID) REFERENCES User(UserID),' +
        'FOREIGN KEY(User2ID) REFERENCES User(UserID))', (err) => {
        if (err) {
            console.error('failed to create Friend table: ', err);
            process.exit(1);
        }
    });
});

export function getFriendRequests(userID) {
    return db.all('SELECT * FROM Friend WHERE User1ID = ?', {
        $User1ID: userID,
    }, (err, rows) => {
        return rows;
    });
}
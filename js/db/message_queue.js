import db from "./db.js";

/**
 * A queue that serves users messages when they authenticate and connect with the server.
 *
 * Persistent - persists message even after delivery
 */

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS MessageQueue (' +
        'MessageID INTEGER NOT NULL PRIMARY KEY,' +
        'UserID INTEGER NOT NULL,' +
        'MessageType TEXT NOT NULL,' +
        'MessageJSON TEXT NOT NULL,' +
        'Persistent INTEGER NOT NULL,' +
        'FOREIGN KEY (UserID) REFERENCES User(UserID))', (err) => {
        if (err) {
            console.error('failed to create MessageQueue table: ', err);
            process.exit(1);
        }
    });
});

export function getUserMessages(userId) {

}
import db from './db.js';

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS Comment (' +
        'CommentID INTEGER NOT NULL PRIMARY KEY,' +
        'StoryID INTEGER NOT NULL,' +
        'UserID INTEGER NOT NULL,' +
        'CommentContent TEXT NOT NULL, ' +
        'DatePublished TEXT NOT NULL,' +
        'FOREIGN KEY (StoryID) REFERENCES Story(StoryID),' +
        'FOREIGN KEY (UserID) REFERENCES User(UserID))', (err) => {
        if (err) {
            console.error('failed to create Comment table: ', err);
            process.exit(1);
        }
    });
});
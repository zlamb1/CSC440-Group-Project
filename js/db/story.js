import db from './db.js';

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS Story (' +
        'StoryID INTEGER NOT NULL PRIMARY KEY,' +
        'PosterID INTEGER NOT NULL,' +
        'StoryTitle TEXT,' +
        'StoryContent TEXT NOT NULL,' +
        'DatePublished TEXT NOT NULL,' +
        'FOREIGN KEY (PosterID) REFERENCES User(UserID))', (err) => {
        if (err) {
            console.error('failed to create Story table: ', err);
            process.exit(1);
        }
    });
});
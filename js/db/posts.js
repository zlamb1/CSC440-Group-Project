import client, {DBClient, DBError} from "./db.js";
import sanitizeHtml from 'sanitize-html';

function sanitizeContent(content) {
    return sanitizeHtml(content, {
        allowedAttributes: {
            code: [ 'class' ]
        },
        allowedClasses: {
            'code': [ 'language-*', 'lang-*' ]
        },
        allowedTags: [ 'pre', 'code', 'p' ],
    });
}

function formatPost(rowOrFn) {
    if (typeof rowOrFn === 'function') {
        return (row) => {
            return rowOrFn(row, {
                id: row.id,
                poster: row.poster_id,
                postedAt: row.posted_at,
                content: row.content
            });
        }
    }
    return {
        id: rowOrFn.id,
        poster: rowOrFn.poster_id,
        postedAt: rowOrFn.posted_at,
        content: rowOrFn.content
    }
}

DBClient.prototype.createPost = async function(userId, content) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('SELECT id FROM users WHERE id = $1', [ userId ]);
            if (res.rows.length === 0) {
                return reject(new DBError(`Invalid user id '${userId}'`));
            }
            await client.query('INSERT INTO posts (poster_id, content) VALUES ($1, $2);', [userId, sanitizeContent(content)]);
            return resolve();
        } catch (err) {
            console.error('createPost: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.getPost = async function(postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('SELECT * FROM posts WHERE id = $1;', [postId]);
            if (res.rows.length === 0) {
                return reject(new DBError('Post not found.'));
            }
            return resolve(formatPost(res.rows[0]));
        } catch (err) {
            console.error('getPost: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.getPublicPosts = async function() {
    try {
        const res = await client.query('SELECT posts.id, posts.poster_id, posts.posted_at, posts.content, users.user_name ' +
            `FROM posts INNER JOIN users ON posts.poster_id = users.id AND users.privacy_status = 'public';`);
        return res.rows.map(formatPost((row, data) => ({ ...data, userName: row.user_name })))
    } catch (err) {
        console.error('getPublicPosts: ', err);
        throw new DBError();
    }
}

DBClient.prototype.editPost = async function(userId, postId, content) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('UPDATE posts SET content = $1, last_edited = now() WHERE id = $2 AND poster_id = $3 RETURNING id;',
                [ sanitizeContent(content), postId, userId ]);
            if (res.rows.length === 0) {
                return reject(new DBError('Post not found.'));
            }
            return resolve();
        } catch (err) {
            console.error('editPost: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.deletePost = async function deletePost(userId, postId) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('DELETE FROM posts WHERE posts.id = $1 AND posts.poster_id = $2 RETURNING id;', [postId, userId]);
            if (res.rows.length === 0) {
                return reject(new DBError('Post not found.'));
            }
            return resolve();
        } catch (err) {
            console.error('deletePost: ', err);
            return reject(new DBError());
        }
    });
}
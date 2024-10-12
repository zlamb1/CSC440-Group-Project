import client, {DBClient, DBError} from "./db.js";
import sanitizeHtml from 'sanitize-html';

function sanitizeContent(content) {
    return sanitizeHtml(content, {
        allowedAttributes: {
            code: [ 'class' ],
            span: [ 'class' ],
        },
        allowedClasses: {
            'code': [ 'language-*', 'lang-*' ],
            'span': [ 'hljs-*' ],
        },
        allowedTags: [ 'pre', 'code', 'p', 'span' ],
    });
}

function ensureContentLength(content) {
    const maxContentLength = 1200;
    const maxTextLength = 300;
    if (content.length === 0) {
        return 'Post content is required';
    } else if (content.length > maxContentLength) {
        return `Post content and nodes must be less than ${maxContentLength} characters.`;
    }
    const textContent = sanitizeHtml(content, {
        allowedAttributes: {},
        allowedTags: []
    });
    if (textContent.length === 0) {
        return 'Post content is required.';
    } else if (textContent.length > maxTextLength) {
        return `Post content must be less than ${maxTextLength} characters`;
    }
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
    if (!content || typeof content !== 'string' || content.length === 0) {
        throw new DBError('Post content is required.');
    }
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('SELECT id FROM users WHERE id = $1', [ userId ]);
            if (res.rows.length === 0) {
                return reject(new DBError(`Invalid user id '${userId}'`));
            }
            const sanitizedContent = sanitizeContent(content);
            let err;
            if ((err = ensureContentLength(sanitizedContent))) {
                return reject(new DBError(err));
            }
            console.log('content', content);
            console.log('sanitized', sanitizedContent);
            await client.query('INSERT INTO posts (poster_id, content) VALUES ($1, $2);', [userId, sanitizedContent]);
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
            const sanitizedContent = sanitizeContent(content);
            let err;
            if ((err = ensureContentLength(sanitizedContent))) {
                return reject(new DBError(err));
            }
            const res = await client.query('UPDATE posts SET content = $1, last_edited = now() WHERE id = $2 AND poster_id = $3 RETURNING id;',
                [ sanitizedContent, postId, userId ]);
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
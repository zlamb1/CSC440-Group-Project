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

DBClient.prototype.createPost = async function(userId, content) {
    const res = await client.query('SELECT id FROM users WHERE id = $1', [ userId ]);
    if (res.rows.length === 0) {
        throw new DBError(`Invalid user id '${userId}'`);
    }
    await client.query('INSERT INTO posts (poster_id, content) VALUES ($1, $2);', [userId, sanitizeContent(content)]);
}

DBClient.prototype.getPost = async function(postId) {
    const res = await client.query('SELECT * FROM posts WHERE id = $1;', [postId]);
    if (res.rows.length === 0) {
        throw new DBError('Post not found.');
    }
    return res.rows[0];
}

DBClient.prototype.getPublicPosts = async function() {
    const res = await client.query('SELECT posts.id, posts.poster_id, posts.posted_at, posts.content, users.user_name ' +
        `FROM posts INNER JOIN users ON posts.poster_id = users.id AND users.privacy_status = 'public';`);
    return res.rows;
}

DBClient.prototype.editPost = async function(userId, postId, content) {
    const res = await client.query('UPDATE posts SET content = $1, last_edited = now() WHERE id = $2 AND poster_id = $3 RETURNING id;',
        [ sanitizeContent(content), postId, userId ]);
    if (res.rows.length === 0) {
        throw new DBError('Post not found.');
    }
}

DBClient.prototype.deletePost = async function deletePost(userId, postId) {
    const res = await client.query('DELETE FROM posts WHERE posts.id = $1 AND posts.poster_id = $2 RETURNING id;', [postId, userId]);
    if (res.rows.length === 0) {
        throw new DBError('Post not found.');
    }
}
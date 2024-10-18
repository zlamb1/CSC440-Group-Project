import client, {DBClient, DBError, validateUUID} from "./db.js";
import sanitizeHtml from 'sanitize-html';
import highlight from "highlight.js";
import jsdom from "jsdom";

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

function processCodeBlocks(htmlContent) {
    /*const dom = new jsdom.JSDOM(htmlContent);
    dom.window.document.querySelectorAll('pre code').forEach((el) => {
        // @ts-ignore
        highlight.highlightElement(el);
        if (el?.dataset?.highlighted) {
            delete el.dataset.highlighted;
        }
    });
    return dom.window.document.body.innerHTML;*/
    return htmlContent;
}

function formatPost(rowOrFn) {
    if (typeof rowOrFn === 'function') {
        return (row) => {
            return rowOrFn(row, {
                id: row.id,
                posterId: row.poster_id,
                postedAt: row.posted_at,
                lastEdited: row.last_edited,
                content: processCodeBlocks(row.content),
                replyTo: row.reply_to,
                likeCount: row.like_count,
                tags: row.tags,
                replyCount: row.reply_count,
            });
        }
    }
    return {
        id: rowOrFn.id,
        posterId: rowOrFn.poster_id,
        postedAt: rowOrFn.posted_at,
        lastEdited: rowOrFn.last_edited,
        content: processCodeBlocks(rowOrFn.content),
        replyTo: rowOrFn.reply_to,
        likeCount: rowOrFn.like_count,
        tags: rowOrFn.tags,
        replyCount: rowOrFn.reply_count,
    }
}

DBClient.prototype.createPost = async function(content) {
    if (!content || typeof content !== 'string' || content.length === 0) {
        throw new DBError('Post content is required.');
    }
    await this.throwAuth();
    return new Promise(async (resolve, reject) => {
        try {
            const sanitizedContent = sanitizeContent(content);
            let err;
            if ((err = ensureContentLength(sanitizedContent))) {
                return reject(new DBError(err));
            }
            await client.query('INSERT INTO posts (poster_id, content) VALUES ($1, $2);', [this.user.id, sanitizedContent]);
            return resolve();
        } catch (err) {
            console.error('createPost: ', err);
            return new DBError();
        }
    });
}

DBClient.prototype.createReply = async function(replyTo, content) {
    if (!validateUUID(replyTo)) {
        throw new DBError('Post ID is invalid.');
    }
    if (!content || typeof content !== 'string' || content.length === 0) {
        throw new DBError('Post content is required.');
    }
    await this.throwAuth();
    return new Promise(async (resolve, reject) => {
        try {
            const sanitizedContent = sanitizeContent(content);
            let err;
            if ((err = ensureContentLength(sanitizedContent))) {
                return reject(new DBError(err));
            }
            const res = await client.query('SELECT users.privacy_status FROM posts INNER JOIN users ON posts.id = $1 AND posts.poster_id = users.id', [replyTo]);
            if (res.rows?.length === 0 || res.rows[0].privacy_status !== 'public') {
                return reject(new DBError('Post not found.'));
            }
            await client.query('INSERT INTO posts (poster_id, content, reply_to) VALUES ($1, $2, $3);', [this.user.id, sanitizedContent, replyTo]);
            await client.query('UPDATE posts SET reply_count = reply_count + 1 WHERE id = $1;', [replyTo]);
            return resolve();
        } catch (err) {
            console.error('createReply: ', err);
            return reject(new DBError());
        }
    });
}

DBClient.prototype.getPost = async function(id) {
    if (!validateUUID(id)) {
        throw new DBError("Invalid post ID.");
    }
    return new Promise(async (resolve, reject) => {
        try {
            const res = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
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

DBClient.prototype.getReplies = async function(id) {
    if (!validateUUID(id)) {
        throw new DBError("Invalid post id.");
    }
    try {
        const res = await client.query(
            'SELECT posts.*, users.user_name, users.avatar_path FROM posts ' +
            'INNER JOIN users ON posts.reply_to = $1 AND users.id = posts.poster_id ORDER BY posts.posted_at DESC;',
            [id]
        );
        return res.rows.map(formatPost((row, data) => ({ ...data, userName: row?.user_name, avatar: row?.avatar_path })));
    } catch (err) {
        console.error('getPostWithReplies: ' , err);
        throw new DBError();
    }
}

DBClient.prototype.getPublicPosts = async function() {
    try {
        const res = await client.query(
            'SELECT posts.*, users.user_name, users.avatar_path, post_likes.liked FROM posts ' +
            `INNER JOIN users ON posts.poster_id = users.id AND users.privacy_status = 'public' ` +
            'LEFT JOIN post_likes ON post_likes.post_id = posts.id AND post_likes.user_id = $1 ' +
            'WHERE posts.reply_to IS NULL ORDER BY posts.posted_at DESC;',
            [ this.user?.id ]
        );
        return res.rows.map(formatPost((row, data) => ({ ...data, liked: row?.liked, userName: row?.user_name, avatarPath: row?.avatar_path })))
    } catch (err) {
        console.error('getPublicPosts: ', err);
        throw new DBError();
    }
}

DBClient.prototype.editPost = async function(id, content) {
    if (!content || typeof content !== 'string' || content.length === 0) {
        throw new DBError('Post content is required.');
    }
    if (!(await this.checkAuth())) {
        throw new DBError({ error: 'Unauthorized' });
    }
    return new Promise(async (resolve, reject) => {
        try {
            const sanitizedContent = sanitizeContent(content);
            let err;
            if ((err = ensureContentLength(sanitizedContent))) {
                return reject(new DBError(err));
            }
            const res = await client.query('UPDATE posts SET content = $1 WHERE id = $2 AND poster_id = $3 RETURNING id;',
                [ sanitizedContent, id, this.user.id ]);
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
    if (!(await this.checkAuth())) {
        throw new DBError({ error: 'Unauthorized' });
    }
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
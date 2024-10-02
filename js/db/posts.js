import client from "./db.js";
import {doesUserExist} from "./users.js";

export async function createPost(user, content) {
    if (!(await doesUserExist(user.id))) {
        throw new Error('unknown user: ' + user.id);
    }
    await client.query('INSERT INTO posts (poster_id, content) VALUES ($1, $2);', [user.id, content]);
}

export async function getPost(id) {
    const res = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
}

export async function getPosts() {
    const res = await client.query('SELECT posts.id, posts.poster_id, posts.posted_at, posts.content, users.user_name FROM posts INNER JOIN users ON posts.poster_id = users.id;');
    return res.rows;
}

export async function deletePost(id) {
    await client.query('DELETE FROM posts WHERE posts.id = $1', [id]);
}
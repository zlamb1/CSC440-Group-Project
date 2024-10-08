import client from './db.js';

export async function createData(data, expires) {
    const res = await client.query('INSERT INTO sessions (expires, data, user_id) VALUES ($1, $2, $3) RETURNING id;', [expires, data, data.userId]);
    return res.rows[0].id;
}

export async function readData(id) {
    const res = await client.query('SELECT data FROM sessions WHERE id = $1;', [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0].data;
}

export async function updateData(id, data, expires) {
    await client.query('UPDATE sessions SET expires = $1, data = $2 WHERE id = $3;', [expires, data, id]);
}

export async function deleteData(id) {
    await client.query('DELETE FROM sessions WHERE id = $1;', [id]);
}
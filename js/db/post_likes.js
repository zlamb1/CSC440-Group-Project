import client, {DBClient, DBError, validateUUID} from "./db.js";

DBClient.prototype.createPostLike = async function(id, liked) {
    if (typeof liked !== "boolean") {
        throw new DBError('Invalid parameter \'liked\': expected boolean');
    }
    if (!(await this.checkAuth())) {
        throw new DBError({ error: 'Unauthorized' });
    }
    try {
        const res = await client.query('SELECT post_id FROM post_likes WHERE post_id = $1 and user_id = $2;', [id, this.user.id]);
        if (res.rows.length === 0) {
            await client.query(
                'INSERT INTO post_likes (post_id, user_id, liked) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING;', [id, this.user.id, liked]
            );
        } else {
            await client.query('UPDATE post_likes SET liked = $1 WHERE post_id = $2 AND user_id = $3;', [liked, id, this.user.id]);
        }
    } catch (err) {
        console.error('createPostLike: ', err);
        throw new DBError();
    }
}

DBClient.prototype.deletePostLike = async function(id) {
    if (!validateUUID(id)) {
        throw new DBError('Invalid post id.');
    }
    if (!(await this.checkAuth())) {
        throw new DBError('Unauthorized.');
    }
    try {
        await client.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2;', [id, this.user.id]);
    } catch (err) {
        console.error('deletePostLike: ', err);
        throw new DBError();
    }
}
import client, {DBClient, DBError, validateUUID} from "./db.js";

DBClient.prototype.createPostLike = async function(id, liked) {
    if (typeof liked !== "boolean") {
        throw new DBError('Invalid parameter \'liked\': expected boolean');
    }
    if (!(await this.checkAuth())) {
        throw new DBError({ error: 'Unauthorized' });
    }
    try {
        await client.query('CALL insert_post_like($1, $2, $3);', [id, this.user.id, liked]);
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
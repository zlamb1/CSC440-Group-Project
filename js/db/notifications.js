import client, {DBClient, DBError} from "./db.js";

DBClient.prototype.getNotifications = async function() {
    await this.throwAuth();
    try {
        const res = await client.query("SELECT * FROM notifications WHERE user_id = $1;", [this.user.id]);
        return res.rows;
    } catch (err) {
        console.error('getNotifications: ', err);
        throw new DBError();
    }
}
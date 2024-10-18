import client, {DBClient, DBError, validateUUID} from "./db.js";

function formatNotification(row) {
    return {
        dateIssued: row.dateIssued,
        type: row.type,
        content: row.content,
        expiration: row.expiration,
    }
}

DBClient.prototype.getNotificationCount = async function() {
    await this.throwAuth();
    try {
        const res = await client.query("SELECT user_id FROM notifications WHERE user_id = $1;", [this.user.id]);
        return res.rows.length;
    } catch (err) {
        console.error('getNotificationCount: ', err);
        throw new DBError();
    }
}

DBClient.prototype.getNotifications = async function() {
    await this.throwAuth();
    try {
        const res = await client.query("SELECT * FROM notifications WHERE user_id = $1;", [this.user.id]);
        return res.rows.map(formatNotification);
    } catch (err) {
        console.error('getNotifications: ', err);
        throw new DBError();
    }
}
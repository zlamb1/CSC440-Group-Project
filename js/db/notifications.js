import client, {DBClient, DBError} from "./db.js";

function formatNotification(row) {
    return {
        id: row.id,
        dateIssued: row.date_issued,
        type: row.type,
        content: row.content,
        expiresOn: row.expires_on,
        viewed: row.viewed,
    }
}

DBClient.prototype.getNotificationCount = async function() {
    await this.throwAuth();
    try {
        const res = await client.query("SELECT user_id FROM notifications WHERE user_id = $1 AND viewed = false;", [this.user.id]);
        return res.rows.length;
    } catch (err) {
        console.error('getNotificationCount: ', err);
        throw new DBError();
    }
}

DBClient.prototype.getNotifications = async function() {
    await this.throwAuth();
    try {
        const res = await client.query('SELECT * FROM notifications WHERE user_id = $1;', [this.user.id]);
        if (res.rows && res.rows.length > 0) {
            for (const row of res.rows) {
                if (row.id && !row.viewed) {
                    try {
                        client.query('UPDATE notifications SET viewed = true WHERE id = $1', [row.id]);
                    } catch (err) {
                        console.error('getNotifications', err);
                    }
                }
            }
        }
        return res.rows.map(formatNotification);
    } catch (err) {
        console.error('getNotifications: ', err);
        throw new DBError();
    }
}
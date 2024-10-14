// @ts-ignore
import pg from 'pg';

const connectionString = process.env.DB_CONNECTION_STRING;

const client = new pg.Client({ connectionString });

client.connect((err) => {
    if (err) {
        console.log('Failed to connect to PostgreSQL database: ', err);
    } else {
        console.log('Connected to PostgreSQL database.');
    }
});

client.on('end', () => {
    console.log('Disconnected from PostgreSQL database.');
    // TODO: handle disconnects
});

export class DBClient {
    constructor(user, session) {
        this.user = user;
        this.session = session;
    }

    async checkAuth(checkSession) {
        if (!this.session || !this.session.id) {
            return false;
        }
        if (checkSession === undefined || checkSession) {
            try {
                const res = await client.query('SELECT id FROM sessions WHERE id = $1', [this.session.id]);
                return res.rows.length > 0;
            } catch (err) {
                console.error(err);
                return false;
            }
        }
        return true;
    }
}

export class DBError extends Error {
    static defaultError() {
        return { error: 'Unknown error.' }
    }
    constructor(data) {
        super();
        this.name = 'DBError';
        if (data == null) {
            this.data = DBError.defaultError();
        } else if (typeof data === 'string') {
            this.data = { error: data };
        } else {
            this.data = data;
        }
    }
}

export function throwDBError(errors) {
    if (Object.keys(errors).length > 0) {
        throw new DBError(errors);
    }
}

export function validateUUID(uuid) {
    if (typeof uuid !== 'string' || !uuid.length || uuid.length < 32 || uuid.length > 42) {
        return false;
    }
    return uuid.match(/^{?([0-9a-fA-F]{4}-?){8}}?$/)?.length > 0;
}

export default client;
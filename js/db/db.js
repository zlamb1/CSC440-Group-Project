import pg from 'pg';

const connectionString = process.env.DB_CONNECTION_STRING;

const client = new pg.Client({ connectionString });

client.connect(err => {
    if (err) {
        console.log('err', err);
    } else {
        console.log('connected');
    }
});

client.on('end', () => {
    // TODO: handle disconnects
});

export default client;
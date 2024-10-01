import pg from 'pg';

const connectionString = process.env.DB_CONNECTION_STRING;

const client = new pg.Client({ connectionString });

client.connect(err => {
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

export default client;
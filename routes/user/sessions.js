import {getUserSessions} from "../../js/db/session.js";

export default function(req, res) {
    // TODO: add cookie-based user sessions
    const userID = 'placeholder';
    getUserSessions(userID).then(sessions => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(sessions));
    }).catch(err => {
        console.log(err);
        res.writeHead(500);
        res.end();
    });
}
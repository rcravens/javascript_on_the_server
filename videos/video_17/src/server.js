import http from "http";
import {sessionManager} from "./SessionManager.js";

const server = http.createServer(async (req, res) => {
    sessionManager.attach(req, res);

    console.log('url', req.url);

    // 1. Set a session variable
    // req.session['user_id'] = 123

    // 2. Delete a session variable
    // delete req.session['user_id'];

    const user_id = req.session['user_id'] ?? '-- not found --';
    console.log('user_id', user_id);

    // 3. Set flash variable
    // req.flash.set('msg', 'Hello');

    // 4. Read flash variable
    const msg = req.flash.get('msg') ?? '-- not found --';
    console.log('msg', msg);

    // Respond to request
    const data = {};
    data.sessions = sessionManager.sessions;
    data.session = req.session;
    data.user_id = user_id;
    data.msg = msg;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
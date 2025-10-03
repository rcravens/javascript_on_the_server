const http = require("http"); // CommonJS

function remove_circular_references(obj, seen = new WeakSet()) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (seen.has(obj)) {
        return '[Circular]'; // Or a more specific identifier like obj.id
    }

    seen.add(obj);

    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = remove_circular_references(obj[key], seen);
        }
    }
    return newObj;
}

const server = http.createServer((req, res) => {

    const data = {};

    data.req = {};
    data.req.url = req.url;
    data.req.method = req.method;
    data.req.headers = req.headers;
    data.req.user_agent = req.headers['user-agent'];
    data.req.obj = remove_circular_references(req);

    data.res = {};
    data.res.obj = remove_circular_references(res);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
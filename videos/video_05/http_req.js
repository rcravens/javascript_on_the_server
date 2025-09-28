const http = require("http"); // CommonJS

const server = http.createServer((req, res) => {

    console.log(req.url);
    console.log(req.method);
    console.log(req.headers);
    console.log(req.headers['user-agent']);

    const cache = new Set();
    const serialized_req = JSON.stringify(req, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.add(value);
        }
        return value;
    }, 2); // The '2' is for pretty-printing with 2 spaces indentation

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(serialized_req);
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
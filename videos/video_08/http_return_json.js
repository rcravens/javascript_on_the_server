const http = require("http");

const server = http.createServer((req, res) => {
    if (req.url === "/api") {
        res.setHeader("Content-Type", "application/json");
        const data = { message: "Hello from API", timestamp: Date.now() };
        res.end(JSON.stringify(data));
    } else {
        res.statusCode = 404;
        res.end("Not Found");
    }
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
const http = require("http");

const server = http.createServer((req, res) => {
    if(req.url === '/api'){
        if (req.method === "POST") {
            let body = "";
            req.on("data", chunk => {
                body += chunk;
            });
            req.on("end", () => {
                const parsed = JSON.parse(body);
                console.log("Received data:", parsed);
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ status: "ok", received: parsed }));
            });
        } else {
            res.setHeader("Content-Type", "application/json");
            const data = {message: "Hello from API", timestamp: Date.now()};
            res.end(JSON.stringify(data));
        }
    } else {
        res.statusCode = 404;
        res.end("Not Found");
    }
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
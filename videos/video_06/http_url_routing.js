const http = require("http");

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/plain");

    switch (req.url) {
        case "/":
            res.end("Welcome to the homepage!");
            break;
        case "/about":
            res.end("This is the about page.");
            break;
        case "/contact":
            res.end("Contact us at contact@example.com");
            break;
        default:
            res.statusCode = 404;
            res.end("Page not found");
    }
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
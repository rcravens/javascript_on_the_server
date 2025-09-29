import http from "http";
import ejs from "ejs";
import Person from "./Person.js";

const server = http.createServer(async (req, res) => {
    if (req.url === "/people") {
        const people = await Person.all();

        try {
            const html = await ejs.renderFile("views/people.ejs", {people});
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(html);
        } catch (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            res.end("Error rendering template");
            console.error("EJS render error:", err);
        }
    } else if(req.url === "/people2") {
        const people = await Person.all();

        // Render page content
        const content = await ejs.renderFile("views/people2.ejs", { people });

        // Render layout with content injected as `body`
        const html = await ejs.renderFile("views/layouts/layout.ejs", { body: content });

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/people`);
});
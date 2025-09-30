import http from "http";
import {URL} from "url";
import Router from "./Router.js";
import registerRoutes from "../routes.js";
import {sessionManager} from "./SessionManager.js";

const router = new Router();

// Register all routes
registerRoutes(router);

const server = http.createServer(async (req, res) => {
    sessionManager.attach(req, res);
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    // Handle _method override
    const method =
        req.method === "POST" && url.searchParams.get("_method")
            ? url.searchParams.get("_method").toUpperCase()
            : req.method;

    try {
        await router.handle(req, res, method, parts);
    } catch (err) {
        console.error("Error handling request:", err);
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.end("Internal Server Error");
    }
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/users");
});
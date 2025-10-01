import http from "http";
import {URL} from "url";
import Router from "./Router.js";
import registerRoutes from "../routes.js";
import {sessionManager} from "./SessionManager.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

const router = new Router();

// Register all routes
registerRoutes(router);

const server = http.createServer(async (req, res) => {
    sessionManager.attach(req, res);

    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split("/").filter(Boolean);

    // --- Special crash route ---
    if (url.pathname === "/crash") {
        console.log("Crashing the server intentionally...");
        // This will crash the Node process
        process.nextTick(() => {
            throw new Error("Intentional crash for PM2 testing");
        });
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.end("Server is crashing...");
        return;
    }

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

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/users`);
});
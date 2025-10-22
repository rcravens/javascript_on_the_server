import http from "http";
import {URL} from "url";
import Router from "./Router.js";
import registerRoutes from "../routes.js";
import {sessionManager} from "./SessionManager.js";
import {logger} from "./helpers/Logger.js"
import dotenv from "dotenv";

logger.info("Application starting....");

dotenv.config();
const PORT = process.env.PORT || 3000;
logger.info(`PORT: ${PORT}`);


// Register all routes
const router = new Router('public');
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

    // --- Special crash route ---
    if (url.pathname === "/crash") {
        logger.info("Crashing the server intentionally...");
        // This will crash the Node process
        process.nextTick(() => {
            throw new Error("Intentional crash for PM2 testing");
        });
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.end("Server is crashing...");
        return;
    }

    try {
        await router.handle(req, res, method, parts);
    } catch (err) {
        logger.error("Error handling request", err);
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.end("Internal Server Error");
    }
});

server.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}/users`)
});

process.on('uncaughtException', (err, origin) => {
    logger.error('Uncaught Exceptions:', err, 'Origin:', origin);
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'Reason:', reason);
})

setTimeout(() => {
    throw new Error('Unexpected Error!');
}, 2000);
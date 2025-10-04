import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const PORT = 8000;

const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    js: "text/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpeg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
};

const STATIC_PATH = path.join(process.cwd(), "./static");

// url examples: '/', '/profile.html', '/about.html'
const prepareFile = async (url) => {
    // convert url to path
    const paths = [STATIC_PATH, url];
    if (url.endsWith("/")) paths.push("index.html");
    const filePath = path.join(...paths);
    // guard against paths that attempt to serve content outside of STATIC_PATH
    const pathTraversal = !filePath.startsWith(STATIC_PATH);
    // guard against files that do not exist
    const exists = await fs.promises.access(filePath).then(() => true, () => false);
    const found = !pathTraversal && exists;
    const streamPath = found ? filePath : `${STATIC_PATH}/404.html`;
    const ext = path.extname(streamPath).substring(1).toLowerCase();
    const stream = fs.createReadStream(streamPath);
    return {found, ext, stream};
};

http
    .createServer(async (req, res) => {
        const file = await prepareFile(req.url);
        const statusCode = file.found ? 200 : 404;
        const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
        res.writeHead(statusCode, {"Content-Type": mimeType});
        file.stream.pipe(res);
        console.log(`${req.method} ${req.url} ${statusCode}`);
    })
    .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
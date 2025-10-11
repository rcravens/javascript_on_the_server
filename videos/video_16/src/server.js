import http from "http";

const server = http.createServer(async (req, res) => {

    // Reading Cookie Data
    console.log(req.headers.cookie);
    const cookies = parseCookies(req);
    console.log(cookies);

    // Set cookie data from the server
    res.setHeader("Set-Cookie", [
            `COOKIE1=Chocolate Chip; HttpOnly; Path=/`,                 // set cookie
            `COOKIE2=Oatmeal Raisin; HttpOnly; Path=/; Max-Age=30`,     // set another cookie (30s)
            `SID=123; HttpOnly; Path=/; Max-Age=3600`                   // set cookie (60m)
        ]
    );

    // Clear cookie data from the server
    // res.setHeader("Set-Cookie", [
    //         `SID=; HttpOnly; Path=/; Max-Age=0`                         // clear a cookie
    //     ]
    // );

    // Respond to request
    const data = {};
    data.req_cookie_text = req.headers.cookie;
    data.req_cookies = cookies;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});

function parseCookies(req) {
    const list = {};
    const cookieHeader = req.headers.cookie || "";
    cookieHeader.split(";").forEach(cookie => {
        const parts = cookie.split("=");
        if (parts.length === 2) list[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    });
    return list;
}
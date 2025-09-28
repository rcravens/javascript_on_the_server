const http = require("http");
const { parse } = require("querystring");

const PORT = 3000;

const formHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Contact Form</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Contact Us</h1>
    <form method="POST" action="/" class="space-y-4">
      <div>
        <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
        <input type="email" name="email" id="email" required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"/>
      </div>
      <div>
        <label for="message" class="block text-gray-700 text-sm font-bold mb-2">Message</label>
        <textarea name="message" id="message" rows="4" required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"></textarea>
      </div>
      <button type="submit"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300">
        Send
      </button>
    </form>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const parsedData = parse(body);
            console.log("Received Contact Form Data:", parsedData);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(`<p class="text-center">Thank you for your message!</p><a href="/">Go back</a>`);
        });
    } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(formHTML);
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
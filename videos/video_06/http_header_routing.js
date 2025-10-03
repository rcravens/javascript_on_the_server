const http = require('http');

// Static person object
const person = {
    first: "Jane",
    last: "Doe",
    email: "jane.doe@example.com"
};

const port = 3000;

const server = http.createServer((req, res) => {
    const acceptHeader = req.headers['accept'];

    if (acceptHeader && acceptHeader.includes('application/json')) {
        // JSON formated response....
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(person, null, 2));
    } else {
        // HTML formated response....
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Person Info</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm text-center">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Person Information</h1>
          <p class="text-gray-700"><span class="font-semibold">First:</span> ${person.first}</p>
          <p class="text-gray-700"><span class="font-semibold">Last:</span> ${person.last}</p>
          <p class="text-gray-700"><span class="font-semibold">Email:</span> ${person.email}</p>
        </div>
      </body>
      </html>
    `);
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
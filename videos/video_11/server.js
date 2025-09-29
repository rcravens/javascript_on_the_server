import http from "http";
import Person from "./Person.js";

// Build HTML table with string concatenation
function render_page(people) {
    let table = `
    <html lang="en">
      <head>
        <title>People</title>
        <style>
          table { border-collapse: collapse; width: 50%; margin: 20px auto; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1 style="text-align:center;">People</h1>
        <table>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
  `;

    for (const person of people) {
        table += `
          <tr>
            <td>${person.first_name}</td>
            <td>${person.last_name}</td>
            <td>${person.email}</td>
          </tr>
    `;
    }

    table += `
        </table>
      </body>
    </html>
  `;

    return table;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    if (req.url === "/people") {
        const people = await Person.all();
        const html = render_page(people);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/people`);
});
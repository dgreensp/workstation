const fs = require('fs');
const http = require('http');
const url = require('url');

const PORT = 10000;

http.createServer(function (request, response) {
  const urlPath = url.parse(request.url).pathname;
  const httpMethod = request.method;
  console.log(httpMethod + ": " + urlPath);

  response.setHeader('Access-Control-Allow-Origin', '*');

  if (httpMethod === 'GET') {
    try {
      if (!urlPath.startsWith('/workstation')) {
        throw new Error('not a /workstation path');
      }
      // this is not secure; TODO use a real webserver
      let filePath = 'docs' + urlPath.slice('/workstation').length;
      if (urlPath.slice(-1) === '/') {
        filePath += 'index.html';
      }
      if (filePath.endsWith('.css')) {
        response.setHeader('Content-Type', 'text/css');
      }
      const content = fs.readFileSync(filePath);
      response.writeHead(200);
      response.end(content);
    }
    catch (error) {
      console.log('file not found:', urlPath, error.stack);
      response.writeHead(404);
      response.end();
    }
    return;
  }

  response.writeHead(400);
  response.end();
}).listen(PORT);

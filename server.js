const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Parse URL
  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('잘못된 요청입니다 (Bad Request)');
    return;
  }

  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path and prevent directory traversal
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Security check: ensure filePath is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('접근 거부 (Forbidden)');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="ko">
          <head>
            <meta charset="utf-8">
            <title>404 - 페이지를 찾을 수 없습니다</title>
            <style>
              body { font-family: sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .box { text-align: center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
              a { color: #6366f1; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>404 Not Found</h1>
              <p>요청하신 파일 <code>${pathname}</code>을 찾을 수 없습니다.</p>
              <p><a href="/">메인 페이지로 돌아가기</a></p>
            </div>
          </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`서버 오류: ${err.code}`);
      }
      return;
    }

    if (stats.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      fs.access(indexFile, fs.constants.R_OK, (indexErr) => {
        if (!indexErr) {
          serveFile(indexFile, res);
        } else {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('디렉토리 목록 조회가 비활성화되어 있습니다.');
        }
      });
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  stream.pipe(res);
  stream.on('error', (streamErr) => {
    console.error('Stream error:', streamErr);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('파일 전송 중 오류 발생');
    }
  });
}

function startServer(port) {
  server.listen(port, () => {
    console.log('\n======================================================');
    console.log('🚀 [My First Site] 로컬 개발 서버가 실행되었습니다!');
    console.log(`🌐 로컬 접속 주소: http://localhost:${port}`);
    console.log(`📂 서빙 디렉토리: ${ROOT_DIR}`);
    console.log('💡 서버를 종료하려면 터미널에서 Ctrl + C 를 누르세요.');
    console.log('======================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ 포트 ${port}번이 이미 사용 중입니다. 다음 포트 ${port + 1}번으로 시도합니다...`);
      startServer(port + 1);
    } else {
      console.error('서버 오류 발생:', err);
    }
  });
}

startServer(DEFAULT_PORT);

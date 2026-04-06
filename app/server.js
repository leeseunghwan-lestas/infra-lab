const http = require('http');
const os = require('os');
const Sentry = require('@sentry/node');
const { createClient } = require('redis');

Sentry.init({
  dsn: 'https://d60ea3bcf663365f4dac66f4af03fde9@o4511138140258304.ingest.us.sentry.io/4511138146811904',
  environment: process.env.APP_ENV || 'development',
});

const redisClient = createClient();
redisClient.connect();

const server = http.createServer(async (req, res) => {
  if (req.url === '/error') {
    throw new Error('테스트 에러입니다! Sentry 가 잡아줄 거예요.');
  }

  if (req.url === '/data') {
    const cacheKey = 'heavy-data';

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ source: 'Redis 캐시', data: cached }));
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = '무거운 DB 조회 결과';

    await redisClient.set(cacheKey, data, { EX: 30 });

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ source: 'DB 조회', data }));
    return;
  }

  const response = {
    message: '전체 흐름 실습 중이에요!',
    pod: os.hostname(),
    env: process.env.APP_ENV || 'development'
  };
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(response));
});

server.on('uncaughtException', (err) => {
  Sentry.captureException(err);
  console.error('에러 발생:', err.message);
});

server.listen(3000, () => {
  console.log(`서버 시작 - 환경: ${process.env.APP_ENV || 'development'}`);
});

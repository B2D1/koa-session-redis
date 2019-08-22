const Koa = require('koa');
const fs = require('fs');
const qs = require('querystring');
const session = require('koa-session');
const Store = require('./redis-store');
const shortid = require('shortid');

const app = new Koa();
const redisConfig = {
    redis: {
        port: 6379,
        host: 'localhost',
        family: 4,
        password: '123456',
        db: 0,
    },
};

const sessionConfig = {
    key: 'koa:sess',
    maxAge: 86400000,
    signed: false,
    store: new Store(redisConfig),
    genid: () => shortid.generate(),
};

app.use(session(sessionConfig, app));

function parsePostData(ctx) {
    return new Promise((resolve, reject) => {
        let data = '';
        ctx.req.on('data', chunk => {
            data += chunk;
        });
        ctx.req.on('end', () => {
            data = data.toString();
            resolve(data);
        });
    });
}

app.use(async ctx => {
    if (ctx.request.url === '/') {
        // 返回index.html内容
        ctx.set({ 'Content-Type': 'text/html' });
        ctx.body = fs.readFileSync('./index.html');
        return;
    }
    if (ctx.url === '/login' && ctx.method === 'POST') {
        // 登录逻辑处理……
        let postData = await parsePostData(ctx);
        postData = qs.parse(postData);
        if (ctx.session.usr) {
            ctx.body = `hello, ${ctx.session.usr}`;
        } else {
            ctx.session = postData;
            ctx.body = 'you are first login';
        }
    }
});

app.listen(3000, () => {
    console.log(`server is running at localhost:3000`);
});

const Redis = require('ioredis');

class RedisStore {
    constructor(redisConfig) {
        this.redis = new Redis(redisConfig);
    }
    async get(key) {
        const data = await this.redis.get(`SESSION:${key}`);
        return JSON.parse(data);
    }
    async set(key, sess, maxAge) {
        await this.redis.set(
            `SESSION:${key}`,
            JSON.stringify(sess),
            'EX',
            maxAge / 1000
        );
    }
    async destroy(key) {
        return await this.redis.del(`SESSION:${key}`);
    }
}

module.exports = RedisStore;

// middlewares/cacheMiddleware.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 10 });

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedBody = cache.get(key);

  if (cachedBody) {
    return res.json(cachedBody);
  }

  // Intercept the res.json method to auto-save
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      cache.set(key, body);
    }
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;
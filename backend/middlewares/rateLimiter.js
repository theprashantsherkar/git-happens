const attempts = new Map();

// Clean up expired IP entries every 10 minutes (unref ensures timer does not block test runner process exit)
const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of attempts.entries()) {
        if (now - data.resetTime > 0) {
            attempts.delete(ip);
        }
    }
}, 10 * 60 * 1000);

if (cleanupTimer.unref) {
    cleanupTimer.unref();
}

export function authRateLimiter(maxRequests = 15, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        let record = attempts.get(ip);
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + windowMs };
            attempts.set(ip, record);
        }

        record.count++;

        if (record.count > maxRequests) {
            return res.status(429).json({
                success: false,
                message: "Too many authentication requests. Please try again in 15 minutes."
            });
        }

        next();
    };
}

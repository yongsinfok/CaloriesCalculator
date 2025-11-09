// Security validation utility
export function validateInput(input, type) {
    switch (type) {
        case 'image':
            if (typeof input !== 'string') return false;
            if (!input.startsWith('data:image/')) return false;
            if (input.length > 5 * 1024 * 1024) return false; // 5MB limit
            return true;
        case 'session':
            if (typeof input !== 'string') return false;
            if (input.length > 100) return false;
            return /[a-zA-Z0-9\-_]+/.test(input);
        default:
            return false;
    }
}

// Rate limiting simple implementation
const requestCounts = new Map();

export function checkRateLimit(clientId, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(clientId)) {
        requestCounts.set(clientId, []);
    }

    const requests = requestCounts.get(clientId);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    requestCounts.set(clientId, validRequests);

    if (validRequests.length >= maxRequests) {
        return false;
    }

    validRequests.push(now);
    return true;
}

// Clean up old rate limit data
setInterval(() => {
    const cutoff = Date.now() - 60000; // 1 minute ago
    for (const [clientId, requests] of requestCounts.entries()) {
        const validRequests = requests.filter(time => time > cutoff);
        if (validRequests.length === 0) {
            requestCounts.delete(clientId);
        } else {
            requestCounts.set(clientId, validRequests);
        }
    }
}, 60000);
const jwt = require('jsonwebtoken');

// 1. Middleware: Token valid hai ya nahi yeh verify karne ke liye
const protect = async (req, res, next) => {
    let token;

    // Check karein ke header mein token 'Bearer <token_string>' format mein hai ya nahi
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Header se token alag karna
            token = req.headers.authorization.split(' ')[1];

            // Token ko decode/verify karna
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verified user ka data request object mein attach karna
            req.user = decoded; 
            
            next(); // Aglay function (API) par bhejo
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token validation failed!" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided in headers." });
    }
};

// 2. Middleware: Sirf admin role ko allow karne ke liye
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Agar admin hai toh agay janay do
    } else {
        return res.status(403).json({ message: "Access Denied! This operation is restricted to Admins only." });
    }
};

module.exports = { protect, adminOnly };

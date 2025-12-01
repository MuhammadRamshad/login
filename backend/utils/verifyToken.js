import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No access token" });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" });

        req.userEmail = decoded.email;
        req.username = decoded.username;

        next();
    });
};

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        // FIX 1: Look for the Bearer token in the Headers first
        let token = req.headers.authorization?.split(" ")[1];

        // (Optional fallback: Check cookies if the header is missing)
        if (!token) {
            // Note: Your auth controller names the cookie 'refreshToken', not 'jwt'
            token = req.cookies.refreshToken; 
        }

        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No Token Provided" });
        }

        // NOTE: Ensure process.env.JWT_SECRET is the same secret you use in config.JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized - Invalid Token" });
        }

        // FIX 2: Use decoded.id because your auth controller signs the token with { id: user._id }
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default protectRoute;
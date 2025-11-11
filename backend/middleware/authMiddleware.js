import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("[AUTH] Token received:", token);

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("[AUTH] Token decoded:", decoded);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error("[AUTH] Invalid token:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

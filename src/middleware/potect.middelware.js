import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
    try {

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  const paylod = jwt.verify(token, process.env.ACCESSJWT_SECRET, {
    issuer :"my-api",audience:"my-client"
  });

  if (!paylod.type !== "access") {
    return res.status(401).json({ message: "invalid token type" });
  }
  req.user={
    id: paylod.id,
   
    role: paylod.role
  }
  next();
  }


   catch (error) {
    console.error("Error in protect middleware:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
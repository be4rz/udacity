import jwt from "jsonwebtoken";
import secretsService from "./secretsService.js";

class TokenService {
  async generateTokens(user) {
    const PRIVATE_KEY = await secretsService.getSecret("tweets-app-jwt-private-key")
    const accessToken = jwt.sign(
      {
        email: user.email,
        tokenType: 'ACCESS_TOKEN',
      },
      PRIVATE_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY, algorithm: "RS256" }
    );
    const refreshToken = jwt.sign(
      {
        email: user.email,
        tokenType: 'REFRESH_TOKEN',
      },
      PRIVATE_KEY,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY, algorithm: "RS256" }
    );
    return { accessToken, refreshToken };
  }

  async verifyToken(req) {
    if (!req.headers.authorization) {
        throw new Error("Missing Authorization header");
    }
    const PUBLIC_KEY = await secretsService.getSecret("tweets-app-jwt-public-key")
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, PUBLIC_KEY)
    return decodedToken;
  }
}

export default new TokenService();
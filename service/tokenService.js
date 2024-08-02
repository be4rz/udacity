import jwt from "jsonwebtoken";
import "dotenv/config.js"
//import secretsService from "./secretsService.js";

class TokenService {
  secretKey = process.env.SECRET_KEY;
  async generateTokens(user) {
    //const PRIVATE_KEY = await secretsService.getSecret("tweets-app-jwt-private-key")
    const accessToken = jwt.sign(
      {
        email: user.email,
        tokenType: 'ACCESS_TOKEN',
      },
      //PRIVATE_KEY,
      this.secretKey,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY, algorithm: "HS256" }
    );
    const refreshToken = jwt.sign(
      {
        email: user.email,
        tokenType: 'REFRESH_TOKEN',
      },
      //PRIVATE_KEY,
      this.secretKey,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY, algorithm: "HS256" }
    );
    return { accessToken, refreshToken };
  }

  async verifyToken(req) {
    if (!req.headers.authorization) {
        throw new Error("Missing Authorization header");
    }
    //const PUBLIC_KEY = await secretsService.getSecret("tweets-app-jwt-public-key")
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    //const decodedToken = jwt.verify(token, PUBLIC_KEY)
    const decodedToken = jwt.verify(token, this.secretKey);
    return decodedToken;
  }
}

export default new TokenService();

import tokenService from "../service/tokenService.js";

export const requiresAuth = () => {
  return async (req, res, next) => {
    try{
        await tokenService.verifyToken(req)
        return next()
    } catch(error) {
        console.log('Auth error', error)
        return res.status(401).json({message: "Unauthorized"})
    }
  };
};

export default { requiresAuth };

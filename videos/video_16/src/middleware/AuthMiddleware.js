// AuthMiddleware.js
export default class AuthMiddleware {
    async handle(req, res) {
        if (!req.session.user) {
            req.alert.warn("Login to access this feature.");
            
            res.writeHead(302, {Location: "/login"});
            res.end();
            return false; // stop further processing
        }
        return true; // continue
    }
}
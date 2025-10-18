export default class Admin {
    async handle(req, res) {
        if (!req.session.user?.is_admin) {
            req.alert.warn("You are not authorized for this feature.");

            res.writeHead(302, {"Location": "/people"});
            res.end();
            return false;
        }
        return true;
    }
}
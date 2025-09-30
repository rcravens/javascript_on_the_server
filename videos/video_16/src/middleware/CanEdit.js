export default class CanEdit {
    async handle(req, res, params) {
        const email = params.email;
        if (req.session.user?.email !== email && !req.session.user?.is_admin) {
            req.alert.warn("You can only modify your own profile.");

            res.writeHead(302, {"Location": "/people"});
            res.end();
            return false;
        }
        return true;
    }
}
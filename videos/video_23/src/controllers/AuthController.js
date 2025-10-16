import {BaseController} from "./BaseController.js";
import User from "../models/User.js";

export class AuthController extends BaseController {

    async login_form(req, res) {
        return this.view(res, "auth/login", {}, req);
    }

    async login(req, res, params, body) {
        const {email, password} = body;

        // Lookup user by email
        const user = await User.find(email);
        if (!user) {
            const errors = {auth: "Authorization failed"};
            return this.back(req, res, {errors, body});
        }

        // Verify password with bcrypt
        const match = await user.check_password(password);
        if (!match) {
            const errors = {auth: "Authorization failed."};
            return this.back(req, res, {errors, body});
        }

        // Store user in session
        req.auth.user.set(user);

        // Redirect to people index after login
        return this.redirect(res, "/users");
    }

    async logout(req, res) {
        req.auth.user.clear();  // clear user session

        req.alert.success("You have been logged out.", "Success");
        return this.redirect(res, "/users");
    }
}
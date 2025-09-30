import bcrypt from "bcrypt";
import {BaseController} from "./BaseController.js";
import Person from "../models/Person.js";

export class AuthController extends BaseController {

    async loginForm(req, res) {
        return this.view(res, "auth/login", {}, req);
    }

    async login(req, res, params, body) {
        const {email, password} = body;

        // Lookup user by email
        const user = await Person.find(email);
        if (!user) {
            req.flash.set("errors", {email: "No account found with that email"});
            req.flash.set("body", body);
            return this.back(req, res);
        }

        // Verify password with bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash.set("errors", {password: "Invalid password"});
            req.flash.set("body", body);
            return this.back(req, res);
        }

        // Store user in session
        req.session.user = user;

        // Redirect to people index after login
        return this.redirect(res, "/people");
    }

    async logout(req, res) {
        req.session.user = null; // clear user session
        req.flash.set("success", "You have been logged out.");
        return this.redirect(res, "/login");
    }
}
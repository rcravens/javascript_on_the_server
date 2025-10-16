// controllers/PersonController.js
import User from "../models/User.js";
import {BaseController} from "./BaseController.js";
import Validator from "../app/Validator.js";

export class UserController extends BaseController {
    async index(req, res) {
        const users = await User.all();
        return this.view(res, "user/index", {users}, req);
    }

    async show(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/show", {user}, req);
    }

    async new(req, res) {
        return this.view(res, "user/new", {}, req);
    }

    async edit(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/edit", {user}, req);
    }

    async delete(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/delete", {user}, req);
    }

    async create(req, res, params, body) {
        const other_user = await User.find(body.email);
        if (other_user) {
            req.alert.error("Email is already taken.", "Validation Failed");
            return this.back(req, res, {body});
        }

        const {valid, errors} = Validator.validate(User.rules, body);
        if (!valid) {
            req.alert.error("Please fix the form errors.", "Validation Failed");
            return this.back(req, res, {errors, body});
        }

        // Hash the password
        const hashedPassword = await User.hash_password(body.password);

        // Create the person
        const personData = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: hashedPassword,
            is_admin: false
        };

        const person = await User.create(personData);
        if (person) {
            req.alert.success("User added.");

            // Automatically log in the new user
            req.session.user = person;
        }

        return this.redirect(res, "/users");
    }

    async update(req, res, params, body) {

        // If changing email, ensure it does not already exist
        if (body.email !== params.email) {
            const other_user = await User.find(body.email);
            if (other_user) {
                req.alert.error("Email is already taken.", "Validation Failed");
                return this.back(req, res, {body});
            }
        }

        // Validate the fields
        const rules = Validator.pick_rules(User.rules, ["first_name", "last_name", "email"]);
        const {valid, errors} = Validator.validate(rules, body);
        if (!valid) {
            req.alert.error("Please fix the form errors.", "Validation Failed");
            return this.back(req, res, {errors, body});
        }

        // Prepare update data
        const updateData = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email
        };

        const user = await User.update(params.email, updateData);

        // Refresh session if the updated user is the currently logged-in user
        if (req.auth.user.get() && req.auth.user.get().email === params.email) {
            req.auth.user.set(user);
        }

        req.alert.success("User updated.");

        return this.redirect(res, `/users/${body.email}/edit`);
    }

    async update_password(req, res, params, body) {
        const rules = Validator.pick_rules(User.rules, ["password"]);
        const {valid, errors} = Validator.validate(rules, body);

        if (!valid) {
            req.alert.error("Please fix the form errors.", "Validation Failed");
            return this.back(req, res, {errors, body});
        }

        // Hash the new password
        const hashedPassword = await User.hash_password(body.password);

        await User.update(params.email, {password: hashedPassword});

        req.alert.success("Password updated.");

        return this.redirect(res, `/users/${params.email}/edit`);
    }

    async destroy(req, res, params) {
        req.auth.user.clear();

        await User.delete(params.email);

        req.alert.success("User deleted.");

        return this.redirect(res, "/users");
    }
}
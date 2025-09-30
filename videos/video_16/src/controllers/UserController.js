// controllers/PersonController.js
import User from "../models/User.js";
import {BaseController} from "./BaseController.js";
import Validator from "../app/Validator.js";

export class UserController extends BaseController {
    async index(req, res) {
        const people = await User.all();
        return this.view(res, "user/index", {people}, req);
    }

    async show(req, res, params) {
        const person = await User.find(params.email);
        return this.view(res, "user/show", {person}, req);
    }

    async new(req, res) {
        return this.view(res, "user/new", {}, req);
    }

    async edit(req, res, params) {
        const person = await User.find(params.email);
        return this.view(res, "user/edit", {person}, req);
    }

    async delete(req, res, params) {
        const person = await User.find(params.email);
        return this.view(res, "user/delete", {person}, req);
    }

    async create(req, res, params, body) {
        const {valid, errors} = Validator.validate(User.rules, body);
        if (!valid) {
            req.alert.error("Please fix the form errors.", "Validation Failed");
            return this.back(req, res, {errors, body});
        }

        // Hash the password
        const hashedPassword = await User.hashPassword(body.password);

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
            req.alert.success("Person added.");

            // Automatically log in the new user
            req.session.user = person;
        }

        return this.redirect(res, "/users");
    }

    async update(req, res, params, body) {
        body = {...body, email: params.email};
        const {valid, errors} = Validator.validate(User.rules, body);
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

        // Only update password if a new one was provided
        if (body.password) {
            updateData.password = await User.hashPassword(body.password);
        }

        await User.update(params.email, updateData);

        req.alert.success("Person updated.");

        return this.redirect(res, `/users/${params.email}/edit`);
    }

    async destroy(req, res, params) {
        await User.delete(params.email);

        req.alert.success("Person deleted.");

        return this.redirect(res, "/users");
    }
}
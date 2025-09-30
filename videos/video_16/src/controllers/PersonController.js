// controllers/PersonController.js
import Person from "../models/Person.js";
import {BaseController} from "./BaseController.js";
import Validator from "../app/Validator.js";

export class PersonController extends BaseController {
    async index(req, res) {
        const people = await Person.all();
        return this.view(res, "person/index", {people}, req);
    }

    async show(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/show", {person}, req);
    }

    async new(req, res) {
        return this.view(res, "person/new", {}, req);
    }

    async edit(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/edit", {person}, req);
    }

    async delete(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/delete", {person}, req);
    }

    async create(req, res, params, body) {
        const {valid, errors} = Validator.validate(Person.rules, body);
        if (!valid) {
            req.alert.error("Please fix the form errors.", "Validation Failed");
            return this.back(req, res, {errors, body});
        }

        // Hash the password
        const hashedPassword = await Person.hashPassword(body.password);

        // Create the person
        const personData = {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: hashedPassword,
            is_admin: false
        };

        const person = await Person.create(personData);
        if (person) {
            req.alert.success("Person added.");

            // Automatically log in the new user
            req.session.user = person;
        }

        return this.redirect(res, "/people");
    }

    async update(req, res, params, body) {
        const {valid, errors} = Validator.validate(Person.rules, body);
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
            updateData.password = await Person.hashPassword(body.password);
        }

        await Person.update(params.email, updateData);

        req.alert.success("Person updated.");

        return this.redirect(res, `/people/${params.email}/edit`);
    }

    async destroy(req, res, params) {
        await Person.delete(params.email);

        req.alert.success("Person deleted.");

        return this.redirect(res, "/people");
    }
}
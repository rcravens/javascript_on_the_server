// controllers/PersonController.js
import Person from "../models/Person.js";
import {BaseController} from "./BaseController.js";
import Validator from "../Validator.js";

export class PersonController extends BaseController {
    async index(req, res) {
        const people = await Person.all();
        return this.view(res, "person/index", { people });
    }

    async show(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/show", { person });
    }

    async new(req, res) {
        return this.view(res, "person/new");
    }

    async edit(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/edit", { person });
    }

    async delete(req, res, params) {
        const person = await Person.find(params.email);
        return this.view(res, "person/delete", {person});
    }

    async create(req, res, params, body) {
        const { valid, errors} = Validator.validate(Person.rules, body);
        if (!valid) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, errors }));
            return;
        }

        const person = await Person.create(body);
        return this.redirect(res, "/people");
    }

    async update(req, res, params, body) {
        await Person.update(params.email, body);
        return this.redirect(res, `/people/${params.email}/edit`);
    }

    async destroy(req, res, params) {
        await Person.delete(params.email);
        return this.redirect(res, "/people");
    }
}
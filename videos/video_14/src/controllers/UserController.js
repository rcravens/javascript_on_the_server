// controllers/PersonController.js
import User from "../models/User.js";
import {BaseController} from "./BaseController.js";

export class UserController extends BaseController {
    async index(req, res) {
        const users = await User.all();
        return this.view(res, "user/index", {users});
    }

    async show(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/show", {user});
    }

    async new(req, res) {
        return this.view(res, "user/new");
    }

    async edit(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/edit", {user});
    }

    async delete(req, res, params) {
        const user = await User.find(params.email);
        return this.view(res, "user/delete", {user});
    }

    async create(req, res, params, body) {
        await User.create(body);
        return this.redirect(res, "/users");
    }

    async update(req, res, params, body) {
        await User.update(params.email, body);
        return this.redirect(res, `/users/${params.email}/edit`);
    }

    async destroy(req, res, params) {
        await User.delete(params.email);
        return this.redirect(res, "/users");
    }
}
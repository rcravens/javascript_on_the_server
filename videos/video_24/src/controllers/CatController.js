import {BaseController} from "../app/BaseController.js";

export class CatController extends BaseController {
    async index(req, res) {
        return this.view(res, "cat/index", {}, req);
    }
}
import {BaseModel} from "./BaseModel.js";

export default class User extends BaseModel {
    static file_name = "users.json"; // JSON file inside /data
    static key_field = "email";       // unique identifier

    constructor(first_name, last_name, email) {
        super();
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }
}
import {BaseModel} from "./BaseModel.js";

export default class User extends BaseModel {
    static fileName = "users.json"; // JSON file inside /data
    static keyField = "email";       // unique identifier

    constructor(first_name, last_name, email) {
        super();
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }
}
import {BaseModel} from "./BaseModel.js";

export default class User extends BaseModel {
    static fileName = "users.json"; // JSON file inside /data
    static keyField = "email";       // unique identifier

    static rules = {
        first_name: {required: true, type: "string", min: 2, max: 50},
        last_name: {required: true, type: "string", min: 2, max: 50},
        email: {required: true, type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/}
    };

    constructor(first_name, last_name, email) {
        super();
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }
}
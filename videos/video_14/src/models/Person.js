import { BaseModel } from "./BaseModel.js";

export default class Person extends BaseModel {
    static fileName = "people.json"; // JSON file inside /data
    static keyField = "email";       // unique identifier

    constructor(first_name, last_name, email) {
        super();
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }
}
import {BaseModel} from "./BaseModel.js";
import bcrypt from "bcrypt";

export default class User extends BaseModel {
    static fileName = "people.json"; // JSON file inside /data
    static keyField = "email";       // unique identifier

    static rules = {
        first_name: {required: true, type: "string", min: 2, max: 50},
        last_name: {required: true, type: "string", min: 2, max: 50},
        email: {required: true, type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/},
        password: {
            required: true, type: "string", min: 8, max: 100,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, // At least 1 lowercase, 1 uppercase, 1 digit, min 8 chars
            confirm: "confirm_password"
        }
    };

    constructor(first_name, last_name, email, passwordHash, is_admin = false) {
        super();
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.password = passwordHash; // store only bcrypt hash
        this.is_admin = is_admin;
    }

    static async hashPassword(plainPassword) {
        const saltRounds = 10;
        return await bcrypt.hash(plainPassword, saltRounds);
    }

    async checkPassword(plainPassword) {
        if (!this.password) return false;
        return bcrypt.compare(plainPassword, this.password);
    }

    toJSON() {
        return {
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            password: this.password,   // include hashed password
            is_admin: this.is_admin
        };
    }
}
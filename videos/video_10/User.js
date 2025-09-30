import {open} from "sqlite";
import sqlite3 from "sqlite3";

const DB_PATH = "app.db";

let db;

async function initDB() {
    if (!db) {
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        // Migration: create the users table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOTvNULL,
                email TEXT NOT NULL UNIQUE
            )
        `);
    }
    return db;
}

export default class User {
    constructor(first_name, last_name, email) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
    }

    // ------ Create: insert new, fail if already exists
    static async create(first_name, last_name, email) {
        const db = await initDB();

        try {
            await db.run(
                `INSERT INTO users (first_name, last_name, email)
                 VALUES (?, ?, ?)`,
                first_name,
                last_name,
                email
            );
            return new User(first_name, last_name, email);
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed")) return null;
            throw err;
        }
    }

    // ------ Read: find by email
    static async read(email) {
        const db = await initDB();
        const row = await db.get(`SELECT *
                                  FROM users
                                  WHERE email = ?`, email);
        return row ? new User(row.first_name, row.last_name, row.email) : null;
    }

    // ------ Update: update first/last name by email
    static async update(first_name, last_name, email) {
        const db = await initDB();
        const result = await db.run(
            `UPDATE users
             SET first_name = ?,
                 last_name  = ?
             WHERE email = ?`,
            first_name,
            last_name,
            email
        );

        if (result.changes === 0) return null;
        return new User(first_name, last_name, email);
    }

    // ------ Delete: remove by email
    static async delete(email) {
        const db = await initDB();
        const user = await User.read(email);
        if (!user) return null;

        await db.run(`DELETE
                      FROM users
                      WHERE email = ?`, email);
        return user;
    }
}
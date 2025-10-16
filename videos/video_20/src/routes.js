// routes.js
import {UserController} from "./controllers/UserController.js";
import {AuthController} from "./controllers/AuthController.js";

export default function registerRoutes(router) {
    router.get("/login", AuthController, "login_form");
    router.post("/login", AuthController, "login");
    router.get("/logout", AuthController, "logout");

    router.get("/users", UserController, "index");
    router.get("/register", UserController, "new");
    router.post("/users", UserController, "create");
    router.get("/users/:email", UserController, "show");
    router.get("/users/:email/edit", UserController, "edit");
    router.get("/users/:email/delete", UserController, "delete");
    router.put("/users/:email", UserController, "update");
    router.put("/users/:email/password", UserController, "update_password");
    router.delete("/users/:email", UserController, "destroy");
}
// routes.js
import {UserController} from "./controllers/UserController.js";

export default function registerRoutes(router) {

    // public routes
    router.get("/users", UserController, "index");
    router.get("/register", UserController, "new");
    router.post("/users", UserController, "create");

    router.get("/users/:email", UserController, "show");
    router.get("/users/:email/edit", UserController, "edit");
    router.get("/users/:email/delete", UserController, "delete");
    router.put("/users/:email", UserController, "update");
    router.put("/users/:email/password", UserController, "updatePassword");
    router.delete("/users/:email", UserController, "destroy");
}
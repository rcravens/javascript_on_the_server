// routes.js
import {UserController} from "./controllers/UserController.js";

export default function registerRoutes(router) {
    router.register("GET", "/users", UserController, "index");
    router.register("GET", "/users/new", UserController, "new");
    router.register("GET", "/users/:email", UserController, "show");
    router.register("GET", "/users/:email/edit", UserController, "edit");
    router.register("GET", "/users/:email/delete", UserController, "delete");
    router.register("POST", "/users", UserController, "create");
    router.register("PUT", "/users/:email", UserController, "update");
    router.register("DELETE", "/users/:email", UserController, "destroy");
}
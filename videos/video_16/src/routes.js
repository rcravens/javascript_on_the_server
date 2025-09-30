// routes.js
import {UserController} from "./controllers/UserController.js";
import {AuthController} from "./controllers/AuthController.js";
import HasAuthenticated from "./middleware/HasAuthenticated.js";
import CanEdit from "./middleware/CanEdit.js";

export default function registerRoutes(router) {

    // public routes
    router.get("/users", UserController, "index");
    router.get("/register", UserController, "new");
    router.post("/users", UserController, "create");
    router.get("/login", AuthController, "loginForm");
    router.post("/login", AuthController, "login");

    // authenticated routes
    router.group([HasAuthenticated], () => {
        router.get("/users/:email", UserController, "show");
        router.get("/users/:email/edit", UserController, "edit", []);
        router.get("/users/:email/delete", UserController, "delete", [CanEdit]);
        router.put("/users/:email", UserController, "update", [CanEdit]);
        router.put("/users/:email/password", UserController, "updatePassword", [CanEdit]);
        router.delete("/users/:email", UserController, "destroy", [CanEdit]);

        router.get("/logout", AuthController, "logout");
    });

}
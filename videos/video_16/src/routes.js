// routes.js
import {UserController} from "./controllers/UserController.js";
import {AuthController} from "./controllers/AuthController.js";
import AuthMiddleware from "./middleware/AuthMiddleware.js";
import BelongsToMeOrAdminMiddleware from "./middleware/BelongsToMeOrAdminMiddleware.js";

export default function registerRoutes(router) {

    // public routes
    router.get("/users", UserController, "index");
    router.get("/register", UserController, "new");
    router.post("/users", UserController, "create");
    router.get("/login", AuthController, "loginForm");
    router.post("/login", AuthController, "login");

    // authenticated routes
    router.group([AuthMiddleware], () => {
        router.get("/users/:email", UserController, "show");
        router.get("/users/:email/edit", UserController, "edit", []);
        router.get("/users/:email/delete", UserController, "delete", [BelongsToMeOrAdminMiddleware]);
        router.put("/users/:email", UserController, "update", [BelongsToMeOrAdminMiddleware]);
        router.delete("/users/:email", UserController, "destroy", [BelongsToMeOrAdminMiddleware]);

        router.get("/logout", AuthController, "logout");
    });

}
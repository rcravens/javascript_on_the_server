// routes.js
import {PersonController} from "./controllers/PersonController.js";
import {AuthController} from "./controllers/AuthController.js";
import AuthMiddleware from "./middleware/AuthMiddleware.js";
import BelongsToMeOrAdminMiddleware from "./middleware/BelongsToMeOrAdminMiddleware.js";

export default function registerRoutes(router) {

    // public routes
    router.get("/people", PersonController, "index");
    router.get("/people/new", PersonController, "new");
    router.post("/people", PersonController, "create");
    router.get("/login", AuthController, "loginForm");
    router.post("/login", AuthController, "login");

    // authenticated routes
    router.group([AuthMiddleware], () => {
        router.get("/people/:email", PersonController, "show");
        router.get("/people/:email/edit", PersonController, "edit", []);
        router.get("/people/:email/delete", PersonController, "delete", [BelongsToMeOrAdminMiddleware]);
        router.put("/people/:email", PersonController, "update", [BelongsToMeOrAdminMiddleware]);
        router.delete("/people/:email", PersonController, "destroy", [BelongsToMeOrAdminMiddleware]);

        router.get("/logout", AuthController, "logout");
    });

}
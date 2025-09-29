// routes.js
import { PersonController } from "./controllers/PersonController.js";

export default function registerRoutes(router) {
    router.register("GET", "/people", PersonController, "index");
    router.register("GET", "/people/new", PersonController, "new");
    router.register("GET", "/people/:email", PersonController, "show");
    router.register("GET", "/people/:email/edit", PersonController, "edit");
    router.register("GET", "/people/:email/delete", PersonController, "delete");
    router.register("POST", "/people", PersonController, "create");
    router.register("PUT", "/people/:email", PersonController, "update");
    router.register("DELETE", "/people/:email", PersonController, "destroy");
}
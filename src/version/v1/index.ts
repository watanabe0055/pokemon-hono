import { Hono } from "hono";
import pokemon from "../../api/pokemon";
import types from "../../api/types";
import pickup from "../../api/pickup";

const v1 = new Hono();

const routes = [
  { path: "/pokemon", handler: pokemon },
  { path: "/pokemon-type", handler: types },
  { path: "/pickup", handler: pickup },
];

routes.forEach(({ path, handler }) => v1.route(path, handler));

export default v1;

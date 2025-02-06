import { Hono } from "hono";
import pokemon from "../../api/pokemon";
import types from "../../api/types";
import pickup from "../../api/pickup";
import test from "../../api/test";
import { AppEnv, AppHono, AppVariables } from "../../type/hono";

const v1: AppHono = new Hono<{ Variables: AppVariables; Bindings: AppEnv }>();

const routes: Array<{ path: string; handler: AppHono }> = [
  { path: "/pokemon", handler: pokemon },
  { path: "/pokemon-type", handler: types },
  { path: "/pickup", handler: pickup },
  { path: "/test", handler: test },
];

routes.forEach(({ path, handler }) => v1.route(path, handler));

export default v1;

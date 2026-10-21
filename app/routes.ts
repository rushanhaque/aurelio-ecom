import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("api/*", "routes/preview-api.ts"),
  index("routes/home.tsx"),
  route("*", "routes/legacy-redirect.ts"),
] satisfies RouteConfig;

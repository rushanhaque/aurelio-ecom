import { redirect } from "react-router";
// The About page moved to /about; keep old links working.
export const loader = () => redirect("/about", 301);

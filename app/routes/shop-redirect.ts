import { redirect } from "react-router";
import { shopLink } from "../lib/brand";
// The shop moved to Shopify; old /shop links (and bookmarks) follow it there.
export const loader = () => redirect(shopLink, 302);

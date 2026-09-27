export function loader() {
  return Response.json({ error: "Online services are not connected in this client preview." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
export const action = loader;

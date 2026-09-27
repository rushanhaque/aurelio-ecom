import { PassThrough } from "node:stream";
import { randomBytes } from "node:crypto";
import { createReadableStreamFromReadable } from "@react-router/node";
import {
  ServerRouter,
  type AppLoadContext,
  type EntryContext,
} from "react-router";
import { renderToPipeableStream } from "react-dom/server";
import { isbot } from "isbot";
export const streamTimeout = 5000;
export default function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
  loadContext: AppLoadContext,
) {
  if (request.method === "HEAD") return new Response(null, { status, headers });
  const nonce =
    typeof loadContext.cspNonce === "string"
      ? loadContext.cspNonce
      : randomBytes(18).toString("base64");
  return new Promise<Response>((resolve, reject) => {
    let rendered = false;
    const ready =
      isbot(request.headers.get("user-agent") || "") || context.isSpaMode
        ? "onAllReady"
        : "onShellReady";
    const timeout = setTimeout(() => abort(), streamTimeout + 1000);
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={context} url={request.url} nonce={nonce} />,
      {
        nonce,
        [ready]() {
          rendered = true;
          const body = new PassThrough();
          body.on("close", () => clearTimeout(timeout));
          body.on("finish", () => clearTimeout(timeout));
          headers.set("Content-Type", "text/html");
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              status,
              headers,
            }),
          );
          pipe(body);
        },
        onShellError(error) {
          clearTimeout(timeout);
          reject(error);
        },
        onError() {
          status = 500;
          if (rendered) console.error("SSR stream failed");
        },
      },
    );
  });
}

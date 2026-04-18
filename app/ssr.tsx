import { StartServer } from "@tanstack/react-start";
import { createRequestHandler } from "@tanstack/react-start/server";
import { getRouter } from "./router";

export default createRequestHandler({
  createRouter: getRouter,
  requestHandler: ({ request, responseHeaders, router }) => (
    <StartServer request={request} responseHeaders={responseHeaders} router={router} />
  ),
});

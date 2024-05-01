import url from "url";
// import { handleBalanceOf, handleMint } from "../../TEMP/handlers.js";

async function routeRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    if (req.method === "POST" && parsedUrl.pathname === "/mint") {
        handleMint(req, res);
    } else if (req.method === "GET" && parsedUrl.pathname === "/balanceOf") {
        await handleBalanceOf(res, req);
    } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Not Found\n");
    }
}

export { routeRequest };

import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve the SPA for all routes. All user data stays client-side; the
    // server only ships the app (see BASELINE.md).
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

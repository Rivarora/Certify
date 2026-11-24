import http from "node:http";
import { Server } from "socket.io";
import { io as connectSocket } from "socket.io-client";
import { createSocketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

describe("Socket.IO authentication", () => {
  test("rejects connections without an authenticated session or token", async () => {
    const httpServer = http.createServer();
    const ioServer = new Server(httpServer, { cors: { origin: "http://localhost:5173" } });
    ioServer.use(createSocketAuthMiddleware());

    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const { port } = httpServer.address();
    const client = connectSocket(`http://127.0.0.1:${port}`, {
      forceNew: true,
      reconnection: false,
      timeout: 2000,
    });

    try {
      const error = await new Promise((resolve, reject) => {
        client.once("connect_error", resolve);
        client.once("connect", () => reject(new Error("unauthenticated socket connected")));
        setTimeout(() => reject(new Error("socket auth did not reject in time")), 3000).unref();
      });
      expect(error.data.code).toBe("UNAUTHORIZED");
    } finally {
      client.close();
      await new Promise((resolve) => ioServer.close(resolve));
    }
  });
});

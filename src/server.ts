import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import connectDB from "./config/db.config";
import { initSocket } from "./config/socket.config";

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

initSocket(httpServer);

(async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT} with WebSockets`);
  });
})();

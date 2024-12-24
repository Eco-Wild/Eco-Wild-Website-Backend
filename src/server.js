import http from "http";
import app from "./app.js";
import mongocoonnect from "./services/DB/mongo.js";
const server = http.createServer(app);

async function startServer() {
  await mongocoonnect();
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
}
startServer();

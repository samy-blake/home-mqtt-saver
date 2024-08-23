import "dotenv/config";
import { mqttInit } from "./app/mqtt.mjs";
import { DB } from "./app/db.mjs";

(async () => {
  DB.init();

  mqttInit();
})()

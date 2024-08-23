import mqtt from "mqtt";
import { DB } from "./db.mjs";


export function mqttInit() {
  const protocol = 'mqtt'
  const host = process.env.MQTT_HOST
  const port = process.env.MQTT_PORT
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
  const connectUrl = `${protocol}://${host}:${port}`

  const topic = 'home/room/#'

  const connectionConfig = {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  };

  if (process.env.MQTT_USER && process.env.MQTT_PASS) {
    connectionConfig.username = process.env.MQTT_USER;
    connectionConfig.password = process.env.MQTT_PASS;
  }

  const client = mqtt.connect(connectUrl, connectionConfig)

  client.on('connect', () => {
    console.log('Connected')

    client.subscribe([topic], () => {
      console.log(`Subscribe to topic '${topic}'`)
    })
  })

  client.on("message", (topic, message) => {
    const topicList = topic.replace('home/room/', '').split('/');
    const [
      room,
      type
    ] = topicList;

    let data = { type, value: null };
    switch (type) {
      case 'temperature':
      case 'humidity':
        data.value = Number.parseFloat(message.toString());
        break;
      case 'window':
        data.value = Number.parseInt(message.toString());
        break;

      default:
        data.value = message.toString();
        break;
    }

    // message is Buffer
    console.log('topic', topic, 'message', message.toString());

    DB.add(data, room);
  });
}

import { Admin, Consumer, Kafka, logLevel } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private consumer: Consumer;
  private broker: string;

  constructor() {
    this.broker = process.env.KAFKA_BROKERS || "ServerURL";

    this.kafka = new Kafka({
      clientId: "post-producer",
      brokers: [this.broker],
      logLevel: logLevel.INFO,
      retry: { retries: 3 },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: "post-consumer",
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
      console.log("Connected to Kafka");
    } catch (error) {
      console.error(`Error connecting to Kafka: ${error}`);
      process.exit(1);
    }
  }
  async consume(callback:(message:any)=>void): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {

          const parsedMessage = JSON.parse(message?.value?.toString() || "{}");
          callback(parsedMessage);
        },
      })
    } catch (error) {
      console.error(`Error`, error);
    }
  }
  async subscribeTopic(topic: string): Promise<void> {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log("Subscribed to Kafka", topic);
    } catch (error) {
      console.error(`Error`, error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      console.log("Disconnected from Kafka");
    } catch (error: any) {
      console.error(`Error disconnecting from Kafka: ${error.message}`);
    }
  }
}

export default new KafkaConfig();

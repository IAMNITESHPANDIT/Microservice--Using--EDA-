import { Admin, Kafka, logLevel, Producer } from "kafkajs";

class KafkaConfig {
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private broker: string;

  constructor() {
    this.broker = process.env.KAFKA_BROKERS || "ServerURL:9092";

    this.kafka = new Kafka({
      clientId: "post-producer",
      brokers: [this.broker],
      logLevel: logLevel.INFO,
      retry: { retries: 3 },
      connectionTimeout: 30000,
      requestTimeout: 30000,
    });

    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async connect() {
    try {
      await this.producer.connect();
      await this.admin.connect();
      console.log("Connected to Kafka");
    } catch (error) {
      console.error(`Error connecting to Kafka: ${error}`);
      process.exit(1);
    }
  }

  async createTopic(topic: string): Promise<void> {
    try {
      const topicExists = await this.admin.fetchTopicMetadata({ topics: [topic] });
      if (topicExists.topics.length > 0) {
        console.log(`Topic "${topic}" already exists`);
        return;
      }

      const result = await this.admin.createTopics({
        topics: [{ topic, numPartitions: 1 }],
        waitForLeaders: true,
      });

      if (result) {
        console.log(`Created topic: ${topic}`);
      } else {
        console.warn(`Topic creation request for "${topic}" was not acknowledged by the broker.`);
      }
    } catch (error: any) {
      console.error(`Error creating topic "${topic}": ${error.message}`);
    }
  }

  async sendToTopic(topic: string, message: string): Promise<any> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: message }],
      });
      console.log("Message sent to Kafka", message);
    } catch (error: any) {
      console.error(`Error sending message to topic "${topic}": ${error.message}`);
      return { message: "error", error };
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.admin.disconnect();
      console.log("Disconnected from Kafka");
    } catch (error: any) {
      console.error(`Error disconnecting from Kafka: ${error.message}`);
    }
  }
}

export default new KafkaConfig();

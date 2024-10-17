import { connectDb } from "./config/db.config"
import kafkaConfig from "./config/kafka.config"
import { postConsumer } from "./config/post.consumer";

export const init = async (): Promise<void> => {
    try {
        await connectDb()
        await kafkaConfig.connect();
        await postConsumer()

    } catch (error) {
    console.log("error", error);
    process.exit(1);
    }
}
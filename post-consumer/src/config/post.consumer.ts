import { PostModel } from "../model/post";
import kafkaConfig from "./kafka.config";

export const postConsumer = async()=>{
    const message:any=[];

    let processing = false;

    try {
        await kafkaConfig.subscribeTopic('post');

        kafkaConfig.consume( async (msg:any) => {
            message.push(msg);
            if (!processing) {
                processing = true;
                try {
                    if(message.length> 100){
                        processMessages()
                    }
                    processing = false;
                } catch (error) {
                    console.error("Error processing messages", error);
                    processing = false;
                }
            }
            setInterval(processMessages, 5000)
        });



    } catch (error) {
        console.log(error);
        process.exit(1);
    }

    async function processMessages(){
        if(message.length > 0 && !processing){
            processing = true;
            const batchToProcess = [...message];

            try {
                processing = false;
                message.length = 0;
                await PostModel.insertMany(batchToProcess, {ordered:false})
                console.log("batch processed")

            } catch (error) {
                console.error("Error processing messages", error);
                message.push(...batchToProcess)
            }finally{
                processing = false;
            }
        
        }
    }
}
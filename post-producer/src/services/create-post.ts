import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import kafkaConfig from '../config/kafka.config';

const app = new Hono();

const schema = z.object({
  title: z.string(),
  content: z.string(),
});

app.post(
  '/create-post',
  zValidator('json', schema),
  async (c) => {
    const { title, content } = c.req.valid('json');

    try {
      await kafkaConfig.sendToTopic('post', JSON.stringify({ title, content }));

      return c.json({ message: 'Message sent successfully' }, 200);
    } catch (error) {
      console.error('Error sending message to Kafka:', error);
      
      return c.json({ message: 'Error sending message to Kafka' }, 500);
    }
  }
);

export default app;

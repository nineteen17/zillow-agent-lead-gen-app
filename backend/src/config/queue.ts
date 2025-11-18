import amqp from 'amqplib';
import { env } from './env.js';
import { logger } from './logger.js';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(env.RABBITMQ_EXCHANGE, 'topic', { durable: true });

    // Declare queues
    const queues = [
      `${env.RABBITMQ_QUEUE_PREFIX}.leads`,
      `${env.RABBITMQ_QUEUE_PREFIX}.emails`,
      `${env.RABBITMQ_QUEUE_PREFIX}.notifications`,
    ];

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });
    }

    logger.info('Connected to RabbitMQ');

    // Handle connection close
    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
    });

    return { connection, channel };
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

export async function publishMessage(queue: string, message: unknown) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  const queueName = `${env.RABBITMQ_QUEUE_PREFIX}.${queue}`;

  try {
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    logger.info(`Message published to queue: ${queueName}`);
  } catch (error) {
    logger.error(`Failed to publish message to ${queueName}:`, error);
    throw error;
  }
}

export async function consumeQueue(
  queue: string,
  handler: (message: unknown) => Promise<void>
) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  const queueName = `${env.RABBITMQ_QUEUE_PREFIX}.${queue}`;

  try {
    await channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel?.ack(msg);
        } catch (error) {
          logger.error(`Error processing message from ${queueName}:`, error);
          channel?.nack(msg, false, false); // Don't requeue
        }
      },
      { noAck: false }
    );

    logger.info(`Consuming messages from queue: ${queueName}`);
  } catch (error) {
    logger.error(`Failed to consume queue ${queueName}:`, error);
    throw error;
  }
}

export async function closeRabbitMQ() {
  try {
    await channel?.close();
    await connection?.close();
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
}

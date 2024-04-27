import sampleQueue from '../queues/sampleQueue';

export default async function sampleQueueProducer(name: string, payload: Record<string, unknown>, priority: number) {
    await sampleQueue.add(name, payload, { priority: priority });
}
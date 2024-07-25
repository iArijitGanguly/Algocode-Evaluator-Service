import evaluationQueue from '../queues/evaluationQueue';

export default async function evaluationQueueProducer(payload: Record<string, unknown>) {
    await evaluationQueue.add('EvaluationJob', payload);
}
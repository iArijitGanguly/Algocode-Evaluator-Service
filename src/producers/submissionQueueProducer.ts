import submissionQueue from '../queues/submissionQueue';

export default async function submissionQueueProducer(payload: Record<string, unknown>) {
    await submissionQueue.add('SubmissionJob', payload);
}
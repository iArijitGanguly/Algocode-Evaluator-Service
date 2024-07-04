import submissionQueue from '../queues/submissionQueue';
import { SubmissionPayload } from '../types/SubmissionPayload';

export default async function submissionQueueProducer(payload: Record<string, SubmissionPayload>) {
    await submissionQueue.add('SubmissionJob', payload);
}
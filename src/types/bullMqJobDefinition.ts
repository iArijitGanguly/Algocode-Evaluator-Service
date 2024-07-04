import { Job } from 'bullmq';

import { SubmissionPayload } from './SubmissionPayload';

export interface IJob {
    name: string
    payload?: Record<string, SubmissionPayload>
    handle: (job?: Job) => void
    failed: (job?: Job) => void
}
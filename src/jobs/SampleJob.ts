import { Job } from 'bullmq';

import { IJob } from '../types/bullMqJobDefinition';

export default class SampleJob implements IJob {
    name: string;
    payload?: Record<string, unknown>;

    constructor(payload: Record<string, unknown>) {
        this.name = this.constructor.name;
        this.payload = payload;
    }

    handle = (job?: Job) => {
        console.log('Handler of the Job called', job?.name, job?.id, job?.data);
    };
    failed = (job?: Job) => {
        console.log('Job failed', job?.id);
    };
}
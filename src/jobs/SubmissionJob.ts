import { Job } from 'bullmq';

import runCpp from '../containers/runCppDocker';
import { IJob } from '../types/bullMqJobDefinition';
import { SubmissionPayload } from '../types/SubmissionPayload';

export default class SubmissionJob implements IJob {
    name: string;
    payload: Record<string, SubmissionPayload>;

    constructor(payload: Record<string, SubmissionPayload>) {
        this.name = this.constructor.name;
        this.payload = payload;
    }

    handle = async (job?: Job) => {
        console.log('Handler of the job is called');
        if(job) {
            const key = Object.keys(this.payload)[0];
            if(this.payload[key].language == 'CPP') {
                const response = await runCpp(this.payload[key].code, this.payload[key].inputTestCase);
                console.log('Evaluated Response is ', response);
            }
        }
    };
    failed = (job?: Job) => {
        console.log('Job failed', job?.id);
    };
}
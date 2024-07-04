import { Job } from 'bullmq';

import logger from '../configs/loggerConfig';
import { IJob } from '../types/bullMqJobDefinition';
import { SubmissionPayload } from '../types/SubmissionPayload';
import createExecutor from '../utils/executorFactory';

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
            const code = this.payload[key].code;
            const language = this.payload[key].language;
            const inputTestCase = this.payload[key].inputTestCase;
            const strategy = createExecutor(language);

            if(strategy != null) {
                const response = await strategy.execute(code, inputTestCase);
                if(response.status == 'COMPLETED') {
                    logger.info('Code executed successfully');
                    console.log(response);
                }
                else {
                    logger.error('Something went wrong with code execution');
                    console.log(response);
                }
            }
        }
    };
    failed = (job?: Job) => {
        console.log('Job failed', job?.id);
    };
}
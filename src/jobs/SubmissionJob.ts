import { Job } from 'bullmq';

import logger from '../configs/loggerConfig';
import evaluationQueueProducer from '../producers/evaluationQueueProducer';
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
            const userId = this.payload[key].userId;
            const submissionId = this.payload[key].submissionId;
            const testCases = this.payload[key].testCases;
            const strategy = createExecutor(language);

            if(strategy != null) {
                const response = await strategy.execute(code, testCases);
                logger.info(JSON.stringify(response, null, 2));
                await evaluationQueueProducer({ response, userId, submissionId });
            }
        }
    };
    failed = (job?: Job) => {
        console.log('Job failed', job?.id);
    };
}
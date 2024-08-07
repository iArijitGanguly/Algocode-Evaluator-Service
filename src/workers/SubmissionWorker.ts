import { Job, Worker } from 'bullmq';

import redisConnection from '../configs/redisConfig';
import SubmissionJob from '../jobs/SubmissionJob';

export default function SubmissionWorker(queueName: string) {
    new Worker(
        queueName,
        async (job: Job) => {
            if(job.name == 'SubmissionJob') {
                const submissionJobInstance = new SubmissionJob(job.data);
                // console.log('job is : ');
                // console.log(job);
                // console.log('job.data is : ');
                // console.log(job.data);
                submissionJobInstance.handle(job);
                return true;
            }
        },
        { connection: redisConnection }
    );
}
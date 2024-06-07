import { Queue } from 'bullmq';

import redisConnection from '../configs/redisConfig';

export default new Queue('SubmissionQueue', { connection: redisConnection });
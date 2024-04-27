import { Queue } from 'bullmq';

import redisConnection from '../configs/redisConfig';

export default new Queue('SampleQueue', { connection: redisConnection });
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import evaluationQueue from '../queues/evaluationQueue';
import submissionQueue from '../queues/submissionQueue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bullboard');

createBullBoard({
    queues: [new BullMQAdapter(submissionQueue), new BullMQAdapter(evaluationQueue)],
    serverAdapter
});

export default serverAdapter;
import { createBullBoard, } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';

import logger from './configs/loggerConfig';
import serverConfig from './configs/serverConfig';
import sampleQueueProducer from './producers/sampleQueueProducer';
import sampleQueue from './queues/sampleQueue';
import apiRouter from './routers';
import SampleWorker from './workers/SampleWorker';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(sampleQueue)],
    serverAdapter: serverAdapter
});

const app = express();
const { PORT } = serverConfig;

app.use('/api', apiRouter);
app.use('/admin/queues', serverAdapter.getRouter());

app.listen(PORT, () => {
    logger.info(`Server started at PORT: ${PORT}`);

    SampleWorker('SampleQueue');

    sampleQueueProducer('SampleJob', {
        name: 'Arijit',
        comapny: 'Google',
        position: 'SDE 1',
        location: 'Remote'
    }, 2);

    sampleQueueProducer('SampleJob', {
        name: 'Sanket',
        company: 'Microsoft',
        position: 'SDE 2 L61',
        location: 'Remote | BLR | Noida'
    }, 1);
});
import express from 'express';

import serverConfig from './configs/serverConfig';
import sampleQueueProducer from './producers/sampleQueueProducer';
import apiRouter from './routers';
import SampleWorker from './workers/SampleWorker';

const app = express();
const { PORT } = serverConfig;

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);

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
import bodyParser from 'body-parser';
import express from 'express';

import bullboardAdapter from './configs/bullboardConfig';
import logger from './configs/loggerConfig';
import serverConfig from './configs/serverConfig';
import sampleQueueProducer from './producers/sampleQueueProducer';
import apiRouter from './routers';
import SampleWorker from './workers/SampleWorker';

const app = express();
const { PORT } = serverConfig;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.text());

app.use('/api', apiRouter);
app.use('/bullboard', bullboardAdapter.getRouter());

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
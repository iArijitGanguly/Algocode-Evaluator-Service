import express from 'express';

import serverConfig from './configs/serverConfig';
import apiRouter from './routers';

const app = express();

app.use('/api', apiRouter);

app.listen(serverConfig.PORT, () => {
    console.log(`Server started at PORT: ${serverConfig.PORT}`);
});
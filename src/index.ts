import bodyParser from 'body-parser';
import express from 'express';

import bullboardAdapter from './configs/bullboardConfig';
import logger from './configs/loggerConfig';
import serverConfig from './configs/serverConfig';
// import runPython from './containers/runPythonDocker';
// import sampleQueueProducer from './producers/sampleQueueProducer';
// import runJava from './containers/runJavaDocker';
import runCpp from './containers/runCppDocker';
import apiRouter from './routers';
import SampleWorker from './workers/SampleWorker';

const app = express();
const { PORT } = serverConfig;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use('/api', apiRouter);
app.use('/bullboard', bullboardAdapter.getRouter());

app.listen(PORT, () => {
    logger.info(`Server started at PORT: ${PORT}`);

    SampleWorker('SampleQueue');

    //     const code = `x = input()
    // y = input()
    // print("value of x is", x)
    // print("value of y is", y)
    // `;

    // const code = `
    // import java.util.*;
    // public class Main {
    //     public static void main(String[] args) {
    //         Scanner input = new Scanner(System.in);
    //         int val = input.nextInt();
    //         System.out.println("Input value is given by user" + val);
    //         for(int i = 0; i < val; i++) {
    //             System.out.print(i + " ");
    //         }
    //     }
    // }
    // `;

    const code = `
        #include<iostream>
        using namespace std;

        int main() {
            int val;
            cin >> val;
            cout << "user has given the value : " << val << endl;
            for(int i = 0; i < val; i++) {
                cout << i << " ";
            }
            cout << endl;
            return 0;
        }
    `;

    runCpp(code, '10');

    // sampleQueueProducer('SampleJob', {
    //     name: 'Arijit',
    //     comapny: 'Google',
    //     position: 'SDE 1',
    //     location: 'Remote'
    // }, 2);

    // sampleQueueProducer('SampleJob', {
    //     name: 'Sanket',
    //     company: 'Microsoft',
    //     position: 'SDE 2 L61',
    //     location: 'Remote | BLR | Noida'
    // }, 1);
});
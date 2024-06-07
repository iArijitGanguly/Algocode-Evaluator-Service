import logger from '../configs/loggerConfig';
import { CPP_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';
import pullImage from './pullImage';

async function runCpp(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(CPP_IMAGE);

    logger.info('Initialising c++ container');
    
    // eslint-disable-next-line quotes
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./main`;
    const cppDockerContainer = await createContainer(CPP_IMAGE, ['/bin/sh', '-c', runCommand]);
    await cppDockerContainer.start();
    logger.info('Starting the container');

    const loggerStream = await cppDockerContainer.logs({
        stdout: true,
        stderr: true,
        timestamps: false,
        follow: true
    });

    loggerStream.on('data', (chunk: Buffer) => {
        rawLogBuffer.push(chunk);
    });

    await new Promise((res) => {
        loggerStream.on('end', () => {
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodeStream = decodeDockerStream(completeBuffer);
            console.log(decodeStream);
            console.log(decodeStream.stdout);
            res(decodeStream);
        });
    });

    await cppDockerContainer.remove();
}

export default runCpp;
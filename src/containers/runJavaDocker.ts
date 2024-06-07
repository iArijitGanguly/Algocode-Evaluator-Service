import logger from '../configs/loggerConfig';
import { JAVA_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';
import pullImage from './pullImage';

async function runJava(code: string, inputTestCase: string) {
    const rawLogBuffer: Buffer[] = [];
    await pullImage(JAVA_IMAGE);

    logger.info('Initialising java container');
    
    // eslint-disable-next-line quotes
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;
    const javaDockerContainer = await createContainer(JAVA_IMAGE, ['/bin/sh', '-c', runCommand]);
    await javaDockerContainer.start();
    logger.info('Starting the container');

    const loggerStream = await javaDockerContainer.logs({
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

    await javaDockerContainer.remove();
}

export default runJava;
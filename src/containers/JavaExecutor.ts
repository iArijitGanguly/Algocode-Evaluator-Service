import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { JAVA_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';
import pullImage from './pullImage';

class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        logger.info('Pulling the java image');
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

        try{
            const codeResponse = await this.fetchDecodedStream(loggerStream, rawLogBuffer);
            return { output: codeResponse, status: 'COMPLETED' };
        } catch(error) {
            return { output: error as string, status: 'ERROR'};
        } finally {
            await javaDockerContainer.remove();
        }
    }

    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]): Promise<string> {
        return new Promise((res, rej) => {
            loggerStream.on('end', () => {
                console.log(rawLogBuffer);
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                if(decodedStream.stdout) {
                    res(decodedStream.stdout);
                }
                else {
                    rej(decodedStream.stderr);
                }
            });
        });
    }
}

export default JavaExecutor;
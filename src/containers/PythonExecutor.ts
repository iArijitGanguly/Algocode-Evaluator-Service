import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { PYTHON_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';
import pullImage from './pullImage';

class PythonExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        logger.info('Pulling the python image');
        await pullImage(PYTHON_IMAGE);
    
        logger.info('Initialising python container');
        // eslint-disable-next-line quotes
        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;
        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3', '-c', code, 'stty -echo']);
        const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['/bin/sh', '-c', runCommand]);
        await pythonDockerContainer.start();
        logger.info('Starting the container');
    
        const loggerStream = await pythonDockerContainer.logs({
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
            await pythonDockerContainer.remove();
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

export default PythonExecutor;
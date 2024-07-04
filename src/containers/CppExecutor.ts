import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { CPP_IMAGE } from '../utils/constants';
import createContainer from './containerFactory';
import decodeDockerStream from './dockerHelper';
import pullImage from './pullImage';

class CppExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];

        logger.info('Pulling the c++ image');
        await pullImage(CPP_IMAGE);
    
        logger.info('Initialising c++ container');
        
        // eslint-disable-next-line quotes
        const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | ./main`;
        console.log(runCommand);
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

        try{
            const codeResponse = await this.fetchDecodedStream(loggerStream, rawLogBuffer);
            return { output: codeResponse, status: 'COMPLETED' };
        } catch(error) {
            return { output: error as string, status: 'ERROR'};
        } finally {
            await cppDockerContainer.remove();
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

export default CppExecutor;
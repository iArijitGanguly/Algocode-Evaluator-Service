import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { TestCase } from '../types/SubmissionPayload';
import { JAVA_IMAGE, JAVA_TIME_LIMIT } from '../utils/constants';
import fetchDecodedStream from '../utils/fetchDecodedStream';
import createContainer from './containerFactory';
import pullImage from './pullImage';

class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, testCases: TestCase[]): Promise<ExecutionResponse[]> {
        const result: ExecutionResponse[] = [];
        logger.info('Pulling the java image');
        await pullImage(JAVA_IMAGE);

        for(const testCase of testCases) {
            logger.info('Initialising java container');
            const rawLogBuffer: Buffer[] = [];
            // eslint-disable-next-line quotes
            const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${testCase.input.replace(/'/g, `'\\"`)}' | java Main`;
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
                const codeResponse = await fetchDecodedStream(loggerStream, rawLogBuffer, JAVA_TIME_LIMIT);
                if(codeResponse.trim() == testCase.output.trim()) {
                    result.push({ output: codeResponse.trim(), status: 'SUCCESS', expectedOutput: testCase.output.trim() });
                }
                else {
                    result.push({ output: codeResponse.trim(), status: 'WA', expectedOutput: testCase.output.trim() });
                }
            } catch(error) {
                if(error == 'TLE') {
                    await javaDockerContainer.kill();
                    result.push({ output: 'TLE', status: 'ERROR' });
                }
                else {
                    result.push({ output: 'MLE', status: 'ERROR' });
                }
            } finally {
                await javaDockerContainer.remove();
            }
        }
        return result;
    }
}

export default JavaExecutor;
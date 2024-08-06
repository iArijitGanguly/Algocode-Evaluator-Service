import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { TestCase } from '../types/SubmissionPayload';
import { JAVA_IMAGE, JAVA_TIME_LIMIT } from '../utils/constants';
import fetchDecodedStream from '../utils/fetchDecodedStream';
import createContainer from './containerFactory';
import pullImage from './pullImage';

class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, testCases: TestCase[]): Promise<ExecutionResponse[]> {
        logger.info('Pulling the java image');
        await pullImage(JAVA_IMAGE);
        // eslint-disable-next-line quotes
        const codeFile = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java`;
        const result = await Promise.all(testCases.map((testCase) => this.runCode(codeFile, testCase)));
        return result;
    }

    async runCode(codeFile: string, testCase: TestCase): Promise<ExecutionResponse> {
        logger.info('Initialising java container');
        const rawLogBuffer: Buffer[] = [];
        // eslint-disable-next-line quotes
        const runCommand = `${codeFile} && echo '${testCase.input.replace(/'/g, `'\\"`)}' | java Main`;
        console.log(runCommand);
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
                return { output: codeResponse.trim(), expectedOutput: testCase.output.trim(), status: 'SUCCESS' };
            }
            else {
                return { output: codeResponse.trim(), expectedOutput: testCase.output.trim(), status: 'WA' };
            }
        } catch(error) {
            if(error == 'TLE') {
                await javaDockerContainer.kill();
                return { output: 'TLE', status: 'ERROR' };
            }
            else {
                return { output: error as string, status: 'ERROR' };
            }
        } finally {
            await javaDockerContainer.remove();
        }
    }

}

export default JavaExecutor;
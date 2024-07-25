import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { TestCase } from '../types/SubmissionPayload';
import { CPP_IMAGE, CPP_TIME_LIMIT } from '../utils/constants';
import fetchDecodedStream from '../utils/fetchDecodedStream';
import createContainer from './containerFactory';
import pullImage from './pullImage';

class CppExecutor implements CodeExecutorStrategy {
    async execute(code: string, testCases: TestCase[]): Promise<ExecutionResponse[]> {
        const result: ExecutionResponse[] = [];
        logger.info('Pulling the c++ image');
        await pullImage(CPP_IMAGE);
        
        for(const testCase of testCases) {
            logger.info('Initialising c++ container');
            const rawLogBuffer: Buffer[] = [];
            // eslint-disable-next-line quotes
            const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${testCase.input.replace(/'/g, `'\\"`)}' | ./main`;
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
                const codeResponse = await fetchDecodedStream(loggerStream, rawLogBuffer, CPP_TIME_LIMIT);
                if(codeResponse.trim() == testCase.output.trim()) {
                    result.push({ output: codeResponse.trim(), status: 'SUCCESS', expectedOutput: testCase.output.trim() });
                }
                else {
                    result.push({ output: codeResponse.trim(), status: 'WA', expectedOutput: testCase.output.trim() });
                }
            } catch(error) {
                if(error == 'TLE') {
                    await cppDockerContainer.kill();
                    result.push({ output: 'TLE', status: 'ERROR' });
                }
                else {
                    result.push({ output: 'MLE', status: 'ERROR' });
                }
            } finally {
                await cppDockerContainer.remove();
            }
        }
        return result;
    }

}

export default CppExecutor;
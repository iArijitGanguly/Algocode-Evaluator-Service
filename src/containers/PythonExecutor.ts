import logger from '../configs/loggerConfig';
import { CodeExecutorStrategy, ExecutionResponse } from '../types/CodeExecutorStrategy';
import { TestCase } from '../types/SubmissionPayload';
import { PYTHON_IMAGE, PYTHON_TIME_LIMIT } from '../utils/constants';
import fetchDecodedStream from '../utils/fetchDecodedStream';
import createContainer from './containerFactory';
import pullImage from './pullImage';

class PythonExecutor implements CodeExecutorStrategy {
    async execute(code: string, testCases: TestCase[]): Promise<ExecutionResponse[]> {
        const result: ExecutionResponse[] = [];
        logger.info('Pulling the python image');
        await pullImage(PYTHON_IMAGE);
        
        for(const testCase of testCases) {
            logger.info('Initialising python container');
            const rawLogBuffer: Buffer[] = [];
            // eslint-disable-next-line quotes
            const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${testCase.input.replace(/'/g, `'\\"`)}' | python3 test.py`;
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
                const codeResponse = await fetchDecodedStream(loggerStream, rawLogBuffer, PYTHON_TIME_LIMIT);
                if(codeResponse.trim() == testCase.output.trim()) {
                    result.push({ output: codeResponse.trim(), status: 'SUCCESS', expectedOutput: testCase.output.trim() });
                }
                else {
                    result.push({ output: codeResponse.trim(), status: 'WA', expectedOutput: testCase.output.trim() });
                }
            } catch(error) {
                if(error == 'TLE') {
                    await pythonDockerContainer.kill();
                    result.push({ output: 'TLE', status: 'ERROR' });
                }
                else {
                    result.push({ output: 'MLE', status: 'ERROR' });
                }
            } finally {
                await pythonDockerContainer.remove();
            }
        }
        return result;
    }

}

export default PythonExecutor;
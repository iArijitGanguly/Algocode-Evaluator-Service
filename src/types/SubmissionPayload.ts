export type TestCase = {
    input: string,
    output: string
};

export type SubmissionPayload = {
    language: string,
    code: string,
    testCases: TestCase[]
    userId: string,
    submissionId: string
}
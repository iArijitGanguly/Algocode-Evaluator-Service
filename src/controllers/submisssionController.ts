import { Request, Response } from 'express';

import { CreateSubmissionDto } from '../dtos/CreateSubmissionDto';

export default function addSubmission(req: Request, res: Response) {
    const submissionRequest = req.body as CreateSubmissionDto;

    return res.status(200).json({
        success: true,
        message: 'Successfull',
        error: {},
        data: submissionRequest
    });
}
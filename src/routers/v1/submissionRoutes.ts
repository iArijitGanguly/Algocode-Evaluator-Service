import express from 'express';

import addSubmission from '../../controllers/submisssionController';
import { createSubmissionZodSchema } from '../../dtos/CreateSubmissionDto';
import { validator } from '../../validators/submissionValidator';

const submissionRouter = express.Router();

submissionRouter.post('/', validator(createSubmissionZodSchema), addSubmission);

export default submissionRouter;
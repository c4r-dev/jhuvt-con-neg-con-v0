// models/Submission.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface for the ControlSelection as defined in page.tsx
interface IControlSelection {
  value: string;
  description: string;
}

// Interface for the Submission document
interface ISubmission extends Document {
  questionId: number;
  newControlSelections: IControlSelection[][];
  createdAt: Date;
}

const ControlSelectionSchema: Schema = new Schema({
  value: { type: String, required: true },
  description: { type: String, required: false }, // Description is not always required
}, { _id: false }); // Do not create default _id for subdocuments

const SubmissionSchema: Schema = new Schema({
  questionId: { type: Number, required: true },
  newControlSelections: [[ControlSelectionSchema]], // Array of arrays using the sub-schema
  createdAt: { type: Date, default: Date.now },
});

// Use existing model if already defined, otherwise define a new one
// Specify the custom collection name in the third argument of mongoose.model()
const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema, 'negativecontrolssubmissions'); // <-- Added custom collection name here

export default Submission;
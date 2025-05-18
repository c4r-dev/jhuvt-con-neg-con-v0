// models/Submission.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface for the ControlSelection as defined in page.tsx
interface IControlSelection {
  value: string;
  description: string;
}

// Interface for the Submission document (now representing a single new control column)
interface ISubmission extends Document {
  questionId: number;
  newControlSelections: IControlSelection[]; // Changed to array of IControlSelection
  createdAt: Date;
}

const ControlSelectionSchema: Schema = new Schema({
  value: { type: String, required: true },
  description: { type: String, required: false }, // Description is not always required
}, { _id: false }); // Do not create default _id for subdocuments

const SubmissionSchema: Schema = new Schema({
  questionId: { type: Number, required: true },
  newControlSelections: [ControlSelectionSchema], // Changed to array of ControlSelectionSchema
  createdAt: { type: Date, default: Date.now },
});

// Use existing model if already defined, otherwise define a new one
const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema, 'negativecontrolssubmissions'); // Keep custom collection name

export default Submission;
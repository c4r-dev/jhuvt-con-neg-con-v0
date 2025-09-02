// models/Submission.ts - FIXED VERSION
import mongoose, { Document, Schema } from 'mongoose';

// Interface for the ControlSelection as defined in page.tsx
interface IControlSelection {
  value: string;
  description?: string; // Made optional since it's not always required
  color?: string; // Added color field for DIFFERENT selections
}

// Interface for the Submission document (now representing a single new control column)
interface ISubmission extends Document {
  questionId: number;
  newControlSelections: IControlSelection[];
  controlName: string;
  sessionId: string; // Make sure this is required
  createdAt: Date;
}

const ControlSelectionSchema: Schema = new Schema({
  value: { type: String, required: true },
  description: { type: String, required: false },
  color: { type: String, required: false }
}, { _id: false });

const SubmissionSchema: Schema = new Schema({
  questionId: { 
    type: Number, 
    required: true 
  },
  newControlSelections: [ControlSelectionSchema],
  controlName: { 
    type: String, 
    required: true, 
    default: 'NEW CONTROL' 
  },
  sessionId: { 
    type: String, 
    required: false,  // Make this optional for individual mode
    index: true       // Add index for better query performance
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Add schema options to ensure all fields are included
  minimize: false,  // Don't remove empty objects/arrays
  strict: true      // Only save fields defined in schema
});

// Add a pre-save hook to validate sessionId when provided
SubmissionSchema.pre('save', function(this: ISubmission, next) {
  // Only validate sessionId if it's provided
  if (this.sessionId !== undefined && this.sessionId !== null && this.sessionId.trim() === '') {
    const error = new Error('SessionId cannot be empty when provided');
    return next(error);
  }
  // Trim sessionId if provided
  if (this.sessionId) {
    this.sessionId = this.sessionId.trim();
  }
  next();
});

// IMPORTANT: Delete the existing model to force recreation
// This is necessary because Mongoose caches models
if (mongoose.models.Submission) {
  delete mongoose.models.Submission;
}

// Create the model with explicit collection name
const Submission = mongoose.model<ISubmission>(
  'Submission', 
  SubmissionSchema, 
  'negativecontrolssubmissions' // Your custom collection name
);

export default Submission;
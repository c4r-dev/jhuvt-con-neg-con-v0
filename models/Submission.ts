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
    required: true,  // Make this required
    index: true      // Add index for better query performance
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

// Add a pre-save hook to ensure sessionId is not empty
SubmissionSchema.pre('save', function(this: ISubmission, next) {
  if (!this.sessionId || this.sessionId.trim() === '') {
    const error = new Error('SessionId is required and cannot be empty');
    return next(error);
  }
  // Trim sessionId to remove whitespace
  this.sessionId = this.sessionId.trim();
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
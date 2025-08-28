// types/index.ts

export interface MethodologicalConsideration {
  feature: string;
  description: string;
  option1: string;
  option1Text: string;
  absent: string;
}

export interface ControlSelection {
  value: string;
  description: string;
  color?: string;
}

export interface Question {
  id: number;
  question: string;
  independentVariable: string;
  dependentVariable: string;
  methodologicalConsiderations?: MethodologicalConsideration[];
}

export interface FetchedSubmission {
  _id: string; // MongoDB document ID
  questionId: number;
  newControlSelections: ControlSelection[]; // Each document is one column
  controlName: string; // Name of the control column
  createdAt: string; // Or Date, depending on how you want to handle it on the client
}
// types/index.ts

export interface MethodologicalConsideration {
  feature: string;
  description: string;
  option1: string;
  option2: string;
  option3: string;
  absent: string;
}

export interface ControlSelection {
  value: string;
  description: string;
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
  createdAt: string; // Or Date, depending on how you want to handle it on the client
}
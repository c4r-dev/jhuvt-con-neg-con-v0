// app/api/submit-control-data/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST(request: Request) {
  await dbConnect(); // Connect to MongoDB

  try {
    // Expect a single questionId and a single array for newControlSelections (representing one column)
    const { questionId, newControlSelections } = await request.json();

    // Validate incoming data structure: questionId must be a number, newControlSelections must be an array
    if (typeof questionId !== 'number' || !Array.isArray(newControlSelections)) {
       return NextResponse.json({ success: false, error: 'Invalid data structure. Expected questionId (number) and newControlSelections (array).' }, { status: 400 });
    }

    // Further validation: check if newControlSelections array contains objects with value and description
     const isValidSelectionArray = newControlSelections.every(item =>
        typeof item === 'object' && item !== null && 'value' in item && typeof item.value === 'string' && ('description' in item ? typeof item.description === 'string' : true)
     );

    if (!isValidSelectionArray) {
         return NextResponse.json({ success: false, error: 'Invalid data structure within newControlSelections array. Each item must be an object with a string "value".' }, { status: 400 });
    }

    // Create and save a new document for this single column
    const newSubmission = await Submission.create({
      questionId,
      newControlSelections, // This is now the single column array received
    });

    return NextResponse.json({ success: true, data: newSubmission }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error saving submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving submission.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
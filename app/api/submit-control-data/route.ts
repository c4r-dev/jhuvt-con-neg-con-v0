// app/api/submit-control-data/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST(request: Request) {
  await dbConnect(); // Connect to MongoDB

  try {
    const { questionId, newControlSelections } = await request.json();

    if (questionId === undefined || !newControlSelections) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    const newSubmission = await Submission.create({
      questionId,
      newControlSelections,
    });

    return NextResponse.json({ success: true, data: newSubmission }, { status: 201 });
  } catch (error: unknown) { // Changed type to unknown
    console.error('Error saving submission:', error);
    // Safely access error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
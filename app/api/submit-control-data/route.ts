// app/api/submit-control-data/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; // Adjust the path if necessary
import Submission from '../../../models/Submission'; // Adjust the path if necessary

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
  } catch (error: any) {
    console.error('Error saving submission:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
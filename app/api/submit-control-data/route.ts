

// app/api/submit-control-data/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Extract data from request body
    const { questionId, newControlSelections, controlName, sessionId } = body;

    // Validate required fields
    if (!questionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Question ID is required' 
      }, { status: 400 });
    }

    if (!newControlSelections || !Array.isArray(newControlSelections)) {
      return NextResponse.json({ 
        success: false, 
        error: 'New control selections are required and must be an array' 
      }, { status: 400 });
    }

    // For individual mode, don't require sessionId but set it to null/undefined 
    // so the query in get-submissions can handle it properly
    const submissionData = {
      questionId,
      newControlSelections,
      controlName: controlName || 'NEW CONTROL',
      sessionId: sessionId || undefined // For individual mode, this will be undefined
    };

    // Create the submission
    const newSubmission = await Submission.create(submissionData);

    return NextResponse.json({
      success: true,
      message: 'Control data submitted successfully',
      data: newSubmission.toObject()
    });

  } catch (error: unknown) {
    console.error('Error submitting control data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during submission';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: 500 });
  }
}
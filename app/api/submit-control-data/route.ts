

// app/api/test-new-submission/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    

    // Test the fixed model
    const submissionData = {
      questionId: body.questionId || 888,
      newControlSelections: body.newControlSelections || [
        { value: 'test-value', description: 'Test description' }
      ],
      controlName: body.controlName || 'TEST_CONTROL_WITH_SESSION',
      sessionId: body.sessionId || 'test_session_fixed_model'
    };


    // Create using the fixed model
    const newSubmission = await Submission.create(submissionData);
    

    // Verify it exists with sessionId
    const verification = await Submission.findById(newSubmission._id);
    const verificationObject = verification ? verification.toObject() : null;
    

    // Test querying by sessionId
    const queryTest = await Submission.find({ 
      sessionId: submissionData.sessionId 
    });
    

    return NextResponse.json({
      success: true,
      message: 'Submission successful',
      data: newSubmission.toObject(),
      verification: verificationObject,
      hasSessionIdField: verificationObject !== null && 'sessionId' in verificationObject,
      queryBySessionIdCount: queryTest.length,
      sessionIdValue: verificationObject?.sessionId
    });

  } catch (error: unknown) {
    console.error('❌ Test submission failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Test failed';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

//if you want to clear the database before testing 
// use this api - POST http://localhost:3002/api/cleanup-database
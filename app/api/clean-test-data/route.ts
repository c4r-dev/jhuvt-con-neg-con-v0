import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST() {
  await dbConnect();

  try {
    // Remove test submissions
    const deleteResult = await Submission.deleteMany({
      $or: [
        { controlName: /TEST/i },
        { controlName: /SCHEMA_TEST/i },
        { sessionId: /test_/i },
        { sessionId: /migrated_/i }
      ]
    });

    return NextResponse.json({
      success: true,
      message: 'Test data cleaned up',
      deletedCount: deleteResult.deletedCount
    });

  } catch (error: unknown) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Cleanup failed';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
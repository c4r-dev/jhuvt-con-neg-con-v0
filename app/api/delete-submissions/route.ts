// app/api/delete-submissions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { submissionIds } = body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No submission IDs provided' 
      }, { status: 400 });
    }

    console.log('🗑️ Deleting submissions with IDs:', submissionIds);

    // Delete submissions by their MongoDB _id values
    const deleteResult = await Submission.deleteMany({
      _id: { $in: submissionIds }
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} submissions`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} submissions`,
      deletedCount: deleteResult.deletedCount
    });

  } catch (error: unknown) {
    console.error('❌ Error deleting submissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while deleting submissions.';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
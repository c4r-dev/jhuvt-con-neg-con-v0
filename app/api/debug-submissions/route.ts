// app/api/debug-submissions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function GET() {
  await dbConnect();

  try {
    // Get all submissions with their sessionId field status
    const allSubmissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(25) // Get last 25 for analysis
      .lean()
      .exec();

    // Analyze sessionId field in each submission
    const analysis = allSubmissions.map((submission, index) => ({
      index: index + 1,
      _id: submission._id,
      createdAt: submission.createdAt,
      controlName: submission.controlName,
      questionId: submission.questionId,
      sessionId: submission.sessionId,
      sessionId_type: typeof submission.sessionId,
      sessionId_exists: 'sessionId' in submission,
      sessionId_hasValue: Boolean(submission.sessionId),
      sessionId_length: submission.sessionId?.length || 0,
      // Show the actual raw data structure
      raw_keys: Object.keys(submission)
    }));

    // Get statistics
    const stats = {
      totalSubmissions: allSubmissions.length,
      withSessionId: allSubmissions.filter(s => s.sessionId).length,
      withoutSessionId: allSubmissions.filter(s => !s.sessionId).length,
      nullSessionId: allSubmissions.filter(s => s.sessionId === null).length,
      undefinedSessionId: allSubmissions.filter(s => s.sessionId === undefined).length,
      emptyStringSessionId: allSubmissions.filter(s => s.sessionId === '').length,
      uniqueSessionIds: [...new Set(allSubmissions.map(s => s.sessionId).filter(Boolean))]
    };

    // Check the database schema
    const sampleSubmission = allSubmissions[0];
    const schemaInfo = sampleSubmission ? {
      hasSessionIdField: 'sessionId' in sampleSubmission,
      allFields: Object.keys(sampleSubmission),
      sessionIdValue: sampleSubmission.sessionId,
      sessionIdType: typeof sampleSubmission.sessionId
    } : null;

    // Get distinct sessionIds (including null/undefined)
    const distinctSessionIds = await Submission.aggregate([
      {
        $group: {
          _id: "$sessionId",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return NextResponse.json({
      success: true,
      message: "Diagnostic analysis of submissions",
      totalInDb: await Submission.countDocuments({}),
      stats,
      schemaInfo,
      distinctSessionIds,
      sampleSubmissions: analysis.slice(0, 10), // Show first 10 for review
      allAnalysis: analysis, // Full analysis
      possibleIssues: [
        stats.withoutSessionId > 0 ? "Some submissions don't have sessionId values" : null,
        stats.nullSessionId > 0 ? "Some submissions have null sessionId" : null,
        stats.emptyStringSessionId > 0 ? "Some submissions have empty string sessionId" : null,
        stats.uniqueSessionIds.length === 0 ? "No valid sessionIds found in database" : null
      ].filter(Boolean)
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in diagnostic API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}


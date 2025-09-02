// // app/api/get-submissions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; // Adjust the path if necessary
import Submission from '../../../models/Submission'; // Adjust the path if necessary

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // Get all unique sessionIds in the database for debugging
    const allSessionIds = await Submission.distinct('sessionId');

    let query = {};
    let submissions;
    let totalCount = 0;

    if (sessionId) {
      const cleanSessionId = sessionId.trim();

      // Handle special case for 'individual' sessions
      if (cleanSessionId === 'individual') {
        query = { 
          $or: [
            { sessionId: { $exists: false } },
            { sessionId: null },
            { sessionId: 'individual' }
          ]
        };
      } else {
        query = { sessionId: cleanSessionId };
      }
      
      // Get total count for pagination
      totalCount = await Submission.countDocuments(query);
      
      // Try exact match first
      submissions = await Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // If no results, try case-insensitive search
      if (submissions.length === 0) {
        const caseInsensitiveQuery = { sessionId: new RegExp(`^${cleanSessionId}$`, 'i') };
        submissions = await Submission.find(caseInsensitiveQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
      }

    } else {
      // No sessionId provided - get recent submissions
      totalCount = await Submission.countDocuments({});
      submissions = await Submission.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      sessionId: sessionId || null,
      count: submissions.length,
      debug: {
        requestedSessionId: sessionId,
        allSessionIdsInDb: allSessionIds,
        totalSubmissions: await Submission.countDocuments({})
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error fetching submissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching submissions.';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}




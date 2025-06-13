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

    console.log('=== GET REQUEST DEBUG ===');
    console.log('Requested sessionId:', sessionId);
    console.log('sessionId type:', typeof sessionId);
    console.log('sessionId length:', sessionId?.length);

    // Get all unique sessionIds in the database for debugging
    const allSessionIds = await Submission.distinct('sessionId');
    console.log('All sessionIds in database:', allSessionIds);
    console.log('Total submissions in database:', await Submission.countDocuments({}));

    // Show recent submissions for debugging
    const recentSubmissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('sessionId controlName createdAt')
      .lean();
    console.log('Recent submissions:', JSON.stringify(recentSubmissions, null, 2));

    let query = {};
    let submissions;
    let totalCount = 0;

    if (sessionId) {
      const cleanSessionId = sessionId.trim();
      console.log('Clean sessionId for query:', cleanSessionId);

      // Handle special case for 'individual' sessions
      if (cleanSessionId === 'individual') {
        query = { sessionId: { $exists: false } };
      } else {
        query = { sessionId: cleanSessionId };
      }
      
      console.log('Query object:', JSON.stringify(query, null, 2));
      
      // Get total count for pagination
      totalCount = await Submission.countDocuments(query);
      console.log('Total count for query:', totalCount);
      
      // Try exact match first
      submissions = await Submission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      console.log(`Found ${submissions.length} submissions for sessionId: ${cleanSessionId}`);

      // If no results, try case-insensitive search
      if (submissions.length === 0) {
        console.log('No exact matches, trying case-insensitive search...');
        const caseInsensitiveQuery = { sessionId: new RegExp(`^${cleanSessionId}$`, 'i') };
        submissions = await Submission.find(caseInsensitiveQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
        console.log(`Case-insensitive search found: ${submissions.length} submissions`);
      }

      // If still no results, check for partial matches (debugging)
      if (submissions.length === 0) {
        console.log('No results found, checking for partial matches...');
        const partialMatches = await Submission.find({ 
          sessionId: new RegExp(cleanSessionId, 'i') 
        }).limit(5).select('sessionId').lean();
        console.log('Partial matches:', partialMatches);
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
      
      console.log(`Found ${submissions.length} recent submissions`);
    }

    console.log('========================');

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




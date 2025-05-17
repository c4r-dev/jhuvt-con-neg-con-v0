// app/api/get-submissions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb'; // Adjust the path if necessary
import Submission from '../../../models/Submission'; // Adjust the path if necessary

export async function GET() {
  await dbConnect(); // Connect to MongoDB

  try {
    // Find the last 30 submissions, sorted by createdAt in descending order
    const submissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .exec();

    // We need to convert Mongoose documents to plain JavaScript objects
    // This is important when passing data from server components/API routes
    // to client components to avoid potential serialization issues.
    const plainSubmissions = submissions.map(submission => submission.toObject());


    return NextResponse.json({ success: true, data: plainSubmissions }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error fetching submissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching submissions.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
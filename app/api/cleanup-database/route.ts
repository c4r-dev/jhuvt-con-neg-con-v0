// app/api/cleanup-database/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Submission from '../../../models/Submission';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { action, confirmationCode } = await request.json();

    // Safety check - require confirmation code to prevent accidental deletion
    if (action === 'delete-all' && confirmationCode !== 'DELETE_ALL_SUBMISSIONS_CONFIRMED') {
      return NextResponse.json({
        success: false,
        error: 'Invalid confirmation code. Use "DELETE_ALL_SUBMISSIONS_CONFIRMED" to confirm deletion.',
        warning: 'This will permanently delete ALL submissions from your database!'
      }, { status: 400 });
    }

    // Get current database stats before cleanup
    const beforeStats = {
      totalSubmissions: await Submission.countDocuments({}),
      submissionsWithSessionId: await Submission.countDocuments({ sessionId: { $exists: true, $ne: null } }),
      submissionsWithoutSessionId: await Submission.countDocuments({ sessionId: { $exists: false } }),
      uniqueSessionIds: await Submission.distinct('sessionId')
    };

    console.log('📊 Database stats before cleanup:', beforeStats);

    let result = {};

    switch (action) {
      case 'delete-all':
        // Delete ALL submissions
        console.log('🗑️ Deleting ALL submissions...');
        const deleteAllResult = await Submission.deleteMany({});
        
        result = {
          action: 'delete-all',
          deletedCount: deleteAllResult.deletedCount,
          message: `Successfully deleted all ${deleteAllResult.deletedCount} submissions`
        };
        break;

      case 'delete-without-sessionid':
        // Delete only submissions without sessionId (the junk data)
        console.log('🗑️ Deleting submissions without sessionId...');
        const deleteJunkResult = await Submission.deleteMany({
          $or: [
            { sessionId: { $exists: false } },
            { sessionId: null },
            { sessionId: '' }
          ]
        });
        
        result = {
          action: 'delete-without-sessionid',
          deletedCount: deleteJunkResult.deletedCount,
          message: `Successfully deleted ${deleteJunkResult.deletedCount} submissions without sessionId`
        };
        break;

      case 'delete-test-data':
        // Delete test/temporary data
        console.log('🗑️ Deleting test data...');
        const deleteTestResult = await Submission.deleteMany({
          $or: [
            { controlName: /TEST/i },
            { controlName: /SCHEMA_TEST/i },
            { controlName: /DEBUG/i },
            { sessionId: /test_/i },
            { sessionId: /migrated_/i },
            { sessionId: /debug_/i },
            { questionId: { $gte: 888 } } // Test question IDs
          ]
        });
        
        result = {
          action: 'delete-test-data',
          deletedCount: deleteTestResult.deletedCount,
          message: `Successfully deleted ${deleteTestResult.deletedCount} test submissions`
        };
        break;

      case 'delete-old-data':
        // Delete data older than a specific date
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        console.log('🗑️ Deleting submissions older than 30 days...');
        const deleteOldResult = await Submission.deleteMany({
          createdAt: { $lt: thirtyDaysAgo }
        });
        
        result = {
          action: 'delete-old-data',
          deletedCount: deleteOldResult.deletedCount,
          cutoffDate: thirtyDaysAgo,
          message: `Successfully deleted ${deleteOldResult.deletedCount} submissions older than 30 days`
        };
        break;

      case 'analyze-only':
        // Just analyze what would be deleted without actually deleting
        const analysisResults = {
          totalSubmissions: beforeStats.totalSubmissions,
          submissionsWithoutSessionId: await Submission.countDocuments({
            $or: [
              { sessionId: { $exists: false } },
              { sessionId: null },
              { sessionId: '' }
            ]
          }),
          testSubmissions: await Submission.countDocuments({
            $or: [
              { controlName: /TEST/i },
              { controlName: /SCHEMA_TEST/i },
              { controlName: /DEBUG/i },
              { sessionId: /test_/i },
              { sessionId: /migrated_/i },
              { sessionId: /debug_/i },
              { questionId: { $gte: 888 } }
            ]
          }),
          oldSubmissions: await Submission.countDocuments({
            createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }),
          recentSubmissions: await Submission.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('_id createdAt controlName sessionId questionId')
            .lean()
        };

        result = {
          action: 'analyze-only',
          analysis: analysisResults,
          recommendations: [
            analysisResults.submissionsWithoutSessionId > 0 ? 
              `${analysisResults.submissionsWithoutSessionId} submissions without sessionId (likely junk data)` : null,
            analysisResults.testSubmissions > 0 ? 
              `${analysisResults.testSubmissions} test submissions` : null,
            analysisResults.oldSubmissions > 0 ? 
              `${analysisResults.oldSubmissions} submissions older than 30 days` : null
          ].filter(Boolean),
          message: 'Analysis completed - no data was deleted'
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: delete-all, delete-without-sessionid, delete-test-data, delete-old-data, or analyze-only'
        }, { status: 400 });
    }

    // Get stats after cleanup
    const afterStats = {
      totalSubmissions: await Submission.countDocuments({}),
      submissionsWithSessionId: await Submission.countDocuments({ sessionId: { $exists: true, $ne: null } }),
      uniqueSessionIds: await Submission.distinct('sessionId')
    };

    console.log('📊 Database stats after cleanup:', afterStats);

    return NextResponse.json({
      success: true,
      ...result,
      beforeStats,
      afterStats,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('❌ Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Cleanup failed';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET method to safely analyze the database without making changes
export async function GET() {
  await dbConnect();

  try {
    const stats = {
      totalSubmissions: await Submission.countDocuments({}),
      submissionsWithSessionId: await Submission.countDocuments({ 
        $and: [
          { sessionId: { $exists: true } },
          { sessionId: { $ne: null } },
          { sessionId: { $ne: '' } }
        ]
      }),
      submissionsWithoutSessionId: await Submission.countDocuments({
        $or: [
          { sessionId: { $exists: false } },
          { sessionId: null },
          { sessionId: '' }
        ]
      }),
      testSubmissions: await Submission.countDocuments({
        $or: [
          { controlName: /TEST/i },
          { controlName: /SCHEMA_TEST/i },
          { controlName: /DEBUG/i },
          { sessionId: /test_/i },
          { sessionId: /migrated_/i },
          { sessionId: /debug_/i },
          { questionId: { $gte: 888 } }
        ]
      }),
      oldSubmissions: await Submission.countDocuments({
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      uniqueSessionIds: await Submission.distinct('sessionId'),
      recentSubmissions: await Submission.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id createdAt controlName sessionId questionId')
        .lean()
    };

    return NextResponse.json({
      success: true,
      message: 'Database analysis completed',
      stats,
      cleanupOptions: {
        'delete-all': {
          description: 'Delete ALL submissions (requires confirmation)',
          wouldDelete: stats.totalSubmissions,
          warning: 'This is irreversible!'
        },
        'delete-without-sessionid': {
          description: 'Delete submissions without sessionId (junk data)',
          wouldDelete: stats.submissionsWithoutSessionId,
          recommended: stats.submissionsWithoutSessionId > 0
        },
        'delete-test-data': {
          description: 'Delete test/debug submissions',
          wouldDelete: stats.testSubmissions,
          recommended: stats.testSubmissions > 0
        },
        'delete-old-data': {
          description: 'Delete submissions older than 30 days',
          wouldDelete: stats.oldSubmissions,
          recommended: stats.oldSubmissions > 0
        }
      }
    });

  } catch (error: unknown) {
    console.error('❌ Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
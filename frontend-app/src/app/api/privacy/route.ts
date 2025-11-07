import { NextRequest, NextResponse } from 'next/server';
import { createAPIResponse } from '@/lib/validation';
import { gdprAPI, dpo } from '@/lib/compliance';

/**
 * GET /api/privacy/data - Access personal data (GDPR Article 15)
 *
 * Allows users to access all personal data held about them
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');

    if (!subjectId) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'MISSING_SUBJECT_ID',
        message: 'Subject ID is required to access personal data',
        details: 'Please provide your subject ID from previous interactions'
      }), { status: 400 });
    }

    const result = await gdprAPI.handleDataAccess(subjectId);

    if (!result.success) {
      return NextResponse.json(createAPIResponse(false, undefined, result.error), { status: 404 });
    }

    return NextResponse.json(createAPIResponse(true, result.data));

  } catch (error) {
    console.error('Privacy data access error:', error);
    return NextResponse.json(createAPIResponse(false, undefined, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to access privacy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

/**
 * DELETE /api/privacy/data - Erase personal data (GDPR Right to Erasure)
 *
 * Allows users to request deletion of their personal data
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');
    const confirmation = searchParams.get('confirm') === 'true';

    if (!subjectId) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'MISSING_SUBJECT_ID',
        message: 'Subject ID is required for data erasure',
        details: 'Please provide your subject ID'
      }), { status: 400 });
    }

    if (!confirmation) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'CONFIRMATION_REQUIRED',
        message: 'Data erasure requires explicit confirmation',
        details: 'Add ?confirm=true to confirm data erasure'
      }), { status: 400 });
    }

    const result = await gdprAPI.handleDataErasure(subjectId);

    if (!result.success) {
      return NextResponse.json(createAPIResponse(false, undefined, {
        code: 'ERASURE_FAILED',
        message: 'Data erasure failed',
        details: 'Unable to erase data for the provided subject ID'
      }), { status: 400 });
    }

    return NextResponse.json(createAPIResponse(true, {
      message: 'Data erasure completed successfully',
      erasedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Privacy data erasure error:', error);
    return NextResponse.json(createAPIResponse(false, undefined, {
      code: 'INTERNAL_ERROR',
      message: 'Failed to erase privacy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}
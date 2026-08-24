import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scanId: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { scanId } = await context.params;

    const scan = await db.query.scans.findFirst({
      where: eq(scans.id, scanId),
      columns: {
        screenshotBase64: true
      }
    });

    if (!scan || !scan.screenshotBase64) {
      return new NextResponse('Screenshot not found', { status: 404 });
    }

    // Convert Base64 string to Buffer, safely handling any data: URI prefixes
    const rawBase64 = scan.screenshotBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const imageBuffer = Buffer.from(rawBase64, 'base64');

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving screenshot:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

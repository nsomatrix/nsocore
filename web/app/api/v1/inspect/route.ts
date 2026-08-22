import { NextResponse } from 'next/server';

// Global queue to persist pending target inspections across warm Vercel serverless Lambdas
const globalStore = globalThis as unknown as { _pendingInspectQueue?: string[] };
if (!globalStore._pendingInspectQueue) {
  globalStore._pendingInspectQueue = [];
}

export async function GET() {
  const target = globalStore._pendingInspectQueue?.shift() || null;
  return NextResponse.json({
    status: 200,
    target: target
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { status: 400, error: 'Valid player name string required' },
        { status: 400 }
      );
    }

    const targetName = body.name.trim();
    if (!globalStore._pendingInspectQueue?.includes(targetName)) {
      globalStore._pendingInspectQueue?.push(targetName);
    }

    console.log(`[NSO-MATRIX-REST] Remote inspect trigger queued for target: "${targetName}"`);

    return NextResponse.json({
      status: 200,
      message: `Remote inspect trigger queued for "${targetName}"`,
      target: targetName
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, error: 'Failed to process inspect request' },
      { status: 500 }
    );
  }
}

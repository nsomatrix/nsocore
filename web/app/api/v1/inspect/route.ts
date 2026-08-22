import { NextResponse } from 'next/server';

let pendingInspectTarget: string | null = null;

export async function GET() {
  const target = pendingInspectTarget;
  pendingInspectTarget = null; // Clear queue after reading
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

    pendingInspectTarget = body.name.trim();
    console.log(`[NSO-MATRIX-REST] Remote inspect trigger queued for target: "${pendingInspectTarget}"`);

    return NextResponse.json({
      status: 200,
      message: `Remote inspect trigger queued for "${pendingInspectTarget}"`,
      target: pendingInspectTarget
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, error: 'Failed to process inspect request' },
      { status: 500 }
    );
  }
}

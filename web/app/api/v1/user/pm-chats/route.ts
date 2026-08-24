import { NextResponse } from 'next/server';
import { getUserPmMessages, appendUserPmMessage, clearUserPmMessages } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ status: 400, error: 'Missing userId parameter' }, { status: 400 });
  }

  const pmMessages = getUserPmMessages(userId);
  return NextResponse.json({ status: 200, pmMessages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, sender, recipient, message } = body;

    if (!userId || !sender || !message) {
      return NextResponse.json({ status: 400, error: 'Missing required PM message fields' }, { status: 400 });
    }

    const pmMessages = appendUserPmMessage(userId, { sender, recipient, message, channel: 'PRIVATE' });
    return NextResponse.json({ status: 201, pmMessages });
  } catch (err: any) {
    return NextResponse.json({ status: 500, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ status: 400, error: 'Missing userId parameter' }, { status: 400 });
  }

  const pmMessages = clearUserPmMessages(userId);
  return NextResponse.json({ status: 200, message: 'PM history cleared', pmMessages });
}

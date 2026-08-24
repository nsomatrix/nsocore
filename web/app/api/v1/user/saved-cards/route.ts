import { NextResponse } from 'next/server';
import { getSavedCards, toggleSaveCard, removeSavedCard } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ status: 400, error: 'Missing userId parameter' }, { status: 400 });
  }

  const savedCards = getSavedCards(userId);
  return NextResponse.json({ status: 200, savedCards });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, player } = body;

    if (!userId || !player || !player.name) {
      return NextResponse.json({ status: 400, error: 'Missing userId or player data' }, { status: 400 });
    }

    const { savedCards, isSaved } = toggleSaveCard(userId, player);
    return NextResponse.json({ status: 200, savedCards, isSaved });
  } catch (err: any) {
    return NextResponse.json({ status: 500, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const playerName = searchParams.get('name');

  if (!userId || !playerName) {
    return NextResponse.json({ status: 400, error: 'Missing userId or name parameter' }, { status: 400 });
  }

  const savedCards = removeSavedCard(userId, playerName);
  return NextResponse.json({ status: 200, savedCards });
}

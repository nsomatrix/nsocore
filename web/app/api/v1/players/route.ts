import { NextResponse } from 'next/server';
import { getAllPlayers, saveOrUpdatePlayer } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const school = searchParams.get('school');
    const className = searchParams.get('class');

    let players = getAllPlayers() || [];

    if (query) {
      players = players.filter(p => p.name && p.name.toLowerCase().includes(query));
    }
    if (school && school !== 'All') {
      players = players.filter(p => p.school && p.school.toLowerCase() === school.toLowerCase());
    }
    if (className && className !== 'All') {
      players = players.filter(p => p.class && p.class.toLowerCase() === className.toLowerCase());
    }

    return NextResponse.json({
      status: 200,
      count: players.length,
      players: players
    });
  } catch (error: any) {
    console.error('[NSO-MATRIX-REST] GET Error:', error);
    return NextResponse.json({
      status: 500,
      error: 'Failed to retrieve player list',
      details: error.message || String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !body.name) {
      return NextResponse.json(
        { status: 400, error: 'Missing character name attribute' },
        { status: 400 }
      );
    }

    const saved = saveOrUpdatePlayer({
      name: body.name,
      level: Number(body.level) || 1,
      class: body.class || 'Unknown',
      school: body.school || 'Unknown',
      hp: Number(body.hp) || 0,
      maxHp: Number(body.maxHp) || 0,
      mp: Number(body.mp) || 0,
      maxMp: Number(body.maxMp) || 0,
      speed: Number(body.speed) || 0,
      attackMin: Number(body.attackMin) || 0,
      attackMax: Number(body.attackMax) || 0,
      antiFire: Number(body.antiFire) || 0,
      antiIce: Number(body.antiIce) || 0,
      antiWind: Number(body.antiWind) || 0,
      reducePain: Number(body.reducePain) || 0,
      accurate: Number(body.accurate) || 0,
      dodge: Number(body.dodge) || 0,
      critical: Number(body.critical) || 0,
      counterStrike: Number(body.counterStrike) || 0,
      antiChakra: Number(body.antiChakra) || 0,
      antiChakraBack: Number(body.antiChakraBack) || 0,
    });

    console.log(`[NSO-MATRIX-REST] Live inspection payload received for player: ${saved.name} (Lvl ${saved.level})`);

    return NextResponse.json({
      status: 201,
      message: 'Player stats successfully stored',
      player: saved
    }, { status: 201 });
  } catch (error: any) {
    console.error('[NSO-MATRIX-REST] Error processing POST player stats:', error);
    return NextResponse.json(
      { status: 500, error: 'Internal Server Error', details: error.message || String(error) },
      { status: 500 }
    );
  }
}

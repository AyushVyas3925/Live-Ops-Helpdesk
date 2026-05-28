import { NextResponse } from 'next/server';
import { SEED_TICKETS } from '@/lib/seedTickets';

export async function GET() {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${socketUrl}/api/tickets`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch from socket server');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ tickets: SEED_TICKETS });
  }
}

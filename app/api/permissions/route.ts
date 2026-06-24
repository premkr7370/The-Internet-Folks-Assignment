import { NextResponse } from 'next/server';
import { PERMISSION_GROUPS } from '@/lib/data/permissions';

export async function GET() {
  return NextResponse.json({ data: PERMISSION_GROUPS, success: true });
}

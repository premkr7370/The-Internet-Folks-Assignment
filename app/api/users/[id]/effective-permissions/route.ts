import { NextRequest, NextResponse } from 'next/server';
import { computeEffectivePermissions } from '@/lib/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = computeEffectivePermissions(id);

  if (!result) {
    return NextResponse.json(
      { success: false, message: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: result, success: true });
}

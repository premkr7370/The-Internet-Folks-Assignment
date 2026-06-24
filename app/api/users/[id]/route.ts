import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getRoleById } from '@/lib/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getUserById(id);
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const roles = user.roleIds
    .map((rid) => getRoleById(rid))
    .filter(Boolean);

  return NextResponse.json({
    data: { ...user, roles },
    success: true,
  });
}

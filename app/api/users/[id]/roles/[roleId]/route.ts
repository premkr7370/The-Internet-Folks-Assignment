import { NextRequest, NextResponse } from 'next/server';
import { removeRoleFromUser } from '@/lib/data/store';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  const { id, roleId } = await params;

  const user = removeRoleFromUser(id, roleId);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'User or role not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: user, success: true });
}

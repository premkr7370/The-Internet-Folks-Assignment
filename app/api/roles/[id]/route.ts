import { NextRequest, NextResponse } from 'next/server';
import { getRoleById, updateRole, deleteRole, getUserCountForRole } from '@/lib/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const role = getRoleById(id);
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  return NextResponse.json({
    data: { ...role, userCount: getUserCountForRole(role.id) },
    success: true,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateRole(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ data: updated, success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteRole(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  return NextResponse.json({ data: null, success: true });
}

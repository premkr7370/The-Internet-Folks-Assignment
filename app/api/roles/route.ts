import { NextRequest, NextResponse } from 'next/server';
import { getRoles, createRole, getUserCountForRole } from '@/lib/data/store';

export async function GET() {
  const roles = getRoles();
  const rolesWithCounts = roles.map((role) => ({
    ...role,
    userCount: getUserCountForRole(role.id),
  }));
  return NextResponse.json({ data: rolesWithCounts, success: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: 'Name and permissions are required' },
        { status: 400 }
      );
    }

    const role = createRole({ name, description: description || '', permissions });
    return NextResponse.json({ data: role, success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    );
  }
}

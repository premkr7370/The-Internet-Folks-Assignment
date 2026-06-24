import { NextResponse } from 'next/server';
import { getUsers, getRoleById } from '@/lib/data/store';

export async function GET() {
  const users = getUsers();
  const usersWithRoles = users.map((user) => ({
    ...user,
    roles: user.roleIds
      .map((rid) => getRoleById(rid))
      .filter(Boolean)
      .map((r) => ({ id: r!.id, name: r!.name })),
  }));
  return NextResponse.json({ data: usersWithRoles, success: true });
}

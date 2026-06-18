import { NextResponse } from 'next/server';
import { getUserFromBearerToken } from '@/lib/auth/requestAuth';

export async function GET(request: Request) {
  const user = getUserFromBearerToken(request);

  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized. Valid access token required.' },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    module: 'code-practice',
    userId: user.userId,
    email: user.email,
    role: user.role,
    sessionStartedAt: new Date().toISOString(),
    track: {
      name: 'DSA Interview Prep',
      totalProblems: 124,
      categories: 11,
    },
    message: 'Code practice session initialized.',
  });
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { username, password, remember } = await request.json();

    const { rows } = await sql<User>`SELECT * FROM users WHERE username = ${username}`;
    const user = rows[0];

    // User.password is optional in interface but required here, check for existence
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, username: user.username });

    const response = NextResponse.json({ message: '登录成功' });
    
    const cookieOptions: { httpOnly: boolean; path: string; maxAge?: number } = { httpOnly: true, path: '/' };
    if (remember) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 days
    }
    
    response.cookies.set('token', token, cookieOptions);

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '服务器内部错误', error: errorMessage }, { status: 500 });
  }
}

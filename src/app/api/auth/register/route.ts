import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: '用户名和密码不能为空' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql.sql`
      INSERT INTO users (username, password) VALUES (${username}, ${hashedPassword})
      RETURNING id
    `;

    return NextResponse.json({ message: '用户注册成功', userId: result.rows[0].id }, { status: 201 });
  } catch (error: unknown) {
    // Postgres unique violation code is 23505
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return NextResponse.json({ message: '用户名已存在' }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '服务器内部错误', error: errorMessage }, { status: 500 });
  }
}

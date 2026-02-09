import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { Fund } from '@/lib/types';

export async function GET(request: Request) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { rows } = await sql.sql<Fund>`
      SELECT * FROM funds WHERE user_id = ${user.userId} ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '获取基金列表失败', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { name, amount } = await request.json();
    if (!name || amount === undefined) {
      return NextResponse.json({ message: '基金名称和金额不能为空' }, { status: 400 });
    }

    const result = await sql.sql`
      INSERT INTO funds (name, amount, user_id) VALUES (${name}, ${amount}, ${user.userId})
      RETURNING id
    `;

    return NextResponse.json({ id: result.rows[0].id, name, amount, user_id: user.userId }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '创建基金失败', error: errorMessage }, { status: 500 });
  }
}

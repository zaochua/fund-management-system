import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { Fund, DbQueryResult, DbExecuteResult } from '@/lib/types';

export async function GET(request: Request) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query<DbQueryResult<Fund>>('SELECT * FROM funds WHERE user_id = ? ORDER BY created_at DESC', [user.userId]);
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

    const [result] = await pool.query<DbExecuteResult>(
      'INSERT INTO funds (name, amount, user_id) VALUES (?, ?, ?)',
      [name, amount, user.userId]
    );

    return NextResponse.json({ id: result.insertId, name, amount, user_id: user.userId }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '创建基金失败', error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { FundLog, DbQueryResult, DbExecuteResult } from '@/lib/types';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const [rows] = await pool.query<DbQueryResult<FundLog>>(
      'SELECT * FROM fund_logs WHERE user_id = ? ORDER BY created_at DESC',
      [auth.userId]
    );

    return NextResponse.json(rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '获取操作记录失败', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const { content, date } = await request.json();

    if (!content) {
      return NextResponse.json({ message: '内容不能为空' }, { status: 400 });
    }

    const logDate = date || new Date();

    const [result] = await pool.query<DbExecuteResult>(
      'INSERT INTO fund_logs (content, user_id, log_date) VALUES (?, ?, ?)',
      [content, auth.userId, logDate]
    );

    return NextResponse.json({ id: result.insertId, content, log_date: logDate }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '添加记录失败', error: errorMessage }, { status: 500 });
  }
}

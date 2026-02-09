import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const { content, date } = await request.json();

    if (!content) {
      return NextResponse.json({ message: '内容不能为空' }, { status: 400 });
    }

    // Ensure the log belongs to the user
    const result = await sql`
      UPDATE fund_logs SET content = ${content}, log_date = ${date} WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ message: '记录不存在或无权修改' }, { status: 404 });
    }

    return NextResponse.json({ id, content, log_date: date, message: '更新成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '更新记录失败', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const id = parseInt(params.id);
    
    // Ensure the log belongs to the user
    const result = await sql.sql`
      DELETE FROM fund_logs WHERE id = ${id} AND user_id = ${auth.userId}
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ message: '记录不存在或无权删除' }, { status: 404 });
    }

    return NextResponse.json({ message: '删除成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '删除记录失败', error: errorMessage }, { status: 500 });
  }
}

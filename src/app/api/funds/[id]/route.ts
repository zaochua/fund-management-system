import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { name, amount } = await request.json();
    const { id } = params;

    const result = await sql.sql`
      UPDATE funds SET name = ${name}, amount = ${amount} WHERE id = ${id} AND user_id = ${user.userId}
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ message: '基金不存在或无权操作' }, { status: 404 });
    }

    return NextResponse.json({ message: '基金更新成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '更新基金失败', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const { id } = params;

    const result = await sql.sql`
      DELETE FROM funds WHERE id = ${id} AND user_id = ${user.userId}
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ message: '基金不存在或无权操作' }, { status: 404 });
    }

    return NextResponse.json({ message: '基金删除成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '删除基金失败', error: errorMessage }, { status: 500 });
  }
}

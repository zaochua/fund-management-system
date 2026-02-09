import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { FundName } from '@/lib/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ message: '基金名称不能为空' }, { status: 400 });
    }

    // Check if exists (other than self)
    const { rows: existing } = await sql<FundName>`
      SELECT * FROM fund_names WHERE name = ${name} AND id != ${id}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ message: '该基金名称已存在' }, { status: 409 });
    }

    await sql`UPDATE fund_names SET name = ${name} WHERE id = ${id}`;
    
    return NextResponse.json({ id, name, message: '更新成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '更新基金名称失败', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await sql`DELETE FROM fund_names WHERE id = ${id}`;
    return NextResponse.json({ message: '删除成功' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '删除基金名称失败', error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { FundName } from '@/lib/types';

export async function GET() {
  try {
    const { rows } = await sql.sql<FundName>`SELECT * FROM fund_names ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '获取基金名称列表失败', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, sector } = await request.json();

    if (!name || !sector) {
      return NextResponse.json({ message: '基金名称和所属板块不能为空' }, { status: 400 });
    }

    // Check if exists
    const { rows: existing } = await sql.sql<FundName>`SELECT * FROM fund_names WHERE name = ${name}`;
    if (existing.length > 0) {
      return NextResponse.json({ message: '该基金名称已存在' }, { status: 409 });
    }

    const result = await sql.sql`INSERT INTO fund_names (name, sector) VALUES (${name}, ${sector}) RETURNING id`;
    
    return NextResponse.json({ id: result.rows[0].id, name, sector }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: '添加基金名称失败', error: errorMessage }, { status: 500 });
  }
}

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
    const { rows } = await sql<Fund>`
      SELECT name, amount FROM funds WHERE user_id = ${user.userId}
    `;

    const totalAmount = rows.reduce((acc: number, curr: Fund) => acc + parseFloat(curr.amount as string), 0);
    
    // Calculate percentages for ECharts
    const chartData = rows.map((fund: Fund) => ({
      name: fund.name,
      value: parseFloat(fund.amount as string)
    }));

    return NextResponse.json({
      totalAmount,
      chartData,
      fundsCount: rows.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '获取仪表盘数据失败', error: errorMessage }, { status: 500 });
  }
}

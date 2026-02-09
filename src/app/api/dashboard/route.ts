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
    // Join with fund_names to get sector information
    // We select sector, and sum amount.
    // If a fund name doesn't exist in fund_names (legacy data?), it might be null, so we handle that via COALESCE or just group by name if sector is null?
    // User requirement: "Group by sector".
    // We need to join funds and fund_names on funds.name = fund_names.name
    
    // First, get raw funds data to calculate total amount accurately
    const { rows: funds } = await sql.sql<Fund>`
      SELECT name, amount FROM funds WHERE user_id = ${user.userId}
    `;

    const totalAmount = funds.reduce((acc: number, curr: Fund) => acc + parseFloat(curr.amount as string), 0);

    // Now get aggregated data by sector
    // Using a left join in case the fund name in 'funds' table doesn't have a corresponding entry in 'fund_names' with a sector.
    // In that case, we can group them under 'Unknown' or 'Other'.
    const { rows: sectorData } = await sql.sql<{ sector: string; total_amount: number }>`
      SELECT 
        COALESCE(fn.sector, '其他板块') as sector, 
        SUM(f.amount) as total_amount 
      FROM funds f
      LEFT JOIN fund_names fn ON f.name = fn.name
      WHERE f.user_id = ${user.userId}
      GROUP BY COALESCE(fn.sector, '其他板块')
    `;
    
    // Calculate percentages for ECharts
    const chartData = sectorData.map((item) => ({
      name: item.sector,
      value: parseFloat(item.total_amount as unknown as string)
    }));

    return NextResponse.json({
      totalAmount,
      chartData,
      fundsCount: funds.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({ message: '获取仪表盘数据失败', error: errorMessage }, { status: 500 });
  }
}

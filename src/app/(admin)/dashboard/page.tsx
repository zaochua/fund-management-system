"use client";
import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Row, Col, Statistic, Spin, List, Typography } from "antd";
import { FundLog } from "@/lib/types";
import dayjs from "dayjs";

const { Text } = Typography;

interface DashboardData {
  totalAmount: number;
  fundsCount: number;
  chartData: { name: string; value: number }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [logs, setLogs] = useState<FundLog[]>([]);

  useEffect(() => {
    // Fetch dashboard stats
    fetch("/api/dashboard")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setData(data);
        }
      })
      .finally(() => setLoading(false));

    // Fetch logs
    setLoadingLogs(true);
    fetch("/api/daily-logs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLogs(data))
      .finally(() => setLoadingLogs(false));
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );

  // Use optional chaining or default value just in case
  const chartData = data?.chartData || [];

  const option = {
    title: {
      text: "基金持仓占比",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: ${c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "金额",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true, // 改为true以避免标签重叠
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true, // 显示标签
          position: "inside", // 标签显示在饼图内部
          formatter: "{d}%", // 只显示百分比
          fontSize: 14,
          color: "#fff",
          fontWeight: "bold",
        },
        labelLine: {
          show: false, // 不显示标签线
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        data: chartData,
      },
    ],
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>仪表盘</h2>

      <Row gutter={16}>
        {/* Left Column: Stats & Chart */}
        <Col span={16}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="总基金市值"
                  value={data?.totalAmount || 0}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic title="持有基金数量" value={data?.fundsCount || 0} />
              </Card>
            </Col>
          </Row>
          <Card title="持仓概览">
            {chartData.length > 0 ? (
              <ReactECharts option={option} style={{ height: 400 }} />
            ) : (
              <div style={{ textAlign: "center", padding: 50 }}>
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Daily Logs */}
        <Col span={8}>
          <Card
            title="每日操作记录"
            style={{ height: "100%" }}
            styles={{ body: { height: 500, overflowY: "auto" } }}
            loading={loadingLogs}
          >
            <List
              dataSource={logs}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ fontWeight: "bold" }}>
                        {dayjs(item.created_at).format("YYYY-MM-DD")}
                      </div>
                    }
                    description={
                      <div style={{ whiteSpace: "pre-wrap", color: "#555" }}>
                        {item.content}
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: "暂无操作记录" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

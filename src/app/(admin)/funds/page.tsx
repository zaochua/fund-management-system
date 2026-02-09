'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, InputNumber, message, Space, Upload, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { Fund } from '@/lib/types';
import type { RcFile } from 'antd/es/upload/interface';

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [form] = Form.useForm();
  
  // Data for cascading selection
  const [sectorOptions, setSectorOptions] = useState<{ value: string; label: string }[]>([]);
  const [fundNameData, setFundNameData] = useState<{ name: string; sector: string }[]>([]);
  const [filteredFundNames, setFilteredFundNames] = useState<{ value: string; label: string }[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/funds');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      setFunds(data);
    } catch (error) {
      message.error('获取基金列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchFundNames = async () => {
    try {
      const res = await fetch('/api/fund-names');
      if (res.ok) {
        const data: { name: string; sector: string }[] = await res.json();
        setFundNameData(data);
        
        // Extract unique sectors
        const sectors = Array.from(new Set(data.map(item => item.sector || '未分类'))).filter(Boolean);
        setSectorOptions(sectors.map(s => ({ value: s, label: s })));
      }
    } catch (error) {
      console.error('Failed to fetch fund names');
    }
  };

  useEffect(() => {
    fetchFunds();
    fetchFundNames();
  }, []);

  // Handle sector change
  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    form.setFieldsValue({ name: undefined }); // Reset fund name selection
    
    // Filter fund names based on sector
    const filtered = fundNameData
      .filter(item => (item.sector || '未分类') === sector)
      .map(item => ({ value: item.name, label: item.name }));
    setFilteredFundNames(filtered);
  };

  const handleAdd = () => {
    setEditingFund(null);
    setSelectedSector(null);
    setFilteredFundNames([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: Fund) => {
    setEditingFund(record);
    form.setFieldsValue(record);
    
    // Find the sector for this fund name to pre-fill the form
    const fundInfo = fundNameData.find(f => f.name === record.name);
    if (fundInfo && fundInfo.sector) {
      setSelectedSector(fundInfo.sector);
      form.setFieldsValue({ sector: fundInfo.sector });
      
      // Update filtered list
      const filtered = fundNameData
        .filter(item => item.sector === fundInfo.sector)
        .map(item => ({ value: item.name, label: item.name }));
      setFilteredFundNames(filtered);
    } else {
        // If not found or no sector, maybe allow selecting from all or handle gracefully
        // For now, let's just default to showing nothing or all? 
        // Or if it's editing, maybe we don't force sector selection if it's already saved?
        // But the requirement says "select sector then fund".
        // Let's try to set 'Other' if unknown.
        const sector = '未分类';
        setSelectedSector(sector);
        form.setFieldsValue({ sector });
         const filtered = fundNameData
        .filter(item => (item.sector || '未分类') === sector)
        .map(item => ({ value: item.name, label: item.name }));
         setFilteredFundNames(filtered);
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/funds/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('基金已删除');
        fetchFunds();
      } else {
        message.error('删除基金失败');
      }
    } catch (error) {
      message.error('删除基金时发生错误');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const method = editingFund ? 'PUT' : 'POST';
      const url = editingFund ? `/api/funds/${editingFund.id}` : '/api/funds';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success(`基金${editingFund ? '更新' : '添加'}成功`);
        setIsModalOpen(false);
        fetchFunds();
      } else {
        const data = await res.json();
        message.error(data.message || '操作失败');
      }
    } catch (error) {
      // Form validation error
    }
  };

  const handleExport = async () => {
    if (funds.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }
    const XLSX = await import('xlsx');
    // Convert to simple object with Chinese keys
    const dataToExport = funds.map(f => ({
      '基金名称': f.name,
      '金额': f.amount,
      '创建时间': new Date(f.created_at).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Funds");
    XLSX.writeFile(wb, "funds.xlsx");
  };

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const templateData = [
      { '基金名称': '示例基金A', '金额': 10000 },
      { '基金名称': '示例基金B', '金额': 5000 }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "fund_import_template.xlsx");
  };

  const handleImport = (file: RcFile) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (!data) return;

      try {
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          message.warning('Excel文件为空');
          return;
        }

        let successCount = 0;
        // Map Chinese keys back to English if necessary, or just read values
        // Assuming user uses the template with keys '基金名称' and '金额'
        // Also support 'name', 'amount' just in case
        for (const row of jsonData) {
          const name = row['基金名称'] || row['name'] || row['Name'];
          const amount = row['金额'] || row['amount'] || row['Amount'];

          if (name && amount) {
            try {
              await fetch('/api/funds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, amount: parseFloat(amount) }),
              });
              successCount++;
            } catch (err) {
              console.error('Import error', err);
            }
          }
        }
        message.success(`成功导入 ${successCount} 条基金记录`);
        fetchFunds();
      } catch (error) {
        message.error('解析Excel文件失败');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent upload
  };

  const columns = [
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => `$${val}`,
      sorter: (a: Fund, b: Fund) => Number(a.amount) - Number(b.amount),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Fund) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h2>基金管理</h2>
        <Space wrap>
          <Button icon={<FileExcelOutlined />} onClick={handleDownloadTemplate}>下载模版</Button>
          <Upload beforeUpload={handleImport} showUploadList={false} accept=".xlsx, .xls" disabled={importing}>
            <Button icon={<UploadOutlined />} loading={importing}>导入 Excel</Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出 Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增基金
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={funds} rowKey="id" loading={loading} />

      <Modal
        title={editingFund ? "编辑基金" : "新增基金"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="sector"
            label="所属板块"
            rules={[{ required: true, message: '请选择所属板块' }]}
          >
            <Select
              placeholder="请选择所属板块"
              options={sectorOptions}
              onChange={handleSectorChange}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="基金名称"
            rules={[{ required: true, message: '请选择基金名称' }]}
          >
            <Select
              placeholder="请选择基金名称"
              options={filteredFundNames}
              disabled={!selectedSector}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

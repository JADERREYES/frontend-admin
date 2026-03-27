import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Row, Col, Statistic, Spin, message } from 'antd';
import { DollarOutlined, UserOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title } = Typography;

const Cartera = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    cargarCartera();
  }, []);

  const cargarCartera = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cartera');
      setData(response.data);
    } catch (error) {
      message.error('Error al cargar cartera');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: 'Cliente', 
      dataIndex: 'cliente', 
      key: 'cliente',
      render: (cliente) => cliente?.nombre || 'N/A'
    },
    { 
      title: 'Préstamo', 
      dataIndex: 'total', 
      key: 'total', 
      render: v => `$${v?.toLocaleString()}` 
    },
    { 
      title: 'Pagado', 
      dataIndex: 'totalPagado', 
      key: 'totalPagado', 
      render: v => `$${v?.toLocaleString()}` 
    },
    { 
      title: 'Saldo', 
      key: 'saldo', 
      render: (_, record) => `$${((record.total || 0) - (record.totalPagado || 0)).toLocaleString()}` 
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const estadoStr = String(estado || 'activo').toUpperCase();
        const color = estadoStr === 'PAGADO' ? 'green' : estadoStr === 'ACTIVO' ? 'blue' : 'red';
        return <Tag color={color}>{estadoStr}</Tag>;
      }
    }
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  const stats = data?.stats || {};
  const prestamos = data?.prestamos || [];

  return (
    <div>
      <Title level={2}>Cartera de Créditos</Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Cartera Total" value={stats.totalCartera || 0} prefix={<DollarOutlined />} precision={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Recaudado" value={stats.totalRecaudado || 0} prefix={<DollarOutlined />} precision={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Préstamos Activos" value={stats.prestamosActivos || 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Clientes" value={stats.totalClientes || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="Lista de Préstamos">
        <Table columns={columns} dataSource={prestamos} rowKey="_id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default Cartera;
import React, { useState, useEffect } from 'react';
import { Card, Table, Statistic, Row, Col, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import api from '../api/api';

const Cartera = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCartera();
  }, []);

  const cargarCartera = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prestamos');
      setPrestamos(response.data || []);
    } catch (error) {
      message.error('Error al cargar cartera');
    } finally {
      setLoading(false);
    }
  };

  const totalCartera = prestamos.reduce((sum, p) => sum + (p.totalAPagar || p.total || 0), 0);
  const totalPagado = prestamos.reduce((sum, p) => sum + (p.totalPagado || 0), 0);

  const columns = [
    { title: 'Cliente', key: 'cliente', render: (_, record) => record.clienteId?.nombre || 'N/A' },
    { title: 'Total', key: 'total', render: (_, record) => $ },
    { title: 'Pagado', dataIndex: 'totalPagado', render: v => $ },
    { title: 'Saldo', key: 'saldo', render: (_, record) => {
      const total = record.totalAPagar || record.total || 0;
      const pagado = record.totalPagado || 0;
      return $;
    }},
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card><Statistic title="Cartera Total" value={totalCartera} prefix={<DollarOutlined />} /></Card>
        </Col>
        <Col span={12}>
          <Card><Statistic title="Total Recaudado" value={totalPagado} prefix={<DollarOutlined />} /></Card>
        </Col>
      </Row>
      <Card title="Lista de Préstamos">
        <Table columns={columns} dataSource={prestamos} rowKey="_id" loading={loading} />
      </Card>
    </div>
  );
};

export default Cartera;

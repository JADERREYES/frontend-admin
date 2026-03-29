import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, message } from 'antd';
import api from '../api/api';

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPrestamos();
  }, []);

  const cargarPrestamos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prestamos');
      setPrestamos(response.data || []);
    } catch (error) {
      message.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Cliente', key: 'cliente', render: (_, record) => record.clienteId?.nombre || 'N/A' },
    { title: 'Capital', dataIndex: 'capital', render: v => `$${v?.toLocaleString() || 0}` },
    { title: 'Estado', dataIndex: 'estado', render: e => e?.toUpperCase() || 'ACTIVO' },
  ];

  return (
    <Card title="Préstamos">
      <Button type="primary" style={{ marginBottom: 16 }}>Nuevo Préstamo</Button>
      <Table columns={columns} dataSource={prestamos} rowKey="_id" loading={loading} />
    </Card>
  );
};

export default Prestamos;
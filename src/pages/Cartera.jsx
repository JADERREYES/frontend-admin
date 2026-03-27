import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Row, Col, Statistic, Spin, message } from 'antd';
import { DollarOutlined, UserOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title } = Typography;

const Cartera = () => {
  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState([]);
  const [stats, setStats] = useState({
    totalCartera: 0,
    totalRecaudado: 0,
    prestamosActivos: 0,
    totalClientes: 0,
    totalCobradores: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar préstamos directamente
      const prestamosRes = await api.get('/prestamos');
      const prestamosData = prestamosRes.data || [];
      setPrestamos(prestamosData);
      
      // Cargar clientes
      const clientesRes = await api.get('/clientes');
      const clientesData = clientesRes.data || [];
      
      // Cargar cobradores
      const cobradoresRes = await api.get('/cobradores');
      const cobradoresData = cobradoresRes.data || [];
      
      // Calcular estadísticas
      const totalCartera = prestamosData.reduce((sum, p) => sum + (p.totalAPagar || p.total || 0), 0);
      const totalRecaudado = prestamosData.reduce((sum, p) => sum + (p.totalPagado || 0), 0);
      const prestamosActivos = prestamosData.filter(p => p.estado === 'activo').length;
      
      setStats({
        totalCartera,
        totalRecaudado,
        prestamosActivos,
        totalClientes: clientesData.length,
        totalCobradores: cobradoresData.length
      });
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      message.error('Error al cargar datos de cartera');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: 'Cliente', 
      key: 'cliente',
      render: (_, record) => {
        if (record.clienteId && typeof record.clienteId === 'object') {
          return record.clienteId.nombre || 'N/A';
        }
        return 'N/A';
      }
    },
    { 
      title: 'Capital', 
      dataIndex: 'capital', 
      key: 'capital', 
      render: v => `$${v?.toLocaleString() || 0}` 
    },
    { 
      title: 'Interés', 
      dataIndex: 'interes', 
      key: 'interes', 
      render: v => `$${v?.toLocaleString() || 0}` 
    },
    { 
      title: 'Total Préstamo', 
      key: 'total',
      render: (_, record) => `$${((record.totalAPagar || record.total) || 0).toLocaleString()}`
    },
    { 
      title: 'Pagado', 
      dataIndex: 'totalPagado', 
      key: 'totalPagado', 
      render: v => `$${v?.toLocaleString() || 0}` 
    },
    { 
      title: 'Saldo', 
      key: 'saldo',
      render: (_, record) => {
        const total = record.totalAPagar || record.total || 0;
        const pagado = record.totalPagado || 0;
        return `$${(total - pagado).toLocaleString()}`;
      }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" description="Cargando cartera..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Cartera de Créditos</Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Cartera Total" value={stats.totalCartera} prefix={<DollarOutlined />} precision={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Recaudado" value={stats.totalRecaudado} prefix={<DollarOutlined />} precision={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Préstamos Activos" value={stats.prestamosActivos} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Clientes" value={stats.totalClientes} prefix={<UserOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="Lista de Préstamos">
        <Table 
          columns={columns} 
          dataSource={prestamos} 
          rowKey="_id" 
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay préstamos registrados' }}
        />
      </Card>
    </div>
  );
};

export default Cartera;
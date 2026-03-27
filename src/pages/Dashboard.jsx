import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Space, Tag, Progress, Button, Table, message, Empty, Tooltip } from 'antd';
import { 
  DollarOutlined, 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  ShopOutlined,
  PlusOutlined,
  EyeOutlined,
  PercentageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" description="Cargando datos..." />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const ultimosPrestamos = dashboardData?.ultimosPrestamos || [];
  const cobradoresRecientes = dashboardData?.cobradoresRecientes || [];

  const totalCartera = stats.totalCartera || 0;
  const totalRecaudado = stats.totalRecaudado || 0;
  const porCobrar = totalCartera - totalRecaudado;
  const porcentajeCobro = totalCartera > 0 ? (totalRecaudado / totalCartera) * 100 : 0;
  const interesGenerado = stats.interesGenerado || 0;
  const eficienciaCobro = totalCartera > 0 ? (totalRecaudado / totalCartera) * 100 : 0;

  const prestamosColumns = [
    { 
      title: 'Cliente', 
      dataIndex: ['cliente', 'nombre'], 
      key: 'cliente', 
      render: (_, record) => record.cliente?.nombre || 'N/A'
    },
    { 
      title: 'Capital', 
      dataIndex: 'capital', 
      key: 'capital', 
      render: (val) => `$${val?.toLocaleString() || 0}` 
    },
    { 
      title: 'Interés', 
      dataIndex: 'interes', 
      key: 'interes', 
      render: (val) => `$${val?.toLocaleString() || 0}` 
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total', 
      render: (val) => `$${val?.toLocaleString() || 0}` 
    },
    { 
      title: 'Pagado', 
      dataIndex: 'totalPagado', 
      key: 'totalPagado', 
      render: (val) => `$${val?.toLocaleString() || 0}` 
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
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/prestamos/${record._id}`)} size="small">
          Ver
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Header Mejorado */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 20, 
        padding: '28px 32px', 
        marginBottom: 28, 
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
              Panel de Control Global
            </Title>
            <Space>
              <ClockCircleOutlined />
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </Space>
          </Col>
          <Col>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: 12, 
              padding: '8px 16px',
              textAlign: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>Eficiencia de Cobro</Text>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{eficienciaCobro.toFixed(1)}%</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Tarjetas de estadísticas mejoradas */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderRadius: 16, borderTop: '4px solid #00d4ff' }}>
            <Statistic
              title={<span style={{ color: '#00d4ff' }}>Cartera Total</span>}
              value={totalCartera}
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#00d4ff', fontSize: 24 }}
              suffix="COP"
            />
            <div style={{ marginTop: 12 }}>
              <Progress percent={porcentajeCobro} strokeColor="#52c41a" size="small" />
              <Text type="secondary" style={{ fontSize: 12 }}>{porcentajeCobro.toFixed(1)}% cobrado</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderRadius: 16, borderTop: '4px solid #52c41a' }}>
            <Statistic
              title={<span style={{ color: '#52c41a' }}>Total Recaudado</span>}
              value={totalRecaudado}
              precision={0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
              suffix="COP"
            />
            <Tag color="success" style={{ marginTop: 12 }}>{stats.prestamosPagados || 0} préstamos pagados</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderRadius: 16, borderTop: '4px solid #ff4d4f' }}>
            <Statistic
              title={<span style={{ color: '#ff4d4f' }}>Por Cobrar</span>}
              value={porCobrar}
              precision={0}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
              suffix="COP"
            />
            <Text type="secondary" style={{ marginTop: 12, display: 'block' }}>
              {stats.prestamosActivos || 0} préstamos activos
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" style={{ borderRadius: 16, borderTop: '4px solid #7b2cbf' }}>
            <Statistic
              title={<span style={{ color: '#7b2cbf' }}>Interés Generado</span>}
              value={interesGenerado}
              precision={0}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#7b2cbf', fontSize: 24 }}
              suffix="COP"
            />
            <Tag color="processing" style={{ marginTop: 12 }}>
              ROI: {totalCartera > 0 ? ((interesGenerado / totalCartera) * 100).toFixed(2) : 0}%
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila - Métricas de negocio */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Préstamos Activos" value={stats.prestamosActivos || 0} prefix={<FileTextOutlined />} />
            <div style={{ marginTop: 8 }}>
              <Tag color="green">Pagados: {stats.prestamosPagados || 0}</Tag>
              <Tag color="red">Vencidos: {stats.prestamosVencidos || 0}</Tag>
            </div>
            <Button type="link" style={{ marginTop: 8, padding: 0 }} onClick={() => navigate('/prestamos')}>
              Ver todos los préstamos →
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Total Clientes" value={stats.totalClientes || 0} prefix={<UserOutlined />} />
            <Button type="link" style={{ marginTop: 8, padding: 0 }} onClick={() => navigate('/clientes')}>
              Gestionar clientes →
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Total Cobradores" value={stats.totalCobradores || 0} prefix={<TeamOutlined />} />
            <Button type="link" style={{ marginTop: 8, padding: 0 }} onClick={() => navigate('/cobradores')}>
              Gestionar cobradores →
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 16 }}>
            <Statistic title="Total Préstamos" value={stats.totalPrestamos || 0} prefix={<ShopOutlined />} />
            <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 8 }} onClick={() => navigate('/prestamos/nuevo')} size="small">
              Nuevo Préstamo
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Resumen de Cobradores */}
      {cobradoresRecientes.length > 0 && (
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="👥 Cobradores Activos" style={{ borderRadius: 16 }}>
              <Row gutter={[16, 16]}>
                {cobradoresRecientes.map(cobrador => (
                  <Col key={cobrador._id} xs={24} sm={12} lg={8}>
                    <Card size="small" style={{ background: '#f8fafc' }}>
                      <Space>
                        <TeamOutlined style={{ color: '#0d9488', fontSize: 20 }} />
                        <div>
                          <div><strong>{cobrador.nombre}</strong></div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{cobrador.email}</div>
                          <div style={{ fontSize: 12 }}>📞 {cobrador.telefono || 'N/A'}</div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Últimos préstamos con más información */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="📋 Últimos Préstamos" style={{ borderRadius: 16 }}>
            {ultimosPrestamos.length > 0 ? (
              <Table 
                columns={prestamosColumns} 
                dataSource={ultimosPrestamos} 
                rowKey="_id" 
                pagination={{ pageSize: 5 }} 
                size="middle"
              />
            ) : (
              <Empty description="No hay préstamos registrados" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
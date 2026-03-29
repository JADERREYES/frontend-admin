import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Button, message, Badge, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SettingOutlined,
  CalendarOutlined,
  BoxPlotOutlined,
  WalletOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import Notificaciones from './Notificaciones';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = ({ children, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  
  const userName = user?.nombre || 'Administrador';
  const userEmail = user?.email || 'admin@empresa.com';
  const userTenantId = user?.tenantId || localStorage.getItem('tenantId');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sincronizar el menú resaltado con la URL real
  useEffect(() => {
    const path = location.pathname.split('/')[1]; // Obtiene la primera parte de la ruta
    if (!path || path === '') {
      setSelectedMenu('dashboard');
    } else {
      setSelectedMenu(path);
    }
  }, [location]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  // Menú sin Préstamos, Pagos y Reportes
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'clientes', icon: <TeamOutlined />, label: 'Clientes' },
    { key: 'cobradores', icon: <UserOutlined />, label: 'Cobradores' },
    { key: 'cartera', icon: <WalletOutlined />, label: 'Cartera' },
    { key: 'calendario', icon: <CalendarOutlined />, label: 'Calendario' },
    { key: 'inventario', icon: <BoxPlotOutlined />, label: 'Inventario' },
    { key: 'configuracion', icon: <SettingOutlined />, label: 'Configuración' },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/perfil'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #0a0f2a 0%, #0a0a1a 100%)',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          zIndex: 1001
        }}
      >
        <div style={{ 
          padding: '20px 16px', 
          textAlign: 'center', 
          borderBottom: '1px solid rgba(0,212,255,0.2)',
          marginBottom: 16
        }}>
          <ThunderboltOutlined style={{ fontSize: 32, color: '#00d4ff', marginBottom: 8 }} />
          <Title level={4} style={{ margin: 0, color: '#00d4ff' }}>
            {collapsed ? 'GA' : 'GOTA A GOTA'}
          </Title>
        </div>
        
        <Menu
          theme="dark"
          selectedKeys={[selectedMenu]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            navigate(`/${key}`);
          }}
          style={{ background: 'transparent' }}
        />
        
        {!collapsed && userTenantId && (
          <div style={{
            position: 'absolute',
            bottom: 60,
            left: 10,
            right: 10,
            padding: '8px',
            background: 'rgba(0,212,255,0.1)',
            borderRadius: 8,
            textAlign: 'center',
            border: '1px solid rgba(0,212,255,0.2)'
          }}>
            <Text style={{ color: '#00d4ff', fontSize: 10, display: 'block' }}>
              TENANT ID
            </Text>
            <Text strong style={{ color: '#fff', fontSize: 11 }}>
              {userTenantId}
            </Text>
          </div>
        )}
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 64
        }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Panel Administrativo
            </Title>
          </div>
          
          <Space size="large">
            <Text type="secondary" style={{ fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString()}
            </Text>
            <Notificaciones />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#00d4ff' }} />
                <div style={{ lineHeight: '1.2' }}>
                  <div style={{ fontWeight: '500', fontSize: 14 }}>{userName}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{userEmail}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px' }}>
          <div style={{ 
            padding: 24, 
            background: '#fff', 
            borderRadius: 12,
            minHeight: 'calc(100vh - 112px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
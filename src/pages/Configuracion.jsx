import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Switch, Divider, Alert, Space } from 'antd';
import { SaveOutlined, LockOutlined, UserOutlined, BellOutlined, SafetyOutlined } from '@ant-design/icons';
import { authAPI } from '../api/api';

const { Title, Text } = Typography;

const Configuracion = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para actualizar perfil
      message.success('Perfil actualizado');
      const updatedUser = { ...user, nombre: values.nombre };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } catch (error) {
      message.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }
    try {
      setLoading(true);
      // Aquí iría la llamada a la API para cambiar contraseña
      message.success('Contraseña cambiada');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      message.error('Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>Configuración</Title>
      
      <Card title="Perfil de Usuario" style={{ marginBottom: 24 }}>
        <Form layout="vertical" onFinish={handleUpdateProfile} initialValues={{ nombre: user.nombre, email: user.email }}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Actualizar Perfil
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Cambiar Contraseña" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="currentPassword" label="Contraseña Actual" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item name="newPassword" label="Nueva Contraseña" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirmar Nueva Contraseña" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cambiar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="Configuración del Sistema">
        <Alert
          message="Configuración Global"
          description="Aquí puedes configurar parámetros del sistema"
          type="info"
          showIcon
        />
        <div style={{ marginTop: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong><BellOutlined /> Notificaciones por email:</Text>
              <Switch style={{ marginLeft: 16 }} defaultChecked />
            </div>
            <div>
              <Text strong><SafetyOutlined /> Autenticación en dos pasos:</Text>
              <Switch style={{ marginLeft: 16 }} />
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Configuracion;
import React from 'react';
import { Card, Typography, Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Perfil = () => {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const [form] = Form.useForm();

  const handleUpdate = async (values) => {
    try {
      // Aquí iría la llamada a la API para actualizar perfil
      message.success('Perfil actualizado');
      const updatedUser = { ...user, ...values };
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
    } catch (error) {
      message.error('Error al actualizar perfil');
    }
  };

  return (
    <div>
      <Title level={2}>Mi Perfil</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            nombre: user.nombre,
            email: user.email,
            cedula: user.cedula,
            telefono: user.telefono
          }}
          onFinish={handleUpdate}
        >
          <Form.Item name="nombre" label="Nombre">
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>
          <Form.Item name="cedula" label="Cédula">
            <Input prefix={<IdcardOutlined />} disabled />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Actualizar Perfil
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Perfil;
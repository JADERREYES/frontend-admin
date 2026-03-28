import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Cartera = () => {
  return (
    <Card>
      <Title level={2}>Cartera de Créditos</Title>
      <p>Módulo en construcción - Versión de prueba</p>
      <p>ID del usuario: {localStorage.getItem('admin_user')}</p>
    </Card>
  );
};

export default Cartera;
import React, { useState } from 'react';
import { Card, Button, Space, message } from 'antd';
import api from '../api/api';

const Reportes = () => {
  const [loading, setLoading] = useState(false);

  const generarReporte = async () => {
    try {
      setLoading(true);
      const response = await api.get('/prestamos');
      message.success(Reporte generado:  préstamos);
    } catch (error) {
      message.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Reportes">
      <Space>
        <Button type="primary" onClick={generarReporte} loading={loading}>
          Generar Reporte de Préstamos
        </Button>
        <Button>Exportar Excel</Button>
        <Button>Exportar PDF</Button>
      </Space>
    </Card>
  );
};

export default Reportes;

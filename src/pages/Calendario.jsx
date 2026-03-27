import React from 'react';
import { Card, Typography, Calendar } from 'antd';

const { Title } = Typography;

const Calendario = () => {
  const onPanelChange = (value, mode) => {
    console.log(value.format('YYYY-MM-DD'), mode);
  };

  return (
    <div>
      <Title level={2}>Calendario de Pagos</Title>
      <Card>
        <Calendar onPanelChange={onPanelChange} />
      </Card>
    </div>
  );
};

export default Calendario;
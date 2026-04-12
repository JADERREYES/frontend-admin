import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Modal, List, Badge, Button, message, Typography, Space, Tag, Avatar, Tooltip } from 'antd';
import { BellOutlined, WarningOutlined, MessageOutlined, CalendarOutlined } from '@ant-design/icons';
import { oficinaAPI } from '../api/api';

const { Text } = Typography;

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

const normalizarNotificacion = (notificacion) => ({
  ...notificacion,
  id: notificacion._id || notificacion.id,
  fecha: notificacion.createdAt || notificacion.fecha || new Date().toISOString(),
  titulo: notificacion.titulo || 'Notificacion',
  mensaje: notificacion.mensaje || '',
  tipo: notificacion.tipo || 'mensualidad_morosa',
  metadata: notificacion.metadata || {}
});

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarNotificaciones = async () => {
    try {
      const response = await oficinaAPI.getNotificaciones();
      const data = Array.isArray(response.data?.notificaciones)
        ? response.data.notificaciones
        : [];
      setNotificaciones(data.map(normalizarNotificacion));
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
      return undefined;
    }

    cargarNotificaciones();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on('connect', () => {
      socket.emit('join-tenant');
    });

    socket.on('notificacion-oficina', (data) => {
      const nuevaNotificacion = normalizarNotificacion(data);

      setNotificaciones((prev) => {
        if (prev.some((notificacion) => notificacion.id === nuevaNotificacion.id)) {
          return prev;
        }

        return [nuevaNotificacion, ...prev];
      });

      message.warning({
        content: nuevaNotificacion.mensaje,
        duration: 8,
        icon: <WarningOutlined />,
        style: { marginTop: '20vh' }
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexion WebSocket:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const marcarComoLeida = async (id) => {
    const notificacion = notificaciones.find((item) => item.id === id);

    if (!notificacion || notificacion.leida) {
      return;
    }

    setNotificaciones((prev) =>
      prev.map((item) => item.id === id ? { ...item, leida: true, fechaLeida: new Date().toISOString() } : item)
    );

    try {
      const response = await oficinaAPI.marcarNotificacionLeida(id);
      const actualizada = normalizarNotificacion(response.data.notificacion);
      setNotificaciones((prev) =>
        prev.map((item) => item.id === id ? actualizada : item)
      );
    } catch (error) {
      message.error('No se pudo marcar la notificacion como leida');
      setNotificaciones((prev) =>
        prev.map((item) => item.id === id ? notificacion : item)
      );
    }
  };

  const marcarTodasLeidas = async () => {
    const pendientes = notificaciones.filter((notificacion) => !notificacion.leida);

    for (const notificacion of pendientes) {
      await marcarComoLeida(notificacion.id);
    }
  };

  const notificacionesNoLeidas = notificaciones.filter((notificacion) => !notificacion.leida).length;

  const formatFecha = (fecha) => {
    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Tooltip title={notificacionesNoLeidas > 0 ? `${notificacionesNoLeidas} notificaciones no leidas` : 'Notificaciones'}>
        <Badge count={notificacionesNoLeidas} offset={[-5, 5]} style={{ backgroundColor: '#ff4d4f' }}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20, color: '#00aa66' }} />}
            onClick={() => setModalVisible(true)}
            style={{
              padding: '8px',
              height: 'auto',
              background: notificacionesNoLeidas > 0 ? 'rgba(255,77,79,0.1)' : 'transparent'
            }}
          />
        </Badge>
      </Tooltip>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <BellOutlined />
              <span>Notificaciones internas</span>
              {notificacionesNoLeidas > 0 && <Tag color="red">{notificacionesNoLeidas} nuevas</Tag>}
            </Space>
            {notificacionesNoLeidas > 0 && (
              <Button size="small" onClick={marcarTodasLeidas}>Marcar todas leidas</Button>
            )}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={560}
        styles={{ body: { maxHeight: 500, overflow: 'auto', padding: '16px' } }}
      >
        {notificaciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <BellOutlined style={{ fontSize: 64, color: '#ccc' }} />
            <p style={{ marginTop: 16, color: '#999', fontSize: 16 }}>No hay notificaciones</p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Los avisos internos de la oficina apareceran aqui.
            </Text>
          </div>
        ) : (
          <List
            dataSource={notificaciones}
            renderItem={(notificacion) => (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '12px',
                  background: notificacion.leida ? '#fafafa' : '#fff7e6',
                  borderRadius: 8,
                  borderLeft: `4px solid ${notificacion.leida ? '#d9d9d9' : '#ff4d4f'}`,
                  cursor: 'pointer'
                }}
                onClick={() => marcarComoLeida(notificacion.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Space align="start">
                    <Avatar
                      size="small"
                      icon={<MessageOutlined />}
                      style={{ backgroundColor: '#ff4d4f', marginTop: 2 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text strong>{notificacion.titulo}</Text>
                        <Tag color="red">MENSUALIDAD</Tag>
                        {notificacion.metadata?.diasMora > 0 && (
                          <Tag color="red">{notificacion.metadata.diasMora} dias mora</Tag>
                        )}
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 14 }}>{notificacion.mensaje}</Text>
                      </div>

                      <div style={{ fontSize: 11, color: '#999', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {notificacion.periodo && <span><CalendarOutlined /> Periodo: {notificacion.periodo}</span>}
                        {notificacion.metadata?.monto ? <span>Monto: ${Number(notificacion.metadata.monto).toLocaleString()}</span> : null}
                      </div>

                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                        {formatFecha(notificacion.fecha)}
                      </div>
                    </div>
                  </Space>

                  {!notificacion.leida && <Badge status="processing" color="red" />}
                </div>
              </div>
            )}
          />
        )}
      </Modal>
    </>
  );
};

export default Notificaciones;

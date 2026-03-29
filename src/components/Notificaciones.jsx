import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Modal,
  List,
  Badge,
  Button,
  message,
  Typography,
  Space,
  Tag,
  Avatar,
  Tooltip
} from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  DeleteOutlined,
  MessageOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  API_URL.replace('/api', '') ||
  'http://localhost:5000';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const tenantId = localStorage.getItem('tenantId');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!tenantId) {
      console.log('⚠️ No hay tenantId, esperando login...');
      return;
    }

    cargarNotificaciones();

    console.log('🏢 Conectando con tenantId:', tenantId);
    console.log('🔌 SOCKET_URL:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor de notificaciones');
      newSocket.emit('join-tenant', tenantId);
    });

    newSocket.on('joined', (data) => {
      console.log('✅ Confirmación joined:', data);
    });

    newSocket.on('recibido-recordatorio', (data) => {
      const nuevaNotificacion = {
        id: data._id || Date.now(),
        _id: data._id,
        ...data,
        leida: false,
        fecha: new Date(),
        tipo: 'normal'
      };

      setNotificaciones((prev) => [nuevaNotificacion, ...prev]);

      message.warning({
        content: data.mensaje,
        duration: 8,
        icon: <WarningOutlined />,
        style: { marginTop: '20vh' }
      });
    });

    newSocket.on('recibido-recordatorio-mensual', (data) => {
      const nuevaNotificacion = {
        id: data._id || Date.now(),
        _id: data._id,
        ...data,
        leida: false,
        fecha: new Date(),
        tipo: 'mensual'
      };

      setNotificaciones((prev) => [nuevaNotificacion, ...prev]);

      message.warning({
        content: data.mensaje,
        duration: 10,
        icon: <CalendarOutlined />,
        style: { marginTop: '20vh' }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Desconectado del servidor de notificaciones');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [tenantId]);

  const cargarNotificaciones = async () => {
    try {
      const response = await fetch(`${API_URL}/pagos/mis-notificaciones`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las notificaciones');
      }

      const adaptadas = data.map((n) => ({
        id: n._id,
        _id: n._id,
        empresa: n.empresa,
        mensaje: n.mensaje,
        fechaVencimiento: n.fechaVencimiento,
        diasAtraso: n.diasAtraso,
        monto: n.monto,
        fecha: n.fechaEnvio || n.createdAt,
        tipo: n.tipo,
        leida: n.leida
      }));

      setNotificaciones(adaptadas);
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
    }
  };

  const marcarComoLeida = async (id) => {
    setNotificaciones((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );

    try {
      await fetch(`${API_URL}/pagos/mis-notificaciones/${id}/leida`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
    }
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones((prev) => prev.filter((notif) => notif.id !== id));
    message.success('Notificación eliminada localmente');
  };

  const eliminarTodas = () => {
    setNotificaciones([]);
    message.success('Todas las notificaciones eliminadas localmente');
  };

  const marcarTodasLeidas = async () => {
    const idsNoLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id);

    setNotificaciones((prev) =>
      prev.map((notif) => ({ ...notif, leida: true }))
    );

    try {
      await Promise.all(
        idsNoLeidas.map((id) =>
          fetch(`${API_URL}/pagos/mis-notificaciones/${id}/leida`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })
        )
      );
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
    }

    message.success('Todas las notificaciones marcadas como leídas');
  };

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} horas`;
    if (diffDias < 7) return `Hace ${diffDias} días`;

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
      <Tooltip
        title={
          notificacionesNoLeidas > 0
            ? `${notificacionesNoLeidas} notificaciones no leídas`
            : 'Notificaciones'
        }
      >
        <Badge
          count={notificacionesNoLeidas}
          offset={[-5, 5]}
          style={{ backgroundColor: '#ff4d4f' }}
        >
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20, color: '#00aa66' }} />}
            onClick={() => setModalVisible(true)}
            style={{
              padding: '8px',
              height: 'auto',
              background:
                notificacionesNoLeidas > 0
                  ? 'rgba(255,77,79,0.1)'
                  : 'transparent'
            }}
          />
        </Badge>
      </Tooltip>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <BellOutlined />
              <span>Notificaciones de Pago</span>
              {notificacionesNoLeidas > 0 && (
                <Tag color="red">{notificacionesNoLeidas} nuevas</Tag>
              )}
            </Space>
            <Space>
              {notificaciones.length > 0 && (
                <>
                  <Button size="small" onClick={marcarTodasLeidas}>
                    Marcar todas leídas
                  </Button>
                  <Button size="small" danger onClick={eliminarTodas}>
                    Limpiar vista
                  </Button>
                </>
              )}
            </Space>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={550}
        styles={{ body: { maxHeight: 500, overflow: 'auto', padding: '16px' } }}
      >
        {notificaciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <BellOutlined style={{ fontSize: 64, color: '#ccc' }} />
            <p style={{ marginTop: 16, color: '#999', fontSize: 16 }}>
              No hay notificaciones
            </p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cuando recibas recordatorios de pago aparecerán aquí
            </Text>
          </div>
        ) : (
          <List
            dataSource={notificaciones}
            renderItem={(notif) => (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: '12px',
                  background: notif.leida ? '#fafafa' : '#fff7e6',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${notif.leida ? '#d9d9d9' : '#ff4d4f'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onClick={() => marcarComoLeida(notif.id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Space align="start">
                    <Avatar
                      size="small"
                      icon={notif.tipo === 'mensual' ? <CalendarOutlined /> : <MessageOutlined />}
                      style={{
                        backgroundColor: notif.tipo === 'mensual' ? '#faad14' : '#ff4d4f',
                        marginTop: 2
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text strong style={{ color: '#ff4d4f' }}>{notif.empresa}</Text>
                        <Tag color={notif.tipo === 'mensual' ? 'orange' : 'red'}>
                          {notif.tipo === 'mensual' ? 'MENSUAL' : 'RECORDATORIO'}
                        </Tag>
                        {notif.diasAtraso ? (
                          <Tag color="red">{notif.diasAtraso} días atraso</Tag>
                        ) : null}
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 14 }}>{notif.mensaje}</Text>
                      </div>

                      <div style={{ fontSize: 11, color: '#999', display: 'flex', gap: 16 }}>
                        {notif.fechaVencimiento && <span>📅 Vence: {notif.fechaVencimiento}</span>}
                        {typeof notif.monto !== 'undefined' && (
                          <span>💰 Monto: ${Number(notif.monto || 0).toLocaleString()}</span>
                        )}
                      </div>

                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                        {formatFecha(notif.fecha)}
                      </div>
                    </div>
                  </Space>

                  {!notif.leida && <Badge status="processing" color="red" />}
                </div>

                <div style={{ position: 'absolute', bottom: 8, right: 12 }}>
                  <Button
                    type="link"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif.id);
                    }}
                    style={{ padding: 0, color: '#999' }}
                  />
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
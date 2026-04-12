import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title } = Typography;

const estadoColors = {
  disponible: 'green',
  asignado: 'blue',
  mantenimiento: 'orange'
};

const Inventario = () => {
  const [items, setItems] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarInventario();
    cargarCobradores();
  }, []);

  const getErrorMessage = (error, fallback) => (
    error.response?.data?.error || error.response?.data?.mensaje || error.message || fallback
  );

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventario');
      setItems(response.data || []);
    } catch (error) {
      message.error(getErrorMessage(error, 'Error al cargar inventario'));
    } finally {
      setLoading(false);
    }
  };

  const cargarCobradores = async () => {
    try {
      const response = await api.get('/cobradores');
      setCobradores(response.data || []);
    } catch (error) {
      // La asignacion a cobrador es opcional; no bloquea inventario.
      console.error('Error cargando cobradores para inventario:', error);
    }
  };

  const abrirCrear = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ estado: 'disponible', valor: 0 });
    setModalVisible(true);
  };

  const abrirEditar = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      cobrador: record.cobrador?._id || record.cobrador || undefined
    });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleGuardar = async (values) => {
    try {
      setLoading(true);
      const payload = {
        tipo: values.tipo?.trim(),
        descripcion: values.descripcion?.trim(),
        serie: values.serie?.trim() || '',
        marca: values.marca?.trim() || '',
        modelo: values.modelo?.trim() || '',
        valor: values.valor || 0,
        estado: values.estado || 'disponible',
        cobrador: values.cobrador || null,
        notas: values.notas?.trim() || ''
      };

      if (editingItem) {
        await api.put(`/inventario/${editingItem._id}`, payload);
        message.success('Item actualizado');
      } else {
        await api.post('/inventario', payload);
        message.success('Item creado');
      }

      cerrarModal();
      cargarInventario();
    } catch (error) {
      message.error(getErrorMessage(error, 'Error al guardar inventario'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/inventario/${id}`);
      message.success('Item eliminado');
      cargarInventario();
    } catch (error) {
      message.error(getErrorMessage(error, 'Error al eliminar item'));
    }
  };

  const columns = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Descripcion', dataIndex: 'descripcion', key: 'descripcion', ellipsis: true },
    { title: 'Serie', dataIndex: 'serie', key: 'serie', render: (v) => v || 'N/A' },
    { title: 'Marca', dataIndex: 'marca', key: 'marca', render: (v) => v || 'N/A' },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo', render: (v) => v || 'N/A' },
    { title: 'Valor', dataIndex: 'valor', key: 'valor', render: (v) => `$${Number(v || 0).toLocaleString()}` },
    {
      title: 'Cobrador',
      dataIndex: 'cobrador',
      key: 'cobrador',
      render: (cobrador) => cobrador?.nombre || 'Sin asignar'
    },
    { 
      title: 'Estado', 
      dataIndex: 'estado', 
      key: 'estado',
      render: (estado = 'disponible') => (
        <Tag color={estadoColors[estado] || 'default'}>{estado.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => abrirEditar(record)}>
            Editar
          </Button>
          <Popconfirm title="Eliminar item" description="Esta accion no se puede deshacer" onConfirm={() => handleEliminar(record._id)}>
            <Button danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3}>Inventario</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirCrear}>
            Nuevo Item
          </Button>
        </div>
        <Table columns={columns} dataSource={items} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingItem ? 'Editar Item' : 'Nuevo Item'}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleGuardar}>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'El tipo es obligatorio' }]}>
            <Input placeholder="Ej: Celular, impresora, casco, datafono" />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripcion" rules={[{ required: true, message: 'La descripcion es obligatoria' }]}>
            <Input.TextArea rows={2} placeholder="Descripcion del activo" />
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle" align="start">
            <Form.Item name="serie" label="Serie" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="marca" label="Marca" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="modelo" label="Modelo" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: '100%' }} size="middle" align="start">
            <Form.Item name="valor" label="Valor" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="estado" label="Estado" style={{ flex: 1 }}>
              <Select
                options={[
                  { value: 'disponible', label: 'Disponible' },
                  { value: 'asignado', label: 'Asignado' },
                  { value: 'mantenimiento', label: 'Mantenimiento' }
                ]}
              />
            </Form.Item>
          </Space>

          <Form.Item name="cobrador" label="Asignar a cobrador">
            <Select
              allowClear
              placeholder="Sin asignar"
              options={cobradores.map((c) => ({
                value: c._id,
                label: `${c.nombre} - ${c.cedula || c.email || 'sin identificacion'}`
              }))}
            />
          </Form.Item>

          <Form.Item name="notas" label="Notas">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Guardar
              </Button>
              <Button onClick={cerrarModal}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventario;

import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title } = Typography;

const Inventario = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventario');
      setItems(response.data);
    } catch (error) {
      message.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (values) => {
    try {
      setLoading(true);
      if (editingItem) {
        await api.put(`/inventario/${editingItem._id}`, values);
        message.success('Item actualizado');
      } else {
        await api.post('/inventario', values);
        message.success('Item creado');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      cargarInventario();
    } catch (error) {
      message.error('Error al guardar');
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
      message.error('Error al eliminar');
    }
  };

  const columns = [
    { title: 'Producto', dataIndex: 'nombre', key: 'nombre' },
    { title: 'Código', dataIndex: 'codigo', key: 'codigo' },
    { title: 'Cantidad', dataIndex: 'cantidad', key: 'cantidad' },
    { title: 'Precio', dataIndex: 'precio', key: 'precio', render: v => `$${v?.toLocaleString()}` },
    { 
      title: 'Estado', 
      dataIndex: 'estado', 
      key: 'estado',
      render: (estado) => <Tag color={estado ? 'green' : 'red'}>{estado ? 'DISPONIBLE' : 'AGOTADO'}</Tag>
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingItem(record); form.setFieldsValue(record); setModalVisible(true); }}>Editar</Button>
          <Popconfirm title="¿Eliminar?" onConfirm={() => handleEliminar(record._id)}>
            <Button danger icon={<DeleteOutlined />} size="small">Eliminar</Button>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setModalVisible(true); }}>
            Nuevo Item
          </Button>
        </div>
        <Table columns={columns} dataSource={items} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editingItem ? "Editar Item" : "Nuevo Item"} open={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); form.resetFields(); }} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleGuardar}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="codigo" label="Código"><Input /></Form.Item>
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="precio" label="Precio" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={loading}>Guardar</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventario;
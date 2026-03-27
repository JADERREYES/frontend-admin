import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Spin,
  message,
  Button,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api from '../api/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const [prestamosRes, clientesRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/clientes')
      ]);

      setPrestamos(Array.isArray(prestamosRes.data) ? prestamosRes.data : []);
      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditingPrestamo(null);
    form.resetFields();
  };

  const abrirModalNuevo = () => {
    setEditingPrestamo(null);
    form.resetFields();
    setModalVisible(true);
  };

  const abrirModalEditar = (record) => {
    setEditingPrestamo(record);

    form.setFieldsValue({
      ...record,
      fechaInicio: record.fechaInicio ? dayjs(record.fechaInicio) : null,
      fechaVencimiento: record.fechaVencimiento ? dayjs(record.fechaVencimiento) : null,
      clienteId: record.clienteId?._id || record.clienteId
    });

    setModalVisible(true);
  };

  const handleGuardar = async (values) => {
    try {
      setLoading(true);

      const interes = values.interes || 0;
      const total = values.capital + interes;

      const data = {
        ...values,
        total,
        totalAPagar: total,
        fechaInicio: values.fechaInicio ? values.fechaInicio.toISOString() : null,
        fechaVencimiento: values.fechaVencimiento ? values.fechaVencimiento.toISOString() : null
      };

      if (editingPrestamo) {
        await api.put(`/prestamos/${editingPrestamo._id}`, data);
        message.success('Préstamo actualizado');
      } else {
        await api.post('/prestamos', data);
        message.success('Préstamo creado');
      }

      cerrarModal();
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar préstamo:', error);
      message.error(error.response?.data?.error || 'Error al guardar préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/prestamos/${id}`);
      message.success('Préstamo eliminado');
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar préstamo:', error);
      message.error('Error al eliminar préstamo');
    }
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: ['clienteId', 'nombre'],
      key: 'cliente',
      render: (_, record) => record.clienteId?.nombre || 'N/A'
    },
    {
      title: 'Capital',
      dataIndex: 'capital',
      key: 'capital',
      render: (val) => `$${val?.toLocaleString() || 0}`
    },
    {
      title: 'Interés',
      dataIndex: 'interes',
      key: 'interes',
      render: (val) => `$${val?.toLocaleString() || 0}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (val) => `$${val?.toLocaleString() || 0}`
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const estadoStr = String(estado || 'activo').toUpperCase();
        const color =
          estadoStr === 'PAGADO'
            ? 'green'
            : estadoStr === 'ACTIVO'
            ? 'blue'
            : 'red';

        return <Tag color={color}>{estadoStr}</Tag>;
      }
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => abrirModalEditar(record)}
          >
            Ver
          </Button>

          {record.estado !== 'pagado' && (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => abrirModalEditar(record)}
            >
              Editar
            </Button>
          )}

          <Popconfirm
            title="¿Eliminar préstamo?"
            onConfirm={() => handleEliminar(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (loading && prestamos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px'
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16
          }}
        >
          <Title level={3}>Préstamos</Title>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={abrirModalNuevo}
          >
            Nuevo Préstamo
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={prestamos}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No hay préstamos registrados' }}
        />
      </Card>

      <Modal
        title={editingPrestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
        open={modalVisible}
        onCancel={cerrarModal}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleGuardar}>
          <Form.Item
            name="clienteId"
            label="Cliente"
            rules={[{ required: true, message: 'Seleccione un cliente' }]}
          >
            <Select
              showSearch
              placeholder="Seleccionar cliente"
              optionFilterProp="children"
              notFoundContent="No hay clientes registrados"
            >
              {clientes.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.nombre} - {c.cedula}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="capital"
            label="Capital"
            rules={[{ required: true, message: 'Ingrese el capital' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1000}
              placeholder="Monto del capital"
            />
          </Form.Item>

          <Form.Item name="interes" label="Interés (%)">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1}
              placeholder="Porcentaje de interés"
            />
          </Form.Item>

          <Form.Item
            name="plazo"
            label="Plazo (días)"
            rules={[{ required: true, message: 'Ingrese el plazo' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Días para pagar"
            />
          </Form.Item>

          <Form.Item
            name="fechaInicio"
            label="Fecha Inicio"
            rules={[{ required: true, message: 'Seleccione la fecha de inicio' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fechaVencimiento"
            label="Fecha Vencimiento"
            rules={[{ required: true, message: 'Seleccione la fecha de vencimiento' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingPrestamo ? 'Actualizar' : 'Crear'} Préstamo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Prestamos;
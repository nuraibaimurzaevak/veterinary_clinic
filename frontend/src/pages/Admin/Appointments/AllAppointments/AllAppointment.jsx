import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  CalendarToday,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AdminLayout from '../../../../components/admin/layout/AdminLayout';
import './AllAppointments.css';

const AllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Моковые данные записей
  const mockAppointments = [
    {
      id: '1',
      clientName: 'Иванов Иван Иванович',
      petName: 'Барсик',
      petType: 'Кот',
      vetName: 'Петрова Анна Сергеевна',
      date: '2024-01-30',
      time: '10:30',
      reason: 'Плановый осмотр',
      status: 'confirmed',
      createdAt: '2024-01-25T14:30:00Z'
    },
    {
      id: '2',
      clientName: 'Петрова Мария Викторовна',
      petName: 'Рекс',
      petType: 'Собака',
      vetName: 'Сидоров Дмитрий Алексеевич',
      date: '2024-01-30',
      time: '14:00',
      reason: 'Вакцинация',
      status: 'pending',
      createdAt: '2024-01-26T09:15:00Z'
    },
    {
      id: '3',
      clientName: 'Сидоров Алексей Петрович',
      petName: 'Кеша',
      petType: 'Попугай',
      vetName: 'Кузнецова Елена Владимировна',
      date: '2024-01-29',
      time: '11:15',
      reason: 'Обрезка клюва',
      status: 'completed',
      createdAt: '2024-01-24T16:45:00Z'
    },
    {
      id: '4',
      clientName: 'Кузнецова Ольга Дмитриевна',
      petName: 'Мурка',
      petType: 'Кошка',
      vetName: 'Петрова Анна Сергеевна',
      date: '2024-01-31',
      time: '09:00',
      reason: 'Стерилизация',
      status: 'cancelled',
      createdAt: '2024-01-27T11:20:00Z'
    },
    {
      id: '5',
      clientName: 'Николаев Сергей Иванович',
      petName: 'Шарик',
      petType: 'Собака',
      vetName: 'Сидоров Дмитрий Алексеевич',
      date: '2024-01-31',
      time: '15:30',
      reason: 'Лечение раны',
      status: 'confirmed',
      createdAt: '2024-01-28T13:10:00Z'
    }
  ];

  useEffect(() => {
    // Загрузка данных (в реальном приложении здесь будет API запрос)
    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  // Функция фильтрации
  useEffect(() => {
    let filtered = appointments;

    // Поиск по тексту
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.clientName.toLowerCase().includes(term) ||
        app.petName.toLowerCase().includes(term) ||
        app.vetName.toLowerCase().includes(term) ||
        app.reason.toLowerCase().includes(term)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Фильтр по дате
    if (dateFilter) {
      filtered = filtered.filter(app => app.date === dateFilter);
    }

    setFilteredAppointments(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(app => 
      app.id === appointmentId ? { ...app, status: newStatus } : app
    ));
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    }
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: ru });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirmed':
        return <Chip icon={<CheckCircle />} label="Подтвержден" color="success" size="small" />;
      case 'pending':
        return <Chip icon={<Schedule />} label="Ожидает" color="warning" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Завершен" color="primary" size="small" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Отменен" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getStatusOptions = () => {
    return [
      { value: 'all', label: 'Все статусы' },
      { value: 'pending', label: 'Ожидает' },
      { value: 'confirmed', label: 'Подтвержден' },
      { value: 'completed', label: 'Завершен' },
      { value: 'cancelled', label: 'Отменен' }
    ];
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" className="all-appointments">
        {/* Заголовок и кнопки */}
        <Box className="page-header">
          <Box>
            <Typography variant="h4" gutterBottom>
              📋 Управление записями
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Все записи на прием в клинику
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<CalendarToday />}
          >
            Новая запись
          </Button>
        </Box>

        {/* Фильтры */}
        <Paper className="filters-section" elevation={2}>
          <Box className="filters-grid">
            <TextField
              label="Поиск..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            
            <FormControl size="small" fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                label="Статус"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {getStatusOptions().map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Дата"
              type="date"
              variant="outlined"
              size="small"
              fullWidth
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            
            <Button 
              variant="outlined" 
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('');
              }}
            >
              Сбросить
            </Button>
          </Box>
        </Paper>

        {/* Таблица записей */}
        <Paper className="table-section" elevation={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Время</TableCell>
                  <TableCell>Клиент</TableCell>
                  <TableCell>Животное</TableCell>
                  <TableCell>Ветеринар</TableCell>
                  <TableCell>Причина</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>{formatDate(appointment.date)}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.clientName}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{appointment.petName}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {appointment.petType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{appointment.vetName}</TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>
                        {getStatusChip(appointment.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Box className="action-buttons">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewDetails(appointment)}
                            title="Просмотр"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => handleViewDetails(appointment)}
                            title="Редактировать"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            title="Удалить"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAppointments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} из ${count}`
            }
          />
        </Paper>

        {/* Диалог просмотра деталей */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          {selectedAppointment && (
            <>
              <DialogTitle>Детали записи #{selectedAppointment.id}</DialogTitle>
              <DialogContent>
                <Box className="appointment-details">
                  <DetailRow label="Клиент" value={selectedAppointment.clientName} />
                  <DetailRow label="Животное" value={`${selectedAppointment.petName} (${selectedAppointment.petType})`} />
                  <DetailRow label="Ветеринар" value={selectedAppointment.vetName} />
                  <DetailRow label="Дата" value={formatDate(selectedAppointment.date)} />
                  <DetailRow label="Время" value={selectedAppointment.time} />
                  <DetailRow label="Причина" value={selectedAppointment.reason} />
                  <DetailRow label="Статус" value={getStatusChip(selectedAppointment.status)} />
                  <DetailRow label="Создана" value={format(new Date(selectedAppointment.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })} />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Закрыть</Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<Edit />}
                >
                  Редактировать
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

// Компонент для отображения деталей
const DetailRow = ({ label, value }) => (
  <Box className="detail-row">
    <Typography variant="subtitle2" className="detail-label">
      {label}:
    </Typography>
    <Typography variant="body2" className="detail-value">
      {value}
    </Typography>
  </Box>
);

export default AllAppointments;
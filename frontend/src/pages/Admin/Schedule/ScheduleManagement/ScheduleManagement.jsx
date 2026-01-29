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
  IconButton,
  Chip,
  Box,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Add,
  CalendarToday,
  Schedule,
  AccessTime,
  EventAvailable,
  EventBusy,
  Person,
  Work,
  Weekend,
  Notifications
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';
import AdminLayout from '../../../../components/admin/layout/AdminLayout';
import './ScheduleManagement.css';

const ScheduleManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [vets, setVets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVet, setSelectedVet] = useState(null);
  const [workingHours, setWorkingHours] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddingException, setIsAddingException] = useState(false);

  // Моковые данные ветеринаров с расписанием
  const mockVets = [
    {
      id: '1',
      name: 'Петрова Анна Сергеевна',
      specialization: 'Терапевт, Дерматолог',
      avatar: '/images/vets/vet1.jpg',
      schedule: {
        workingDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        startTime: '09:00',
        endTime: '18:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        appointmentsPerHour: 3,
        exceptions: [
          { date: '2024-02-05', reason: 'Отпуск', type: 'day_off' },
          { date: '2024-02-12', reason: 'Конференция', type: 'reduced_hours', hours: '10:00-15:00' }
        ]
      },
      status: 'active',
      appointmentsToday: 8,
      nextAvailable: '2024-02-01 14:30'
    },
    {
      id: '2',
      name: 'Сидоров Дмитрий Алексеевич',
      specialization: 'Хирург, Ортопед',
      avatar: '/images/vets/vet2.jpg',
      schedule: {
        workingDays: ['Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        startTime: '10:00',
        endTime: '19:00',
        breakStart: '14:00',
        breakEnd: '15:00',
        appointmentsPerHour: 2,
        exceptions: [
          { date: '2024-02-03', reason: 'Выходной', type: 'day_off' }
        ]
      },
      status: 'active',
      appointmentsToday: 5,
      nextAvailable: '2024-02-01 11:00'
    },
    {
      id: '3',
      name: 'Кузнецова Елена Владимировна',
      specialization: 'Офтальмолог',
      avatar: '/images/vets/vet3.jpg',
      schedule: {
        workingDays: ['Пн', 'Ср', 'Чт', 'Сб'],
        startTime: '08:00',
        endTime: '17:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        appointmentsPerHour: 4,
        exceptions: []
      },
      status: 'active',
      appointmentsToday: 6,
      nextAvailable: '2024-02-02 09:30'
    },
    {
      id: '4',
      name: 'Иванова Ольга Михайловна',
      specialization: 'Стоматолог',
      avatar: '/images/vets/vet4.jpg',
      schedule: {
        workingDays: ['Вт', 'Чт', 'Пт', 'Сб'],
        startTime: '09:30',
        endTime: '18:30',
        breakStart: '13:30',
        breakEnd: '14:30',
        appointmentsPerHour: 3,
        exceptions: [
          { date: '2024-02-07', reason: 'Больничный', type: 'day_off' }
        ]
      },
      status: 'inactive',
      appointmentsToday: 0,
      nextAvailable: '2024-02-10 10:00'
    }
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    // Загрузка данных
    setVets(mockVets);
    
    // Инициализация рабочих часов по умолчанию
    const defaultHours = {};
    mockVets.forEach(vet => {
      defaultHours[vet.id] = vet.schedule;
    });
    setWorkingHours(defaultHours);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditSchedule = (vet) => {
    setSelectedVet(vet);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVet(null);
    setIsAddingException(false);
  };

  const handleWorkingDayToggle = (vetId, day) => {
    setWorkingHours(prev => {
      const vetSchedule = prev[vetId];
      const currentDays = vetSchedule.workingDays;
      
      let newDays;
      if (currentDays.includes(day)) {
        newDays = currentDays.filter(d => d !== day);
      } else {
        newDays = [...currentDays, day];
      }
      
      return {
        ...prev,
        [vetId]: {
          ...vetSchedule,
          workingDays: newDays.sort((a, b) => 
            daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
          )
        }
      };
    });
  };

  const handleTimeChange = (vetId, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [vetId]: {
        ...prev[vetId],
        [field]: value
      }
    }));
  };

  const handleAddException = () => {
    setIsAddingException(true);
  };

  const handleSaveSchedule = () => {
    // Здесь будет сохранение в API
    console.log('Сохранение расписания:', workingHours[selectedVet.id]);
    handleCloseDialog();
  };

  const handleVetStatusToggle = (vetId) => {
    setVets(prev => prev.map(vet => 
      vet.id === vetId 
        ? { ...vet, status: vet.status === 'active' ? 'inactive' : 'active' }
        : vet
    ));
  };

  const filteredVets = vets.filter(vet =>
    vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status) => {
    return status === 'active' 
      ? <Chip label="Активен" color="success" size="small" />
      : <Chip label="Неактивен" color="default" size="small" />;
  };

  const renderVetCard = (vet) => (
    <Grid item xs={12} sm={6} md={4} key={vet.id}>
      <Card className="vet-card">
        <CardContent>
          <Box className="vet-header">
            <Avatar src={vet.avatar} alt={vet.name} className="vet-avatar" />
            <Box className="vet-info">
              <Typography variant="h6">{vet.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {vet.specialization}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getStatusChip(vet.status)}
              </Box>
            </Box>
          </Box>

          <Box className="schedule-summary">
            <Typography variant="subtitle2" gutterBottom>
              Рабочие дни:
            </Typography>
            <Box className="days-grid">
              {daysOfWeek.map(day => (
                <Chip
                  key={day}
                  label={day}
                  size="small"
                  color={vet.schedule.workingDays.includes(day) ? "primary" : "default"}
                  variant={vet.schedule.workingDays.includes(day) ? "filled" : "outlined"}
                  className="day-chip"
                />
              ))}
            </Box>

            <Box className="time-info">
              <DetailItem 
                icon={<AccessTime />}
                label="Часы работы"
                value={`${vet.schedule.startTime} - ${vet.schedule.endTime}`}
              />
              <DetailItem 
                icon={<EventAvailable />}
                label="Перерыв"
                value={`${vet.schedule.breakStart} - ${vet.schedule.breakEnd}`}
              />
              <DetailItem 
                icon={<Work />}
                label="Записей/час"
                value={vet.schedule.appointmentsPerHour}
              />
            </Box>

            {vet.schedule.exceptions.length > 0 && (
              <Box className="exceptions">
                <Typography variant="subtitle2" gutterBottom>
                  Исключения:
                </Typography>
                {vet.schedule.exceptions.slice(0, 2).map((exc, idx) => (
                  <Chip
                    key={idx}
                    label={`${exc.date}: ${exc.reason}`}
                    size="small"
                    color="warning"
                    variant="outlined"
                    className="exception-chip"
                  />
                ))}
                {vet.schedule.exceptions.length > 2 && (
                  <Typography variant="caption" color="textSecondary">
                    +{vet.schedule.exceptions.length - 2} еще
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box className="today-stats">
            <DetailItem 
              icon={<CalendarToday />}
              label="Записей сегодня"
              value={vet.appointmentsToday}
            />
            <DetailItem 
              icon={<EventAvailable />}
              label="Ближайший слот"
              value={vet.nextAvailable}
            />
          </Box>
        </CardContent>

        <Box className="card-actions">
          <Button 
            size="small" 
            startIcon={<Edit />}
            onClick={() => handleEditSchedule(vet)}
            fullWidth
          >
            Редактировать расписание
          </Button>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <AdminLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <Container maxWidth="xl" className="schedule-management">
          {/* Заголовок и кнопки */}
          <Box className="page-header">
            <Box>
              <Typography variant="h4" gutterBottom>
                📅 Управление расписанием
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Настройка рабочих часов и исключений для ветеринаров
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Add />}
            >
              Добавить шаблон
            </Button>
          </Box>

          {/* Табы */}
          <Paper className="tabs-section" elevation={2}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Все ветеринары" />
              <Tab label="Расписание на сегодня" />
              <Tab label="Исключения" />
              <Tab label="Шаблоны" />
            </Tabs>
          </Paper>

          {/* Поиск и фильтры */}
          <Paper className="search-section" elevation={2}>
            <Box className="search-grid">
              <TextField
                label="Поиск ветеринара или специализации"
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              
              <DatePicker
                label="Выберите дату"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
              
              <Button 
                variant="outlined" 
                startIcon={<Notifications />}
              >
                Уведомления
              </Button>
            </Box>
          </Paper>

          {/* Список ветеринаров */}
          <Grid container spacing={3}>
            {filteredVets.map(renderVetCard)}
          </Grid>

          {/* Диалог редактирования расписания */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            {selectedVet && (
              <>
                <DialogTitle>
                  <Box className="dialog-header">
                    <Avatar src={selectedVet.avatar} alt={selectedVet.name} />
                    <Box>
                      <Typography variant="h6">{selectedVet.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedVet.specialization}
                      </Typography>
                    </Box>
                  </Box>
                </DialogTitle>
                
                <DialogContent>
                  <Box className="schedule-editor">
                    {/* Рабочие дни */}
                    <Typography variant="h6" gutterBottom>
                      Рабочие дни
                    </Typography>
                    
                    <Box className="days-selector">
                      {daysOfWeek.map(day => {
                        const vetSchedule = workingHours[selectedVet.id];
                        const isWorking = vetSchedule?.workingDays.includes(day);
                        
                        return (
                          <Tooltip key={day} title={isWorking ? 'Рабочий день' : 'Выходной'}>
                            <Chip
                              label={day}
                              onClick={() => handleWorkingDayToggle(selectedVet.id, day)}
                              color={isWorking ? "primary" : "default"}
                              variant={isWorking ? "filled" : "outlined"}
                              className={`day-selector-chip ${isWorking ? 'working' : 'off'}`}
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>

                    {/* Часы работы */}
                    <Grid container spacing={3} sx={{ mt: 3 }}>
                      <Grid item xs={12} md={6}>
                        <TimePicker
                          label="Начало работы"
                          value={workingHours[selectedVet.id]?.startTime || ''}
                          onChange={(value) => handleTimeChange(selectedVet.id, 'startTime', value)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TimePicker
                          label="Окончание работы"
                          value={workingHours[selectedVet.id]?.endTime || ''}
                          onChange={(value) => handleTimeChange(selectedVet.id, 'endTime', value)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                    </Grid>

                    {/* Перерыв */}
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                      <Grid item xs={12} md={6}>
                        <TimePicker
                          label="Начало перерыва"
                          value={workingHours[selectedVet.id]?.breakStart || ''}
                          onChange={(value) => handleTimeChange(selectedVet.id, 'breakStart', value)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TimePicker
                          label="Окончание перерыва"
                          value={workingHours[selectedVet.id]?.breakEnd || ''}
                          onChange={(value) => handleTimeChange(selectedVet.id, 'breakEnd', value)}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </Grid>
                    </Grid>

                    {/* Записей в час */}
                    <Box sx={{ mt: 3 }}>
                      <TextField
                        label="Максимум записей в час"
                        type="number"
                        value={workingHours[selectedVet.id]?.appointmentsPerHour || 2}
                        onChange={(e) => handleTimeChange(selectedVet.id, 'appointmentsPerHour', e.target.value)}
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                        }}
                        fullWidth
                      />
                    </Box>

                    {/* Исключения */}
                    <Box sx={{ mt: 4 }}>
                      <Box className="exceptions-header">
                        <Typography variant="h6">
                          Исключения из расписания
                        </Typography>
                        <Button 
                          size="small" 
                          startIcon={<Add />}
                          onClick={handleAddException}
                        >
                          Добавить исключение
                        </Button>
                      </Box>
                      
                      {selectedVet.schedule.exceptions.map((exc, idx) => (
                        <Paper key={idx} className="exception-item" elevation={1}>
                          <Box className="exception-content">
                            <Typography variant="body2">
                              <strong>{exc.date}</strong>: {exc.reason}
                            </Typography>
                            <Chip 
                              label={exc.type === 'day_off' ? 'Выходной' : 'Сокращенный день'} 
                              size="small" 
                              color="warning"
                            />
                          </Box>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>

                    {/* Статус ветеринара */}
                    <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={selectedVet.status === 'active'}
                            onChange={() => handleVetStatusToggle(selectedVet.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography>Статус ветеринара</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {selectedVet.status === 'active' 
                                ? 'Активен - принимает пациентов' 
                                : 'Неактивен - не принимает пациентов'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  </Box>
                </DialogContent>
                
                <DialogActions>
                  <Button onClick={handleCloseDialog}>Отмена</Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSaveSchedule}
                  >
                    Сохранить изменения
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </LocalizationProvider>
    </AdminLayout>
  );
};

// Компонент для отображения деталей
const DetailItem = ({ icon, label, value }) => (
  <Box className="detail-item">
    <Box className="detail-icon">{icon}</Box>
    <Box>
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

export default ScheduleManagement;
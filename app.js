// ⚙️ CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://ikczlcmcbrlhdlopkoqg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc';

const { useState, useEffect, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentEventParticipants, setCurrentEventParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionEvent, setSuggestionEvent] = useState(null);
  const [showEventSuggestions, setShowEventSuggestions] = useState(false);
  const [selectedEventForSuggestions, setSelectedEventForSuggestions] = useState(null);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [showEditReminder, setShowEditReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const categories = [
    'Comemoração aniversário',
    'Reunião',
    'Treinamento',
    'Integração',
    'Café com DH',
    'Indicadores',
    'Aniversáriantes do mês',
    'Outros'
  ];

  const statusOptions = [
    'Em sala',
    'Em Reunião',
    'Visita na fazenda'
  ];

  const fetchData = async (key) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/dados?key=eq.${key}`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const data = await response.json();
      return data[0] ? JSON.parse(data[0].value) : [];
    } catch (error) {
      console.error('Erro ao buscar:', error);
      return [];
    }
  };

  const saveData = async (key, value) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/dados?key=eq.${key}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ value: JSON.stringify(value) })
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [usersData, eventsData, locationsData, remindersData] = await Promise.all([
        fetchData('users'),
        fetchData('events'),
        fetchData('locations'),
        fetchData('reminders')
      ]);
      setUsers(usersData);
      setEvents(eventsData);
      setLocations(locationsData);
      setReminders(remindersData);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('Email ou senha incorretos');
    }
  };

  const handleRegister = async (userData) => {
    const currentUsers = await fetchData('users');
    
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      birthDate: userData.birthDate,
      photo: '👤',
      interests: '',
      status: 'Em sala',
      role: 'user',
      vacationStart: '',
      vacationEnd: ''
    };
    
    const updatedUsers = [...currentUsers, newUser];
    setUsers(updatedUsers);
    await saveData('users', updatedUsers);
    
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowRegister(false);
    alert('✅ Conta criada com sucesso!');
  };

  const handleCreateEvent = async (eventData) => {
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      creator: currentUser.id,
      participants: JSON.stringify(eventData.participants),
      confirmed: JSON.stringify([currentUser.id]),
      rejected: JSON.stringify([]),
      suggestions: JSON.stringify([]),
      visibleTo: JSON.stringify(eventData.participants)
    };
    
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    await saveData('events', updatedEvents);
    setShowCreateEvent(false);
  };

  const handleEditEvent = async (eventData) => {
    const updatedEvents = events.map(e => 
      e.id === editingEvent.id ? { ...e, ...eventData } : e
    );
    setEvents(updatedEvents);
    await saveData('events', updatedEvents);
    setShowEditEvent(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      setEvents(updatedEvents);
      await saveData('events', updatedEvents);
    }
  };

  const handleConfirmPresence = async (eventId, status) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        const confirmed = typeof e.confirmed === 'string' ? JSON.parse(e.confirmed) : (e.confirmed || []);
        const rejected = typeof e.rejected === 'string' ? JSON.parse(e.rejected) : (e.rejected || []);
        
        let newConfirmed = confirmed.filter(id => id !== currentUser.id);
        let newRejected = rejected.filter(id => id !== currentUser.id);
        
        if (status === 'confirmed') {
          newConfirmed = [...newConfirmed, currentUser.id];
        } else if (status === 'rejected') {
          newRejected = [...newRejected, currentUser.id];
        }
        
        return {
          ...e,
          confirmed: JSON.stringify(newConfirmed),
          rejected: JSON.stringify(newRejected)
        };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    await saveData('events', updatedEvents);
  };

  const handleAddSuggestion = async (eventId, suggestion) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        const suggestions = typeof e.suggestions === 'string' ? JSON.parse(e.suggestions) : (e.suggestions || []);
        const newSuggestion = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          text: suggestion,
          date: new Date().toISOString()
        };
        return {
          ...e,
          suggestions: JSON.stringify([...suggestions, newSuggestion])
        };
      }
      return e;
    });
    
    setEvents(updatedEvents);
    await saveData('events', updatedEvents);
    setShowSuggestionModal(false);
  };

  const handleCreateReminder = async (reminderData) => {
    const newReminder = {
      id: Date.now().toString(),
      ...reminderData,
      creator: currentUser.id,
      createdAt: new Date().toISOString(),
      visibleTo: JSON.stringify(reminderData.visibleTo)
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    await saveData('reminders', updatedReminders);
    setShowCreateReminder(false);
  };

  const handleEditReminder = async (reminderData) => {
    const updatedReminders = reminders.map(r => 
      r.id === editingReminder.id ? { ...r, ...reminderData } : r
    );
    setReminders(updatedReminders);
    await saveData('reminders', updatedReminders);
    setShowEditReminder(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = async (reminderId) => {
    if (confirm('Tem certeza que deseja deletar este lembrete?')) {
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      setReminders(updatedReminders);
      await saveData('reminders', updatedReminders);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const updatedUser = { ...currentUser, status: newStatus };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    await saveData('users', updatedUsers);
    setShowStatusModal(false);
  };

  const handleUpdateVacation = async (vacationStart, vacationEnd) => {
    const updatedUser = { ...currentUser, vacationStart, vacationEnd };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    await saveData('users', updatedUsers);
  };

  const handleAddLocation = async (locationData) => {
    const newLocation = {
      id: Date.now().toString(),
      userId: currentUser.id,
      ...locationData
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    await saveData('locations', updatedLocations);
    setShowAddLocation(false);
  };

  const isUserOnVacation = (userId) => {
    const user = users.find(u => u.id == userId);
    if (!user?.vacationStart || !user?.vacationEnd) return false;
    
    const now = new Date();
    const start = new Date(user.vacationStart);
    const end = new Date(user.vacationEnd);
    
    return now >= start && now <= end;
  };

  const getVacationInfo = (userId) => {
    const user = users.find(u => u.id == userId);
    if (!user?.vacationStart || !user?.vacationEnd) return null;
    
    return {
      start: new Date(user.vacationStart).toLocaleDateString('pt-BR'),
      end: new Date(user.vacationEnd).toLocaleDateString('pt-BR'),
      isActive: isUserOnVacation(userId)
    };
  };

  const getUserLocation = (userId) => {
    if (isUserOnVacation(userId)) return 'Em Férias 🏖️';
    
    const now = new Date();
    const userLocations = locations.filter(l => l.userId == userId);
    
    for (const loc of userLocations) {
      const start = new Date(`${loc.startDate}T${loc.startTime}`);
      const end = new Date(`${loc.endDate}T${loc.endTime}`);
      if (now >= start && now <= end) {
        return loc.location;
      }
    }
    return 'Localização não informada';
  };

  const getUserStatus = (userId) => {
    if (isUserOnVacation(userId)) return 'Em Férias';
    const user = users.find(u => u.id == userId);
    return user?.status || 'Em sala';
  };

  const canEditEvent = (event) => {
    if (!currentUser) return false;
    return event.creator === currentUser.id || currentUser.role === 'admin';
  };

  const canEditReminder = (reminder) => {
    if (!currentUser) return false;
    return reminder.creator === currentUser.id || currentUser.role === 'admin';
  };

  const getActiveReminders = () => {
    const now = new Date();
    return reminders.filter(reminder => {
      const visibleTo = typeof reminder.visibleTo === 'string' ? JSON.parse(reminder.visibleTo) : reminder.visibleTo;
      if (!visibleTo.includes(currentUser.id)) return false;
      
      if (reminder.hasExpiration && reminder.expirationDate) {
        const expDate = new Date(reminder.expirationDate);
        return now <= expDate;
      }
      return true;
    });
  };

  const getBirthdaysForDate = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    
    return users.filter(user => {
      if (!user.birthDate) return false;
      const birthDateParts = user.birthDate.split('-');
      const birthMonth = parseInt(birthDateParts[1]) - 1;
      const birthDay = parseInt(birthDateParts[2]);
      return birthMonth === month && birthDay === day;
    });
  };

  const getBirthdaysInMonth = (month) => {
    return users.filter(user => {
      if (!user.birthDate) return false;
      const birthDateParts = user.birthDate.split('-');
      const birthMonth = parseInt(birthDateParts[1]) - 1;
      return birthMonth === month;
    });
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (!currentUser || !event.date) return false;
      const visibleTo = typeof event.visibleTo === 'string' ? JSON.parse(event.visibleTo) : event.visibleTo;
      return event.date === dateStr && visibleTo.includes(currentUser.id);
    });
  };

  if (loading) {
    return h('div', { className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4' },
      h('div', { className: 'text-center bg-white rounded-2xl p-8 max-w-md' },
        h('div', { className: 'text-6xl mb-4 animate-bounce' }, '📍'),
        h('p', { className: 'text-gray-800 text-xl font-semibold mb-2' }, 'Onde Estou'),
        h('p', { className: 'text-gray-600' }, 'Conectando à base compartilhada...')
      )
    );
  }

  if (!isLoggedIn) {
    if (showRegister) {
      return h(RegisterScreen, { handleRegister, setShowRegister, users });
    }
    return h(LoginScreen, { handleLogin, setShowRegister });
  }

  return h('div', { className: 'min-h-screen bg-gray-50' },
    h(Header, { currentUser, getBirthdaysInMonth, setShowProfile, setShowStatusModal, getUserStatus, isUserOnVacation }),
    currentView === 'home' && h(HomeView, {
      currentUser, getUserLocation, getBirthdaysForDate, events,
      setShowCreateEvent, setShowAddLocation, users, handleConfirmPresence,
      setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal,
      setShowEventSuggestions, setSelectedEventForSuggestions
    }),
    currentView === 'calendar' && h(CalendarView, {
      selectedDate, setSelectedDate, getEventsForDate,
      getBirthdaysForDate, currentUser, users, events, handleConfirmPresence,
      setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal,
      setShowEventSuggestions, setSelectedEventForSuggestions
    }),
    currentView === 'people' && h(PeopleView, {
      users, currentUser, getUserLocation, getUserStatus, isUserOnVacation, getVacationInfo
    }),
    currentView === 'reminders' && h(RemindersView, {
      reminders: getActiveReminders(), users, currentUser, setShowCreateReminder, canEditReminder, handleDeleteReminder, setEditingReminder, setShowEditReminder
    }),
    h(Navigation, { currentView, setCurrentView }),
    showCreateEvent && h(CreateEventModal, {
      setShowCreateEvent, handleCreateEvent, categories, users, currentUser
    }),
    showEditEvent && h(EditEventModal, {
      setShowEditEvent, handleEditEvent, categories, users, currentUser, editingEvent
    }),
    showAddLocation && h(AddLocationModal, {
      setShowAddLocation, handleAddLocation
    }),
    showProfile && h(ProfileModal, {
      currentUser, getUserLocation, setShowProfile, setIsLoggedIn, setCurrentUser, getUserStatus, 
      handleUpdateVacation, isUserOnVacation, getVacationInfo
    }),
    showStatusModal && h(StatusModal, {
      setShowStatusModal, handleUpdateStatus, statusOptions, currentUser, isUserOnVacation
    }),
    showParticipants && h(ParticipantsModal, {
      currentEventParticipants, users, getUserLocation, setShowParticipants, getUserStatus, events
    }),
    showSuggestionModal && h(SuggestionModal, {
      setShowSuggestionModal, handleAddSuggestion, suggestionEvent
    }),
    showEventSuggestions && h(EventSuggestionsModal, {
      setShowEventSuggestions, selectedEventForSuggestions, users
    }),
    showCreateReminder && h(CreateReminderModal, {
      setShowCreateReminder, handleCreateReminder, users, currentUser
    }),
    showEditReminder && h(EditReminderModal, {
      setShowEditReminder, handleEditReminder, users, currentUser, editingReminder
    })
  );
};

const LoginScreen = ({ handleLogin, setShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    if (!email || !password) {
      alert('Preencha todos os campos');
      return;
    }
    handleLogin(email, password);
  };

  return h('div', { className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4' },
    h('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full' },
      h('div', { className: 'text-center mb-8' },
        h('div', { className: 'text-6xl mb-4' }, '📍'),
        h('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' }, 'Onde Estou'),
        h('p', { className: 'text-gray-600' }, 'Conecte-se com pessoas e eventos')
      ),
      h('div', { className: 'space-y-4' },
        h('input', {
          type: 'email',
          placeholder: 'Email',
          value: email,
          onChange: (e) => setEmail(e.target.value),
          className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        }),
        h('input', {
          type: 'password',
          placeholder: 'Senha',
          value: password,
          onChange: (e) => setPassword(e.target.value),
          onKeyPress: (e) => e.key === 'Enter' && onLogin(),
          className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        }),
        h('button', {
          onClick: onLogin,
          className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
        }, 'Entrar'),
        h('button', {
          onClick: () => setShowRegister(true),
          className: 'w-full border border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition'
        }, 'Criar Conta')
      )
    )
  );
};const RegisterScreen = ({ handleRegister, setShowRegister, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });
  const [error, setError] = useState('');

  const onSubmit = () => {
    setError('');
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.birthDate) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (users.some(u => u.email === formData.email)) {
      setError('Este email já está cadastrado');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    handleRegister(userData);
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Criar Conta'),
          h('button', { onClick: () => setShowRegister(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        error && h('div', { className: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4' }, error),
        h('div', { className: 'space-y-4' },
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Nome Completo *'),
            h('input', {
              type: 'text',
              value: formData.name,
              onChange: (e) => setFormData({...formData, name: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Seu nome completo'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email *'),
            h('input', {
              type: 'email',
              value: formData.email,
              onChange: (e) => setFormData({...formData, email: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'seu@email.com'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Senha *'),
            h('input', {
              type: 'password',
              value: formData.password,
              onChange: (e) => setFormData({...formData, password: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Mínimo 6 caracteres'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Confirmar Senha *'),
            h('input', {
              type: 'password',
              value: formData.confirmPassword,
              onChange: (e) => setFormData({...formData, confirmPassword: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Digite a senha novamente'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data de Nascimento *'),
            h('input', {
              type: 'date',
              value: formData.birthDate,
              onChange: (e) => setFormData({...formData, birthDate: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            })
          ),
          h('button', {
            onClick: onSubmit,
            className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
          }, 'Criar Conta')
        )
      )
    )
  );
};

const Header = ({ currentUser, getBirthdaysInMonth, setShowProfile, setShowStatusModal, getUserStatus, isUserOnVacation }) => {
  const currentStatus = getUserStatus(currentUser.id);
  const statusColors = {
    'Em sala': 'bg-green-500',
    'Em Reunião': 'bg-yellow-500',
    'Visita na fazenda': 'bg-blue-500',
    'Em Férias': 'bg-orange-500'
  };

  return h('div', { className: 'bg-white shadow-sm border-b sticky top-0 z-10' },
    h('div', { className: 'max-w-6xl mx-auto px-4 py-4 flex items-center justify-between' },
      h('div', { className: 'flex items-center gap-2' },
        h(MapPin, { className: 'text-purple-600', size: 28 }),
        h('h1', { className: 'text-xl font-bold text-gray-800' }, 'Onde Estou')
      ),
      h('div', { className: 'flex items-center gap-4' },
        h('button', {
          onClick: () => setShowStatusModal(true),
          className: 'flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition'
        },
          h('div', { className: `w-3 h-3 rounded-full ${statusColors[currentStatus]}` }),
          h('span', { className: 'text-sm font-medium text-gray-700' }, currentStatus)
        ),
        h('button', { className: 'relative' },
          h(Bell, { className: 'text-gray-600', size: 24 }),
          h('span', {
            className: 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'
          }, getBirthdaysInMonth(new Date().getMonth()).length)
        ),
        h('button', { onClick: () => setShowProfile(true) },
          h('div', { className: 'text-2xl' }, currentUser?.photo)
        )
      )
    )
  );
};

const StatusModal = ({ setShowStatusModal, handleUpdateStatus, statusOptions, currentUser, isUserOnVacation }) => {
  const onVacation = isUserOnVacation(currentUser.id);

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Selecionar Status'),
          h('button', { onClick: () => setShowStatusModal(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        onVacation && h('div', { className: 'bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4' },
          '🏖️ Você está em período de férias'
        ),
        h('div', { className: 'space-y-3' },
          ...statusOptions.map(status => {
            const statusIcons = {
              'Em sala': '🏢',
              'Em Reunião': '👥',
              'Visita na fazenda': '🚜'
            };
            const statusColors = {
              'Em sala': 'bg-green-50 border-green-200 hover:bg-green-100',
              'Em Reunião': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
              'Visita na fazenda': 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            };

            return h('button', {
              key: status,
              onClick: () => handleUpdateStatus(status),
              disabled: onVacation,
              className: `w-full p-4 border-2 rounded-lg transition ${statusColors[status]} flex items-center gap-3 ${onVacation ? 'opacity-50 cursor-not-allowed' : ''}`
            },
              h('span', { className: 'text-3xl' }, statusIcons[status]),
              h('div', { className: 'text-left flex-1' },
                h('div', { className: 'font-semibold text-gray-800' }, status),
                h('div', { className: 'text-sm text-gray-600' }, 
                  status === 'Em sala' ? 'Disponível no escritório' :
                  status === 'Em Reunião' ? 'Em reunião - não disponível' :
                  'Visitando fazenda'
                )
              ),
              currentUser.status === status && h('span', { className: 'text-green-600 text-xl' }, '✓')
            );
          })
        )
      )
    )
  );
};

const Navigation = ({ currentView, setCurrentView }) => {
  return h('div', { className: 'bg-white border-t fixed bottom-0 left-0 right-0 z-10' },
    h('div', { className: 'max-w-6xl mx-auto px-4 py-3 flex justify-around' },
      h('button', {
        onClick: () => setCurrentView('home'),
        className: `flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-purple-600' : 'text-gray-500'}`
      },
        h(MapPin, { size: 24 }),
        h('span', { className: 'text-xs' }, 'Início')
      ),
      h('button', {
        onClick: () => setCurrentView('calendar'),
        className: `flex flex-col items-center gap-1 ${currentView === 'calendar' ? 'text-purple-600' : 'text-gray-500'}`
      },
        h(Calendar, { size: 24 }),
        h('span', { className: 'text-xs' }, 'Calendário')
      ),
      h('button', {
        onClick: () => setCurrentView('reminders'),
        className: `flex flex-col items-center gap-1 ${currentView === 'reminders' ? 'text-purple-600' : 'text-gray-500'}`
      },
        h(StickyNote, { size: 24 }),
        h('span', { className: 'text-xs' }, 'Lembretes')
      ),
      h('button', {
        onClick: () => setCurrentView('people'),
        className: `flex flex-col items-center gap-1 ${currentView === 'people' ? 'text-purple-600' : 'text-gray-500'}`
      },
        h(Users, { size: 24 }),
        h('span', { className: 'text-xs' }, 'Pessoas')
      )
    )
  );
};const RemindersView = ({ reminders, users, currentUser, setShowCreateReminder, canEditReminder, handleDeleteReminder, setEditingReminder, setShowEditReminder }) => {
  return h('div', { className: 'max-w-6xl mx-auto px-4 py-6 pb-24' },
    h('div', { className: 'flex items-center justify-between mb-6' },
      h('h2', { className: 'text-2xl font-bold text-gray-800' }, '📝 Lembretes'),
      h('button', {
        onClick: () => setShowCreateReminder(true),
        className: 'bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition'
      },
        h(Plus, { size: 20 }),
        'Novo Lembrete'
      )
    ),
    h('div', { className: 'space-y-4' },
      reminders.length > 0 ? reminders.map(reminder => {
        const creator = users.find(u => u.id === reminder.creator);
        const canEdit = canEditReminder(reminder);
        const isExpiringSoon = reminder.hasExpiration && reminder.expirationDate && 
          new Date(reminder.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        return h('div', { 
          key: reminder.id, 
          className: `bg-white rounded-xl shadow-sm border-2 p-4 hover:shadow-md transition ${isExpiringSoon ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`
        },
          h('div', { className: 'flex items-start justify-between mb-3' },
            h('div', { className: 'flex-1' },
              h('h3', { className: 'font-bold text-gray-800 text-lg mb-1' }, reminder.title),
              isExpiringSoon && h('span', { className: 'text-xs bg-orange-500 text-white px-2 py-1 rounded-full' }, '⚠️ Expira em breve')
            ),
            h('div', { className: 'flex items-center gap-2' },
              canEdit && h('button', {
                onClick: () => {
                  setEditingReminder(reminder);
                  setShowEditReminder(true);
                },
                className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
              }, '✏️'),
              canEdit && h('button', {
                onClick: () => handleDeleteReminder(reminder.id),
                className: 'text-red-600 hover:text-red-700 text-sm font-medium'
              }, '🗑️')
            )
          ),
          h('p', { className: 'text-gray-700 mb-3 whitespace-pre-wrap' }, reminder.description),
          h('div', { className: 'flex items-center gap-4 text-sm text-gray-600' },
            h('div', { className: 'flex items-center gap-1' },
              h('span', null, '👤'),
              h('span', null, creator?.name || 'Usuário')
            ),
            reminder.hasExpiration && reminder.expirationDate && h('div', { className: 'flex items-center gap-1' },
              h(Calendar, { size: 16 }),
              h('span', null, `Expira: ${new Date(reminder.expirationDate).toLocaleDateString('pt-BR')}`)
            ),
            !reminder.hasExpiration && h('div', { className: 'flex items-center gap-1 text-green-600' },
              h('span', null, '♾️'),
              h('span', null, 'Sem data limite')
            )
          )
        );
      }) : h('div', { className: 'text-center text-gray-500 py-12 bg-white rounded-xl' },
        h('div', { className: 'text-6xl mb-4' }, '📝'),
        h('p', null, 'Nenhum lembrete ativo'),
        h('p', { className: 'text-sm mt-2' }, 'Crie um lembrete para começar')
      )
    )
  );
};

const CreateReminderModal = ({ setShowCreateReminder, handleCreateReminder, users, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hasExpiration: false,
    expirationDate: '',
    visibleTo: []
  });

  const onSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Por favor, preencha o título e a descrição');
      return;
    }

    if (formData.hasExpiration && !formData.expirationDate) {
      alert('Por favor, defina a data de expiração');
      return;
    }

    if (formData.visibleTo.length === 0) {
      alert('Por favor, selecione pelo menos um destinatário');
      return;
    }

    handleCreateReminder({
      ...formData,
      visibleTo: [...formData.visibleTo, currentUser.id]
    });
  };

  const toggleUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(userId)
        ? prev.visibleTo.filter(id => id !== userId)
        : [...prev.visibleTo, userId]
    }));
  };

  const selectAllUsers = () => {
    setFormData(prev => ({
      ...prev,
      visibleTo: users.filter(u => u.id !== currentUser.id).map(u => u.id)
    }));
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '📝 Novo Lembrete'),
          h('button', { onClick: () => setShowCreateReminder(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'space-y-4 max-h-96 overflow-y-auto' },
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Título *'),
            h('input', {
              type: 'text',
              value: formData.title,
              onChange: (e) => setFormData({...formData, title: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Ex: Reunião com fornecedor'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Descrição *'),
            h('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              rows: 4,
              placeholder: 'Descreva o lembrete...'
            })
          ),
          h('div', { className: 'border-t pt-4' },
            h('label', { className: 'flex items-center gap-2 mb-3' },
              h('input', {
                type: 'checkbox',
                checked: formData.hasExpiration,
                onChange: (e) => setFormData({...formData, hasExpiration: e.target.checked}),
                className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500'
              }),
              h('span', { className: 'text-sm font-medium text-gray-700' }, 'Definir data de expiração')
            ),
            formData.hasExpiration && h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data de Expiração'),
              h('input', {
                type: 'date',
                value: formData.expirationDate,
                onChange: (e) => setFormData({...formData, expirationDate: e.target.value}),
                min: new Date().toISOString().split('T')[0],
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('div', null,
            h('div', { className: 'flex items-center justify-between mb-2' },
              h('label', { className: 'block text-sm font-medium text-gray-700' }, 'Quem pode ver?'),
              h('button', {
                onClick: selectAllUsers,
                className: 'text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200'
              }, 'Todos')
            ),
            h('div', { className: 'border border-gray-300 rounded-lg max-h-48 overflow-y-auto' },
              ...users.filter(u => u.id !== currentUser.id).map(user =>
                h('label', {
                  key: user.id,
                  className: 'flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                },
                  h('input', {
                    type: 'checkbox',
                    checked: formData.visibleTo.includes(user.id),
                    onChange: () => toggleUser(user.id),
                    className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500'
                  }),
                  h('div', { className: 'text-xl' }, user.photo),
                  h('span', { className: 'text-sm' }, user.name)
                )
              )
            ),
            h('p', { className: 'text-xs text-gray-500 mt-2' },
              formData.visibleTo.length === 0 ? 'Selecione destinatários' : `${formData.visibleTo.length} pessoa(s) selecionada(s)`
            )
          ),
          h('button', {
            onClick: onSubmit,
            className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
          }, 'Criar Lembrete')
        )
      )
    )
  );
};

const EditReminderModal = ({ setShowEditReminder, handleEditReminder, users, currentUser, editingReminder }) => {
  const [formData, setFormData] = useState({
    title: editingReminder?.title || '',
    description: editingReminder?.description || '',
    hasExpiration: editingReminder?.hasExpiration || false,
    expirationDate: editingReminder?.expirationDate || ''
  });

  const onSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Por favor, preencha o título e a descrição');
      return;
    }

    if (formData.hasExpiration && !formData.expirationDate) {
      alert('Por favor, defina a data de expiração');
      return;
    }

    handleEditReminder(formData);
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '✏️ Editar Lembrete'),
          h('button', { onClick: () => setShowEditReminder(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'space-y-4 max-h-96 overflow-y-auto' },
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Título *'),
            h('input', {
              type: 'text',
              value: formData.title,
              onChange: (e) => setFormData({...formData, title: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Ex: Reunião com fornecedor'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Descrição *'),
            h('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              rows: 4,
              placeholder: 'Descreva o lembrete...'
            })
          ),
          h('div', { className: 'border-t pt-4' },
            h('label', { className: 'flex items-center gap-2 mb-3' },
              h('input', {
                type: 'checkbox',
                checked: formData.hasExpiration,
                onChange: (e) => setFormData({...formData, hasExpiration: e.target.checked}),
                className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500'
              }),
              h('span', { className: 'text-sm font-medium text-gray-700' }, 'Definir data de expiração')
            ),
            formData.hasExpiration && h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data de Expiração'),
              h('input', {
                type: 'date',
                value: formData.expirationDate,
                onChange: (e) => setFormData({...formData, expirationDate: e.target.value}),
                min: new Date().toISOString().split('T')[0],
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('button', {
            onClick: onSubmit,
            className: 'w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition'
          }, 'Salvar Alterações')
        )
      )
    )
  );
};// NOTA: Cole esta parte depois da PARTE 3
// Esta parte contém: HomeView, EventCard, CalendarView, PeopleView e outros componentes

// Como o código completo é muito extenso, mantenha os componentes que já existem:
// - HomeView
// - EventCard  
// - CalendarView
// - PeopleView
// - CreateEventModal
// - EditEventModal
// - AddLocationModal
// - ProfileModal
// - ParticipantsModal
// - SuggestionModal
// - EventSuggestionsModal

// E adicione no final:

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

// INSTRUÇÕES IMPORTANTES:
// 1. Cole PARTE 1 primeiro
// 2. Cole PARTE 2 em seguida
// 3. Cole PARTE 3 depois
// 4. Os componentes HomeView, EventCard, CalendarView, etc. da v2 PARTE 2 e PARTE 3 continuam iguais
// 5. Cole esta linha final: const root = ReactDOM.createRoot(document.getElementById('root')); root.render(React.createElement(App));

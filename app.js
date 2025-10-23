// ⚙️ CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://ikczlcmcbrlhdlopkoqg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc';

// Nota: useState, useEffect e h já estão declarados em globals.js

// Funções de API
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

// 🎯 COMPONENTE PRINCIPAL APP
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
  const [showStatusModal, setShowStatusModal] = useState(false);
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
      return h(window.AuthComponents.RegisterScreen, { handleRegister, setShowRegister, users });
    }
    return h(window.AuthComponents.LoginScreen, { handleLogin, setShowRegister });
  }

  return h('div', { className: 'min-h-screen bg-gray-50' },
    h(window.AuthComponents.Header, { currentUser, getBirthdaysInMonth, setShowProfile, setShowStatusModal, getUserStatus, isUserOnVacation }),
    currentView === 'home' && h(window.ViewComponents.HomeView, {
      currentUser, getUserLocation, getBirthdaysForDate, events,
      setShowCreateEvent, setShowAddLocation, users, handleConfirmPresence,
      setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal,
      setShowEventSuggestions, setSelectedEventForSuggestions
    }),
    currentView === 'calendar' && h(window.ViewComponents.CalendarView, {
      selectedDate, setSelectedDate, getEventsForDate,
      getBirthdaysForDate, currentUser, users, events, handleConfirmPresence,
      setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal,
      setShowEventSuggestions, setSelectedEventForSuggestions
    }),
    currentView === 'people' && h(window.ViewComponents.PeopleView, {
      users, currentUser, getUserLocation, getUserStatus, isUserOnVacation, getVacationInfo
    }),
    currentView === 'reminders' && h(window.ViewComponents.RemindersView, {
      reminders: getActiveReminders(), users, currentUser, setShowCreateReminder, canEditReminder, handleDeleteReminder, setEditingReminder, setShowEditReminder
    }),
    h(window.AuthComponents.Navigation, { currentView, setCurrentView }),
    showCreateEvent && h(window.ModalComponents.CreateEventModal, {
      setShowCreateEvent, handleCreateEvent, categories, users, currentUser
    }),
    showEditEvent && h(window.ModalComponents.EditEventModal, {
      setShowEditEvent, handleEditEvent, categories, users, currentUser, editingEvent
    }),
    showAddLocation && h(window.ModalComponents.AddLocationModal, {
      setShowAddLocation, handleAddLocation
    }),
    showProfile && h(window.ModalComponents.ProfileModal, {
      currentUser, getUserLocation, setShowProfile, setIsLoggedIn, setCurrentUser, getUserStatus, 
      handleUpdateVacation, isUserOnVacation, getVacationInfo
    }),
    showStatusModal && h(window.ModalComponents.StatusModal, {
      setShowStatusModal, handleUpdateStatus, statusOptions, currentUser, isUserOnVacation
    }),
    showSuggestionModal && h(window.ModalComponents.SuggestionModal, {
      setShowSuggestionModal, handleAddSuggestion, suggestionEvent
    }),
    showEventSuggestions && h(window.ModalComponents.EventSuggestionsModal, {
      setShowEventSuggestions, selectedEventForSuggestions, users
    }),
    showCreateReminder && h(window.ModalComponents.CreateReminderModal, {
      setShowCreateReminder, handleCreateReminder, users, currentUser
    }),
    showEditReminder && h(window.ModalComponents.EditReminderModal, {
      setShowEditReminder, handleEditReminder, users, currentUser, editingReminder
    })
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

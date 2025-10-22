// ⚙️ CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://ikczlcmcbrlhdlopkoqg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc';

const { useState, useEffect, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

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
root.render(React.createElement(App));// 📱 COMPONENTES DE VISUALIZAÇÃO


// Home View
const HomeView = ({ currentUser, getUserLocation, getBirthdaysForDate, events, setShowCreateEvent, setShowAddLocation, users, handleConfirmPresence, setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal, setShowEventSuggestions, setSelectedEventForSuggestions }) => {
  const userLocation = getUserLocation(currentUser.id);
  const todayBirthdays = getBirthdaysForDate(new Date());
  const upcomingEvents = events
    .filter(e => {
      const visibleTo = typeof e.visibleTo === 'string' ? JSON.parse(e.visibleTo) : e.visibleTo;
      return visibleTo.includes(currentUser.id);
    })
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 3);

  return h('div', { className: 'max-w-6xl mx-auto px-4 py-6 pb-24' },
    h('div', { className: 'bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white mb-6' },
      h('h2', { className: 'text-2xl font-bold mb-2' }, `Olá, ${currentUser?.name.split(' ')[0]}! 👋`),
      h('div', { className: 'flex items-center gap-2 mt-3' },
        h(MapPin, { size: 20 }),
        h('span', null, userLocation)
      ),
      h('button', {
        onClick: () => setShowAddLocation(true),
        className: 'mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition'
      },
        h(Plus, { size: 16 }),
        'Atualizar Localização'
      )
    ),
    todayBirthdays.length > 0 && h('div', { className: 'bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6' },
      h('h3', { className: 'font-bold text-pink-800 mb-3 flex items-center gap-2' },
        h(Gift, { size: 20 }),
        'Aniversariantes de Hoje 🎉'
      ),
      ...todayBirthdays.map(user =>
        h('div', { key: user.id, className: 'flex items-center gap-3 mb-2' },
          h('div', { className: 'text-2xl' }, user.photo),
          h('div', { className: 'font-medium' }, user.name)
        )
      )
    ),
    h('div', { className: 'flex items-center justify-between mb-4' },
      h('h3', { className: 'text-lg font-bold text-gray-800' }, 'Próximos Eventos'),
      h('button', {
        onClick: () => setShowCreateEvent(true),
        className: 'bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition'
      },
        h(Plus, { size: 20 }),
        'Criar'
      )
    ),
    h('div', { className: 'space-y-4' },
      upcomingEvents.length > 0 ? upcomingEvents.map(event =>
        h(EventCard, { 
          key: event.id, 
          event, 
          users, 
          currentUser, 
          handleConfirmPresence,
          setEditingEvent,
          setShowEditEvent,
          getUserStatus,
          canEditEvent,
          handleDeleteEvent,
          setSuggestionEvent,
          setShowSuggestionModal,
          setShowEventSuggestions,
          setSelectedEventForSuggestions
        })
      ) : h('div', { className: 'text-center text-gray-500 py-8 bg-white rounded-xl' }, 'Nenhum evento próximo')
    )
  );
};

// Calendar View
const CalendarView = ({ selectedDate, setSelectedDate, getEventsForDate, getBirthdaysForDate, currentUser, users, events, handleConfirmPresence, setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal, setShowEventSuggestions, setSelectedEventForSuggestions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const eventsForSelectedDate = getEventsForDate(selectedDate);
  const birthdaysForSelectedDate = getBirthdaysForDate(selectedDate);

  return h('div', { className: 'max-w-6xl mx-auto px-4 py-6 pb-24' },
    h('div', { className: 'bg-white rounded-xl shadow-sm border p-4 mb-6' },
      h('div', { className: 'flex items-center justify-between mb-4' },
        h('button', {
          onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)),
          className: 'px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200'
        }, '←'),
        h('h2', { className: 'text-xl font-bold text-gray-800' },
          `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
        ),
        h('button', {
          onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)),
          className: 'px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200'
        }, '→')
      ),
      h('div', { className: 'grid grid-cols-7 gap-2 mb-2' },
        ...['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day =>
          h('div', { key: day, className: 'text-center text-sm font-semibold text-gray-600 py-2' }, day)
        )
      ),
      h('div', { className: 'grid grid-cols-7 gap-2' },
        ...days.map((day, index) => {
          if (!day) {
            return h('div', { key: index, className: 'aspect-square' });
          }

          const hasEvents = getEventsForDate(day).length > 0;
          const hasBirthdays = getBirthdaysForDate(day).length > 0;
          const isSelected = selectedDate.toDateString() === day.toDateString();
          const isToday = new Date().toDateString() === day.toDateString();

          return h('button', {
            key: index,
            onClick: () => setSelectedDate(day),
            className: `aspect-square rounded-lg p-2 text-sm relative ${
              isSelected
                ? 'bg-purple-600 text-white'
                : isToday
                ? 'bg-blue-100 text-blue-700 font-bold'
                : 'bg-gray-50 hover:bg-gray-100'
            }`
          },
            h('div', { className: 'font-medium' }, day.getDate()),
            h('div', { className: 'flex gap-1 justify-center mt-1' },
              hasEvents && h('div', { className: `w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}` }),
              hasBirthdays && h('div', { className: `w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}` })
            )
          );
        })
      )
    ),
    h('div', { className: 'space-y-4' },
      h('h3', { className: 'text-lg font-bold text-gray-800' },
        selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
      ),
      birthdaysForSelectedDate.length > 0 && h('div', { className: 'bg-pink-50 border border-pink-200 rounded-xl p-4' },
        h('h4', { className: 'font-bold text-pink-800 mb-3 flex items-center gap-2' },
          h(Cake, { size: 20 }),
          'Aniversariantes do Dia'
        ),
        ...birthdaysForSelectedDate.map(user =>
          h('div', { key: user.id, className: 'flex items-center gap-3 mb-2' },
            h('div', { className: 'text-2xl' }, user.photo),
            h('div', null,
              h('div', { className: 'font-medium' }, user.name),
              h('div', { className: 'text-sm text-gray-600' },
                `${new Date().getFullYear() - parseInt(user.birthDate.split('-')[0])} anos`
              )
            )
          )
        )
      ),
      eventsForSelectedDate.length > 0 ? eventsForSelectedDate.map(event =>
        h(EventCard, { 
          key: event.id, 
          event, 
          users, 
          currentUser,
          handleConfirmPresence,
          setEditingEvent,
          setShowEditEvent,
          getUserStatus,
          canEditEvent,
          handleDeleteEvent,
          setSuggestionEvent,
          setShowSuggestionModal,
          setShowEventSuggestions,
          setSelectedEventForSuggestions
        })
      ) : h('div', { className: 'text-center text-gray-500 py-8 bg-white rounded-xl' }, 'Nenhum evento nesta data')
    )
  );
};

// People View
const PeopleView = ({ users, currentUser, getUserLocation, getUserStatus, isUserOnVacation, getVacationInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(u => 
    u.id !== currentUser.id &&
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    'Em sala': 'bg-green-500',
    'Em Reunião': 'bg-yellow-500',
    'Visita na fazenda': 'bg-blue-500',
    'Em Férias': 'bg-orange-500'
  };

  return h('div', { className: 'max-w-6xl mx-auto px-4 py-6 pb-24' },
    h('div', { className: 'mb-6' },
      h('div', { className: 'relative' },
        h(Search, { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400', size: 20 }),
        h('input', {
          type: 'text',
          placeholder: 'Buscar pessoas...',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
        })
      )
    ),
    h('div', { className: 'space-y-4' },
      ...filteredUsers.map(user => {
        const userStatus = getUserStatus(user.id);
        const vacationInfo = getVacationInfo(user.id);
        
        return h('div', { key: user.id, className: 'bg-white rounded-xl shadow-sm border p-4' },
          h('div', { className: 'flex items-center gap-3' },
            h('div', { className: 'text-4xl' }, user.photo),
            h('div', { className: 'flex-1' },
              h('h4', { className: 'font-semibold text-gray-800' }, user.name),
              h('p', { className: 'text-sm text-gray-500 flex items-center gap-1' },
                h(MapPin, { size: 14 }),
                getUserLocation(user.id)
              ),
              h('div', { className: 'flex items-center gap-2 mt-1' },
                h('div', { className: `w-2 h-2 rounded-full ${statusColors[userStatus]}` }),
                h('span', { className: 'text-xs text-gray-600' }, userStatus)
              ),
              vacationInfo && h('div', { className: 'mt-2 bg-orange-50 border border-orange-200 rounded p-2' },
                h('p', { className: 'text-xs text-orange-800 font-medium' }, '🏖️ Férias'),
                h('p', { className: 'text-xs text-orange-700' }, `${vacationInfo.start} até ${vacationInfo.end}`)
              )
            )
          )
        );
      })
    )
  );
};

// Reminders View
const RemindersView = ({ reminders, users, currentUser, setShowCreateReminder, canEditReminder, handleDeleteReminder, setEditingReminder, setShowEditReminder }) => {
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

// Exportar componentes
window.ViewComponents = {
  HomeView,
  EventCard,
  CalendarView,
  PeopleView,
  RemindersView
};

// Event Card
const EventCard = ({ event, users, currentUser, handleConfirmPresence, setEditingEvent, setShowEditEvent, getUserStatus, canEditEvent, handleDeleteEvent, setSuggestionEvent, setShowSuggestionModal, setShowEventSuggestions, setSelectedEventForSuggestions }) => {
  const creator = users.find(u => u.id == event.creator);
  const participants = typeof event.participants === 'string' ? JSON.parse(event.participants) : event.participants;
  const confirmed = typeof event.confirmed === 'string' ? JSON.parse(event.confirmed) : (event.confirmed || []);
  const rejected = typeof event.rejected === 'string' ? JSON.parse(event.rejected) : (event.rejected || []);
  const suggestions = typeof event.suggestions === 'string' ? JSON.parse(event.suggestions) : (event.suggestions || []);
  const isParticipant = participants.includes(currentUser?.id);
  const isConfirmed = confirmed.includes(currentUser?.id);
  const isRejected = rejected.includes(currentUser?.id);
  const isCreator = event.creator == currentUser?.id;
  const canEdit = canEditEvent(event);

  const eventDate = new Date(event.date + 'T' + event.time);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const formattedTime = event.time;

  return h('div', { className: 'bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition' },
    h('div', { className: 'flex items-start justify-between mb-3' },
      h('div', { className: 'flex-1' },
        h('h4', { className: 'font-bold text-gray-800 mb-1' }, event.title),
        h('span', { className: 'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full' }, event.category)
      ),
      h('div', { className: 'flex items-center gap-2' },
        canEdit && h('button', {
          onClick: () => {
            setEditingEvent(event);
            setShowEditEvent(true);
          },
          className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
        }, '✏️'),
        canEdit && h('button', {
          onClick: () => handleDeleteEvent(event.id),
          className: 'text-red-600 hover:text-red-700 text-sm font-medium'
        }, '🗑️'),
        isCreator && suggestions.length > 0 && h('button', {
          onClick: () => {
            setSelectedEventForSuggestions(event);
            setShowEventSuggestions(true);
          },
          className: 'text-blue-600 hover:text-blue-700 text-sm font-medium'
        }, `💭 ${suggestions.length}`)
      )
    ),
    h('p', { className: 'text-gray-600 text-sm mb-3' }, event.description),
    h('div', { className: 'space-y-2 mb-3' },
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Calendar, { size: 16 }),
        h('span', null, `${formattedDate} às ${formattedTime}`)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(MapPin, { size: 16 }),
        h('span', null, event.location)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Users, { size: 16 }),
        h('span', null, `${confirmed.length} confirmados / ${rejected.length} não podem / ${participants.length} total`)
      )
    ),
    h('div', { className: 'flex items-center gap-2 mb-4' },
      h('div', { className: 'text-xl' }, creator?.photo || '👤'),
      h('span', { className: 'text-sm text-gray-600' }, `Criado por ${creator?.name || 'Usuário'}`)
    ),
    isParticipant && h('div', { className: 'flex gap-2' },
      h('button', {
        onClick: () => handleConfirmPresence(event.id, 'confirmed'),
        className: `flex-1 py-2 rounded-lg font-semibold transition ${
          isConfirmed
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700 hover:bg-green-50'
        }`
      }, isConfirmed ? '✓ Confirmado' : 'Confirmar'),
      h('button', {
        onClick: () => handleConfirmPresence(event.id, 'rejected'),
        className: `flex-1 py-2 rounded-lg font-semibold transition ${
          isRejected
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700 hover:bg-red-50'
        }`
      }, isRejected ? '✗ Não vou' : 'Não vou'),
      h('button', {
        onClick: () => {
          setSuggestionEvent(event);
          setShowSuggestionModal(true);
        },
        className: 'flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-200 transition'
      }, '💡 Sugestão')
    )
  );// 🎨 COMPONENTES DE MODAIS - PARTE 1
const { useState, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

// Create Event Modal
const CreateEventModal = ({ setShowCreateEvent, handleCreateEvent, categories, users, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: categories[0],
    participants: []
  });

  const onSubmit = () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (formData.participants.length === 0) {
      alert('Selecione pelo menos um participante');
      return;
    }
    handleCreateEvent(formData);
  };

  const toggleParticipant = (userId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }));
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '📅 Criar Evento'),
          h('button', { onClick: () => setShowCreateEvent(false) },
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
              placeholder: 'Nome do evento'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Descrição *'),
            h('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              rows: 3,
              placeholder: 'Descreva o evento'
            })
          ),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data *'),
              h('input', {
                type: 'date',
                value: formData.date,
                onChange: (e) => setFormData({...formData, date: e.target.value}),
                min: new Date().toISOString().split('T')[0],
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Hora *'),
              h('input', {
                type: 'time',
                value: formData.time,
                onChange: (e) => setFormData({...formData, time: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Local *'),
            h('input', {
              type: 'text',
              value: formData.location,
              onChange: (e) => setFormData({...formData, location: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Onde será o evento'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Categoria'),
            h('select', {
              value: formData.category,
              onChange: (e) => setFormData({...formData, category: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            }, ...categories.map(cat => h('option', { key: cat, value: cat }, cat)))
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Participantes *'),
            h('div', { className: 'border border-gray-300 rounded-lg max-h-48 overflow-y-auto' },
              ...users.map(user =>
                h('label', {
                  key: user.id,
                  className: 'flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                },
                  h('input', {
                    type: 'checkbox',
                    checked: formData.participants.includes(user.id),
                    onChange: () => toggleParticipant(user.id),
                    className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500'
                  }),
                  h('div', { className: 'text-xl' }, user.photo),
                  h('span', { className: 'text-sm' }, user.name)
                )
              )
            )
          ),
          h('button', {
            onClick: onSubmit,
            className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
          }, 'Criar Evento')
        )
      )
    )
  );
};

// Edit Event Modal
const EditEventModal = ({ setShowEditEvent, handleEditEvent, categories, users, currentUser, editingEvent }) => {
  const [formData, setFormData] = useState({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    date: editingEvent?.date || '',
    time: editingEvent?.time || '',
    location: editingEvent?.location || '',
    category: editingEvent?.category || categories[0],
    participants: typeof editingEvent?.participants === 'string' 
      ? JSON.parse(editingEvent.participants) 
      : (editingEvent?.participants || [])
  });

  const onSubmit = () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    if (formData.participants.length === 0) {
      alert('Selecione pelo menos um participante');
      return;
    }
    handleEditEvent({
      ...formData,
      participants: JSON.stringify(formData.participants),
      visibleTo: JSON.stringify(formData.participants)
    });
  };

  const toggleParticipant = (userId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter(id => id !== userId)
        : [...prev.participants, userId]
    }));
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '✏️ Editar Evento'),
          h('button', { onClick: () => setShowEditEvent(false) },
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
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Descrição *'),
            h('textarea', {
              value: formData.description,
              onChange: (e) => setFormData({...formData, description: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              rows: 3
            })
          ),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data *'),
              h('input', {
                type: 'date',
                value: formData.date,
                onChange: (e) => setFormData({...formData, date: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Hora *'),
              h('input', {
                type: 'time',
                value: formData.time,
                onChange: (e) => setFormData({...formData, time: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Local *'),
            h('input', {
              type: 'text',
              value: formData.location,
              onChange: (e) => setFormData({...formData, location: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Categoria'),
            h('select', {
              value: formData.category,
              onChange: (e) => setFormData({...formData, category: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            }, ...categories.map(cat => h('option', { key: cat, value: cat }, cat)))
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Participantes *'),
            h('div', { className: 'border border-gray-300 rounded-lg max-h-48 overflow-y-auto' },
              ...users.map(user =>
                h('label', {
                  key: user.id,
                  className: 'flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0'
                },
                  h('input', {
                    type: 'checkbox',
                    checked: formData.participants.includes(user.id),
                    onChange: () => toggleParticipant(user.id),
                    className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500'
                  }),
                  h('div', { className: 'text-xl' }, user.photo),
                  h('span', { className: 'text-sm' }, user.name)
                )
              )
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
};

// Add Location Modal
const AddLocationModal = ({ setShowAddLocation, handleAddLocation }) => {
  const [formData, setFormData] = useState({
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  const onSubmit = () => {
    if (!formData.location || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      alert('Preencha todos os campos');
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    if (end <= start) {
      alert('A data/hora final deve ser posterior à inicial');
      return;
    }

    handleAddLocation(formData);
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '📍 Atualizar Localização'),
          h('button',// 🎨 COMPONENTES DE MODAIS - PARTE 2
const { useState, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

// Profile Modal
const ProfileModal = ({ currentUser, getUserLocation, setShowProfile, setIsLoggedIn, setCurrentUser, getUserStatus, handleUpdateVacation, isUserOnVacation, getVacationInfo }) => {
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationData, setVacationData] = useState({
    start: currentUser?.vacationStart || '',
    end: currentUser?.vacationEnd || ''
  });

  const onSaveVacation = () => {
    if (!vacationData.start || !vacationData.end) {
      alert('Preencha as datas de início e fim das férias');
      return;
    }

    const start = new Date(vacationData.start);
    const end = new Date(vacationData.end);

    if (end <= start) {
      alert('A data de término deve ser posterior à data de início');
      return;
    }

    handleUpdateVacation(vacationData.start, vacationData.end);
    setVacationMode(false);
    alert('✅ Período de férias atualizado!');
  };

  const onClearVacation = () => {
    if (confirm('Deseja remover o período de férias?')) {
      handleUpdateVacation('', '');
      setVacationData({ start: '', end: '' });
      alert('✅ Período de férias removido!');
    }
  };

  const onLogout = () => {
    if (confirm('Deseja sair da sua conta?')) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setShowProfile(false);
    }
  };

  const vacationInfo = getVacationInfo(currentUser.id);

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Perfil'),
          h('button', { onClick: () => setShowProfile(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'text-center mb-6' },
          h('div', { className: 'text-6xl mb-3' }, currentUser.photo),
          h('h3', { className: 'text-xl font-bold text-gray-800 mb-1' }, currentUser.name),
          h('p', { className: 'text-gray-600' }, currentUser.email),
          h('div', { className: 'mt-3 inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg' },
            h(MapPin, { size: 16 }),
            h('span', { className: 'text-sm' }, getUserLocation(currentUser.id))
          )
        ),
        h('div', { className: 'space-y-4 mb-6' },
          h('div', { className: 'bg-gray-50 p-4 rounded-lg' },
            h('div', { className: 'flex items-center justify-between mb-2' },
              h('h4', { className: 'font-semibold text-gray-800' }, '🏖️ Período de Férias'),
              !vacationMode && h('button', {
                onClick: () => setVacationMode(true),
                className: 'text-sm text-blue-600 hover:text-blue-700'
              }, vacationInfo ? 'Editar' : 'Configurar')
            ),
            vacationInfo && !vacationMode ? h('div', { className: 'mt-2' },
              h('p', { className: 'text-sm text-gray-700' },
                `${vacationInfo.start} até ${vacationInfo.end}`
              ),
              vacationInfo.isActive && h('span', { className: 'inline-block mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-full' },
                '✓ Em férias agora'
              ),
              h('button', {
                onClick: onClearVacation,
                className: 'mt-2 text-sm text-red-600 hover:text-red-700'
              }, 'Remover férias')
            ) : !vacationMode && h('p', { className: 'text-sm text-gray-500 mt-2' },
              'Nenhum período configurado'
            ),
            vacationMode && h('div', { className: 'mt-3 space-y-3' },
              h('div', null,
                h('label', { className: 'block text-xs font-medium text-gray-700 mb-1' }, 'Data de Início'),
                h('input', {
                  type: 'date',
                  value: vacationData.start,
                  onChange: (e) => setVacationData({...vacationData, start: e.target.value}),
                  className: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                })
              ),
              h('div', null,
                h('label', { className: 'block text-xs font-medium text-gray-700 mb-1' }, 'Data de Término'),
                h('input', {
                  type: 'date',
                  value: vacationData.end,
                  onChange: (e) => setVacationData({...vacationData, end: e.target.value}),
                  className: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                })
              ),
              h('div', { className: 'flex gap-2' },
                h('button', {
                  onClick: onSaveVacation,
                  className: 'flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700'
                }, 'Salvar'),
                h('button', {
                  onClick: () => setVacationMode(false),
                  className: 'flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-400'
                }, 'Cancelar')
              )
            )
          )
        ),
        h('button', {
          onClick: onLogout,
          className: 'w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition'
        }, 'Sair da Conta')
      )
    )
  );
};

// Create Reminder Modal
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

// Edit Reminder Modal
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
};

// Exportar componentes de modais parte 2
if (!window.ModalComponents) {
  window.ModalComponents = {};
}

Object.assign(window.ModalComponents, {
  ProfileModal,
  CreateReminderModal,
  EditReminderModal
});

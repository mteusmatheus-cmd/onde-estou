// ⚙️ CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = https://ikczlcmcbrlhdlopkoqg.supabase.co;
const SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc;

const { useState, useEffect, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake } = window.Icons;

const App = () => {
  // Estados
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [currentEventParticipants, setCurrentEventParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Funções Supabase
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

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [usersData, eventsData, locationsData] = await Promise.all([
        fetchData('users'),
        fetchData('events'),
        fetchData('locations')
      ]);
      setUsers(usersData);
      setEvents(eventsData);
      setLocations(locationsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handlers
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
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      birthDate: userData.birthDate,
      photo: '👤',
      interests: ''
    };
    
    const updatedUsers = [...users, newUser];
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
      participants: JSON.stringify([currentUser.id]),
      visibleTo: JSON.stringify(eventData.visibleTo.length > 0 ? eventData.visibleTo : users.map(u => u.id))
    };
    
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    await saveData('events', updatedEvents);
    setShowCreateEvent(false);
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

  const getUserLocation = (userId) => {
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

  // Componente Loading
  if (loading) {
    return h('div', { className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4' },
      h('div', { className: 'text-center bg-white rounded-2xl p-8 max-w-md' },
        h('div', { className: 'text-6xl mb-4 animate-bounce' }, '📍'),
        h('p', { className: 'text-gray-800 text-xl font-semibold mb-2' }, 'Onde Estou'),
        h('p', { className: 'text-gray-600' }, 'Conectando à base compartilhada...')
      )
    );
  }

  // Login/Registro
  if (!isLoggedIn) {
    if (showRegister) {
      return h(RegisterScreen, { handleRegister, setShowRegister, users });
    }
    return h(LoginScreen, { handleLogin, setShowRegister });
  }

  // App Principal
  return h('div', { className: 'min-h-screen bg-gray-50' },
    h(Header, { currentUser, getBirthdaysInMonth, setShowProfile }),
    currentView === 'home' && h(HomeView, {
      currentUser, getUserLocation, getBirthdaysForDate, events,
      setShowCreateEvent, setShowAddLocation, users
    }),
    currentView === 'calendar' && h(CalendarView, {
      selectedDate, setSelectedDate, getEventsForDate,
      getBirthdaysForDate, currentUser, users, events
    }),
    currentView === 'people' && h(PeopleView, {
      users, currentUser, getUserLocation
    }),
    h(Navigation, { currentView, setCurrentView }),
    showCreateEvent && h(CreateEventModal, {
      setShowCreateEvent, handleCreateEvent, categories, users, currentUser
    }),
    showAddLocation && h(AddLocationModal, {
      setShowAddLocation, handleAddLocation
    }),
    showProfile && h(ProfileModal, {
      currentUser, getUserLocation, setShowProfile, setIsLoggedIn, setCurrentUser
    }),
    showParticipants && h(ParticipantsModal, {
      currentEventParticipants, users, getUserLocation, setShowParticipants
    })
  );
};

// ========== COMPONENTES DA UI ==========

// LoginScreen
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
};

// RegisterScreen
const RegisterScreen = ({ handleRegister, setShowRegister, users }) => {
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

// Header
const Header = ({ currentUser, getBirthdaysInMonth, setShowProfile }) => {
  return h('div', { className: 'bg-white shadow-sm border-b sticky top-0 z-10' },
    h('div', { className: 'max-w-6xl mx-auto px-4 py-4 flex items-center justify-between' },
      h('div', { className: 'flex items-center gap-2' },
        h(MapPin, { className: 'text-purple-600', size: 28 }),
        h('h1', { className: 'text-xl font-bold text-gray-800' }, 'Onde Estou')
      ),
      h('div', { className: 'flex items-center gap-4' },
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

// Navigation
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
        onClick: () => setCurrentView('people'),
        className: `flex flex-col items-center gap-1 ${currentView === 'people' ? 'text-purple-600' : 'text-gray-500'}`
      },
        h(Users, { size: 24 }),
        h('span', { className: 'text-xs' }, 'Pessoas')
      )
    )
  );
};

// HomeView
const HomeView = ({ currentUser, getUserLocation, getBirthdaysForDate, events, setShowCreateEvent, setShowAddLocation, users }) => {
  const userLocation = getUserLocation(currentUser.id);
  const todayBirthdays = getBirthdaysForDate(new Date());
  const upcomingEvents = events
    .filter(e => {
      const visibleTo = typeof e.visibleTo === 'string' ? JSON.parse(e.visibleTo) : e.visibleTo;
      return visibleTo.includes(currentUser.id);
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
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
        h(EventCard, { key: event.id, event, users, currentUser })
      ) : h('div', { className: 'text-center text-gray-500 py-8' }, 'Nenhum evento próximo')
    )
  );
};

// EventCard
const EventCard = ({ event, users, currentUser }) => {
  const creator = users.find(u => u.id == event.creator);
  const participants = typeof event.participants === 'string' ? JSON.parse(event.participants) : event.participants;
  const isParticipant = participants.includes(currentUser?.id);

  return h('div', { className: 'bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition' },
    h('div', { className: 'flex items-start justify-between mb-3' },
      h('div', { className: 'flex-1' },
        h('h4', { className: 'font-bold text-gray-800 mb-1' }, event.title),
        h('span', { className: 'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full' }, event.category)
      )
    ),
    h('p', { className: 'text-gray-600 text-sm mb-3' }, event.description),
    h('div', { className: 'space-y-2 mb-3' },
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Calendar, { size: 16 }),
        h('span', null, `${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time}`)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(MapPin, { size: 16 }),
        h('span', null, event.location)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Users, { size: 16 }),
        h('span', null, `${participants.length} participantes`)
      )
    ),
    h('div', { className: 'flex items-center gap-2 mb-3' },
      h('div', { className: 'text-xl' }, creator?.photo || '👤'),
      h('span', { className: 'text-sm text-gray-600' }, `Criado por ${creator?.name || 'Usuário'}`)
    ),
    h('button', {
      className: `w-full py-2 rounded-lg font-semibold transition ${
        isParticipant
          ? 'bg-green-100 text-green-700'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      }`
    }, isParticipant ? '✓ Participando' : 'Participar')
  );
};

// ========== PARTE 3: COMPONENTES FINAIS ==========

// Atualiza EventCard para conseguir abrir modal de participantes
const EventCard = ({ event, users, currentUser, setCurrentEventParticipants, setShowParticipants, onToggleParticipation }) => {
  const creator = users.find(u => u.id == event.creator);
  const participants = typeof event.participants === 'string' ? JSON.parse(event.participants) : event.participants || [];
  const isParticipant = participants.includes(currentUser?.id);

  return h('div', { className: 'bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition' },
    h('div', { className: 'flex items-start justify-between mb-3' },
      h('div', { className: 'flex-1' },
        h('h4', { className: 'font-bold text-gray-800 mb-1' }, event.title),
        h('span', { className: 'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full' }, event.category)
      )
    ),
    h('p', { className: 'text-gray-600 text-sm mb-3' }, event.description),
    h('div', { className: 'space-y-2 mb-3' },
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Calendar, { size: 16 }),
        h('span', null, `${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time}`)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(MapPin, { size: 16 }),
        h('span', null, event.location)
      ),
      h('div', { className: 'flex items-center gap-2 text-sm text-gray-600' },
        h(Users, { size: 16 }),
        h('span', null, `${participants.length} participante(s)`)
      )
    ),
    h('div', { className: 'flex items-center gap-2 mb-3' },
      h('div', { className: 'text-xl' }, creator?.photo || '👤'),
      h('span', { className: 'text-sm text-gray-600' }, `Criado por ${creator?.name || 'Usuário'}`)
    ),
    h('div', { className: 'flex gap-2' },
      h('button', {
        onClick: () => {
          setCurrentEventParticipants(participants);
          setShowParticipants(true);
        },
        className: 'flex-1 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition'
      }, 'Ver Participantes'),
      h('button', {
        onClick: () => onToggleParticipation && onToggleParticipation(event.id, isParticipant),
        className: `flex-1 py-2 rounded-lg font-semibold transition ${isParticipant ? 'bg-green-100 text-green-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`
      }, isParticipant ? '✓ Participando' : 'Participar')
    )
  );
};

// CalendarView (substitui/cole no lugar)
const CalendarView = ({ selectedDate, setSelectedDate, getEventsForDate, getBirthdaysForDate, currentUser, users, events, setCurrentEventParticipants, setShowParticipants, onToggleParticipation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const changeMonth = (delta) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1));

  const eventsForSelectedDate = getEventsForDate(selectedDate);
  const birthdaysForSelectedDate = getBirthdaysForDate(selectedDate);

  return h('div', { className: 'max-w-6xl mx-auto px-4 py-6 pb-24' },
    h('div', { className: 'bg-white rounded-xl shadow-sm border p-4 mb-6' },
      h('div', { className: 'flex items-center justify-between mb-4' },
        h('button', { onClick: () => changeMonth(-1), className: 'px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200' }, '←'),
        h('h2', { className: 'text-xl font-bold text-gray-800' }, `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`),
        h('button', { onClick: () => changeMonth(1), className: 'px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200' }, '→')
      ),

      h('div', { className: 'grid grid-cols-7 gap-2 mb-2' },
        ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(day => h('div', { key: day, className: 'text-center text-sm font-semibold text-gray-600 py-2' }, day))
      ),

      h('div', { className: 'grid grid-cols-7 gap-2' },
        days.map((day, index) => {
          if (!day) return h('div', { key: index, className: 'aspect-square' });
          const hasEvents = getEventsForDate(day).length > 0;
          const hasBirthdays = getBirthdaysForDate(day).length > 0;
          const isSelected = selectedDate.toDateString() === day.toDateString();
          const isToday = new Date().toDateString() === day.toDateString();

          return h('button', {
            key: index,
            onClick: () => setSelectedDate(day),
            className: `aspect-square rounded-lg p-2 text-sm relative ${isSelected ? 'bg-purple-600 text-white' : isToday ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-50 hover:bg-gray-100'}`
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
      h('h3', { className: 'text-lg font-bold text-gray-800' }, selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })),

      birthdaysForSelectedDate.length > 0 && h('div', { className: 'bg-pink-50 border border-pink-200 rounded-xl p-4' },
        h('h4', { className: 'font-bold text-pink-800 mb-3 flex items-center gap-2' },
          h(Cake, { size: 20 }), 'Aniversariantes do Dia'
        ),
        ...birthdaysForSelectedDate.map(user =>
          h('div', { key: user.id, className: 'flex items-center gap-3 mb-2' },
            h('div', { className: 'text-2xl' }, user.photo),
            h('div', null,
              h('div', { className: 'font-medium' }, user.name),
              h('div', { className: 'text-sm text-gray-600' }, `${new Date().getFullYear() - parseInt(user.birthDate.split('-')[0])} anos`)
            )
          )
        )
      ),

      eventsForSelectedDate.length > 0 ? eventsForSelectedDate.map(ev =>
        h(EventCard, { key: ev.id, event: ev, users, currentUser, setCurrentEventParticipants, setShowParticipants, onToggleParticipation })
      ) : h('div', { className: 'text-center text-gray-500 py-8' }, 'Nenhum evento nesta data')
    )
  );
};

// PeopleView
const PeopleView = ({ users, currentUser, getUserLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(u =>
    u.id !== currentUser.id && u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      filteredUsers.map(user =>
        h('div', { key: user.id, className: 'bg-white rounded-xl shadow-sm border p-4' },
          h('div', { className: 'flex items-center gap-3' },
            h('div', { className: 'text-4xl' }, user.photo),
            h('div', { className: 'flex-1' },
              h('h4', { className: 'font-semibold text-gray-800' }, user.name),
              h('p', { className: 'text-sm text-gray-500 flex items-center gap-1' },
                h(MapPin, { size: 14 }),
                getUserLocation(user.id)
              )
            )
          )
        )
      )
    )
  );
};

// CreateEventModal
const CreateEventModal = ({ setShowCreateEvent, handleCreateEvent, categories, users, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Outros',
    customCategory: '',
    visibleTo: []
  });

  const toggleUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(userId) ? prev.visibleTo.filter(id => id !== userId) : [...prev.visibleTo, userId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    if (formData.category === 'Outros' && !formData.customCategory) {
      alert('Por favor, digite o nome da categoria');
      return;
    }

    const finalCategory = formData.category === 'Outros' ? formData.customCategory : formData.category;
    handleCreateEvent({
      ...formData,
      category: finalCategory,
      visibleTo: formData.visibleTo.length > 0 ? formData.visibleTo : users.map(u => u.id)
    });
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Criar Evento'),
          h('button', { onClick: () => setShowCreateEvent(false) }, h(X, { className: 'text-gray-500', size: 24 }))
        ),

        h('div', { className: 'space-y-4' },
          // título / descrição / data/hora / local / categoria / visibilidade
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Título'),
            h('input', { type: 'text', value: formData.title, onChange: (e) => setFormData({...formData, title: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500', placeholder: 'Nome do evento' })
          ),

          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Descrição'),
            h('textarea', { value: formData.description, onChange: (e) => setFormData({...formData, description: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500', rows: 3, placeholder: 'Descreva seu evento' })
          ),

          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data'),
              h('input', { type: 'date', value: formData.date, onChange: (e) => setFormData({...formData, date: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Hora'),
              h('input', { type: 'time', value: formData.time, onChange: (e) => setFormData({...formData, time: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' })
            )
          ),

          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Local'),
            h('input', { type: 'text', value: formData.location, onChange: (e) => setFormData({...formData, location: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500', placeholder: 'Digite o local do evento' })
          ),

          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Categoria'),
            h('select', { value: formData.category, onChange: (e) => setFormData({...formData, category: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' },
              categories.map(cat => h('option', { key: cat, value: cat }, cat))
            )
          ),

          formData.category === 'Outros' && h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Digite a categoria'),
            h('input', { type: 'text', value: formData.customCategory, onChange: (e) => setFormData({...formData, customCategory: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500', placeholder: 'Nome da categoria' })
          ),

          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Quem pode ver este evento?'),
            h('div', { className: 'border border-gray-300 rounded-lg max-h-48 overflow-y-auto' },
              users.filter(u => u.id !== currentUser.id).map(user =>
                h('label', { key: user.id, className: 'flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0' },
                  h('input', { type: 'checkbox', checked: formData.visibleTo.includes(user.id), onChange: () => toggleUser(user.id), className: 'w-4 h-4 text-purple-600 rounded focus:ring-purple-500' }),
                  h('div', { className: 'text-xl' }, user.photo),
                  h('span', { className: 'text-sm' }, user.name)
                )
              )
            ),
            h('p', { className: 'text-xs text-gray-500 mt-2' }, formData.visibleTo.length === 0 ? 'Todos poderão ver' : `${formData.visibleTo.length} pessoa(s) selecionada(s)`)
          ),

          h('button', { onClick: handleSubmit, className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition' }, 'Criar Evento')
        )
      )
    )
  );
};

// AddLocationModal
const AddLocationModal = ({ setShowAddLocation, handleAddLocation }) => {
  const [formData, setFormData] = useState({
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });

  const handleSubmit = () => {
    if (!formData.location || !formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    handleAddLocation(formData);
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Atualizar Localização'),
          h('button', { onClick: () => setShowAddLocation(false) }, h(X, { className: 'text-gray-500', size: 24 }))
        ),
        h('div', { className: 'space-y-4' },
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Onde você está?'),
            h('input', { type: 'text', value: formData.location, onChange: (e) => setFormData({...formData, location: e.target.value}), className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500', placeholder: 'Ex: Escritório - Sala 304, Home Office, etc' })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Início'),
            h('div', { className: 'grid grid-cols-2 gap-2' },
              h('input', { type: 'date', value: formData.startDate, onChange: (e) => setFormData({...formData, startDate: e.target.value}), className: 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' }),
              h('input', { type: 'time', value: formData.startTime, onChange: (e) => setFormData({...formData, startTime: e.target.value}), className: 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' })
            )
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Fim'),
            h('div', { className: 'grid grid-cols-2 gap-2' },
              h('input', { type: 'date', value: formData.endDate, onChange: (e) => setFormData({...formData, endDate: e.target.value}), className: 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' }),
              h('input', { type: 'time', value: formData.endTime, onChange: (e) => setFormData({...formData, endTime: e.target.value}), className: 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500' })
            )
          ),
          h('button', { onClick: handleSubmit, className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition' }, 'Salvar Localização')
        )
      )
    )
  );
};

// ParticipantsModal
const ParticipantsModal = ({ currentEventParticipants, users, getUserLocation, setShowParticipants }) => {
  const participants = users.filter(u => currentEventParticipants.includes(u.id));

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Participantes'),
          h('button', { onClick: () => setShowParticipants(false) }, h(X, { className: 'text-gray-500', size: 24 }))
        ),
        h('div', { className: 'space-y-3' },
          participants.map(user =>
            h('div', { key: user.id, className: 'flex items-center gap-3 p-3 bg-gray-50 rounded-lg' },
              h('div', { className: 'text-3xl' }, user.photo),
              h('div', { className: 'flex-1' },
                h('h4', { className: 'font-semibold text-gray-800' }, user.name),
                h('p', { className: 'text-sm text-gray-500 flex items-center gap-1' },
                  h(MapPin, { size: 14 }),
                  getUserLocation(user.id)
                )
              )
            )
          )
        )
      )
    )
  );
};

// ProfileModal
const ProfileModal = ({ currentUser, getUserLocation, setShowProfile, setIsLoggedIn, setCurrentUser }) => (
  h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Perfil'),
          h('button', { onClick: () => setShowProfile(false) }, h(X, { className: 'text-gray-500', size: 24 }))
        ),
        h('div', { className: 'text-center mb-6' },
          h('div', { className: 'text-6xl mb-2' }, currentUser?.photo),
          h('h3', { className: 'text-xl font-bold text-gray-800' }, currentUser?.name),
          h('p', { className: 'text-gray-600' }, currentUser?.email),
          currentUser?.birthDate && h('p', { className: 'text-sm text-gray-500 mt-1' }, `Aniversário: ${currentUser.birthDate.split('-').reverse().join('/')}`)
        ),
        h('div', { className: 'space-y-4' },
          h('div', { className: 'bg-gray-50 rounded-lg p-4' },
            h('h4', { className: 'font-medium mb-2 flex items-center gap-2' }, h(MapPin, { size: 20, className: 'text-purple-600' }), 'Localização Atual'),
            h('p', { className: 'text-gray-700' }, getUserLocation(currentUser.id))
          ),
          h('button', {
            onClick: () => {
              setIsLoggedIn(false);
              setCurrentUser(null);
              setShowProfile(false);
            },
            className: 'w-full bg-red-100 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-200 transition'
          }, 'Sair da Conta')
        )
      )
    )
  )
);

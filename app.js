// ⚙️ CONFIGURAÇÃO - Substitua pelos seus dados do Supabase
const SUPABASE_URL = https://ikczlcmcbrlhdlopkoqg.supabase.co;
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc;

const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

const OndeEstouApp = () => {
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

  // Funções do Supabase
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

  // Componente de Loading
  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4'
    },
      React.createElement('div', { className: 'text-center bg-white rounded-2xl p-8 max-w-md' },
        React.createElement('div', { className: 'text-6xl mb-4 animate-bounce' }, '📍'),
        React.createElement('p', { className: 'text-gray-800 text-xl font-semibold mb-2' }, 'Onde Estou'),
        React.createElement('p', { className: 'text-gray-600' }, 'Conectando à base compartilhada...')
      )
    );
  }

  // LoginScreen - Simplifiquei para não ocupar muito espaço
  const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4'
    },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('div', { className: 'text-6xl mb-4' }, '📍'),
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' }, 'Onde Estou'),
          React.createElement('p', { className: 'text-gray-600' }, 'Conecte-se com pessoas e eventos')
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('input', {
            type: 'email',
            placeholder: 'Email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          }),
          React.createElement('input', {
            type: 'password',
            placeholder: 'Senha',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          }),
          React.createElement('button', {
            onClick: () => handleLogin(email, password),
            className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
          }, 'Entrar'),
          React.createElement('button', {
            onClick: () => setShowRegister(true),
            className: 'w-full border border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition'
          }, 'Criar Conta')
        )
      )
    );
  };

  // Retorno simplificado - mostra apenas tela de login ou mensagem
  if (!isLoggedIn) {
    return showRegister ? 
      React.createElement('div', { className: 'p-8 text-center' },
        React.createElement('h2', {}, 'Formulário de registro - Em desenvolvimento'),
        React.createElement('button', {
          onClick: () => setShowRegister(false),
          className: 'mt-4 bg-purple-600 text-white px-6 py-2 rounded'
        }, 'Voltar')
      ) : 
      React.createElement(LoginScreen);
  }

  return React.createElement('div', { className: 'p-8 text-center' },
    React.createElement('h1', { className: 'text-3xl font-bold mb-4' }, `Bem-vindo, ${currentUser.name}!`),
    React.createElement('p', { className: 'text-gray-600 mb-4' }, 'Sistema funcionando com banco compartilhado!'),
    React.createElement('button', {
      onClick: () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
      },
      className: 'bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600'
    }, 'Sair')
  );
};

// Renderiza o App
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(OndeEstouApp));

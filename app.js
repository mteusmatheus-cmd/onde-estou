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

// (Continua na próxima parte...)

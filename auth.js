// 🔐 COMPONENTES DE AUTENTICAÇÃO
const { useState, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

// Login Screen
const LoginScreen = ({ handleLogin, setShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Preencha todos os campos');
      return;
    }
    handleLogin(email, password);
  };

  return h('div', { className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4' },
    h('div', { className: 'bg-white rounded-2xl shadow-xl p-8 max-w-md w-full' },
      h('div', { className: 'text-center mb-8' },
        h('div', { className: 'text-6xl mb-4' }, '📍'),
        h('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' }, 'Onde Estou'),
        h('p', { className: 'text-gray-600' }, 'Entre para ver onde todos estão')
      ),
      h('form', { onSubmit, className: 'space-y-4' },
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email'),
          h('input', {
            type: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: 'seu@email.com'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Senha'),
          h('input', {
            type: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: '••••••••'
          })
        ),
        h('button', {
          type: 'submit',
          className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
        }, 'Entrar'),
        h('button', {
          type: 'button',
          onClick: () => setShowRegister(true),
          className: 'w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition'
        }, 'Criar Conta')
      )
    )
  );
};

// Register Screen
const RegisterScreen = ({ handleRegister, setShowRegister, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.birthDate) {
      alert('Preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const emailExists = users.some(u => u.email === formData.email);
    if (emailExists) {
      alert('Este email já está cadastrado');
      return;
    }

    handleRegister(formData);
  };

  return h('div', { className: 'min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4' },
    h('div', { className: 'bg-white rounded-2xl shadow-xl p-8 max-w-md w-full' },
      h('div', { className: 'text-center mb-8' },
        h('div', { className: 'text-6xl mb-4' }, '📍'),
        h('h1', { className: 'text-3xl font-bold text-gray-800 mb-2' }, 'Criar Conta'),
        h('p', { className: 'text-gray-600' }, 'Junte-se à equipe')
      ),
      h('form', { onSubmit, className: 'space-y-4' },
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Nome Completo'),
          h('input', {
            type: 'text',
            value: formData.name,
            onChange: (e) => setFormData({...formData, name: e.target.value}),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: 'Seu nome'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Email'),
          h('input', {
            type: 'email',
            value: formData.email,
            onChange: (e) => setFormData({...formData, email: e.target.value}),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: 'seu@email.com'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data de Nascimento'),
          h('input', {
            type: 'date',
            value: formData.birthDate,
            onChange: (e) => setFormData({...formData, birthDate: e.target.value}),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Senha'),
          h('input', {
            type: 'password',
            value: formData.password,
            onChange: (e) => setFormData({...formData, password: e.target.value}),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: 'Mínimo 6 caracteres'
          })
        ),
        h('div', null,
          h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Confirmar Senha'),
          h('input', {
            type: 'password',
            value: formData.confirmPassword,
            onChange: (e) => setFormData({...formData, confirmPassword: e.target.value}),
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            placeholder: 'Digite a senha novamente'
          })
        ),
        h('button', {
          type: 'submit',
          className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
        }, 'Criar Conta'),
        h('button', {
          type: 'button',
          onClick: () => setShowRegister(false),
          className: 'w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition'
        }, 'Voltar para Login')
      )
    )
  );
};

// Header
const Header = ({ currentUser, getBirthdaysInMonth, setShowProfile, setShowStatusModal, getUserStatus, isUserOnVacation }) => {
  const currentMonth = new Date().getMonth();
  const birthdaysThisMonth = getBirthdaysInMonth(currentMonth);

  return h('div', { className: 'bg-white border-b sticky top-0 z-40' },
    h('div', { className: 'max-w-6xl mx-auto px-4 py-3 flex items-center justify-between' },
      h('div', { className: 'flex items-center gap-3' },
        h('div', { className: 'text-3xl' }, '📍'),
        h('div', null,
          h('h1', { className: 'text-xl font-bold text-gray-800' }, 'Onde Estou'),
          h('p', { className: 'text-xs text-gray-500' }, getUserStatus(currentUser.id))
        )
      ),
      h('div', { className: 'flex items-center gap-3' },
        birthdaysThisMonth.length > 0 && h('div', { className: 'relative' },
          h('button', {
            className: 'p-2 rounded-full hover:bg-gray-100 relative'
          },
            h(Cake, { size: 24, className: 'text-pink-600' }),
            h('span', { className: 'absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center' },
              birthdaysThisMonth.length
            )
          )
        ),
        h('button', {
          onClick: () => setShowStatusModal(true),
          className: 'px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition',
          disabled: isUserOnVacation(currentUser.id)
        }, '📍 Status'),
        h('button', {
          onClick: () => setShowProfile(true),
          className: 'text-3xl hover:scale-110 transition'
        }, currentUser.photo)
      )
    )
  );
};

// Navigation
const Navigation = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Início' },
    { id: 'calendar', icon: '📅', label: 'Calendário' },
    { id: 'people', icon: '👥', label: 'Pessoas' },
    { id: 'reminders', icon: '📝', label: 'Lembretes' }
  ];

  return h('nav', { className: 'fixed bottom-0 left-0 right-0 bg-white border-t z-50' },
    h('div', { className: 'max-w-6xl mx-auto px-4 py-2 flex justify-around' },
      ...navItems.map(item =>
        h('button', {
          key: item.id,
          onClick: () => setCurrentView(item.id),
          className: `flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition ${
            currentView === item.id
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-600 hover:bg-gray-50'
          }`
        },
          h('span', { className: 'text-2xl' }, item.icon),
          h('span', { className: 'text-xs font-medium' }, item.label)
        )
      )
    )
  );
};

// Exportar componentes
window.AuthComponents = {
  LoginScreen,
  RegisterScreen,
  Header,
  Navigation
};

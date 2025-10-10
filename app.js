// ⚙️ CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'https://ikczlcmcbrlhdlopkoqg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY3psY21jYnJsaGRsb3Brb3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjAxMTYsImV4cCI6MjA3NTY5NjExNn0.GxxdTvkzMwOMY6yO8HareaB4OC2ibVNTC_63EBjrDZc';

const { useState, useEffect } = React;

const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [message, setMessage] = useState('');

  // Buscar usuários do banco
  const loadUsers = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/dados?key=eq.users`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      const data = await response.json();
      const usersData = data[0] ? JSON.parse(data[0].value) : [];
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      setMessage('❌ Erro ao conectar: ' + error.message);
      setLoading(false);
    }
  };

  // Salvar usuários no banco
  const saveUsers = async (newUsers) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/dados?key=eq.users`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ value: JSON.stringify(newUsers) })
      });
      return true;
    } catch (error) {
      setMessage('❌ Erro ao salvar: ' + error.message);
      return false;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Login
  const handleLogin = () => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setLoggedUser(user);
      setMessage('✅ Login realizado!');
    } else {
      setMessage('❌ Email ou senha incorretos');
    }
  };

  // Registro
  const handleRegister = async () => {
    if (!name || !email || !password || !birthDate) {
      setMessage('❌ Preencha todos os campos');
      return;
    }

    if (users.find(u => u.email === email)) {
      setMessage('❌ Email já cadastrado');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      birthDate,
      photo: '👤'
    };

    const updatedUsers = [...users, newUser];
    const saved = await saveUsers(updatedUsers);

    if (saved) {
      setUsers(updatedUsers);
      setLoggedUser(newUser);
      setMessage('✅ Conta criada com sucesso!');
      setShowRegister(false);
    }
  };

  // Tela de Loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📍</div>
          <h1 style={{ fontSize: '28px', marginBottom: '10px', color: '#333' }}>Onde Estou</h1>
          <p style={{ color: '#666' }}>Conectando à base compartilhada...</p>
        </div>
      </div>
    );
  }

  // Usuário Logado
  if (loggedUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>{loggedUser.photo}</div>
            <h2 style={{ fontSize: '32px', color: '#333', marginBottom: '5px' }}>
              Bem-vindo, {loggedUser.name}! 🎉
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>{loggedUser.email}</p>
            <p style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
              Aniversário: {new Date(loggedUser.birthDate).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div style={{
            background: '#f7fafc',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
              📊 Estatísticas da Base
            </h3>
            <p style={{ color: '#666', marginBottom: '5px' }}>
              👥 Total de usuários: <strong>{users.length}</strong>
            </p>
            <p style={{ color: '#666', fontSize: '12px' }}>
              Base compartilhada funcionando! Todos veem os mesmos dados.
            </p>
          </div>

          <div style={{
            background: '#edf2f7',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
              👥 Usuários na Base:
            </h4>
            {users.map(user => (
              <div key={user.id} style={{
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>{user.photo}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setLoggedUser(null)} style={{
            width: '100%',
            padding: '15px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  // Tela de Registro
  if (showRegister) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px' }}>📍</div>
            <h2 style={{ fontSize: '28px', color: '#333' }}>Criar Conta</h2>
          </div>

          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
              color: message.includes('✅') ? '#065f46' : '#991b1b',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
              Senha *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <button onClick={handleRegister} style={{
            width: '100%',
            padding: '15px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '10px'
          }}>
            Criar Conta
          </button>

          <button onClick={() => { setShowRegister(false); setMessage(''); }} style={{
            width: '100%',
            padding: '15px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Tela de Login
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>📍</div>
          <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '5px' }}>Onde Estou</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Conecte-se com pessoas e eventos</p>
        </div>

        {message && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: message.includes('✅') ? '#d1fae5' : '#fee2e2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#333', fontWeight: 'bold' }}>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <button onClick={handleLogin} style={{
          width: '100%',
          padding: '15px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '10px'
        }}>
          Entrar
        </button>

        <button onClick={() => { setShowRegister(true); setMessage(''); }} style={{
          width: '100%',
          padding: '15px',
          background: 'white',
          color: '#667eea',
          border: '2px solid #667eea',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Criar Conta
        </button>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f7fafc',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>📊 Base Compartilhada Ativa!</strong><br/>
          Usuários cadastrados: <strong>{users.length}</strong><br/>
          Todos que acessarem este link verão os mesmos dados.
        </div>
      </div>
    </div>
  );
};

// Renderiza o App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

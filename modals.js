// 🎨 COMPONENTES DE MODAIS
// Nota: useState e h já estão declarados globalmente, não redeclarar aqui

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
          h('button', { onClick: () => setShowAddLocation(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'space-y-4' },
          h('div', null,
            h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Local'),
            h('input', {
              type: 'text',
              value: formData.location,
              onChange: (e) => setFormData({...formData, location: e.target.value}),
              className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
              placeholder: 'Ex: Fazenda São João'
            })
          ),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data Início'),
              h('input', {
                type: 'date',
                value: formData.startDate,
                onChange: (e) => setFormData({...formData, startDate: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Hora Início'),
              h('input', {
                type: 'time',
                value: formData.startTime,
                onChange: (e) => setFormData({...formData, startTime: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Data Fim'),
              h('input', {
                type: 'date',
                value: formData.endDate,
                onChange: (e) => setFormData({...formData, endDate: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Hora Fim'),
              h('input', {
                type: 'time',
                value: formData.endTime,
                onChange: (e) => setFormData({...formData, endTime: e.target.value}),
                className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              })
            )
          ),
          h('button', {
            onClick: onSubmit,
            className: 'w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition'
          }, 'Salvar Localização')
        )
      )
    )
  );
};

// Status Modal
const StatusModal = ({ setShowStatusModal, handleUpdateStatus, statusOptions, currentUser, isUserOnVacation }) => {
  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-sm w-full' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Atualizar Status'),
          h('button', { onClick: () => setShowStatusModal(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        isUserOnVacation(currentUser.id) ? h('div', { className: 'text-center py-4' },
          h('div', { className: 'text-6xl mb-4' }, '🏖️'),
          h('p', { className: 'text-gray-600 mb-4' }, 'Você está de férias! O status é atualizado automaticamente.'),
          h('button', {
            onClick: () => setShowStatusModal(false),
            className: 'w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition'
          }, 'Fechar')
        ) : h('div', { className: 'space-y-2' },
          ...statusOptions.map(status =>
            h('button', {
              key: status,
              onClick: () => handleUpdateStatus(status),
              className: `w-full p-4 text-left rounded-lg border-2 transition ${
                currentUser.status === status
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`
            },
              h('div', { className: 'font-semibold text-gray-800' }, status)
            )
          )
        )
      )
    )
  );
};

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

// Suggestion Modal
const SuggestionModal = ({ setShowSuggestionModal, handleAddSuggestion, suggestionEvent }) => {
  const [suggestion, setSuggestion] = useState('');

  const onSubmit = () => {
    if (!suggestion.trim()) {
      alert('Digite sua sugestão');
      return;
    }
    handleAddSuggestion(suggestionEvent.id, suggestion);
    setSuggestion('');
  };

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '💡 Adicionar Sugestão'),
          h('button', { onClick: () => setShowSuggestionModal(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'mb-4' },
          h('p', { className: 'text-sm text-gray-600 mb-2' }, `Para: ${suggestionEvent?.title}`),
          h('textarea', {
            value: suggestion,
            onChange: (e) => setSuggestion(e.target.value),
            placeholder: 'Digite sua sugestão...',
            className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500',
            rows: 4
          })
        ),
        h('button', {
          onClick: onSubmit,
          className: 'w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition'
        }, 'Enviar Sugestão')
      )
    )
  );
};

// Event Suggestions Modal
const EventSuggestionsModal = ({ setShowEventSuggestions, selectedEventForSuggestions, users }) => {
  const suggestions = typeof selectedEventForSuggestions?.suggestions === 'string' 
    ? JSON.parse(selectedEventForSuggestions.suggestions) 
    : (selectedEventForSuggestions?.suggestions || []);

  return h('div', { className: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto' },
    h('div', { className: 'bg-white rounded-2xl max-w-md w-full my-8' },
      h('div', { className: 'p-6' },
        h('div', { className: 'flex items-center justify-between mb-6' },
          h('h2', { className: 'text-2xl font-bold text-gray-800' }, '💭 Sugestões'),
          h('button', { onClick: () => setShowEventSuggestions(false) },
            h(X, { className: 'text-gray-500', size: 24 })
          )
        ),
        h('div', { className: 'mb-4' },
          h('p', { className: 'text-sm text-gray-600' }, `Evento: ${selectedEventForSuggestions?.title}`)
        ),
        h('div', { className: 'space-y-3 max-h-96 overflow-y-auto' },
          suggestions.length > 0 ? suggestions.map(suggestion =>
            h('div', { key: suggestion.id, className: 'bg-gray-50 rounded-lg p-4' },
              h('div', { className: 'flex items-center gap-2 mb-2' },
                h('span', { className: 'text-xl' }, users.find(u => u.id === suggestion.userId)?.photo || '👤'),
                h('div', null,
                  h('div', { className: 'font-semibold text-sm' }, suggestion.userName),
                  h('div', { className: 'text-xs text-gray-500' }, 
                    new Date(suggestion.date).toLocaleString('pt-BR')
                  )
                )
              ),
              h('p', { className: 'text-gray-700 text-sm' }, suggestion.text)
            )
          ) : h('div', { className: 'text-center text-gray-500 py-8' },
            h('div', { className: 'text-4xl mb-2' }, '💭'),
            h('p', null, 'Nenhuma sugestão ainda')
          )
        )
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

// Exportar componentes de modais
window.ModalComponents = {
  CreateEventModal,
  EditEventModal,
  AddLocationModal,
  StatusModal,
  ProfileModal,
  SuggestionModal,
  EventSuggestionsModal,
  CreateReminderModal,
  EditReminderModal
};

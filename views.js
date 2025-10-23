// 📱 COMPONENTES DE VISUALIZAÇÃO
const { useState, createElement: h } = React;
const { MapPin, Calendar, Users, Plus, Bell, X, Search, Gift, Cake, StickyNote } = window.Icons;

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
  );
};

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

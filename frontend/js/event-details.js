// js/event-details.js
document.addEventListener('DOMContentLoaded', function() {
    const eventId = sessionStorage.getItem('currentEventId');
    if (!eventId) {
        alert('Мероприятие не найдено!');
        window.location.href = 'organizer.html';
        return;
    }

    // Загружаем информацию о мероприятии
    fetch(`http://localhost:5000/api/events/${eventId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                displayEventInfo(data);
                loadParticipants();
            } else {
                throw new Error(data.message || 'Ошибка загрузки мероприятия');
            }
        })
        .catch(error => {
            alert(error.message);
            window.location.href = 'organizer.html';
        });

    // Инициализация кнопок копирования
    initCopyButtons();

    // Инициализация кнопки экспорта
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);

    function displayEventInfo(event) {
        document.getElementById('eventTitle').textContent = event.name;
        document.getElementById('eventDateTime').textContent = `Дата: ${formatDate(event.event_date)}`;
        document.getElementById('eventLocation').textContent = `Место: ${event.location || 'Не указано'}`;
        document.getElementById('eventDescription').textContent = event.description || 'Описание отсутствует';
        document.getElementById('eventCode').value = eventId;

        // Генерируем ссылку для регистрации
        const registrationLink = `${window.location.origin}/frontend/event-registration.html?event=${eventId}`;
        document.getElementById('eventLink').value = registrationLink;

    }

   // Продолжение js/event-details.js
   function loadParticipants(eventId) {
    fetch(`/api/participants/${eventId}`)
        .then(response => {
            console.log(response);  // Логируем весь ответ
            if (!response.ok) {
                throw new Error('Ошибка загрузки участников');
            }
            return response.json();
        })
        .then(participants => {
            console.log('Participants:', participants);  // Логируем участников
            displayParticipants(participants);
        })
        .catch(error => {
            console.error('Ошибка загрузки участников:', error);
            const table = document.getElementById('participantsTable');
            table.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Ошибка загрузки данных</td></tr>';
        });
}

function exportToExcel() {
    window.location.href = `http://localhost:5000/api/export/${eventId}`;
}

function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function initCopyButtons() {
    new ClipboardJS('#copyCodeBtn', {
        text: () => document.getElementById('eventCode').value
    });

    new ClipboardJS('#copyLinkBtn', {
        text: () => document.getElementById('eventLink').value
    });

    document.getElementById('copyCodeBtn').addEventListener('click', () => {
        showAlert('Код скопирован!');
    });

    document.getElementById('copyLinkBtn').addEventListener('click', () => {
        showAlert('Ссылка скопирована!');
    });
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 2000);
}
});
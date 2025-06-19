document.addEventListener('DOMContentLoaded', function() {
    const eventId = sessionStorage.getItem('currentEventId');
    if (!eventId) {
        alert('Мероприятие не найдено!');
        window.location.href = 'organizer.html';
        return;
    }

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

    initCopyButtons();

    document.getElementById('exportBtn').addEventListener('click', exportToExcel);

    document.getElementById('publishToggle').addEventListener('change', function () {
    const publish = this.checked;

    fetch(`http://localhost:5000/api/events/${eventId}/publish`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publish })
    })
        .then(res => res.json())
        .then(data => {
        if (data.status === 'ok') {
            showAlert(publish ? 'Мероприятие опубликовано' : 'Публикация снята');
        } else {
            throw new Error(data.message || 'Ошибка публикации');
        }
        })
        .catch(err => {
        showAlert('Ошибка: ' + err.message);
        this.checked = !publish; 
        });
    });

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    document.getElementById('deleteBtn').addEventListener('click', () => {
        deleteModal.show();
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        fetch(`http://localhost:5000/api/events/${eventId}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                sessionStorage.removeItem('currentEventId');
                window.location.href = 'organizer.html';
            } else {
                showAlert('Ошибка при удалении');
            }
        });
    });

    function displayEventInfo(event) {
        document.getElementById('eventTitle').textContent = event.name;
        document.getElementById('eventDateTime').textContent = `🗓️ Дата: ${formatDate(event.event_date)}`;
        document.getElementById('eventLocation').textContent = `📍 Место: ${event.location || 'Не указано'}`;
        document.getElementById('eventDescription').innerHTML = formatDescription(event.description);
        document.getElementById('eventCode').value = eventId;
        document.getElementById('publishToggle').checked = event.published;

        const registrationLink = `${window.location.origin}/frontend/event-registration.html?event=${eventId}`;
        document.getElementById('eventLink').value = registrationLink;

    }

    function formatDescription(text) {
        if (!text) return 'Описание отсутствует';
        return text
            .split(/\n\s*\n/)
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
    }

   function loadParticipants(eventId) {
    fetch(`/api/participants/${eventId}`)
        .then(response => {
            console.log(response); 
            if (!response.ok) {
                throw new Error('Ошибка загрузки участников');
            }
            return response.json();
        })
        .then(participants => {
            console.log('Participants:', participants); 
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
// js/event.js
document.addEventListener('DOMContentLoaded', function() {
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewEvent();
        });
    }
});

function createNewEvent() {
    const name = document.getElementById('eventName').value.trim();
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    
    if (!name || !date || !location) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    const eventData = {
        name: name,
        event_date: date,
        description: document.getElementById('eventDescription').value.trim(),
        location: location
    };

    fetch('http://localhost:5000/api/events/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            sessionStorage.setItem('currentEventId', data.event_code);
            window.location.href = 'event-details.html';
        } else {
            throw new Error(data.message || 'Ошибка при создании мероприятия');
        }
    })
    .catch(error => {
        alert(error.message);
    });
}
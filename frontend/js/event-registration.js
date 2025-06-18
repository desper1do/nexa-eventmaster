// js/event-registration.js
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    let eventId = urlParams.get('event');

    if (!eventId) {
        const eventCodeForm = document.getElementById('eventCodeForm');
        const eventCodeInput = document.getElementById('eventCodeInput');

        if (eventCodeForm && eventCodeInput) {
            eventCodeForm.addEventListener('submit', function (e) {
                e.preventDefault();
                eventId = eventCodeInput.value.trim();

                if (!eventId) {
                    alert('Пожалуйста, введите код мероприятия!');
                    return;
                }

                window.location.href = `event-registration.html?event=${eventId}`;
            });
        }
    }

    if (eventId) {
        fetch(`http://localhost:5000/api/events/${eventId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    document.getElementById('eventTitle').textContent = data.name;
                    document.getElementById('eventDateTime').textContent = `🗓️ Дата: ${formatDate(data.event_date)}`;
                    document.getElementById('eventLocation').textContent = `📍 Место: ${data.location || 'Не указано'}`;
                    document.getElementById('eventDescription').innerHTML = formatDescription(data.description);

                } else {
                    throw new Error('Мероприятие не найдено');
                }
            })
            .catch(error => {
                alert(error.message);
                window.location.href = 'index.html';
            });
    }

    function formatDescription(text) {
        if (!text) return 'Описание отсутствует';
        return text
            .split(/\n\s*\n/)
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' в');
    }



    document.getElementById('registrationForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            event_code: eventId,
            last_name: document.getElementById('lastName').value.trim(),
            first_name: document.getElementById('firstName').value.trim(),
            middle_name: document.getElementById('middleName').value.trim(),
            group: document.getElementById('group').value.trim(),
            vk_link: document.getElementById('vkLink').value.trim()
        };

        if (!formData.last_name || !formData.first_name || !formData.group) {
            alert('Пожалуйста, заполните обязательные поля: Фамилия, Имя и Группа');
            return;
        }

        fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    sessionStorage.setItem('lastRegistration', JSON.stringify({
                        id: data.code,
                        qrText: data.code,
                        name: `${formData.last_name} ${formData.first_name}`,
                        group: formData.group,
                        eventId: eventId
                    }));
                    window.location.href = 'qr-display.html';
                } else {
                    throw new Error(data.message || 'Ошибка при регистрации');
                }
            })
            .catch(error => {
                alert(error.message);
            });
    });
});

// js/auth.js
document.addEventListener('DOMContentLoaded', function() {
    const ORGANIZER_CODE = "000000";

    // Переключение видимости пароля организатора
    const toggleOrganizerCode = document.getElementById('toggleOrganizerCode');
    if (toggleOrganizerCode) {
        toggleOrganizerCode.addEventListener('click', function() {
            const input = document.getElementById('organizerCode');
            const icon = this.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }

    // Обработка формы организатора
    const organizerForm = document.getElementById('organizerForm');
    if (organizerForm) {
        organizerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const code = document.getElementById('organizerCode').value.trim();

            if (code === ORGANIZER_CODE) {
                window.location.href = 'organizer.html';
            } else {
                alert('Неверный код организатора');
                document.getElementById('organizerCode').value = '';
                document.getElementById('organizerCode').focus();
            }
        });
    }

    // Обработка формы мероприятия (регистрация участника)
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const eventCode = document.getElementById('eventCode').value.trim();

            if (!eventCode) {
                alert('Пожалуйста, введите код мероприятия');
                return;
            }

            // Проверяем существование мероприятия через API
            fetch(`http://localhost:5000/api/events/${eventCode}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Мероприятие не найдено');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'ok') {
                        // Сохраняем eventCode в sessionStorage и редиректим с параметром в URL
                        sessionStorage.setItem('currentEventId', eventCode);
                        window.location.href = `event-registration.html?event=${eventCode}`;  // Перенаправляем на страницу с параметром
                    } else {
                        throw new Error(data.message || 'Ошибка при проверке мероприятия');
                    }
                })
                .catch(error => {
                    alert(error.message);
                    document.getElementById('eventCode').value = '';
                    document.getElementById('eventCode').focus();
                });
        });
    }
});

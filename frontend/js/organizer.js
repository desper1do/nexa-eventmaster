document.addEventListener('DOMContentLoaded', function() {
    const viewEventForm = document.getElementById('viewEventForm');
    
    viewEventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const eventCode = document.getElementById('viewEventCode').value.trim();
        
        if (!eventCode) {
            alert('Пожалуйста, введите код мероприятия');
            return;
        }
  
        fetch(`http://localhost:5000/api/events/${eventCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Мероприятие не найдено');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok') {
                    sessionStorage.setItem('currentEventId', eventCode);
                    window.location.href = 'event-details.html';
                } else {
                    throw new Error(data.message || 'Ошибка при проверке мероприятия');
                }
            })
            .catch(error => {
                alert(error.message);
            });
    });
  
    const toggleViewEventCode = document.getElementById('toggleViewEventCode');
    if (toggleViewEventCode) {
        toggleViewEventCode.addEventListener('click', function() {
            const input = document.getElementById('viewEventCode');
            const icon = this.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
  });
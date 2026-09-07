(() => {
    const eventTime = new Date('2026-10-08T09:00:00+05:30').getTime();
    const days = document.getElementById('countdown-days');
    const hours = document.getElementById('countdown-hours');
    const minutes = document.getElementById('countdown-minutes');
    const seconds = document.getElementById('countdown-seconds');
    const label = document.getElementById('event-countdown-label');
    const timer = document.querySelector('.event-countdown');

    if (!days || !hours || !minutes || !seconds || !label || !timer) return;

    const pad = value => String(value).padStart(2, '0');

    function updateCountdown() {
        const remaining = Math.max(0, eventTime - Date.now());
        const totalSeconds = Math.floor(remaining / 1000);

        days.textContent = pad(Math.floor(totalSeconds / 86400));
        hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
        minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
        seconds.textContent = pad(totalSeconds % 60);

        if (remaining === 0) {
            label.textContent = 'COSMONIX 26 · NOW LIVE';
            timer.classList.add('event-live');
            return false;
        }

        return true;
    }

    if (updateCountdown()) {
        const interval = window.setInterval(() => {
            if (!updateCountdown()) window.clearInterval(interval);
        }, 1000);
    }
})();

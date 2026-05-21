class ClockApp {
    constructor() {
        this.activeTimezones = this.loadClocks();
        this.timeFormat = '24';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addDefaultClocks();
        this.updateClocks();
        setInterval(() => this.updateClocks(), 1000);
    }

    setupEventListeners() {
        document.getElementById('addZoneBtn').addEventListener('click', () => this.openModal());
        document.getElementById('confirmAddBtn').addEventListener('click', () => this.addTimezone());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('formatSelect').addEventListener('change', (e) => {
            this.timeFormat = e.target.value;
            this.updateClocks();
        });
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('addZoneModal');
            if (e.target === modal) this.closeModal();
        });
    }

    addDefaultClocks() {
        if (this.activeTimezones.length === 0) {
            const defaultClocks = ['Bangkok', 'London', 'New York', 'Tokyo'];
            defaultClocks.forEach(name => {
                const tz = timezones.find(t => t.name === name);
                if (tz) this.activeTimezones.push(tz);
            });
            this.saveClocks();
        }
    }

    openModal() {
        const modal = document.getElementById('addZoneModal');
        modal.classList.add('show');
        this.populateTimezoneSelect();
    }

    closeModal() {
        document.getElementById('addZoneModal').classList.remove('show');
    }

    populateTimezoneSelect() {
        const select = document.getElementById('timezoneSelect');
        select.innerHTML = '<option value="">Select timezone...</option>';
        
        timezones.forEach(tz => {
            const isActive = this.activeTimezones.find(a => a.timezone === tz.timezone);
            if (!isActive) {
                const option = document.createElement('option');
                option.value = tz.timezone;
                option.textContent = `${tz.name} (${tz.utcOffset})`;
                select.appendChild(option);
            }
        });
    }

    addTimezone() {
        const select = document.getElementById('timezoneSelect');
        const timezone = select.value;
        
        if (!timezone) {
            alert('Please select a timezone');
            return;
        }

        const tz = timezones.find(t => t.timezone === timezone);
        if (tz && !this.activeTimezones.find(a => a.timezone === timezone)) {
            this.activeTimezones.push(tz);
            this.saveClocks();
            this.updateClocks();
            this.closeModal();
        }
    }

    removeTimezone(timezone) {
        this.activeTimezones = this.activeTimezones.filter(t => t.timezone !== timezone);
        this.saveClocks();
        this.updateClocks();
    }

    updateClocks() {
        const clocksGrid = document.getElementById('clocksGrid');
        clocksGrid.innerHTML = '';

        if (this.activeTimezones.length === 0) {
            clocksGrid.innerHTML = '<div class="empty-message"><p>🕐</p><p>No timezones added</p></div>';
            return;
        }

        this.activeTimezones.forEach(tz => {
            const time = this.getTimeForTimezone(tz.timezone);
            const clockCard = document.createElement('div');
            clockCard.className = 'clock-card';
            clockCard.innerHTML = `
                <button class="remove-btn" onclick="clocks.removeTimezone('${tz.timezone}')">×</button>
                <div class="timezone-name">${tz.name}</div>
                <div class="digital-time">${time.time}</div>
                <div class="time-period">${time.period}</div>
                <div class="current-date">${time.date}</div>
            `;
            clocksGrid.appendChild(clockCard);
        });
    }

    getTimeForTimezone(timezone) {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: this.timeFormat === '24' ? '2-digit' : '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: this.timeFormat === '12'
        });

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });

        const timeString = formatter.format(date);
        const dateString = dateFormatter.format(date);

        let period = '';
        if (this.timeFormat === '12') {
            const hours = parseInt(timeString.split(':')[0]);
            period = hours >= 12 ? 'PM' : 'AM';
        }

        return {
            time: timeString,
            date: dateString,
            period: period
        };
    }

    saveClocks() {
        localStorage.setItem('activeClocks', JSON.stringify(this.activeTimezones));
    }

    loadClocks() {
        const stored = localStorage.getItem('activeClocks');
        return stored ? JSON.parse(stored) : [];
    }
}

const clocks = new ClockApp();
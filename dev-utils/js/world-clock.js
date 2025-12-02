// ============================================
// World Clock Functions
// ============================================

/**
 * Timezone configuration with IANA timezone identifiers
 * Sorted alphabetically by location name
 */
const TIMEZONES = [        
    { name: 'UTC', timezone: 'UTC', flag: '🌍' },
    { name: 'Fargo, US', timezone: 'America/Chicago', flag: '🇺🇸' },
    { name: 'Statesville, US', timezone: 'America/New_York', flag: '🇺🇸' },    
    { name: 'Czech Republic(CET)', timezone: 'Europe/Prague', flag: '🇨🇿' },    
    { name: 'Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
    { name: 'Ireland', timezone: 'Europe/Dublin', flag: '🇮🇪' },
    { name: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
    { name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
    { name: 'Ukraine', timezone: 'Europe/Kiev', flag: '🇺🇦' }    
];

let clockInterval = null;

/**
 * Formats a date object to display time with timezone info
 */
function formatTime(date, timezone) {
    const options = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    try {
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);

        // Extract parts
        const weekday = parts.find(p => p.type === 'weekday').value;
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const year = parts.find(p => p.type === 'year').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const second = parts.find(p => p.type === 'second').value;

        // Get timezone offset display
        const offsetOptions = { timeZone: timezone, timeZoneName: 'short' };
        const offsetFormatter = new Intl.DateTimeFormat('en-US', offsetOptions);
        const offsetParts = offsetFormatter.formatToParts(date);
        const tzName = offsetParts.find(p => p.type === 'timeZoneName')?.value || '';

        return {
            time: `${hour}:${minute}:${second}`,
            date: `${weekday}, ${month} ${day}, ${year}`,
            timezone: tzName
        };
    } catch (error) {
        console.error(`Error formatting time for timezone ${timezone}:`, error);
        return {
            time: 'Error',date: 'Invalid timezone',
            timezone: ''
        };
    }
}

/**
 * Updates all clock displays
 */
export function updateWorldClock() {
    const container = document.getElementById('worldClockContainer');
    if (!container) return;

    const now = new Date();

    const tableRows = TIMEZONES.map(({ name, timezone, flag }) => {
        const formatted = formatTime(now, timezone);

        return `
            <tr class="clock-row">
                <td class="clock-flag-cell">${flag}</td>
                <td class="clock-location-cell">${name}</td>
                <td class="clock-date-cell">${formatted.date}</td>
                <td class="clock-time-cell">${formatted.time}</td>
                <td class="clock-timezone-cell">${formatted.timezone}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="world-clock-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Timezone</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
}

/**
 * Starts the clock auto-update
 */
export function startWorldClock() {
    // Initial update
    updateWorldClock();

    // Clear any existing interval
    if (clockInterval) {
        clearInterval(clockInterval);
    }

    // Update every 5 seconds
    clockInterval = setInterval(updateWorldClock, 5000);
}

/**
 * Stops the clock auto-update
 */
export function stopWorldClock() {
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

// Make functions globally available for HTML onclick handlers
window.updateWorldClock = updateWorldClock;
window.startWorldClock = startWorldClock;
window.stopWorldClock = stopWorldClock;

// Start the clock when the module loads
document.addEventListener('DOMContentLoaded', () => {
    startWorldClock();
});

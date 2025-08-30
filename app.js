if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registered'));
}
// Sensor Simulator
class SensorSimulator {
  constructor() { this.interval = null; }
  startStreaming(cb) {
    this.interval = setInterval(() => {
      cb({
        current: (Math.random()*250 + 50).toFixed(2),
        voltage: (Math.random()*20 + 220).toFixed(2),
        vibration: (Math.random()*5).toFixed(2),
        temperature: (Math.random()*20 + 25).toFixed(2),
        timestamp: new Date().toLocaleTimeString()
      });
    }, 1000);
  }
  simulateLineBreak(cb) {
    clearInterval(this.interval);
    cb({
      current: 0,
      voltage: 0,
      vibration: (Math.random()*50 + 50).toFixed(2),
      temperature: (Math.random()*20 + 25).toFixed(2),
      timestamp: new Date().toLocaleTimeString(),
      faultEvent: true
    });
  }
}

// AI Classification (mock)
function classifyFault(data) {
  if (data.current === 0 && data.vibration > 50) {
    return { type: 'Line Break', confidence: 0.94 };
  } else if (data.temperature > 80) {
    return { type: 'Short Circuit', confidence: 0.90 };
  }
  return { type: 'Overload', confidence: 0.85 };
}

// Notification
if ('Notification' in window) Notification.requestPermission();
function notifyCrew(faultType) {
  if (Notification.permission === 'granted') {
    new Notification('GridGuard Alert', {
      title: 'Fault Detected',
      body: `Type: ${faultType} — isolation in progress`,
      icon: 'https://i.imgur.com/alert-icon.png'
    });
  }
}

// Dashboard Update
const display = document.getElementById('sensor-display');
function updateDashboard(data) {
  display.innerHTML = `
    <div><strong>Time:</strong> ${data.timestamp}</div>
    <div><strong>Current:</strong> ${data.current} A</div>
    <div><strong>Voltage:</strong> ${data.voltage} V</div>
    <div><strong>Vibration:</strong> ${data.vibration} Hz</div>
    <div><strong>Temperature:</strong> ${data.temperature} °C</div>
    ${data.faultEvent ? '<strong style="color:#d9534f">⚠️ Fault Detected!</strong>' : ''}
  `;
  if (data.faultEvent) {
    const result = classifyFault(data);
    display.innerHTML += `<div>Detected: ${result.type} (${(result.confidence*100).toFixed(0)}%)</div>`;
    runIsolationDemo();
    notifyCrew(result.type);
    markFaultOnMap();
  }
}

// Switch Animation & Metrics
let detectionTime, isolationStart;
function runIsolationDemo() {
  isolationStart = performance.now();
  const switches = document.querySelectorAll('.switch');
  switches.forEach((sw, i) => {
    setTimeout(() => {
      sw.classList.add('open');
      if (i === switches.length - 1) {
        const isolationTime = (performance.now() - isolationStart).toFixed(0);
        document.getElementById('metrics').innerHTML = `
          <div><strong>Detection Time:</strong> ${detectionTime} ms</div>
          <div><strong>Isolation Time:</strong> ${isolationTime} ms</div>
        `;
      }
    }, i * 500);
  });
}

// Map Initialization
const map = L.map('map').setView([10.8505, 76.2711], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
function markFaultOnMap() {
  const lat = 10.8505 + (Math.random() - 0.5) * 1;
  const lng = 76.2711 + (Math.random() - 0.5) * 1;
  L.marker([lat, lng]).addTo(map).bindPopup('Fault Location').openPopup();
}

// Simulator and Event Handlers
const simulator = new SensorSimulator();
simulator.startStreaming(updateDashboard);

document.getElementById('simulate-btn').addEventListener('click', () => {
  const start = performance.now();
  simulator.simulateLineBreak(data => {
    detectionTime = (performance.now() - start).toFixed(0);
    updateDashboard(data);
  });
});

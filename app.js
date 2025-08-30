// Sensor Simulator
class SensorSimulator {
  constructor() { this.interval = null; }
  startStreaming(cb) {
    this.interval = setInterval(() => {
      cb({ current: (Math.random()*250+50).toFixed(2),
          voltage: (Math.random()*20+220).toFixed(2),
          vibration: (Math.random()*5).toFixed(2),
          temperature: (Math.random()*20+25).toFixed(2),
          timestamp: new Date().toLocaleTimeString() });
    }, 1000);
  }
  simulateLineBreak(cb) {
    clearInterval(this.interval);
    cb({ current: 0, voltage: 0, vibration: (Math.random()*50+50).toFixed(2),
         temperature: (Math.random()*20+25).toFixed(2),
         timestamp: new Date().toLocaleTimeString(), faultEvent: true });
  }
}

// Dashboard Update
const display = document.getElementById('sensor-display');
function updateDashboard(data) {
  display.innerHTML = `
    <div>Time: ${data.timestamp}</div>
    <div>Current: ${data.current} A</div>
    <div>Voltage: ${data.voltage} V</div>
    <div>Vibration: ${data.vibration} Hz</div>
    <div>Temperature: ${data.temperature} °C</div>
    ${data.faultEvent ? '<strong>⚠️ Fault Detected!</strong>' : ''}
  `;
  if (data.faultEvent) runIsolationDemo();
}

// Switch Animation
function runIsolationDemo() {
  const switches = document.querySelectorAll('.switch');
  switches.forEach((sw, i) =>
    setTimeout(() => sw.classList.add('open'), i * 500)
  );
}

// Initialize
const simulator = new SensorSimulator();
simulator.startStreaming(updateDashboard);

// Button Handler
document.getElementById('simulate-btn')
  .addEventListener('click', () => simulator.simulateLineBreak(updateDashboard));

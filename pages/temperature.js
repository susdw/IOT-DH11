export function render(container, client) {
  container.innerHTML = `
    <div class="container mt-4">
      <h2 class="title">DHT11 — <span class="highlight">Temperatura</span></h2>
      <div class="connected-container">
        <div class="graph-container">
          <canvas id="chartDHT"></canvas>
        </div>
        <div class="temperature-card">
          <div class="progress-ring">
            <svg class="progress-ring__svg" width="200" height="200">
              <circle class="progress-ring__background" stroke="#362142ff" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
              <circle class="progress-ring__circle" stroke="#ff4081" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
            </svg>
            <div class="progress-ring__content">
              <i class="bi bi-thermometer-half" style="font-size: 2.5rem; color: #ff4081;"></i>
              <p id="tempValue" class="display-1 text-danger" style="font-weight: bold;">-- °C</p>
            </div>
          </div>
          <div class="temperature-info">
            <div class="info-item">
              <i class="bi bi-arrow-down-circle" style="color: #4caf50;"></i>
              <span class="info-label">Min:</span>
              <span class="info-value min-temp">-- °C</span>
            </div>
            <div class="info-item">
              <i class="bi bi-arrow-up-circle" style="color: #f44336;"></i>
              <span class="info-label">Max:</span>
              <span class="info-value max-temp">-- °C</span>
            </div>
            <div class="info-item">
              <i class="bi bi-clock" style="color: #ff9800;"></i>
              <span class="info-label">Last Updated:</span>
              <span class="info-value last-updated">--:--:--</span>
            </div>
            <div class="info-item">
              <i class="bi bi-graph-up-arrow" style="color: #2196f3;"></i>
              <span class="info-label">Trend:</span>
              <span class="info-value temp-trend">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const ctx = document.getElementById("chartDHT").getContext("2d");
  const labels = JSON.parse(localStorage.getItem("temperatureLabels")) || [];
  const dataTemp = JSON.parse(localStorage.getItem("temperatureData")) || [];

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { 
          label: "Temperatura (°C)",
          data: dataTemp,
          borderColor: "#ff4081",
          backgroundColor: "rgba(255,64,129,0.2)",
          tension: 0.4,
          fill: true,
          pointStyle: 'circle',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10,
            color: "#ffffff",
            font: {
              size: 14,
              family: "'Arial', sans-serif"
            }
          }
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.7)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#ffffff",
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { 
            color: "#cbb2ff",
            font: {
              size: 12,
              family: "'Arial', sans-serif"
            }
          },
          grid: {
            color: "rgba(255,255,255,0.1)"
          }
        },
        y: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { 
            color: "#cbb2ff",
            font: {
              size: 12,
              family: "'Arial', sans-serif"
            }
          },
          grid: {
            color: "rgba(255,255,255,0.1)"
          }
        }
      }
    }
  });

  let minTemp = Infinity;
  let maxTemp = -Infinity;
  let previousTemp = null;

  // Simulate data for testing
  function simulateData() {
    setInterval(() => {
      const simulatedTemperature = (Math.random() * 20 + 15).toFixed(1); // Random temperature between 15°C and 35°C
      const time = new Date().toLocaleTimeString();

      labels.push(time);
      dataTemp.push(simulatedTemperature);

      if (labels.length > 20) {
        labels.shift();
        dataTemp.shift();
      }

      // Update min and max temperature
      minTemp = Math.min(minTemp, simulatedTemperature);
      maxTemp = Math.max(maxTemp, simulatedTemperature);

      document.querySelector(".min-temp").textContent = `${minTemp.toFixed(1)} °C`;
      document.querySelector(".max-temp").textContent = `${maxTemp.toFixed(1)} °C`;

      // Update last updated time
      document.querySelector(".last-updated").textContent = `${time}`;

      // Update temperature trend
      if (previousTemp !== null) {
        const trend = simulatedTemperature > previousTemp ? "↑ Subindo" : simulatedTemperature < previousTemp ? "↓ Diminuindo" : "→ Stable";
        document.querySelector(".temp-trend").textContent = `${trend}`;
      }
      previousTemp = simulatedTemperature;

      chart.update();

      // Persist data to local storage
      localStorage.setItem("temperatureLabels", JSON.stringify(labels));
      localStorage.setItem("temperatureData", JSON.stringify(dataTemp));

      document.getElementById("tempValue").textContent = `${simulatedTemperature} °C`;

      // Update the progress ring
      const progressCircle = document.querySelector(".progress-ring__circle");
      const radius = progressCircle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      const percentage = Math.min((simulatedTemperature / 100) * 100, 100); // Max value is 100

      progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    }, 2000); // Update every 2 seconds
  }

  simulateData(); // Start the simulation
}
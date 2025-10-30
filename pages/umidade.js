export function render(container, client) {
  container.innerHTML = `
    <div class="container mt-4" style="margin-top: 5%">
      <h2 class="title">Umidade</h2>
      <div class="connected-container">
        <div class="graph-container">
          <canvas id="chartHumidity"></canvas>
        </div>
        <div class="humidity-card">
          <div class="progress-ring">
            <svg class="progress-ring__svg" width="200" height="200">
              <circle class="progress-ring__background" stroke="#362142" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
              <circle class="progress-ring__circle" stroke="#2196f3" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
            </svg>
            <div class="progress-ring__content">
              <i class="bi bi-droplet" style="font-size: 2.5rem; color: #2196f3;"></i>
              <p id="humidityValue" class="display-1" style="font-weight: bold; color: #2196f3;">-- %</p>
            </div>
          </div>
          <div class="humidity-info">
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-arrow-down-circle" style="color: #4caf50;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Min:</span>
              <span class="info-value min-humidity" style="text-align: right;">-- %</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-arrow-up-circle" style="color: #f44336;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Max:</span>
              <span class="info-value max-humidity" style="text-align: right;">-- %</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-clock" style="color: #ff9800;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Horário:</span>
              <span class="info-value last-updated" style="text-align: right;">--:--:--</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-graph-up-arrow" style="color: #2196f3;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Tendência:</span>
              <span class="info-value humidity-trend" style="text-align: right;">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const ctx = document.getElementById("chartHumidity").getContext("2d");
  const labels = JSON.parse(localStorage.getItem("humidityLabels")) || [];
  const dataHumidity = JSON.parse(localStorage.getItem("humidityData")) || [];

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Umidade (%)",
        data: dataHumidity,
        borderColor: "#2196f3",
        backgroundColor: "rgba(33,150,243,0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff",
            font: { size: 14, family: "'Arial', sans-serif" },
            usePointStyle: true,
            pointStyle: "circle" 
          }
        },
      },
      scales: {
        x: {
          ticks: { color: "#cbb2ff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        },
        y: {
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { color: "#cbb2ff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      }
    }
  });

  let minHumidity = Infinity, maxHumidity = -Infinity, previousHumidity = null;

  // Ensure MQTT topic matches Arduino's published topic
  client.subscribe("carlos/dht11", (err) => {
    if (!err) {
      console.log("Subscribed to carlos/dht11");
    }
  });
  client.on("message", (topic, message) => {
    if (topic === "carlos/dht11") {
      try {
        const data = JSON.parse(message.toString());
        const humidity = parseFloat(data.umidade);
        const time = new Date().toLocaleTimeString();

        labels.push(time);
        dataHumidity.push(humidity);
        if (labels.length > 20) { labels.shift(); dataHumidity.shift(); }

        minHumidity = Math.min(minHumidity, humidity);
        maxHumidity = Math.max(maxHumidity, humidity);
        document.querySelector(".min-humidity").textContent = `${minHumidity.toFixed(1)} %`;
        document.querySelector(".max-humidity").textContent = `${maxHumidity.toFixed(1)} %`;
        document.querySelector(".last-updated").textContent = time;

        const trend = previousHumidity === null ? "--" : humidity > previousHumidity ? "↑ Subindo" : humidity < previousHumidity ? "↓ Caindo" : "→ Estável";
        document.querySelector(".humidity-trend").textContent = trend;
        previousHumidity = humidity;

        document.getElementById("humidityValue").textContent = `${humidity.toFixed(1)} %`;

        const circle = document.querySelector(".progress-ring__circle");
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const percent = Math.min((humidity / 100) * 100, 100);
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;

        localStorage.setItem("humidityLabels", JSON.stringify(labels));
        localStorage.setItem("humidityData", JSON.stringify(dataHumidity));

        chart.update();
      } catch (error) {
        console.error("Failed to parse MQTT message:", error);
      }
    }
  });
}

export function render(container, client) {
container.innerHTML = `
   <div class="container mt-4" style="margin-top: 5%">
      <h2 class="title">Temperatura</h2>
      <div class="connected-container">
        <div class="graph-container">
          <canvas id="chartTemperature"></canvas>
        </div>
        <div class="humidity-card">
          <div class="progress-ring">
            <svg class="progress-ring__svg" width="200" height="200">
              <circle class="progress-ring__background" stroke="#362142" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
              <circle class="progress-ring__circle" stroke="#ff4081" stroke-width="10" fill="transparent" r="90" cx="100" cy="100" />
            </svg>
            <div class="progress-ring__content">
              <i class="bi bi-thermometer-half" style="font-size: 2.5rem; color: #ff4081;"></i>
              <p id="tempValue" class="display-1" style="font-weight: bold; color: #ff4081;">-- %</p>
            </div>
          </div>
          <div class="humidity-info">
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-arrow-down-circle" style="color: #4caf50;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Min:</span>
              <span class="info-value min-temp" style="text-align: right;">-- °C</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-arrow-up-circle" style="color: #f44336;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Max:</span>
              <span class="info-value max-temp" style="text-align: right;">-- °C</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-clock" style="color: #ff9800;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Horário:</span>
              <span class="info-value last-updated" style="text-align: right;">--:--:--</span>
            </div>
            <div class="info-item" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <i class="bi bi-graph-up-arrow" style="color: #2196f3;"></i>
              <span style="flex: 1; text-align: left; margin-left:5px;">Tendência:</span>
              <span class="info-value temp-trend" style="text-align: right;">--</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const ctx = document.getElementById("chartTemperature").getContext("2d");
  const labels = JSON.parse(localStorage.getItem("temperatureLabels")) || [];
  const dataTemp = JSON.parse(localStorage.getItem("temperatureData")) || [];

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperatura (°C)",
        data: dataTemp,
        borderColor: "#ff4081",
        backgroundColor: "rgba(255,64,129,0.2)",
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
          suggestedMax: 50,
          ticks: { color: "#cbb2ff" },
          grid: { color: "rgba(255,255,255,0.1)" }
        }
      }
    }
  });

  let minTemp = Infinity, maxTemp = -Infinity, previousTemp = null;

  // Ensure MQTT topic matches Arduino's published topic
  client.subscribe("carlos/dht11", (err) => {
    if (!err) {
      console.log("Subscribed to carlos/dht11");
    }
  });
  client.on("connect", () => {
    console.log("[DEBUG] MQTT client connected");
  });
  client.on("message", (topic, message) => {
    console.log(`[DEBUG] Received message on topic: ${topic}`);
    console.log(`[DEBUG] Message content: ${message.toString()}`);

    if (topic === "carlos/dht11") {
      try {
        const data = JSON.parse(message.toString());
        console.log("[DEBUG] Parsed data:", data);

        const temperature = parseFloat(data.temperatura);
        console.log(`[DEBUG] Extracted temperature: ${temperature}`);

        const time = new Date().toLocaleTimeString();
        labels.push(time);
        dataTemp.push(temperature);

        if (labels.length > 20) {
          labels.shift();
          dataTemp.shift();
        }

        minTemp = Math.min(minTemp, temperature);
        maxTemp = Math.max(maxTemp, temperature);

        document.querySelector(".min-temp").textContent = `${minTemp.toFixed(1)} °C`;
        document.querySelector(".max-temp").textContent = `${maxTemp.toFixed(1)} °C`;
        document.querySelector(".last-updated").textContent = time;

        const trend = previousTemp === null ? "--" : temperature > previousTemp ? "↑ Subindo" : temperature < previousTemp ? "↓ Caindo" : "→ Estável";
        document.querySelector(".temp-trend").textContent = trend;
        previousTemp = temperature;

        document.getElementById("tempValue").textContent = `${temperature.toFixed(1)} °C`;

        const circle = document.querySelector(".progress-ring__circle");
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const percent = Math.min((temperature / 50) * 100, 100);
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;

        localStorage.setItem("temperatureLabels", JSON.stringify(labels));
        localStorage.setItem("temperatureData", JSON.stringify(dataTemp));

        chart.update();
      } catch (error) {
        console.error("[DEBUG] Failed to parse MQTT message:", error);
      }
    }
  });
}

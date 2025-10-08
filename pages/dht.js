export function render(container, client) {
  container.innerHTML = `
    <h2 class="title">DHT11 — Temperatura e Umidade</h2>
    <div class="cards">
      <div class="card">
        <h3>Temperatura</h3>
        <p id="tempValue" class="value">-- °C</p>
      </div>
      <div class="card">
        <h3>Umidade</h3>
        <p id="humValue" class="value">-- %</p>
      </div>
    </div>
    <section class="grafico-container">
      <canvas id="chartDHT"></canvas>
    </section>
    <div class="toggle-container">
      <label for="simulateToggle" class="toggle-label">Simular Dados</label>
      <input type="checkbox" id="simulateToggle" class="toggle-input" />
    </div>
  `;

  const ctx = document.getElementById("chartDHT").getContext("2d");
  const labels = [];
  const dataTemp = [];
  const dataHum = [];

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
        },
        {
          label: "Umidade (%)",
          data: dataHum,
          borderColor: "#7c4dff",
          backgroundColor: "rgba(124,77,255,0.2)",
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
      animation: {
        duration: 1500,
        easing: 'easeInOutCubic'
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

  let simulate = false;
  let simulationInterval;

  document.getElementById("simulateToggle").addEventListener("change", (event) => {
    simulate = event.target.checked;

    if (simulate) {
      simulationInterval = setInterval(() => {
        const simulatedData = {
          temperatura: (Math.random() * 15 + 20).toFixed(1),
          umidade: (Math.random() * 40 + 30).toFixed(1)
        };

        const time = new Date().toLocaleTimeString();

        labels.push(time);
        dataTemp.push(simulatedData.temperatura);
        dataHum.push(simulatedData.umidade);

        if (labels.length > 20) {
          labels.shift();
          dataTemp.shift();
          dataHum.shift();
        }

        chart.update();

        document.getElementById("tempValue").textContent = `${simulatedData.temperatura} °C`;
        document.getElementById("humValue").textContent = `${simulatedData.umidade} %`;
      }, 2000);
    } else {
      clearInterval(simulationInterval);
    }
  });

  client.subscribe("senai/iot/dh11");

  client.on("message", (topic, message) => {
    if (simulate || topic !== "senai/iot/dh11") return;

    const data = JSON.parse(message.toString());
    const time = new Date().toLocaleTimeString();

    labels.push(time);
    dataTemp.push(data.temperatura);
    dataHum.push(data.umidade);

    if (labels.length > 20) {
      labels.shift();
      dataTemp.shift();
      dataHum.shift();
    }

    chart.update();

    document.getElementById("tempValue").textContent = `${data.temperatura.toFixed(1)} °C`;
    document.getElementById("humValue").textContent = `${data.umidade.toFixed(1)} %`;
  })};
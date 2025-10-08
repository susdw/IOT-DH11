export function render(container, client) {
  container.innerHTML = `
    <h2>DHT11 — Temperatura e Umidade</h2>
    <div class="cards">
      <div class="card"><h3>Temperatura</h3><p id="tempValue">-- °C</p></div>
      <div class="card"><h3>Umidade</h3><p id="humValue">-- %</p></div>
    </div>
    <section class="grafico-container">
      <canvas id="chartDHT"></canvas>
    </section>
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
        { label: "Temperatura (°C)", data: dataTemp, borderColor: "#ff4081", backgroundColor: "rgba(255,64,129,0.2)", tension: 0.4, fill: true },
        { label: "Umidade (%)", data: dataHum, borderColor: "#7c4dff", backgroundColor: "rgba(124,77,255,0.2)", tension: 0.4, fill: true }
      ]
    },
    options: { responsive: true, scales: { x: { ticks: { color: "#cbb2ff" } }, y: { ticks: { color: "#cbb2ff" } } } }
  });

  client.subscribe("senai/iot/dh11");

  client.on("message", (topic, message) => {
    if (topic !== "senai/iot/dh11") return;
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

    chart.update("none");

    document.getElementById("tempValue").textContent = `${data.temperatura.toFixed(1)} °C`;
    document.getElementById("humValue").textContent = `${data.umidade.toFixed(1)} %`;
  });
}

export function render(container, client) {
  container.innerHTML = `
    <h2>LDR — Intensidade da Luz</h2>
    <div class="cards">
      <div class="card"><h3>Luminosidade</h3><p id="lightValue">-- lux</p></div>
    </div>
    <section class="grafico-container">
      <canvas id="chartLight"></canvas>
    </section>
  `;

  const ctx = document.getElementById("chartLight").getContext("2d");
  const labels = [];
  const dataLight = [];

  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Luminosidade (lux)", data: dataLight, borderColor: "#fdd835", backgroundColor: "rgba(253,216,53,0.2)", tension: 0.4, fill: true }
      ]
    },
    options: { responsive: true, scales: { x: { ticks: { color: "#cbb2ff" } }, y: { ticks: { color: "#cbb2ff" } } } }
  });

  client.subscribe("senai/iot/ldr");

  client.on("message", (topic, message) => {
    if (topic !== "senai/iot/ldr") return;
    const data = JSON.parse(message.toString());
    const time = new Date().toLocaleTimeString();

    labels.push(time);
    dataLight.push(data.luz);

    if (labels.length > 20) {
      labels.shift();
      dataLight.shift();
    }

    chart.update("none");

    document.getElementById("lightValue").textContent = `${data.luz.toFixed(0)} lux`;
  });
}

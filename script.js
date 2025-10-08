window.Dashboard = {
  client: mqtt.connect("wss://broker.hivemq.com:8884/mqtt"),
  currentPage: null,

  async loadPage(name) {
    const main = document.getElementById("main-content");
    main.innerHTML = `<p>Carregando ${name}...</p>`;
    const module = await import(`./pages/${name}.js`);
    main.innerHTML = "";
    module.render(main, this.client);
  }
};

// barrinha lateral
document.querySelectorAll(".sidebar button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Dashboard.loadPage(btn.dataset.page);
  });
});

// MQTT log de conexão
Dashboard.client.on("connect", () => console.log("[MQTT] Conectado ao broker"));

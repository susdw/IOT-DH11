const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

const label = [];
const dataTemp = [];
const dataUmid = [];

const ctx = document.getElementById("grafico").getContext("2d");
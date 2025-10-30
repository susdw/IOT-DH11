document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault(); // impede de recarregar a página

  // pega o que o usuário digitou
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  // coloca aqui o login e senha corretos que tu quiser
  const emailCorreto = "teste123@gmail.com";
  const senhaCorreta = "teste12";

  if (email === emailCorreto && senha === senhaCorreta) {
    alert("Login feito com sucesso! ");
    // redireciona pra outra página
    window.location.href = "home.html";
  } else {
    alert("E-mail ou senha errados, tenta de novo!");
  }
});
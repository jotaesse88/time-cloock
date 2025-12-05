const API_BASE = "";

//----------------------------------------
// LOGIN
//----------------------------------------
function loginUser() {
    const email = document.getElementById("emailLogin").value;
    const senha = document.getElementById("senhaLogin").value;

    fetch(API_BASE + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
    })
    .then(r => r.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "home.html";
        } else {
            alert(data.msg || "Erro ao fazer login");
        }
    })
    .catch(err => alert("Erro de comunicação: " + err.message));
}

//----------------------------------------
// REGISTRO
//----------------------------------------
function registerUser() {
    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    fetch(API_BASE + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
    })
    .then(r => r.json())
    .then(data => {
        alert(data.msg || "Erro no cadastro");

        if (data.msg && data.msg.includes("Cadastrado")) {
            window.location.href = "index.html";
        }
    })
    .catch(err => alert("Erro de comunicação: " + err.message));
}

//----------------------------------------
// AUTH NA HOME
//----------------------------------------
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "index.html");

    fetch(API_BASE + "/auth", {
        headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
        if (!data.user) return (window.location.href = "index.html");
        document.getElementById("user").innerText = "Logado como: " + data.user;
        carregarHistorico();
    })
    .catch(() => window.location.href = "index.html");
}

//----------------------------------------
// LOGOUT
//----------------------------------------
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

//----------------------------------------
// REGISTRAR ENTRADA / SAÍDA
//----------------------------------------
function registrar(tipo) {
    const token = localStorage.getItem("token");
    const email = token ? atob(token).split(":")[0] : null;

    fetch(API_BASE + "/presenca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tipo })
    })
    .then(r => r.json())
    .then(data => {
        alert(data.msg);
        carregarHistorico();
    });
}

// Garantir botões funcionando
document.addEventListener("DOMContentLoaded", () => {
    const btnEntrada = document.getElementById("btnEntrada");
    const btnSaida = document.getElementById("btnSaida");

    if (btnEntrada) btnEntrada.onclick = () => registrar("entrada");
    if (btnSaida) btnSaida.onclick = () => registrar("saida");
});

//----------------------------------------
// CARREGAR HISTÓRICO DO USUÁRIO
//----------------------------------------
function carregarHistorico() {
    const token = localStorage.getItem("token");
    const email = token ? atob(token).split(":")[0] : null;

    fetch(API_BASE + "/presencas/" + email)
        .then(r => r.json())
        .then(lista => {
            const ul = document.getElementById("listaPresenca");
            ul.innerHTML = "";

            lista.forEach(item => {
                const li = document.createElement("li");
                li.classList = "list-group-item";
                li.textContent = `${item.tipo.toUpperCase()} - ${new Date(item.horario).toLocaleString("pt-BR")}`;
                ul.appendChild(li);
            })

        });
}

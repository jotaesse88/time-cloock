const API_BASE = "http://localhost:3000";
let todasPresencas = [];

// =============================
// Verificar se é ADMIN
// =============================
function startAdminPage() {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    fetch(API_BASE + "/auth", {
        headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
        if (!data.role || data.role !== "admin") {
            alert("Acesso negado!");
            return window.location.href = "home.html";
        }

        mostrarBotaoUsuarios();
        carregarTodasPresencas();
    })
    .catch(() => window.location.href = "index.html");
}

// =============================
// Mostrar botão para admin
// =============================
function mostrarBotaoUsuarios() {
    const btn = document.getElementById("btnGerenciarUsuarios");
    btn.style.display = "block";
    btn.onclick = () => window.location.href = "admin-users.html";
}

// =============================
// PRESENÇAS
// =============================
function carregarTodasPresencas() {
    fetch(API_BASE + "/presencas")
        .then(r => r.json())
        .then(data => {
            todasPresencas = data;
            renderTabela(data);
        });
}

function aplicarFiltros() {
    const email = document.getElementById("filtroEmail").value.toLowerCase();
    const tipo = document.getElementById("filtroTipo").value;

    let filtrado = todasPresencas;

    if (email) filtrado = filtrado.filter(p => p.email.toLowerCase().includes(email));
    if (tipo) filtrado = filtrado.filter(p => p.tipo === tipo);

    renderTabela(filtrado);
}

function renderTabela(lista) {
    const tbody = document.getElementById("tabelaPresencas");
    tbody.innerHTML = "";

    lista.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.email}</td>
            <td>${p.tipo.toUpperCase()}</td>
            <td>${new Date(p.horario).toLocaleString("pt-BR")}</td>
        `;
        tbody.appendChild(tr);
    });
}

function exportarCSV() {
    let csv = "email,tipo,horario\n";
    todasPresencas.forEach(p => {
        csv += `${p.email},${p.tipo},${p.horario}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "presencas.csv";
    a.click();

    URL.revokeObjectURL(url);
}

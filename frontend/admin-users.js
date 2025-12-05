let actionFunction = null; 

function carregarUsuarios() {
    fetch("/usuarios")
        .then(r => r.json())
        .then(lista => {
            const tbody = document.getElementById("listaUsuarios");
            tbody.innerHTML = "";

            lista.forEach(u => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                        ${
                            u.role === "admin"
                            ? `<button class="btn btn-danger btn-sm" onclick="rebaixar('${u.email}')">Remover Admin</button>`
                            : `<button class="btn btn-success btn-sm" onclick="promover('${u.email}')">Tornar Admin</button>`
                        }
                     <button class="btn btn-outline-danger btn-sm" onclick="removerUsuario('${u.email}')">Excluir Usuário</button>
                    </td>

                `;

                tbody.appendChild(tr);
            });
        });
}

function promover(email) {
    abrirModalConfirmacao(
        "Dar Permissão de Admin",
        `Deseja tornar <b>${email}</b> administrador?`,
        "bg-success text-white",
        () => {
            fetch("/promover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: "admin" })
            })
            .then(r => r.json())
            .then(() => carregarUsuarios());
        }
    );
}

function rebaixar(email) {
    abrirModalConfirmacao(
        "Remover Permissão de Admin",
        `Tem certeza que deseja remover o admin de <b>${email}</b>?`,
        "bg-danger text-white",
        () => {
            fetch("/promover", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: "user" })
            })
            .then(r => r.json())
            .then(() => carregarUsuarios());
        }
    );
}

function removerUsuario(email) {
    abrirModalConfirmacao(
        "Excluir Usuário",
        `Tem certeza que deseja excluir o usuário <b>${email}</b>? Esta ação não pode ser desfeita.`,
        "bg-danger text-white",
        () => {
            fetch("/removerUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            .then(r => r.json())
            .then(() => carregarUsuarios());
        }
    );
}

function abrirModalConfirmacao(titulo, mensagem, corHeader, callback) {
    document.getElementById("modalTitle").innerText = titulo;
    document.getElementById("modalBody").innerHTML = mensagem;
    document.querySelector(".modal-header").className = "modal-header " + corHeader;

    actionFunction = callback;

    const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
    modal.show();

    document.getElementById("confirmActionBtn").onclick = () => {
        actionFunction();
        modal.hide();
    };
}
function startAdminUsers() {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    fetch("/auth", {
        headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
        if (data.role !== "admin") {
            alert("Acesso negado!");
            return window.location.href = "home.html";
        }

        // Agora SIM pode carregar a lista
        carregarUsuarios();
    })
    .catch(() => window.location.href = "index.html");
}


function startAdminPage() {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    fetch("http://localhost:3000/auth", {
        headers: { Authorization: "Bearer " + token }
    })
    .then(r => r.json())
    .then(data => {
        if (data.role !== "admin") {
            alert("Acesso negado!");
            return window.location.href = "home.html";
        }

        // Somente AQUI é seguro chamar
        carregarTodasPresencas();
        verificarPermissaoAdmin();
    })
    .catch(() => window.location.href = "index.html");
}

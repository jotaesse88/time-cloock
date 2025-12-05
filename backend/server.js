import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from "fs";
import { fileURLToPath } from "url";

// =============================
// CONFIGURAÇÃO DE DIRETÓRIO
// =============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// =============================
// ARQUIVOS DE BANCO (JSON)
// =============================
const USERS_PATH = path.join(__dirname, "users.json");
const PRESENCAS_PATH = path.join(__dirname, "presencas.json");

// --- Funções utilitárias de leitura/escrita ---
function loadUsers() {
    try { return JSON.parse(fs.readFileSync(USERS_PATH)); }
    catch { return []; }
}

function saveUsers(data) {
    fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
}

function loadPresencas() {
    try { return JSON.parse(fs.readFileSync(PRESENCAS_PATH)); }
    catch { return []; }
}

function savePresencas(data) {
    fs.writeFileSync(PRESENCAS_PATH, JSON.stringify(data, null, 2));
}

// =====================================
// LOGIN
// =====================================
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const users = loadUsers();
    const user = users.find(u => u.email === email && u.senha === senha);

    if (!user) {
        return res.status(400).json({ msg: "Usuário ou senha inválidos" });
    }

    // token simples base64
    const token = Buffer.from(email + ":" + Date.now()).toString("base64");

    return res.json({ token });
});

// =====================================
// CADASTRO
// =====================================
app.post("/register", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ msg: "Preencha todos os campos" });
    }

    let users = loadUsers();

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ msg: "Email já cadastrado" });
    }

    users.push({ nome, email, senha, role: "user" });
    saveUsers(users);

    return res.json({ msg: "Cadastrado com sucesso!" });
});

// =====================================
// AUTENTICAÇÃO
// =====================================
app.get("/auth", (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.json({ user: null });

    const token = auth.replace("Bearer ", "");
    const decoded = Buffer.from(token, 'base64').toString().split(":")[0];

    const users = loadUsers();
    const user = users.find(u => u.email === decoded);

    if (!user) return res.json({ user: null });

    return res.json({ user: user.nome, role: user.role });
});

// =====================================
// PRESENÇAS
// =====================================
app.post("/presenca", (req, res) => {
    const { email, tipo } = req.body;

    if (!email || !tipo)
        return res.status(400).json({ msg: "Dados incompletos" });

    const presencas = loadPresencas();

    presencas.push({
        email,
        tipo,
        horario: new Date().toISOString()
    });

    savePresencas(presencas);

    return res.json({ msg: "Presença registrada!" });
});

app.get("/presencas/:email", (req, res) => {
    const presencas = loadPresencas().filter(p => p.email === req.params.email);
    return res.json(presencas);
});

app.get("/presencas", (req, res) => {
    return res.json(loadPresencas());
});

// =====================================
// ADMIN: GERENCIAMENTO DE USUÁRIOS
// =====================================

// Tornar admin / remover admin
app.post("/promover", (req, res) => {
    const { email, role } = req.body;

    let users = loadUsers();
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

    user.role = role;
    saveUsers(users);

    return res.json({ msg: "Permissão atualizada!" });
});

// Listar todos usuários
app.get("/usuarios", (req, res) => {
    return res.json(loadUsers());
});

// Remover usuário
app.post("/removerUsuario", (req, res) => {
    const { email } = req.body;

    let users = loadUsers();
    const index = users.findIndex(u => u.email === email);

    if (index === -1) {
        return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    users.splice(index, 1);
    saveUsers(users);

    return res.json({ msg: "Usuário removido com sucesso!" });
});

// =====================================
// FRONTEND
// =====================================
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// =====================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));


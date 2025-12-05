import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ------------------------------------------------------
// CONFIGURAÇÃO DE DIRETÓRIO
// ------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho CORRETO para a pasta frontend no Render
const frontendPath = path.join(process.cwd(), "frontend");

// ------------------------------------------------------
// APP
// ------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------------------------
// ARQUIVOS JSON
// ------------------------------------------------------
const USERS_PATH = path.join(__dirname, "users.json");
const PRESENCAS_PATH = path.join(__dirname, "presencas.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(data) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(data, null, 2));
}

function loadPresencas() {
  try {
    return JSON.parse(fs.readFileSync(PRESENCAS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function savePresencas(data) {
  fs.writeFileSync(PRESENCAS_PATH, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// ROTA LOGIN
// ------------------------------------------------------
app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  const users = loadUsers();

  const user = users.find(u => u.email === email && u.senha === senha);
  if (!user) return res.status(400).json({ msg: "Usuário ou senha inválidos" });

  const token = Buffer.from(email + ":" + Date.now()).toString("base64");
  res.json({ token });
});

// ------------------------------------------------------
// ROTA REGISTER
// ------------------------------------------------------
app.post("/register", (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ msg: "Preencha todos os campos" });

  const users = loadUsers();

  if (users.find(u => u.email === email))
    return res.status(400).json({ msg: "Email já cadastrado" });

  users.push({ nome, email, senha, role: "user" });
  saveUsers(users);

  res.json({ msg: "Cadastrado com sucesso!" });
});

// ------------------------------------------------------
// ROTA AUTENTICAÇÃO
// ------------------------------------------------------
app.get("/auth", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.json({ user: null });

  const token = auth.replace("Bearer ", "");
  const decodedEmail = Buffer.from(token, "base64").toString().split(":")[0];

  const users = loadUsers();
  const user = users.find(u => u.email === decodedEmail);

  if (!user) return res.json({ user: null });

  res.json({ user: user.nome, role: user.role });
});

// ------------------------------------------------------
// ROTAS PRESENÇAS
// ------------------------------------------------------
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
  res.json({ msg: "Presença registrada!" });
});

app.get("/presencas/:email", (req, res) => {
  const presencas = loadPresencas().filter(p => p.email === req.params.email);
  res.json(presencas);
});

app.get("/presencas", (req, res) => {
  res.json(loadPresencas());
});

// ------------------------------------------------------
// ROTAS ADMIN
// ------------------------------------------------------
app.post("/promover", (req, res) => {
  const { email, role } = req.body;

  const users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

  user.role = role;
  saveUsers(users);

  res.json({ msg: "Permissão atualizada!" });
});

app.get("/usuarios", (req, res) => {
  res.json(loadUsers());
});

app.post("/removerUsuario", (req, res) => {
  const { email } = req.body;

  let users = loadUsers();
  const index = users.findIndex(u => u.email === email);

  if (index === -1)
    return res.status(400).json({ msg: "Usuário não encontrado" });

  users.splice(index, 1);
  saveUsers(users);

  res.json({ msg: "Usuário removido com sucesso!" });
});

// ------------------------------------------------------
// SERVIR O FRONTEND (CORRETAMENTE NO RENDER)
// ------------------------------------------------------
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ------------------------------------------------------
// INICIAR SERVIDOR
// ------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Servidor rodando na porta " + PORT)
);

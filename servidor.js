// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================

const express = require('express');
const app = express();
const { DatabaseSync } = require('node:sqlite');

// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());

// ------------------------------------------------------------
// Os dados moram aqui, na memoria. Somem quando o servidor cai.
// ------------------------------------------------------------

const db = new DatabaseSync('treinos.db');
// Garante que a tabela existe
db.exec(`
CREATE TABLE IF NOT EXISTS treinos (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
duracao INTEGER NOT NULL
)
`);

// ------------------------------------------------------------
// Validacao
// ------------------------------------------------------------
function validarTreino(corpo) {
  if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
    return 'O campo nome e obrigatorio e deve ser um texto.';
  }
 
  if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
    return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
  }
  return null;
}

// ------------------------------------------------------------
// GET /treinos - lista todos os treinos
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
// --- Acrescentado para o Item 10 ---
const busca = req.query.busca;
if (busca) {
const termoBusca = `%${busca}%`;
const treinosFiltrados = db.prepare('SELECT * FROM treinos WHERE nome LIKE ?').all(termoBusca);
return res.status(200).json(treinosFiltrados);
}
// -----------------------------------

const treinos = db.prepare('SELECT * FROM treinos').all();
res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/resumo - resumo estatistico (Acrescentado para Item 11)
// ------------------------------------------------------------
app.get('/treinos/resumo', (req, res) => {
const consulta = db.prepare('SELECT COUNT(*) AS total, SUM(duracao) AS minutos, AVG(duracao) AS media FROM treinos').get();
res.status(200).json({
total: consulta.total || 0,
minutos: consulta.minutos || 0,
media: consulta.media || 0
});
});

// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id
// ------------------------------------------------------------
app.get('/treinos/:id', (req, res) => {
if (!/^\d+\$/.test(req.params.id)) {
return res.status(400).json({ erro: 'Id invalido. O ID deve ser um numero inteiro.' });
}
// -----------------------------------

const id = Number(req.params.id);
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
res.status(200).json(treino);
});

// ------------------------------------------------------------
// POST /treinos - cria um treino
// ------------------------------------------------------------
app.post('/treinos', (req, res) => {
const erro = validarTreino(req.body);
if (erro !== null){
return res.status(400).json({ erro: erro });
}
const resultado = db
.prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)')
.run(req.body.nome, req.body.duracao);
const novo = db
.prepare('SELECT * FROM treinos WHERE id = ?')
.get(resultado.lastInsertRowid);
res.status(201).json(novo);
});

// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino
// ------------------------------------------------------------
app.put('/treinos/:id', (req, res) => {
const id = Number(req.params.id);
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
const erro = validarTreino(req.body);
if (erro !== null){
return res.status(400).json({ erro: erro });
}
db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?')
.run(req.body.nome, req.body.duracao, id);
const atualizado = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
res.status(200).json(atualizado);
});

// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
// ------------------------------------------------------------
app.delete('/treinos/:id', (req, res) => {
const id = Number(req.params.id);
const treino = db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
db.prepare('DELETE FROM treinos WHERE id = ?').run(id);
res.status(204).end();
});
// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

const db = require('../banco.js');
function listarTodos() {


    return db.prepare('SELECT * FROM treinos').all();
}
function buscarPorId(id) {
    return db.prepare('SELECT * FROM treinos WHERE id = ?').get(id);
}
function criar(nome, duracao) {
    const resultado = db
        .prepare('INSERT INTO treinos (nome, duracao) VALUES (?, ?)')
        .run(nome, duracao);
    return buscarPorId(resultado.lastInsertRowid);
}
function atualizar(id, nome, duracao) {
    db.prepare('UPDATE treinos SET nome = ?, duracao = ? WHERE id = ?')
        .run(nome, duracao, id);
    return buscarPorId(id);
}
function remover(id) {
    const resultado = db.prepare('DELETE FROM treinos WHERE id = ?').run(id);
    return resultado.changes > 0;
}
module.exports = { listarTodos, buscarPorId, criar, atualizar, remover };


const repository = require('../repositories/treinosRepository.js');
function validarTreino(corpo) {
if (typeof corpo.nome !== 'string' || corpo.nome.trim() === ''){
return 'O campo nome e obrigatorio e deve ser um texto.';
}
if (typeof corpo.duracao !== 'number' || corpo.duracao <= 0) {
return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
}
return null;
}
function listarTodos() {
return repository.listarTodos();
}
function buscarPorId(id) {
return repository.buscarPorId(id);
}
function criarTreino(corpo) {
const erro = validarTreino(corpo);
if (erro !== null){
return { erro: erro };
}
const novo = repository.criar(corpo.nome, corpo.duracao);
return { treino: novo };

3

}
function atualizarTreino(id, corpo) {
const existente = repository.buscarPorId(id);
if (existente === undefined) {
return { naoEncontrado: true };
}
const erro = validarTreino(corpo);
if (erro !== null){
return { erro: erro };
}
const atualizado = repository.atualizar(id, corpo.nome, corpo.duracao);
return { treino: atualizado };
}
function removerTreino(id) {
const existente = repository.buscarPorId(id);
if (existente === undefined) {
return { naoEncontrado: true };
}
repository.remover(id);
return { removido: true };
}
module.exports = {
listarTodos,
buscarPorId,
criarTreino,
atualizarTreino,
removerTreino,
};



const service = require('../services/treinosService.js');
function listar(req, res) {
const treinos = service.listarTodos();
res.status(200).json(treinos);
}
function buscarUm(req, res) {
const id = Number(req.params.id);
const treino = service.buscarPorId(id);
if (treino === undefined) {
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
res.status(200).json(treino);
}
function criar(req, res) {
const resultado = service.criarTreino(req.body);
if (resultado.erro !== undefined) {

4

return res.status(400).json({ erro: resultado.erro });
}
res.status(201).json(resultado.treino);
}
function atualizar(req, res) {
const id = Number(req.params.id);
const resultado = service.atualizarTreino(id, req.body);
if (resultado.naoEncontrado === true){
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
if (resultado.erro !== undefined) {
return res.status(400).json({ erro: resultado.erro });
}
res.status(200).json(resultado.treino);
}
function remover(req, res) {
const id = Number(req.params.id);
const resultado = service.removerTreino(id);
if (resultado.naoEncontrado === true){
return res.status(404).json({ erro: 'Treino nao encontrado.' });
}
res.status(204).end();
}
module.exports = { listar, buscarUm, criar, atualizar, remover };


const express = require('express');
const controller = require('./controllers/treinosController.js');
const app = express();
app.use(express.json());
app.get('/treinos', controller.listar);
app.get('/treinos/:id', controller.buscarUm);
app.post('/treinos', controller.criar);
app.put('/treinos/:id', controller.atualizar);
app.delete('/treinos/:id', controller.remover);
const PORTA = 3000;
app.listen(PORTA, () => {
console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

const service = require('./services/treinosService.js');
console.log(service.listarTodos());
console.log(service.criarTreino({ nome: 'Teste sem servidor', duracao: 15 }));
console.log(service.criarTreino({ nome: '', duracao: 15 }));

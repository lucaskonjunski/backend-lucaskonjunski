
const bcrypt = require('bcrypt');
const db = require('./banco.js');

async function criarUsuarios() {
    const senhaDiego = await bcrypt.hash('1234', 10);
    const senhaAluno = await bcrypt.hash('senha', 10);

    const inserir = db.prepare(
        'INSERT INTO usuarios (usuario, senha_hash) VALUES (?, ?)'
    );

    inserir.run('diego', senhaDiego);
    inserir.run('aluno', senhaAluno);

    console.log('Usuarios criados com sucesso!');
}

criarUsuarios();

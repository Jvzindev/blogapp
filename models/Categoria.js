// Criar um model de Categorias;
// Importando modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Aqui estou armazenando o mongoose.Schema, no Schema pra ficar facil de usar;

// Criando model
const Categoria = new Schema({
    nome: {
        type: String,
        required: true // Campo Obrigatório
    },
    slug: {
        type: String,
        required: true // Campo Obrigatório
    },
    date: {
        type: Date,
        default: Date.now() // Se o usuário não passar nenhum valor pro campo Date, como padrão ele vai passar o valor que coloquei no caso: Date.now()
    }
});

// Aqui estou criando o model dentro do banco de dados com o nome "categorias" e pegando o model que foi criado o "Categoria"
mongoose.model("categorias", Categoria);




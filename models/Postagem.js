// Importando modulos
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postagens = Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    // A categoria vai armazenar um id de uma categoria, quando eu crio  um objeto desse tipo eu preciso passar uma referença, no caso o objeto de referença vai ver o model categorias
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    data: {
        type: Date,
        default: Date.now
    }
});
// Aqui estou criando o model, primeiro parametro é o nome do model e o segundo parametro é o model que criei!
mongoose.model("postagens", postagens);

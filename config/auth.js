// Usando o .Strategy usando falando que é uma sub-biblioteca no caso é a 'local'
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model de usuários
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');


module.exports = function(passport) {
    // Aqui estou configurando a estrátegia local e no campo de usuarios(usernameField) é definido como email e a função recebe 3 parametors sendo 1 dela o (done) uma callback.
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, function(email, senha, done) {
    //Abaixo eu estou procurando um registro no banco de dados que seria o email que o usuario vai ser logado, e tem uma função de callback com parametro usuario
        Usuario.findOne({email: email}).then(function(usuario) {
            // Se não houver o registro email que foi cadastrado vou dar um return pra aplicação e pro done e nos parametros dele vai ter null, false, {message: ""} falando que a conta não existe, a autenticação falha
            // A função callback done é usada para finalização de processo de autenticação
            // o null significa que não a erro e no segundo false significa que a atencação falhou
            if(!usuario) {
                return done(null, false, {message: "Essa conta não existe!"});
            }
            // Aqui estou comparando a senha não é cryptografada com a senha cryptografada do banco de dados
            // senha = Essa é a senha que foi fornecida pelo usuario durante a autenticação
            // usuario.senha = Essa é a senha cryptografada do banco da dados
            // Também adicionei uma callback com 2 parametro erro e batem
            bcrypt.compare(senha, usuario.senha, function(erro, batem) {
                // Se as senhas baterem, forem iguais
                if(batem) {
                    // Vai retorna o done, null(sem erros) e user(Usuario autenticado) que significa que a autenticação foi bem sucessida
                    return done(null, usuario);
                } else {
                    // Se não, vai retornar um erro com a mensagem
                    return done(null, false, {message: "Senha incorreta!"});
                }
            });

        });
    }));

    // Aqui no serializeUser estou definindo oque vai ser armazenado na sessão do usuario após a autenticação der certo, no caso aqui estou armazenando o id do usuario quando a autenticação der certo
    passport.serializeUser(function(usuario, done){ 
        done(null, usuario.id);
    });

    // Aqui estou recuparando os dados do usuario da sessão que foi armazenado no serializeUser pelo id, então estou buscando o id do usuario que foi autenticado com sucesso! Criei uma função assincrona

    // O Uso do async function() significa que estou transformando essa função em uma função assincrona, ela executa operações que levam um tempo para ser concluidas e nela coloquei os parametros id e done

    // O try é onde pode ocorrer erros se ocorrer ele vai enviar pro catch(err) se não der erro vai ser executado e tipo o .then(). Uma função de callback de sucesso

    // o Uso de await significa que está aguardando a conclução ou rejeição do Usuario.findById(id), e será pausado a operação assincronica, se encontrar algum erro o erro será enviado para o catch, se não achar o try será executado.

    // O done é a finalização callback da autenticação, null significa sem erros e vai ser autenticado com sucesso (usuario), no catch o err é o erro que vai dar e o null
    passport.deserializeUser(async function(id, done) {
        try {
            const usuario = await Usuario.findById(id);
            done(null, usuario);
        } catch(err) {
            done(err, null);
        }
    });
}

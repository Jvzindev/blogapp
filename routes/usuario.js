// Importando modulos e arquivos
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');


// Rota metodo get para /registro
router.get('/registro', function(req, res) {
    res.render('usuarios/registro');
});

// Rota metodo post com verificação e criptação de senha
router.post('/registro', function(req, res) {
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"});
    }
    
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido"});
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"});
    }
    // Verificando o tamanho da senha
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"});
    }
    // Se senha1 for diferente que senha2
    if(req.body.senha != req.body.senha2) {
        erros.push({texto: "As senha são diferentes, tente novamente"});
    }

    if(erros.length > 0) {
        res.render("usuarios/registro", {erros: erros});

    } else {
        // Aqui estou pesquisando no banco de dados o email que o cara está tentando se cadastra
        Usuario.findOne({email: req.body.email}).then(function(usuario){
            if(usuario) {
                req.flash('error_msg', 'Já existe uma conta com esse email, no nosso sistema!');
                res.redirect('/usuarios/registro');
            } else {
                // Registrando o usuario e salvando o dado no banco de dados
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                // Criptografando a senha usando hash
                bcrypt.genSalt(10, function(erro, salt) {
                    bcrypt.hash(novoUsuario.senha, salt, function(erro, hash){
                        if(erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuario.');
                            res.redirect('/');
                        } else {
                            novoUsuario.senha = hash;

                            // Salvando usuario
                            novoUsuario.save().then(function() {
                                req.flash('success_msg', 'Usuário criado com sucesso');
                                res.redirect('/');
                            }).catch(function(err) {
                                req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente');
                                res.redirect('/usuarios/registro');
                            });
                        }
                    });
                });

            }
        }).catch(function(err) {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/')
        });

    }
});

router.get('/login', function(req, res) {
    res.render('usuarios/login');
});

// Estou criando uma rota com middleware e do metodo post, nele estou usando o passport.authenticate() que é a autenticação do usuario, no primeiro parameto 'local' é a estrategia que estou usando e no segundo são as configurações! A primeira é quando ser autenticado com sucesso ele será enviado para a '/' , segundo é se não ser autenticado será enviado para o '/usuarios/login' e o ultimo estou ativando o flash
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true,
    })(req, res, next);
});

// Logout
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if(err) {
            req.flash('error_msg', 'Erro ao se deslogar');
            res.redirect('/');
        } else {
            req.flash('success_msg', 'Deslogado com sucesso!');
            res.redirect('/');
            return next();
        }
    })
});


// Exportando router para usar em outros arquivos
module.exports = router;
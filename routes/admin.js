// Importando os modulos
const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
// o Uso de colocar a variavel dentro de um objetivo significa que eu quero usar somente a função toda do eAdmin desse objeto.
const { eAdmin } = require('../helpers/eAdmin');

// Criação das rotas
Router.get('/', eAdmin, function(req, res) {
    res.render("admin/index")
});
Router.get('/posts', eAdmin, function(req, res) {
    res.send("Página de posts");
});
// Para listar os dados no mongoose é utilizado o find()
// Para ordernar os dados do mais antigo pro novo ou visse versa, no mongoose é uasdo sort({date: 'desc'});

// Categoria.find().sort({date: 'desc'}).then(function(categorias) = Se esse código der sucesso a função .then vai ser executada e o parametro também e ela vai mostrar todas as categorias dentro do model.
Router.get('/categorias',eAdmin, function(req, res) {
    Categoria.find().sort({date: 'desc'}).then(function(categorias) {
        res.render('admin/categorias', {categorias: categorias});
    }).catch(function(err) {
        req.flash('error_msg', "Houve um erro ao listar as categorias.");
        res.redirect('/amin');
        console.log(err);
    })
});

// /admin/categorias/add
Router.get('/categorias/add',eAdmin, function(req, res) {
    res.render('admin/addcategorias');
});

Router.post('/categorias/nova',eAdmin, function(req, res) {
    // Pegando os dados da requisição do nome e do slug e armazenando na variavel novaCategoria

    // Validando o formulário de categorias
    // Array para armazenar os erros
    let erros = []

    // Si a requisição do nome for inválida ou o tipo do nome for vazia ou o nome for igual a nulo, vou mandar uma mensagem e adicionar o objeto dentro do array usando erros.push({})
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido!"});
    }

    // Si a requisição do slug for inválida ou o tipo do slug for vazia ou a requisição do slug for nula, vou adicionar um dado novo na array usando erros.push({}) falando que o slug é inválido
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido!"})
    }
    // Si o tamanho da requisição do nome for menor que 2 caracteres irei mandar uma mensagem e adicionar essa mensagem na array usando .push({})
    if(req.body.nome.length < 2) {
        erros.push({texto: "Nome da categoria é muito pequeno."});
    }
    // Si o tamanho da array erros for igual a 0, vou renderizar a view admin/addcategorias , porque o usuario não digitou nada e clicou em criar e chamei o erros usando {erros: erros}
    if(erros.length > 0) {
        res.render('admin/addcategorias', {erros: erros});
    // se não, criei uma variavel para armazenar as requisições do nome e slug e com ela criei um dado no banco de dados usando new Categoria(novaCategoria)
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(function() {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch(function(err) {
            // req.flash é uma sessão que só aparece 1 vez
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");
            res.redirect("/admin");
        });
    }
});
// Categoria.findOne({_id: req.params.id}) = Ele vai procurar um dado do model que possui o id que foi requisitado.
Router.get("/categorias/edit/:id", eAdmin, function(req, res) {
    Categoria.findOne({_id:req.params.id}).then(function(categoria) {
            res.render('admin/editcategorias', {categoria: categoria});
    }).catch(function(err) {
        req.flash("error_msg", "Essa categoria não existe!");
        res.redirect("/admin/categorias");
    });
});

// Validação de formulário usando as condições, puxar os dados para modificar usando o mongoose (findOne) e puxar pelo ID

// Criando rota do metodo post
Router.post("/categorias/edit",eAdmin, function(req, res) {
    // findOne! Aqui estou buscando o dado dentro do model "Categoria" que foi requerido pelo usuario pelos parametros para ser editado! Usei a callback then com o parametro categoria!
    Categoria.findOne({_id: req.body.id}).then(function(categoria) {

        // Validação do formulário
        //Array erro vazia
        let erro = []

        // Si o nome for diferente ou o tipo do nome for vazio ou o nome for nulo ele vai adicionar uma mensagem dentro da array erro usando .push({texto: "Texto"}) e essa mensagem vai aparecer pro usuario
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erro.push({texto: "Nome inválido!"});
        }
        // Si o slug for diferente ou o tipo do slug for vazio ou o slug for nulo ele vai adicionar uma mensagem dentro da array erro usando .push({texto: "Texto"}) e essa mensagem vai aparecer pro usuario
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erro.push({texto: "Slug inválido!"});
        }
        // Si o tamanho do nome for menor que 2 (caracteres) ele vai adicionar uma mensagem dentro da array erro usando .push({texto: "TEXTO"}) e essa mensagem vai ser mostrado para o usuario.
        if(req.body.nome.length < 2) {
            erro.push({texto: "Nome da categoria muito pequeno."});
        }
        // Si o tamanho da array for maior que 0, se tiver alguma mensagem de erro na array vai ativar essa condição
        if(erro.length > 0) {
            // Aqui estou buscando dentro do model o dado que foi requisitado pelo usuario usando o findeOne({}), também coloquei uma função callback de sucesso e dentro da then uma function com o parametro categoria. E Si essa função for verdadeira vai renderizar o admin/categorias pro usuarios
            Categoria.findOne({_id: req.body.id}).then(function(categoria) {
                res.render("admin/categorias", {categoria: categoria});
            // .catch() é um callback de erro, aqui coloquei o req.flash uma sessão que só aparece uma vez, no primeiro parametro que criei no app.js como uma variavel global e no segundo parametro a mensagem que vai aparecer! Depois redirecionei o usuario pro /admin/categorias.
            }).catch(function(err) {
                req.flash("error_msg", "Erro ao pegar os dados!");
                res.redirect("/admin/categorias");
            });
        //  Se não, se toda essa validação acima for falsa se não tiver erro nenhum vai ativar o else
        } else {
            // Aqui estou pegando a requisição do nome que foi editado e armazenando no nome que está no model, então depois da requisição do usuario que foi feita, agora passa ser o nome que foi editado e não o antigo.
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            // Aqui estou salvando os dados novos no meu model usando (categoria.save()) e criei um função de calback then e dentro dela vai ter o req.flash sessão que só aparece uma vez, no primeiro parametro vai a variavel global que criei no app.js e no segundo parametro vai a mensagem que vai aparecer. E o redirect que vai redirecionar o usuario pro /admin/categorias
            categoria.save().then(function() {
                req.flash("success_msg", "Categoria editada com sucesso.");
                res.redirect("/admin/categorias");
            // Aqui também tem uma callback de erro que vai conter o req.flash que é uma sessão unica com a variavel global e a mensagem que vai redirecionar o usuario para /admin/categorias
            }).catch(function(err){
                req.flash("error_msg", "Erro ao salvar a edição da categoria");
                res.redirect("/admin/categorias");
            })
        }

        // Aqui tem uma função de erro também, pois lá no começo da rota tem uma de sucesso e aqui no final tem uma de erro, pois se der algum erro vai redirecionar o usuario e enviar uma mensagem
    }).catch(function(err) {
        res.flash("error_msg", "Erro ao editar a categoria");
        res.redirect("/admin/categorias");
    });
});
// Criei uma rota do metodo post, para eu deletar os dados dentro do model. Para eu deletar eu usei o delete deleteOne e posso usar o deleteMany tbm
Router.post("/categorias/deletar",eAdmin, function(req, res) {
    // Aqui estou deletando os dados, onde? Pelo id da categorias. Depois de deletar mando uma mensagem com req.flash e redireciono ele pra /admin/categorias. No .catch só usei uma mensagem de erro e redirecionei ele pro /admin/categorias.
    Categoria.deleteOne({_id: req.body.id}).then(function(){
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro ao deletar a categoria.");
        res.redirect("/admin/categorias");
    })
});

Router.get("/postagens",eAdmin, function(req, res) {

    Postagem.find().populate("categoria").sort({data: "desc"}).then(function(postagens){
        res.render('admin/postagens', {postagens: postagens});
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro ao listar as postagens!");
        res.redirect("/admin");
    });
});

Router.get("/postagens/add",eAdmin, function(req, res) {
    Categoria.find().then(function(categoria) {
        res.render("admin/addpostagem", {categoria: categoria})
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin");
    })
});

Router.post("/postagens/nova", eAdmin,function(req, res) {
    let erros = [];

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria."});
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros});
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(function() {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch(function(err) {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem.");
            res.redirect("/admin/postagens");
        });
    }
});

Router.get("/postagens/edit/:id", eAdmin, function(req, res) {
    Postagem.findOne({_id: req.params.id}).then(function(postagens) {
        res.render("admin/editpostagens", {postagens: postagens});
    }).catch(function(err) {
        req.flash("error_msg", "Essa postagem não existe!");
        res.redirect("/admin/postagens");
    });
});

Router.post("/postagens/edit",eAdmin, function(req, res) {

    Postagem.findOne({_id: req.body.id}).then(function(postagens) {
        let erros = []

        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
            erros.push({texto: "Titulo inválido!"});
        }
        if(!req.body.descricao || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Descrição inválida!"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Conteúdo inválido!"});
        }
        if(req.body.titulo.length < 4){
            erros.push({texto: "Titulo muito pequeno!"});
        }
        if(erros.length > 0){
            Postagem.findOne({_id: req.body.id}).then(function(postagens) {
                res.render("admin/postagens");
            }).catch(function(err) {
                req.flash("error_msg", "Erro ao pegar os dados");
                res.redirect("/admin/postagens");
            })
        } else {

            postagens.titulo = req.body.titulo,
            postagens.descricao = req.body.descricao,
            postagens.slug = req.body.slug

            postagens.save().then(function() {
                req.flash("success_msg", "Postagem editada com sucesso!");
                res.redirect("/admin/postagens");
            }).catch(function(err) {
                req.flash("error_msg", "Erro ao salvar a edição da categoria");
                res.redirect("/admin/postagens")
            });

        }
    }).catch(function(err) {
        req.flash("error_msg", "Erro ao editar a postagem");
        res.redirect("/admin/postagens");
    });
});

Router.post("/postagens/deletar", eAdmin, function(req, res) {
    Postagem.deleteOne({_id: req.body.id}).then(function(){
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro ao deletar a postagem");
        res.redirect("/admin/postagens");
    });
});


// exportando o Router sempre!
module.exports = Router;
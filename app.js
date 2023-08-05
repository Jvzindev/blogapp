// Importando os módulos
const express = require('express');
const hdlr = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const db = require('./config/db');
// Importando a Postagem
require('./models/Postagem');
// Criando uma Variavel e armazenando o model postagens do banco de dados
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const passport = require('passport');
require('./config/auth')(passport);

// Configuração do session / app.use() serve para configuração e criação de middleware.
app.use(session({
    secret: "nodejs", // É a chave de acesso a minha sessão
    resave: true,
    saveUninitialized: true
}));

// Passport
// passport.initialize() = Ele inicializa o passport e configura ele para trabalhar com a autenticação.
// passport.session() = Ele configura o passport para usar as sessões de autenticação persistentes
app.use(passport.initialize());
app.use(passport.session());

// Configuração do flash (Tem que ficar debaixo da session)
app.use(flash());

// Middleware Config
// Variaveis globais = São variaveis que eu consigo acessar em qualquer parte da minha API.
// O objeto locals serve para criar as variaveis globais

app.use(function(req, res, next){
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null; // Essa variavel vai armazenar os dados do usuario autenticado, o req.user é uma coisa que o passport cria automaticamente que armazena dados do usuario autenticado, o null caso não exista usuario logado vai ser passo o valor nulo.
    next();
});

// Configurações do handlebars
app.engine('handlebars', hdlr.engine({defaultLayout: 'main', runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
}}));
app.set('view engine', 'handlebars');


// Middleware create! - Toda vez que faço uma requisição o middleware é chamado
/*app.use(function(req, res, next) {
    console.log("OLA, EU SOU O MIDDLEWARE");
    next(); // Usando o Next(); ele vai mandar passar a requisição (proximo);
}); */

// Configurações do bodyParser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Configurações do mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI).then(function(){
    console.log("Conectado com sucesso!");
}).catch(function(err) {
    console.log("Erro ao se conectar ao mongoDB: " + err);
});

// Public 
// Nessa linha, estou falando pro express a pasta que está guardando todos os arquivos estáticos é a pasta public. 
app.use(express.static(path.join(__dirname, "public")));

// Estou importando as rotas
app.use('/admin', admin);
app.use('/usuarios', usuarios);

// Rota principal da API
app.get('/', function(req, res){
    Postagem.find().populate('categoria').sort({date: 'desc'}).then(function(postagens) {
        res.render('index', {postagens: postagens});
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro interno!");
        res.redirect("/404");
    });
});
app.get('/postagem/:slug', function(req, res) {
    Postagem.findOne({slug: req.params.slug}).then(function(postagem) {
        if(postagem){
            res.render('postagem/index', {postagem: postagem});
        } else {
            req.flash("error_msg", "Está postagem não existe!");
            res.redirect("/")
        }
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro interno!");
        res.redirect('/')
    });
});

app.get('/404', function(req, res) {
    res.send('ERROR 404!');
});

app.get('/categorias', function(req, res) {
    Categoria.find().then(function(categorias){
        res.render('categorias/index', {categorias: categorias});
    }).catch(function(err) {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect('/');
    });
});

app.get('/categorias/:slug', function(req, res) {
    Categoria.findOne({slug: req.params.slug}).then(function(categoria){
        if(categoria){
            
            Postagem.find({categoria: categoria._id}).then(function(postagens) {
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
            
            }).catch(function(err) {
                req.flash("error_msg", "Houve um erro ao listar os posts.");
                res.redirect('/');
            })

        } else {
            req.flash("error_msg", "Esta categoria não existe!");
            res.redirect('/');
        }


    }).catch(function(err){
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria.");
        res.redirect('/');
    })
});

// Criando servidor
const port = process.env.PORT || 9797;
app.listen(port, function() {
    console.log("Conectado com sucesso!");
});

// process.env.PORT = O heroku vai definir a variavel de ambiente.
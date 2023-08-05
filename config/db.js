// o process.env.NODE_ENV significa que ele vai está rodando em ambiente de produção no caso no Heroku
if(process.env.NODE_ENV == "production"){
    module.export = {mongoURI: "mongodb+srv://jvdevzin:CxYcrdsNaxg72j6n@blogapp-project.rdp42vr.mongodb.net"}
// E aqui embaixo significa que ele vai rodar na minha maquina usando meu banco de dados.      
} else {
    module.exports = {mongoURI: "mongodb://127.0.0.1:27017/blogapp"}
}
// Verificar se o usuario tá autenticado e se ele é admin
module.exports = {
    eAdmin: function(req, res, next) {
        // Si o usuario está autenticado e se o usuario possui admin definido como eAdmin 1
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }
        req.flash("error_msg", "Você precisa ser um admin!");
        res.redirect('/');
    }
}
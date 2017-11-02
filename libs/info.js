module.exports.showInfo = showInfo;

function showInfo(req, res) {
    res.render('info', {
        title: 'Information',
        login: req.session.login,
        is_login: true
    });
}
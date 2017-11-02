const auth = require('../auth.json');

const fs = require('fs');

module.exports.register = register;
module.exports.login = login;

function register(req, res) {
    var url = 'mongodb://localhost/xattestdb';

    MongoClient.connect(url, function (err, db) {
        if (err) {
            res.send('Problems with connect to DataBase: ', err);
            console.log('Problems with connect to DataBase: ', err);
        }
        
        var collection = db.collection('users_chanels');
                              
        var login = req.body.login;
        var password = req.body.password;
        
        collection.insert({ 'login': login, 'password': password });
        
        console.log('New user added');
        
        req.session.login = login;
        req.session.is_login = true;
        
        db.close();
        
        res.redirect('/');
    });
}

/*function login(req, res) {
    var url = 'mongodb://localhost/xattestdb';

    MongoClient.connect(url, function (err, db) {
        if (err) {
            send('Problems with connect to DataBase: ', err);
            console.log('Problems with connect to DataBase: ', err);
        }
        
        var collection = db.collection('users_chanels');

        var login = req.body.login;
        var password = req.body.password;

        collection.find({ login: login, password: password }).toArray(function (err, result) {
            if (err) {
                res.send('Problems with search in DataBase: ', err);
                console.log('Problems with search in DataBase: ', err);
            }

            if (result.length != 0) {
                console.log('Such user exists in DB');
                console.log(result);

                req.session.login = result[0].login;
                req.session.is_login = true;

                res.redirect('/');
                
                db.close();
            } else {
                res.send('no such user in db');
                console.log('no such user in db');
            }
        });
    });
}*/

function login(req, res) {
    var login = req.body.login;
    var password = req.body.password;
    console.log(`Login: ${login}, password: ${password}`)

    console.log(login == auth.Login);

    if (login == auth.Login && password == auth.Password) {
        console.log('Such user exists in DB');

        req.session.login = login;
        req.session.is_login = true;

        res.redirect('/');
    } else {
        res.send('no such user in db');
        console.log('no such user in db');
    }
}
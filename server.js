/* global io, __dirname */

var http = require('http'),
        config = require('./server/config'),
        express = require('express'),
        bodyParser = require('body-parser'),
        methodOverride = require('method-override'),
        path = require('path'),
        knex = require('knex')(config.knex_options),
        bookshelf = require('bookshelf')(knex),
        models = require('./server/models')(bookshelf),
        notifier = require('./server/notifier'),
        restful = require('./server/bookshelf_rest'),
        auth = require('./server/auth')(models),
        force = require('./server/force'),
        roomdata = require('./server/roomdata')
        ;

/********************* APP SETUP *****************************/

app = express();
server = http.createServer(app);
io = require('socket.io')(server);

app.set('bookshelf', bookshelf);

logger = {
    debug: config.debug,
    warn: config.warn,
    error: config.error
};


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(path.join(__dirname, 'client/')));
app.use(express.static(path.join(__dirname, 'server/pages')));

// Logging
app.use(function (req, res, next) {
    logger.debug(req.method, req.url);
    next();
});

app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send(err.message);
});


/********************* ROUTES *****************************/

app.use('/register', auth.register);
app.use('/login', auth.login);
app.use('/edit/profile', auth.editProfile);
app.use('/change/password', auth.changePassword);

app.all('/resource/*', auth.authenticate);

app.get('/resource/leaders', models.leaders);

/********************* NOTIFICATIONS *****************************/

auth.on_register(function (user) {
    force.create_lead(user.get('name'), user.get('email'));
});


/********************* SERVER STARTT *****************************/


app.set('port', process.env.PORT || 5000);
app.use('/resource', restful(models.User, 'users'));
app.use('/resource', restful(models.Question, 'questions'));
app.use('/resource', restful(models.Answer, 'answers', {
    pre_save: save_answer
}));

function save_answer(req, res) {
    var answer = req.body;
    answer = {
        question_id: req.body.question_id,
        answer_index: req.body.answer_index
    };
    new models.Question({
        id: answer.question_id
    }).fetch().then(function (q) {
        if (q.attributes.answer_index == answer.answer_index) {
            models.Answer.query({
                select: '*'
            }).where({
                question_id: answer.question_id
            })
                    .fetchAll().then(function () {
                res.send('OK');
            });
        } else {
            res.status(500).json(q);
            console.log("ERROR! test! ", answer);
        }
    });
}

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    socket.on('selectMode', function (mode) {
        roomdata.set(socket, "mode", mode);
    });
    socket.on('hostCreateNewGame', function (player) {
        var thisGameId = (Math.random() * 100000) | 0;
        // Return the Room ID (gameId)
        this.emit('newGameCreated', {gameId: thisGameId});
        // Join the Room and wait for the players
        roomdata.joinRoom(socket, thisGameId);
        var playersInRoom = [];
        playersInRoom.push(player.name);
        roomdata.set(socket, "playersInRoom", playersInRoom);
        var cpt = 0;
        roomdata.set(socket, "cpt", cpt);
    });
    socket.on('incrCptQuestions', function (myGameId) {
        console.log('dans incrCptQuestions');
        console.log('roomdata.get(socket, "cpt")='+roomdata.get(socket, "cpt"));
        var myCpt = roomdata.get(socket, "cpt")+1;
        roomdata.set(socket, 'cpt', myCpt);
        console.log('myCpt='+myCpt);
        io.sockets.in(myGameId).emit('incrCpt', myCpt);
    });

    socket.on('join', function (data) {
        var room = io.sockets.adapter.rooms[data.gameId];
        // If the room exists...
        if (room !== undefined) {
            // attach the socket id to the data object.
            roomdata.joinRoom(socket, data.gameId);
            var playersInRoom = roomdata.get(socket, "playersInRoom");
            playersInRoom.push(data.player.name);
            roomdata.set(socket, "playersInRoom", playersInRoom);
            console.log(data.player.name + ' joined the room ' + data.gameId);
            console.log('playersInRoom:' + playersInRoom);
            this.emit('success', {mode: roomdata.get(socket, "mode"), userIndex: playersInRoom.length});
            io.sockets.in(data.gameId).emit('roomMsg', data.player.name + ' joined the room.');
        } else {
            // Otherwise, send an error message back to the player.
            console.log("This room does not exist.");
            this.emit('errorMsg', "This room does not exist.");
        }
    });
    socket.on('leave', function (data) {
        var room = io.sockets.adapter.rooms[data.gameId];
        console.log(data.player + ' left the room ' + data.gameId);
        io.sockets.in(data.gameId).emit('roomMsg', data.player + ' left the room.');
        var playersInRoom = roomdata.get(socket, "playersInRoom");
        var index = playersInRoom.indexOf(data.player);
        if (index > -1) {
            playersInRoom.splice(index, 1);
        }
        roomdata.leaveRoom(socket);
        roomdata.set(socket, "playersInRoom", playersInRoom);
        io.sockets.in(data.gameId).emit('leave', playersInRoom);
        console.log('number of players:', room.length);
    });
    socket.on('newQuestion', function (gameId) {
        var min = 2;
        var max = 21;
        question_id = Math.floor(Math.random() * (max - min + 1) + min); // TOFIX
        new models.Question({
            id: question_id
        })
                .fetch()
                .then(function (question) {
                    io.sockets.in(gameId).emit('questions', JSON.stringify(question));
                });
    });
    socket.on('incrementPoints', function () {
        var playersInRoom = roomdata.get(socket, "playersInRoom");
        console.log(playersInRoom);
        bookshelf.knex('users').whereIn('name', playersInRoom).update({
            points: knex.raw('points + 5')
        }).then(function (result) {
            console.log("increment points for :" + result + " player(s)");
        });
    });
    socket.on('hasAnswered', function (gameId) {
        io.sockets.in(gameId).emit('questionAnswered', true);
    });
});
 
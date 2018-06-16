var express=require('express');
var app = express();
var server= require('http').createServer(app);
var io = require('socket.io').listen(server);
const Pusher = require('pusher');
users=[];
connections=[];

server.listen(process.env.PORT||3000);
console.log('server running...');

//pusher code
const chatChannel = 'anonymous_chat';
const userIsTypingEvent = 'user_typing';
//Initialize Pusher
var pusher = new Pusher({
    appId: '536468',
    key: '7a6b33481def879fce8e',
    secret: 'adcae99786de9e127cd1',
    cluster: 'ap2',
    encrypted: true
  });

//app.get('/', function(req, res) {
    //res.render('index', {
      //pass pusher key to index.ejs for pusher client
     // pusherKey: pusherConfig.key
    //});
  //});
app.get('/',function(req,res){    
    res.sendFile(__dirname+'/index.html');
});


app.use(express.json()); 
app.use(express.urlencoded());

app.post('/userTyping', function(req, res) {
    const username = req.body.username;
    //const username = "lavda";
    pusher.trigger(chatChannel, userIsTypingEvent, {username: username});
    res.status(200).send();
  });







io.sockets.on('connection',function(socket){
    connections.push(socket);
    console.log('Connected: sockets connected',connections.length);

    //disconnect
    socket.on('disconnect',function(data){
        users.splice(users.indexOf(socket.username),1);
        

        connections.splice(connections.indexOf(socket),1);
        updateUserNames(users);
        console.log('disconnect %s socket connected',connections.length);

    });

    //Send Message
    socket.on('send message',function(data){
        io.sockets.emit('new message',{msg:data,user:socket.username});
    });

    //new user
    socket.on('new user',function(data,callback){
        callback(true);
        socket.username=data;
        users.push(socket.username);
        //console.log(users);
        updateUserNames(users);
    });

    function updateUserNames(users){
        io.sockets.emit('get users',connections.length,users);
        //console.log(users);
    }
});

    
var Fs = require('fs'),
	Ws = require('ws');

function OnError()
{
	console.log('Error.');
}

function OnClose()
{
	console.log('Client left.');
}

function OnMessage(msg)
{
	if (msg === 'get_files_list')
	{
		this.send(JSON.stringify({type : 'files_list', files : Fs.readdirSync('../data/')}));
		console.log('Files list content are sent.');
	}
	else
	{
		this.send(JSON.stringify({type : 'file', content : Fs.readFileSync('../data/' + msg).toString()}));
		console.log('File content are sent.');
	}
}

function main()
{
	var WebSocketServerPort 	= 1024,
		webSocketServer			= Ws.Server,
		server 					= new webSocketServer({port : WebSocketServerPort});

	server.on('connection', function(ws)
	{
		ws.on('message', OnMessage);
		ws.on('close', OnClose);

		console.log('Client connected.');
	});

	console.log('Server is started.');
}

main();

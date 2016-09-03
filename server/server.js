import {PeerServer} from 'peer'

let io = require('socket.io')();

let ids = new Map()
let peerServer = PeerServer({port: 9000, path: '/fermi'})

peerServer.on('connection', id => {
	
	// let civ = new Civilization()
	// civ.star = assignStar(geo, ids)
	// ids.set(id, civ)

	console.log(`client connected with id: ${id}`)
});

io.on('connection', socket =>{
	console.log('a socket.io client connected')

});

io.listen(3000);

function assignStar(geo, ids) {
	let assignedStars = ids.values().map(civ => civ.star)
}
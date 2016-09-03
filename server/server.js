import {PeerServer} from 'peer'

let server = PeerServer({port: 9000, path: '/fermi'})
server.on('connection', id => {
	console.log(`client connected with id: ${id}`)
});
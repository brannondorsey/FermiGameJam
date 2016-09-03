let peer = new Peer({
	host: 'localhost',
	port: 9000,
	path: '/fermi'
});

peer.on('open', id => {
  console.log('My peer ID is: ' + id);
});

let socket = io('localhost:3000');

if ("geolocation" in navigator) {
	
}

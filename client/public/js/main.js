let peer = new Peer({
	host: 'localhost',
	port: 9000,
	path: '/fermi'
});

peer.on('open', id => {
  console.log('My peer ID is: ' + id)
});

let socket = io('localhost:3000')

getPosition()
	.then((pos) => {
		let coords = {
			lat: pos.coords.latitude,
			lon: pos.coords.longitude
		}
		socket.emit('geolocation', coords)
	})
	.catch(onGeoFailed)

function getPosition() {
	return new Promise(function(res, rej){

		if ('geolocation' in navigator) {
			let pos = navigator.geolocation.getCurrentPosition(success, fail)
			
			function success(pos) {
				res(pos)
			}

			function fail() {
				rej('Error getting current geolocation position')
			}

		} else rej('Your browser doesn\'t support geolocation')
	})
}

function onGeoFailed(err) {
	socket.emit('geolocation', null)
}

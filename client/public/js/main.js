let cLogMan = new CivLogManager()
let p2p = new P2P()
p2p.on('ice_connected', () => console.log('connected to ICE server'))
p2p.on('civ_connected', () => console.log('civilization connected'))
p2p.on('civ_disconnected', (id) => console.log(`civilization ${id} connected`))
p2p.on('civ_message', (mess) => {
	console.log(`civilization message received:\n\t${mess}`)
})
p2p.on('civ_log_received', (civLog) => {
	console.log(`civilization log received:`)
	console.log(civLog)
})

function test(id) {
	p2p.discover(id)
		.then(() => {
			console.log('discovered!')
			p2p.sendCivLog(id, demapify(cLogMan.log))
		})
		.then(() => p2p.sendMessage(id, 'Hello, World!'))
		.catch(err => { throw err })
}

let socket = io('localhost:3000')

getGeolocation()
	.then((pos) => {
		let coords = {
			lat: pos.coords.latitude,
			lon: pos.coords.longitude
		}
		socket.emit('geolocation', coords)
	})
	.catch(onGeoFailed)


function getGeolocation() {
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

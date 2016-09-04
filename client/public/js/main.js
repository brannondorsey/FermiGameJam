let socket = io('localhost:3000')

let civLog = null
let p2p = new P2P()

p2p.on('ice_connected', (id) => {
	console.log(`ice connected: ${id}`)
	let starName = Math.random().toString()
	civLog = new CivLogManager(id, starName)
})

p2p.on('civ_connected', (id) => {
	p2p.sendCivLog(id, demapify(civLog.log))
})

p2p.on('civ_disconnected', (id) => console.log(`civilization ${id} connected`))

p2p.on('civ_message', (id, mess) => {
	console.log(`civilization message received:\n\t${mess}`)
})

p2p.on('civ_log_received', (id, log) => {
	console.log(`civilization log received:`)
	civLog.merge(id, log)
})

getGeolocation()
	.then((pos) => {
		let coords = {
			lat: pos.coords.latitude,
			lon: pos.coords.longitude
		}
		socket.emit('geolocation', coords)
	})
	.catch(onGeoFailed)


function test(id) {
	p2p.connect(id)
		.then(() => p2p.sendMessage(id, 'Hello, World!'))
		.catch(err => { throw err })
}

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

let socket = io('localhost:3000')

let civLog = null
let p2p = new P2P()

p2p.on('ice_connected', (id) => {
	console.log(`[ice_connected]: ${id}`)
	let starName = Math.random().toString()
	civLog = new CivLogManager(id, starName)

	getGeolocation()
	.then((pos) => {
		let coords = {
			lat: pos.coords.latitude,
			lon: pos.coords.longitude
		}
		socket.emit('geolocation', { id, geo: coords })
	})
	.catch((err) => onGeoFailed(id, err))
})

p2p.on('civ_connected', (id) => {
	console.log(`[civ_connected]: ${id}`)
	p2p.sendIGM(id, civLog.createIGM(id, 'contact', null))
	p2p.sendLog(id, civLog.log)
})

p2p.on('civ_log_received', (id, log) => {
	console.log(`[civ_log_received]: ${log}`)
	civLog.merge(id, log)
})

p2p.on('civ_disconnected', (id) => console.log(`civilization ${id} connected`))

// IGM SENT AND RECEIVED
p2p.on('igm', (id, igm) => {
	console.log('[igm]: Adding igm to civ log')
	// debugger
	civLog.addIGM(igm)
})

p2p.on('igm_sent', (id, igm) => {
	console.log('[igm_sent]: Adding igm to civ log')
	// debugger
	civLog.addIGM(igm)
})

// SPECIFIC IGM RECEIVED EVENTS
p2p.on('igm_chat', (id, igm) => {
	console.log(`[igm_chat]:\n\t${igm}`)
})

p2p.on('igm_contact', (id, igm) => {
	console.log(`[igm_contact]: `)
	console.log(igm)
})

p2p.on('igm_ping', (id, igm) => {
	console.log(`[igm_ping]`)
	p2p.sendIGM(id, civLog.createIGM(id, 'ack', null))
})

p2p.on('igm_ack', (id, igm) => {
	console.log(`[igm_ack]`)
})

function test(id, ping) {
	p2p.connect(id)
		.then((id) => {
			p2p.sendIGM(id, civLog.createIGM(id, 'chat', 'Hello, World!'))
			if (ping) {
				setInterval(() => {
					p2p.sendIGM(id, civLog.createIGM(id, 'ping', null))
				}, 1000)
			}
		})
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

function onGeoFailed(id, err) {
	socket.emit('geolocation', { id, geo: null })
}

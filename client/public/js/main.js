let socket = io('localhost:3000')
socket.on('star_assignment', starId => {
	console.log('[star_assignment]')
	civLog.begin(starId)
})

socket.on('star_introduction', ({peerId, starId}) => {
	console.log(`introduced to ${peerId} (${starId})`)
	civLog.updateIdMaps(peerId, starId)
	p2p.connect(peerId)
                // we might not want to have this happen automatically
                // rather, let the use ping manually?
		.then((id) => {
                        p2p.sendIGM(id, civLog.createIGM(id, 'ping', null))
		})
		.catch(err => { throw err })
})

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
})

p2p.on('civ_log_received', (id, log) => {
	console.log(`[civ_log_received]: ${log.length}`)
	civLog.merge(id, log)
})

p2p.on('civ_disconnected', (id) =>
    {
        if (civLog.peerId2StarId.has(id)) {
            starId = civLog.peerId2StarId.get(id)
            civLog.addIGM(
                civLog.createIGM(civLog.self.peerId, 'death', starId)
            )
        }

        console.log(`civilization ${id} disconnected`)
    }
)

// IGM SENT AND RECEIVED
p2p.on('igm_received', (id, igm) => {
	console.log('[igm_received]: Adding igm to civ log')
        console.log(igm)
	// debugger
	civLog.addIGM(igm)
})

p2p.on('igm_sent', (id, igm) => {
	console.log('[igm_sent]: Adding igm to civ log')
        console.log(igm)
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

        if (!civLog.peerId2StarId.has(id)) {
           civLog.updateIdMaps(id, igm.from.starId)
           p2p.sendIGM(id, civLog.createIGM(id, 'contact', null))
        }

	p2p.sendIGM(id, civLog.createIGM(id, 'ack', null))
        p2p.sendLog(id, civLog.log)
})

p2p.on('igm_ack', (id, igm) => {
        p2p.sendLog(id, civLog.log)
	console.log(`[igm_ack]`)
})

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

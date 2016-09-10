class P2P extends EventEmitter {
			
	constructor() {
		super()
		this.id = null
		this._conns = new Map()
		this._events = [
			'ice_connected',
			'civ_connected',
			'civ_disconnected',
			'civ_log_received',
			'igm_received',
			'igm_contact',
			'igm_chat',
			'igm_ping',
			'igm_ack',
			'igm_sent'
		]

		this._peer = new Peer({
			host: window.location.hostname,
			port: 9000,
			path: '/fermi'
		});

		
		this._peer.on('open', id => {
		  this.id = id
		  this.emitEvent('ice_connected', [id])
		});

		this._peer.on('connection', conn => this._registerPeerEvents(conn))
	}

	on(event, cb) {
		if (this._events.indexOf(event) > -1)
			this.addListener(event, cb)
		else 
			throw Error(`${event} is not a supported event name`)
	}

	connect(id) {
		return new Promise((resolve, reject) => {
			let conn = this._peer.connect(id)
			this._registerPeerEvents(conn, resolve, reject, true)
		})
	}

	isConnected(id) {
		return this._conns.has(id) && this._conns.get(id).open
	}

	sendLog(id, log) {
		let conn = this._conns.get(id)
		conn.send(log)
	}

	sendIGM(id, igm) {
		if (!this._conns.has(id)) 
			throw Error(`${id} does not have a valid connection`)
		let conn = this._conns.get(id)
		conn.send(igm)
		this.emitEvent('igm_sent', [id, igm])
	}

	_registerPeerEvents(conn, resolve, reject) {

		conn.on('open', () => {
			console.log('opened')
			let id = conn.peer;
			this._conns.set(id, conn)
			
			conn.on('data', data => {
				// if array, this is a civLog
				if (data instanceof Array) {
					this.emitEvent('civ_log_received', [id, data])
				} else { // otherwise it is an igm
					this._handlePeerMessage(id, data)
				}
			})

			// not supported by FF
			conn.on('close', () => {
				this._conns.delete(id)
				this.emitEvent('civ_disconnected', [id])
			})

			this.emitEvent('civ_connected', [id])
			if (resolve) resolve(id)
		})

		conn.on('error', (err) => { 
			console.log('error')
			if (reject) reject(err)
		})

		setTimeout(reject, 1000)
	}

	_handlePeerMessage(id, igm) {
		
		this.emitEvent('igm_received', [id, igm])

		switch (igm.type) {
			case 'contact':
				this.emitEvent('igm_contact', [id, igm])
				break
			case 'chat':
				this.emitEvent('igm_chat', [id, igm])
				break
			case 'ping':
				this.emitEvent('igm_ping', [id, igm])
				break 
			case 'ack':
				this.emitEvent('igm_ack', [id, igm])
				break 

		} 
			
	}
}
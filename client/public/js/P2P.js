class P2P extends EventEmitter {
			
	constructor() {
		super()
		this.id = null
		this._conns = new Map()
		this._events = [
			'ice_connected',
			'civ_assigned',
			'civ_connected',
			'civ_disconnected',
			'civ_log_received',
			'civ_message'
		]

		this._peer = new Peer({
			host: 'localhost',
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

	sendMessage(id, text) {
		this._send(id, { type: 'message', data: text })
	}

	sendCivLog(id, civLog) {
		this._send(id, { type: 'civLog', data: civLog })
	}

	_send(id, messObj) {
		if (!this._conns.has(id)) 
			throw Error(`${id} does not have a valid connection`)
		let conn = this._conns.get(id)
		conn.send(messObj)
	}

	_registerPeerEvents(conn, resolve, reject) {

		conn.on('open', () => {

			let id = conn.peer;
			this._conns.set(id, conn)
			
			conn.on('data', data => {
				this._handlePeerMessage(id, data)
			})

			// not supported by FF
			conn.on('close', () => {
				this._conns.delete(id)
				this.emitEvent('civ_disconnected', [id])
			})

			this.emitEvent('civ_connected', [id])
			if (resolve) resolve()
		})

		conn.on('error', (err) => { 
			if (reject) reject(err)
		})
	}

	_handlePeerMessage(id, mess) {
		
		switch (mess.type) {
			case 'civLog':
				this.emitEvent('civ_log_received', [id, mess.data])
				break
			case 'message':
				this.emitEvent('civ_message', [id, mess.data])
				break
		} 
			
	}
}
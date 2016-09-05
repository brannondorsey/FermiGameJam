class CivLogManager {

	constructor(peerId, starName) {

		this.log = []
                // id maps
		this.peerId2StarId = new Map()
		this.starId2PeerId = new Map()

		this._igm = {
			to: {
				peerId: null,
				starId: null
			},
			from: {
				peerId: null,
				starId: null
			},
			timestamp: null,
			type: null,
			data: null
		}

		this.igmTypes = [
			'chat',
			'ping',
			'ack',
			'contact',
			'death'
		]

		this.self = {
			peerId,
			starId: null
		}

	}

        // adds an igm to the log
	addIGM(igm, checkUnique) {
		if (checkUnique) {
			for (let i = 0; i < this.log.length; i++) {
				if (_.isEqual(this.log[i], igm)) return false
			}
		}
		this.log.push(igm)
		return true
	}

        // constructs an igm
	createIGM(toPeerId, type, data) {
		if (this.igmTypes.indexOf(type) == -1) throw Error(`${type} is not a valid IGM type`)

		let igm = JSON.parse(JSON.stringify(this._igm))
		igm.to.peerId = toPeerId
		igm.to.starId = this.peerId2StarId.get(toPeerId)
		igm.from = this.self
		igm.timestamp = Date.now()
		igm.type = type
		igm.data = data
		return igm
	}

        // inserts yourself into the id maps
	begin(starId) {
		this.self.starId = starId
		this.peerId2StarId.set(this.self.peerId, this.self.starId)
		this.starId2PeerId.set(this.self.starId, this.self.peerId)
	}

        // merges an incoming log with yours
	merge(senderId, log) {
		log.forEach(igm => {
			this.addIGM(igm, true)
			this._updateIdMapsFromIGM(igm)
		})
	}

        // updates the id maps with a new peer-star pair
	updateIdMaps(id, starId) {
		this.peerId2StarId.set(id, starId)
		this.starId2PeerId.set(starId, id)
	}


        // conditionally updates id maps using the `to` and `from` objects in
        // an igm
	_updateIdMapsFromIGM(igm) {
		if (this.self.starId == null ||
			igm.to.starId == null ||
			igm.from.starId == null) throw Error('Some starId is null')

		if (!this.peerId2StarId.has(igm.to.peerId)) {
			this.peerId2StarId.set(igm.to.peerId, igm.to.starId)
		}
		if (!this.starId2PeerId.has(igm.to.starId)) {
			this.starId2PeerId.set(igm.to.starId, igm.to.peerId)
		}

		if (!this.peerId2StarId.has(igm.from.peerId)) {
			this.peerId2StarId.set(igm.from.peerId, igm.from.starId)
		}
		if (!this.starId2PeerId.has(igm.from.starId)) {
			this.starId2PeerId.set(igm.from.starId, igm.from.peerId)
		}
	}
}


class CivLogManager {

	constructor(peerId, starName) {
		
		this.log = []
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
			starId: this._peerId2StarId(peerId)
		}
		
	}

	addIGM(igm, checkUnique) {
		if (checkUnique) {
			for (let i = 0; i < this.log.length; i++) {
				if (_.isEqual(this.log[i], igm)) return false
			}
		}
		this.log.push(igm)
		return true
	}

	merge(senderId, log) {
		log.forEach(igm => this.addIGM(igm, true))
	}

	getChats() {

	}

	createIGM(toPeerId, type, data) {

		if (this.igmTypes.indexOf(type) == -1) throw Error(`${type} is not a valid IGM type`)

		let igm = JSON.parse(JSON.stringify(this._igm))
		igm.to.peerId = toPeerId
		igm.to.starId = this._peerId2StarId(toPeerId)
		igm.from = this.self
		igm.timestamp = Date.now()
		igm.type = type
		igm.data = data 
		return igm
	}

	_updateEntry(senderId, name, their) {
		
	}

	_addEntry(senderId, name, entry) {
		
	}

	_mergeMessage(name, their) {

	}

	_peerId2StarId(peerId) {
		return null // NOTE: COME BACK AND REPLACE WITH LOOKUP
	}
}

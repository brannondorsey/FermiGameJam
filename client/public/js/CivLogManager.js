class CivLogManager {

	constructor(starName, peerId) {
		
		this.log = new Map()
		this.self = starName

		let e = new CivLogEntry()
		this.log.set(this.self, e)
	}

	merge(civLog) {

	}

	getMessages(star) {

	}
}

class CivLogEntry {
	constructor() {
		this.peerId = null
		this.isDead = false
		this.seenPersonally = false
		this.whoToldYou = null
		this.whoYouTold = []
		this.lastSeen = null
		this.messages = []
	}
}

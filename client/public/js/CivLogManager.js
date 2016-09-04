class CivLogManager {

	constructor(peerId, starName) {
		
		this.log = new Map()

		let e = {
			peerId: peerId,
			name: starName,
			isDead: false,
			seenPersonally: true,
			whoToldYou: peerId, // u told u about u
			whoYouTold: [],
			lastSeen: Date.now(),
			messages: []
		}

		this.self = e
		this.log.set(starName, e)
	}

	merge(senderId, civLog) {
		let log = mapify(civLog)
		for (let [key, value] of log) {
			// star seen before, update
			if (this.log.has(key)) {
				_updateEntry(senderId, key, value)
			} else {
				// if this is the first time seeing the star
				_addEntry(senderId, key, value)
			}
		}


	}

	getMessages(star) {

	}

	_updateEntry(senderId, name, their) {
		// "their" is an entry
		let my = this.log.get(name) 
		// if this is the entry of the sender
		if (their.peerId === senderId) {
			my.lastSeen = Date.now()
			my.seenPersonally = true
			my.isDead = false
		} else {
			if (!my.isDead && their.isDead) my.isDead = true
		}
		_mergeMessages(name, their)
	}

	_addEntry(senderId, name, entry) {
		

		// if this is the entry of the sender
		if (their.peerId === senderId) {
			
		}
	}

	_mergeMessage(name, their) {
		// "their" is an entry
		let my = this.log.get(name)
		for (let receiver in their.messages) {
			// if no messages are known to exist to this
			// receiver, add them all
			let myReceiver = my.messages[receiver.name]
			if (!myReceiver)
				my.messages[receiver.name] = receiver
			else { // update
				let newMessages = receiver.filter(t => {
					for (let i = 0; i < myReceiver.length; i++) {
						if (myReceiver[i].timestamp == t.timestamp &&
							myReceiver[i].sent == t.sent) 
							return true
					}
					return false
				})
				myReceiver = myReceiver.concat(newMessages)
			}
		}
	}
}

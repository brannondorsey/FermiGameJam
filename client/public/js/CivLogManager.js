class CivLogManager {

	constructor(peerId, starName) {

		this.log = []
                // id maps
		this.peerId2StarId = new Map()
		this.starId2PeerId = new Map()

                this.starId2StarName = new Map()
                this.starName2StarId = new Map()

                this.nameGenerator = new NameGenerator()

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
			starId: null,
			starName: null
		}

	}

        // generates and assignes a new star name
        newStarName (starId) {
            let new_name = this.nameGenerator.name()
            console.log(new_name)
            this.addStarName(starId, new_name)
            return new_name
        }

        // adds a new star name to the maps
        addStarName (starId, starName) {
            this.starId2StarName.set(starId, starName)
            this.starName2StarId.set(starName, starId)
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
        this.self.starName = this.newStarName(starId)
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
                this.newStarName(starId)
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
                        this.newStarName(igm.to.starId)
			this.starId2PeerId.set(igm.to.starId, igm.to.peerId)
		}

		if (!this.peerId2StarId.has(igm.from.peerId)) {
			this.peerId2StarId.set(igm.from.peerId, igm.from.starId)
		}
		if (!this.starId2PeerId.has(igm.from.starId)) {
                        this.newStarName(igm.from.starId)
			this.starId2PeerId.set(igm.from.starId, igm.from.peerId)
		}
	}

        definitelyGetStarId(peerId, starId) {
            if (starId == null) {
                starId = this.peerId2StarId.get(peerId)
            }

            return starId
        }

        peerIdFromStarName(starName) {
            Creturn this.starId2PeerId.get(this.starName2StarId.get(starName))
        }

        // CIV LOG FILTER FUNCTIONS - FOR MESSAGE READTHROUGH, VISUALIZATION

        // constructs a chronological list of chats between participants
        getChats (starNameA, starNameB) {
            let peerIdA = this.peerIdFromStarName(starNameA)
            let peerIdB = this.peerIdFromStarName(starNameB)
            return clf(this.log).type('chat').involving(peerIdA, peerIdB).chronological().log
        }

        // constructs a list of star ids that the input star / peer id have
        // direct connecitons with
        firstDegreeConnections (peerId, starId) {
            if (peerId == null) {
                peerId = this.starId2PeerId.get(starId)
            }

            if (starId == null) {
                starId = this.peerId2StarId.get(peerId)
            }

            return clf(this.log).to_or_from(peerId).all_star_ids(starId)
        }

        // constructs a list of lists, one for each `n`:
        //      each list contains tuples representing star connections branching
        //      out from the input star / peer id
        nDegreeConnections (peerId, starId, n) {
            starId = this.definitelyGetStarId(peerId, starId)
            let degree_array = []
            let connection_counts = new Map()

            let cache_connection = (starId) => {
                if (!connection_counts.has(starId)) {
                    connection_counts.set(
                        starId,
                        this.firstDegreeConnections(starId)
                    )
                }
            }

            let insert_tuples = (tuple_array, from_starId) => {
                this.firstDegreeConnections(null, from_starId).forEach(
                    to_starId => {
                        tuple_array.push([from_starId, to_starId])
                        cache_connection(to_starId)
                    }
                )
            }

            for (let i = 0; i < n; i++) {
                let tuple_array = []

                if (i === 0) {
                    cache_connection(starId)
                    insert_tuples(tuple_array, starId)
                } else {
                    degree_array[i - 1].forEach(
                        connection_tuple => {
                            let [from_starId, to_starId] = connection_tuple
                            insert_tuples(tuple_array, to_starId)
                        }
                    )
                }

                // short circuit
                if (tuple_array.length < 1) return degree_array

                degree_array.push(tuple_array)
            }

            return degree_array
        }
}

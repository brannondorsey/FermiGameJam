class CivLogFilter {
    constructor(log) {
        // use `[obj].log` to get list of igms
        this.log = log
    }

    // MESSAGE FILTERING
    to (peerId) {
        return clf(this.log.filter(igm => igm.to.peerId === peerId))
    }

    from (peerId) {
        return clf(this.log.filter(igm => igm.from.peerId === peerId))
    }

    // from first argument, to second argument
    between (senderId, recieverId) {
        return this.from(senderId).to(recieverId)
    }

    //
    involving (interloc_a, interloc_b) {
        return this.to_or_from(interloc_a).to_or_from(interloc_b)
    }

    to_or_from (peerId) {
        return clf(this.log.filter(
            igm => (igm.from.peerId === peerId) || (igm.to.peerId === peerId)
        ))
    }

    type (message_type) {
        return clf(this.log.filter(igm => igm.type === message_type))
    }

    after (timestamp) {
        return clf(this.log.filter(igm => igm.timestamp > timestamp))
    }

    before (timestamp) {
        return clf(this.log.filter(igm => igm.timestamp < timestamp))

    }

    contains (substring) {
        return clf(
            this.type('chat').log.filter(igm => igm.data.indexOf(substring) != -1)
        )
    }

    // necessary because `Array.sort` runs in place
    // `comparator` takes two igms
    sort (comparator) {
        this.log.sort(comparator)
        return this
    }

    chronological () {
        return this.sort(
            (a, b) => (a.timestamp < b.timestamp) ? -1 : 1
        )
    }

    // STAR LIST CONSTRUCTION FOR VISUALIZATION

    // constructs an array of all the star ids of every `to` field
    // optional id to filter out
    all_star_ids_to (id) {
        let ids = []

        this.log.forEach(
            igm => {
                let to_id = igm.to.starId

                if (to_id !== id) {
                    if (ids.indexOf(to_id) === -1) {
                        ids.push(to_id)
                    }
                }
            }
        )

        return ids
    }

    // constructs an array of all the star ids of every `from` field
    // optional id to filter out
    all_star_ids_from (id) {
        let ids = []

        this.log.forEach(
            igm => {
                let from_id = igm.from.starId

                if (from_id !== id) {
                    if (ids.indexOf(from_id) === -1) {
                        ids.push(from_id)
                    }
                }
            }
        )

        return ids
    }

    // constructs an array of all star ids of every participant in the log
    // optional id to filter out
    all_star_ids (id) {
        let to_ids = this.all_star_ids_to(id)
        let from_ids = this.all_star_ids_from(id)

        let ids = to_ids.slice()
        from_ids.forEach(
            from_id => {
                if (ids.indexOf(from_id) === -1) {
                    ids.push(from_id)
                }
            }
        )

        return ids
    }
}

// convenience
let clf = (log) => new CivLogFilter(log)

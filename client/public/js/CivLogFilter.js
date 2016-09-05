class CivLogFilter {
    constructor(log) {
        // use `[obj].log` to get list of igms
        this.log = log
    }

    to (peerId) {
        return new CivLogFilter(this.log.filter(igm => igm.to.peerId === peerId))
    }

    from (peerId) {
        return new CivLogFilter(this.log.filter(igm => igm.from.peerId === peerId))
    }

    between (senderId, recieverId) {
        return this.from(senderId).to(recieverId)
    }

    type (message_type) {
        return new CivLogFilter(this.log.filter(igm => igm.type === message_type))
    }

    after (timestamp) {
        return new CivLogFilter(this.log.filter(igm => igm.timestamp > timestamp))
    }

    before (timestamp) {
        return new CivLogFilter(this.log.filter(igm => igm.timestamp < timestamp))

    }

    contains (substring) {
        return new CivLogFilter(
            this.type('chat').log.filter(igm => igm.data.indexOf(substring) != -1)
        )
    }

    // necessary because `Array.sort` runs in place
    // sort takes two igms
    sort (comparator) {
        this.log.sort(comparator)
        return this
    }

    chronological () {
        return this.sort(
            (a, b) => (a.timestamp < b.timestamp)?-1:1
        )
    }
}

class GameState {
			
	constructor() {
		this._dead = new Map()
	}

	markDead(starName) {
		this._dead.set(starName, true)
	}

	markAlive(starName) {
		this._dead.set(starName, false)
	}

	isDead(starName) {
		if (!this._dead.has(starName))
			throw Error(`${starName} is not in dead map`)
		return this._dead.get(starName)
	}

	isAlive(starName) {
		return !this.isDead(starName)
	}

	isDeadAliveKnown(starName) {
		return this._dead.has(starName)
	}

	getDead() {
		return Array.from(this._dead.entries()).filter(pair => pair[1]).map(pair => pair[0])
	}

	getAlive() {
		return Array.from(this._dead.entries()).filter(pair => !pair[1]).map(pair => pair[0])
	}
}



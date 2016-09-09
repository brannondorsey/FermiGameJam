$(document).ready(function() {
	'use strict'

	// toggle menu buttons
	$('#menu li').each(function() {
		$(this).click(function(e) {
			e.preventDefault()
			$('#menu li').each(function(){ $(this).removeClass('active') })
			$(this).toggleClass('active')
		})
	})

	// log button
	$('#log-button').click(function(e) {
		$('#log').removeClass('hide')
	})

	$('#explore-button').click(() => {
		exploreConnections(civLog.self.starId)
	})

	// ping peers button
	$('#ping-peers-button').click(() => {
		$('#explore tr span').each(function() {
			let starId = this.textContent
			ping(starId)
		})
	})

	$('#chat-input').on('keydown', function(e) {
		
		console.log(e.shiftKey)
		let key = e.keyCode || e.which
		if (key == 13 && !e.shiftKey) { // enter
			e.preventDefault()
			let starId = $('')
			sendChat(this.value)
			this.value = ""
		}

	})

	function sendChat(starId, chat) {
		console.log(chat)
	}	

	function ping(starId) {
		console.log(`pinging ${starId}`)
		p2p.connect(civLog.starId2PeerId.get(starId))
		.then((id) => {
			console.log('resolve')
            p2p.sendIGM(id, civLog.createIGM(id, 'ping', null))
            markDeadAliveState(starId, true)
		})
		.catch(err => { console.log('reject'); markDeadAliveState(starId, false) })
	}

	function markDeadAliveState(starId, alive) {
		// update galaxy data model
		$('#explore tr span').each(function() {

			if (this.textContent === starId.toString()) {
				$(this).parent().addClass("dead")[0]
				console.log('match ' + this.textContent)
			} else {
				console.log(this.textContent, starId.toString())
			}
		})
	}

	function log() {

	}

	function exploreConnections(starId) {
		console.log('exploring ' + starId)
		let conDepth = 4
		let cons = civLog.nDegreeConnections(null, starId, conDepth)
		if (cons.length > 1) {
			console.log('cons is greater than 1')
			galaxy.drawConnections(cons)
			fillExploreTable(starId, cons)
		}
	}

	function fillExploreTable(starId, connections) {
		
		if (connections[0]) {

			let table = $('#explore').get()[0]
			table.innerHTML = ""
			let row = table.insertRow(0)
			let c1 = row.insertCell(0)
			let c2 = row.insertCell(1)
			c1.textContent = "STAR NAME"
			c2.textContent = "PEERS"

			document.getElementById('exploring-star-name').textContent
				 = starId.toString().toUpperCase()

			connections[0].forEach((pair, i) => {
				let span = document.createElement('span')
				span.className = 'explore-star-connection'
				span.textContent = pair[1]

				let row = table.insertRow(i + 1)
				let c1 = row.insertCell(0)
				c1.appendChild(span)

				let c2 = row.insertCell(1)
				c2.textContent = civLog.firstDegreeConnections(null, pair[1]).length

				row.style.cursor = "pointer"
				row.addEventListener('click', function() {
					exploreConnections(pair[1])
				})
			})
		}
	}

	function updateLog(log) {
		
		let table = $('#log').get()[0]
		table.innerHTML = ""
		let row = table.insertRow(0)
		let c1 = row.insertCell(0)
		let c2 = row.insertCell(1)
		let c3 = row.insertCell(2)
		let c4 = row.insertCell(3)
		let c5 = row.insertCell(4)
		c1.innerHTML = "DATE"
		c2.innerHTML = "TO"	
		c3.innerHTML = "FROM"
		c4.innerHTML = "TYPE"
		c5.innerHTML = "DATA"

		log.forEach((igm, i) => {
			
			let row = table.insertRow(i + 1)
			
			let c1 = row.insertCell(0)
			let c2 = row.insertCell(1)
			let c3 = row.insertCell(2)
			let c4 = row.insertCell(3)
			let c5 = row.insertCell(4)
			
			c1.innerHTML = igm.timestamp
			c2.innerHTML = igm.to.starId
			c3.innerHTML = igm.from.starId
			c4.innerHTML = igm.type
			c5.innerHTML = igm.data

		})
	}
})


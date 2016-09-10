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
		exploreConnections(civLog.self.starName)
	})

	// ping peers button
	$('#ping-peers-button').click(() => {
		$('#explore tr span').each(function() {
			let starName = this.textContent
			ping(starName)
		})
	})

	$('#chat-input').on('keydown', function(e) {
		
		let key = e.keyCode || e.which
		if (key == 13 && !e.shiftKey) { // enter
			e.preventDefault()
			let starName = document.getElementById('exploring-star-name').textContent
			sendChat(starName, this.value)
			this.value = ""
		}

	})

	$('#chat-button').click(function() {
		let starName = document.getElementById('exploring-star-name').textContent;
		let peerId = civLog.peerIdFromStarName(starName)
		if (p2p.isConnected(peerId)) {
			showChatWindow(starName)
		} else if (peerId !== civLog.self.peerId) {
			console.log(`peerId: ${peerId}`)
			p2p.connect(peerId)
			   .then(id => showChatWindow(starName)) 
			   .catch(err => {
			   		console.error(`Failed to connect to ${peerId}`)
			   		console.log(err)
			   	})
		}
		
	})
})

function updateChatWindow() {

}

function addChatMessageToChatWindow(igm) {

	let chatBody = document.getElementById('chat-body')

	let div = document.createElement('div')
	div.className = "chat-message"
	div.textContent = igm.data

	// to self
	if (igm.to.starId === civLog.self.starId) {
		div.className += ' chat-them'
	} else {
		div.className += ' chat-me'
	}

	chatBody.appendChild(div)
	chatBody.scrollTop = chatBody.scrollHeight;
}

function showChatWindow(starName) {

	if (starName) {
		
		document.getElementById('chat-star-name').textContent = starName
		
		let chatBody = document.getElementById('chat-body')
		chatBody.innerHTML = ''
		let igms = civLog.getChats(civLog.self.starName, starName)
		// igms.reverse()
		igms.forEach(igm => {
			addChatMessageToChatWindow(igm)
		})
	}

	document.getElementById('chat').style.display = 'flex'
}

function hideChatWindow() {
	document.getElementById('chat').style.display = 'none'
}

function sendChat(starName, chat) {
	let peerId = civLog.starId2PeerId.get(civLog.starName2StarId.get(starName))
	if (p2p.isConnected(peerId)) {
		let igm = civLog.createIGM(peerId, 'chat', chat)
		p2p.sendIGM(peerId, igm)
		addChatMessageToChatWindow(igm)
	}
}	

function ping(starName) {
	// console.log(`pinging ${civLog.peerIdFromStarName(starName)}`)
	if (starName !== civLog.self.starName) {
		p2p.connect(civLog.peerIdFromStarName(starName))
			.then((id) => {
				console.log('resolve')
		        p2p.sendIGM(id, civLog.createIGM(id, 'ping', null))
		        updateDeadAliveState(starName, true)
			})
			.catch(err => { 
				console.log('reject'); 
				console.log(err)
				updateDeadAliveState(starName, false) 
			})
	}
}

function updateDeadAliveState(starName, alive) {
	
	if (alive) {
		state.markAlive(starName)
		galaxy.markAlive(civLog.starName2StarId.get(starName))
	} else {
		state.markDead(starName)
		galaxy.markDead(civLog.starName2StarId.get(starName))
	}

	// update galaxy data model
	$('#explore tr span').each(function() {
		if (this.textContent === starName) {

			// clear old results
			$(this).parent().removeClass("alive")
			$(this).parent().removeClass("dead")

			if (alive) $(this).parent().addClass("alive")[0]
			else $(this).parent().addClass("dead")[0]
		}
	})
}

function exploreConnections(starName) {

	let conDepth = 3
	let starId = civLog.starName2StarId.get(starName)
	let cons = civLog.nDegreeConnections(null, starId, conDepth)
	if (cons.length > 1) {
		galaxy.drawConnections(cons)
		updateExploreTable(starName, cons)
	}
}

function updateExploreTable(starName, connections) {
	
	let chatButton = document.getElementById('chat-button')
	// debugger
	// if the star being explored is not me and connected
	if (civLog.self.starName !== starName &&
		p2p.isConnected(civLog.peerIdFromStarName(starName))) {

		chatButton.style.visibility = 'visible'
	} else {
		chatButton.style.visibility = 'hidden'
	}

	// if there are first degree connections
	if (connections[0]) {

		let table = $('#explore').get()[0]
		table.innerHTML = ""
		let row = table.insertRow(0)
		let c1 = row.insertCell(0)
		let c2 = row.insertCell(1)
		c1.textContent = "STAR NAME"
		c2.textContent = "PEERS"

		document.getElementById('exploring-star-name').textContent
			 = starName.toString()//.toUpperCase()

		connections[0].forEach((pair, i) => {
			
			let name = civLog.starId2StarName.get(pair[1])
			let span = document.createElement('span')
			span.className = 'explore-star-connection '
			span.textContent = name

			let row = table.insertRow(i + 1)
			let c1 = row.insertCell(0)

			if (state.isDeadAliveKnown(name))
				c1.className += ' ' + (state.isDead(name) ? 'dead' : 'alive')
			
			c1.appendChild(span)

			let c2 = row.insertCell(1)
			c2.textContent = civLog.firstDegreeConnections(null, pair[1]).length

			row.style.cursor = "pointer"
			row.addEventListener('click', function() {
				exploreConnections(name)
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

// class GameLog() {
// 	constructor() {
// 		this.PING_DEAD = 1
// 		this.PING_ALIVE = 2
// 		this.CONTACT = 3
// 		this.PEER_LOST = 4
// 		this.CHAT_RECEIVED = 5
// 		this.CHAT_SENT = 6
// 		this.PINGING_PEERS = 7
// 		this.CONNECTING_TO_PEER = 8
// 		this.PEER_COUNT_DEAD = 9
// 		this.PEER_COUNT_ALIVE = 10
// 		this.NUM_CIVS_DISCOVERED = 11
// 	}

// 	log(type) {
// 		switch(type) {
// 			case :
// 				break
// 		}
// 	}

// 	_log() {

// 	}
// }

// class Journal() {

// }


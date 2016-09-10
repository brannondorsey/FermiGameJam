class UI {
	
	static starNameAssigned(starId) {
		let name = civLog.starId2StarName.get(starId)
		document.getElementById('my-star-name').textContent = name
	}

	static chatMessageReceived(igm) {
		// <BEL> or notification
		let isChatting = document.getElementById('chat').style.display === 'flex'
		if (isChatting) {
			let partner = document.getElementById('chat-star-name').textContent
			let partnerStarId = civLog.starName2StarId.get(partner)
			if (partnerStarId === igm.to.starId ||
			    partnerStarId === igm.from.starId) {
				addChatMessageToChatWindow(igm)
			}
		}
	}
}

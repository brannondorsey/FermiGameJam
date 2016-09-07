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
})

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
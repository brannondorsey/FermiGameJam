import {fetch} from 'node-fetch'

let params = new UrlSearchParams()
params.append('foo', 'bar')
fetch('google.com', { body: params })
	.then( data => console.log(data))
	.catch(err => console.error(err))
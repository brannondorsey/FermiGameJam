import {PeerServer} from 'peer'
let Baby = require('babyparse')

let io = require('socket.io')();

// map between peerIds and starIds
let ids = new Map()
// map between dead peerIds and their starIds
let dead_ids = new Map

let peerServer = PeerServer({port: 9000, path: '/fermi'})

// reads star catalogue into object
let hyg = _loadHYG()

peerServer.on('connection', id => {

    // let civ = new Civilization()
    // civ.star = assignStar(geo, ids)
    // ids.set(id, civ)

    console.log(`a peer client connected with id: ${id}`)
});

function _loadHYG () {
    let star_list = Baby.parseFiles(
        "data/hygdata_v3.csv",
        {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                console.log("parsed hygdata")
            }
        }
    ).data
    let hyg = new Map()

    star_list.forEach(
        (star) => hyg.set(star.id, star)
    )

    return hyg
}

io.on('connection', socket =>
    {
        let peerId = null
        console.log('a socket.io client connected')
        socket.on('geolocation', geolocation =>
            {
                console.log(geolocation)
                let id = geolocation.id

                if (geolocation.geo) {
                    ids.set(id, assignStar(geolocation.geo, ids))
                } else {
                    // random location
                    ids.set(
                        id,
                        assignStar(
                            {
                                lat: (Math.random() * 180) - 90,
                                lon: (Math.random() * 360) - 180
                            },
                            ids
                        )
                    )
                }
                // star assignment
                socket.emit('star_assignment', ids.get(id))
                peerId = id
                console.log(`assigned star ${ids.get(id)} to id ${id}`)

                // initial introduction
                let potential_friends = Array.from(ids.keys())
                    .filter(
                        key => (key !== id) && !dead_ids.has(key)
                    )
                if (potential_friends.length > 0) {
                    let square = (val) => Math.pow(val, 2)
                    let distance = (a, b) => {
                        let x1 = a.x
                        let y1 = a.y
                        let z1 = a.z
                        let x2 = b.x
                        let y2 = b.y
                        let z2 = b.z
                        return Math.sqrt(square(x2 - x1) + square(y2 - y1) + square(z2 - z1))
                    }

                    potential_friends.sort(
                        (left_id, right_id) => {
                            let left_friend = hyg.get(ids.get(left_id))
                            let right_friend = hyg.get(ids.get(right_id))
                            let player = hyg.get(ids.get(id))

                            let left_dist = distance(player, left_friend)
                            let right_dist = distance(player, right_friend)

                            return (left_dist < right_dist) ? -1 : 1
                        }
                    )

                    let friend_peer_id = potential_friends[potential_friends.length - 1]
                    let friend_star_id = ids.get(friend_peer_id)
                    socket.emit(
                        'star_introduction',
                        {
                            peerId: friend_peer_id,
                            starId: friend_star_id
                        }
                    )
                    console.log(`introduced ${id} (${ids.get(id)}) to ${friend_peer_id} (${friend_star_id})`)
                }

            }
        )
        socket.on('disconnect', () =>
            {
                if (peerId !== null) {
                    let starId = ids.get(peerId)
                    console.log(`${peerId} (${starId}) has died`)
                    dead_ids.set(peerId, starId)
                }
            }
        )
    }
);

io.listen(3000)

// computes central angle between two polar vectors
//  coordinates in radians
function centralAngle (lat1, lon1, lat2, lon2) {
    return Math.acos(
        Math.sin(lat1) * Math.sin(lat2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.cos(Math.abs(lon2 - lon1))
    )
}

// converts degrees to radians
function radians (degrees) {
    return degrees * Math.PI / 180
}

// selects star closest to specified geolocation not in input `ids` object
//  (values of `ids` must include `id` attribute)
function assignStar (geo, ids) {
    // try to assign stars in a spherical shell
    let assignedStars = Array.from(ids.values())

    let lat = radians(geo.lat)
    let lon = radians(geo.lon)

    let sorted_star_list = Array.from(hyg.values())
        .filter(
            star =>
                assignedStars.indexOf(star.id) === -1
        )

    let calculate_metric = (star) => {
        let central_angle = centralAngle(lat, lon, star.decrad, star.rarad)
        return Math.sqrt(central_angle) * Math.pow(star.dist, 5)
    }

    sorted_star_list.sort(
        (star1, star2) =>
            {
                let star1_metric = calculate_metric(star1)
                let star2_metric = calculate_metric(star2)

                return (star1_metric < star2_metric) ? -1 : 1
            }
    )

    return sorted_star_list[0].id
}

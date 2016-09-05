import {PeerServer} from 'peer'
let Baby = require('babyparse')

let io = require('socket.io')();

// map between peerIds and starIds
let ids = new Map()
let peerServer = PeerServer({port: 9000, path: '/fermi'})

// reads star catalogue into object
let parsed_hygdata = Baby.parseFiles(
    "data/hygdata_v3.csv",
    {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            console.log("parsed hygdata")
        }
    }
)

// filters star catalogue
let star_list = parsed_hygdata.data
    .filter(star => ((star.proper !== 'Sol') && (star.dist < 100000)))


peerServer.on('connection', id => {

    // let civ = new Civilization()
    // civ.star = assignStar(geo, ids)
    // ids.set(id, civ)

    console.log(`a peer client connected with id: ${id}`)
});

io.on('connection', socket =>
    {
        console.log('a socket.io client connected')
        socket.on('geolocation', geolocation =>
            {
                console.log(geolocation)
                let id = geolocation.id

                if (geolocation.geo) {
                    ids.set(id, assignStar(geolocation.geo, ids))
                } else {
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
                console.log(`assigned star ${ids.get(id)} to id ${id}`)

                // initial introduction
                let potential_friends = Array.from(ids.keys()).filter(key => key !== id)
                if (potential_friends.length > 0) {
                    let friend_peer_id = potential_friends[
                        Math.floor(Math.random() * potential_friends.length)
                    ]
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
    let assignedStars = Array.from(ids.values()).map(civ => civ.star)

    let lat = radians(geo.lat)
    let lon = radians(geo.lon)

    let sorted_star_list = star_list
        .filter(
            star =>
                assignedStars.indexOf(star.id) === -1
        )

    sorted_star_list.sort(
        (star1, star2) =>
            {
                let star1_ca = centralAngle(
                    lat,
                    lon,
                    star1.decrad,
                    star1.rarad
                )

                let star2_ca = centralAngle(
                    lat,
                    lon,
                    star2.decrad,
                    star2.rarad
                )

                return (star1_ca < star2_ca)?-1:1
            }
    )

    return sorted_star_list[sorted_star_list.length - 1].id
}

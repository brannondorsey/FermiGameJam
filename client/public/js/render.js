let galaxy = new Galaxy(civLog)
galaxy.load()
    .then(() => console.log('loaded the galaxy'))
    .catch(err => { throw err })

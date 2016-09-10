class NameGenerator {
    constructor (generator_name) {
        // dict mapping name generator names to generator functions
        // generator functions take, as arguments:
        //      * a list of already-assigned names
        // and return a string that is the new name
        this._name_generators = new Map()
        this._name_generators.set(
            "bayer",
            (assigned_names) => {
                let prefix_letters = [
                    "alpha",
                    "beta",
                    "gamma",
                    "delta",
                    "epsilon",
                    "zeta",
                    "eta",
                    "theta",
                    "iota",
                    "kappa",
                    "lambda",
                    "mu",
                    "nu",
                    "xi",
                    "omicron",
                    "pi",
                    "rho",
                    "sigma",
                    "tau",
                    "upsilon",
                    "phi",
                    "chi",
                    "psi",
                    "omega"
                ]

                let numerals = [
                    "0",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9"
                ]

                let constellations = [
                    "Andromedae",
                    "Antliae",
                    "Apodis",
                    "Aquarii",
                    "Aquilae",
                    "Arae",
                    "Arietis",
                    "Aurigae",
                    "Boötis",
                    "Caeli",
                    "Camelopardalis",
                    "Cancri",
                    "Canum Venaticorum",
                    "Canis Majoris",
                    "Canis Minoris",
                    "Capricorni",
                    "Carinae",
                    "Cassiopeiae",
                    "Centauri",
                    "Cephei",
                    "Ceti",
                    "Chamaeleontis",
                    "Circini",
                    "Columbae",
                    "Comae Berenices",
                    "Coronae Australis",
                    "Coronae Borealis",
                    "Corvi",
                    "Crateris",
                    "Crucis",
                    "Cygni",
                    "Delphini",
                    "Doradus",
                    "Draconis",
                    "Equulei",
                    "Eridani",
                    "Fornacis",
                    "Geminorum",
                    "Gruis",
                    "Herculis",
                    "Horologii",
                    "Hydrae",
                    "Hydri",
                    "Indi",
                    "Lacertae",
                    "Leonis",
                    "Leonis Minoris",
                    "Leporis",
                    "Librae",
                    "Lupi",
                    "Lyncis",
                    "Lyrae",
                    "Mensae",
                    "Microscopii",
                    "Monocerotis",
                    "Muscae",
                    "Normae",
                    "Octantis",
                    "Ophiuchi",
                    "Orionis",
                    "Pavonis",
                    "Pegasi",
                    "Persei",
                    "Phoenicis",
                    "Pictoris",
                    "Piscium",
                    "Piscis Austrini",
                    "Puppis",
                    "Pyxidis",
                    "Reticuli",
                    "Sagittae",
                    "Sagittarii",
                    "Scorpii",
                    "Sculptoris",
                    "Scuti",
                    "Serpentis",
                    "Sextantis",
                    "Tauri",
                    "Telescopii",
                    "Trianguli",
                    "Trianguli Australis",
                    "Tucanae",
                    "Ursae Majoris",
                    "Ursae Minoris",
                    "Velorum",
                    "Virginis",
                    "Volantis",
                    "Vulpeculae"
                ]

                let candidate_name = ""
                do {
                    let prefix = prefix_letters[
                        Math.floor(Math.random() * prefix_letters.length)
                    ]

                    let num_1 = numerals[
                        Math.floor(Math.random() * numerals.length)
                    ]
                    let num_2 = numerals[
                        Math.floor(Math.random() * numerals.length)
                    ]

                    let constellation = constellations[
                        Math.floor(Math.random() * constellations.length)
                    ]

                    candidate_name = `${prefix}-${num_1}${num_2} ${constellation}`
                } while (assigned_names.includes(candidate_name))

                return candidate_name
            }
        )
        // ... more generators go here ...

        if (generator_name == null) {
            generator_name = Array.from(this._name_generators.keys())[
                Math.floor(Math.random() * this._name_generators.size)
            ]
        }

        this._generator = this._name_generators.get(generator_name)
        this._assigned_names = []
    }

    name () {
        let new_name = this._generator(this._assigned_names)
        this._assigned_names.push(new_name)
        return new_name
    }
}



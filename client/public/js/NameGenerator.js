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
                    "α",
                    "β",
                    "γ",
                    "δ",
                    "ε",
                    "ζ",
                    "η",
                    "θ",
                    "ι",
                    "κ",
                    "λ",
                    "μ",
                    "ν",
                    "ξ",
                    "ο",
                    "π",
                    "ρ",
                    "ς",
                    "τ",
                    "υ",
                    "φ",
                    "χ",
                    "ψ",
                    "ω",
                    "Γ",
                    "Δ",
                    "Λ",
                    "Ξ",
                    "Π",
                    "Σ",
                    "Φ",
                    "Ψ",
                    "Ω",
                    "b",
                    "c",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                    "i",
                    "j",
                    "l",
                    "m",
                    "n",
                    "q",
                    "r",
                    "s",
                    "t",
                    "x",
                    "y",
                    "z",
                    "A",
                    "B",
                    "C",
                    "D",
                    "E",
                    "F",
                    "G",
                    "H",
                    "I",
                    "J",
                    "K",
                    "L",
                    "M",
                    "N",
                    "O",
                    "P",
                    "Q",
                    "R",
                    "S",
                    "T",
                    "U",
                    "V",
                    "W",
                    "X",
                    "Y",
                    "Z"
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

                    let constellation = constellations[
                        Math.floor(Math.random() * constellations.length)
                    ]

                    candidate_name = `${prefix} ${constellation}`
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



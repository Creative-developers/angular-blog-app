db.persons.aggregate([{
        $match: { gender: 'female' }
    },
    {
        $group: {
            _id: { state: '$location.state' },
            total: { $sum: 1 }
        }
    },
    { $sort: { total: -1 } }
]).pretty();


db.persons.aggregate([{
        $match: { "dob.age": { $gt: 50 } }
    },
    { $group: { _id: { gender: "$gender" }, numOfPersons: { $sum: 1 }, sumOfAges: { $sum: "$dob.age" } } }
]).pretty();

db.persons.aggregate([{
        $match: { "dob.age": { $gt: 50 } }
    },
    { $group: { _id: { gender: "$gender" }, numOfPersons: { $sum: 1 }, averageAge: { $avg: "$dob.age" } } }
]).pretty();


db.persons.aggregate([{
    $project: {
        _id: 0,
        gender: 1,
        name: {
            $concat: [
                { $toUpper: { $substrCP: ["$name.first", 0, 1] } },
                {
                    $substrCP: [
                        "$name.first", 1, { $subtract: [{ $strLenCP: "$name.first" }, 1] }
                    ]
                },
                ' ',
                { $toUpper: { $substrCP: ["$name.last", 0, 1] } },
                {
                    $substrCP: [
                        "$name.last", 1, { $subtract: [{ $strLenCP: "$name.last" }, 1] }
                    ]
                },
            ]
        }
    }
}]).pretty();

db.persons.aggregate([{
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            birthdate: { $convert: { input: "$dob.date", to: "date" } },
            age: "$dob.age",
            location: {
                type: 'Point',
                coordinates: [{
                    $convert: { input: "$location.coordinates.longitude", to: "double", onError: 0.00, onNull: 0.00 },
                }, {


                    $convert: { input: "$location.coordinates.latitude", to: "double", onError: 0.00, onNull: 0.00 },
                }]
            }
        },
    }, {
        $project: {
            gender: 1,
            email: 1,
            location: 1,
            birthdate: 1,
            age: 1,
            name: {
                $concat: [
                    { $toUpper: { $substrCP: ["$name.first", 0, 1] } },
                    {
                        $substrCP: [
                            "$name.first", 1, { $subtract: [{ $strLenCP: "$name.first" }, 1] }
                        ]
                    },
                    ' ',
                    { $toUpper: { $substrCP: ["$name.last", 0, 1] } },
                    {
                        $substrCP: [
                            "$name.last", 1, { $subtract: [{ $strLenCP: "$name.last" }, 1] }
                        ]
                    },
                ]
            }
        }
    }

]).pretty();


db.persons.aggregate([{
        $project: {
            _id: 0,
            name: 1,
            email: 1,
            birthdate: { $toDate: "$dob.date" },
            age: "$dob.age",
            location: {
                type: 'Point',
                coordinates: [{
                    $convert: { input: "$location.coordinates.longitude", to: "double", onError: 0.00, onNull: 0.00 },
                }, {
                    $convert: { input: "$location.coordinates.latitude", to: "double", onError: 0.00, onNull: 0.00 },
                }]
            }
        },
    }, {
        $project: {
            gender: 1,
            email: 1,
            location: 1,
            birthdate: 1,
            age: 1,
            name: {
                $concat: [
                    { $toUpper: { $substrCP: ["$name.first", 0, 1] } },
                    {
                        $substrCP: [
                            "$name.first", 1, { $subtract: [{ $strLenCP: "$name.first" }, 1] }
                        ]
                    },
                    ' ',
                    { $toUpper: { $substrCP: ["$name.last", 0, 1] } },
                    {
                        $substrCP: [
                            "$name.last", 1, { $subtract: [{ $strLenCP: "$name.last" }, 1] }
                        ]
                    },
                ]
            }
        }
    },
    {
        $group: { _id: { birthYear: { $isoWeekYear: "$birthdate" } }, numOfPersons: { $sum: 1 } }
    },
    { $sort: { numOfPersons: -1 } }
]).pretty();
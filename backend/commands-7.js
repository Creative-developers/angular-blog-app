// push the arrays

const { db } = require("./models/UserProfile");

//unwind remove the elements from arrays
db.friends.aggregate([
    { $unwind: '$hobbies' },
    { $group: { _id: { age: "$age" }, allHobbies: { $push: '$hobbies' } } }
]).pretty();


//Eliminating duplicating values using addToSet
db.friends.aggregate([
    { $unwind: '$hobbies' },
    { $group: { _id: { age: "$age" }, allHobbies: { $addToSet: '$hobbies' } } }
]).pretty();

//projection on arrays
db.friends.aggregate([
    { $project: { _id: 0, examScores: { $slice: ["$examScores", 2, 1] } } }
]).pretty();


//counting the length of arrays
db.friends.aggregate([
    { $project: { _id: 0, numOfScores: { $size: "$examScores" } } }
]).pretty();


//using filter operation
db.friends.aggregate([{
    $project: {
        _id: 0,
        scores: { $filter: { input: '$examScores', as: 'sc', cond: { $gt: ["sc.score", 10] } } }
    }
}]).pretty();

//getting highest score
db.friends.aggregate([
    { $unwind: '$examScores' },
    { $project: { _id: 1, name: 1, age: 1, score: "$examScores.score" } },
    { $sort: { score: -1 } },
    { $group: { _id: "$_id", name: { $first: "$name" }, maxScore: { $max: "$score" } } },
    { $sort: { maxScore: -1 } }
]).pretty();

//buckets
db.persons.aggregate([{
    $bucket: {
        groupBy: '$dob.age',
        boundaries: [18, 30, 40, 50, 60, 70, 80, 90, 100],
        output: {
            numOfPersons: { $sum: 1 },
            averageAge: { $avg: "$dob.age" }
        }
    }
}]).pretty();
//bucket auto
db.persons.aggregate([{
    $bucketAuto: {
        groupBy: '$dob.age',
        buckets: 1,
        output: {
            numOfPersons: { $sum: 1 },
            averageAge: { $avg: "$dob.age" }
        }
    }
}]).pretty();


db.inventory.find({
    quantity: { $lt: 20 }
}).pretty();

db.inventory.updateMany({
    "carrier.fee": { $lt: 4 }
}, { $set: { price: 1 } })


//skip and limit

db.persons.aggregate([
    { $match: { gender: 'male' } },
    { $project: { _id: 0, name: { $concat: ["$name.first", " ", "$name.last"] }, birthDate: { $toDate: "$dob.date" } } },
    { $sort: { birthDate: 1 } },
    { $skip: 1390 }, { $limit: 10 }
]).pretty();

// saving collecion data in another collection

db.persons.aggregate([
    { $match: { gender: 'male' } },
    { $project: { _id: 0, name: { $concat: ["$name.first", " ", "$name.last"] }, birthDate: { $toDate: "$dob.date" } } },
    { $sort: { birthDate: 1 } },
    { $out: 'transformCollection' }
]).pretty();
const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";

var petfinder = require("@petfinder/petfinder-js");
var client = new petfinder.Client({apiKey: petFinderKey, secret: petFinderSecret});

client.animal.search()
    .then(function (response) {
        // Do something with `response.data.animals`
        console.log(response.data);
    })
    .catch(function (error) {
        // Handle the error
    });
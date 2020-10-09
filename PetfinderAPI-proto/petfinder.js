const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";

var pet_spec = {
    type: "",
    breed: "",
    limit: 50,
}

var petfinder = require("@petfinder/petfinder-js");


//Setup type of animal you want to search before calling the find_pet function
// to return the results of available pets
//Available settings: type, breed

var settings = function (spec, value) {
    pet_spec[spec] = value;
}
settings("type", "Dog");
console.log(pet_spec);
var client = new petfinder.Client({ apiKey: petFinderKey, secret: petFinderSecret });;

var find_pet = function () {
    client.animal.search({

        type: "Dog",
    })
        .then(function (response) {
            // Do something with `response.data.animals`
            console.log(response.data);
        })
        .catch(function (error) {
            // Handle the error
        });
}
find_pet();
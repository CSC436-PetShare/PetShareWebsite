
// import { Client } from "/@petfinder/petfinder-js";
var petfinder = require("@petfinder/petfinder-js");


const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";

var pet_spec = {
    limit: 5,
    //MAX LIMIT: 50
}



//Setup type of animal you want to search before calling the find_pet function
// to return the results of available pets
//Available settings: type, breed

var settings = function (spec, value) {
    pet_spec[spec] = value;
}

var find_pet = function () {
    var client = new petfinder.Client({
        apiKey: petFinderKey,
        secret: petFinderSecret 
    });;

    client.animal.search(pet_spec)
    .then(function (response) {
        // Do something with `response.data.animals`
        console.log(response.data);
        return response.data;
    }).catch(function (error) {
        // Handle the error
        return null;
    });
}
//Returns information about the type
var returnAnimalType = function(){
    var client = new petfinder.Client({
        apiKey: petFinderKey,
        secret: petFinderSecret 
    });;

    client.animalData.types().then(
        response => {
            var types = response.data.types;

            for(i in types){
                console.log( types[i].name);
            }
            console.log(response.data);
        }
    )

}

// settings("type", "Dog");
// settings("coat", "Long");
// settings("size","Extra Large");

fillViewWithPetType();
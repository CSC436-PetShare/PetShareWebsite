//1. for node js testing
// var petfinder = require("@petfinder/petfinder-js");
//2. for browser
import {Client} from '/@petfinder/petfinder-js';

const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";


const client = new petfinder.Client({
    apiKey: petFinderKey,
    secret: petFinderSecret 
});

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


var find_pet = async () =>{

    await client.animal.search(pet_spec)
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

    client.animalData.types().then(
        function(response) {
            var types_arr = [];
            var types = response.data.types;

            for(i in types){
                types_arr.push(types[i].name);
            }
            // console.log(types_arr);
            return types_arr;
        }
    )
}

var returnAnimalAttributes = function(type){
    client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            var animal_attributes;
            for(i in types){
                if(types[i].name === type){
                    animal_attributes = types[i];
                }
            }

            var attribute_arr = [];
            for(attribute in animal_attributes){
                attribute_arr.push(attribute);
            }
            console.log(attribute_arr);
            return attribute_arr;
        }
    )
}

var returnAnimalAttributesObject = function(type){
    client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            var animal_attributes;
            for(i in types){
                if(types[i].name === type){
                    animal_attributes = types[i];
                }
            }
            return animal_attributes;
        }
    )
}

var petfinder_controller = {
    //Returns possible animal types
    returnAnimalType: function(){
        return returnAnimalType();
    },
    returnAnimalAttributes: function(type){
        return returnAnimalAttributes();
    },
    settings: function(spec, value){
        return settings(spec, value);
    },
    find_pet: function(){
        return find_pet();
    }
}

// console.log(returnAnimalFeaturesObject("Dog"));
// settings("coat", "Long");
// settings("size","Extra Large");
returnAnimalAttributesObject("Rabbit");

// export {petfinder_controller};
//1. for node js testing
// var petfinder = require("@petfinder/petfinder-js");
//2. for browser
//import {Client} from './@petfinder/petfinder-js/dist/petfinder.js';

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

var animal_attributes;
var types_arr = [];
var attribute_arr = [];
var find_pet_response;

//Setup type of animal you want to search before calling the find_pet function
// to return the results of available pets
//Available settings: type, breed

var settings = function (spec, value) {
    pet_spec[spec] = value;
}


var find_pet = async function() {

    await client.animal.search(pet_spec)
    .then(function (response) {
        // Do something with `response.data.animals`
        console.log(response.data);
        find_pet_response = response.data;
        //return response.data;
    }).catch(function (error) {
        // Handle the error
        find_pet_response = null;
        return null;
    });
}
//Returns information about the type
var returnAnimalType = async function(){

    await client.animalData.types().then(
        function(response) {
            types_arr = [];
            var types = response.data.types;

            for(var i in types){
                types_arr.push(types[i].name);
            }
            // console.log(types_arr);
            return types_arr;
        }
    )
}

var returnAnimalAttributes = async function(type){
    await client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            var animal_attributes;
            for(var i in types){
                if(types[i].name === type){
                    animal_attributes = types[i];
                }
            }

            attribute_arr = [];
            for(var attribute in animal_attributes){
                console.log(attribute);
                attribute_arr.push(attribute);
            }
            console.log(attribute_arr);
            return attribute_arr;
        }
    )
}

var returnAnimalAttributesObject = async function(type){
    await client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            var animal_attributes;
            for(var i in types){
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
    returnAnimalType: async function(){
        await returnAnimalType();
        return types_arr;
    },
    returnAnimalAttributes: async function(type){
        await returnAnimalAttributes(type);
        return attribute_arr;
    },
    settings: async function(spec, value){
        return settings(spec, value);
    },
    find_pet: async function(){
        await find_pet();
        return find_pet_response;
    }
}

//console.log(petfinder_controller.returnAnimalAttributes("Dog"));
// settings("coat", "Long");
// settings("size","Extra Large");
returnAnimalAttributesObject("Rabbit");

export {petfinder_controller};
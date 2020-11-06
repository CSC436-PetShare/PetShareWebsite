/**
 * petfinder.js
 * 
 * Adopts the Petfinder API (https://www.petfinder.com/developers/)
 * and return the controller for searching pet adoption
 * 
 * Exports {petfinder_controller, pet_spec}
 * *pet_spec: a model for search settings
 * 
 * 
 * {petfinder_controller} methods
 * 1. returnAnimalType
 *      : Returns available animal type in the search
 * 2. settings (spec, value)
 *      : spec = string
 *      : value = string
 *      : Set up the specificication of the attribute (spec) with the value
 *      : Data stored in pet_spec
 * 3. find_pet()
 *      : Find pets available in the Petfinder API and returns its result as JSON
 * 4. returnAnimalAttributes (type)
 *      : type = string
 *      : Returns available attribute for the type
 * 5. returnAnimalAttributesObject (type)
 *      : type = string
 *      : Returns the full attribute option for the type
 * 
 * 6. returnAvailableLimits()
 *      : Returns the available search limit as an array
 * 
 * Example Uses:
 * 1. returnAnimalType
 *      -petfinder_controller.returnAnimalType();
 * 2. settings (spec, value)
 *      -petfinder_controller.settings("type","Dog");
 *      -petfinder_controller.settings("coat", "Long");
 *      -petfinder_controller.settings("size","Extra Large");
 * 3. find_pet()
 * 4. returnAnimalAttributes (type)
 *      -petfinder_controller.returnAnimalAttributes("Rabbit");
 * 5. returnAnimalAttributesObject (type)
 *      -petfinder_controller.returnAnimalAttributesObject("Rabbit");
 * 6. returnAvailableLimits()
 * 
 */

//1. for node js testing
// var petfinder = require("@petfinder/petfinder-js");
//2. for browser
//import {Client} from './@petfinder/petfinder-js/dist/petfinder.js';

const petFinderKey = "S2t3nrRa8vSmzQDxActpsXAhglEQdF5rvVQWfLBKQlT3ByXXia";
const petFinderSecret = "dyFrO08uwicmha6hFDziKndaMhjgk4Wk1joLrYgd";


//Initializing the client key and secret to gain access to the Petfinder API
const client = new petfinder.Client({
    apiKey: petFinderKey,
    secret: petFinderSecret 
});

//Pet specification
// Initial limit: 5 for each search
var pet_spec = {
    limit: 5,
    //MAX LIMIT: 50
}

var animal_attributes;
var types_arr = [];
var attribute_arr = [];
var find_pet_response;
var animal_attributes_obj;

//Set up the specificication of the attribute (spec) with the value
var settings = function (spec, value) {
    pet_spec[spec] = value;
    console.log(pet_spec);
}

// Find pets available in the Petfinder API and returns its result as JSON
var find_pet = async function() {

    await client.animal.search(pet_spec)
    .then(function (response) {
        find_pet_response = response.data;
        console.log(find_pet_response);
    }).catch(function (error) {
        // Handle the error
        find_pet_response = null;
    });
}

//Returns available animal type in the search
var returnAnimalType = async function(){
    await client.animalData.types().then(
        function(response) {
            types_arr = [];
            var types = response.data.types;

            for(var i in types){
                types_arr.push(types[i].name);
            }
            return types_arr;
        }
    )
}

//Returns available attribute for the type
var returnAnimalAttributes = async function(type){
    await client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            var animal_attributes;
            for(var i in types){
                if(types[i].name === type){
                    animal_attributes = types[i];
                    console.log(animal_attributes);
                }
            }

            attribute_arr = [];
            for(var attribute in animal_attributes){
                attribute_arr.push(attribute);
            }
            return attribute_arr;
        }
    )
}

//Returns the full attribute option for the type
var returnAnimalAttributesObject = async function(type){
    await client.animalData.types().then(
        function(response) {
            var types = response.data.types;
            
            for(var i in types){
                if(types[i].name === type){
                    animal_attributes_obj = types[i];
                }
            }
            return animal_attributes_obj;
        }
    )
}

//Returns the available search limit as an array
var returnAvailableLimits = async function(){
    var limit_arr = [5,10,15,20];
    return limit_arr;
}


var petfinder_controller = {
    returnAnimalType: async function(){
        await returnAnimalType();
        return types_arr;
    },
    returnAnimalAttributes: async function(type){
        await returnAnimalAttributes(type);
        return attribute_arr;
    },
    settings: function(spec, value){
        return settings(spec, value);
    },
    find_pet: async function(){
        await find_pet();
        return find_pet_response;
    },
    returnAnimalAttributesObject: async function(type){
        await returnAnimalAttributesObject(type);
        return animal_attributes_obj;
    },
    returnAvailableLimits: async function(){
        return returnAvailableLimits();
    }

}

export {petfinder_controller, pet_spec};
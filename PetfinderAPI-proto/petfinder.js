
import { Client } from "/@petfinder/petfinder-js";
// var petfinder = require("@petfinder/petfinder-js");


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
    var client = new Client({
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
var fillViewWithPetType = function(){
    var client = new Client({
        apiKey: petFinderKey,
        secret: petFinderSecret 
    });;

    client.animalData.types().then(
        response => {
            var types = response.data.types;

            var html_select = document.createElement("Select");
            html_select.setAttribute("id","typeSelect");
            view.appendChild(html_select);
            view.appendChild(html_input);
            for(i in types){
                var option = document.createElement("option");
                option.setAttribute("value", types[i].name);
                html_select.appendChild(option);
                console.log( types[i].name);
            }
            console.log(html_select.innerText);
        }
    )

}

// settings("type", "Dog");
// settings("coat", "Long");
// settings("size","Extra Large");

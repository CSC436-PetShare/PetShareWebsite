import {petfinder_controller} from './petfinder.js';


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++ testing arrays ++++++++++++++++++++++
var animals;
// ++++++++++++++++++++++ DOG setup ++++++++++++++++++++++
var getAttributes;

var getAttributes_dog =   ["Breeds", 
					   	   "Coats", 
					   	   "Colors",
							  "Genders"];
// var getAttributes_dog = petfinder_controller.returnAnimalAttributes("Dog");

// var attributes_dog = petfinder_controller.returnAnimalAttributesObject("Dog");

// attributes contains components as below
//	{
// 	name: 'Dog',
// 	coats: [Array],
// 	colors: [Array],
// 	genders: [Array],
// 	_links: [Object]
//   }

var getBreeds_dog =   ["Yorkie", 
					   "Great Dane", 
					   "Scoob"];
// var getCoats_dog = attributes_dog["coats"];
var getCoats_dog =   ["Bald",
					  "Short",
					  "Long", 
					  "Shaggy"];

var getColors_dog =   ["Brown", 
					   "White", 
					   "Black",
					   "Grey"];

var getGenders_dog =   ["Male", 
					    "Female"];

// ++++++++++++++++++++++ CAT setup ++++++++++++++++++++++
var getAttributes_cat =   ["Breeds", 
					   	   "Coats", 
					   	   "Colors",
					   	   "Genders"];

var getBreeds_cat =   ["Saimese", 
					   "Tabi", 
					   "Sphnx"];

var getCoats_cat =   ["Bald",
					  "Short",
					  "Long", 
					  "Bushy"];

var getColors_cat =   ["Brown", 
					   "White", 
					   "Black",
					   "Orange",
					   "Grey"];

var getGenders_cat =   ["Male", 
					    "Female"];

// ++++++++++++++++++++ FISH setup ++++++++++++++++++++
var getAttributes_fish =   ["Breeds", 
					   	   "Colors",
					   	   "Genders"];

var getBreeds_fish =   ["Rex", 
					   "Lionhead", 
					   "Dutch"];

var getColors_fish =   ["Brown", 
					   	  "White", 
					   	  "Black",
					   	  "Grey"];

var getGenders_fish =   ["Male", 
					   	 "Female"];

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*
	getAnimalAttributesvalues is a mock up getter function that uses the 
	mock up arrays above. 

	(The real version of this function will NOT be as hard coded as this.)

	return: an array of attributes arrays for the specific animal
	example: [dogAttrArray, catAttrArray, fishAttrArray]
*/ 
var getAnimalAttributesValues = function(animalName){


	// if(animalName === "Dog"){
	// 	return [getBreeds_dog, getCoats_dog, getColors_dog, getGenders_dog];
	// } else if(animalName === "Cat"){
	// 	return [getBreeds_cat, getCoats_cat, getColors_cat, getGenders_cat];
	// } else if(animalName === "Fish"){
	// 	return [getBreeds_fish, getColors_fish, getGenders_fish];
	// } else {
	// 	console.log("invalid animalName: " + animalName);
	// 	return null;
	// }
}

/*
	getAnimalAttributes is a mock up getter function that uses the 
	mock up arrays above. 

	(The real version of this function will NOT be as hard coded as this.)

	return: an array of attributes for the specific animal
	example: [breeds, coats, colors, genders]
*/ 
var getAnimalAttributes = function(animalName){


	// if(animalName === "Dog"){
	// 	return getAttributes_dog;
	// } else if(animalName === "Cat"){
	// 	return getAttributes_cat;
	// } else if(animalName === "Fish"){
	// 	return getAttributes_fish;
	// } else {
	// 	console.log("invalid animalName: " + animalName);
	// 	return null;
	// }
}

/*
	setDropdown creates a select element in the HTML
	and the select is populated with option HTML elements
	made from the array param
*/ 
var setDropdown = function(dropdownEle, array){

	// clear dropdown
	while (dropdownEle.firstChild) {
		dropdownEle.removeChild(dropdownEle.firstChild);
	}

	// add inital option " - Select - "
	var unselectedOption = document.createElement('option');
	unselectedOption.value = 'unselected';
	unselectedOption.innerHTML = ' - Select - ';
	dropdownEle.append(unselectedOption);

	// add options from array
	for(var i = 0; i < array.length; i++) {
		var option = document.createElement('option');
		option.value = array[i];
		option.innerHTML = array[i];
		dropdownEle.append(option);
	}

}

var submitButtonHandler = function(){

}

window.addEventListener('DOMContentLoaded', function() {

	var animalDropdown = document.getElementById('animals');
	animalDropdown.required = true;

	petfinder_controller.returnAnimalType().then(arr=>{
		animals = arr;
		setDropdown(animalDropdown, animals);
	});

	var attributesView = document.getElementById('attributesView');
	var submitButton = document.getElementById('submitButton');

	animalDropdown.addEventListener("change", function() {
		while (attributesView.firstChild) {
		attributesView.removeChild(attributesView.firstChild);
		}

		console.log('You selected: ', this.value);

		var attributes, attributesValues;
		
		// var attributes = getAnimalAttributes(this.value);

		petfinder_controller.returnAnimalAttributes(this.value).then(arr=>{
			attributes = arr;
			attributes.shift(); //remove animal name itself from the attribute
			attributes.pop(); //remove animal link from the attribute **can be used if needed later

			attributesValues = [];
			petfinder_controller.returnAnimalAttributesObject(this.value).then(obj=>{
				attributes.forEach(function(s){
					attributesValues.push(obj[s]);
				})


				if(this.value !== "unselected"){
					for(var i = 0; i < attributesValues.length; i++) {
		
						var attributeSelect = document.createElement('select');
						attributeSelect.required = true;
		
						var label = document.createElement('label');
						label.innerHTML = attributes[i];
		
						attributesView.append(label);
						attributesView.append(attributeSelect);
						setDropdown(attributeSelect, attributesValues[i]);
					}
				}	

			});

		});


		// var attributesValues = getAnimalAttributesValues(this.value);




	});

	submitButton.addEventListener("click", submitButtonHandler);
});
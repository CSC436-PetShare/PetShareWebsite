import {petfinder_controller} from './petfinder.js';
import {initAdoptionResults} from './adoptionResults.js';


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++ testing arrays ++++++++++++++++++++++
var animals;
var limits;
var attributes;
var locations;

/*
	setDropdown creates a select element in the HTML
	and the select is populated with option HTML elementslocation
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

var submitButtonHandler = function(location,limit){
	if(attributes==null){
		return;
	}

	attributes.forEach(function(attr){
		//todo
		var select_attribute = document.getElementById(attr);
		if(attr === 'name'){
			if(select_attribute.value !== 'unselected'){
				petfinder_controller.settings('type',select_attribute.value);
			}
		}else{
			if(select_attribute.value !== 'unselected'){
				petfinder_controller.settings(attr,select_attribute.value);
			}
		}

	});
	
	if(location.length>0){
		petfinder_controller.settings('location', location);
	}

	if(limit!==undefined){
		petfinder_controller.settings('limit',limit);
	}
	
	petfinder_controller.find_pet().then(obj=>{
		if(obj!=null){
			var animal_obj = obj['animals'];
			console.log(animal_obj);
			animal_obj.sort(function(a, b) {
				return parseFloat(a.distance) - parseFloat(b.distance);
			});
			console.log(animal_obj);
			initAdoptionResults(animal_obj);

		}

	});

}

window.addEventListener('DOMContentLoaded', function() {
	var animalDropdown = document.getElementById('animals');
	animalDropdown.required = true;
	animalDropdown.id = "name";

	petfinder_controller.returnAnimalType().then(arr=>{
		animals = arr;
		setDropdown(animalDropdown, animals);
	});

	var limitDropdown = document.getElementById('limit');
	petfinder_controller.returnAvailableLimits().then(arr=>{
		limits = arr;
		setDropdown(limitDropdown, limits);
	});
	

	var attributesView = document.getElementById('attributesView');
	var locationInput = document.getElementById('location');
	var submitButton = document.getElementById('submitButton');

	//Sets the proper location when the textfield is changed
	//Sets the proper location when the textfield is changed
	var locationValue = "";
	locationInput.addEventListener("change", function(){
		locationValue = this.value;
	});

	var limitValue;
	limitDropdown.addEventListener("change", function(){
		limitValue = this.value;
	});

	animalDropdown.addEventListener("change", function() {
		
		while (attributesView.firstChild) {
		attributesView.removeChild(attributesView.firstChild);
		}

		console.log('You selected: ', this.value);

		var attributesValues;
		
		var animalName = this.value;

		petfinder_controller.returnAnimalAttributes(animalName).then(arr=>{
			attributes = arr;
			// attributes.shift(); //remove animal name itself from the attribute
			attributes.pop(); //remove animal link from the attribute **can be used if needed later

			attributesValues = [];
			petfinder_controller.returnAnimalAttributesObject(animalName).then(obj=>{
				attributes.forEach(function(index){
					if(index==='name'){
						return;
					}
					attributesValues.push(obj[index]);
				})


				if(this.value !== "unselected"){
					for(var i = 0; i < attributesValues.length; i++) {
		
						var attributeSelect = document.createElement('select');
						attributeSelect.required = true;
		
						var label = document.createElement('label');
						label.innerHTML = attributes[i+1];
		
						attributesView.append(label);
						attributesView.append(attributeSelect);
						attributeSelect.id = attributes[i+1];
						setDropdown(attributeSelect, attributesValues[i]);
					}
				}	

			});

		});

	});
	submitButton.addEventListener("click", function() {submitButtonHandler(locationValue,limitValue);});
});
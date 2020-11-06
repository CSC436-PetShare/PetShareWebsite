import {petfinder_controller} from './petfinder.js';

var locations;
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

window.addEventListener('DOMContentLoaded', function() {
	var locationDropdown = document.getElementById('location');
	petfinder_controller.returnAvailableStates().then(arr=>{
		locations = arr;
		setDropdown(locationDropdown, locations);
    })
    

    var locationValue = "";
    var view = document.getElementById('shelterView');
	locationDropdown.addEventListener("change", function(){
        locationValue = this.value;
        view.innerHTML = "";
        petfinder_controller.searchOrganization(locationValue).then(
            organizations =>{
                organizations.forEach(function(element){
                    view.innerHTML += element['name']+'<br>';
                });
            }
        );
	});

});
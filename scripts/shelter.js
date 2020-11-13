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

//This function renders each element of the array
var _render = function(search_result){
	var table = document.getElementById('shelterTable');
	var name = search_result['name'];
	var url = search_result['url'];

	var row = document.createElement("TR");
	table.appendChild(row);

	var t_name_data = document.createElement("TD");
	var t_name_data_text = document.createTextNode(name);
	t_name_data.appendChild(t_name_data_text);

	var t_url_data = document.createElement("TD");

	var a = document.createElement("a");
	a.href = url;
	var t_url_data_text = document.createTextNode("Click to Visit");
	a.appendChild(t_url_data_text);
	t_url_data.appendChild(a);

	row.appendChild(t_url_data);
	row.appendChild(t_name_data);
}


var set_up_table = function(){
	var view = document.getElementById('shelterView');
	view.innerHTML = "";
	var table = document.createElement("TABLE");
	table.setAttribute("id", "shelterTable");
	view.appendChild(table);
}

window.addEventListener('DOMContentLoaded', function() {
	var locationDropdown = document.getElementById('location');
	petfinder_controller.returnAvailableStates().then(arr=>{
		console.log(arr);
		locations = arr;
		setDropdown(locationDropdown, locations);
    })
    

    var locationValue = "";
    
	locationDropdown.addEventListener("change", function(){
        locationValue = this.value;
        
        petfinder_controller.searchOrganization(locationValue).then(
            organizations =>{
				set_up_table();
                organizations.forEach(function(element){
					_render(element);
                });
            }
        );
	});

});
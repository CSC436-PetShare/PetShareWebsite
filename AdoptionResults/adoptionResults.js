/*
	Usage: This javascript is used with Post.html to create a MVC structure
	Naming: m_ before a name means it is for the model
			g_ before a name means it is a global
			v_ before a name means it is for the view
			c_ before a name means it is for the controller
			_ before a name means it is a private field to the object
*/

var m_AdoptionPost = function() {
    var _name = "";
    var _breed = "";
    var _size = "";
    var _age = "";
    var _sex = "";
    var _image = "";
    var _status = "";
    var _description = "";
    var _link = "";

    return {

		construct: function(name, breed, size, age, sex, image, status, description, link) {
			_name = name;
			_breed = breed;
			_size = size;
			_age = age;
			_sex = sex;
			_image = image;
			_status = status;
			_description = description;
			_link = link;
		},

		getName: function() {
			return _name;
		},

		getBreed: function() {
			return _breed;
		},

		getSize: function() {
			return _size;
		},

		getAge: function() {
			return _age;
		},

		getSex: function() {
			return _sex;
		},

		getImage: function() {
			return _image;
		},

		getStatus: function() {
			return _status;
		},

		getDescription: function() {
			return _description;
		},

		getLink: function() {
			return _link;
		}
    }
}

var v_ResultView = function(dataArray, elmId) {
	var _dataArray = dataArray;
    var _elm = document.getElementById(elmId); // get the DOM node associated with the element

    var _render = function(list) {

		// clear before updating view
		while (_elm.firstChild) {
	    	_elm.removeChild(_elm.firstChild);
		}	

		// update view
		for(var i = 0; i < list.length; i++){

			var id = "adoptionpost" + i;
			// ---------- Create elements ----------
			var adoptionpost = document.createElement('div');
			adoptionpost.setAttribute('class', 'adoptionpost');
			adoptionpost.setAttribute('id', id);

			var row1_nameRow = document.createElement('div');
			var row2_fieldRow = document.createElement('div');
			var row3_imageContainerRow = document.createElement('div');
			var row4_descriptionRow = document.createElement('div');
			var row5_linkRow = document.createElement('div');

			var name = document.createElement('label');
			var breed = document.createElement('label');
			var size = document.createElement('label');
			var age = document.createElement('label');
			var sex = document.createElement('label');
			var image = document.createElement('img');
			var status = document.createElement('label');
			var description = document.createElement('p');
			var link = document.createElement('a');
			
			// ---------- set attributes ----------
			name.setAttribute('class', 'adoptionLabel');
			breed.setAttribute('class', 'adoptionLabel');
			size.setAttribute('class', 'adoptionLabel');
			age.setAttribute('class', 'adoptionLabel');
			sex.setAttribute('class', 'adoptionLabel');
			image.setAttribute('class', 'adoptionLabel');
			status.setAttribute('class', 'adoptionLabel');
			description.setAttribute('class', 'adoptionLabel');
			link.setAttribute('class', 'adoptionLabel');

			row1_nameRow.setAttribute('class', 'nameRow');
			row2_fieldRow.setAttribute('class', 'fieldRow');
			row3_imageContainerRow.setAttribute('class', 'imageContainerRow');
			row4_descriptionRow.setAttribute('class', 'descriptionRow');
			row5_linkRow.setAttribute('class', 'linkRow');
			
			// ---------- Set elements ----------
			name.innerHTML = list[i].getName();
			breed.innerHTML = list[i].getBreed();
			size.innerHTML = list[i].getSize();
			age.innerHTML = list[i].getAge();
			sex.innerHTML = list[i].getSex();
			image.src = list[i].getImage();
			status.innerHTML = list[i].getStatus();
			description.innerHTML = list[i].getDescription();
			link.href = list[i].getLink();
			
			// ---------- Arrange elements ----------
			row1_nameRow.append(name);

			row2_fieldRow.append(breed);
			row2_fieldRow.append(size);
			row2_fieldRow.append(age);
			row2_fieldRow.append(sex);
			row2_fieldRow.append(status);

			row3_imageContainerRow.append(image);

			row4_descriptionRow.append(description);

			row5_linkRow.append(link);

			adoptionpost.append(row1_nameRow);
			adoptionpost.append(row2_fieldRow);
			adoptionpost.append(row3_imageContainerRow);
			adoptionpost.append(row4_descriptionRow);
			adoptionpost.append(row5_linkRow);

			_elm.append(adoptionpost);
		}
    }

    return {
		// Public version of the render function. We need to access it to
		// register it with the model
		render: function() {
		    _render(_dataArray);
		}
    }
}

/*
use: 
	this function should be called in the submitButtonHandler in adopt.js

description: 
	initializes the model by creating a list of adoption results,
	then updates the view

view: the view is intended to be located in a div with id='resultView'
*/
var initAdoptionResults = function(dataArray) {
	var modelArray = [];

	// init the model
	for(var i = 0; i < dataArray.length; i++){
		var post = m_AdoptionPost();
		post.construct(
			dataArray[i].name,
			dataArray[i].breeds[0],
			dataArray[i].size,
			dataArray[i].age,
			dataArray[i].gender,
			dataArray[i].primary_photo_cropped.small,
			dataArray[i].status,
			dataArray[i].description,
			dataArray[i]._links[0]
			); 
		modelArray.push(post);
	}

	// update view
	v_ResultView(modelArray, 'resultView').render();
}

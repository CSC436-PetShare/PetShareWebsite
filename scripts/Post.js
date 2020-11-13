/*
	Usage: This javascript is used with home.html to create a MVC structure
*/
var globals = {
    signals: {
	post: 'POST'
    }
}

import {fb} from './firebaseInit.js'

var db = fb.database();
var storage = fb.storage();
var auth = fb.auth();


/*
object acting function: makeSignaller
param: none
create a array of _subscribers which is used as an event queue
*/
var makeSignaller = function() {
    var _subscribers = [];

    return {
	// Register a function with the notification system
	add: function(handlerFunction) { _subscribers.push(handlerFunction); },

	// Loop through all registered functions nad call them with passed
	// arguments
	notify: function(args) {
	    for (var i = 0; i < _subscribers.length; i++) {
		_subscribers[i](args);
	    }
	}
    };
}


var m_PostModel =  function() {
    var _observers = makeSignaller();  // To notify observers
 	var _postList = [];
 	
    return {
		// This member of the object, register, is a function that allows
		// observers to register/follow us.
		// handler: the function of the observer that should be called when we
		// update
		register: function(handler) {
		    // We add observers to our signaller with the signaller's add
		    // function
		    _observers.add(handler);
		},

		submitPost: async function(title, image) {
			if(image != null && title != "") {
				// Get a key for a new Post.
  				var newPostKey = db.ref().child('posts').push().key;
  				//upload file
				//TODO: remove spaces from image name
				var imageName = newPostKey + image.name;
				var blob = image.slice(0, image.size, 'image/png'); 
				var newFile = new File([blob], imageName + '.png', {type: 'image/png'});
				await storage.ref("images/" + imageName).put(newFile);
				await db.ref('posts/' + newPostKey).set({
					comments: {},
					image: imageName,
					title: title,
					upvotes: 0,
					user: auth.currentUser.uid
				});

				//Adds the post ot the users post list as well for profile information
				var userPostList;
				await db.ref('userPosts/' + auth.currentUser.uid).once('value').then(function(snapshot){
					userPostList = snapshot.val();
				});
				if(!userPostList) {
					userPostList = [];
					userPostList.push(newPostKey);
					await db.ref('userPosts/' + auth.currentUser.uid).set({
						postList: userPostList
					});
			
				}
				else {
					userPostList = Object.values(userPostList);
					userPostList = userPostList[0];
					userPostList.push(newPostKey);
					await db.ref('userPosts/' + auth.currentUser.uid).update({
						postList: userPostList
					});
				}
			}
			_observers.notify();
		},

		getData: async function() {
			//Read all the posts from the database
			var newList = [];
    		var query = db.ref('posts');
    		await query.once("value").then(function(snapshot) {
    			snapshot.forEach(function(childSnapshot) {
      			// key will be the unique key for each post
      			var key = childSnapshot.key;
      			/*array containing child data
      			index 0 = title
      			index 1 = image name
      			index 2 = comments
      			index 3 = upvotes
      			index 4 = user*/
      		
      		
      			var childData = [];
      			childData.push(childSnapshot.child("title").val());
      			childData.push(childSnapshot.child("image").val());
      			childData.push(childSnapshot.child("comments").val());
      			childData.push(childSnapshot.child("upvotes").val());
      			childData.push(childSnapshot.child("user").val());

    			newList.push(childData);
  				});
			}).then(() => {_postList = newList});
		},

		deletePost: function(index) {
			console.log("deleted post " + _postList[index]);
			_postList.splice(index, 1);
			_observers.notify();
		},

		getPostList: async function() {
			await this.getData();
			return _postList;
			
		}
    }
}

var v_PostsView = function(model, controller, elmId) {
    var _model = model; // internal handle to the model, though we could use the parameter as well
    var _elm = document.getElementById(elmId); // get the DOM node associated with the element
    var _controller = controller;

    var _getReference = async function (elm, imageName){
    	await storage.ref("images/" + imageName).getDownloadURL().then(function(url) {
       			elm.src = url;
			}).catch(function(error) {
			  switch (error.code) {
			    case 'storage/object-not-found':
			      // File doesn't exist
			      break;

			    case 'storage/unauthorized':
			      // User doesn't have permission to access the object
			      break;

			    case 'storage/canceled':
			      // User canceled the upload
			      break;
			    case 'storage/unknown':
			      // Unknown error occurred, inspect the server response
			      break;
			  }
			});
    }

    var _render = function(list) {
		// clear before updating view
		while (_elm.firstChild) {
		    _elm.removeChild(_elm.firstChild);
		}
		
		// update view
		for(var i = 0; i < list.length; i++){
			var post = document.createElement('div'); // Create new div
			var user = document.createElement('p');
			var title = document.createElement('p');
			var img = document.createElement('img');
			//Set User
			user.innerHTML = list[i][4];

			//Set title
			title.innerHTML = list[i][0];
			//Set image
			img.setAttribute('id', 'image' + i);
			_getReference(img, list[i][1]);		

			post.setAttribute('class', 'post');

			post.append(user);
			post.append(title);
			post.append(img);
			post.append(adoreButton);
			post.append(adoredLabel)
			post.append(commentsLabel);
			post.append(newComment);
			if(list[i][2] != null){
				//Create comments
				var comments = v_createComments(list[i][2]);
				post.append(comments);
			}

			//If the currentUser owns the post then add a delete button
			var userId = list[i][5];
			if(userId === auth.currentUser.uid){
				var removeButton = document.createElement('input');
				removeButton.type = "button";
				removeButton.value = "Remove"
				var currentImage = list[i][1];
				removeButton.setAttribute("class", list[i][7])
				removeButton.addEventListener('click', function() {
					var currentPost = this.getAttribute("class");
					_observers.notify({
		   				type: globals.signals.remove,
		    			image: currentImage,
		    			post: "posts/" + currentPost
					})
    			});
    			post.append(removeButton);
			}

		    _elm.append(post); // Add child to the parent element
		}
    }

    return {
		// Public version of the render function. We need to access it to
		// register it with the model
		render:async function() {
			var list = await _model.getPostList();
		    _render(list);
		}
    }
}

var v_submitPostButton = function(model, btn, textfield, imageField){
	var _model = model;
    var _btn = btn; // get the DOM node associated with the button
    var _textfield = textfield;

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
		_observers.notify({
		    type: globals.signals.post,
		    title: textfield.value,
		    image: imageField.files[0]
		})
		textfield.value = "";
		imageField.value = "";
    });

    return {
		// We add observers to our signaller with the signaller's add
		// function
		register: function(handler) {
		    _observers.add(handler);
		},

		render: function() {
			_btn.setAttribute('class', 'submitButton');
		}
    }
}


/*
object acting function: c_Controller
param: model
	the model
private function: dispatch(evt)
	does a switch case on the event and changes model accordingly
clears the model aka "Clear All Entries"
*/
var c_Controller = function(model) {
    var _model = model; // internal handle to the model
    // The returned object has one key: dispatch. This is a function that
    // takes a single parameter: evt
    //
    // evt in an object representing the information on the event that has occurred
    // Note because dispatch is a giant switch on evt.type, that means every
    // event object should have a "type" key.
    return {
	dispatch: function(evt) {
	    switch(evt.type) { // We will do something different depending on the event type
		case (globals.signals.post): // This is what we do for an increment event
		    _model.submitPost(evt.title, evt.image); // We just call the model's incrementing
		    break;
		default: // Unrecognized event or event not given
		    console.log('Uncrecognized event:', evt.type); // Print what the bad value is
	    }
	}
    }
}



// This event will trigger after the content is
// loaded so I will be sure all the HTML content exists
// Here is where we will create the object and wire them
window.addEventListener('DOMContentLoaded', function() {
    var theModel = m_PostModel(); // We have one model
    var theController = c_Controller(theModel);

    // We create views (and controls).
    var postView = v_PostsView(theModel, theController, 'postsView');

    var btn = document.getElementById("submitPostButton");
    var textField = document.getElementById("composePostField");
    var fileField = document.getElementById("fileField");
    var submitPostButton = v_submitPostButton(theModel, btn, textField, fileField);

    // Any view needs to register a function with the model that will cause
    // the view to update when the model does
    theModel.register(postView.render);
    theModel.register(submitPostButton.render);

    // Any view that has a control event will also need the controller to
    // register wtih it
    // <varname>.register(myController.dispatch)
    submitPostButton.register(theController.dispatch);

    // The views won't render until an update occurs, so we need to call them
    // once to display their default behavior
    postView.render();
    submitPostButton.render();

});

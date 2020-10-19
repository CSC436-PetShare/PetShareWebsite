/*
	Usage: This javascript is used with home.html to create a MVC structure
*/
var globals = {
    signals: {
	post: 'POST',
	comment: 'COMMENT',
	adore: 'ADORE',
	remove: 'REMOVE'
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
				//upload file
				//TODO: remove spaces from image name
				await storage.ref("images/" + image.name).put(image);
				// Get a key for a new Post.
  				var newPostKey = db.ref().child('posts').push().key;
				await db.ref('posts/' + newPostKey).set({
					comments: ['Lol so cute', 'same'],
					image: image.name,
					title: title,
					adoreCount: 0,
					adores: null,
					user: auth.currentUser
				});
			
			}
			_observers.notify();
		},

		getData: async function() {
			//Read all the posts from the database
			//return new Promise(async (resolve, reject) => {
			var newList = []
    		var query = db.ref('posts');
    		await query.once("value").then(function(snapshot) {
    			snapshot.forEach(function(childSnapshot) {
      			// key will be the unique key for each post
      			var key = childSnapshot.key;
      			/*
      			array containing child data
      			index 0 = title
      			index 1 = image name
      			index 2 = comments
      			index 3 = adoreCount
      			index 4 = adores
      			index 5 = user
      			index 6 = post
      			*/
      		
      		
      			var childData = []
      			childData.push(childSnapshot.child("title").val());
      			childData.push(childSnapshot.child("image").val());
      			childData.push(childSnapshot.child("comments").val());
      			childData.push(childSnapshot.child("adoreCount").val());
      			childData.push(childSnapshot.child("adores").val());
      			childData.push(childSnapshot.child("user").val());
      			childData.push(key);

      			newList.push(childData);
  				});
			}).then(() => {_postList = newList});
		},

		submitComment: async function(post, text, commentList) {
			console.log(post);
			console.log(text);
			console.log(commentList);
			commentList.push(text);
			db.ref("posts/" + post).update({
				comments: commentList
			});
			_observers.notify();
		},

		deletePost: function(index) {
			console.log("deleted post " + _postList[index]);
			_postList.splice(index, 1);
			_observers.notify();
		},

		removePost: function(post, image) {
			db.ref(post).remove();
			storage.ref("images/" + image.name).delete();
			_observers.notify();
		},

		toggleAdore: function (postRef, uid) {
 			postRef.transaction(function(post) {
    		if (post) {
      			if (post.adores && post.adores[uid]) {
        			post.adoreCount--;
        			post.adores[uid] = null;
      			} else {
        			post.adoreCount++;
        			if (!post.adores) {
          				post.adores = {};
        			}
        			post.adores[uid] = true;
      			}
    		}
    		_observers.notify();
  			});
		}

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
    var _observers = makeSignaller();

    //Gets the image reference
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
			var commentsLabel = document.createElement('label');
			var newComment = document.createElement('div');
			var commentBox = document.createElement('input');
			var submitComment = document.createElement('input');
			var adoredButton = document.createElement('input');
			var adoredLabel = document.createElement('label');

			//Set commentsLabel
			commentsLabel.innerHTML = "Comments:";
			//Set User
			user.innerHTML = list[i][5];
			//Set title
			title.innerHTML = list[i][0];
			//Set image
			img.setAttribute('id', 'image' + i);
			_getReference(img, list[i][1]);		
			//Create comments
			var comments = v_createComments(list[i][2]);
			//Set up newComment div
			commentBox.type = "text";
			submitComment.type = "button";
			submitComment.value = "Submit Comment";
			var commentList = list[i][2];
			var currentPost = list[i][6];
			//Add an event listen for the submitComment button to add comments
			submitComment.addEventListener('click', function() {
				_observers.notify({
		   			type: globals.signals.comment,
		    		text: auth.currentUser.displayName + ": " + commentBox.value,
		    		comments: commentList,
		    		post: currentPost
				})
				commentBox.value = "";
    		});
			newComment.append(commentBox);
			newComment.append(submitComment);

			//Create adored button and label
			adoreButton.type = "button";
			adoreButton.value = "Adored";
			adoredLabel.innerHTML = ": " + list[i][3];
			adoreButton.addEventListener('click', function() {
					_observers.notify({
		   				type: globals.signals.adore,
		    			postRef: db.ref("posts/" + list[i][6]),
		    			uid: list[i][5].uid
					})
    			});

			//Append elements to the post
			post.setAttribute('class', 'post');
			post.append(user);
			post.append(title);
			post.append(img);
			post.append(adoreButton);
			post.append(adoredLabel)
			post.append(commentsLabel);
			post.append(newComment);
			post.append(comments);

			//If the currentUser owns the post then add a delete button
			if(list[i][5].displayName === auth.currentUser.displayName){
				var removeButton = document.createElement('input');
				removeButton.type = "button";
				removeButton.value = "Remove"
				currentImage = list[i][1];
				removeButton.addEventListener('click', function() {
					_observers.notify({
		   				type: globals.signals.remove,
		    			image: currentImage,
		    			post: currentPost
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
		},
		register: function(handler) {
		    _observers.add(handler);
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

var v_createComments = function(comments) {
	var elm = document.createElement('div');
	for(var i = 0; i < comments.length; i++){
		var commentElm = document.createElement('div');
		var text = document.createElement('p');
		commentElm.setAttribute('class', 'comment');
		text.innerHTML = comments[i];
		commentElm.append(text);
		elm.append(commentElm);
	}
	return elm;
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
		case (globals.signals.post): 
		    _model.submitPost(evt.title, evt.image); 
		    break;
		case (globals.signals.comment):
		    _model.submitComment(evt.post, evt.text, evt.comments);
		    break;
		case (globals.signals.adore):
		    _model.toggleAdore(evt.postRef, evt.uid);
		    break;
		case (globals.signals.remove):
		    _model.removePost(evt.post, evt.image);
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
    postView.register(theController.dispatch);

    // The views won't render until an update occurs, so we need to call them
    // once to display their default behavior
    postView.render();
    submitPostButton.render();

});

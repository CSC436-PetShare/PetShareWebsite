/*
	Usage: This javascript is used with home.html to create a MVC structure.
	The features of this script include populating the home page with posts from users.
	Allowing users to make a new post with a description, image, and title.
	Allowing users to comment on each others posts and "adore" each other posts.
	Allowing users to remove their own posts.
*/

//Globals used for signals for events and the controller.
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

//Model to handle post information in both the webpage and firebase database
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
		//Submits a new post to the firebase database
		submitPost: async function(title, image) {
			if(image != null && title != "") {
				// Get a key for a new Post.
  				var newPostKey = db.ref().child('posts').push().key;
  				//upload file
				//TODO: remove spaces from image name
				var imageName = newPostKey + image.name.replaceAll(" ", "");
				var blob = image.slice(0, image.size, 'image/png'); 
				var newFile = new File([blob], imageName + '.png', {type: 'image/png'});
				await storage.ref("images/" + imageName).put(newFile);
				await db.ref('posts/' + newPostKey).set({
					comments: {},
					image: imageName,
					title: title,
					adoreCount: 0,
					adores: {},
					uid: auth.currentUser.uid,
					name: auth.currentUser.displayName
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
		//Gets post data from the firebase database
		getData: async function() {
			//Read all the posts from the database
			var newList = [];
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
      			index 5 = uid
      			index 6 = name
      			index 7 = post
      			*/
      		
      		
      			var childData = [];
      			childData.push(childSnapshot.child("title").val());
      			childData.push(childSnapshot.child("image").val());
      			childData.push(childSnapshot.child("comments").val());
      			childData.push(childSnapshot.child("adoreCount").val());
      			childData.push(childSnapshot.child("adores").val());
      			childData.push(childSnapshot.child("uid").val());
      			childData.push(childSnapshot.child("name").val());
      			childData.push(key);

    			newList.push(childData);
  				});
			}).then(() => {_postList = newList});
		},
		//Submits a comment to the post argument 
		submitComment: async function(post, text) {
			var commentList;
			await db.ref(post + "/comments").once('value').then(function(snapshot){
				commentList = snapshot.val();
			});
			if (commentList == null){
				commentList = [text];
			}
			else {
				commentList.push(text);
			}
			db.ref(post).update({
				comments: commentList
			});
			_observers.notify();
		},
		//Removes a post and its image
		removePost: async function(post, image) {

			var image;
			await db.ref(post).once('value').then(function(snapshot){
				image = snapshot.child("image").val();
			});

			storage.ref("images/" + image).delete(); //Delete the image in the firebase storage
			db.ref(post).remove(); //Remove post from posts in database

			//Delete the refrence to the post in userPosts
			var userPostList;
			await db.ref('userPosts/' + auth.currentUser.uid).once('value').then(function(snapshot){
				userPostList = snapshot.val();
			});
			userPostList = Object.values(userPostList);
			userPostList = userPostList[0];
			var indexToBeRemoved = userPostList.indexOf(post.substring(6)); //index of removed post reference
			userPostList.splice(indexToBeRemoved, 1); //Remove the post reference from the array
			await db.ref('userPosts/' + auth.currentUser.uid).update({
				postList: userPostList
			});
			_observers.notify();
		},
		//Add or subtracts adores for a post based on if the user has already adored or not
		toggleAdore: async function (post, uid) {
			var postRef = db.ref(post);
			//Get adoreCount and adoresList
			var adoreC;
			var adoresList;
			await db.ref(post + "/adoreCount").once('value').then(function(snapshot){
				adoreC = snapshot.val();
			});
			await db.ref(post + "/adores").once('value').then(function(snapshot){
				adoresList = snapshot.val();
			});
			//Add or subtract from the aodres list and adoresCount
  			if (adoresList && adoresList[uid]) {
    			adoreC--;
    			adoresList[uid] = null;
    			await postRef.update({
    				adoreCount: adoreC,
    				adores: adoresList
    			});
  			} else {
    			adoreC++;
    			if (!adoresList) {
      				adoresList = {};
    			}
    			adoresList[uid] = true;
    			await postRef.update({
    				adoreCount: adoreC,
    				adores: adoresList
    			});
  			}
		_observers.notify();
		},
		//Returns a a postlist which contains info on all the posts
		getPostList: async function() {
			await this.getData();
			return _postList;
			
		}
    }
}

//Creates a view which is populated by user posts
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
			var adoreButton = document.createElement('input');
			var adoredLabel = document.createElement('label');

			//Set commentsLabel
			commentsLabel.innerHTML = "Comments:";
			//Set User
			user.innerHTML = list[i][6];
			//Set title
			title.innerHTML = list[i][0];
			//Set image
			img.setAttribute('id', 'image' + i);
			_getReference(img, list[i][1]);		
			//Set up newComment div
			commentBox.type = "text";
			commentBox.setAttribute("id", "comBox" + list[i][7]);
			submitComment.type = "button";
			submitComment.value = "Submit Comment";

			//Add an event listen for the submitComment button to add comments
			submitComment.setAttribute("class", list[i][7])
			submitComment.addEventListener('click', function() {
				var currentPost = this.getAttribute("class");
				var comValue = document.getElementById("comBox" + currentPost).value;
				//console.log(currentPost);

				_observers.notify({
		   			type: globals.signals.comment,
		    		text: auth.currentUser.displayName + ": " + comValue,
		    		post: "posts/" + currentPost
				})
				commentBox.value = "";
    		});
			newComment.append(commentBox);
			newComment.append(submitComment);

			//Create adored button and label
			adoreButton.type = "button";
			adoreButton.value = "Adored";
			adoredLabel.innerHTML = ": " + list[i][3];
			adoreButton.setAttribute("class", list[i][7])
			adoreButton.addEventListener('click', function() {
				var currentPost = this.getAttribute("class");
				//console.log(currentPost);
					_observers.notify({
		   				type: globals.signals.adore,
		    			postRef: "posts/" + currentPost,
		    			uid: auth.currentUser.uid
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
			if(list[i][2] != null){
				//Create comments
				var comments = v_createComments(list[i][2]);
				post.append(comments);
			}

			//If the currentUser owns the post then add a remove button
			var userId = list[i][5];
			if(userId === auth.currentUser.uid){
				var removeButton = document.createElement('input');
				removeButton.type = "button";
				removeButton.value = "Remove"
				removeButton.setAttribute("class", list[i][7])
				removeButton.addEventListener('click', function() {
					var currentPost = this.getAttribute("class");
					_observers.notify({
		   				type: globals.signals.remove,
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
		},
		register: function(handler) {
		    _observers.add(handler);
		}
    }
}

//Creates a button that has an event listener to create an event with information about a post
//to be created
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

//Places all comments from the list parameter comments into divs and 
//returns an element containing them all
var v_createComments = function(comments) {
	if(comments === null){
		return;
	}
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
		    _model.submitComment(evt.post, evt.text);
		    break;
		case (globals.signals.adore):
		    _model.toggleAdore(evt.postRef, evt.uid);
		    break;
		case (globals.signals.remove):
		    _model.removePost(evt.post);
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

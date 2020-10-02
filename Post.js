/*
	Usage: This javascript is used with Post.html to create a MVC structure
*/
var globals = {
    signals: {
	post: 'POST'
    }
}

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


var m_PostModel = function() {
	// Set the configuration for your app
  	// TODO: Replace with your project's config object
 //  	var config = {
 //    	apiKey: "apiKey",
 //    	authDomain: "projectId.firebaseapp.com",
 //    	databaseURL: "https://petshare-92cfa.firebaseio.com/",
 //    	storageBucket: "gs://petshare-92cfa.appspot.com/"
 //  	};
 //  	firebase.initializeApp(config);
	// var db = firebase.database();

    var _observers = makeSignaller();  // To notify observers
 	var _postList = [];

 	//Read all the posts from the database
  //   var query = db.ref('posts');
  //   list.once("value").then(function(snapshot) {
  //   		snapshot.forEach(function(childSnapshot) {
  //     		// key will be the unique key for each post
  //     		var key = childSnapshot.key;
  //     		 array containing child data
  //     		*index 0 = title
  //     		*index 1 = image
  //     		*index 2 = comments
  //     		*index 3 = upvotes
  //     		*index 4 = user
      		
  //     		var childData = []
  //     		childData.push(childSnapshot.child("title").val());
  //     		childData.push(childSnapshot.child("image").val());
  //     		childData.push(childSnapshot.child("comments").val());
  //     		childData.push(childSnapshot.child("upvotes").val());
  //     		childData.push(childSnapshot.child("user").val());

  //     		_postList.push(childData);
  // 			});
		// });

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

		submitPost: function(title, image) {
			if(image != null && title != "") {
				// Get a key for a new Post.
  		// 		var newPostKey = db.ref().child('posts').push().key;
				// db.ref('posts/' + newPostKey).set({
				// 	comments: "",
				// 	image: image,
				// 	title: title,
				// 	upvotes: 0,
				// 	user: ""
				// });
				var _childData = [title, image, "", 0, ""];
				_postList.push(_childData);
			
			}
			_observers.notify();
		},

		deletePost: function(index) {
			console.log("deleted post " + _postList[index]);
			_postList.splice(index, 1);
			_observers.notify();
		},

		getPostList: function() {
			return _postList;
		}
    }
}

var v_PostsView = function(model, controller, elmId) {
    var _model = model; // internal handle to the model, though we could use the parameter as well
    var _elm = document.getElementById(elmId); // get the DOM node associated with the element
    var _controller = controller;

    var _render = function(list) {

		// clear before updating view
		while (_elm.firstChild) {
		    _elm.removeChild(_elm.firstChild);
		}

		// update view
		for(var i = 0; i < list.length; i++){
			var post = document.createElement('div'); // Create new div
			var title = document.createElement('p');
			var img = document.createElement('img');
			
			img.setAttribute('id', 'image' + i);
			img.file = list[i][1];
			title.innerHTML = list[i][0];
			post.setAttribute('class', 'post');

			post.append(title);
			post.append(img);
		    _elm.append(post); // Add child to the parent element

			var reader = new FileReader();
			reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    		reader.readAsDataURL(img.file);
		}
    }

    return {
		// Public version of the render function. We need to access it to
		// register it with the model
		render: function() {
		    _render(_model.getPostList());
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
		console.log("File added");
		textfield.value = "";
		imageField.files[0] = null;
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

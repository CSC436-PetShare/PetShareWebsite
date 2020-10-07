/*
	Usage: This javascript is used with Post.html to create a MVC structure
	Naming: m_ before a name means it is for the model
			v_ before a name means it is for the view
			c_ before a name means it is for the controller
			_ before a name means it is a private field to the object
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


var m_FeedModel = function() {
    var _observers = makeSignaller();  // To notify observers
    var _postList = []; // list of m_Post objects

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

		composePost: function(text) {
			var post = m_Post();
			post.setPostText(text);
			if(post.getPostText() != ""){
				_postList.push(post);
			}
			_observers.notify();
		},

		getPostList: function() {
			return _postList;
		}
    }
}

var m_Post = function() {
    var _observers = makeSignaller();  // To notify observers
    var _postText = ""; // post text
    var _likeStatus = false; // false: neutral, true: like

    var _commentList = [];

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

		setPostText: function(text) {
			_postText = text;
		},

		setLikeStatus: function(status) {
			_likeStatus = status;
		},

		getLikeStatus: function() {
			return _likeStatus;
		},

		getPostText: function() {
			return _postText;
		}
    }
}

var v_FeedView = function(model, elmId) {
    var _model = model; // internal handle to the model, though we could use the parameter as well
    var _elm = document.getElementById(elmId); // get the DOM node associated with the element

    var _render = function(list) {

		// clear before updating view
		while (_elm.firstChild) {
	    	_elm.removeChild(_elm.firstChild);
		}	

		console.log(list.length);
		// update view
		for(var i = 0; i < list.length; i++){

			// Create elements
			var post = document.createElement('div');
			var text = document.createElement('p');
			var comments = document.createElement('div');
			var likeStatus = document.createElement('label');

			// Set elements
			post.setAttribute('class', 'post');
			text.innerHTML = list[i].getPostText();
			likeStatus.innerHTML = list[i].getLikeStatus();

			// Arrange elements
			post.append(text);
			post.append(likeStatus);
			post.append(comments); // Work in progress
		    _elm.append(post); // Add child to the parent element
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

var v_submitPostButton = function(model, btn, textfield){
	var _model = model;
    var _btn = btn; // get the DOM node associated with the button
    var _textfield = textfield;

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
		_observers.notify({
		    type: globals.signals.post,
		    value: textfield.value
		})
		textfield.value = "";
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
		    _model.composePost(evt.value); // We just call the model's incrementing
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
    var theModel = m_FeedModel(); // We have one model
    var theController = c_Controller(theModel);

    // We create views (and controls). We can have many of them. We could also
    // quickly make duplicates. For example, you could add another div element to
    // your HTML and put another fancy view there OR you could make another
    // button in your HTML and have multiple increment buttons -- Try it!
    var postView = v_FeedView(theModel, 'FeedView');

    var btn = document.getElementById("submitPostButton");
    var textField = document.getElementById("composePostField");
    var submitPostButton = v_submitPostButton(theModel, btn, textField);

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

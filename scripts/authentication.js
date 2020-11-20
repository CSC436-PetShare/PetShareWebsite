//@Author: Eujin Ko
//  Handles authentication process using Firebase



/*********Alerts are presetted for testing purpose. Delete later for convenience*******/

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

var file = {
    signals: {
    sIn: 'SIGNIN',
    sOut: 'SIGNOUT',
    sInGoogle: 'SIGNINGOOGLE',
    sUp: 'SINGUP'

    }
}

import {fb} from './firebaseInit.js'


var auth = fb.auth();

// Add analytics if supported
// firebase.analytics.isSupported().then((isSupported)=>{
//     if(isSupported){
//         firebase.analytics();
//     }
// })

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

//Change 'home_url' to appropriate page later
const home_url = 'home.html';
auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      if(!checksIfVerified()){
        window.location.href = home_url;
      }else{
          alert("User hasn't been verified, please check your mail box!");
          signOut();
      }
    } else {
      // No user is signed in.
    }
  });


// Sign up with email & address
async function signUpWithEmailAndPassword(email, password, user){

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    if(user.includes(" ")) {
    	 alert("User name cannot have spaces");
    	 return;
    }
    await auth.createUserWithEmailAndPassword(email, password)
    .then(function(result){
    	var _user = "" + user;
        console.log(_user);
        result.user.updateProfile({
            displayName: _user 
        });
        result.user.sendVerifyEmail();
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        switch(error.code){
            case "auth/email-already-in-use":
                alert("Email Address already in use.");
                break;
            case "auth/invalid-email":
                alert("Invalid email address");
                break;
            case "auth/operation-not-allowed":
                alert("Registeration process escaped without finishing.");
                break;
            case "auth/weak-password":
                alert("Password should be longer than 6");
                break;
        }
      });
}

// Sign in with email & address if the user has verified with the actual email address
function signIn(email, password){

    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);

    auth.signInWithEmailAndPassword(email,password)
    .then(function(result){
        alert("Successfully logged in with "+email);
    })
    .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });

}

// Shows pop up which lets the user to sign in with google account
function signInGoogleAccount(){
    var provider = new fb.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
        alert("Successfully logged in with "+user);
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        alert(errorCode);
      });

}

// Sign out
function signOut(){
    auth.signOut();
    /*alert("signed out").catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });*/
}

//Returns current user info
function returnCurrentUser(){
    var user = firebase.auth().currentUser;
    if(user){
        // alert(user.email);
        return user;
    }else{
        alert("No user is signed in.");
        return undefined;
    }
}


// Sends an verification mail to the email account with a link
// *This function should be called after Sign up for new account
function sendVerifyEmail(){
    alert("Verification mail was sent! Please check your mailbox.");
    user = returnCurrentUser();
    user.sendEmailVerification();
}

//Checks if the current user is verified
function checksIfVerified(){
    var user = returnCurrentUser();
    if(user.emailVerified){
        alert("Verification on '"+user.email+"' was successful");
        return true;
    }
    return false;
}

//Controller to handle events sent by the buttons
var c_Controller = function(model) {
    return {
    dispatch: function(evt) {
        switch(evt.type) { // We will do something different depending on the event type
        case (file.signals.sIn):
            signIn(evt.email, evt.password); 
            break;
        case (file.signals.sOut):
            signOut();
            break;
        case (file.signals.sInGoogle):
            signInGoogleAccount();
            break;
        case (file.signals.sUp):
            signUpWithEmailAndPassword(evt.email, evt.password, evt.user);
            break;
        default: // Unrecognized event or event not given
            console.log('Uncrecognized event:', evt.type); // Print what the bad value is
        }
    }
    }
}

//Add button event listener for sign in button
var signInButton = function(btn, emailfield, passwordfield){
    var _btn = document.getElementById(btn); // get the DOM node associated with the button
    var _email = document.getElementById(emailfield);
    var _password = document.getElementById(passwordfield);

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
        _observers.notify({
            type: file.signals.sIn,
            email: _email.value,
            password: _password.value
        })

    });

    return {
        // We add observers to our signaller with the signaller's add
        // function
        register: function(handler) {
            _observers.add(handler);
        },

        render: function() {
            _btn.setAttribute('class', 'signInButton');
        }
    }
}

//Add event listener for sign out button
var signOutButton = function(btn){
    var _btn = document.getElementById(btn); // get the DOM node associated with the button

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
        _observers.notify({
            type: file.signals.sOut
        })
    });

    return {
        // We add observers to our signaller with the signaller's add
        // function
        register: function(handler) {
            _observers.add(handler);
        },

        render: function() {
            _btn.setAttribute('class', 'signInButton');
        }
    }
}

//Add event listener for sign in with google button
var signInWithGoogleButton = function(btn){

    var _btn = document.getElementById(btn); // get the DOM node associated with the button

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
        _observers.notify({
            type: file.signals.sInGoogle
        })
    });

    return {
        // We add observers to our signaller with the signaller's add
        // function
        register: function(handler) {
            _observers.add(handler);
        },

        render: function() {
            _btn.setAttribute('class', 'signInButton');
        }
    }
}

//Add event listener for sign in with google button
var signUpButton = function(btn, emailfield, passwordfield, userfield){
    var _btn = document.getElementById(btn); // get the DOM node associated with the button
    var _email = document.getElementById(emailfield);
    var _password = document.getElementById(passwordfield);
    var _user = document.getElementById(userfield);

    var _observers = makeSignaller();

    // event listener waiting for click of button
    _btn.addEventListener('click', function() {
        _observers.notify({
            type: file.signals.sUp,
            email: _email.value,
            password: _password.value,
            user: _user.value

        })
    });

    return {
        // We add observers to our signaller with the signaller's add
        // function
        register: function(handler) {
            _observers.add(handler);
        },

        render: function() {
            _btn.setAttribute('class', 'signInButton');
        }
    }
}
//Add event listeners instead of these globals
window.addEventListener('DOMContentLoaded', function() {
    //var theModel = m_AuthModel(); // We have one model
    var theController = c_Controller();


    var path = window.location.pathname;
    var page = path.split("/").pop();
    if(page != "SignUpPage.html") {
        var b_signInButton = signInButton("signInButn","email","password");
        var b_signOutButton = signOutButton("signOutButn");
        var b_signInWithGoogleButton = signInWithGoogleButton("signInGoogleButn");
        b_signInButton.register(theController.dispatch);
        b_signOutButton.register(theController.dispatch);
        b_signInWithGoogleButton.register(theController.dispatch);
    }
    else {
        var b_signUpButton = signUpButton("signUpButn","email","password", "userName");
        b_signUpButton.register(theController.dispatch);
    }
});

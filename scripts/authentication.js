//@Author: Eujin Ko
//  Handles authentication process using Firebase



/*********Alerts are presetted for testing purpose. Delete later for convenience*******/

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import {fb} from './firebaseInit.js'


var auth = fb.auth();

// Add analytics if supported
// firebase.analytics.isSupported().then((isSupported)=>{
//     if(isSupported){
//         firebase.analytics();
//     }
// })

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
function signUpWithEmailAndPassword(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

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
function signIn(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

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
    var provider = new firebase.auth.GoogleAuthProvider();

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


//Add event listeners instead of these globals
window.signIn = signIn;
window.signOut = signOut;
window.signInGoogleAccount = signInGoogleAccount;

//@Author: Eujin Ko
//  Handles authentication process using Firebase

// Set the configuration for your app
var config = {
    apiKey: "AIzaSyBq4vLcktzEWiKuyvAnDfSW6KivKVg6gag",
    authDomain: "petshare-92cfa.firebaseapp.com",
    databaseURL: "https://petshare-92cfa.firebaseio.com/",
    storageBucket: "gs://petshare-92cfa.appspot.com/"
};

firebase.initializeApp(config);


//Change 'home_url' to appropriate page later
const home_url = 'Home.html';
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      window.location.href = home_url;
      console.log("Log in successful");
    } else {
      // No user is signed in.
    }
  });


// Sign up with email & address
function signUpWithEmailAndPassword(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(){
        verifyEmail();
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

// Sign in with email & address
function signIn(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

    firebase.auth().signInWithEmailAndPassword(email,password)
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

    firebase.auth().signInWithPopup(provider).then(function(result) {
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
    firebase.auth().signOut();
    alert("signed out").catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
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
function verifyEmail(){
    var user = returnCurrentUser();
    if(user.emailVerified){
        alert("Verification on '"+user.email+"' was successful");
        return;
    }
    alert("Verification mail was sent! Please check your mailbox.");
    user.sendEmailVerification()
        .addOnCompleteListener((task)=>{
            //Show the page where it says
            alert("Verification on '"+user.email+"' was successful"); 
        });
}

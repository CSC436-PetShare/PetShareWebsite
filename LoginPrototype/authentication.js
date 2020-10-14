//@Author: Eujin Ko
//  Handles authentication process using Firebase


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBq4vLcktzEWiKuyvAnDfSW6KivKVg6gag",
    authDomain: "petshare-92cfa.firebaseapp.com",
    databaseURL: "https://petshare-92cfa.firebaseio.com",
    projectId: "petshare-92cfa",
    storageBucket: "petshare-92cfa.appspot.com",
    messagingSenderId: "596084775991",
    appId: "1:596084775991:web:496ca284a0c043476f73b2",
    measurementId: "G-VSQYLD75KR"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Add analytics if supported
// firebase.analytics.isSupported().then((isSupported)=>{
//     if(isSupported){
//         firebase.analytics();
//     }
// })

//Change 'home_url' to appropriate page later
const home_url = 'Home.html';
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      window.location.href = home_url;
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
        sendVerifyEmail();
        signOut();
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

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

    firebase.auth().signInWithEmailAndPassword(email,password)
    .then(function(result){
        if(checksIfVerified()){
            alert("Successfully logged in with "+email);
        }else{
            alert("User hasn't been verified yet, please check you mail box!");
            signOut();
        }
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

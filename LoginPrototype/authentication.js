//@Author: Eujin Ko
//  Handles authentication process using Firebase


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyB9G954YMLb1cdGKsq1PqsDwOqXvHa8zJg",
    authDomain: "fir-web-2fce3.firebaseapp.com",
    databaseURL: "https://fir-web-2fce3.firebaseio.com",
    projectId: "fir-web-2fce3",
    storageBucket: "fir-web-2fce3.appspot.com",
    messagingSenderId: "540433055144",
    appId: "1:540433055144:web:3713dce31512f4ad21b19d",
    measurementId: "G-1T4DYTXNQP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Add analytics if supported
// firebase.analytics.isSupported().then((isSupported)=>{
//     if(isSupported){
//         firebase.analytics();
//     }
// })




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

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    const promise = firebase.auth().signInWithEmailAndPassword(email,password)
    .then(function(result){
        returnLogInState();
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
        returnLogInState();
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

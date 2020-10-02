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
// firebase.analytics.isSupported().then((isSupported)=>{
//     if(isSupported){
//         firebase.analytics();
//     }
// })

// Sign up with email & address
function signUp(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
}

// Sign in with email & address
function signIn(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    const promise = firebase.auth().signInWithEmailAndPassword(email,password).catch(function(error) {
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
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        alert(errorCode.name);
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
        alert(user);
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
    user.sendEmailVerification()
        .addOnCompleteListener((task)=>{
            if(task.isSuccessful()){
                alert(user.name+" verified");
            }else{
                console.log('Verification failed');
            }
        });
}

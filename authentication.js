// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyBqxhuCQkX9KvTEs3zXB1SzIMweD839wBk",
    authDomain: "drawguessgame-19fe2.firebaseapp.com",
    databaseURL: "https://drawguessgame-19fe2.firebaseio.com",
    projectId: "drawguessgame-19fe2",
    storageBucket: "drawguessgame-19fe2.appspot.com",
    messagingSenderId: "322629283803",
    appId: "1:322629283803:web:bc1a2c299f7712b11041fe",
    measurementId: "G-514PLGHDBJ"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();


const auth = firebase.auth;

function signUp(){
    // var email = document.getElementById("email");
    // var password = document.getElementById("password");

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    const promise = auth.createUserWithEmailAndPassword("new@gmail.com","1asdk#$");

    promise.catch(e=>alert(e.message));
    alert("Signed Up");
}


function signIn(){
    // var email = document.getElementById("email");
    // var password = document.getElementById("password");

    // const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    const promise = auth.signInWithEmailAndPassword("new@gmail.com","1asdk#$");

    promise.catch(e=>alert(e.message));
    alert("Signed In "+"new@gmail.com");
}

function signOut(){
    auth.signOut();
    alert("signed out");
}

signUp();
signIn();
signOut;
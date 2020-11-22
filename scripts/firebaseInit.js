/*
	Usage: This javascript is to intitalize the firebase app 
	and send an instance of it to other files.
*/
var config = {
    apiKey: "AIzaSyBq4vLcktzEWiKuyvAnDfSW6KivKVg6gag",
    authDomain: "petshare-92cfa.firebaseapp.com",
    databaseURL: "https://petshare-92cfa.firebaseio.com/",
    storageBucket: "gs://petshare-92cfa.appspot.com/"
};

var fb = firebase.initializeApp(config);

export {fb};
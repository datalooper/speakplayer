/*
    Sample Module definition for Library module
*/

SpeakPlayer.module("Library", function(mod, App, Backbone, Marionette, $, _){
    // Private Data And Functions
    var privateData = "this is private data";

    var privateFunction = function(){
        console.log(privateData);
    }

    // Public Data And Functions
    mod.someData = "public data";

    mod.someFunction = function(){
        privateFunction();
        console.log(myModule.someData);
    }
});
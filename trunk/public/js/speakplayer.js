/**
 * Created by vcimo5 on 1/29/15.
 */

var SpeakPlayer = new Backbone.Marionette.Application();

/*
	Regions
*/
SpeakPlayer.addRegions({
	//Region: an object that manages an area where views are attached 
});

/*
*	Initializers are called when App starts
*/
SpeakPlayer.addInitializer(function(options) {
	//Library is defined as a module in js/modules. How is the 'class' accessed? 
  	SpeakPlayer.someModule = new Library(options);
});


/*
*	Initialization Events
*/
SpeakPlayer.on('initialize:before', function(options) {
  	//BEFORE INITIALIZTION
});

SpeakPlayer.on('initialize:after', function(options) {
  console.log('Initialization Finished');
});

SpeakPlayer.on('start', function(options) {
  Backbone.history.start(); // Great time to do this
});


 (function( $ ) {
    'use strict';

      $(function() {
          console.log("operating");
      });


})( jQuery );

//Start the application
App.start(options);
var Backbone = require('backbone'),
	wp = require('wp'),
	sui = require('sui-utils/sui'),
	Shortcodes = require('sui-collections/shortcodes');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			currentShortcode: null,
			action: 'select',
			search: null
		});

		this.props.on( 'change:action', this.refresh, this );

	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	search: function( searchTerm ) {
		var pattern = new RegExp( searchTerm, "gi" );
		var filteredModels = sui.shortcodes.filter( function( model ) {
			pattern.lastIndex = 0;
			return pattern.test( model.get( "label" ) );
		});
		return filteredModels;
	},

	insert: function() {
		var shortcode = this.props.get('currentShortcode');
		if ( shortcode ) {
			send_to_editor( shortcode.formatShortcode() );
			this.reset();
			this.frame.close();
		}
	},

	reset: function() {
		this.props.set( 'action', 'select' );
		this.props.set( 'currentShortcode', null );
		this.props.set( 'search', null );
	},

	setActionSelect: function() {
		this.attributes.title = shortcodeUIData.strings.media_frame_menu_insert_label;
		this.props.set( 'currentShortcode', null );
		this.props.set( 'action', 'select' );

		// Update menuItem text.
		var menuItem = this.frame.menu.get().get('shortcode-ui');
		menuItem.options.text = this.attributes.title;
		menuItem.render();

		this.frame.setState( 'shortcode-ui' );
		this.frame.render();
	},

	setActionUpdate: function( currentShortcode ) {

		this.attributes.title = shortcodeUIData.strings.media_frame_menu_update_label;
		this.attributes.title = this.attributes.title.replace( /%s/, currentShortcode.attributes.label );

		this.props.set( 'currentShortcode', currentShortcode );
		this.props.set( 'action', 'update' );

		// If a new frame is being created, it may not exist yet.
		// Defer to ensure it does.
		_.defer( function() {

			this.frame.setState( 'shortcode-ui' );
			this.frame.content.render();

			this.toggleSidebar( true );

			this.frame.once( 'close', function() {
				this.frame.mediaController.toggleSidebar( false );
			}.bind( this ) );

		}.bind( this ) );

	},

	toggleSidebar: function( show ) {
		this.frame.$el.toggleClass( 'hide-menu', show );
	},

});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;

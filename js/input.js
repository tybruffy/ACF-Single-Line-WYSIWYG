(function($){
	
	acf.fields.single_line_wysiwyg = acf.field.extend({
		
		type: 'single_line_wysiwyg',
		$el: null,
		$textarea: null,
		styles: {},
		
		actions: {
			'ready':		'initialize',
			'append':		'initialize',
			'remove':		'disable',
			'sortstart':	'disable',
			'sortstop':		'enable'
		},
		
		focus: function(){
			
			// get elements
			this.$el = this.$field.find('.acf-single-line-editor-wrap').last();
			this.$textarea = this.$el.find('textarea');
			
			// get options
			this.o = acf.get_data( this.$el );
			this.o.id = this.$textarea.attr('id');
			
		},
		
		initialize: function(){
			this.styles = this.$el.data("styles");
			this.height = this.$el.data("height");
			this.css    = this.$el.data("css");

			// bail early if no tinymce
			if( typeof tinyMCEPreInit === 'undefined' || typeof tinymce === 'undefined' ) {
				return false;
			}
			
			
			// vars
			var mceInit = this.get_mceInit(),
				qtInit = this.get_qtInit();
			
				
			// append settings
			tinyMCEPreInit.mceInit[ mceInit.id ] = mceInit;
			tinyMCEPreInit.qtInit[ qtInit.id ] = qtInit;
			
			
			// initialize mceInit
			if( this.$el.hasClass('tmce-active') ) {
				
				try {
					
					tinymce.init( mceInit );
					
				} catch(e){}
				
			}
			

			// initialize qtInit
			try {
			
				var qtag = quicktags( qtInit );
				
				this._buttonsInit( qtag );
				
			} catch(e){}
			
		},
		
		get_mceInit : function(){
			
			// reference
			var $field = this.$field;
				
			// vars
			var	mceInit = $.extend({}, tinyMCEPreInit.mceInit.acf_content);
			var plugins = mceInit["plugins"].split(",");
				plugins.splice(plugins.indexOf("wpautoresize"), 1);

			// Config
			mceInit["toolbar"]     = [this.styles, false, false, false];
			
			mceInit["plugins"]     = plugins.join(",");
			
			mceInit["min_height"]  = this.height;
			mceInit["height"]      = this.height;
			
			mceInit["resize"]      = false;
			mceInit["statusbar"]   = false;
			
			mceInit["content_css"] = mceInit["content_css"] + "," + this.css;

			
			// selector
			mceInit.selector = '#' + this.o.id;
			
			
			// id
			mceInit.id = this.o.id; // tinymce v4
			mceInit.elements = this.o.id; // tinymce v3
			
			// Tools
			
			// events
			if( tinymce.majorVersion < 4 ) {
				
				mceInit.setup = function( ed ){
					
					ed.onInit.add(function(ed, event) {


						// focus
						$(ed.getBody()).on('focus', function(){
					
							acf.validation.remove_error( $field );
							
						});
						
						$(ed.getBody()).on('blur', function(){
							
							// update the hidden textarea
							// - This fixes a bug when adding a taxonomy term as the form is not posted and the hidden textarea is never populated!
			
							// save to textarea	
							ed.save();
							
							
							// trigger change on textarea
							$field.find('textarea').trigger('change');
							
						});
					
					});
					
				};
			
			} else {
			
				mceInit.setup = function( ed ){

					ed.on('focus', function(e) {
				
						acf.validation.remove_error( $field );
						
					});
					
					ed.on('blur', function(e) {
						
						// update the hidden textarea
						// - This fixes a but when adding a taxonomy term as the form is not posted and the hidden textarea is never populated!
		
						// save to textarea	
						ed.save();
						
						
						// trigger change on textarea
						$field.find('textarea').trigger('change');
						
					});
					
				};
			
			}
			
			
			// hook for 3rd party customization
			mceInit = acf.apply_filters('wysiwyg_tinymce_settings', mceInit, mceInit.id);
			
			
      // prevent entering new line with ENTER key
      // based on: http://stackoverflow.com/questions/1831015/disableing-enter-return-key-from-within-tiny-mce
      mceInit.setup = function (ed) {
        ed.on('keydown', function(e) {
          if (e.keyCode == 13) {
            e.preventDefault();
          }
        });
      };

			// return
			return mceInit;
			
		},
		
		get_qtInit : function(){
				
			// vars
			var qtInit = $.extend({}, tinyMCEPreInit.qtInit.acf_content);
			
			
			// id
			qtInit.id = this.o.id;
			
			
			// hook for 3rd party customization
			qtInit = acf.apply_filters('wysiwyg_quicktags_settings', qtInit, qtInit.id);
			
			
			// return
			return qtInit;
			
		},
		
		/*
		*  disable
		*
		*  This function will disable the tinymce for a given field
		*  Note: txtarea_el is different from $textarea.val() and is the value that you see, not the value that you save.
		*        this allows text like <--more--> to wok instead of showing as an image when the tinymce is removed
		*
		*  @type	function
		*  @date	1/08/2014
		*  @since	5.0.0
		*
		*  @param	n/a
		*  @return	n/a
		*/
		
		disable: function(){
			
			try {
				
				// vars
				var ed = tinyMCE.get( this.o.id ),
					txtarea_el = tinyMCE.DOM.get( this.o.id );
					val = txtarea_el.value;
					
				
				// destory
				ed.destroy();
				
				
				// update value
				if( this.$field.find('.acf-single-line-editor-wrap').hasClass('html-active') ) {
				
					txtarea_el.value = val;
				
				}

				
			} catch(e) {}
			
		},
		
		enable: function(){
			
			// bail early if html mode
			if( this.$field.find('.acf-single-line-editor-wrap').hasClass('html-active') ) {
				
				return;
				
			}
			
			
			try {
				
				tinyMCE.init( tinyMCEPreInit.mceInit[ this.o.id ] );
				
			} catch(e) {}
			
			
		},
				
		/*
		*  _buttonsInit
		*
		*  This function will add the quicktags HTML to a WYSIWYG field. Normaly, this is added via quicktags on document ready,
		*  however, there is no support for 'append'. Source: wp-includes/js/quicktags.js:245
		*
		*  @type	function
		*  @date	1/08/2014
		*  @since	5.0.0
		*
		*  @param	ed (object) quicktag object
		*  @return	n/a
		*/
		
		_buttonsInit: function( ed ) {
			var defaults = ',strong,em,link,block,del,ins,img,ul,ol,li,code,more,close,';
	
			canvas = ed.canvas;
			name = ed.name;
			settings = ed.settings;
			html = '';
			theButtons = {};
			use = '';

			// set buttons
			if ( settings.buttons ) {
				use = ','+settings.buttons+',';
			}

			for ( i in edButtons ) {
				if ( !edButtons[i] ) {
					continue;
				}

				id = edButtons[i].id;
				if ( use && defaults.indexOf( ',' + id + ',' ) !== -1 && use.indexOf( ',' + id + ',' ) === -1 ) {
					continue;
				}

				if ( !edButtons[i].instance || edButtons[i].instance === inst ) {
					theButtons[id] = edButtons[i];

					if ( edButtons[i].html ) {
						html += edButtons[i].html(name + '_');
					}
				}
			}

			if ( use && use.indexOf(',fullscreen,') !== -1 ) {
				theButtons.fullscreen = new qt.FullscreenButton();
				html += theButtons.fullscreen.html(name + '_');
			}


			if ( 'rtl' === document.getElementsByTagName('html')[0].dir ) {
				theButtons.textdirection = new qt.TextDirectionButton();
				html += theButtons.textdirection.html(name + '_');
			}

			ed.toolbar.innerHTML = html;
			ed.theButtons = theButtons;
			
		},
		
	});
	

	$(document).ready(function(){
		
		// move acf_content wysiwyg
		if( $('#wp-acf_content-wrap').exists() ) {
			
			$('#wp-acf_content-wrap').parent().appendTo('body');
			
		}
		
	});


})(jQuery);

<?php

class acf_field_single_line_wysiwyg extends acf_field {
	
	/*
	*  __construct
	*
	*  This function will setup the field type data
	*
	*  @type	function
	*  @date	5/03/2014
	*  @since	5.0.0
	*
	*  @param	n/a
	*  @return	n/a
	*/
	
	function __construct() {
		$this->name     = 'single_line_wysiwyg';
		$this->label    = __('Single Line Wysiwyg', 'acf-single_line_wysiwyg');
		$this->category = 'content';

		// Defaults
		$this->defaults = array();
		$styles         = $this->get_styles("defaults");
		foreach ($styles as $style) {
			$this->defaults[ "allow_".$style["name"] ] = $style["default"];
		}
	
		// Filters
		add_filter("acf/single_line_wysiwyg/buttons", array($this, 'maybe_unlink_button'), 10, 2);

		// do not delete!
    	parent::__construct();
    	
	}
	
	
	/*
	*  render_field_settings()
	*
	*  Create extra settings for your field. These are visible when editing a field
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field (array) the $field being edited
	*  @return	n/a
	*/
	
	function render_field_settings( $field ) {
		
		// vars
		$styles = $this->get_styles("settings", $field);
		
		// default_value
		acf_render_field_setting( $field, array(
			'label'			=> __('Default Value','acf'),
			'instructions'	=> __('Appears when creating a new post','acf'),
			'type'			=> 'textarea',
			'name'			=> 'default_value',
		));

		foreach ($styles as $style) {
			acf_render_field_setting( $field, array(
				'label'			=> 'Allow ' . $style["label"],
				'instructions'	=> '',
				'type'			=> 'radio',
				'name'			=> 'allow_' . $style["name"],
				'layout'		=> 'horizontal',				
				'choices'		=> array(
					'1'			=> __('Yes','acf'),
					'0'			=> __('No','acf'),
				),
			));
		}


		
	}

	/**
	 * Gets an array of styles to allow or disallow in the single line editor.
	 * @return array An array of styles to allow or disallow.
	 */
   	function get_styles($filter, $field = false) {
   		
   		// vars
   		$styles = array(
			array(
				"name"  => "bold",
				"label" => "Bold",
				"default" => 0,
			),
			array(
				"name"  => "italic",
				"label" => "Italic",
				"default" => 1,
			),
			array(
				"name"  => "underline",
				"label" => "Underline",
				"default" => 0,
			),
			array(
				"name"  => "link",
				"label" => "Links",
				"default" => 1,
			),
			array(
				"name"    => "strikethrough",
				"label"   => "Strikethrough",
				"default" => 0,
			),
		);
		
		$styles = apply_filters("acf/single_line_wysiwyg/style_$filter", $styles, $field);
   		// return
	   	return $styles;
   	}	
	
	/*
	*  render_field()
	*
	*  Create the HTML interface for your field
	*
	*  @param	$field (array) the $field being rendered
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field (array) the $field being edited
	*  @return	n/a
	*/
	
	function render_field( $field ) {
		
		// enqueue
		acf_enqueue_uploader();
		
		// vars
		$id     = $field['id'] . '-' . uniqid();
		$height = apply_filters("acf/single_line_wysiwyg/height", 40, $field);
		
		// filter value for editor
		remove_all_filters( 'acf_the_editor_content' );
		add_filter('acf_the_editor_content', 'wp_richedit_pre');
		
		$field['value'] = apply_filters( 'acf_the_editor_content', $field['value'] );
		
		$styles  = $this->get_styles("render", $field);
		$buttons = array();
		foreach ($styles as $style) {
			if ($field["allow_" . $style["name"]]) {
				$buttons[] = $style["name"];
			}
		}

		$buttons = apply_filters("acf/single_line_wysiwyg/buttons", $buttons, $field);

		echo sprintf(
			'<div id="wp-%s-wrap" class="acf-single-line-wysiwyg-wrap wp-core-ui acf-single-line-editor-wrap tmce-active" data-styles="%s" data-height="%s" data-css="%s">
				<div id="wp-%s-editor-container" class="acf-single-line-editor-container">
					<textarea id="%s" class="acf-single-line-editor-area" name="%s" style="height:%s;">%s</textarea>
				</div>
			</div>',
			$id,
			implode(",", $buttons),
			$height,
			plugin_dir_url( __FILE__ ) . "css/content.css",
			$id,
			$id,
			$field['name'],
			$height,
			$field['value']
		);
				
	}
	
		
	/*
	*  input_admin_enqueue_scripts()
	*
	*  This action is called in the admin_enqueue_scripts action on the edit screen where your field is created.
	*  Use this action to add CSS + JavaScript to assist your render_field() action.
	*
	*  @type	action (admin_enqueue_scripts)
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	n/a
	*  @return	n/a
	*/
	
	function input_admin_enqueue_scripts() {
		$dir = plugin_dir_url( __FILE__ );
		
		// register & include JS
		wp_register_script( 'acf-input-single_line_wysiwyg', "{$dir}js/input.js" );
		wp_enqueue_script('acf-input-single_line_wysiwyg');
			
		// register & include CSS
		wp_register_style( 'acf-input-single_line_wysiwyg', "{$dir}css/input.css" ); 
		wp_enqueue_style('acf-input-single_line_wysiwyg');		
	}
	
	/*
	*  format_value()
	*
	*  This filter is appied to the $value after it is loaded from the db and before it is returned to the template
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value (mixed) the value which was loaded from the database
	*  @param	$post_id (mixed) the $post_id from which the value was loaded
	*  @param	$field (array) the field array holding all the field options
	*
	*  @return	$value (mixed) the modified value
	*/
			
	function format_value( $value, $post_id, $field ) {
		
		// bail early if no value
		if( empty($value) ) {
			return $value;
		}
		
		// apply filters
		$value = apply_filters( 'acf_the_content', $value );
		
		// follow the_content function in /wp-includes/post-template.php
		$value = str_replace(']]>', ']]&gt;', $value);
	
		return $value;
	}
		


	function maybe_unlink_button($buttons, $field) {

		if (in_array("link", $buttons)) {
			$buttons[] = "unlink";
		}

		return $buttons;
	}
	
}


// create field
new acf_field_single_line_wysiwyg();

?>

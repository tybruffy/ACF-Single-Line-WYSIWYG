# ACF Single Line WYSIWYG Field

An ACF field that creates a single line WYSIWYG field.  This is useful for things like headlines, where you may want to give authors the opportunity to italicize or bold text in the headline, but don't want to encourage adding a lot of content.

Currently, there are 5 styles that can be added to the field:
* Bold
* Italic
* Underline
* Links
* Strikethrough

You can control which of those elements are available in each field you create.

### Filters

There are a few filters available to manipulate the field options.

###### acf/single_line_wysiwyg/style_defaults
Use this filter to set the default field options.  i.e. Whether the default for Allow Bold is true or false.

###### acf/single_line_wysiwyg/style_settings
Use this filter to set whether or not a field shows up in the field settings page.  i.e. Prevent anyone from changing whether bold is an option on a field.

###### acf/single_line_wysiwyg/style_render
Use this filter to manually set which buttons are available when the field is actually rendered.  Useful if you want to programmatically add buttons.


###### acf/single_line_wysiwyg/height
Use this filter to override the height of the editor, return an integer.  By default the height is 40px.

### Compatibility

This ACF field type is compatible with:
* ACF 5

This plugins was created using the [Advanced Custom Fields field type template repository](https://github.com/elliotcondon/acf-field-type-template).  As such, there is a bunch of boilerplate code that is not currently used, including the ACF Version 4 code.

### Installation

1. Copy the `acf-single-line-wysiwyg` folder into your `wp-content/plugins` folder
2. Activate the Single Line WYSIWYG plugin via the plugins admin page
3. Create a new field via ACF and select the Single Line WYSIWYG type
4. Please refer to the description for more info regarding the field type settings

### Changelog
Please see `readme.txt` for changelog
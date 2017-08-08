/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.filebrowserUploadUrl="http://192.168.0.148:8080/enterpriseuniversity/services/file/editorUpload/editorImg";
	
	config.toolbarGroups = [
	                		{ name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
	                		{ name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
	                		{ name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
	                		{ name: 'forms', groups: [ 'forms' ] },
	                		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
	                		'/',
	                		{ name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
	                		{ name: 'links', groups: [ 'links' ] },
	                		{ name: 'insert', groups: [ 'insert' ] },
	                		'/',
	                		{ name: 'styles', groups: [ 'styles' ] },
	                		{ name: 'colors', groups: [ 'colors' ] },
	                		{ name: 'tools', groups: [ 'tools' ] },
	                		{ name: 'others', groups: [ 'others' ] }
	                	];

	config.removeButtons = 'Table,Source,Save,Templates,NewPage,Preview,Print,Scayt,Checkbox,Form,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Blockquote,CreateDiv,Language,Link,Unlink,Anchor,Flash,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,about';
};

CKEDITOR.on('dialogDefinition', function(ev) {
    var dd = ev.data.definition;

    if(ev.data.name == 'image') {
    dd.onShow = function () {
        var dialog = CKEDITOR.dialog.getCurrent(); 
        // make upload default tab
        this.selectPage('Upload');
        // hide unwanted tab
        dialog.hidePage( 'Link' ); 
        dialog.hidePage( 'advanced' ); 
        dialog.hidePage('info');

        var uploadTab = dd.getContents('Upload');
        var uploadButton = uploadTab.get('uploadButton');
        uploadButton['filebrowser']['onSelect'] = function( fileUrl, errorMessage ) {
        dialog.getContentElement('info', 'txtUrl').setValue(fileUrl);
        $(".cke_dialog_ui_button_ok span").click();
        }
    };
    }
})

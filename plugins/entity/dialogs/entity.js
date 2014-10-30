/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add( 'entityDialog', function( editor ) {
  return {

    title: 'Entity',
    minWidth: 400,
    minHeight: 200,

    // Dialog window content definition.
    contents: [
      {
        // Define entity tabs.
        // TODO: This should reflect enabled entities on the site.
        id: 'tab-entity',
        label: 'Entity',

        elements: [
          {
            // Input field for the entity.
            // TODO: Temporary; should be replaced by entity selector.
            type: 'text',
            id: 'entity-id',
            label: 'Entity',

            // Validate the field.
            validate: CKEDITOR.dialog.validate.notEmpty( "Entity field cannot be empty." )
          },
        ]
      }
    ],

    // Dialog confirmation handler.
    onOk: function() {

      // The context of this function is the dialog object itself.
      // http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
      var dialog = this;

    }
  };
});

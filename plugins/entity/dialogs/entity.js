/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function(editor) {

  entity_info = Drupal.settings.ts_ck_entity_embed.entity_info;

  tabs = [];

  if (entity_info) {

    for (var entity_name in entity_info) {

      var tab = {
        id: 'tab-' + entity_name,
        label: entity_name,

        elements: [
          {
            type: 'text',
            id: 'entity-' + entity_name + '-id',
            label: 'Select ' + entity_name,
          }
        ]
      };

      tabs.push(tab);

    }
  }

  console.log(tabs);

  return {

    title: 'Entity',
    minWidth: 400,
    minHeight: 200,

    // Dialog window content definition.
    contents: tabs,

    // Dialog confirmation handler.
    onOk: function() {

      // The context of this function is the dialog object itself.
      // http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
      var dialog = this;

    },
  };

});

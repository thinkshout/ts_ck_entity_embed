/**
 * Entity Embed plugin for CKEditor.
 */

CKEDITOR.plugins.add('entity', {

  // Register the icon.
  icons: 'entity',

  // Initialize the plugin.
  init: function (editor) {

    // Define the editor command to open a dialog window.
    editor.addCommand('entity', new CKEDITOR.dialogCommand('entityDialog'));

    // Create a toolbar button for the dialog window.
    editor.ui.addButton('Entity', {
      label: 'Insert Entity',
      command: 'entity',
      toolbar: 'insert'
    });

    // Register the file containing the dialog window code.
    CKEDITOR.dialog.add('entityDialog', this.path + 'dialogs/entity.js');

    TSCKEntityEmbedEntity.init(editor);
  }

});

var TSCKEntityEmbedEntity = {
  editors: [],
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntity.init = function (editor) {

    TSCKEntityEmbedEntity.editors.push(editor);

    TSCKEntityEmbedEntity.insertPreviewEntities(editor);

    var editor_element = $("#" + editor.name);
    var form = editor_element.closest("form");

    if (form) {
      form.on('submit', function (event) {

        for (var i = 0; i < TSCKEntityEmbedEntity.editors.length; i++) {

          var editor = TSCKEntityEmbedEntity.editors[i];

          var html = editor.getData();

          // Regex pattern to match entity type, ID and view mode
          // from HTML comment.
          var pattern = /<!-- ts_ck_entity_embed\|start\|(\w+)\|(\d+)\|(\w+) -->[\s\S]+?<!-- ts_ck_entity_embed\|end -->/;

          var html_parts = html.match(pattern);

          if (html_parts != null) {
            var token = TSCKEntityEmbedEntity.generateToken(html_parts[1], html_parts[2], html_parts[3]);

            html = html.replace(html_parts[0], token);

            // Update editor with tokenized entities prior to saving.
            editor.setData(html);
          }

        }

      });
    }

  },

    TSCKEntityEmbedEntity.insertPreviewEntities = function (editor) {

      var html = editor.getData();

      // Regex pattern to match entity tokens.
      var pattern = /\[ts_ck_entity_embed\|entity_type=\w+\|entity_id=\d+\|view_mode=\w+\]/;

      var matches = html.match(pattern);

      $.when(

          // TODO: Get HTML for each entity.

        ).then(function () {

          // TODO: Replace tokens with entity HTML.

        });

      editor.setData(html);

    },

    TSCKEntityEmbedEntity.insertEntityPreviewHtml = function (editor, entity_type, entity_id, view_mode) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode, function (data) {

        var element_id = 'entity-preview-' + entity_type + '-' + entity_id;

        var preview_html = '<!-- ts_ck_entity_embed|start|' + entity_type + '|' + entity_id + '|' + view_mode + ' -->' +
          '<div id="' + element_id + '" class="entity-preview" contenteditable="false">' + data + '</div>' +
          '<!-- ts_ck_entity_embed|end -->';

        editor.insertHtml(preview_html);

      });

    }

    TSCKEntityEmbedEntity.generateToken = function (entity_type, entity_id, view_mode) {

      return '[ts_ck_entity_embed|entity_type=' + entity_type + '|entity_id=' + entity_id + '|view_mode=' + view_mode + ']';

    }

});

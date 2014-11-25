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
  editor_token_counts: [],
  editor_entity_previews: [],
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntity.init = function (editor) {

    TSCKEntityEmbedEntity.editors.push(editor);

    TSCKEntityEmbedEntity.replaceTokens(editor);

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

    TSCKEntityEmbedEntity.replaceTokens = function (editor) {

      // Cache loaded entity previews.
      TSCKEntityEmbedEntity.editor_entity_previews[editor.id] = [];

      // Regex pattern to match entity tokens.
      var pattern = /\[ts_ck_entity_embed\|entity_type=\w+\|entity_id=\d+\|view_mode=\w+\]/g;

      var html = editor.getData();

      var matches = html.match(pattern);

      if (matches) {
        // Track token parsing progress.
        TSCKEntityEmbedEntity.editor_token_counts[editor.id] = [];
        TSCKEntityEmbedEntity.editor_token_counts[editor.id]['total'] = matches.length;
        TSCKEntityEmbedEntity.editor_token_counts[editor.id]['parsed'] = 0;

        for (var i = 0; i < matches.length; i++) {
          TSCKEntityEmbedEntity.cacheEntityTokenReplacement(editor, matches[i]);
        }
      }

    },

    TSCKEntityEmbedEntity.insertEntityPreviewHtml = function (editor, entity_type, entity_id, view_mode) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, data);

        editor.insertHtml(preview_html);

      });

    },

    TSCKEntityEmbedEntity.cacheEntityTokenReplacement = function (editor, token) {

      // Regex pattern to match entity token components.
      var token_pattern = /ts_ck_entity_embed\|entity_type=(\w+)\|entity_id=(\d+)\|view_mode=(\w+)/;

      var token_matches = token.match(token_pattern);

      var entity_type = token_matches[1];
      var entity_id = token_matches[2];
      var view_mode = token_matches[3];

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, data);

        var token = TSCKEntityEmbedEntity.generateToken(entity_type, entity_id, view_mode);

        TSCKEntityEmbedEntity.editor_entity_previews[editor.id][token] = preview_html

        TSCKEntityEmbedEntity.editor_token_counts[editor.id]['parsed']++;

        // Handle token replacement when all tokens have been parsed / cached.
        if (TSCKEntityEmbedEntity.editor_token_counts[editor.id]['parsed'] == TSCKEntityEmbedEntity.editor_token_counts[editor.id]['total']) {
          console.log("Parsed all token for editor ID: " + editor.id);

          // Replace all parsed tokens with preview HTML in the editor.
          var html = editor.getData();

          for (var token in TSCKEntityEmbedEntity.editor_entity_previews[editor.id]) {

            if (!TSCKEntityEmbedEntity.editor_entity_previews[editor.id].hasOwnProperty(token)) {
              continue;
            }

            html = html.replace(token, TSCKEntityEmbedEntity.editor_entity_previews[editor.id][token]);
          }

          editor.setData(html);
        }

      });

    },

    TSCKEntityEmbedEntity.generatePreviewHtml = function (entity_type, entity_id, view_mode, html) {

      var element_id = 'entity-preview-' + entity_type + '-' + entity_id;

      var preview_html = '<!-- ts_ck_entity_embed|start|' + entity_type + '|' + entity_id + '|' + view_mode + ' -->' +
        '<div id="' + element_id + '" class="entity-preview" contenteditable="false">' + html + '</div>' +
        '<!-- ts_ck_entity_embed|end -->';

      return preview_html;

    },

    TSCKEntityEmbedEntity.generateToken = function (entity_type, entity_id, view_mode) {

      return '[ts_ck_entity_embed|entity_type=' + entity_type + '|entity_id=' + entity_id + '|view_mode=' + view_mode + ']';

    }

});

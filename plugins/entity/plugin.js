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
  selected_element: null,
  selected_entity: null,
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntity.init = function (editor) {

    TSCKEntityEmbedEntity.editors.push(editor);

    TSCKEntityEmbedEntity.replaceTokens(editor);

    editor.on('doubleclick', function(evt) {

      var element = evt.data.element;
      var element_parents = element.getParents();

      if (element_parents) {
        for (var i = 0; i < element_parents.length; i++) {
          if (element_parents[i].hasClass('ts-ck-entity-embed-entity-preview')) {
            console.log('Double-clicked on an entity preview element.');

            // Cancel the event to prevent any default CKEditor behavior here.
            evt.cancel();

            TSCKEntityEmbedEntity.selected_element = element_parents[i];

            var element_id_parts = element_parents[i].getId().split('-');

            TSCKEntityEmbedEntity.selected_entity = {
              entity_type: element_id_parts[2],
              entity_id: element_id_parts[3],
              view_mode: element_id_parts[4],
              alignment: element_id_parts[5],
            };

            editor.execCommand('entity');

            continue;
          }
        }
      }

    }, null, null, 0);

    var editor_element = $("#" + editor.name);
    var form = editor_element.closest("form");

    if (form) {
      form.on('submit', function (event) {

        for (var i = 0; i < TSCKEntityEmbedEntity.editors.length; i++) {
          var editor = TSCKEntityEmbedEntity.editors[i];

          var elements = editor.document.$.getElementsByTagName("div");

          for (var j = 0; j < elements.length; j++) {
            var element = new CKEDITOR.dom.element(elements[j]);

            if (element.hasClass('ts-ck-entity-embed-entity-preview')) {
              var element_id = element.getId();
              var element_id_parts = element_id.split('-');

              var entity_type = element_id_parts[2];
              var entity_id = element_id_parts[3];
              var view_mode = element_id_parts[4];
              var alignment = element_id_parts[5];

              var token = TSCKEntityEmbedEntity.generateToken(entity_type, entity_id, view_mode, alignment);

              var token_element = CKEDITOR.dom.element.createFromHtml(token);

              token_element.insertAfter(element);

              element.remove();
            }
          }
        }

      });
    }

  },

    TSCKEntityEmbedEntity.replaceTokens = function (editor) {

      // Cache loaded entity previews.
      TSCKEntityEmbedEntity.editor_entity_previews[editor.id] = [];

      // Regex pattern to match entity tokens.
      var pattern = /\[ts_ck_entity_embed\|entity_type=\w+\|entity_id=\d+\|view_mode=\w+\|alignment=\w+\]/g;

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

    TSCKEntityEmbedEntity.insertEntityPreviewHtml = function (editor, entity_type, entity_id, view_mode, alignment) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        editor.insertHtml(preview_html);

        TSCKEntityEmbedEntity.prepareElements(editor);

      });

    },

    TSCKEntityEmbedEntity.replaceEntityPreviewHtml = function (editor, element, entity_type, entity_id, view_mode, alignment) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        var new_element = CKEDITOR.dom.element.createFromHtml(preview_html);

        new_element.replace(element);

        TSCKEntityEmbedEntity.prepareElements(editor);

      });

    },

    TSCKEntityEmbedEntity.cacheEntityTokenReplacement = function (editor, token) {

      // Regex pattern to match entity token components.
      var token_pattern = /ts_ck_entity_embed\|entity_type=(\w+)\|entity_id=(\d+)\|view_mode=(\w+)\|alignment=(\w+)/;

      var token_matches = token.match(token_pattern);

      var entity_type = token_matches[1];
      var entity_id = token_matches[2];
      var view_mode = token_matches[3];
      var alignment = token_matches[4];

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        var token = TSCKEntityEmbedEntity.generateToken(entity_type, entity_id, view_mode, alignment);

        TSCKEntityEmbedEntity.editor_entity_previews[editor.id][token] = preview_html;

        TSCKEntityEmbedEntity.editor_token_counts[editor.id]['parsed']++;

        // Handle token replacement when all tokens have been parsed / cached.
        if (TSCKEntityEmbedEntity.editor_token_counts[editor.id]['parsed'] == TSCKEntityEmbedEntity.editor_token_counts[editor.id]['total']) {
          console.log("Parsed all tokens for editor ID: " + editor.id);

          // Replace all parsed tokens with preview HTML in the editor.
          var html = editor.getData();

          for (var token in TSCKEntityEmbedEntity.editor_entity_previews[editor.id]) {
            if (!TSCKEntityEmbedEntity.editor_entity_previews[editor.id].hasOwnProperty(token)) {
              continue;
            }

            var regex_token = token.replace('\[', '\\[');
            regex_token = regex_token.replace('\]', '\\]');
            regex_token = regex_token.split('|').join('\\|');

            var regex = new RegExp(regex_token, 'g');

            var embedded_html = TSCKEntityEmbedEntity.editor_entity_previews[editor.id][token];

            embedded_html = embedded_html.replace(/srcset=/g, 'src=');

            html = html.replace(regex, embedded_html);
          }

          editor.setData(html, {
            callback: function() {
              if (this.checkDirty()) {
                console.log("Set updated HTML in editor.");

                TSCKEntityEmbedEntity.prepareElements(this);
              }
            }
          });
        }

      });

    },

    TSCKEntityEmbedEntity.generatePreviewHtml = function (entity_type, entity_id, view_mode, alignment, html) {

      var element_id = 'entity-preview-' + entity_type + '-' + entity_id + '-' + view_mode + '-' + alignment;

      var preview_html = '<div id="' + element_id + '" class="ts-ck-entity-embed-entity-preview">' + html + '</div>';

      return preview_html;

    },

    TSCKEntityEmbedEntity.generateToken = function (entity_type, entity_id, view_mode, alignment) {

      return '[ts_ck_entity_embed|entity_type=' + entity_type + '|entity_id=' + entity_id + '|view_mode=' + view_mode + '|alignment=' + alignment + ']';

    },

    TSCKEntityEmbedEntity.prepareElements = function (editor) {

      var elements = editor.document.$.getElementsByTagName("div");

      for (var i = 0; i < elements.length; i++) {
        var element = new CKEDITOR.dom.element(elements[i]);

        if (element.hasClass('ts-ck-entity-embed-entity-preview')) {
          element.setAttributes({
            contenteditable: 'false',
          });
        }
      }

    }

});

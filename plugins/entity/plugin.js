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

    editor.on('mode', function (event) {

      if (event.editor.mode == 'source') {
        console.log("Switched to source mode.");

        TSCKEntityEmbedEntity.insertTokensFromSource(event.editor);
      }
      else {
        console.log("Switched to HTML mode.");

        TSCKEntityEmbedEntity.replaceTokens(event.editor);
      }

    });

    // Register the file containing the dialog window code.
    CKEDITOR.dialog.add('entityDialog', this.path + 'dialogs/entity.js?v=' + Drupal.settings.cache_string);

    TSCKEntityEmbedEntity.init(editor);
  }

});

var TSCKEntityEmbedEntity = {
  editors: [],
  editor_token_counts: [],
  editor_entity_previews: [],
  selected_element: null,
  selected_entity: null
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntity.init = function (editor) {

    TSCKEntityEmbedEntity.editors.push(editor);

    editor.on('doubleclick', function (event) {

      var element = event.data.element;
      var element_parents = element.getParents();

      if (element_parents) {
        for (var i = 0; i < element_parents.length; i++) {
          if (element_parents[i].hasClass('ts-ck-entity-embed-entity-preview')) {
            console.log('Double-clicked on an entity preview element.');

            // Cancel the event to prevent any default CKEditor behavior here.
            event.cancel();

            TSCKEntityEmbedEntity.selected_element = element_parents[i];

            var element_id_parts = element_parents[i].getId().split('-');

            var entity_type = element_id_parts[2];
            var entity_id = element_id_parts[3];
            var view_mode = element_id_parts[4];
            var alignment = element_id_parts[5];

            TSCKEntityEmbedEntity.selectEntity(entity_type, entity_id, view_mode, alignment);

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

          TSCKEntityEmbedEntity.insertTokens(editor);
        }

      });
    }

  },

    TSCKEntityEmbedEntity.insertTokensFromSource = function (editor) {

      var html = editor.getData();

      var elements = $('<div/>').append(html);

      elements.find(".ts-ck-entity-embed-entity-preview").each(function () {

        var element_id_parts = $(this).attr("id").split('-');

        var entity_type = element_id_parts[2];
        var entity_id = element_id_parts[3];
        var view_mode = element_id_parts[4];
        var alignment = element_id_parts[5];

        var token = TSCKEntityEmbedEntity.generateToken(entity_type, entity_id, view_mode, alignment);

        $(this).replaceWith(token);

      });

      editor.setData(elements.text());

    },

    TSCKEntityEmbedEntity.insertTokens = function (editor) {

      console.log('TSCKEntityEmbedEntity.insertTokens');
      console.log(editor);

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

    },

    TSCKEntityEmbedEntity.replaceTokens = function (editor) {

      // Regex pattern to match entity tokens.
      var pattern = /\[ts_ck_entity_embed\|entity_type=\w+\|entity_id=\d+\|view_mode=\w+\|alignment=\w+\]/g;

      var html = editor.getData();

      var matches = html.match(pattern);

      if (matches) {
        var entity_data = [];

        // Regex pattern to match entity token components.
        var token_pattern = /ts_ck_entity_embed\|entity_type=(\w+)\|entity_id=(\d+)\|view_mode=(\w+)\|alignment=(\w+)/;

        for (var i = 0; i < matches.length; i++) {
          var token_matches = matches[i].match(token_pattern);

          entity_data.push(
            {
              entity_type: token_matches[1],
              entity_id: token_matches[2],
              view_mode: token_matches[3],
              alignment: token_matches[4]
            }
          );
        }

        $.get('/admin/ts_ck_entity_embed/render-multiple/' + JSON.stringify(entity_data), function (data) {

          if (data) {
            // Replace all parsed tokens with preview HTML in the editor.
            var entity_markup = JSON.parse(data);

            var html = editor.getData();

            for (var key in entity_markup) {
              var key_parts = key.split('|');

              var regex_token = '\\[ts_ck_entity_embed'
                + '\\|entity_type=' + key_parts[0]
                + '\\|entity_id=' + key_parts[1]
                + '\\|view_mode=' + key_parts[2]
                + '\\|alignment=' + key_parts[3]
                + '\\]';

              var regex = new RegExp(regex_token, 'g');

              var embedded_html = TSCKEntityEmbedEntity.generatePreviewHtml(key_parts[0], key_parts[1], key_parts[2], key_parts[3], entity_markup[key]);

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
      }

    },

    TSCKEntityEmbedEntity.insertEntityPreviewHtml = function (editor, entity_type, entity_id, view_mode, alignment) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        var p = new CKEDITOR.dom.element('p');
        var new_element = CKEDITOR.dom.element.createFromHtml(preview_html);

        new_element.appendTo(p);

        editor.insertElement(new_element);

        TSCKEntityEmbedEntity.prepareElements(editor);

      });

    },

    TSCKEntityEmbedEntity.replaceEntityPreviewHtml = function (editor, element, entity_type, entity_id, view_mode, alignment) {

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        var p = new CKEDITOR.dom.element('p');
        var new_element = CKEDITOR.dom.element.createFromHtml(preview_html);

        new_element.appendTo(p);

        p.replace(element);

        TSCKEntityEmbedEntity.prepareElements(editor);

      });

    },

    TSCKEntityEmbedEntity.removeEntityPreviewHtml = function (element) {

      element.remove();

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

    },

    TSCKEntityEmbedEntity.selectEntity = function (entity_type, entity_id, view_mode, alignment) {

      TSCKEntityEmbedEntity.selected_entity = {
        entity_type: entity_type,
        entity_id: entity_id,
        view_mode: view_mode,
        alignment: alignment,
      };

    }

});

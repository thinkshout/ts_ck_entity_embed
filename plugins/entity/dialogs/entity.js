/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function (editor) {

  entity_info = Drupal.settings.ts_ck_entity_embed.entity_info;

  tabs = [];

  if (entity_info) {

    for (var entity_type in entity_info) {

      var tab = {
        id: 'tab-' + entity_type,
        label: entity_type,

        elements: [
          {
            type: 'text',
            id: 'entity-' + entity_type + '-search',
            label: 'Find ' + entity_type,
          },
          {
            type: 'html',
            id: 'entity-' + entity_type + '-results',
            html:
              '<div id="entity-' + entity_type + '-preview" class="entity-preview">...' +
              '</div>' +
              '<div id="entity-' + entity_type + '-results">' +
              '<form id="entity-' + entity_type + '-results-list" class="entity-results-list">No results</form>' +
              '</div>',
          },
        ]
      };

      tabs.push(tab);

    }
  }

  return {

    title: 'Entity',
    minWidth: 640,
    minHeight: 360,

    // Dialog window content definition.
    contents: tabs,

    // Dialog load handler.
    onLoad: function () {

      TSCKEntityEmbedEntityDialog.init(editor);

    },

    // Dialog confirmation handler.
    onOk: function () {

      // The context of this function is the dialog object itself.
      // http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
      var dialog = this;

      TSCKEntityEmbedEntityDialog.insertSelectedEntity(editor);

    },
  };

});

var TSCKEntityEmbedEntityDialog = {
  editor: null,
  jQuery: null,
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntityDialog.init = function (editor) {

    TSCKEntityEmbedEntityDialog.editor = editor;
    TSCKEntityEmbedEntityDialog.jQuery = $;

    $(".cke_dialog_contents").find(".cke_dialog_page_contents").each(function (i) {

      var entity_type = $(this).attr("name").replace("tab-", "");

      $(this).find('.cke_dialog_ui_input_text').change(function () {

        if ($(this).val().length != 0) {
          $.get('/admin/ts_ck_entity_embed/entities/' + entity_type + '/' + $(this).val(), function (data) {

            TSCKEntityEmbedEntityDialog.populateResults(entity_type, data);

          });
        }

      });

    });

  },

    TSCKEntityEmbedEntityDialog.populateResults = function (entity_type, data) {

      var results_list_element = $('#entity-' + entity_type + '-results-list');

      if (data.length === 0) {
        results_list_element.html('No results');
      } else {
        results_list_element.html('');

        for (var i = 0; i < data.length; i++) {
          results_list_element.append(
            '<input type="radio" id="' + entity_type + '-' + data[i].id + '" name="entity" value="' + entity_type + '-' + data[i].id + '" />' +
            '<label for="' + entity_type + '-' + data[i].id + '">' + data[i].label + '</label>'
          );

          var result_element = $("#" + entity_type + "-" + data[i].id);

          result_element.click(function () {

            var id_parts = $(this).attr("id").split("-");
            var entity_type = id_parts[0];
            var entity_id = id_parts[1];

            TSCKEntityEmbedEntityDialog.selectEntity(entity_type, entity_id);

          });
        }
      }

    },

    TSCKEntityEmbedEntityDialog.selectEntity = function (entity_type, entity_id) {

      var results_list_element = $("#entity-" + entity_type + "-results-list");

      var results = results_list_element.find("li");

      for (var i = 0; i < results.length; i++) {

        var id_parts = $(results[i]).attr("id").split("-");

        if (id_parts[1] == entity_id) {
          $(results[i]).addClass("selected");
        } else {
          $(results[i]).removeClass("selected");
        }
      }

    },

    TSCKEntityEmbedEntityDialog.insertSelectedEntity = function (editor) {
      var selected = $(".cke_dialog_page_contents input[type=radio]:checked");

      if (selected) {
        var selected_value = selected.val();

        var value_parts = selected_value.split("-");
        var entity_type = value_parts[0];
        var entity_id = value_parts[1];
        // TODO: Replace with user-selected view mode.
        var view_mode = 'default';

        TSCKEntityEmbedEntity.insertEntityPreviewHtml(editor, entity_type, entity_id, view_mode);
      }

    }

});

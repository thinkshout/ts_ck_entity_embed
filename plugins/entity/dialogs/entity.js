/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function (editor) {

  entity_info = Drupal.settings.ts_ck_entity_embed.entity_info;

  tabs = [];

  if (entity_info) {

    for (var entity_type in entity_info) {

      var view_modes = entity_info[entity_type].view_modes;
      var view_mode_options = '';
      for (var i = 0; i < view_modes.length; i++) {
        view_mode_options += '<option value="' + view_modes[i] + '">' + view_modes[i] + '</option>'
      }

      var elements = [];

      if (entity_info[entity_type].view_name) {
        elements.push({
          type: 'html',
          id: 'entity-' + entity_type + '-results',
          html: '<iframe class="entity-browser" src="/admin/ts_ck_entity_embed/view/' + entity_info[entity_type].view_name + '"></iframe>',
        });
      }
      else {
        elements.push({
          type: 'text',
          id: 'entity-' + entity_type + '-search',
          label: 'Find ' + entity_type,
        });

        elements.push({
          type: 'html',
          id: 'entity-' + entity_type + '-results',
          html:
          '<div id="entity-' + entity_type + '-preview" class="entity-preview">' +
          '<label for="entity-view-mode-' + entity_type + '">View mode:</label>' +
          '<select id="entity-view-mode-' + entity_type + '" class="entity-view-mode-select">' + view_mode_options + '</select>' +
          '<label for="entity-align-' + entity_type + '">Align:</label>' +
          '<select id="entity-align-' + entity_type + '" class="entity-align-select">' +
          '<option value="left">Left</option>' +
          '<option value="right">Right</option>' +
          '<option value="center">Center</option>' +
          '</select>' +
          '<div class="preview-box"></div>' +
          '</div>' +
          '<div id="entity-' + entity_type + '-results">' +
          '<form id="entity-' + entity_type + '-results-list" class="entity-results-list">No results</form>' +
          '</div>',
        });
      }

      var tab = {
        id: 'tab-' + entity_type,
        label: entity_type,
        elements: elements,
      };

      tabs.push(tab);

    }
  }

  return {

    title: 'Entity',
    minWidth: 840,
    minHeight: 560,

    // Dialog window content definition.
    contents: tabs,

    // Dialog load handler.
    onLoad: function () {

      TSCKEntityEmbedEntityDialog.init(editor);

    },

    onShow: function () {

      TSCKEntityEmbedEntityDialog.refresh();

    },

    // Dialog confirmation handler.
    onOk: function () {

      TSCKEntityEmbedEntityDialog.insertSelectedEntity(editor);

    }

  };

});

var TSCKEntityEmbedEntityDialog = {
  editor: null,
  jQuery: null,
  selected_entity: null,
  selected_element: null,
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntityDialog.init = function (editor) {

    TSCKEntityEmbedEntityDialog.editor = editor;
    TSCKEntityEmbedEntityDialog.jQuery = $;

    $(".cke_dialog_contents").find(".cke_dialog_page_contents").each(function (i) {

      var entity_type = $(this).attr("name").replace("tab-", "");

      $(this).find('.cke_dialog_ui_input_text').keypress(function () {

        if ($(this).val().length != 0) {
          $.get('/admin/ts_ck_entity_embed/entities/' + entity_type + '/' + $(this).val(), function (data) {

            TSCKEntityEmbedEntityDialog.populateResults(entity_type, data);

          });
        }

      });

    });

    $(".entity-view-mode-select").change(function () {

      if (TSCKEntityEmbedEntity.selected_entity != null) {
        TSCKEntityEmbedEntity.selected_entity.view_mode = $(this).val();
        TSCKEntityEmbedEntityDialog.refresh();
      }

    });

    $(".entity-align-select").change(function () {

      if (TSCKEntityEmbedEntity.selected_entity != null) {
        TSCKEntityEmbedEntity.selected_entity.alignment = $(this).val();
        TSCKEntityEmbedEntityDialog.refresh();
      }

    });

  },

    TSCKEntityEmbedEntityDialog.refresh = function () {

      if (TSCKEntityEmbedEntity.selected_entity !== null) {
        console.log('Editing existing entity:');
        console.log(TSCKEntityEmbedEntity.selected_entity);

        var selected = TSCKEntityEmbedEntity.selected_entity;

        TSCKEntityEmbedEntity.updateEntityPreview(selected.entity_type, selected.entity_id, selected.view_mode, selected.alignment);
      }

    }

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

      var selected = $(".cke_dialog_page_contents input[type=radio]:checked");

      if (selected) {
        var selected_value = selected.val();

        var value_parts = selected_value.split("-");
        var entity_type = value_parts[0];
        var entity_id = value_parts[1];
        var view_mode = $("#entity-view-mode-" + entity_type).val();
        var alignment = $("#entity-align-" + entity_type).val();

        TSCKEntityEmbedEntity.updateEntityPreview(entity_type, entity_id, view_mode, alignment);

        TSCKEntityEmbedEntity.selected_entity = {
          entity_type: entity_type,
          entity_id: entity_id,
          view_mode: view_mode,
          alignment: alignment,
        };
      }

    },

    TSCKEntityEmbedEntityDialog.insertSelectedEntity = function (editor) {

      var selected = TSCKEntityEmbedEntity.selected_entity;

      if (selected) {
        if (TSCKEntityEmbedEntity.selected_element !== null) {
          TSCKEntityEmbedEntity.replaceEntityPreviewHtml(editor, TSCKEntityEmbedEntity.selected_element, selected.entity_type, selected.entity_id, selected.view_mode, selected.alignment);
        }
        else {
          TSCKEntityEmbedEntity.insertEntityPreviewHtml(editor, selected.entity_type, selected.entity_id, selected.view_mode, selected.alignment);
        }
      }

      TSCKEntityEmbedEntity.selected_element = null;
      TSCKEntityEmbedEntity.selected_entity = null;

    },

    TSCKEntityEmbedEntity.updateEntityPreview = function (entity_type, entity_id, view_mode, alignment) {

      $("#entity-view-mode-" + entity_type).val(view_mode);
      $("#entity-align-" + entity_type).val(alignment);

      $.get('/admin/ts_ck_entity_embed/render/' + entity_type + '/' + entity_id + '/' + view_mode + '/' + alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(entity_type, entity_id, view_mode, alignment, data);

        $('.entity-preview .preview-box').html(preview_html);

      });

    }

});

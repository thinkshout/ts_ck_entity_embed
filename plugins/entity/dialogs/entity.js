/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function (editor) {

  base_path = Drupal.settings.ts_ck_entity_embed.base_path;
  entity_info = Drupal.settings.ts_ck_entity_embed.entity_info;

  tabs = [];
  buttons = [
    CKEDITOR.dialog.cancelButton,
    CKEDITOR.dialog.okButton,
  ];

  entity_browsers = [];
  entity_search_boxes = [];

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
          id: 'entity-' + entity_type + '-browser',
          html: '<iframe class="entity-browser" data-type="' + entity_type + '" src="/admin/ts_ck_entity_embed/view/' + entity_info[entity_type].view_name + '"></iframe>',
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
            '</div>' +
            '<div id="entity-' + entity_type + '-results">' +
            '<form id="entity-' + entity_type + '-results-list" class="entity-results-list">No results</form>' +
            '</div>',
        });
      }

      elements.push({
        type: 'html',
        id: 'entity-preview',
        html:
          '<div id="entity-preview">' +
          '<label for="entity-view-mode-' + entity_type + '">View mode:</label>' +
          '<select id="entity-view-mode-' + entity_type + '" class="entity-view-mode-select">' + view_mode_options + '</select>' +
          '<label for="entity-align-' + entity_type + '">Align:</label>' +
          '<select id="entity-align-' + entity_type + '" class="entity-align-select">' +
          '<option value="left">Left</option>' +
          '<option value="right">Right</option>' +
          '<option value="center">Center</option>' +
          '</select>' +
          '<div class="preview-box"></div>' +
          '</div>',
      });

      var tab = {
        id: 'tab-' + entity_type,
        label: entity_type,
        elements: elements,
      };

      tabs.push(tab);

      var next_button = {
        id: 'entity embed next',
        type: 'button',
        label: 'Next',
        title: 'Configure embedded entity',
        accessKey: 'N',
        disabled: false,
        onClick: function()
        {
          TSCKEntityEmbedEntityDialog.showPreview();
        }
      }

      buttons.push(next_button);

      var back_button = {
        id: 'entity embed back',
        type: 'button',
        label: 'Back',
        title: 'Select embedded entity',
        accessKey: 'B',
        disabled: false,
        onClick: function()
        {
          TSCKEntityEmbedEntityDialog.showEntitySearch();
        }
      }

      buttons.push(back_button);

    }

  }

  return {

    title: 'Entity',
    minWidth: 840,
    minHeight: 560,

    // Dialog window content definition.
    contents: tabs,

    buttons: buttons,

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

    // Load entity browser.
    $.getScript('/' + base_path + '/includes/ts_ck_entity_embed_browser.js').done(function (script, textStatus) {

      console.log("Entity browser script loaded.");

      // Set up load handlers for iframe entity browsers.
      $('.entity-browser').load(function() {

        console.log("Entity browser content loaded.");

        var entity_browser = new TSCKEntityEmbedEntityBrowser($, $(this));
        entity_browser.init();
        entity_browser.refresh();
        entity_browsers.push(entity_browser);

      });

    })
      .fail(function (jqxhr, settings, exception) {

      console.log("Failed to load entity browser script.");

    });

    // Load entity search box.
    $.getScript('/' + base_path + '/includes/ts_ck_entity_embed_search_box.js').done(function (script, textStatus) {

      console.log("Entity search box script loaded.");

      $(".cke_dialog_contents").find(".cke_dialog_page_contents").each(function (i) {

        var entity_type = $(this).attr("name").replace("tab-", "");
        var search_element = $(this).find('.cke_dialog_ui_input_text');
        var results_element = $('#entity-' + entity_type + '-results-list');

        var entity_search_box = new TSCKEntityEmbedEntitySearchBox($, entity_type, search_element, results_element);
        entity_search_box.init();
        entity_search_boxes.push(entity_search_box);

      });

    })
      .fail(function (jqxhr, settings, exception) {

        console.log("Failed to load entity search box script.");

      });

    $(".entity-view-mode-select").change(function () {

      if (TSCKEntityEmbedEntity.selected_entity != null) {
        TSCKEntityEmbedEntity.selected_entity.view_mode = $(this).val();
      }

    });

    $(".entity-align-select").change(function () {

      if (TSCKEntityEmbedEntity.selected_entity != null) {
        TSCKEntityEmbedEntity.selected_entity.alignment = $(this).val();
      }

    });

    TSCKEntityEmbedEntityDialog.showEntitySearch();

  },

    TSCKEntityEmbedEntityDialog.showEntitySearch = function () {

      var dialog_sections = $(".cke_dialog_page_contents").find(".cke_dialog_ui_vbox_child");

      $(dialog_sections[0]).show();
      $(dialog_sections[1]).hide();

    },

    TSCKEntityEmbedEntityDialog.showPreview = function () {

      var dialog_sections = $(".cke_dialog_page_contents").find(".cke_dialog_ui_vbox_child");

      $(dialog_sections[0]).hide();
      $(dialog_sections[1]).show();

    },

    TSCKEntityEmbedEntityDialog.refreshPreview = function () {

      var selected = TSCKEntityEmbedEntity.selected_entity;

      $("#entity-view-mode-" + selected.entity_type).val(selected.view_mode);
      $("#entity-align-" + selected.entity_type).val(selected.alignment);

      $.get('/admin/ts_ck_entity_embed/render/' + selected.entity_type + '/' + selected.entity_id + '/' + selected.view_mode + '/' + selected.alignment, function (data) {

        var preview_html = TSCKEntityEmbedEntity.generatePreviewHtml(selected.entity_type, selected.entity_id, selected.view_mode, selected.alignment, data);

        $('.entity-preview .preview-box').html(preview_html);

      });

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

    }

});

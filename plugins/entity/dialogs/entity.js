/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function (editor) {

  base_path = Drupal.settings.ts_ck_entity_embed.base_path;
  entity_info = Drupal.settings.ts_ck_entity_embed.entity_info;

  tabs = [];
  buttons = [];

  var next_button = {
    id: 'next',
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
    id: 'back',
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

  var remove_button = {
    id: 'remove',
    type: 'button',
    label: 'Remove',
    title: 'Remove embedded entity',
    accessKey: 'R',
    disabled: false,
    onClick: function()
    {
      TSCKEntityEmbedEntityDialog.removeEntity();
    }
  }

  buttons.push(remove_button);

  buttons.push(CKEDITOR.dialog.cancelButton);
  buttons.push(CKEDITOR.dialog.okButton);

  entity_browsers = [];
  entity_search_boxes = [];
  entity_preview = null;

  if (entity_info) {

    for (var entity_type in entity_info) {

      var elements = [];

      if (entity_info[entity_type].view_name) {
        elements.push({
          type: 'html',
          id: 'entity-' + entity_type + '-browser',
          html: '<iframe class="ts-ck-entity-embed-entity-browser" data-type="' + entity_type + '" src="/admin/ts_ck_entity_embed/view/' + entity_info[entity_type].view_name + '"></iframe>',
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
            '<div id="entity-' + entity_type + '-results">' +
            '<form id="entity-' + entity_type + '-results-list" class="ts-ck-entity-embed-entity-results-list">No results</form>' +
            '</div>',
        });
      }

      if (entity_info[entity_type].tab_label) {
        var tab_label = entity_info[entity_type].tab_label;
      }
      else {
        var tab_label = entity_type;
      }

      var tab = {
        id: 'tab-' + entity_type,
        label: tab_label,
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

    buttons: buttons,

    // Dialog load handler.
    onLoad: function () {

      TSCKEntityEmbedEntityDialog.init(editor);

    },

    onShow: function () {

      TSCKEntityEmbedEntityDialog.refresh(editor);

    },

    // Dialog confirmation handler.
    onOk: function () {

      TSCKEntityEmbedEntityDialog.insertSelectedEntity(editor);

    },

    onCancel: function () {

      TSCKEntityEmbedEntityDialog.reset();

    }

  };

});

var TSCKEntityEmbedEntityDialog = {
  editor: null,
  dialog: null,
  jQuery: null,
  selected_entity: null,
  selected_element: null,
};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntityDialog.init = function (editor) {

    TSCKEntityEmbedEntityDialog.editor = editor;
    TSCKEntityEmbedEntityDialog.dialog = CKEDITOR.dialog.getCurrent();

    // Load entity browser.
    $.getScript('/' + base_path + '/includes/ts_ck_entity_embed_browser.js?' + Drupal.settings.cache_string).done(function (script, textStatus) {

      console.log("Entity browser script loaded.");

      // Set up load handlers for iframe entity browsers.
      $('.ts-ck-entity-embed-entity-browser').load(function() {

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
    $.getScript('/' + base_path + '/includes/ts_ck_entity_embed_search_box.js?' + Drupal.settings.cache_string).done(function (script, textStatus) {

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

    TSCKEntityEmbedEntityDialog.dialog.disableButton('ok');
    TSCKEntityEmbedEntityDialog.dialog.disableButton('next');
    TSCKEntityEmbedEntityDialog.dialog.disableButton('back');
    TSCKEntityEmbedEntityDialog.dialog.disableButton('remove');

    $.getScript('/' + base_path + '/includes/ts_ck_entity_embed_preview.js?' + Drupal.settings.cache_string).done(function (script, textStatus) {

      console.log("Entity preview script loaded.");

      TSCKEntityEmbedEntityDialog.createEntityPreview();
      TSCKEntityEmbedEntityDialog.hidePreview();

      entity_preview = new TSCKEntityEmbedEntityPreview($, $('#ts-ck-entity-embed-preview-box'));
      entity_preview.init();

      TSCKEntityEmbedEntityDialog.refresh(TSCKEntityEmbedEntityDialog.editor);

    })
      .fail(function (jqxhr, settings, exception) {

        console.log("Failed to load entity preview script.");

      });

  },

    TSCKEntityEmbedEntityDialog.refresh = function (editor) {

      if (editor != null) {
        console.log("Refreshing editor: " + editor.name);

        if ((entity_preview !== null) && (TSCKEntityEmbedEntity.selected_entity !== null)) {
          console.log("Existing entity selected, displaying preview.");
          TSCKEntityEmbedEntityDialog.showPreview();
        }
        else
        {
          if (entity_preview != null) {
            TSCKEntityEmbedEntityDialog.reset();
          }

          TSCKEntityEmbedEntityDialog.showEntitySearch();
        }
      }

    },

    TSCKEntityEmbedEntityDialog.reset = function (editor) {

      TSCKEntityEmbedEntity.selected_element = null;
      TSCKEntityEmbedEntity.selected_entity = null;

      for (var i = 0; i < entity_browsers.length; i++) {
        entity_browsers[i].reset();
      }

    },

    TSCKEntityEmbedEntityDialog.createEntityPreview = function () {

      var html =
        '<div id="ts-ck-entity-embed-entity-preview">' +
        '  <div class="entity-fieldset">' +
        '    <label for="entity-view-mode">View mode:</label>' +
        '    <select id="entity-view-mode" class="entity-view-mode-select">' +
        '      <option value="default">default</option>' +
        '    </select>' +
        '  </div>' +
        '  <div class="entity-fieldset">' +
        '    <label for="entity-align">Align:</label>' +
        '    <select id="entity-align" class="entity-align-select">' +
        '      <option value="left">Left</option>' +
        '      <option value="right">Right</option>' +
        '      <option value="center">Center</option>' +
        '    </select>' +
        '  </div>' +
          '<iframe id="ts-ck-entity-embed-preview-box" src=""></iframe>' +
        '</div>';

      $('.cke_dialog_contents_body').append(html);

      $("#entity-view-mode").change(function () {

        if (TSCKEntityEmbedEntity.selected_entity != null) {
          TSCKEntityEmbedEntity.selected_entity.view_mode = $(this).val();
          TSCKEntityEmbedEntityDialog.refreshPreview();
        }

      });

      $("#entity-align").change(function () {

        if (TSCKEntityEmbedEntity.selected_entity != null) {
          TSCKEntityEmbedEntity.selected_entity.alignment = $(this).val();
          TSCKEntityEmbedEntityDialog.refreshPreview();
        }

      });

    },

    TSCKEntityEmbedEntityDialog.showEntitySearch = function () {

      $(".cke_dialog_contents_body .cke_dialog_page_contents").show();
      $("#ts-ck-entity-embed-entity-preview").hide();

      if (TSCKEntityEmbedEntityDialog.selected_entity !== null) {
        TSCKEntityEmbedEntityDialog.dialog.enableButton('next');
      }


      TSCKEntityEmbedEntityDialog.dialog.disableButton('back');
      TSCKEntityEmbedEntityDialog.dialog.disableButton('ok');
      TSCKEntityEmbedEntityDialog.dialog.disableButton('remove');

      TSCKEntityEmbedEntityDialog.dialog.enableButton('cancel');

    },

    TSCKEntityEmbedEntityDialog.showPreview = function () {

      $(".cke_dialog_contents_body .cke_dialog_page_contents").hide();
      $("#ts-ck-entity-embed-entity-preview").show();

      TSCKEntityEmbedEntityDialog.refreshPreview();

      TSCKEntityEmbedEntityDialog.dialog.disableButton('cancel');
      TSCKEntityEmbedEntityDialog.dialog.disableButton('next');

      TSCKEntityEmbedEntityDialog.dialog.enableButton('back');
      TSCKEntityEmbedEntityDialog.dialog.enableButton('ok');

      if (TSCKEntityEmbedEntity.selected_element !== null) {
        TSCKEntityEmbedEntityDialog.dialog.enableButton('remove');
      }

    },

    TSCKEntityEmbedEntityDialog.hidePreview = function () {

      $("#ts-ck-entity-embed-entity-preview").hide();

    },

    TSCKEntityEmbedEntityDialog.refreshPreview = function () {

      var selected = TSCKEntityEmbedEntity.selected_entity;

      var view_modes = entity_info[selected.entity_type].view_modes;

      $("#entity-view-mode").html('');
      for (var i = 0; i < view_modes.length; i++) {
        $("#entity-view-mode").append('<option value="' + view_modes[i] + '">' + view_modes[i] + '</option>');
      }

      if (selected.view_mode === null) {
        selected.view_mode = view_modes[0];
      }

      var alignment_options = entity_info[selected.entity_type].alignment_options;

      $("#entity-align").html('');
      for (var i = 0; i < alignment_options.length; i++) {
        $("#entity-align").append('<option value="' + alignment_options[i] + '">' + alignment_options[i] + '</option>');
      }

      if (selected.alignment === null) {
        selected.alignment = alignment_options[0];
      }

      $("#entity-view-mode").val(selected.view_mode);
      $("#entity-align").val(selected.alignment);

      entity_preview.refresh(selected);

    },

    TSCKEntityEmbedEntityDialog.selectEntity = function (entity_type, entity_id, view_mode, alignment) {

      if (alignment === null) {
        alignment = 'center';
      }

      TSCKEntityEmbedEntity.selectEntity(entity_type, entity_id, view_mode, alignment);

      TSCKEntityEmbedEntityDialog.dialog.enableButton('next');

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

    TSCKEntityEmbedEntityDialog.removeEntity = function (editor) {

      if (TSCKEntityEmbedEntity.selected_element !== null) {
        TSCKEntityEmbedEntity.removeEntityPreviewHtml(TSCKEntityEmbedEntity.selected_element);
      }

      CKEDITOR.dialog.getCurrent().hide();

      TSCKEntityEmbedEntityDialog.reset();

    }

});

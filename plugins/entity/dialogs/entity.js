/**
 * Entity Embed plugin for CKEditor.
 * Entity dialog window.
 */

CKEDITOR.dialog.add('entityDialog', function(editor) {

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
            html: '<div id="entity-' + entity_type + '-results">No results</div>',
          },
        ]
      };

      tabs.push(tab);

    }
  }

  return {

    title: 'Entity',
    minWidth: 400,
    minHeight: 200,

    // Dialog window content definition.
    contents: tabs,

    // Dialog load handler.
    onLoad: function() {

      TSCKEntityEmbedEntityDialog.init();

    },

    // Dialog confirmation handler.
    onOk: function() {

      // The context of this function is the dialog object itself.
      // http://docs.ckeditor.com/#!/api/CKEDITOR.dialog
      var dialog = this;

    },
  };

});

var TSCKEntityEmbedEntityDialog = {};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntityDialog.init = function () {

    $(".cke_dialog_contents").find(".cke_dialog_page_contents").each(function (i) {

      var entity_type = $(this).attr("name").replace("tab-", "");

      console.log(entity_type);

      $(this).find('.cke_dialog_ui_input_text').change(function () {

        $.get('/admin/ts_ck_entity_embed/entities/' + entity_type + '/' + $(this).val(), function (data) {

          TSCKEntityEmbedEntityDialog.populateResults(entity_type, data);

        });

      });

    });

  },

  TSCKEntityEmbedEntityDialog.populateResults = function(entity_type, data) {

    var resultsElement = $('#entity-' + entity_type + '-results');

    console.log(resultsElement);

    console.log("results: " + data.length);

    if (data.length === 0) {
      resultsElement.html('No results');
    } else {
      resultsElement.html('<ul id="entity-' + entity_type + '-results-list"></ul>');

      for (var i = 0; i < data.length; i++) {
        $('#entity-' + entity_type + '-results-list').append(
          '<a id="' + entity_type + '-' + data[0].id + '" href="#">' + data[0].title + '</a>'
        );
      }
    }

  }

});

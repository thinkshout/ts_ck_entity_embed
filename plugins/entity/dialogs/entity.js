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
            html: '<div id="entity-' + entity_type + '-results">No results</div>',
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

      TSCKEntityEmbedEntityDialog.init();

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

var TSCKEntityEmbedEntityDialog = {};

jQuery(document).ready(function ($) {

  TSCKEntityEmbedEntityDialog.init = function () {

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

      var resultsElement = $('#entity-' + entity_type + '-results');

      if (data.length === 0) {
        resultsElement.html('No results');
      } else {
        resultsElement.html('<ul id="entity-' + entity_type + '-results-list"></ul>');

        var resultsListElement = $("#entity-" + entity_type + "-results-list");

        for (var i = 0; i < data.length; i++) {
          resultsListElement.append(
            '<li id="' + entity_type + '-' + data[0].id + '">' + data[0].title + '</li>'
          );

          var resultElement = $("#" + entity_type + "-" + data[0].id);

          resultElement.click(function () {

            var id_parts = $(this).attr("id").split("-");
            var entity_type = id_parts[0];
            var entity_id = id_parts[1];

            TSCKEntityEmbedEntityDialog.selectEntity(entity_type, entity_id);

          });
        }
      }

    },

    TSCKEntityEmbedEntityDialog.selectEntity = function (entity_type, entity_id) {

      var resultsListElement = $("#entity-" + entity_type + "-results-list");

      var results = resultsListElement.find("li");

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

      var results = $(".cke_dialog_page_contents").find("li");

      for (var i = 0; i < results.length; i++) {

        if ($(results[i]).hasClass("selected")) {

          var id_parts = $(results[i]).attr("id").split("-");
          var entity_type = id_parts[0];
          var entity_id = id_parts[1];

          var token = TSCKEntityEmbedEntityDialog.generateToken(entity_type, entity_id, 'default');
          editor.insertHtml(token);
        }
      }
    },

    TSCKEntityEmbedEntityDialog.generateToken = function (entity_type, entity_id, view_mode) {

      return '[ts_ck_entity_embed|entity_type=' + entity_type + '|entity_id=' + entity_id + '|view_mode=' + view_mode + ']';

    }

});

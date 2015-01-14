
function TSCKEntityEmbedEntityPreview (jQuery, preview_element) {

  this.$ = jQuery;
  this.preview_element = preview_element;

  this.init = function () {

    this.preview_element.load(this.$.proxy(this.entityClickHandler, this));

  }

  this.refresh = function (entity) {

    console.log('Refreshing entity preview: ' + this.preview_element[0].id);

    var preview_url = '/admin/ts_ck_entity_embed/preview/render/' + entity.entity_type + '/' + entity.entity_id + '/' + entity.view_mode + '/' + entity.alignment;

    this.preview_element.attr('src', preview_url);

  };

  this.entityClickHandler = function (event) {

    // Override any links that appear in elements in the preview.
    this.preview_element.contents().find("a").click(function () { return false; });

  };

}

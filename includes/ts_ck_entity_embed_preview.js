
function TSCKEntityEmbedEntityPreview (jQuery, preview_element) {

  this.$ = jQuery;
  this.preview_element = preview_element;
  this.entity = null;

  this.init = function () {

    this.preview_element.load(this.$.proxy(this.entityClickHandler, this));

  }

  this.refresh = function (entity) {

    if (this.compareEntity(entity)) {
      console.log('Not refreshing entity preview, entity unchanged: ' + this.preview_element[0].id);
    }
    else {
      console.log('Refreshing entity preview: ' + this.preview_element[0].id);

      this.preview_element.contents().find("body").html("<div style=\"text-align: center\">Loading...</div>");

      var preview_url = '/admin/ts_ck_entity_embed/preview/render/' + entity.entity_type + '/' + entity.entity_id + '/' + entity.view_mode + '/' + entity.alignment;

      this.preview_element.attr('src', preview_url);

      this.entity = entity;
    }

  };

  this.entityClickHandler = function (event) {

    // Override any links that appear in elements in the preview.
    this.preview_element.contents().find("a").click(function () { return false; });

  };

  this.compareEntity = function (entity) {

    if (this.entity != null) {
      return ((entity.entity_type == this.entity.entity_type)
        && (entity.entity_id == this.entity.entity_id)
        && (entity.view_mode == this.entity.view_mode)
        && (entity.alignment == this.entity.alignment))
    }

    return false;

  };

}

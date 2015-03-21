
function TSCKEntityEmbedEntityPreview (jQuery, preview_element) {

  this.$ = jQuery;
  this.preview_element = preview_element;
  this.lastEntity = null;

  this.init = function () {

    this.preview_element.load(this.$.proxy(this.entityClickHandler, this));

  }

  this.refresh = function (entity) {

    console.log('Refreshing entity preview: ' + this.preview_element[0].id);

    this.preview_element.contents().find("body").html("<div style=\"text-align: center\">Loading...</div>");

    var preview_url = '/admin/ts_ck_entity_embed/preview/render/' + entity.entity_type + '/' + entity.entity_id + '/' + entity.view_mode + '/' + entity.alignment;

    this.preview_element.attr('src', preview_url);

    this.lastEntity = {
      entity_type: entity.entity_type,
      entity_id: entity.entity_id,
      view_mode: entity.view_mode,
      alignment: entity.alignment
    };

  };

  this.entityClickHandler = function (event) {

    // Override any links that appear in elements in the preview.
    this.preview_element.contents().find("a").click(function () { return false; });

  };

  this.compareEntity = function (entity) {

    if (this.lastEntity != null) {
      return ((entity.entity_type == this.lastEntity.entity_type)
        && (entity.entity_id == this.lastEntity.entity_id)
        && (entity.view_mode == this.lastEntity.view_mode)
        && (entity.alignment == this.lastEntity.alignment))
    }

    return false;

  };

}

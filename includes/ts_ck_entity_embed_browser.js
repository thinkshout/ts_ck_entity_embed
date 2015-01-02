
function TSCKEntityEmbedEntityBrowser (jQuery, browser_element) {

  this.$ = jQuery;
  this.entity_type = null;
  this.browser_element = browser_element;

  this.init = function () {

    this.entity_type = this.browser_element.data("type");

  };

  this.refresh = function () {

    console.log('Refreshing entity browser.');

    console.log(this.browser_element);

    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity").on("click", this.$.proxy(this.entityClickHandler, this));

  };

  this.entityClickHandler = function (event) {

    // Reset selected entity highlighting.
    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity").removeClass("ts-ck-entity-embed-selected-entity");

    // Add highlighting to selected entity.
    this.$(event.currentTarget).addClass("ts-ck-entity-embed-selected-entity");

    var id_parts = this.$(event.currentTarget).attr("id").split("-");

    var entity_type = id_parts[0];
    var entity_id = id_parts[1];

    TSCKEntityEmbedEntityDialog.selectEntity(entity_type, entity_id, null, null);

  };

}

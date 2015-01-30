
function TSCKEntityEmbedEntityBrowser (jQuery, browser_element) {

  this.$ = jQuery;
  this.entity_type = null;
  this.browser_element = browser_element;

  this.init = function () {

    this.entity_type = this.browser_element.data("type");

  };

  this.refresh = function () {

    console.log('Refreshing entity browser: ' + this.browser_element[0].id);

    // Reset selected entity highlighting.
    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity").removeClass("ts-ck-entity-embed-selected-entity");

    // Set up click handler for elements in the browser.
    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity").on("click", this.$.proxy(this.entityClickHandler, this));

    // Override any links that appear in elements in the browser.
    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity a").off("click").on("click", this.$.proxy(this.entityLinkClickHandler, this));

    // Remove loading indicator.
    this.browser_element.contents().find(".ts-ck-entity-embed-loading").remove();

    // Display view elements.
    this.browser_element.contents().find(".view-filters").show();
    this.browser_element.contents().find(".view-content").show();
    this.browser_element.contents().find(".pager").show();

  };

  this.reset = function () {

    // Reset selected entity highlighting.
    this.browser_element.contents().find("div.ts-ck-entity-embed-browser-entity").removeClass("ts-ck-entity-embed-selected-entity");

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

  this.entityLinkClickHandler = function (event) {

    event.preventDefault();

    var entity_element = this.$(this).closest("div.ts-ck-entity-embed-browser-entity");
    if (entity_element) {
      entity_element.trigger("click");
    }

  };

}

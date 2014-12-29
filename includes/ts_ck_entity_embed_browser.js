
function TSCKEntityEmbedEntityBrowser (jQuery, browser_element) {

  this.$ = jQuery;
  this.entity_type = browser_element.data("type");
  this.browser_element = browser_element;

  this.refresh = function () {

    console.log('Refreshing entity browser.');

    console.log(this.browser_element);

    this.browser_element.contents().find("div.entity").on("click", this.$.proxy(this.entityClickHandler, this));

  };

  this.entityClickHandler = function (event) {

    // Reset selected entity highlighting.
    this.browser_element.contents().find("div.entity").removeClass("selected-entity");

    var path = this.$(event.currentTarget).attr("about");
    console.log('Clicked entity: ' + path);

    // Add highlighting to selected entity.
    this.$(event.currentTarget).addClass("selected-entity");

    // Get entity information from path.
    this.$.get('/admin/ts_ck_entity_embed/path/' + this.entity_type + path, function (data) {

      TSCKEntityEmbedEntity.selected_entity = {
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        view_mode: null,
        alignment: null,
      };

    });

  };

}

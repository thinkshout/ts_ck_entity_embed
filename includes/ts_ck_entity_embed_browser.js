
function TSCKEntityEmbedEntityBrowser (jQuery, browser_element) {

  this.$ = jQuery;
  this.browser_element = browser_element;

  this.refresh = function () {

    console.log('Refreshing entity browser.');

    console.log(this.browser_element);

    this.browser_element.contents().find("div.entity").on("click", this.$.proxy(this.handleEntitySelect, this));

  };

  this.handleEntitySelect = function (event) {

    // Reset selected entity highlighting.
    this.$("div.entity").removeClass("selected-entity");

    var path = this.$(event.currentTarget).attr("about");
    console.log('Clicked entity: ' + path);

    this.$(event.target).addClass("selected-entity");

    // TODO: Remove hard-coded entity type.
    TSCKEntityEmbedEntityDialog.selectBrowserEntity('bean', path);

  }

}

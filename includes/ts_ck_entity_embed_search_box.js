
function TSCKEntityEmbedEntitySearchBox (jQuery, entity_type, search_element, results_element) {

  this.$ = jQuery;
  this.entity_type = entity_type;
  this.search_element = search_element;
  this.results_element = results_element;

  this.init = function () {

    console.log('Initializing entity search box.');

    this.search_element.on("keypress", this.$.proxy(this.searchKeypressHandler, this));

  };

  this.refresh = function () {

    console.log('Refreshing entity search box.');

  };

  this.searchKeypressHandler = function (event) {

    if (this.$(event.currentTarget).val().length != 0) {

      this.$.get('/admin/ts_ck_entity_embed/entities/' + this.entity_type + '/' + this.$(event.currentTarget).val(), this.$.proxy(this.searchResultHandler, this));

    }

  };

  this.searchResultHandler = function (data) {

    if (data.length === 0) {
      this.results_element.html('No results');
    } else {
      this.results_element.html('');

      for (var i = 0; i < data.length; i++) {
        this.results_element.append(
          '<input type="radio" id="' + this.entity_type + '-' + data[i].id + '" name="entity" value="' + this.entity_type + '-' + data[i].id + '" />' +
            '<label for="' + this.entity_type + '-' + data[i].id + '">' + data[i].label + '</label>'
        );

        var entity = this.$("#" + this.entity_type + "-" + data[i].id);

        entity.on("click", this.$.proxy(this.entityClickHandler, this));

      }
    }

  }

  this.entityClickHandler = function (event) {

    var id_parts = this.$(event.currentTarget).attr("id").split("-");
    var entity_type = id_parts[0];
    var entity_id = id_parts[1];

    console.log('Clicked entity: ' + entity_type + '/' + entity_id);

    TSCKEntityEmbedEntity.selected_entity = {
      entity_type: entity_type,
      entity_id: entity_id,
      view_mode: null,
      alignment: null,
    };

  };

}

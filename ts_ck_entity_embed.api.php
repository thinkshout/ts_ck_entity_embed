<?php

/**
 * @file
 * Hooks provided by the TS CK Entity Embed module.
 */

/**
 * Provides an array of embeddable entity information.
 *
 * Entities can be searched and selected using either a Drupal view
 * or a field in the entity database table.
 *
 * @return array
 *   Array of entity information indexed by entity type.
 */
function hook_ts_ck_entity_embed_entity_info() {
  $entity_info = array(
    'bean' => array(
      // The method used to render the entity when embedded.
      'render_method' => 'ts_ck_entity_embed_render_bean',
      // The ID of the Drupal view used to search for and select entities.
      // If empty or missing, the 'search_field' property will be used.
      'view_id' => 'fh_ck_entity_embed_bean',
      // The database table field used to search for entities.
      // Usually whatever contains the entity name / title.
      // Ignored if 'view_id' is not empty.
      'search_field' => 'label',
    ),
  );

  return $entity_info;
}

/**
 * Renders a bean entity.
 *
 * @param object $entity
 *   The bean entity object.
 * @param string $view_mode
 *   The view mode to using when rendering.
 */
function ts_ck_entity_embed_render_bean($entity, $view_mode) {
  return bean_view($entity, $view_mode);
}

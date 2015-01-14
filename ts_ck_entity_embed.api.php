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
      // The label to display on the dialog tab.
      'tab_label' => 'Bean',
      // The method used to render the entity when embedded.
      'render_method' => 'ts_ck_entity_embed_render_bean',
      // The ID of the Drupal view used to search for and select entities.
      // If empty or missing, the 'search_field' property will be used.
      'view_name' => 'ts_ck_entity_embed_bean',
      // The database table field used to search for entities.
      // Usually whatever contains the entity name / title.
      // Ignored if 'view_name' is not empty.
      'search_field' => 'label',
      // Optional array of view modes that may be used when embedding entity.
      // Defaults to all view modes when missing or empty.
      'view_modes' => array(),
      // Array of available alignment options. Valid options are:
      // 'left' 'center' 'right'
      'alignment_options' => array(
        'left',
        'right',
        'center',
      ),
    ),
  );

  return $entity_info;
}

/**
 * Allows embeddable entity information to be modified.
 */
function hook_ts_ck_entity_embed_entity_info_alter(&$entity_info) {
  $entity_info['bean']['render_method'] = 'custom_bean_render_method';
}

/**
 * Provides an array of CSS file paths to include in the editor and entity
 * preview window. Useful for styling embedded entities with the site's theme.
 *
 * @return array
 *   Array of CSS file paths.
 */
function hook_ts_ck_entity_embed_editor_css() {
  $files = array(
    drupal_get_path('theme', 'custom_theme') . '/css/style.css',
  );

  return $files;
}

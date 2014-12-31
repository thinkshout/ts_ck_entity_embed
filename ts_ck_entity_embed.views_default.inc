<?php
/**
 * @file
 * Defines views used by TS CK Entity Embed for entity search.
 */

/**
 * Implements hook_views_default_views().
 */
function ts_ck_entity_embed_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'ts_ck_entity_embed_bean';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'bean';
  $view->human_name = 'TS CK Entity Embed Bean';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'none';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['exposed_form']['options']['submit_button'] = 'Search';
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['style_plugin'] = 'grid';
  $handler->display->display_options['row_plugin'] = 'entity';
  $handler->display->display_options['row_options']['view_mode'] = 'default';
  /* Field: Block: Internal, numeric block ID */
  $handler->display->display_options['fields']['bid_1']['id'] = 'bid_1';
  $handler->display->display_options['fields']['bid_1']['table'] = 'bean';
  $handler->display->display_options['fields']['bid_1']['field'] = 'bid';
  $handler->display->display_options['fields']['bid_1']['label'] = 'Block ID';
  $handler->display->display_options['fields']['bid_1']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['bid_1']['separator'] = '';
  /* Filter criterion: Block: Label */
  $handler->display->display_options['filters']['label']['id'] = 'label';
  $handler->display->display_options['filters']['label']['table'] = 'bean';
  $handler->display->display_options['filters']['label']['field'] = 'label';
  $handler->display->display_options['filters']['label']['operator'] = 'contains';
  $handler->display->display_options['filters']['label']['exposed'] = TRUE;
  $handler->display->display_options['filters']['label']['expose']['operator_id'] = 'label_op';
  $handler->display->display_options['filters']['label']['expose']['label'] = 'Label';
  $handler->display->display_options['filters']['label']['expose']['operator'] = 'label_op';
  $handler->display->display_options['filters']['label']['expose']['identifier'] = 'label';
  $handler->display->display_options['filters']['label']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    4 => 0,
    11 => 0,
    13 => 0,
    14 => 0,
    5 => 0,
    6 => 0,
    7 => 0,
    16 => 0,
    8 => 0,
    12 => 0,
    15 => 0,
    17 => 0,
    10 => 0,
    9 => 0,
    3 => 0,
  );

  $export['ts_ck_entity_embed_bean'] = $view;

  return $export;
}

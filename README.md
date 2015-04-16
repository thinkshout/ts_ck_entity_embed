CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Installation
 * Configuration

INTRODUCTION
------------

This module enables embedding of entities into a WYSIWYG text field using
CKEditor.

REQUIREMENTS
------------

This module requires the following modules:

 * CKEditor (https://www.drupal.org/project/ckeditor)
 * Views (https://www.drupal.org/project/views)

INSTALLATION
------------

 * Install as you would normally install a contributed Drupal module. See:
   https://drupal.org/documentation/install/modules-themes/modules-7
   for further information.

CONFIGURATION
-------------

### CKEditor Config
1. Navigate to the ckeditor profile config page (`admin/config/content/ckeditor`) and click "edit" for the profile you'd like to enable embedded entities for
2. Open the "Editor Appearance" fieldset and drag the book icon ![book-icon](https://cloud.githubusercontent.com/assets/3582018/7192763/6da2e538-e44d-11e4-8039-c4d67626f12f.png) to the "Current toolbar"
3. Save your CKEditor profile changes

### Text Format Config
1. Navigate to the Text Format config page (`admin/config/content/formats`) and click "configure" for the Text Format you'd like to allow embedded entities for
2. Under the "Enabled filters" section, check the "CKEditor Entity Embed" box
3. Save your Text Format changes

You should now be able to embed entities by clicking the book icon on your WYSIWYG editor.
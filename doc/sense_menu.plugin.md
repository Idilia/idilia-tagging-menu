# Idilia Sense Menu

The Sense Menu jQuery plugin enables word sense selection in a web application. The possible senses are presented using visually appealing tiles which allow a user to quickly specify a specific word sense. Tiles can be presented both in carousel or grid view. Both views are responsive and adjust the number of displayed tiles based on the screen width.

This plugin is used in conjunction with the [kb/sense_menu API](http://www.idilia.com/developer/language-graph/api/kb-sense-menu/): The API is used to retrieve the HTML representing the possible senses and the plugin is used to select one of them

See it live at:

* [Sense Menu Plugin Demo](http://api.idilia.com/TaggingMenuDemo/SenseMenu?carousel=0)
* [Sense Menu Plugin Demo with Carousel View](http://api.idilia.com/TaggingMenuDemo/SenseMenu)

# Getting Started

1. Get files

 The simplest integration will be described here. Add-ons and options will be described in further sections.

 Either install using bower

 ```shell
 bower install idilia-tagging-menu
 ```

 or clone from github

 ```shell
 git clone http://github/Idilia/idilia-tagging-menu
 ```

2. Include files

 ```html
 <link rel="stylesheet" href="idilia-tagging-menu/dist/jquery.sense_menu.bundle.css" />

 <script src="idilia-tagging-menu/dist/jquery.sense_menu.bundle.js"></script>
 ```

3.

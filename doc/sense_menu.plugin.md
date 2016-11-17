## Sense Menu

The Sense Menu jQuery plugin enables word sense selection in a web application. The possible senses are presented using visually appealing tiles which allow a user to quickly choose a specific word sense. Tiles can be presented both in carousel or grid view. Both views are responsive and adjust the number of displayed tiles based on the screen width.

This plugin is used in conjunction with the [kb/sense_menu API](http://www.idilia.com/developer/language-graph/api/kb-sense-menu/). The API is used to retrieve the HTML representing the possible senses and the plugin is used to select one of them

See it live at:

* [Sense Menu Plugin Demo](http://api.idilia.com/TaggingMenuDemo/SenseMenu?carousel=0)
* [Sense Menu Plugin Demo with Carousel option view](http://api.idilia.com/TaggingMenuDemo/SenseMenu)

Optional functionality is documented separately:

* [Carousel Sense Selection](carousel.extra.md) - adds carousel sense selection as an alternative to the default grid layout.

### Getting Started

1. Get files

 The simplest integration will be described here. Add-ons and options will be described in further sections.

 Either install using bower

 ```shell
 bower install idilia-tagging-menu
 ```

 or with npm

 ```shell
 npm install -S idilia-tagging-menu
 ```
 
 or clone from github

 ```shell
 git clone http://github.com/Idilia/idilia-tagging-menu
 ```

2. Include files

 ```html
 <link rel="stylesheet" href="idilia-tagging-menu/dist/jquery.sense_menu.bundle.css"/>

 <script src="idilia-tagging-menu/dist/jquery.sense_menu.bundle.js"></script>
 ```

3. DOM anchors

 Allocate a div in your HTML document to insert the menu text and where it will appear in relation to the other elements in your page.

 ```html
 <div id="menu" />
 ```

4. Obtain the menu

 Use the [kb/sense_menu API](http://www.idilia.com/developer/language-graph/api/kb-sense-menu/) to obtain a sense menu. You can do this on an application server or from the client using JSONP. The following performs a JSONP request, opens the menu, and closes it on a sense selection.

 ```javascript
 /* An event handler assigned to a button for opening a sense menu */
 createMenu = function (event) {
   var word = $("#wordField").val();
   $.ajax({
     data: { text : word, template : 'image_v3' },
     type: 'GET',
     async: false,
     url: 'http://api.idilia.com/1/kb/sense_menu.js',
     dataType: 'jsonp'
   }).done(function (data) {
     /* Retrieve the HTML and open the menu around this element */
     $("#menu").html(data["menu"]);
     var sm = $("#menu").children().first().senseMenu({
       sensesel: function (event) {
         /* Sense tile in event.$selTile was selected */
         sm.close();
       }
     }).data("senseMenu");
     sm.open();
   }).fail(function () {
   /* ajax error handling */
   });
 }
 ```

When a sense is selected, the callback sensesel is invoked with the following attributes:
* __$selTile__: jQuery element of the newly selected sense tile (element with class idl-tile-container);
* __$prevTile__: jQuery element of the previously selected sense tile if any;

### Customize

#### Options

The following options can be provided when instantiating the sense menu:

Option|Description
---|----
sensesel|	Callback function invoked on a sense selection
gridTileContainerClass|	CSS classes to assign to a sense tile when switching to grid mode.
definitionIconClasses	|CSS classes to represent the icon for showing/hiding the detailed definition of a sense.
view ('grid' (default) or 'carousel') |	Opening view for the menu.
carouselOptions|	Options for the Owl Carousel

#### Styling

The following CSS classes are used during usage:

Class	|Description
---|---
idl-sensesel|Assigned to the selected sense
idl-grpsel|Highlights the sense tiles related to selected group in the nav bar
idl-grid|Assigned to the menu when in grid mode
idl-carousel|Assigned to the menu when in carousel mode
hidden|Assigned to the menu when closed
active|Assigned to selected group in the nav bar and to the active view control button.

The classes related to the rendering of sense tiles are described in [Sense Card plugin](sense_card.plugin.md).

### Methods
The widget instance can be retrieved from the attached element using data attribute "senseMenu" (e.g., var sm = $(…).data("senseMenu"); ). The following methods are available:

Method|Description
---|---
open([view])|Opens the menu from the options or with the view given.
close()|Closes the menu.
destroy()|Removes the widget instance.
select($selTile)|Selects the given tile.

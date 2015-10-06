## Sense Card

The Sense Card jQuery plugin enables word sense presentation in a card, either horizontally or vertically.

This plugin is used in conjunction with the [kb/sense_card API](http://www.idilia.com/developer/language-graph/api/kb-sense-card/). The API is used to retrieve the HTML representing a given sense. The plugin implements basic functionality on the card.

See a few examples of the Sense Card Plugin for [Tide the detergent](http://api.idilia.com/TaggingMenuDemo/SenseCard?fsk=Tide/N8), [sea tides](http://api.idilia.com/TaggingMenuDemo/SenseCard?fsk=tide/N1) or [Apple the company](http://api.idilia.com/TaggingMenuDemo/SenseCard?fsk=Apple/N66).

### Getting Started

1. Get files

 The simplest integration will be described here. Add-ons and options will be described in further sections.

 Either install using bower

 ```shell
 bower install idilia-tagging-menu
 ```

 or clone from github

 ```shell
 git clone http://github.com/Idilia/idilia-tagging-menu
 ```

2. Include files

 ```html
 <link rel="stylesheet" href="idilia-tagging-menu/dist/sensecard.css"/>

 <script src="idilia-tagging-menu/dist/jquery.sense_card.js"></script>
 ```

3. DOM anchors

 Allocate a div in your HTML document to insert the card content and where it will appear in relation to the other elements in your page.

 ```html
 <div id="card" />
 ```

4. Obtain the menu

 Use the [kb/sense_card API](http://www.idilia.com/developer/language-graph/api/kb-sense-card/) to obtain a sense menu. You can do this on an application server or from the client using JSONP. The following performs a JSONP request, opens the menu, and closes it on a sense selection.

 ```javascript
 /* An event handler assigned to a button for opening a sense menu */
 createMenu = function (event) {
   var word = $("#wordField").val();
   $.ajax({
     data: { text : word, template : 'image_v3' },
     type: 'GET',
     async: false,
     url: 'http://api.idilia.com/1/kb/sense_card.js',
     dataType: 'json'
   }).done(function (data) {
     /* Retrieve the HTML and open the menu around this element */
     $("#card").html(data["card"]);
     $("#card").children().first().senseCard().data("senseMenu");
   }).fail(function () {
   /* ajax error handling */
   });
 }
 ```

When a sense is selected, the callback sensesel is invoked with the following attributes:
* __$selTile__: The newly selected sense tile (element with class idl-tile-container);
* __$prevTile__: Previously selected sense tile if any;

### Customize

#### Options
Customize

The following options can be provided when instantiating the sense menu:

Option|Description
---|----
template (image_v3, menu_image_v3)|	layout to use. image_v3 is horizontal, menu_image_v3 is vertical

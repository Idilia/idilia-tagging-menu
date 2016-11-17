## Tagging Menu

The Tagging Menu jQuery plugin enables assigning word senses to one or more consecutive words (e.g., a search query) in a web application. The sense for each word is selected using the [Sense Menu jQuery plugin](sense_menu.plugin.md). The plugin manages the grouping of words into multi-word expressions or breaking-up multi-word expressions.

This plugin is used in conjunction with Idilia's semantic analysis [text/disambiguate](http://www.idilia.com/developer/sense-analysis/api/text-disambiguate/) API and Idilia's [kb/tagging_menu](http://www.idilia.com/developer/language-graph/api/kb-tagging-menu/) API. The semantic API analyzes the text to determine possible senses of each word and the second API generates the HTML representing the text to tag and a sense menu for each word. The plugin is used to select the senses.

For a live example, see the [Tagging Menu Demo](http://api.idilia.com/TaggingMenuDemo). There are two different examples, one to tag [normal text](http://api.idilia.com/TaggingMenuDemo/Text) and another to tag [search expression](http://api.idilia.com/TaggingMenuDemo/Query).

### <a name="documentation"></a>Documentation

This document describes the most likely usage of Idilia's tagging plugins. It is built on top of simpler modules which have their own documentation. They are:

* [Sense Menu jQuery plugin](sense_menu.plugin.md) - provides single word sense tagging
* [Sense Card jQuery plugin](sense_card.plugin.md) - provides sense card information functionality

Optional functionality is documented separately:

* [Carousel Sense Selection](carousel.extra.md) - adds carousel sense selection as an alternative to the default grid layout.

### Getting Started

The simplest integration will be described here. Add-ons are documented in their own page (see [above](#documentation)) and options will be described in a [further section](#options).

1. Get files

 Install using bower:

 ```shell
 bower install idilia-tagging-menu
 ```

 or with npm

 ```shell
 npm install -S idilia-tagging-menu
 ```
 
 or get all files from github:

 ```shell
 git clone http://github.com/Idilia/idilia-tagging-menu
 ```

2. Include files

 ```html
 <link rel="stylesheet" href="idilia-tagging-menu/dist/jquery.tagging_menu.bundle.css" />

 <script src="idilia-tagging-menu/dist/jquery.tagging_menu.bundle.js"></script>
 ```

3. DOM anchors

 Allocate a div in your HTML document to insert the __words__ to tag and another div to insert the sense __menus__ and where they will appear in relation to the words to tag.

 ```html
 <div id="words"/>
 <div id="menus"/>
```

3. Obtain the menus

 This step is broken down in two steps.

 1. Use the [text/disambiguate API](http://www.idilia.com/developer/sense-analysis/api/text-disambiguate/) to perform a sense analysis of the words to tag. This identifies the sense of each word, their alternate senses, and possible groupings for multi-word expressions.
 2. Use the [kb/tagging_menu API](http://www.idilia.com/developer/language-graph/api/kb-tagging-menu/) to obtain HTML for the words and their menus, supplying the results of the sense analysis.

 You will want to perform these two steps on an application server because your secret credentials are needed for both operations. For a Ruby coding example, see [tagging_menu.rb](https://github.com/Idilia/idilia-api-samples/blob/master/ruby/kb/tagging_menu.rb). For a java example, see [TaggingMenu.java](https://github.com/Idilia/idilia-api-samples/blob/master/java/src/main/java/com/idilia/services/examples/menu/TaggingMenu.java) or [TaggingMenuAsync.java](https://github.com/Idilia/idilia-api-samples/blob/master/java/src/main/java/com/idilia/services/examples/menu/TaggingMenuAsync.java).

 For the second operation, the server returns a JSON structure with two fields, both containing HTML:

 * __text__: This property is an HTML rendering of the supplied input text. In your HTML document, you will want to replace the input text field with this content. It is used to anchor the plugin.
 * __menu__: This property is the HTML rendering of the sense menus for all the words. You will want to insert this in your HTML document somewhere close to the words.

 On the client side, you need to request the menus from the application server using something like this (assuming that you are passing transparently the text and menu properties back to the client, and the server responds to the "get_menu_for_text" path):

 ```javascript
 /* An event handler assigned to a button for requesting the tagging menu */
 createMenu = function (event) {
   var text = $("#textField").val();
   $.ajax({
     data: { text : text },
     url: 'get_menu_for_text',
     dataType: 'json'
   }).done(function (data) {
     /* Insert in document both the text and the menus */
     $("#words").html(data["text"]);
     $("#menus").html(data["menu"]);
     var tm = $("#words").children().first().taggingMenu({
       menus: $("#menus"),
       sensesel: function (event) {
         /* event.$text.data("fsk") is the sense selected */
         if (event.allset) {
           alert("All words are tagged");
         }
         /* Returning true lets the plugin replace the word */
         return true;
       }
     }).data("taggingMenu");
   }).fail(function () {
     /* ajax error handling */
   });
 }
 ```
 This instantiates a tagging menu with all words considered tagged as the widget uses the word senses obtained from the output of sense analysis.

 When a sense is selected, the callback sensesel is invoked with the following attributes:

 * __$selTile__: jQuery element of the newly selected sense tile (element with class idl-tile-container);
 * __$prevTile__: jQuery element of the previously selected sense tile if any;
 * __$text__: jQuery element of the text element for which a sense was selected;
 * __selStart__: Starting word offset of selected sense;
 * __selEnd__: Offset one past the last offset of the new sense. selEnd – selStart is the number of words used by the sense;
 * __prevStart__, prevEnd: Offsets for the previous sense
 * __allset__: True when all words have an assigned sense.

 In addition when a sense is selected, the data property __fsk__ of the tagged word is set with the selected sense.

### Customize

#### <a name="options"></a>Options

The following options can be provided when instantiating the tagging menu:

Option | Description
------ | -----------
menus  | jquery object for the element holding the sense menus. e.g. ```$("#menus")```
wordsContent ("text" or "tile", default: "text")| "#words" div content type. The tagging menu will either show text or sense cards
hideUntaggable (_boolean_, default: false)| parts of the text can be identified as untaggable (e.g. operators in a search expression). These can be hidden if this options is set to true
useToolTip (_boolean_, default: true)| Whether to display a sense card when mousing over word. Default is true. Set to false if you don’t have Bootstrap popover.
informOnOther (_boolean_, default: true) | notify Idilia if "other sense" selection is made. In some cases the sense inventory will be missing a sense and this will be the only option. Notifying Idilia enables us to improve our sense inventory.
closeOnSelect (_boolean_, default: true) | close the sense options view on sense selection
closeOnOutsideClick (_boolean_, default: true) | close the sense options view on click outside the sense options
preselect ('sa' (default), 'mono' or 'none')| Determines if a sense is preselected for a word. ‘sa’ uses the result of Sense Analysis (default); ‘mono’ preselects when a single sense is possible; ‘none’ disables pre-selection.
sensesel | Callback function invoked on a sense selection
sensedesel | Callback function invoked on a sense deselection
beforeOpen | Callback function invoked before a menu is opened
afterClose | Callback function invoked after a menu is closed
senseMenuOptions | Options for the sense menu of each word (e.g. 'view'). See [Sense Menu plugin](sense_menu.plugin.md) for details.

#### Styling

The following CSS classes are used during usage:


Class |Description
-------------- | -------------
idl-menu-word	| Assigned to a span containing a word which has a sense menu.
idl-tagged |	Assigned to a .idl-menu-word when a sense is selected for it. Either from initial conditions or assigned from a user action.
idl-mantagged	| Assigned to a .idl-menu-word when a sense is manually assigned for it.
idl-untagged	| Assigned to a .idl-menu-word which requires a sense.

Other classes related to the sense menu are described in [Sense Menu plugin](sense_menu.plugin.md) and in [Sense Card plugin](sense_card.plugin.md).

#### Methods

The widget instance can be retrieved from the attached element using data attribute "taggingMenu" (e.g., var tm = $(…).data("taggingMenu"); ). The following methods are available:

Method | Description
------ | -----------
text() | Returns the text of the tagged words (as one string).
senses() | Returns the sense tagged expression (as one string). Words with no senses are included as is.
sensesAsObjects() | Returns text and tagging as an array. It contains all the information required to render the original text and the selected senses
close() | Closes the menu.
deselect($menu-word) | Untags a word. I.e., Removes the sense assigned to it. Argument is a span with class "idl-menu-word".
deselectAll() | Untags all the words.
destroy() | Removes the widget instance.


# Idilia Tagging Menu

The Idilia Tagging Menu jQuery plugin enables assigning word senses to one or more consecutive words (e.g., a search query) in a web application. The sense for each word is selected using the [Idilia Sense Menu jQuery plugin](docs/sense_menu.md). The plugin manages the grouping of words into multi-word expressions or breaking-up multi-word expressions.

This plugin is used in conjunction with Idilia's semantic API. The API is used to retrieve the HTML representing the text to tag and the possible senses for each word. The plugin is used to select the senses.

For a live example, see Idilia's [Tagging Menu Demo](http://api.idilia.com/TaggingMenuDemo).

## Documentation

This document describes the most likely usage of Idilia's tagging plugins. It is built on top of simpler modules which have their own documentation. They are:

* [Tagging Menu jQuery plugin](docs/tagging_menu.plugin.md) - provides text sense tagging
* [Sense Menu jQuery plugin](docs/sense_menu.plugin.md) - provides single word sense tagging
* [Sense Card jQuery plugin](docs/sense_card.plugin.md) - provides sense card information functionality

Moreover, extras are documented independently.

* [Bootstrap Popover](docs/popover.extra.md) - adds popover sense card over tagged senses
* [Carousel Sense Selection](docs/carousel.extra.md) - adds carousel sense selection as an alternative to the default grid layout.

## Getting Started

The simplest integration will be described here. Add-ons and options will be described in further sections.

1. Get files

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
 <!-- CSS -->
 <link rel="stylesheet" href="idilia-tagging-menu/dist/jquery.tagging_menu.bundle.css" />

 <!-- Indi-->
 <script src="idilia-tagging-menu/dist/jquery.tagging_menu.bundle.js"></script>
 ```

2. DOM anchors

 Allocate a div in your HTML document to insert the __words__ to tag and another div to insert the sense __menus__ and where they will appear in relation to the words to tag.

 ```html
 <div id="words"/>
 <div id="menus"/>
```

3. Obtain the menus

 This step is broken down in two steps.

 1. Use the [text/disambiguate API](http://www.idilia.com/developer/sense-analysis/api/text-disambiguate/) to perform a sense analysis of the words to tag. This identifies the sense of each word, their alternate senses, and possible groupings for multi-word expressions.
 2. Use the [kb/tagging_menu API](http://www.idilia.com/developer/language-graph/api/kb-tagging-menu/) to obtain HTML for the words and their menus, supplying the results of the sense analysis.

 You will want to perform these two steps on an application server because your secret credentials are needed for both operations. For a Ruby coding example, see [tagging_menu.rb](https://github.com/Idilia/idilia-api-samples/blob/master/ruby/kb/tagging_menu.rb). There also is a [java SDK](https://github.com/Idilia/idilia-java-sdk) available on Github.

 For the second operation, the server returns a JSON structure with two fields, both containing HTML:

 * __text__: This property is an HTML rendering of the supplied input text. In your HTML document, you will want to replace the input text field with this content. It is used to anchor the plugin.
 * __menu__: This property is the HTML rendering of the sense menus for all the words. You will want to insert this in your HTML document somewhere close to the words.

 On the client side, you need to request the menus from the application server using something like this (assuming that you are passing transparently the text and menu properties back to the client:

 ```javascript
 /* An event handler assigned to a button for requesting the tagging menu */
 createMenu = function (event) {
   var text = $("#textField").val();
   $.ajax({
     data: { text : text },
     url: 'get_menu_for_text',
     dataType: 'jsonp'
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

 * __$selTile__: The newly selected sense tile (element with class idl-tile-container);
 * __$prevTile__: Previously selected sense tile if any;
 * __$text__: Text element for which a sense was selected;
 * __selStart__: Starting word offset of selected sense;
 * __selEnd__: Offset one past the last offset of the new sense. selEnd – selStart is the number of words used by the sense;
 * __prevStart__, prevEnd: Offsets for the previous sense
 * __allset__: True when all words have an assigned sense.

 In addition when a sense is selected, the data property __fsk__ of the tagged word is set with the selected sense.

# Options

The following options can be provided when instantiating the tagging menu:

Option | Description
------ | -----------
sensesel | Callback function invoked on a sense selection
useToolTip | Whether to display a sense card when mousing over word. Default is true. Set to false if you don’t have Bootstrap popover.
preselect | Determines if a sense is preselected for a word. Values are ‘sa’ for using the result of Sense Analysis (default); ‘mono’ for preselecting when a single sense is possible; ‘none’ for no preselection.
senseMenuOptions | Options for the sense menu of each word. See Sense Menu plugin for its defaults.

The options can be overridden individually:

```javascript
  sensesel: function (event) { },
  senseMenuOptions : {
    view: "grid",
    carouselOptions : {
      navigationText: [ "<<", ">>" ]
    }
  }
  ```

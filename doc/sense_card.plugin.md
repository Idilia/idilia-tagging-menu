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

4. Obtain a sense card

 Use the [kb/sense_card API](http://www.idilia.com/developer/language-graph/api/kb-sense-card/) to obtain a sense card. You can do this on an application server or from the client using JSONP. The following requests a card using a JSONP request and loads it in the document.

 ```javascript
 /* An event handler assigned to a button for fetching a sense card */
 getCardHandler = function (event) {
   var word = $("#wordField").val();
   $.ajax({
     data: { text : word, template : 'image_v3' },
     type: 'GET',
     async: false,
     url: 'http://api.idilia.com/1/kb/sense_card.js',
     dataType: 'json'
   }).done(function (data) {
     $("#card").html(data["card"]);
     $("#card").children().first().senseCard();
   }).fail(function () {
   /* ajax error handling */
   });
 }
 ```

### Styling

 The sense cards use multiple classes in their representation. All classes start with prefix _idl-_. The template requested is one of the class assigned to the top level element (_idl-tile-container_). There are also other class values for the type of card generated:

Class|Description
---|---
idl-tile-text| A sense tile with no image or icon.
idl-tile-icon| A sense tile without an image but where an icon is used to represent the sense
idl-tile-img| A sense tile containing an image.


#### Options

The following options can be provided when instantiating the sense card:

Option|Description
---|----
edited|       Callback function invoked after the card for the sense was edited
deleted|       Callback function invoked after the sense has been deleted 


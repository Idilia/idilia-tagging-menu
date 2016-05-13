/**
 * JQueryUI widget for a block of text with many words to tag
 * Version: 1.1.7
 * 
 * Widget should be attached the the div containing the words to which a sense must be given.
 * 
 * Options:
 *    
 *  menus     : jQuery element hosting the menus that correspond to the words
 *  wordsContent: string with possible values {text|tile} which indicate how the words
 *                will be displayed in the "menus" element. When using the "tile" option,
 *                the useToolTip option should be "false". (default: "text")
 *  senseMenuOptions: sense menu options. May include options for OWL carousel.
 *  useToolTip: Boolean indicating whether the tooltip widget should be used
 *              to display the tagged senses. (default: true)
 *  hideUntaggable: some words can be identified as untaggable when the menu is generated
 *                  by the backend. Those elements can be hidden using this option.
 *                  (default: false)
 *  sensesel  : Callback when a sense selection is made for one word. The event data is:
 *                 - $selTile  - selected sense tile - .idl-tile-container
 *                 - $prevTile - previously selected sense tile or undefined if none
 *                 - $text     - text element for which a sense was selected
 *                 - selStart  - start offset of the word for new sense assigned to the text
 *                 - selEnd    - end offset for new sense
 *                 - prevStart - start offset of the previous sense
 *                 - prevEnd   - end offset of the previous sense
 *                 - allset    - indicates that all words are tagged
 *              If the callback returns true, the text is updated with the word of the
 *              sense selected. If it returns false, the text is unchanged.
 *              
 *  createsel : Callback when user wishes to create a new sense. The event data is:
 *                 - $selTile  - selected create sense tile - .idl-tile-container
 *                 - $prevTile - previously selected sense tile or undefined if none
 *                 - $text     - text element for which a sense creation is requested
 *                 
 *  beforeOpen: Callback before menu is opened
 *  afterClose: Callback after menu is closed
 *  
 * Important classes
 *  idl-menu-word - class assigned to all words for which a menu is available
 *  idl-untagged  - initial state for all .idl-menu-word. Removed when a sense becomes available for it
 *  idl-tagged    - added to .idl-menu-word when a sense is selected for it or available from initial conditions
 *  idl-mantagged - added to .idl-menu-word when a sense is manually selected for it
 *  idl-active    - added to .idl-menu-word when a sense menu is open for it
 *  idl-def-show-icon - background-image of which is used to set the icon of show definition buttons.
 *  idl-def-hide-icon - background-image of which is used to set the icon of hide definition buttons.
 * 
 * Available for use under the MIT License (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * Copyright (c) 2014 by Idilia
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

if (typeof Object.create !== "function") {
  Object.create = function (obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  };
}

(function ($, window, document) {

  /* Prevents the installed html click handler from closing the menu. This flag is true
   * only momentarily and in two distinct scenarios:
   * 1.the html click handler is installed on a click event that will be seen by the
   *   handler but the menu must not be closed.
   * 2.the closeOnSelect option uses this flag to stop the html handler from closing
   *   the menu when a sense card is selected. */
  var _doNotClose = false;
  
  /* Tracking which (if any) Word menu is currently opened */
  var _openedWord = null;
  
  /* Reference counting of global html click handler. Handler is installed on transition
   * from 0 to 1, and removed when back down to 0. Reference count will go up to 2 when
   * a word menu is opened while a sibling menu is already opened. */
  var _bodyClickEnabledCount = 0;
  
  /**
   * An object that is created for each word with an associated sense menu.
   * It manages its sense menu and informs listeners when a sense is selected.
   */
  var Word = {

      /**
       * Initialize with arguments:
       * options : control options: useToolTip
       * $text: the jquery element to tag (has class 
       */
      init: function (options, $text, $menu) {
        var base = this;

        base.$elem = $text; /* jquery element holding the text word to tag */
        base.$menu = $menu; /* jquery element holding the menu */
        base.options = $.extend({}, base.$elem.data(), options);

        base.tfOff = parseInt(base.$elem.data("off"), 10); /* tf offset of this menu */
        base.endOff = base.tfOff + 1; /* assume a length 1 until a tile is selected */
        base.$tile = null;  /* sense tile currently selected */
        base.menuW = null;  /* menu widget of type idilia.senseMenu */

        base._create();
      },

      /**
       * Handle sense selection.
       * event : { $prevTile:, $selTile:  }
       * $prevTile and $selTile are the jQuery tile container elements
       */
      select: function(event) {
        var base = this;

        /* Add to given event data spanning information and the impacted text element */
        event.$text = base.$elem;
        event.selStart = base.tfOff;
        base.endOff = event.selEnd = base.tfOff + parseInt(event.$selTile.data("len") || "1", 10);

        if (event.$prevTile) {
          event.prevStart = base.tfOff;
          event.prevEnd = base.tfOff + parseInt(event.$prevTile.data("len") || "1", 10);
        }
        
        base.$tile   = event.$selTile;

        /* Update the attributes of the text element */
        var fsk = event.$selTile.data('fsk');
        base.$elem.
          data("fsk", fsk).
          addClass("idl-tagged idl-mantagged").
          removeClass("idl-untagged");

        /* Fire custom event to have the tagging menu update siblings */ 
        base.$elem.parent().trigger( "tm_itl_sensesel", event);
                 
        /* Inform a listener of the selection. Listener can prevent
         * default operation of updating the text. */
        var upd = true; /* should set to options - default should be to use the skToLemma */
        if (typeof base.options.sensesel === "function") {
          upd = base.options.sensesel.call(this, event);
        }
        if (upd) {
          if (base.options.wordsContent === "tile") { 
            base.$elem[0].innerHTML = event.$selTile[0].outerHTML;
            base.$elem.senseCard({
              lgcc: base.options.senseMenuOptions.lgcc,
              deleted: function() {
                base._deletedWordTileEH($(this));
              }
            });
          }
          else {
            // Assemble the surface words for spanned spans
            var $currS = base.$elem;
            var text = "";
            do {
              text += $currS.data("tok") || $currS.text(); 
              $currS = $currS.next();
            } while ($currS.length && (!$currS.data("off") || $currS.data("off") < base.endOff));
            base.$elem.text(text.trim().replace(/ /g, '_'));
          }
        }

        /* And close the menu */
        if (base.options.closeOnSelect) {
          base.close();
        }
      },


      /**
       * Public method to remove the sense selection
       */
      deselect : function () {
        var base = this;
        
        base.$elem.
          addClass("idl-untagged").
          removeClass("idl-tagged idl-mantagged").
          removeData("fsk");
        base.endOff = base.tfOff + 1;
        
        var data = {
          'selStart' : base.tfOff,
          'selEnd' : base.tfOff + 1
        };
        if (base.$tile) {
          data.prevStart = base.tfOff;
          data.prevEnd = base.tfOff + parseInt(base.$tile.data("len") || "1", 10);
        }
        base.$elem.parent().trigger( "tm_itl_sensesel", data);
        
        /* Inform a listener of the selection. Listener can prevent
         * default operation of updating the text. */
        var upd = true;
        if (typeof base.options.sensedesel === "function") {
          upd = base.options.sensedesel.call(this, event) !== false;
        }
        if (upd) {
          base.$elem.text(base.$elem.data('tok'));
        }
      },
      
      
      /**
       * Public method for a client to mark a sense as selected
       * @param $tile jquery element of the tile to select. It has class .idl-tile-container
       */
      setSelected: function($tile) {
        this.menuW.select($tile);
      },
      
      /**
       * Public method to retrieve the selected tile
       */
      selected: function() {
        return this.menuW.selected();
      },

      /**
       * Public method to set the view of the embedded sense menu (grid, carousel)
       * @param view Value is 'grid' to set grid mode where all the tiles are visible or 'carousel'
       *             to present the tiles in a slider.
       */
      setView: function(view) {
        this.menuW.setView(view);
      },
      
      /**
       * Public function to indicate if multiple tiles in a menu
       * @return true when the menu has multiple tiles
       */
      polysemous : function () {
        return this.$menu.find('.idl-tile-container').length > 1;
      },
      
      /**
       * Public function with the start offset of this Word within
       * the text.
       */
      startOffset : function () {
        return this.tfOff;
      },
      
      /**
       * Public function with the end offset of the sense selected
       * for this word. Is > 1 when the sense selected spans multiple Word.
       */
      endOffset : function () {
        return this.endOff;
      },

      _bodyClickHandler: function(event) {
        if ($(event.target).closest(".idl-sensemenu").size() > 0) {
          return;
        }
        if (!_doNotClose && _openedWord) {
          _openedWord.close();
        }
        _doNotClose = false;
      },

      _monitorBodyClicks : function(enable) {
        var base = this;
        
        if (!base.options.closeOnOutsideClick)
          return;

        if (enable)
        {
          if (_bodyClickEnabledCount === 0) {
            $(document.body).on("click", base._bodyClickHandler);
          }
          _bodyClickEnabledCount++;
        }
        else
        {
          --_bodyClickEnabledCount;
          if (_bodyClickEnabledCount === 0) {
            $(document.body).off("click", base._bodyClickHandler);
          }
        }
      },
      
      /**
       * Public method to open the menu
       */
      open: function() {
        var base = this;
        
        if (base.$elem.is(':visible')) {
          if (typeof base.options.beforeOpen === "function") {
            base.options.beforeOpen(this);
          }
          
          base._monitorBodyClicks(true);

          if (_openedWord) {
            _openedWord.close();
          }

          if (base.options.useToolTip) {
            base._popover({show:false});
          }
          base.menuW.open();
          base.$elem.addClass("idl-active");
          _openedWord = base;
          _doNotClose = true;
        }
      },


      /**
       * Public method to close the menu 
       */
      close: function() {
        if (_openedWord == this)
        {
          var base = this;
          base._monitorBodyClicks(false);
          _openedWord = null;
          base.menuW.close();
          base.$elem.removeClass("idl-active");

          if (typeof base.options.afterClose === "function") {
            base.options.afterClose(this);
          }
        }
      },


      /**
       * Public method to cleanup
       */
      destroy: function() {
        var base = this;

        base.menuW.destroy();
        if (base.options.useToolTip) {
          base._popover({show:false});
        }
      },

      /**
       * popover state and content handling
       * parms, object with potentially two fields:
       *    bool show: showing or hiding
       *    string content: content to use for the popover
       * */
      _popover: function(parms) {
        var base = this;

        if (parms.hasOwnProperty("show")) {
          base.showingPopup = parms.show;
        }

        var e = base.$elem;
        e.popover('destroy');

        if (base.showingPopup && parms.content)
        {
          e.popover({
              content: parms.content,
              container: false,
              html: true,
              placement: "auto",
              delay: 500,
              trigger: 'hover',
              animation: false});
          e.popover('show');
        }
        
      },
      
      /** Constructor */
      _create: function() {
        var base = this;

        if (base.options.wordsContent === "tile") {
          base._setWordTile();
        }
        
        /* Create the menu with the HTML fragment. */
        base.menuW = base.$menu.senseMenu($.extend({}, base.options.senseMenuOptions, {

          /* Add a handler when a sense is selected. */
          sensesel: function (event) {
            base.select(event);
          },
          
          /* Add a handler when a create sense action is selected. */
          createsel: function (event) {
            event.$text = base.$elem;
            base.options.createsel(event);
            if (base.options.closeOnSelect) {
              base.close();
            }
          }

        })).data("senseMenu");

        base.$elem.on({
          /** handler when the text/tile is clicked. 
           *  Open this word's menu if more than one card or close when opened.
           */
          "click" : function (event) {
            if (base.$elem.hasClass("idl-active")) {
              base.close();
            } else if (base.polysemous()) {
              base.open();
            }
          }
        });

        /** Initialize as untagged */
        base.$elem.addClass("idl-untagged");
      },
      
      /** 
       * Private function to set a menu tile when displaying tiles instead of the word itself
       * Updates base.$tile and base.$elem's html
       */
      _setWordTile : function () {
        var base = this;
        
        var $tile = base.$menu.find(".idl-sensesel").first(); /* selected tile */
        if ($tile.length === 0) {
          $tile = base.$menu.find(".idl-tile-container[data-grp]").first();  /* first tile part of a group, excluding others */
        }
        if ($tile.length === 0) {
          $tile = base.$menu.find(".idl-tile-other");
        }
        if ($tile.length === 0) {
          $tile = base.$menu.find(".idl-tile-any");
        }
        if ($tile.length === 0) {
          // If showing tiles and there is no sense, synthesize one
          $tile = $('<div class="idl-tile-container idl-menu-sensecard idl-sensesel idl-tile-text idl-tmplt-menu_image_v3" data-grp="1"><div class="idl-sensetile"><div class="idl-tile-sum"><h1>' + base.$elem.data("tok") + '</h1></div><div class="idl-def"><p>Any sense (no known meaning).</p></div></div></div>');
        }
        
        base.$tile = $tile;
        base.$elem[0].innerHTML = $tile[0].outerHTML; /* set the tile idl-menu-word content to the tile */
      },
      
      /** 
       * Private event handler for the word tile being deleted.
       * This is called when displaying tiles for the current sense value
       * and the tile is deleted. Remove it from the menu and replace with first tile.
       * @param $card jquery element for the card deleted in the language graph customer center
       */
      _deletedWordTileEH : function ($card) {
        var base = this;
        
        /* Remove the card from the menu that corresponds to this sensekey */
        var fsk=$card.data("fsk");
        var sel=".idl-tile-container[data-fsk='" + fsk + "']";
        base.$menu.find(sel).remove();
        
        /* Replace the tile */
        base._setWordTile();
      },

      /** Private function to return the lemma in a sensekey */
      _skToLemma : function (sk) {
        var base = this;

        var slPos = sk.lastIndexOf('/');
        if (slPos != -1) {
          sk = sk.substr(0, slPos);
        }
        return sk.replace(/_/g, ' ');
      } 
  };
  

  /**
   * An object created to handle the visibility of the gap between words that
   * have a sense menu. This gap can be a space or a word without any sense info.
   * Becomes invisible when a sense spanning it is selected. visible otherwise.
   */
  var Gap = {
      init : function ($elem, tfOff, isWord) {
        var base = this;
        base.$elem = $elem;   /* text element of the gap */
        base.tfOff = tfOff;   /* for a space, offset after; for a dead word, start offset */
        base.isWord = isWord; /* true when a dead word */
      },
      
      startOffset : function () {
        return this.tfOff;
      },
      
      endOffset : function () {
        return this.isWord ? this.tfOff + 1 : this.tfOff;
      }
  };
  

  /**
   * Main class.
   * Creates Word and Gap objects for all the span elements on which it is
   * attached. Notifies instantiator on sense selections and provides services
   * for retrieving the sense information
   */
  var TaggingMenu = {

      init : function(options, el) {
        var base = this;
        
        base.$elem = $(el);   /* element on which attached. Has class "idl-menu-words" */
        base.options = $.extend({}, $.fn.taggingMenu.options, base.$elem.data(), options);
        base.words = [];      /* array of instantiated Word objects */
        base.gaps = [];       /* array of instantiated Gap objects */
        base.sensecards = {}; /* a cache of sense cards requested */
        base.tmplt = options.menus.children().first().data("tmplt");
        
        base._create();
      },

      /* Public method to return the text */
      text : function() {
        var base = this;

        var t = "";
        base.$elem.children().each(function (idx, elem) {
          $elem = $(elem);
          if ($elem.is(':visible')) {
            t += $elem.text();
          }
        });
        return t;
      },


      /**
       * Public method to return the tagged text as one string
       * where the string contains the selected sensekey for each word.
       */
      senses : function() {
        var base = this;

        var t = "";
        base.$elem.children().each(function (idx, elem) {
          $elem = $(elem);
          if (($elem.css("display") == "inline") || $elem.hasClass("hidden")) {
            if ($elem.hasClass("idl-tagged")) {
              var fsk = $elem.data("fsk");
              if (fsk) {
                t += fsk;
                return;
              }
            }
            // no fsk - either an unknown word (use token) or a gap (use text)
            t += $elem.data("tok") || $elem.text();
          }
        });
        return t;
      },
      
      /**
       * Public method to return the sense information 
       * Returns an array of objects with properties:
       *  start:  integer, start offset of the sense
       *  len:    integer,  number of tokens spanned by the selected sense
       *  text:   string, text spanned by the selected sense
       *  fsk:    string, sensekey of the selected sense,
       *  spcAft: boolean, true when text of selected sense is followed by a space
       */
      sensesAsObjects : function() {
        var base = this;
        var res = [];
        var pathEnd = 0;
        var text = '';
        var sense;
        var elements = base.$elem.children();
        for (var i = 0, iEnd = elements.length; i < iEnd; ++i) {
          var $e = $(elements[i]);
          
          /* handle the words with a menu and tagging information */
          if ($e.hasClass('idl-menu-word')) {
            var w = base.words[$e.data("widx")];
            if (w.tfOff === pathEnd) {
              if (sense !== undefined) {
                sense.text = text.trim();
                res.push(sense);
                text = '';
              }
              sense = {'start' : w.tfOff, 'len' : w.endOff - w.tfOff, 'spcAft' : false};
              var fsk = $e.data('fsk');
              if (fsk) {
                sense.fsk = fsk;
              }
              pathEnd = w.endOff;
            }
            text += $e.data('tok');
          } else {
            var g = base.gaps[$e.data("gidx")];
            if (g.isWord && g.tfOff === pathEnd) {
              if (sense !== undefined ) {
                sense.text = text.trim();
                res.push(sense);
                text = '';
              }
              sense = {'start' : g.tfOff, 'len' : 1, 'spcAft' : false};
              pathEnd = g.endOffset();
            } else if (!g.isWord && g.tfOff === pathEnd) {
              if (sense !== undefined ) {
                sense.spcAft = true;
              }
            }
            text += $e.text();
          }
        }
        sense.text = text.trim();
        res.push(sense);
        return res;
      },

      /**
       * Public method to select the sense assigned to a word
       * @param $word jQuery object with the word (.menu-word) to select
       * @param $tile jQuery object with the sense tile (.idl-tile-container) to select
       */
      select : function($word, $tile) {
        var base = this;
        
        var widx = $word.data("widx");
        if (typeof widx !== 'undefined') {
          base.words[widx].setSelected($tile);
        }
      },
      
      /**
       * Public method to deselect the sense assigned to a word.
       * @param $word jQuery object with class .menu-word
       */
      deselect : function ($word) {
        var base = this;
        
        var widx = $word.data("widx");
        if (typeof widx !== 'undefined') {
          base.words[widx].deselect();
        }
      },
      
      /**
       * Public method to deselect all senses
       */
      deselectAll : function () {
        this.words.forEach(function (word) { word.deselect(); });
      },
      

      /**
       * Public method to close any opened menus
       */
      close : function() {
        this.words.forEach(function(word) { word.close(); });
      },


      /**
       * Public method to cleanup
       */
      destroy : function() {
        this.words.forEach( function(word) { word.destroy(); } );
        this.$elem.removeData("taggingMenu");
      },
      
      
      /** Private function to retrieve the sensecard shown in the tool tip */
      _getSenseCard : function (word) {
        var base = this;

        /* Assemble request parameters depending on type of card */
        var cacheKey;
        var data = { tmplt : base.tmplt};
        var fsk = word.$tile.data('fsk');
        data.fsk = cacheKey = fsk;
        
        /* Check if already in cache */
        cacheKey = cacheKey.replace(/\W/g, '');
        var html = base.sensecards[cacheKey];
        if (html !== undefined) {
          return html;
        }
        
        /* Make jsonp request to retrieve */
        $.ajax({
          data: data,
          type: 'GET',
          url: base.options.apiUrl + "sensecard.js",
          dataType: 'jsonp'
        }).done(function (data) {
          var card = data.card;
          base.sensecards[cacheKey] = card;
          word._popover({content: card});
        });
        return '';
      },

      /** Constructor */
      _create: function() {
        var base = this;

        /* Pass on the options to the Word adding our callback */
        var wordOptions = $.extend({}, base.options, { 
          sensesel: function (event) {
            event.allset = !base.$elem.children(".idl-untagged").is(':visible');
            if (base.options.informOnOther && 
                event.$selTile.hasClass("idl-tile-other")) {
              window.setTimeout(base.notifyOnOther, 1000, base, event);
            }
            if (typeof base.options.sensesel === "function") {
              return base.options.sensesel.call(this, event);
            }
            return true; /* allow to replace word with lemma */
          }
        });

        if (base.options.wordsContent === "tile") {
          /* if showing tiles, tooltips should not be used */
          if (base.options.useToolTip) {
            alert("TaggingMenu \"useToolTip\" option should be false when \"wordsContent\" option is \"tile\".");
          }
        } else {
          base.$elem.addClass("idl-text-mode");
        }
        
        if (base.options.useToolTip) {
          if (base.$elem.popover !== undefined) {
            base.$elem.on("mouseenter mouseleave", ".idl-tagged", function(event) {
              var e = $(this);
              var word = base.words[e.data("widx")];

              if (event.type === "mouseenter") {
                var html = base._getSenseCard(word);
                if (html !== "") {
                  word._popover({show: true, content: html});
                } else {
                  word._popover({show: true});
                }
              }
              else {
                word._popover({show: false});
              }
            });
          }
          else {
            alert("Using tooltip without popover defined. Set useToolTip to false in options.");
          }
        }
        
        base.options.menus.on("click", ".idl-to-carousel, .idl-to-grid", function(e) {
          var view = $(e.currentTarget).data("view");
          base.words.forEach(function (word) {
            word.setView(view);
          });
          e.stopPropagation();
        });
        
        /* 
         * On word sense selection updates next siblings 
         */
        base.$elem.on("tm_itl_sensesel", function(event, data) {
          base._senseSelHdlr(data);
        });
        
        /* Find each spanned text element and create their managing Word instance */
        var tfOff = -1;
        base.$elem.children().each(function (idx, elem) {
          var $elem = $(elem);
          if ($elem.hasClass("idl-menu-word")) {
            tfOff = parseInt($elem.data("off"), 10);
            var w = Object.create(Word);
            var $menu = base.options.menus.children('[data-off="' + tfOff + '"]');
            w.init(wordOptions, $elem, $menu);
            var widx = base.words.length;
            $elem.data("widx", widx);
            base.words[widx] = w;
          } else {
            var g = Object.create(Gap);
            var tfOffAttr = $elem.data("off");
            tfOff = tfOffAttr !== undefined ? parseInt(tfOffAttr, 10) : tfOff + 1;
            g.init($elem, tfOff, tfOffAttr !== undefined);
            if (base.options.hideUntaggable && $elem.text().trim().length) {
              $elem.addClass("hidden");
            }
            var gidx = base.gaps.length;
            $elem.data("gidx", gidx);
            base.gaps[gidx] = g;
          }
        });

        /* For each one that have a sense selected, inform that selected.
         * This can't be done during creation because the menus listen to each other. */
        for (var i = 0; i < base.words.length; ++i) {
          var word = base.words[i];
          var $selTile = word.selected();

          if ($selTile) {
            if (base.options.preselect === 'sa' || 
                (base.options.preselect === 'mono' && !word.polysemous())) {
              word.setSelected($selTile);
            } else {
              $selTile.removeClass("idl-sensesel");
            }
          }
          else if (word.$elem.is(":visible") && word.$tile) {
            word.setSelected(word.$tile);
          }
        }
      },
      
      /** Handler to show/hide text elements depending on sense selection */
      _senseSelHdlr : function (data) {          
        
        var base = this;
        var visEnd = data.selEnd; /* end offset of last element visible in path*/
        var pathEnd = Math.max(data.selEnd, data.prevEnd); /* end of the path where we can stop */
        
        /* Updates next siblings */
        var elements = data.$text.nextAll();
        for (var i = 0; i < elements.length; ++i) {
          
          var $e = $(elements[i]);  
          
          /* 
           * Handle the gap: 
           *   Visible when after the end of last visible word, hidden when underneath
           */
          if (!$e.hasClass('idl-menu-word')) {
            var gap = base.gaps[$e.data("gidx")];
            var pathOff = gap.tfOff;
            if (pathOff < visEnd) {
              $e.hide();
            } else {
              $e.show();
              visEnd = gap.endOffset();
            }
            continue;
          }
          
          /*
           * Handle the word:
           *   Visible when starting after the end of the last visible word
           *   When enabling, move visible end to match end of word
           */
          var word = base.words[$e.data("widx")];
          var wordOff = word.startOffset();
          var wordEnd = word.endOffset();
          
          if (wordOff === pathEnd) {
            break;
          }
          if (wordOff < visEnd) {
            $e.hide();
          } else {
            visEnd = wordEnd;
            if (base.options.wordsContent === "tile" && word.$tile) {
              word.setSelected(word.$tile);
            }
            $e.show();
          }
          if (wordEnd > pathEnd) {
            pathEnd = wordEnd;
          }
        }
      },
      
      /** Inform Idilia when a sense "other" is selected. */
      notifyOnOther : function(base, event) {
        $.get(base.options.apiUrl + 'other_sense.js', {
          'text' : base.text(), 
          'word' :  event.$text.text()
        });
      }
  };

  /** Add to jQuery namespace method to create a tagging menu with options */
  $.fn.taggingMenu = function (options) {
    return this.each(function () {
      var $elem = $(this);
      var sm = $elem.data("taggingMenu");
      if (sm === undefined) {
        sm = Object.create(TaggingMenu);
        $elem.data("taggingMenu", sm);
      }
      sm.init(options, this);
    });
  };

  /** Add to jQuery namespace the default tagging menu options */
  $.fn.taggingMenu.options = {
    menus: null,      /* jQuery element that is hosting the menus for each word */
    useToolTip: true, /* whether tagging menus use a tooltip widget to display gloss */
    wordsContent: "text", /* whether tagging menus show text or tiles */
    hideUntaggable: false, /* whether tagging menus should hide text which is not to be tagged */
    informOnOther: true, /* Notify Idilia of sense selection with "other" sense */
    closeOnSelect: true,   /* Close menu on sense selection */
    closeOnOutsideClick: true, /* Close menu when a click is outside the opened sense menu */
    apiUrl: 'https://api.idilia.com/1/kb/', /* Service url to obtain the sensecards */
    preselect: 'sa',  /* Preselect the senses based on the output of Sense Analysis. Others are 'mono', 'none' */
    senseMenuOptions : {}, /* Sense menu options. None given here to use the defaults */
    sensesel: null,     /* callback function when a sense is selected */
    sensedesel: null,   /* callback function when a sense is deselected */
    createsel: null,    /* callback function when a create sense is selected */
    beforeOpen: null,   /* callback function before a menu is opened */
    afterClose: null    /* callback function after a menu has been closed */
  };
}(jQuery, window, document));

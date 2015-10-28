/**
 * JQuery widget for animating a sense card
 * Version: $version
 * 
 * Widget should be attached to the div containing the sensecard (.idl-tile-container)
 * 
 * 
 * Available for use under the MIT License (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * Copyright (c) 2015 by Idilia
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

  /**
   * Class to operate the sense card.
   */
  var SenseCard = {
      
      /** 
       * Public method to initialize an instance on 'el'. 
       * Normally called by $.fn.senseCard 
       */
      init : function (options, el) {
        var base = this;
        base.$elem = $(el);
        base.options = $.extend({}, $.fn.senseCard.options, options);
        
        base._create();
      },
      
      /**
       *  Public method to toggle the visibility if the definition 
       */
      toggleDef : function () {
        var base = this;
        var $def = base.$elem.find('.idl-def-tgl');
        if ($def.size() > 0)
          base._toggleDefEH($def.first());
      },
      
      /**
       * Public method to cleanup 
       */
      destroy: function () {
        this.$elem.removeData("senseCard");
      },

      
      /** Constructor */
      _create: function () {
        var base = this;
        
        /* Enable revealing the long definition if we find a toggle button */
        base.$elem.find('.idl-def-tgl').click(function(event) {
          base._toggleDefEH($(this));
          event.preventDefault();
          event.stopPropagation();
        });
        
        /* Enable editing the card if we find an edit button */
        var $edit = base.$elem.find('.idl-sense-edit');
        if ($edit.size() > 0) {
          $edit.click(function (event) {
            var $card = $(this).closest(".idl-tile-container");
            base._senseEditEH($card);
            event.preventDefault();
            event.stopPropagation();
          });
          base._loadLgcc();
        }
      },
      
      
      /**
       * Event handler for request to expand or close the definition.
       * $tgl is the element with class idl-def-tgl
       */
      _toggleDefEH : function ($tgl) {
        var base = this;
        var $st = $tgl.closest('.idl-sensetile');
        var $def = $st.children('.idl-def');
        var showingDefn = $def.is(":visible");
        if (showingDefn) {
          $def.slideUp(300);
          $tgl.removeClass('idl-def-hide-icon').addClass('idl-def-show-icon');
        } else {
          $def.slideDown(300);
          $tgl.removeClass('idl-def-show-icon').addClass('idl-def-hide-icon');
        }
      },
      
      /**
       * Event handler for a request to edit a sense 
       * $card: The card to edit
       */
      _senseEditEH: function($card) {
        var base = this;
        
        /* Return if the LGCC failed to load or not loaded yet */
        var errMsg="This functionality is not available at this time. Please retry later.";
        if (!(window.com && com.idilia && com.idilia.lgcc)) {
          alert(errMsg);
          return;
        }
        
        /* Change the cursor to progress */
        $card.css("cursor", "progress");
        
        var sk = $card.data("fsk");
        var len = $card.data("len") || 1;
        var tmplt = $card.attr("class").match(/idl-tmplt-[\w-]*\b/)[0].substring(10);
        var custId = $card.data("customer");
        var auth = $card.data("auth-token");
        
        com.idilia.lgcc.editMeaning(this.$elem, this.options.lgcc, {
          customerId: custId, /* id customer adding sense */
          token: auth,  /* authentication token */
          sk: sk,       /* fsk of sensekey to edit */
          tmplt: tmplt, /* template of the sensecard to return */
          len : len,    /* number of tokens spanned by expression */
          v: 1          /* version number of protocol used by client */
        }).done(function (res) {
          if (res && res['card']) {
            var $newCard = $(res['card']);
            var opts = base.options;
            $card.replaceWith($newCard);
            $newCard.senseCard(opts);
            if (typeof opts.edited === "function") {
              base.options.edited.call($newCard[0]);
            }
          }
        }).fail(function (res) {
          alert(errMsg);
        }).always(function () {
          $card.css("cursor", "");
        });
      },
      
      _loadLgcc: function() {
        if (window.com && com.idilia && com.idilia.lgcc) {
          return;
        }
        if ($('#lgcc-script').size() > 0) {
          return;
        }
        $('head').append('<script id="lgcc-script" type="application/javascript" src="' + this.options.lgcc + 'apijs/lgcc.js"></script>');
      },
      
      end: null
  };

  /** 
   * Add to jQuery namespace method to create a sense card with options
   */
  $.fn.senseCard = function (options) {
    return this.each(function () {
      var $elem = $(this);
      var sc = $elem.data("senseCard");
      if (sc === undefined) {
        sc = Object.create(SenseCard);
        $elem.data("senseCard", sc);
      }
      sc.init(options, this);
    });
  };

  /** 
   * Add to jQuery namespace the default sense card options.
   */
  $.fn.senseCard.options = {
    edited : null,
    lgcc: 'https://lgcc.idilia.com/lgcc/'
  };
}(jQuery, window, document));
/**
 * JQuery widget for a sense menu
 * Version: $version
 * 
 * This menu enables the user to switch between a grid view and a carousel view.
 * The carousel is provided by owl-carousel.
 * 
 * Usage example:
 * 
 * The HTML should look like this:
 *  <div class="idl-sensemenu" data-off="0">
 *   <div class="idl-navbar" role="navigation">
 *    <div class="idl-view-ctrls">
 *     <ul>
 *      <li><a href="#" data-grp="0">Top</a></li>
 *     </ul>
 *    </div>
 *    <div class="idl-view-ctrls">
 *     <ul>
 *      <button type="button" class="btn navbar-btn btn-default toCarousel"><span class="fa fa-rotate-90 fa-bars"></span></button>
 *      <button type="button" class="btn navbar-btn btn-default toGrid"><span class="fa fa-th"></span></button>
 *     </ul
 *    </div>
 *   </div>
 *   
 *   <div class="idl-sensetiles">
 *    <div class="idl-tile-container idl-sensesel idl-grpsel" data-fsk="dog/N1" data-grp="0" data-len="1">
 *     <div class="idl-sensetile" >
 *      <!-- tile content -->
 *     </div>
 *    </div> <!-- end of a sense -->
 *   </div> <!-- end of all senses -->
 *  </div> <!-- end the menu -->
 *
 *
 * Important CSS classes:
 * ======================
 *   - idl-sensesel - added to the .idl-tile-container that is selected
 *   - idl-grpsel   - added to the .idl-tile-container of the group selected in the navbar
 *   - idl-grid     - added to the widget element (normally .sensemenu) when switching to grid layout
 *   - idl-carousel - added to the widget element when switching to carousel layout
 *   - hidden -   added/removed to the widget element when menu is closed/opened
 *   - active -   added to the selected group in the navigation bar and to layout control button
 *   
 *   
 * Options:
 * ========
 *  An object of options can be passed when the widget is created. The options are:
 *   - gridTileContainerClass - string with the names of classes to add to the elements
 *           with class 'idl-tile-container' when switching to grid mode.
 *   - view - starting view for the menu. Values are 'carousel' or 'grid'.
 *   - carouselOptions - object with the options for the owl carousel.
 *   - sensesel - function callback for when a sense is selected.
 *   - createsel - function callback for when user elects to create a new sense
 * 
 * 
 * Events:
 * =======
 *   - sensesel - triggered when selecting sense is changing. Function arguments are:
 *      - arg1 - element on which the widget is attached
 *      - arg2 - an object with the properties:
 *         - $selTile   - jQuery element of class 'idl-tile-container' that was selected
 *         - $prevTile  - jQuery element of previous 'idl-tile-container'
 * 
 *   - creasesel - triggered when user selects the card "create missing meaning"
 *     - arg1 - element on which the widget is attached
 * 
 * Instantiation:
 * ==============
 * The widget is created using:
 * 
 *  $(...).senseMenu({
 *       
 *       // Add a handler when a sense is selected.
 *       sensesel: function (elem, data) {
 *        // do something on sense selected. Probably close
 *       }
 *
 *    });
 *     
 * where the jQuery selected matches items with class '.idl-sensemenu'.
 * 
 *  The widget instance can be retrieved using:
 *    $(...).data("senseMenu");
 *
 *
 * Methods:
 * ========
 *   open([view]): Opens the menu in the view selected.
 *   close(): Closes the menu.
 *   destroy(): Destroys the menu
 *   select(senseIdx, [DOM element]) : Selects the given sense
 *   
 * Methods can be invoked directly on the widget retrieved using "data" as shown above.
 * 
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

  /**
   * Class to operate the sense menu. Notifies listener on sense selection.
   */
  var SenseMenu = {

      /* Public method to initialize an instance on 'el'. Normally called by $.fn.senseMenu */
      init : function (options, el) {
        var base = this;
        
        base.$elem = $(el);
        base.options = $.extend({}, $.fn.senseMenu.options, base.$elem.data(), options);
        
        base.$selTile = null;     /* sensetile (.idl-tile-container) currently selected */
        base.navE = null;         /* element holding the navigator bar when one is present */
        base.carouselW = null;    /* carousel widget when instantiated */
        base.view = base.options.view; /* current view if/when opened, initialized with options value */
        
        base.nTiles = null;       /* number of tiles in the menu */
        base.tileWidth = null;    /* width of one tile */
        base.widthInTiles = null; /* number of tiles shown in each row */
        
        base._create();
      },
  
      /**
       * Public method to trigger the selection of a sense
       * @param $tile jquery element of the tile to select. It has class .idl-tile-container
       */
      select: function ($tile) {
        var base = this;
        
        /* Construct event data for the new and old sense */
        var eventData = { '$selTile': $tile };
        if (base.$selTile) {
          eventData['$prevTile'] = base.$selTile;
        }
        
        if (base.$selTile != $tile) {
          if (base.$selTile) {
            base.$selTile.removeClass("idl-sensesel");
          }
        }

        /* Send correct event depending on type of card selected */
        if ($tile.hasClass("idl-tile-create")) {
          base.$seltile = null;
          base.options.createsel.call(this, eventData);
        } else if (typeof base.options.sensesel === "function") {
          $tile.addClass("idl-sensesel");
          base.$selTile = $tile;
          base.options.sensesel.call(this, eventData);
        }
      },

      /**
       * Method to set the view for the next time this menu is displayed
       * @param view Value is 'grid' to set grid mode where all the tiles are visible or 'carousel'
       *             to present the tiles in a slider.
       */
      setView: function(view) {
        var base = this;
        if (base.view != view && base.$elem.is(":visible")) {
          base.open(view); }
        base.view = view;
      },
     
      /**
       * Public method to open the menu with the view selected
       */
      open: function (view) {
        var base = this;
        
        if (view) {
          base.view = view; }

        /* Remove the carousel widget when we won't need it */
        if (base.carouselW && base.view != 'carousel') {
          base.carouselW.destroy();
          base.carouselW = null;
        }

        // Force the width of the current menu to a discrete factor of the tile width
        base._adjustWidth();

        /* Enable visibility for the menu */
        /* This is done before the actual menu structure is constructed */
        /* because the carousel will otherwise fade it in */
        base.$elem.removeClass("hidden").addClass("idl-sensemenu-open");

        /* Create the view if not currently existing */
        if (base.view === 'grid') {
          base._createGrid(); }
        else if (base.view === 'carousel') {
          base._createCarousel(); }

        return this;
      },

      /**
       * Public method to close the menu. Does not change the view nor destroy it.
       */
      close: function () {
        var base = this;
        
        base.$elem.addClass("hidden").removeClass("idl-sensemenu-open");
        return this;
      },

      /**
       * Public method to return the currently selected sense. 
       */
      selected : function () {
        return this.$selTile;
      },

      /**
       * Public method to cleanup 
       */
      destroy: function () {
        var base = this;
        
        if (base.carouselW) {
          base.carouselW.destroy();
        }
        base.$elem.removeData("senseMenu");
        base.$elem.children('.idl-sensetiles').children().each(function () {
          $(this).data("senseCard").destroy();
        });
      },

      
      /** Constructor */
      _create: function () {
        var base = this;
        
        base.$elem.addClass("hidden");

        base._createNavBar();
        
        base.$elem.on('click', ".idl-tile-container", function (event) {
          /* Remove group and current selection highlights */
          base._unhighlightSenseGroups();

          /* Highlight current select and trigger the event */
          var $card = $(this);
          if (!$card.hasClass("idl-tile-create")) {
            base.select($card);
          } else {
            base._addSenseCardEH(event, $card);
            event.stopPropagation();
          }
          event.preventDefault();
        });
        
        /* Detect that we might need the LGCC */
        var $addLinks  = base.$elem.find('.idl-create-links');
        if ($addLinks.size() > 0) {
          /* Handler when selecting a create link */
          $addLinks.on('click', 'a', function (event) {
            base._senseCreateEH($(this));
            event.preventDefault();
            event.stopPropagation();
          });
                    
          /* Load the script that we need if not here yet. */
          base._loadLgcc();
        }
        
        /* Add handlers to switch between grid and carousel views */
        var $ctrls = base._viewCtrls();
        if ($.fn.owlCarousel === undefined)
        {
          $ctrls.find(".idl-to-carousel").hide();
          $ctrls.find(".idl-to-grid").hide();
        }
        else
        {
          $ctrls.find(".idl-to-carousel").data("view", "carousel");
          $ctrls.find(".idl-to-grid").data("view", "grid");
          $ctrls.on('click', ".idl-to-carousel, .idl-to-grid", function (event) {
            base.setView($(event.currentTarget).data("view"));
            /* event will propagate up and can be used to set view on other menus to keep consistency */
          });
        }

        /*  Handler to toggle showing image or text on all the cards */
        $ctrls.find(".idl-def-tgl").on('click', function (event) {
          var $butTxt = $(this);
          var $tgls = base.$elem.find("div.idl-def-tgl");
          var $defs = $tgls.closest('.idl-sensetile').children('.idl-def');
          if ($butTxt.hasClass('idl-def-hide-icon')) {
            $defs.slideUp(300);
            $tgls.add($butTxt).removeClass('idl-def-hide-icon').addClass('idl-def-show-icon');
          } else {
            $defs.slideDown(300);
            $tgls.add($butTxt).removeClass('idl-def-show-icon').addClass('idl-def-hide-icon');
          }
          event.preventDefault();
          event.stopPropagation();
        });
        
        $(window).resize( function(e) {
          if (base.$elem.is(":visible")) {
            base._refreshWidth(); }
        });

        /* Active the sensecard plugin on all our sensecards. */
        base.$elem.children('.idl-sensetiles').children().senseCard({lgcc: base.options.lgcc});
        
        /* Ensure that we know the selected sense if any */
        base._selTileIdx();
      },


      /*
       * Private functions
       */

      /**
       * Adjust menu width either when window is resized (from _refreshWidth) or
       * opened (from open).
       */
      _adjustWidth: function(currWidth)
      {
        var base = this;
        var parentWidth = base.$elem.parent().width();

        if (base.tileWidth === null)
        {
          // First time this is displayed, need to unhide to get tileWidth
          var senseTiles = base.$elem.find('.idl-sensetile');
          base.$elem.removeClass("hidden");
          base.tileWidth = senseTiles.first().outerWidth() + 10;
          base.$elem.addClass("hidden");
          base.nTiles = senseTiles.length;
        }

        base.widthInTiles = Math.floor(parentWidth/base.tileWidth);
        var adjWidth = Math.min(base.tileWidth * base.widthInTiles, base.nTiles * base.tileWidth);

        if (currWidth != adjWidth)
        {
          base.$elem.css({"width": adjWidth});
          base.options.carouselOptions.items = Math.max(Math.floor(adjWidth/base.tileWidth), 1);
        }

        return adjWidth;
      },
      
      /** Called when window gets resized and menu is visible */
      _refreshWidth: function()
      {
        var base = this;
        var currWidth = base.$elem.width();
        var newWidth = base._adjustWidth(currWidth);

        if (newWidth != currWidth && base.carouselW)
        {
          // The grid view does not require any action. The carousel needs to be
          // recreated though.
          base.carouselW.destroy();
          base.carouselW = null;
          base._createCarousel();
        }
      },

      /**
       * Private function to create the carousel view
       *  - create the carousel itself including the styling changes
       */
      _createCarousel : function () {
        var base = this;
        
        base._senseTiles().removeClass(base.options.gridTileContainerClass);
        base.$elem.removeClass("idl-grid").addClass("idl-carousel");

        var carE = base.$elem.children('.idl-sensetiles').first();
        var selIdx = base._selTileIdx();

        base.carouselW = carE.
          owlCarousel(
            $.extend({responsive: false}, $.fn.senseMenu.options.carouselOptions, base.options.carouselOptions)).
          data("owlCarousel");

        if (selIdx)
          base.carouselW.jumpTo(selIdx);

        carE.find('.owl-controls').on("click", function (event) {
          event.stopPropagation();
          event.preventDefault();
        });

        base.view = 'carousel';
        base._styleViewButtons();
      },

      /** Private function to create the grid view */
      _createGrid : function () {
        var base = this;
        
        base._senseTiles().addClass(base.options.gridTileContainerClass);
        base.$elem.removeClass('idl-carousel').addClass("idl-grid");
        base.view = 'grid';
        base._styleViewButtons();
      },

      /** Private function to create the nav bar with the groups found in the sense inventory */
      _createNavBar : function () {
        var base = this;
        
        /* Check that we have a navbar. If not, we won't use one. */
        base.navE = base.$elem.find(".idl-nav-grps").first();
        if (!base.navE) {
          return;
        }

        /* Add a event handler that updates the tiles of that group when group is selected */
        base.navE.find('a').on('click', function (event) {
          base._unhighlightSenseGroups();

          /* Highlight selected group link */
          var $grp = $(this);
          $grp.addClass("active");

          /* Add class grpsel to sense tiles with this group name and slide carousel to first one. 
           * The group name is actually the index of the first sense tile of the group. */
          var grpName = $grp.data("grp");
          var filter = '[data-grp="' + grpName + '"]';
          base._senseTiles().filter(filter).addClass("idl-grpsel");          
          if (base.carouselW) {
            base.carouselW.jumpTo(parseInt(grpName, 10));    
          }
          event.stopPropagation();
          event.preventDefault();
        });
      },

      /** Private function to de-highlight a sense group selection */
      _unhighlightSenseGroups: function () {
        var base = this;
        
        if (!base.navE) {
          return;
        }
        base.navE.find('a').removeClass('active');
        base._senseTiles().removeClass("idl-grpsel");
      },
      
      /** Style buttons that activate a view */
      _styleViewButtons : function () {
        var base = this;
        var ctrls = base._viewCtrls();
        
        if (base.view === 'carousel') {
          ctrls.find(".idl-to-grid").removeClass("active");
          ctrls.find(".idl-to-carousel").addClass("active");
        } else {
          ctrls.find(".idl-to-carousel").removeClass("active");
          ctrls.find(".idl-to-grid").addClass("active");
        }
      },
      
      /** Return the collection of sense tiles */
      _senseTiles : function () {
        return this.$elem.find(".idl-tile-container");
      },
      
      /** Return the container for the view control buttons */
      _viewCtrls : function () {
        return this.$elem.children(".idl-navbar").find('.idl-view-ctrls');
      },
      
      /** Return the index of the selected sense or undefined if none. Also updates base.$selTile. */
      _selTileIdx: function () {
        var base = this;
        
        /* warning: side effect */
        if (!base.$selTile) {
          var s = this.$elem.find(".idl-sensesel");
          if (s.length > 0) {
            base.$selTile = s.first();
          }
        }
        
        if (base.$selTile) {
          var i = 0;
          var child = base.$selTile[0];
          while( (child = child.previousSibling) !== null ) {
            i++;
          }
          return i;
        }
        return undefined;
      },
      
      /**
       * Event handler when clicking on the add sense card
       * $card: the card clicked
       */
      _addSenseCardEH: function(event, $card) {
        var base = this;
        
        var $addLinks  = $card.find('.idl-create-link');
        if ($addLinks.size() === 1) {
          /* A single word link, we can trigger it immediately */
          base._senseCreateEH($addLinks.first());
          return;
        }
        
        var $def = $card.find('.idl-def');
        if (!$def.is(":visible")) {
          $def.slideDown(300);
          $card.css("cursor", "default");
        }
      },
      
      /** 
       * Event handler when clicking on a link inside the add sense card
       */
      _senseCreateEH: function($link) {
        
        if ($link.parent().hasClass('idl-create-link-more')) {
          /* Reveal additional links when idl-create-link-more */
          $link.parent().hide().nextAll().show();
          return;
        }
        
        var errMsg="This functionality is not available at this time. Please retry later.";
        if (!window.com || !com.idilia || !com.idilia.lgcc) {
          alert(errMsg);
          return;
        }
        
        var base = this;
        var $card = $link.closest(".idl-tile-container");
        
        /* 
         * Change the cursor to progress. Save original because it can be either
         * a pointer when a single link or a cursor when multiple links.
         */
        var cursorVal = $card.css("cursor");
        $card.css("cursor", "progress");
        
        /* Read the word from the title of the card */
        var text = $link.text();
        var len = $link.data("len");
        var tmplt = $card.attr("class").match(/idl-tmplt-[\w-]*\b/)[0].substring(10);
        var custId = $card.data("customer");
        var auth = $card.data("auth-token");
        
        /* 
         * Invoke the function loaded from the LGCC web site.
         * This creates the frame and returns a promise which is signaled
         * when the frame interaction completes (i.e., new meaning is defined).
         */
        com.idilia.lgcc.createMeaning(this.$elem, this.options.lgcc, {
          customerId: custId, /* id customer adding sense */
          token: auth,  /* authentication token */
          text: text,   /* text selected for the sensekey */
          tmplt: tmplt, /* template of the sensecard to return */
          len : len,    /* number of tokens spanned by expression */
          v: 1          /* version number of protocol used by client */
        }).done(function (res) {
          if (res && res['card']) {
            base.nTiles = base.nTiles + 1;
            base._refreshWidth();
            var $newCard = $(res['card']);
            $card.before($newCard);
            $newCard.senseCard({lgcc: base.options.lgcc});
          }
        }).fail(function (res) {
          alert(errMsg);
        }).always(function () {
          $card.css("cursor", cursorVal);
          var $def = $card.find('.idl-def');
          if ($def.is(":visible")) {
            $def.hide();
          }
        });
      },
      
      _loadLgcc: function() {
        if (window.com && com.idilia && com.idilia.lgcc) {
          return;
        }
        if ($('#lgcc-script').size() > 0) {
          return;
        }
        $.ajaxSetup({ cache: true });
        $('head').append('<script id="lgcc-script" type="application/javascript" src="' + this.options.lgcc + 'apijs/lgcc.js"></script>');
      },
      
      end: null
  };

  /** Add to jQuery namespace method to create a sense menu with options */
  $.fn.senseMenu = function (options) {
    return this.each(function () {
      var $elem = $(this);
      var sm = $elem.data("senseMenu");
      if (sm === undefined) {
        sm = Object.create(SenseMenu);
        $elem.data("senseMenu", sm);
      }
      sm.init(options, this);
    });
  };

  /** 
   * Add to jQuery namespace the default sense menu options.
   */
  $.fn.senseMenu.options = {
      sensesel: null,
      createsel: null,
      gridTileContainerClass: "", /* classes to add to .tile-container in grid mode */
      view: 'grid',  /* view into which to open the menu */
      lgcc: 'https://lgcc.idilia.com/lgcc/',
      carouselOptions : {
        navigation: true,
        navigationText: [ '<svg class="idl-owl-btn idl-owl-btn-prev"><polygon points="11,3 16,3 6,29 16,56 11,56 1,29"/></svg>', '<svg class="idl-owl-btn idl-owl-btn-next"><polygon points="3,3 8,3 18,29 8,56 3,56 13,29"/></svg>' ],
        scrollPerPage: true,
        pagination: false,
        paginationSpeed: 0,
        slideSpeed: 100,
        rewindNav: false
      }
  };
}(jQuery, window, document));

/**
 * JQueryUI widget for a block of text with many words to tag
 * Version: $version
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
  var _htmlClickEnabledCount = 0;
  
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
        event['$text'] = base.$elem;
        event['selStart'] = base.tfOff;
        base.endOff = event['selEnd'] = base.tfOff + parseInt(event['$selTile'].data("len") || "1", 10);

        if (event['$prevTile']) {
          event['prevStart'] = base.tfOff;
          event['prevEnd'] = base.tfOff + parseInt(event['$prevTile'].data("len") || "1", 10);
        }
        
        base.$tile   = event['$selTile'];

        /* Update the attributes of the text element */
        var fsk = event['$selTile'].data('fsk');
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
            base.$elem[0].innerHTML = event['$selTile'][0].outerHTML;
            base.$elem.senseCard({lgcc: base.options.senseMenuOptions.lgcc});
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
        if (base.options.closeOnSelect)
          base.close();
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
          data['prevStart'] = base.tfOff;
          data['prevEnd'] = base.tfOff + parseInt(base.$tile.data("len") || "1", 10);
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

      _htmlClickHandler: function(event) {
        if ($(event.target).closest(".idl-sensemenu").size() > 0) {
          return;
        }
        if (!_doNotClose && _openedWord) {
          _openedWord.close();
        }
        _doNotClose = false;
      },

      _monitorHtmlClicks : function(enable) {
        var base = this;
        
        if (enable)
        {
          if (_htmlClickEnabledCount === 0) {
            $("html").on("click", base._htmlClickHandler);
          }
          _htmlClickEnabledCount++;
        }
        else
        {
          --_htmlClickEnabledCount;
          if (_htmlClickEnabledCount === 0) {
            $("html").off("click", base._htmlClickHandler);
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
          
          base._monitorHtmlClicks(true);

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
          base._monitorHtmlClicks(false);
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
          var $tile = base.$menu.find(".idl-tile-container[data-grp]").first();  /* first tile part of a group, excluding others */
          if ($tile.length === 0) {
            $tile = base.$menu.find(".idl-tile-other");
          }
          if ($tile.length === 0) {
            $tile = base.$menu.find(".idl-tile-any");
          }
          if ($tile.length !== 0) {
            base.$tile = $tile;
            base.$elem[0].innerHTML = base.$tile[0].outerHTML; /* set the tile idl-menu-word content to the tile */
          } else {
            // If showing tiles and there is no sense, synthesize one
            base.$elem[0].innerHTML = '<div class="idl-tile-container idl-menu-sensecard idl-sensesel idl-tile-text idl-tmplt-menu_image_v3" data-grp="1"><div class="idl-sensetile"><div class="idl-tile-sum"><h1>' + base.$elem.data("tok") + '</h1></div><div class="idl-def"><p>Any sense (no known meaning).</p></div></div></div>';
            base.$tile = base.$elem.find(".idl-tile-container").first();
          }
        }
        
        /* Create the menu with the HTML fragment. */
        base.menuW = base.$menu.senseMenu($.extend({}, base.options.senseMenuOptions, {

          /* Add a handler when a sense is selected. */
          sensesel: function (event) {
            base.select(event);
          },
          
          /* Add a handler when a create sense action is selected. */
          createsel: function (event) {
            event['$text'] = base.$elem;
            base.options.createsel(event);
            if (base.options.closeOnSelect) {
              base.close();
            }
          }

        })).data("senseMenu");

        base.$elem.on({
          /** handler when the text/tile is clicked. 
           *  Open this word's menu if more than one card 
           */
          "click" : function (event) {
              if (base.polysemous()) {
                base.open();
              }
          }
        });

        /** Initialize as untagged */
        base.$elem.addClass("idl-untagged");
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
                sense['text'] = text.trim();
                res.push(sense);
                text = '';
              }
              sense = {'start' : w.tfOff, 'len' : w.endOff - w.tfOff, 'spcAft' : false};
              var fsk = $e.data('fsk');
              if (fsk) {
                sense['fsk'] = fsk;
              }
              pathEnd = w.endOff;
            }
            text += $e.data('tok');
          } else {
            var g = base.gaps[$e.data("gidx")];
            if (g.isWord && g.tfOff === pathEnd) {
              if (sense !== undefined ) {
                sense['text'] = text.trim();
                res.push(sense);
                text = '';
              }
              sense = {'start' : g.tfOff, 'len' : 1, 'spcAft' : false};
              pathEnd = g.endOffset();
            } else if (!g.isWord && g.tfOff === pathEnd) {
              if (sense !== undefined ) {
                sense['spcAft'] = true;
              }
            }
            text += $e.text();
          }
        }
        sense['text'] = text.trim();
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
        var cacheKey = undefined;
        var data = { tmplt : base.tmplt};
        var fsk = word.$tile.data('fsk');
        data['fsk'] = cacheKey = fsk;
        
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
          var card = data["card"];
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

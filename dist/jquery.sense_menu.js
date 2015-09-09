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

; /* Intentional, whatever linting reports */

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
      },

      
      /** Constructor */
      _create: function () {
        var base = this;
        
        base.$elem.addClass("hidden");

        base._createNavBar();
        
        base.$elem.on('click', ".idl-tile-container", function (event) {
          /* Remove group and current selection highlights */
          base._unhighlightSenseGroups();

          var $card = $(this);
          if ($card.hasClass("idl-tile-create")) {
            base._senseCreateEH($card);
            event.preventDefault();
          } else {
            /* Highlight current select and trigger the event */
            base.select($card);
          }
        });

        base.$elem.on('click', ".idl-def-tgl", function (event) {
          /* Add a handler when the expand/collapse definition buttons are clicked. */
          base._toggleDefEH(event, $(this));
          event.preventDefault();
          event.stopImmediatePropagation();
        });
                
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
          var $defs = $tgls.siblings('.idl-def');
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

        if (typeof base.tileWidth === 'undefined')
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
       * Event handler for request to expand or close the definition.
       * $tgl is the element with class idl-def-tgl
       */
      _toggleDefEH : function (event, $tgl) {
        var base = this;
        var $st = $tgl.parent();
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
       * Event handler for a request to create a new sense
       * $card: The 'add sense card' (.idl-tile-container .idl-tile-create)
       */
      _senseCreateEH: function($card) {
        if (!window.com || !com.idilia || !com.idilia.lgcc) {
          alert("lgcc.js was not loaded");
          return;
        }
        
        /* Read the word from the title of the card */
        var word = $card.find(".idl-tile-sum h1").text();
        
        /* Read the customer from the parent */
        var $menu = $card.closest(".idl-sensemenu");
        var custId = $menu.data("customer");
        var auth = $menu.data("auth-token");
        
        com.idilia.lgcc.createSense( {
          customerId: custId,
          word: word,
          token: auth
        }).then(function (res) {
          alert("Callback from lgcc");
          /* insert the card in the menu */
        });
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
   * Note that these are using CSS classes from Font Awesome
   */
  $.fn.senseMenu.options = {
      sensesel: null,
      createsel: null,
      gridTileContainerClass: "", /* classes to add to .tile-container in grid mode */
      view: 'carousel',  /* view into which to open the menu */
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

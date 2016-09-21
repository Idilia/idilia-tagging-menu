/**
 * JQuery widget for animating a sense card
 * Version: 1.1.9
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
        if ($def.length > 0)
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
        if ($edit.length > 0) {
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
          if (res && res.card) {
            var $newCard = $(res.card);
            var opts = base.options;
            $card.replaceWith($newCard);
            $newCard.senseCard(opts);
            if (typeof opts.edited === "function") {
              opts.edited.call($newCard[0]);
            }
          } else if (res && res.status === 'deleted') {
            if (typeof base.options.deleted === "function") {
              base.options.deleted.call($card[0]);
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
        if ($('#lgcc-script').length > 0) {
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
    deleted: null,
    lgcc: 'https://lgcc.idilia.com/lgcc/'
  };
  
  /**
   * Load the open-sans font to ensure that available
   */
  WebFontConfig = {
    google: { families: [ 'Open+Sans::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();
  
}(jQuery, window, document));

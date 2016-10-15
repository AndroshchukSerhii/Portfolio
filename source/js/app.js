'use strict'
$(function () {

	var imgs = [];

	$.each($('*'), function () {
		var
			$this = $(this),
			background = $this.css('background-image'),
			img = $this.is('img');

		if (background != 'none') {
			var path = background.replace('url("', '').replace('")', '');
			imgs.push(path);
      console.log(path);
		}

		if (img) {
			var path = $this.attr('src');

			if (path) {
				imgs.push(path);
			}
		}

	}); 
  console.log(imgs);
	
	var percentsTotal = 1;

	for (var i = 0; i < imgs.length; i++) {
		var image = $('<img>', {
			attr: {
				src: imgs[i]
			}
		});

		image.on({
			load : function () {
				setPercents(imgs.length, percentsTotal);
				percentsTotal++;
			},

			error : function () {
        percentsTotal++;
				setPrecents(imgs.length, percentsTotal);
			}
		});
	}

	function setPercents(total, current) {
		var percent = Math.ceil(current / total * 100);

		if (percent >= 100) {
			$('.preloader').fadeOut();
		}

		$('.preloader__percents').text(percent + '%');
	}
  // $('.preloader').fadeOut();
});


var slider = (function() {
  //private
  var
    flag = true,
    timer = 0,
    timerDuration = 4000;

  return {
    
    init: function() {
      var _this = this;
      // create dots
      _this.createDots();

      // tern up switcher
      _this.autoSwitch();
      $('.slider__controls-button').on('click', function(e) {
        e.preventDefault();

        var
          $this = $(this),
          slides = $this.closest('.slider').find('.slider__item'),
          activeSlide = slides.filter('.active'),
          nextSlide = activeSlide.next(),
          prevSlide = activeSlide.prev(),
          firstSlide =slides.first(),
          lastSlide = slides.last();
        _this.clearTimer();
        if ($this.hasClass('slider__arrows-next')) {

            if (nextSlide.length) {
              // console.log("forward");
              _this.moveSlide(nextSlide, 'forward');

            } else {
              _this.moveSlide(firstSlide, 'forward');
           }

        } else {

           if (prevSlide.length) {
              _this.moveSlide(prevSlide, 'backward');

           } else {
              _this.moveSlide(lastSlide, 'backward');
           }
        }
      });
        // click to dots
      $('.slider__dots-current').on('click', function(e){
        e.preventDefault();

        var 
          $this = $(this),
          dots = $this.closest('.slider__dots').find('.slider__dots-current'),
          activeDot = dots.filter('.active'),
          dot = $this.closest('.slider__dots-current'),
          curDotNum =dot.index(),
          direction = (activeDot.index() < curDotNum) ? 'forward' : 'backward',
          reqSlide = $this.closest('.slider').find('.slider__item').eq(curDotNum);
        if (!dot.hasClass('active')){
        _this.clearTimer();
        _this.moveSlide(reqSlide, direction);
        }
      });
    },
    moveSlide: function(slide, direction){
      var
        _this = this,
        container = slide.closest('.slider'),
        slides = container.find('.slider__item'),
        activeSlide = slides.filter('.active'),
        slideWidth = slides.width(),
        duration = 500,
        reqCssPosition = 0,
        reqSlideStrafe = 0;

      if (flag) {
        flag = false;
        if (direction === 'forward') {
            reqCssPosition = slideWidth;
            reqSlideStrafe = -slideWidth;
        } else if (direction === 'backward') {
            reqCssPosition = -slideWidth;
            reqSlideStrafe = slideWidth;
        }
        slide.css('left', reqCssPosition).addClass('inslide');

        var movableSlide = slides.filter('.inslide');
        activeSlide.animate({left: reqSlideStrafe}, duration);
        
        movableSlide.animate({left: 0}, duration, function(){
          var $this = $(this);

          slides.css('left', '0').removeClass('active');

          $this.toggleClass('inslide active');

          _this.setActiveDot(container.find('.slider__dots'));
          flag = true;
        });
      }
    },
    createDots: function() {
      var
        _this = this,
        container = $('.slider');
      var
        dotMarkup = '<li class="slider__dots-current"><a class="slider__dots-link" href="#"></a></li>';

      container.each(function(){
          var 
            $this = $(this),
            slides = $this.find('.slider__item'),
            dotContainer = $this.find('.slider__dots');
          for (var i = 0; i <slides.size(); i++) {
              dotContainer.append(dotMarkup);
          }
          _this.setActiveDot(dotContainer)
      });
    },
    setActiveDot: function(container) {
      var
        slides = container.closest('.slidesContainer').find('.slider__item');
      container
        .find('.slider__dots-current')    
        .eq(slides.filter('.active').index())
        .addClass('active')
        .siblings()
        .removeClass('active');
    },
    autoSwitch : function(){
        var _this = this;
        timer = setInterval(function(){
            var
              slides = $('.slider__list .slider__item'),
              activeSlide = slides.filter('.active'),
              nextSlide = activeSlide.next(),
              firstSlide = slides.first();

            if (nextSlide.length) {
              // console.log("forward");
              _this.moveSlide(nextSlide, 'forward');

            } else {
              _this.moveSlide(firstSlide, 'forward');
           }

        }, timerDuration);
    },
    clearTimer: function(){
      if (timer) {
        clearInterval(timer);
        this.autoSwitch();
      }
    }
  }
}());

(function(jQuery, undefined) {
  // VAR
  var debug = true,
      
      options = {
        mouseport:     'body',  // jQuery object or selector of DOM node to use as mouseport
        xparallax:     true,    // boolean | 0-1 | 'npx' | 'n%'
        yparallax:     true,    //
        xorigin:       0.5,     // 0-1 - Sets default alignment. Only has effect when parallax values are something other than 1 (or true, or '100%')
        yorigin:       0.5,     //
        decay:         0.66,    // 0-1 (0 instant, 1 forever) - Sets rate of decay curve for catching up with target mouse position
        frameDuration: 30,      // Int (milliseconds)
        freezeClass:   'freeze' // String - Class added to layer when frozen
      },
  
      value = {
        left: 0,
        top: 0,
        middle: 0.5,
        center: 0.5,
        right: 1,
        bottom: 1
      },
  
      rpx = /^\d+\s?px$/,
      rpercent = /^\d+\s?%$/,
      
      win = jQuery(window),
      doc = jQuery(document),
      mouse = [0, 0];
  
  var Timer = (function(){
    var debug = false;
    
    // Shim for requestAnimationFrame, falling back to timer. See:
    // see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    var requestFrame = (function(){
          return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(fn, node){
              return window.setTimeout(function(){
                fn();
              }, 25);
            }
          );
        })();
    
    function Timer() {
      var callbacks = [],
        nextFrame;
      
      function noop() {}
      
      function frame(){
        var cbs = callbacks.slice(0),
            l = cbs.length,
            i = -1;
        
        if (debug) { console.log('timer frame()', l); }
        
        while(++i < l) { cbs[i].call(this); }
        requestFrame(nextFrame);
      }
      
      function start() {
        if (debug) { console.log('timer start()'); }
        this.start = noop;
        this.stop = stop;
        nextFrame = frame;
        requestFrame(nextFrame);
      }
      
      function stop() {
        if (debug) { console.log('timer stop()'); }
        this.start = start;
        this.stop = noop;
        nextFrame = noop;
      }
      
      this.callbacks = callbacks;
      this.start = start;
      this.stop = stop;
    }

    Timer.prototype = {
      add: function(fn) {
        var callbacks = this.callbacks,
            l = callbacks.length;
        
        // Check to see if this callback is already in the list.
        // Don't add it twice.
        while (l--) {
          if (callbacks[l] === fn) { return; }
        }
        
        this.callbacks.push(fn);
        if (debug) { console.log('timer add()', this.callbacks.length); }
      },
    
      remove: function(fn) {
        var callbacks = this.callbacks,
            l = callbacks.length;
        
        // Remove all instances of this callback.
        while (l--) {
          if (callbacks[l] === fn) { callbacks.splice(l, 1); }
        }
        
        if (debug) { console.log('timer remove()', this.callbacks.length); }
        
        if (callbacks.length === 0) { this.stop(); }
      }
    };
    
    return Timer;
  })();
  
  function parseCoord(x) {
    return (rpercent.exec(x)) ? parseFloat(x)/100 : x;
  }
  
  function parseBool(x) {
    return typeof x === "boolean" ? x : !!( parseFloat(x) ) ;
  }
  
  function portData(port) {
    var events = {
          'mouseenter.parallax': mouseenter,
          'mouseleave.parallax': mouseleave
        },
        winEvents = {
          'resize.parallax': resize
        },
        data = {
          elem: port,
          events: events,
          winEvents: winEvents,
          timer: new Timer()
        },
        layers, size, offset;
    
    function updatePointer() {
      data.pointer = getPointer(mouse, [true, true], offset, size);
    }
    
    function resize() {
      size = getSize(port);
      offset = getOffset(port);
      data.threshold = getThreshold(size);
    }
    
    function mouseenter() {
      data.timer.add(updatePointer);
    }
    
    function mouseleave(e) {
      data.timer.remove(updatePointer);
      data.pointer = getPointer([e.pageX, e.pageY], [true, true], offset, size);
    }

    win.on(winEvents);
    port.on(events);
    
    resize();
    
    return data;
  }
  
  function getData(elem, name, fn) {
    var data = elem.data(name);
    
    if (!data) {
      data = fn ? fn(elem) : {} ;
      elem.data(name, data);
    }
    
    return data;
  }
  
  function getPointer(mouse, parallax, offset, size){
    var pointer = [],
        x = 2;
    
    while (x--) {
      pointer[x] = (mouse[x] - offset[x]) / size[x] ;
      pointer[x] = pointer[x] < 0 ? 0 : pointer[x] > 1 ? 1 : pointer[x] ;
    }
    
    return pointer;
  }
  
  function getSize(elem) {
    return [elem.width(), elem.height()];
  }
  
  function getOffset(elem) {
    var offset = elem.offset() || {left: 0, top: 0},
      borderLeft = elem.css('borderLeftStyle') === 'none' ? 0 : parseInt(elem.css('borderLeftWidth'), 10),
      borderTop = elem.css('borderTopStyle') === 'none' ? 0 : parseInt(elem.css('borderTopWidth'), 10),
      paddingLeft = parseInt(elem.css('paddingLeft'), 10),
      paddingTop = parseInt(elem.css('paddingTop'), 10);
    
    return [offset.left + borderLeft + paddingLeft, offset.top + borderTop + paddingTop];
  }
  
  function getThreshold(size) {
    return [1/size[0], 1/size[1]];
  }
  
  function layerSize(elem, x, y) {
    return [x || elem.outerWidth(), y || elem.outerHeight()];
  }
  
  function layerOrigin(xo, yo) {
    var o = [xo, yo],
      i = 2,
      origin = [];
    
    while (i--) {
      origin[i] = typeof o[i] === 'string' ?
        o[i] === undefined ?
          1 :
          value[origin[i]] || parseCoord(origin[i]) :
        o[i] ;
    }
    
    return origin;
  }
  
  function layerPx(xp, yp) {
    return [rpx.test(xp), rpx.test(yp)];
  }
  
  function layerParallax(xp, yp, px) {
    var p = [xp, yp],
        i = 2,
        parallax = [];
    
    while (i--) {
      parallax[i] = px[i] ?
        parseInt(p[i], 10) :
        parallax[i] = p[i] === true ? 1 : parseCoord(p[i]) ;
    }
    
    return parallax;
  }
  
  function layerOffset(parallax, px, origin, size) {
    var i = 2,
        offset = [];
    
    while (i--) {
      offset[i] = px[i] ?
        origin[i] * (size[i] - parallax[i]) :
        parallax[i] ? origin[i] * ( 1 - parallax[i] ) : 0 ;
    }
    
    return offset;
  }
  
  function layerPosition(px, origin) {
    var i = 2,
        position = [];
    
    while (i--) {
      if (px[i]) {
        // Set css position constant
        position[i] = origin[i] * 100 + '%';
      }
      else {
      
      }
    }
    
    return position;
  }
  
  function layerPointer(elem, parallax, px, offset, size) {
    var viewport = elem.offsetParent(),
      pos = elem.position(),
      position = [],
      pointer = [],
      i = 2;
    
    // Reverse calculate ratio from elem's current position
    while (i--) {
      position[i] = px[i] ?
        // TODO: reverse calculation for pixel case
        0 :
        pos[i === 0 ? 'left' : 'top'] / (viewport[i === 0 ? 'outerWidth' : 'outerHeight']() - size[i]) ;
      
      pointer[i] = (position[i] - offset[i]) / parallax[i] ;
    }
    
    return pointer;
  }
  
  function layerCss(parallax, px, offset, size, position, pointer) {
    var pos = [],
        cssPosition,
        cssMargin,
        x = 2,
        css = {};
    
    while (x--) {
      if (parallax[x]) {
        pos[x] = parallax[x] * pointer[x] + offset[x];
        
        // We're working in pixels
        if (px[x]) {
          cssPosition = position[x];
          cssMargin = pos[x] * -1;
        }
        // We're working by ratio
        else {
          cssPosition = pos[x] * 100 + '%';
          cssMargin = pos[x] * size[x] * -1;
        }
        
        // Fill in css object
        if (x === 0) {
          css.left = cssPosition;
          css.marginLeft = cssMargin;
        }
        else {
          css.top = cssPosition;
          css.marginTop = cssMargin;
        }
      }
    }
    
    return css;
  }
  
  function pointerOffTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
    var pointer, x;
    
    if ((!parallax[0] || Math.abs(targetPointer[0] - prevPointer[0]) < threshold[0]) &&
        (!parallax[1] || Math.abs(targetPointer[1] - prevPointer[1]) < threshold[1])) {
        // Pointer has hit the target
        if (targetFn) { targetFn(); }
        return updateFn(targetPointer);
    }
    
    // Pointer is nowhere near the target
    pointer = [];
    x = 2;
    
    while (x--) {
      if (parallax[x]) {
        pointer[x] = targetPointer[x] + decay * (prevPointer[x] - targetPointer[x]);
      }
    }
      
    return updateFn(pointer);
  }
  
  function pointerOnTarget(targetPointer, prevPointer, threshold, decay, parallax, targetFn, updateFn) {
    // Don't bother updating if the pointer hasn't changed.
    if (targetPointer[0] === prevPointer[0] && targetPointer[1] === prevPointer[1]) {
      return;
    }
    
    return updateFn(targetPointer);
  }
  
  function unport(elem, events, winEvents) {
    elem.off(events).removeData('parallax_port');
    win.off(winEvents);
  }
  
  function unparallax(node, port, events) {
    port.elem.off(events);
    
    // Remove this node from layers
    port.layers = port.layers.not(node);
    
    // If port.layers is empty, destroy the port
    if (port.layers.length === 0) {
      unport(port.elem, port.events, port.winEvents);
    }
  }
  
  function unstyle(parallax) {
    var css = {};
    
    if (parallax[0]) {
      css.left = '';
      css.marginLeft = '';
    }
    
    if (parallax[1]) {
      css.top = '';
      css.marginTop = '';
    }
    
    elem.css(css);
  }
  
  jQuery.fn.parallax = function(o){
    var options = jQuery.extend({}, jQuery.fn.parallax.options, o),
        args = arguments,
        elem = options.mouseport instanceof jQuery ?
          options.mouseport :
          jQuery(options.mouseport) ,
        port = getData(elem, 'parallax_port', portData),
        timer = port.timer;
    
    return this.each(function(i) {
      var node      = this,
          elem      = jQuery(this),
          opts      = args[i + 1] ? jQuery.extend({}, options, args[i + 1]) : options,
          decay     = opts.decay,
          size      = layerSize(elem, opts.width, opts.height),
          origin    = layerOrigin(opts.xorigin, opts.yorigin),
          px        = layerPx(opts.xparallax, opts.yparallax),
          parallax  = layerParallax(opts.xparallax, opts.yparallax, px),
          offset    = layerOffset(parallax, px, origin, size),
          position  = layerPosition(px, origin),
          pointer   = layerPointer(elem, parallax, px, offset, size),
          pointerFn = pointerOffTarget,
          targetFn  = targetInside,
          events = {
            'mouseenter.parallax': function mouseenter(e) {
              pointerFn = pointerOffTarget;
              targetFn = targetInside;
              timer.add(frame);
              timer.start();
            },
            'mouseleave.parallax': function mouseleave(e) {
              // Make the layer come to rest at it's limit with inertia
              pointerFn = pointerOffTarget;
              // Stop the timer when the the pointer hits target
              targetFn = targetOutside;
            }
          };
      
      function updateCss(newPointer) {
        var css = layerCss(parallax, px, offset, size, position, newPointer);
        elem.css(css);
        pointer = newPointer;
      }
      
      function frame() {
        pointerFn(port.pointer, pointer, port.threshold, decay, parallax, targetFn, updateCss);
      }
      
      function targetInside() {
        // Pointer hits the target pointer inside the port
        pointerFn = pointerOnTarget;
      }
      
      function targetOutside() {
        // Pointer hits the target pointer outside the port
        timer.remove(frame);
      }
      
      
      if (jQuery.data(node, 'parallax')) {
        elem.unparallax();
      }
      
      jQuery.data(node, 'parallax', {
        port: port,
        events: events,
        parallax: parallax
      });
      
      port.elem.on(events);
      port.layers = port.layers? port.layers.add(node): jQuery(node);
      
      /*function freeze() {
        freeze = true;
      }
      
      function unfreeze() {
        freeze = false;
      }*/
      
      /*jQuery.event.add(this, 'freeze.parallax', freeze);
      jQuery.event.add(this, 'unfreeze.parallax', unfreeze);*/
    });
  };
  
  jQuery.fn.unparallax = function(bool) {
    return this.each(function() {
      var data = jQuery.data(this, 'parallax');
      
      // This elem is not parallaxed
      if (!data) { return; }
      
      jQuery.removeData(this, 'parallax');
      unparallax(this, data.port, data.events);
      if (bool) { unstyle(data.parallax); }
    });
  };
  
  jQuery.fn.parallax.options = options;
  
  // Pick up and store mouse position on document: IE does not register
  // mousemove on window.
  doc.on('mousemove.parallax', function(e){
    mouse = [e.pageX, e.pageY];
  });
}(jQuery));
// var parallax = (function() {

//   return {
//     init: function() {
//       var layer = $('.parallax').find('.parallax__layer');
//       layer.map(function (key, value) {
//         var bottonPosition = ((window.innerHeight / 2) * ((key + 1) / 100));
//         $(value).css({
//           'botton': '-' + bottonPosition + 'px',
//           'transform': 'trnslate3d(0px, 0px, 0px)'
//         });
//       });
//       $(window).on('mousemove', function(e) {
//         var mouse_dx = e.pageX;
//         var mouse_dy = e.pageY;

//         var w = (window.innerWidth / 2) - mouse_dx;
//         var h = (window.innerHeight / 2) - mouse_dy;

//         layer.map(function (key, value) {
//           var bottonPosition = ((window.innerHeight / 2) * ((key + 1) / 100));
//           var widthPosition = w * ((key + 1) / 100);
//           var heightPosition = h * ((kay + 1) / 100);
//           $(value).css({
//             'botton': '-' + bottonPosition + 'px',
//             'transform': 'trnslate3d(' + widthPosition + 'px, '+ heightPosition + ', 0px)'
//           });
//         });
//       }); 
//     }
//   }
// }())


$(document).ready(function(){
    jQuery('.parallax-layer').parallax({
        mouseport: jQuery("#parallax")
    });
    if ($('.slider').length) {
      slider.init();   
    }
   $('#toggle').click(function() {
   $(this).toggleClass('active');
   $('#overlay').toggleClass('open');
   $('body').toggleClass('stop-scrolling');
   // $('body').bind('touchmove', function(e){e.preventDefault()})
   // $('body').unbind('touchmove')
  }); 
    // Declare parallax on layers
  $('.flip').click(function(){
    $('.cont-flip').toggleClass('flipped');
    $('.button__wrap').toggleClass('button__wrap_hidden')
    return false;
  });
});
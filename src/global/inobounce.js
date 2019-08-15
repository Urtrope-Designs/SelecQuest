/*! iNoBounce - v0.1.6
* https://github.com/lazd/iNoBounce/
* Copyright (c) 2013 Larry Davis <lazdnet@gmail.com>; Licensed BSD */
(function() {
	// Stores the X position where the touch started
	let startX = 0;
	// Stores the Y position where the touch started
	let startY = 0;

	// Store enabled status
	let enabled = false;

	let supportsPassiveOption = false;
	try {
		const opts = Object.defineProperty({}, 'passive', {
			get: function() {
				supportsPassiveOption = true;
			}
		});
		window.addEventListener('test', null, opts);
	} catch (e) {}

	const handleTouchmove = function(evt) {
		// Get the element that was scrolled upon
		let el = evt.target;

		// Check all parent elements for scrollability
		while (el !== document.body && el !== document) {
			// Get some style properties
			const style = window.getComputedStyle(el);

			if (!style) {
				// If we've encountered an element we can't compute the style for, get out
				break;
			}

			// Ignore range input element
			if (el.nodeName === 'INPUT' && el.getAttribute('type') === 'range') {
				return;
			}

			const scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
			const overflowX = style.getPropertyValue('overflow-x');
			const overflowY = style.getPropertyValue('overflow-y');
			const height = parseInt(style.getPropertyValue('height'), 10);

			// Determine if the element should scroll
			const isWebkitScroll = scrolling === 'touch' || scrolling === 'auto';
			const scrollX = overflowX === 'auto' || overflowX === 'scroll';
			const scrollY = overflowY === 'auto' || overflowY === 'scroll';
			const isScrollable = isWebkitScroll && (scrollX || scrollY);

			const canScroll = scrollY ? el.scrollHeight > el.offsetHeight : el.scrollWidth > el.offsetWidth;

			if (isScrollable && canScroll) {
				if (scrollY) {
					// Get the current Y position of the touch
					var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;
					
					// Determine if the user is trying to scroll past the top or bottom
					// In this case, the window will bounce, so we have to prevent scrolling completely
					var isAtTop = (startY <= curY && el.scrollTop === 0);
					var isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);
					
					// Stop a bounce bug when at the bottom or top of the scrollable element
					if (isAtTop || isAtBottom) {
						// window.alert('bounce bug');
						evt.preventDefault();
					}
				} else {
					// Get the current Y position of the touch
					var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;
					// Get the current X position of the touch
					var curX = evt.touches ? evt.touches[0].screenX : evt.screenX;
			
					var Ydiff = Math.abs(startY - curY)
					var Xdiff = Math.abs(startX - curX)
			
					// prevent if the user tried to scroll vertical in horizontal area
					if (Ydiff > Xdiff) {
						evt.preventDefault();
					}
				}

				// No need to continue up the DOM, we've done our job
				return;
			}

			// Test the next parent
			el = el.parentNode;
		}

		// Stop the bouncing -- no parents are scrollable
		// window.alert('no parents!');
		evt.preventDefault();
	};

	const handleTouchstart = function(evt) {
		// Store the first Y position of the touch
		startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
        // Store the first X position of the touch
        startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
	};

	const enable = function() {
		// Listen to a couple key touch events
		window.addEventListener('touchstart', handleTouchstart, supportsPassiveOption ? { passive : false } : false);
		window.addEventListener('touchmove', handleTouchmove, supportsPassiveOption ? { passive : false } : false);
		enabled = true;
	};

	// Enable by default if the browser supports -webkit-overflow-scrolling
	// Test this by setting the property with JavaScript on an element that exists in the DOM
	// Then, see if the property is reflected in the computed style
	var testDiv = document.createElement('div');
	document.documentElement.appendChild(testDiv);
	testDiv.style.WebkitOverflowScrolling = 'touch';
	var scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
	document.documentElement.removeChild(testDiv);

	if (scrollSupport) {
		enable();
	}

}());

/* Adapted from iNoBounce (https://github.com/lazd/iNoBounce), PR #53 (https://github.com/lazd/iNoBounce/pull/53)
 * Copyright (c) 2013, Lawrence Davis
 * All rights reserved. 
 */

export class NoBounce {
    private startY = 0;
    private startX = 0;

    private supportsPassiveOption = false;

    constructor() {
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: function () {
                    this.supportsPassiveOption = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) { }

        // Enable by default if the browser supports -webkit-overflow-scrolling
        // Test this by setting the property with JavaScript on an element that exists in the DOM
        // Then, see if the property is reflected in the computed style
        const testDiv = document.createElement('div');
        document.documentElement.appendChild(testDiv);
        (testDiv.style as any).WebkitOverflowScrolling = 'touch';
        const scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
        document.documentElement.removeChild(testDiv);

        if (scrollSupport) {
            this.enable();
        }
    
    }

    private enable() {
        window.addEventListener('touchstart', this.handleTouchstart, this.supportsPassiveOption ? { passive: false } : false);
        window.addEventListener('touchmove', this.handleTouchmove, this.supportsPassiveOption ? { passive: false } : false);
    }

    private handleTouchmove = (evt: TouchEvent) => {
        // Get the element that was scrolled upon
        let el = evt.target as HTMLElement;

        // Check all parent elements for scrollability
        while (el !== document.body && (el as unknown) !== document) {

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
            const overflowY = style.getPropertyValue('overflow-y');
            const overflowX = style.getPropertyValue('overflow-x');
            const height = parseInt(style.getPropertyValue('height'), 10);
            
            // Determine if the element should scroll
            const isScrollable = this.isScrollableCheck(scrolling, overflowY, overflowX);
            const canScroll = this.canScrollCheck(overflowY, el);

            if (isScrollable && canScroll) {
                if (overflowY === 'auto' || overflowY === 'scroll') {
                    this.verticalScroll(evt, height, el)
                }
                else {
                    this.horizontalScroll(evt)
                }

                // No need to continue up the DOM, we've done our job
                return;
            }

            // Test the next parent
            el = el.parentNode as HTMLElement;
        }

        // Stop the bouncing -- no parents are scrollable
        // window.alert('no parent, evt: ' + evt);
        evt.preventDefault();
    };

    // ensure user is scrolling horizontally
    private horizontalScroll = (evt) => {
        // Get the current Y position of the touch
        var curY = evt.touches ? evt.touches[0].screenY : evt.screenY;
        // Get the current X position of the touch
        var curX = evt.touches ? evt.touches[0].screenX : evt.screenX;

        var Ydiff = Math.abs(this.startY - curY)
        var Xdiff = Math.abs(this.startX - curX)

        // prevent if the user tried to scroll vertical in horizontal area
        if (Ydiff > Xdiff) {
            evt.preventDefault();
        }
    }

    private verticalScroll = (evt, height: number, el) => {
        // Get the current Y position of the touch
        const curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

        // Determine if the user is trying to scroll past the top or bottom
        // In this case, the window will bounce, so we have to prevent scrolling completely
        const isAtTop = (this.startY <= curY && el.scrollTop === 0);
        const isAtBottom = (this.startY >= curY && el.scrollHeight - el.scrollTop === height);

        // Stop a bounce bug when at the bottom or top of the scrollable element
        // Only need this for vertical scrolling
        if (isAtTop || isAtBottom) {
            window.alert('bounce bug, evt: ' + evt);
            try{
                evt.preventDefault();
            } catch(e) {
                window.alert(e);
            }
        }
    }

    private canScrollCheck = (overflowY, el) => {
        if (overflowY === 'auto' || overflowY === 'scroll') {
            return el.scrollHeight > el.offsetHeight
        }

        return el.scrollWidth > el.offsetWidth;
    }

    private isScrollableCheck = (scrolling, overflowY, overflowX) => {
        // window.alert('scrollableCheck');
        const isWebkitScroll = scrolling === 'touch' || scrolling === 'auto';
        const scrollY = (overflowY === 'auto' || overflowY === 'scroll');
        const scrollX = (overflowX === 'auto' || overflowX === 'scroll');

        return isWebkitScroll && (scrollY || scrollX);
    }

    private handleTouchstart = (evt) => {
        // Store the first Y position of the touch
        this.startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
        // Store the first X position of the touch
        this.startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
    };
}
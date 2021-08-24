/* jquery-tocit - v1.10.0 - 2021-08-24
* http://github.com/jscolot/jquery-tocit/
* Copyright (c) 2013 Greg Franko, 2021 Julien Colot; Licensed MIT */

(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function(root, jQuery) {
            if (typeof jQuery === 'undefined') {
                jQuery = require('jquery');
            }

            if (typeof jQuery.widget === 'undefined') {
                require('jquery-ui/ui/widget');
            }

            factory(jQuery, window, document);

            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery, window, document);
    }

}(function($, window, document) {
    // ECMAScript 5 Strict Mode: [John Resig Blog Post](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/)
    'use strict';

    const tocClassName = 'tocit';
    const tocFocusClassName = 'tocit-focus';
    const tocHoverClassName = 'tocit-hover';
    const hideTocClassName = 'tocit-hide';
    const headingClassName = 'tocit-heading';
    const headingClass = '.' + headingClassName;
    const subHeadingClassName = 'tocit-subHeading';
    const subHeadingClass = '.' + subHeadingClassName;
    const itemClassName = 'tocit-item';
    const itemClass = '.' + itemClassName;
    const extendPageClassName = 'tocit-extend-page';
    const extendPageClass = '.' + extendPageClassName;

    // Calling the jQueryUI Widget Factory Method
    $.widget('toc.tocit', {

        // Plugin version
        version : '1.9.1',

        // These options will be used as defaults
        options : {

            // **context**: Accepts String: Any jQuery selector
            // The container element that holds all of the elements used to generate the table of contents
            context : 'body',

            // **ignoreSelector**: Accepts String: Any jQuery selector
            // A selector to any element that would be matched by selectors that you wish to be ignored
            ignoreSelector : null,

            // **selectors**: Accepts an Array of Strings: Any jQuery selectors
            // The element's used to generate the table of contents.  The order is very important since it will determine the table of content's nesting structure
            selectors : 'h1, h2, h3',

            // **showAndHide**: Accepts a boolean: true or false
            // Used to determine if elements should be shown and hidden
            showAndHide : true,

            // **showEffect**: Accepts String: "none", "fadeIn", "show", or "slideDown"
            // Used to display any of the table of contents nested items
            showEffect : 'slideDown',

            // **showEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
            // The time duration of the show animation
            showEffectSpeed : 'medium',

            // **hideEffect**: Accepts String: "none", "fadeOut", "hide", or "slideUp"
            // Used to hide any of the table of contents nested items
            hideEffect : 'slideUp',

            // **hideEffectSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
            // The time duration of the hide animation
            hideEffectSpeed : 'medium',

            // **smoothScroll**: Accepts a boolean: true or false
            // Determines if a jQuery animation should be used to scroll to specific table of contents items on the page
            smoothScroll : true,

            // **smoothScrollSpeed**: Accepts Number (milliseconds) or String: "slow", "medium", or "fast"
            // The time duration of the smoothScroll animation
            smoothScrollSpeed : 'medium',

            // **scrollTo**: Accepts Number (pixels)
            // The amount of space between the top of page and the selected table of contents item after the page has been scrolled
            scrollTo : 0,

            // **showAndHideOnScroll**: Accepts a boolean: true or false
            // Determines if table of contents nested items should be shown and hidden while scrolling
            showAndHideOnScroll : true,

            // **highlightOnScroll**: Accepts a boolean: true or false
            // Determines if table of contents nested items should be highlighted (set to a different color) while scrolling
            highlightOnScroll : true,

            // **highlightOffset**: Accepts a number
            // The offset distance in pixels to trigger the next active table of contents item
            highlightOffset : 40,

            // **theme**: Accepts a string: "bootstrap", "jqueryui", or "none"
            // Determines if Twitter Bootstrap, jQueryUI, or tocit classes should be added to the table of contents
            theme : 'bootstrap',

            // **extendPage**: Accepts a boolean: true or false
            // If a user scrolls to the bottom of the page and the page is not tall enough to scroll to the last table of contents item, then the page height is increased
            extendPage : true,

            // **history**: Accepts a boolean: true or false
            // Adds a hash to the page url to maintain history
            history : true,

            // **scrollHistory**: Accepts a boolean: true or false
            // Adds a hash to the page url, to maintain history, when scrolling to a TOC item
            scrollHistory : false,

            // **hashGenerator**: How the hash value (the anchor segment of the URL, following the
            // # character) will be generated.
            //
            // "compact" (default) - #CompressesEverythingTogether
            // "pretty" - #looks-like-a-nice-url-and-is-easily-readable
            // function(text, element){} - Your own hash generation function that accepts the text as an
            // argument, and returns the hash value.
            hashGenerator : 'compact',

            // **textGenerator**: How the text value (the text appearing in the menu) will be generated
            //
            // "text" (default) - The same text as the selector
            // function(text, element){} - Your own text generation function that accepts the text as an
            // argument, and returns a text value
            textGenerator : 'text',

            // **highlightDefault**: Accepts a boolean: true or false
            // Set's the first TOC item as active if no other TOC item is active.
            highlightDefault : true

        },

        // _Create
        // -------
        //     Constructs the plugin.  Only called once.
        _create : function() {

            const widgetThis = this;

            this.extendPageScroll = true;

            // Getting rid of possibly existing helper divs
            $('[data-unique]').remove();

            // Internal array that keeps track of all TOC items (Helps to recognize if there are duplicate TOC item strings)
            this.items = [];

            // Generates the HTML for the dynamic table of contents
            this._generateToc();

            // Adds CSS classes to the newly generated table of contents HTML
            this._addCSSClasses();

            this.webkit = (function() {

                for (const prop in window) {

                    if (prop) {

                        if (prop.toLowerCase().indexOf('webkit') !== -1) {

                            return true;

                        }

                    }

                }

                return false;

            }());

            // Adds jQuery event handlers to the newly generated table of contents
            this._setEventHandlers();

            // Binding to the Window load event to make sure the correct scrollTop is calculated
            $(window).on('load', function() {

                // Sets the active TOC item
                widgetThis._setActiveElement(true);

                // Once all animations on the page are complete, this callback function will be called
                $('html, body').promise().done(function() {

                    setTimeout(function() {

                        widgetThis.extendPageScroll = false;

                    }, 0);

                });

            });

        },

        // _generateToc
        // ------------
        //      Generates the HTML for the dynamic table of contents
        _generateToc : function() {

            // _Local variables_
            const widgetThis = this;
            const ignoreSelector = this.options.ignoreSelector;

            // All of the HTML tags found within the context provided (i.e. body) that match the top level jQuery selector above
            let firstElem;
            // Instantiated variable that will store the top level newly created unordered list DOM element
            let ul;


            // If the selectors option has a comma within the string
            if (!this.options.selectors.indexOf(',') === -1) {

                // Grabs the first selector from the string
                firstElem = $(this.options.context).find(this.options.selectors.replace(/ /g, '').substr(0, this.options.selectors.indexOf(',')));

            // If the selectors option does not have a comma within the string
            } else {

                // Grabs the first selector from the string and makes sure there are no spaces
                firstElem = $(this.options.context).find(this.options.selectors.replace(/ /g, ''));

            }

            if (!firstElem.length) {

                widgetThis.element.addClass(hideTocClassName);

                return;

            }

            widgetThis.element.addClass(tocClassName);

            // Loops through each top level selector
            firstElem.each(/* @this */ function(index) {

                // If the element matches the ignoreSelector then we skip it
                if ($(this).is(ignoreSelector)) {
                    return;
                }

                // Creates an unordered list HTML element and adds a dynamic ID and standard class name
                ul = $('<ul/>', {
                    id    : headingClassName + index,
                    class : headingClassName
                })

                // Appends a top level list item HTML element to the previously created HTML heading
                    .append(widgetThis._nestElements($(this), index));

                // Add the created unordered list element to the HTML element calling the plugin
                widgetThis.element.append(ul);

                // Finds all of the HTML tags between the heading and subHeading elements
                $(this).nextUntil(this.nodeName.toLowerCase()).each(/* @this */ function() {

                    // If there are no nested subHeading elemements
                    if ($(this).find(widgetThis.options.selectors).length === 0) {

                        // Loops through all of the subHeading elements
                        $(this).filter(widgetThis.options.selectors).each(/* @this */ function() {

                            // If the element matches the ignoreSelector then we skip it
                            if ($(this).is(ignoreSelector)) {
                                return;
                            }

                            widgetThis._appendSubHeadings($(this), ul);

                        });
                    // If there are nested subHeading elements
                    } else {

                        // Loops through all of the subHeading elements
                        $.each($(this).find(widgetThis.options.selectors), (subHeading) => {

                            // If the element matches the ignoreSelector then we skip it
                            if ($(subHeading).is(ignoreSelector)) {
                                return;
                            }

                            widgetThis._appendSubHeadings($(this), ul);

                        });

                    }

                });

            });

            if (widgetThis.options.extendPage) {
                // If the user has scrolled to the bottom of the page and the last toc item is not focused
                let lastElem, currentElem, calculatedPadding;

                if (!$(extendPageClass).length) {

                    lastElem = $('div[data-unique="' + $(itemClass).last().attr('data-unique') + '"]');

                    if (!lastElem.length) {
                        return;
                    }

                    calculatedPadding = $(window).height() - ($(document).height() - lastElem.offset().top);

                    // Appends a div to the bottom of the page and sets the height to the difference of the window scrollTop and the last element's position top offset
                    $(widgetThis.options.context).append($('<div />', {
                        'class'       : extendPageClassName,
                        'height'      : calculatedPadding + 'px',
                        'data-unique' : extendPageClassName
                    }));
                    if (widgetThis.extendPageScroll) {
                        currentElem = widgetThis.element.find('li.active');
                        widgetThis._scrollTo($('div[data-unique="' + currentElem.attr('data-unique') + '"]'));
                    }
                }
            }

        },

        _setActiveElement : function(pageload) {

            const widgetThis = this;

            const hash = window.location.hash.substring(1);

            const elem = widgetThis.element.find('li[data-unique="' + hash + '"]');

            if (hash.length) {

                // Removes highlighting from all of the list item's
                widgetThis.element.find('.' + widgetThis.focusClass).removeClass(widgetThis.focusClass);

                // Highlights the current list item that was clicked
                elem.addClass(widgetThis.focusClass);

                // If the showAndHide option is true
                if (widgetThis.options.showAndHide) {

                    // Triggers the click event on the currently focused TOC item
                    elem.click();

                }

            } else {

                // Removes highlighting from all of the list item's
                widgetThis.element.find('.' + widgetThis.focusClass).removeClass(widgetThis.focusClass);

                if (!hash.length && pageload && widgetThis.options.highlightDefault) {

                    // Highlights the first TOC item if no other items are highlighted
                    widgetThis.element.find(itemClass).first().addClass(widgetThis.focusClass);

                }

            }

            return widgetThis;

        },

        // _nestElements
        // -------------
        //      Helps create the table of contents list by appending nested list items
        _nestElements : function($heading, index) {

            const arr = $.grep(this.items, function (item) {

                return item === $heading.text();

            });

            // If there is already a duplicate TOC item
            if (arr.length) {

                // Adds the current TOC item text and index (for slight randomization) to the internal array
                this.items.push($heading.text() + index);

            // If there not a duplicate TOC item
            } else {

                // Adds the current TOC item text to the internal array
                this.items.push($heading.text());

            }

            const hashValue = this._generateHashValue(arr, $heading, index);

            const textValue = this._generateTextValue(arr, $heading, index);

            // Appends a list item HTML element to the last unordered list HTML element found within the HTML element calling the plugin
            const item = $('<li/>', {

                // Sets a common class name to the list item
                'class' : itemClassName,

                'data-unique' : hashValue

            }).append($('<a/>', {

                text : textValue

            }));

            // Adds an HTML anchor tag before the currently traversed HTML element
            $heading.before($('<div/>', {

                // Sets a name attribute on the anchor tag to the text of the currently traversed HTML element (also making sure that all whitespace is replaced with an underscore)
                'name' : hashValue,

                'data-unique' : hashValue

            }));

            return item;

        },

        // _generateHashValue
        // ------------------
        //      Generates the hash value that will be used to refer to each item.
        _generateHashValue : function(arr, $heading, index) {

            let hashValue = '';
            const hashGeneratorOption = this.options.hashGenerator;

            if (hashGeneratorOption === 'pretty') {

                // prettify the text
                hashValue = $heading.text().toLowerCase().replace(/\s/g, '-');

                // fix double hyphens
                while (hashValue.indexOf('--') > -1) {
                    hashValue = hashValue.replace(/--/g, '-');
                }

                // fix colon-space instances
                while (hashValue.indexOf(':-') > -1) {
                    hashValue = hashValue.replace(/:-/g, '-');
                }

            } else if (typeof hashGeneratorOption === 'function') {

                // call the function
                hashValue = hashGeneratorOption($heading.text(), $heading);

            } else {

                // compact - the default
                hashValue = $heading.text().replace(/\s/g, '');

            }

            // add the index if we need to
            if (arr.length) {
                hashValue += '' + index;
            }

            // return the value
            return hashValue;

        },

        // _generateTextValue
        // ------------------
        //      Generates the text value that will be used in the menu
        _generateTextValue : function(arr, $heading, index) {

            let textValue = '';
            const textGeneratorOption = this.options.textGenerator;

            if (textGeneratorOption === 'text') {

                textValue = $heading.text();

            } else if (typeof textGeneratorOption === 'function') {

                textValue = textGeneratorOption($heading.text(), $heading);

            }

            return textValue;

        },

        // _appendElements
        // ---------------
        //      Helps create the table of contents list by appending subHeading elements

        _appendSubHeadings : function($heading, ul) {

            // The current element index
            const index = $heading.index(this.options.selectors);

            // Finds the previous heading DOM element
            const previousHeading = $(this.options.selectors).eq(index - 1);

            const currentTagName = +$heading.prop('tagName').charAt(1);

            const previousTagName = +previousHeading.prop('tagName').charAt(1);

            // If the current heading DOM element is smaller than the previous heading DOM element or the first subHeading
            if (currentTagName < previousTagName) {

                // Selects the last unordered list HTML found within the HTML element calling the plugin
                this.element.find(subHeadingClass + '[data-tag=' + currentTagName + ']').last().append(this._nestElements($heading, index));

            // If the current heading DOM element is the same type of heading(eg. h4) as the previous heading DOM element
            } else if (currentTagName === previousTagName) {

                ul.find(itemClass).last().after(this._nestElements($heading, index));

            } else {

                // Selects the last unordered list HTML found within the HTML element calling the plugin
                ul.find(itemClass).last()

                // Appends an unorderedList HTML element to the dynamic `unorderedList` variable and sets a common class name
                    .after($('<ul/>', {

                        'class' : subHeadingClassName,

                        'data-tag' : currentTagName

                    }))
                    .next(subHeadingClass)

                // Appends a list item HTML element to the last unordered list HTML element found within the HTML element calling the plugin
                    .append(this._nestElements($heading, index));
            }

        },

        // _setEventHandlers
        // ----------------
        //      Adds jQuery event handlers to the newly generated table of contents
        _setEventHandlers : function() {

            // _Local variables_

            // Stores the plugin context in the widgetThis variable
            const widgetThis = this;

            const li = this.element.find('li');

            // Event delegation that looks for any clicks on list item elements inside of the HTML element calling the plugin
            this.element.off('click.tocify', 'li');
            this.element.on('click.tocit', 'li', /* @this */ function(event) {

                if (widgetThis.options.history) {

                    window.location.hash = $(this).attr('data-unique');

                }

                // Removes highlighting from all of the list item's
                widgetThis.element.find('.' + widgetThis.focusClass).removeClass(widgetThis.focusClass);

                // Highlights the current list item that was clicked
                $(this).addClass(widgetThis.focusClass);

                // If the showAndHide option is true
                if (widgetThis.options.showAndHide) {

                    const elem = $('li[data-unique="' + $(this).attr('data-unique') + '"]');

                    widgetThis._triggerShow(elem);

                }

                widgetThis._scrollTo($(this));

            });

            // Mouseenter and Mouseleave event handlers for the list item's within the HTML element calling the plugin
            li.off('mouseenter.tocify');
            li.off('mouseleave.tocify');
            li.on({

                // Mouseenter event handler
                'mouseenter.tocit' : function() {

                    // Adds a hover CSS class to the current list item
                    $(this).addClass(widgetThis.hoverClass);

                    // Makes sure the cursor is set to the pointer icon
                    $(this).css('cursor', 'pointer');

                },

                // Mouseleave event handler
                'mouseleave.tocit' : function() {

                    if (widgetThis.options.theme !== 'bootstrap') {

                        // Removes the hover CSS class from the current list item
                        $(this).removeClass(widgetThis.hoverClass);

                    }

                }
            });

            // only attach handler if needed (expensive in IE)
            if (widgetThis.options.extendPage || widgetThis.options.highlightOnScroll || widgetThis.options.scrollHistory || widgetThis.options.showAndHideOnScroll) {
            // Window scroll event handler
                $(window).off('scroll.tocify');
                $(window).on('scroll.tocit', function() {

                    // Once all animations on the page are complete, this callback function will be called
                    $('html, body').promise().done(function() {

                        // Local variables

                        // Stores how far the user has scrolled
                        const winScrollTop = $(window).scrollTop();

                        // The zero timeout ensures the following code is run after the scroll events
                        setTimeout(function() {

                            // _Local variables_

                            // Stores the distance to the closest anchor
                            let closestAnchorDistance = null,

                                // Stores the index of the closest anchor
                                closestAnchorIdx = null;

                            // Keeps a reference to all anchors
                            const anchors = $(widgetThis.options.context).find('div[data-unique]');

                            // Determines the index of the closest anchor
                            anchors.each(/* @this */ function(idx) {
                                const distance = Math.abs(($(this).next().length ? $(this).next() : $(this)).offset().top - winScrollTop - widgetThis.options.highlightOffset);

                                if (closestAnchorDistance === null || distance < closestAnchorDistance) {
                                    closestAnchorDistance = distance;
                                    closestAnchorIdx = idx;
                                } else {
                                    return false;
                                }

                                return true;
                            });

                            const anchorText = $(anchors[closestAnchorIdx]).attr('data-unique');

                            // Stores the list item HTML element that corresponds to the currently traversed anchor tag
                            const elem = $('li[data-unique="' + anchorText + '"]');

                            // If the `highlightOnScroll` option is true and a next element is found
                            if (widgetThis.options.highlightOnScroll && elem.length) {

                                // Removes highlighting from all of the list item's
                                widgetThis.element.find('.' + widgetThis.focusClass).removeClass(widgetThis.focusClass);

                                // Highlights the corresponding list item
                                elem.addClass(widgetThis.focusClass);

                            }

                            if (widgetThis.options.scrollHistory) {

                                if (window.location.hash !== '#' + anchorText) {

                                    window.location.replace('#' + anchorText);

                                }
                            }

                            // If the `showAndHideOnScroll` option is true
                            if (widgetThis.options.showAndHideOnScroll && widgetThis.options.showAndHide) {

                                widgetThis._triggerShow(elem, true);

                            }

                        }, 0);

                    });

                });
            }

        },

        // Show
        // ----
        //      Opens the current sub-heading
        show : function(elem, scroll) {

            // Stores the plugin context in the `widgetThis` variable
            const widgetThis = this;

            // If the sub-heading is not already visible
            if (!elem.is(':visible')) {

                // If the current element does not have any nested subHeadings, is not a heading, and its parent is not visible
                if (!elem.find(subHeadingClass).length && !elem.parent().is(headingClass) && !elem.parent().is(':visible')) {

                    // Sets the current element to all of the subHeadings within the current heading
                    elem = elem.parents(subHeadingClass).add(elem);


                // If the current element does not have any nested subHeadings and is not a heading
                } else if (!elem.children(subHeadingClass).length && !elem.parent().is(headingClass)) {

                    // Sets the current element to the closest subHeading
                    elem = elem.closest(subHeadingClass);

                }

                // Determines what jQuery effect to use
                switch (widgetThis.options.showEffect) {

                // Uses `no effect`
                case 'none':

                    elem.show();

                    break;

                    // Uses the jQuery `show` special effect
                case 'show':

                    elem.show(widgetThis.options.showEffectSpeed);

                    break;

                    // Uses the jQuery `slideDown` special effect
                case 'slideDown':

                    elem.slideDown(widgetThis.options.showEffectSpeed);

                    break;

                    // Uses the jQuery `fadeIn` special effect
                case 'fadeIn':

                    elem.fadeIn(widgetThis.options.showEffectSpeed);

                    break;

                    // If none of the above options were passed, then a `jQueryUI show effect` is expected
                default:

                    elem.show();

                    break;

                }

            }

            // If the current subHeading parent element is a heading
            if (elem.parent().is(headingClass)) {

                // Hides all non-active sub-headings
                widgetThis.hide($(subHeadingClass).not(elem));

            // If the current subHeading parent element is not a heading
            } else {

                // Hides all non-active sub-headings
                widgetThis.hide($(subHeadingClass).not(elem.closest(headingClass).find(subHeadingClass).not(elem.siblings())));

            }

            // Maintains chainablity
            return widgetThis;

        },

        // Hide
        // ----
        //      Closes the current sub-heading
        hide : function(elem) {

            // Stores the plugin context in the `widgetThis` variable
            const widgetThis = this;

            // Determines what jQuery effect to use
            switch (widgetThis.options.hideEffect) {

            // Uses `no effect`
            case 'none':

                elem.hide();

                break;

                // Uses the jQuery `hide` special effect
            case 'hide':

                elem.hide(widgetThis.options.hideEffectSpeed);

                break;

                // Uses the jQuery `slideUp` special effect
            case 'slideUp':

                elem.slideUp(widgetThis.options.hideEffectSpeed);

                break;

                // Uses the jQuery `fadeOut` special effect
            case 'fadeOut':

                elem.fadeOut(widgetThis.options.hideEffectSpeed);

                break;

                // If none of the above options were passed, then a `jqueryUI hide effect` is expected
            default:

                elem.hide();

                break;

            }

            // Maintains chainablity
            return widgetThis;
        },

        // _triggerShow
        // ------------
        //      Determines what elements get shown on scroll and click
        _triggerShow : function(elem, scroll) {

            const widgetThis = this;

            // If the current element's parent is a heading element or the next element is a nested subHeading element
            if (elem.parent().is(headingClass) || elem.next().is(subHeadingClass)) {

                // Shows the next sub-heading element
                widgetThis.show(elem.next(subHeadingClass), scroll);

            // If the current element's parent is a subHeading element
            } else if (elem.parent().is(subHeadingClass)) {

                // Shows the parent sub-heading element
                widgetThis.show(elem.parent(), scroll);

            }

            // Maintains chainability
            return widgetThis;

        },

        // _addCSSClasses
        // --------------
        //      Adds CSS classes to the newly generated table of contents HTML
        _addCSSClasses : function() {

            // If the user wants a jqueryUI theme
            if (this.options.theme === 'jqueryui') {

                this.focusClass = 'ui-state-default';

                this.hoverClass = 'ui-state-hover';

                // Adds the default styling to the dropdown list
                this.element.addClass('ui-widget').find('.toc-title').addClass('ui-widget-heading')
                    .end()
                    .find('li')
                    .addClass('ui-widget-content');

            // If the user wants a twitterBootstrap theme
            } else if (this.options.theme === 'bootstrap') {

                this.element.find(headingClass + ',' + subHeadingClass).addClass('nav nav-list');

                this.focusClass = 'active';

            // If a user does not want a prebuilt theme
            } else {

                // Adds more neutral classes (instead of jqueryui)

                this.focusClass = tocFocusClassName;

                this.hoverClass = tocHoverClassName;

            }

            // Maintains chainability
            return this;

        },

        // setOption
        // ---------
        //      Sets a single tocit option after the plugin is invoked
        setOption : function() {

            // Calls the jQueryUI Widget Factory setOption method
            $.Widget.prototype._setOption.apply(this, arguments);

        },

        // setOptions
        // ----------
        //      Sets a single or multiple tocit options after the plugin is invoked
        setOptions : function() {

            // Calls the jQueryUI Widget Factory setOptions method
            $.Widget.prototype._setOptions.apply(this, arguments);

        },

        // _scrollTo
        // ---------
        //      Scrolls to a specific element
        _scrollTo : function(elem) {

            const widgetThis = this;
            const duration = widgetThis.options.smoothScroll || 0;
            const scrollTo = widgetThis.options.scrollTo;
            const currentDiv = $('div[data-unique="' + elem.attr('data-unique') + '"]');

            if (!currentDiv.length) {

                return widgetThis;

            }

            // Once all animations on the page are complete, this callback function will be called
            $('html, body').promise().done(function() {

                // Animates the html and body element scrolltops
                $('html, body').animate({

                    // Sets the jQuery `scrollTop` to the top offset of the HTML div tag that matches the current list item's `data-unique` tag
                    scrollTop : currentDiv.offset().top - ($.isFunction(scrollTo) ? scrollTo.call() : scrollTo) + 'px'

                }, {

                    // Sets the smoothScroll animation time duration to the smoothScrollSpeed option
                    duration : duration

                }).promise()
                    .done(function() {
                        currentDiv.trigger('tocify.scrollEnd');
                    });
            });

            // Maintains chainability
            return widgetThis;

        }

    });


})); // end of plugin

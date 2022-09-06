/*******************************************************************************
 * Copyright 2018 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

/**
 * Element.matches()
 * https://developer.mozilla.org/enUS/docs/Web/API/Element/matches#Polyfill
 */
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Element.closest()
 * https://developer.mozilla.org/enUS/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
        "use strict";
        var el = this;
        if (!document.documentElement.contains(el)) {
            return null;
        }
        do {
            if (el.matches(s)) {
                return el;
            }
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

/*******************************************************************************
 * Copyright 2018 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
/* global Granite */
(function() {
    "use strict";

    var NS = "cmp";
    var IS = "tabs";

    var keyCodes = {
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40
    };

    var selectors = {
        self: "[data-" +  NS + '-is="' + IS + '"]',
        active: {
            tab: "cmp-tabs__tab--active",
            tabpanel: "cmp-tabs__tabpanel--active"
        }
    };

    /**
     * Tabs Configuration
     *
     * @typedef {Object} TabsConfig Represents a Tabs configuration
     * @property {HTMLElement} element The HTMLElement representing the Tabs
     * @property {Object} options The Tabs options
     */

    /**
     * Tabs
     *
     * @class Tabs
     * @classdesc An interactive Tabs component for navigating a list of tabs
     * @param {TabsConfig} config The Tabs configuration
     */
    function Tabs(config) {
        var that = this;

        if (config && config.element) {
            init(config);
        }

        /**
         * Initializes the Tabs
         *
         * @private
         * @param {TabsConfig} config The Tabs configuration
         */
        function init(config) {
            // prevents multiple initialization
            config.element.removeAttribute("data-" + NS + "-is");

            cacheElements(config.element);
            that._active = getActiveIndex(that._elements["tab"]);

            if (that._elements.tabpanel) {
                refreshActive();
                bindEvents();
            }

            if (Granite && Granite.author && Granite.author.MessageChannel) {
                /*
                 * Editor message handling:
                 * - subscribe to "cmp.panelcontainer" message requests sent by the editor frame
                 * - check that the message data panel container type is correct and that the id (path) matches this specific Tabs component
                 * - if so, route the "navigate" operation to enact a navigation of the Tabs based on index data
                 */
                new Granite.author.MessageChannel("cqauthor", window).subscribeRequestMessage("cmp.panelcontainer", function(message) {
                    if (message.data && message.data.type === "cmp-tabs" && message.data.id === that._elements.self.dataset["cmpPanelcontainerId"]) {
                        if (message.data.operation === "navigate") {
                            navigate(message.data.index);
                        }
                    }
                });
            }
        }

        /**
         * Returns the index of the active tab, if no tab is active returns 0
         *
         * @param {Array} tabs Tab elements
         * @returns {Number} Index of the active tab, 0 if none is active
         */
        function getActiveIndex(tabs) {
            if (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].classList.contains(selectors.active.tab)) {
                        return i;
                    }
                }
            }
            return 0;
        }

        /**
         * Caches the Tabs elements as defined via the {@code data-tabs-hook="ELEMENT_NAME"} markup API
         *
         * @private
         * @param {HTMLElement} wrapper The Tabs wrapper element
         */
        function cacheElements(wrapper) {
            that._elements = {};
            that._elements.self = wrapper;
            var hooks = that._elements.self.querySelectorAll("[data-" + NS + "-hook-" + IS + "]");

            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                if (hook.closest("." + NS + "-" + IS) === that._elements.self) { // only process own tab elements
                    var capitalized = IS;
                    capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
                    var key = hook.dataset[NS + "Hook" + capitalized];
                    if (that._elements[key]) {
                        if (!Array.isArray(that._elements[key])) {
                            var tmp = that._elements[key];
                            that._elements[key] = [tmp];
                        }
                        that._elements[key].push(hook);
                    } else {
                        that._elements[key] = hook;
                    }
                }
            }
        }

        /**
         * Binds Tabs event handling
         *
         * @private
         */
        function bindEvents() {
            var tabs = that._elements["tab"];
            if (tabs) {
                for (var i = 0; i < tabs.length; i++) {
                    (function(index) {
                        tabs[i].addEventListener("click", function(event) {
                            navigate(index);
                        });
                        tabs[i].addEventListener("keydown", function(event) {
                            onKeyDown(event);
                        });
                    })(i);
                }
            }
        }

        /**
         * Handles tab keydown events
         *
         * @private
         * @param {Object} event The keydown event
         */
        function onKeyDown(event) {
            var index = that._active;
            var lastIndex = that._elements["tab"].length - 1;

            switch (event.keyCode) {
                case keyCodes.ARROW_LEFT:
                case keyCodes.ARROW_UP:
                    event.preventDefault();
                    if (index > 0) {
                        navigate(index - 1);
                    }
                    break;
                case keyCodes.ARROW_RIGHT:
                case keyCodes.ARROW_DOWN:
                    event.preventDefault();
                    if (index < lastIndex) {
                        navigate(index + 1);
                    }
                    break;
                case keyCodes.HOME:
                    event.preventDefault();
                    navigate(0);
                    break;
                case keyCodes.END:
                    event.preventDefault();
                    navigate(lastIndex);
                    break;
                default:
                    return;
            }
        }

        /**
         * Refreshes the tab markup based on the current {@code Tabs#_active} index
         *
         * @private
         */
        function refreshActive() {
            var tabpanels = that._elements["tabpanel"];
            var tabs = that._elements["tab"];

            if (tabpanels) {
                if (Array.isArray(tabpanels)) {
                    for (var i = 0; i < tabpanels.length; i++) {
                        if (i === parseInt(that._active)) {
                            tabpanels[i].classList.add(selectors.active.tabpanel);
                            tabpanels[i].removeAttribute("aria-hidden");
                            tabs[i].classList.add(selectors.active.tab);
                            tabs[i].setAttribute("aria-selected", true);
                            tabs[i].setAttribute("tabindex", "0");
                            focusWithoutScroll(tabs[i]);
                        } else {
                            tabpanels[i].classList.remove(selectors.active.tabpanel);
                            tabpanels[i].setAttribute("aria-hidden", true);
                            tabs[i].classList.remove(selectors.active.tab);
                            tabs[i].setAttribute("aria-selected", false);
                            tabs[i].setAttribute("tabindex", "-1");
                        }
                    }
                } else {
                    // only one tab
                    tabpanels.classList.add(selectors.active.tabpanel);
                    tabs.classList.add(selectors.active.tab);
                }
            }
        }

        /**
         * Focuses the element and prevents scrolling the element into view
         *
         * @param {HTMLElement} element Element to focus
         */
        function focusWithoutScroll(element) {
            var x = window.scrollX;
            var y = window.scrollY;
            element.focus();
            window.scrollTo(x, y);
        }

        /**
         * Navigates to the tab at the provided index
         *
         * @private
         * @param {Number} index The index of the tab to navigate to
         */
        function navigate(index) {
            that._active = index;
            refreshActive();
        }
    }

    /**
     * Reads options data from the Tabs wrapper element, defined via {@code data-cmp-*} data attributes
     *
     * @private
     * @param {HTMLElement} element The Tabs element to read options data from
     * @returns {Object} The options read from the component data attributes
     */
    function readData(element) {
        var data = element.dataset;
        var options = [];
        var capitalized = IS;
        capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
        var reserved = ["is", "hook" + capitalized];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];

                if (key.indexOf(NS) === 0) {
                    key = key.slice(NS.length);
                    key = key.charAt(0).toLowerCase() + key.substring(1);

                    if (reserved.indexOf(key) === -1) {
                        options[key] = value;
                    }
                }
            }
        }

        return options;
    }

    /**
     * Document ready handler and DOM mutation observers. Initializes Tabs components as necessary.
     *
     * @private
     */
    function onDocumentReady() {
        var elements = document.querySelectorAll(selectors.self);
        for (var i = 0; i < elements.length; i++) {
            new Tabs({ element: elements[i], options: readData(elements[i]) });
        }

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body = document.querySelector("body");
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // needed for IE
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
                            elementsArray.forEach(function(element) {
                                new Tabs({ element: element, options: readData(element) });
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener("DOMContentLoaded", onDocumentReady());
    }

}());

/*******************************************************************************
 * Copyright 2017 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
if (window.Element && !Element.prototype.closest) {
    // eslint valid-jsdoc: "off"
    Element.prototype.closest =
        function(s) {
            "use strict";
            var matches = (this.document || this.ownerDocument).querySelectorAll(s);
            var el      = this;
            var i;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) {
                    // continue
                }
            } while ((i < 0) && (el = el.parentElement));
            return el;
        };
}

if (window.Element && !Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            "use strict";
            var matches = (this.document || this.ownerDocument).querySelectorAll(s);
            var i       = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {
                // continue
            }
            return i > -1;
        };
}

if (!Object.assign) {
    Object.assign = function(target, varArgs) { // .length of function is 2
        "use strict";
        if (target === null) {
            throw new TypeError("Cannot convert undefined or null to object");
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource !== null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

(function(arr) {
    "use strict";
    arr.forEach(function(item) {
        if (item.hasOwnProperty("remove")) {
            return;
        }
        Object.defineProperty(item, "remove", {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function remove() {
                this.parentNode.removeChild(this);
            }
        });
    });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

/*******************************************************************************
 * Copyright 2016 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
(function() {
    "use strict";

    var NS = "cmp";
    var IS = "image";

    var EMPTY_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    var LAZY_THRESHOLD = 0;
    var SRC_URI_TEMPLATE_WIDTH_VAR = "{.width}";

    var selectors = {
        self: "[data-" + NS + '-is="' + IS + '"]',
        image: '[data-cmp-hook-image="image"]',
        map: '[data-cmp-hook-image="map"]',
        area: '[data-cmp-hook-image="area"]'
    };

    var lazyLoader = {
        "cssClass": "cmp-image__image--is-loading",
        "style": {
            "height": 0,
            "padding-bottom": "" // will be replaced with % ratio
        }
    };

    var properties = {
        /**
         * An array of alternative image widths (in pixels).
         * Used to replace a {.width} variable in the src property with an optimal width if a URI template is provided.
         *
         * @memberof Image
         * @type {Number[]}
         * @default []
         */
        "widths": {
            "default": [],
            "transform": function(value) {
                var widths = [];
                value.split(",").forEach(function(item) {
                    item = parseFloat(item);
                    if (!isNaN(item)) {
                        widths.push(item);
                    }
                });
                return widths;
            }
        },
        /**
         * Indicates whether the image should be rendered lazily.
         *
         * @memberof Image
         * @type {Boolean}
         * @default false
         */
        "lazy": {
            "default": false,
            "transform": function(value) {
                return !(value === null || typeof value === "undefined");
            }
        },
        /**
         * The image source.
         *
         * Can be a simple image source, or a URI template representation that
         * can be variable expanded - useful for building an image configuration with an alternative width.
         * e.g. '/path/image.coreimg{.width}.jpeg/1506620954214.jpeg'
         *
         * @memberof Image
         * @type {String}
         */
        "src": {
        }
    };

    var devicePixelRatio = window.devicePixelRatio || 1;

    function readData(element) {
        var data = element.dataset;
        var options = [];
        var capitalized = IS;
        capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
        var reserved = ["is", "hook" + capitalized];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];

                if (key.indexOf(NS) === 0) {
                    key = key.slice(NS.length);
                    key = key.charAt(0).toLowerCase() + key.substring(1);

                    if (reserved.indexOf(key) === -1) {
                        options[key] = value;
                    }
                }
            }
        }

        return options;
    }

    function Image(config) {
        var that = this;

        function init(config) {
            // prevents multiple initialization
            config.element.removeAttribute("data-" + NS + "-is");

            setupProperties(config.options);
            cacheElements(config.element);

            if (!that._elements.noscript) {
                return;
            }

            that._elements.container = that._elements.link ? that._elements.link : that._elements.self;

            unwrapNoScript();

            if (that._properties.lazy) {
                addLazyLoader();
            }

            if (that._elements.map) {
                that._elements.image.addEventListener("load", onLoad);
            }

            window.addEventListener("scroll", that.update);
            window.addEventListener("resize", onWindowResize);
            window.addEventListener("update", that.update);
            that._elements.image.addEventListener("cmp-image-redraw", that.update);
            that.update();
        }

        function loadImage() {
            var hasWidths = that._properties.widths && that._properties.widths.length > 0;
            var replacement = hasWidths ? "." + getOptimalWidth() : "";
            var url = that._properties.src.replace(SRC_URI_TEMPLATE_WIDTH_VAR, replacement);

            if (that._elements.image.getAttribute("src") !== url) {
                that._elements.image.setAttribute("src", url);
                if (!hasWidths) {
                    window.removeEventListener("scroll", that.update);
                }
            }

            if (that._lazyLoaderShowing) {
                that._elements.image.addEventListener("load", removeLazyLoader);
            }
        }

        function getOptimalWidth() {
            var container = that._elements.self;
            var containerWidth = container.clientWidth;
            while (containerWidth === 0 && container.parentNode) {
                container = container.parentNode;
                containerWidth = container.clientWidth;
            }
            var optimalWidth = containerWidth * devicePixelRatio;
            var len = that._properties.widths.length;
            var key = 0;

            while ((key < len - 1) && (that._properties.widths[key] < optimalWidth)) {
                key++;
            }

            return that._properties.widths[key].toString();
        }

        function addLazyLoader() {
            var width = that._elements.image.getAttribute("width");
            var height = that._elements.image.getAttribute("height");

            if (width && height) {
                var ratio = (height / width) * 100;
                var styles = lazyLoader.style;

                styles["padding-bottom"] = ratio + "%";

                for (var s in styles) {
                    if (styles.hasOwnProperty(s)) {
                        that._elements.image.style[s] = styles[s];
                    }
                }
            }
            that._elements.image.setAttribute("src", EMPTY_PIXEL);
            that._elements.image.classList.add(lazyLoader.cssClass);
            that._lazyLoaderShowing = true;
        }

        function unwrapNoScript() {
            var markup = decodeNoscript(that._elements.noscript.textContent.trim());
            var parser = new DOMParser();

            // temporary document avoids requesting the image before removing its src
            var temporaryDocument = parser.parseFromString(markup, "text/html");
            var imageElement = temporaryDocument.querySelector(selectors.image);
            imageElement.removeAttribute("src");
            that._elements.container.insertBefore(imageElement, that._elements.noscript);

            var mapElement = temporaryDocument.querySelector(selectors.map);
            if (mapElement) {
                that._elements.container.insertBefore(mapElement, that._elements.noscript);
            }

            that._elements.noscript.parentNode.removeChild(that._elements.noscript);
            if (that._elements.container.matches(selectors.image)) {
                that._elements.image = that._elements.container;
            } else {
                that._elements.image = that._elements.container.querySelector(selectors.image);
            }

            that._elements.map = that._elements.container.querySelector(selectors.map);
            that._elements.areas = that._elements.container.querySelectorAll(selectors.area);
        }

        function removeLazyLoader() {
            that._elements.image.classList.remove(lazyLoader.cssClass);
            for (var property in lazyLoader.style) {
                if (lazyLoader.style.hasOwnProperty(property)) {
                    that._elements.image.style[property] = "";
                }
            }
            that._elements.image.removeEventListener("load", removeLazyLoader);
            that._lazyLoaderShowing = false;
        }

        function isLazyVisible() {
            if (that._elements.container.offsetParent === null) {
                return false;
            }

            var wt = window.pageYOffset;
            var wb = wt + document.documentElement.clientHeight;
            var et = that._elements.container.getBoundingClientRect().top + wt;
            var eb = et + that._elements.container.clientHeight;

            return eb >= wt - LAZY_THRESHOLD && et <= wb + LAZY_THRESHOLD;
        }

        function resizeAreas() {
            if (that._elements.areas && that._elements.areas.length > 0) {
                for (var i = 0; i < that._elements.areas.length; i++) {
                    var width = that._elements.image.width;
                    var height = that._elements.image.height;

                    if (width && height) {
                        var relcoords = that._elements.areas[i].dataset.cmpRelcoords;
                        if (relcoords) {
                            var relativeCoordinates = relcoords.split(",");
                            var coordinates = new Array(relativeCoordinates.length);

                            for (var j = 0; j < coordinates.length; j++) {
                                if (j % 2 === 0) {
                                    coordinates[j] = parseInt(relativeCoordinates[j] * width);
                                } else {
                                    coordinates[j] = parseInt(relativeCoordinates[j] * height);
                                }
                            }

                            that._elements.areas[i].coords = coordinates;
                        }
                    }
                }
            }
        }

        function cacheElements(wrapper) {
            that._elements = {};
            that._elements.self = wrapper;
            var hooks = that._elements.self.querySelectorAll("[data-" + NS + "-hook-" + IS + "]");

            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                var capitalized = IS;
                capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
                var key = hook.dataset[NS + "Hook" + capitalized];
                that._elements[key] = hook;
            }
        }

        function setupProperties(options) {
            that._properties = {};

            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var property = properties[key];
                    if (options && options[key] != null) {
                        if (property && typeof property.transform === "function") {
                            that._properties[key] = property.transform(options[key]);
                        } else {
                            that._properties[key] = options[key];
                        }
                    } else {
                        that._properties[key] = properties[key]["default"];
                    }
                }
            }
        }

        function onWindowResize() {
            that.update();
            resizeAreas();
        }

        function onLoad() {
            resizeAreas();
        }

        that.update = function() {
            if (that._properties.lazy) {
                if (isLazyVisible()) {
                    loadImage();
                }
            } else {
                loadImage();
            }
        };

        if (config && config.element) {
            init(config);
        }
    }

    function onDocumentReady() {
        var elements = document.querySelectorAll(selectors.self);
        for (var i = 0; i < elements.length; i++) {
            new Image({ element: elements[i], options: readData(elements[i]) });
        }

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body             = document.querySelector("body");
        var observer         = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // needed for IE
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
                            elementsArray.forEach(function(element) {
                                new Image({ element: element, options: readData(element) });
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener("DOMContentLoaded", onDocumentReady());
    }

    /*
        on drag & drop of the component into a parsys, noscript's content will be escaped multiple times by the editor which creates
        the DOM for editing; the HTML parser cannot be used here due to the multiple escaping
     */
    function decodeNoscript(text) {
        text = text.replace(/&(amp;)*lt;/g, "<");
        text = text.replace(/&(amp;)*gt;/g, ">");
        return text;
    }

})();

/*******************************************************************************
 * Copyright 2016 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
(function() {
    "use strict";

    var NS = "cmp";
    var IS = "formText";
    var IS_DASH = "form-text";

    var selectors = {
        self: "[data-" + NS + '-is="' + IS + '"]'
    };

    var properties = {
        /**
         * A validation message to display if there is a type mismatch between the user input and expected input.
         *
         * @type {String}
         */
        constraintMessage: {
        },
        /**
         * A validation message to display if no input is supplied, but input is expected for the field.
         *
         * @type {String}
         */
        requiredMessage: {
        }
    };

    function readData(element) {
        var data = element.dataset;
        var options = [];
        var capitalized = IS;
        capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
        var reserved = ["is", "hook" + capitalized];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];

                if (key.indexOf(NS) === 0) {
                    key = key.slice(NS.length);
                    key = key.charAt(0).toLowerCase() + key.substring(1);

                    if (reserved.indexOf(key) === -1) {
                        options[key] = value;
                    }
                }
            }
        }

        return options;
    }

    function FormText(config) {
        if (config.element) {
            // prevents multiple initialization
            config.element.removeAttribute("data-" + NS + "-is");
        }

        this._cacheElements(config.element);
        this._setupProperties(config.options);

        this._elements.input.addEventListener("invalid", this._onInvalid.bind(this));
        this._elements.input.addEventListener("input", this._onInput.bind(this));
    }

    FormText.prototype._onInvalid = function(event) {
        event.target.setCustomValidity("");
        if (event.target.validity.typeMismatch) {
            if (this._properties.constraintMessage) {
                event.target.setCustomValidity(this._properties.constraintMessage);
            }
        } else if (event.target.validity.valueMissing) {
            if (this._properties.requiredMessage) {
                event.target.setCustomValidity(this._properties.requiredMessage);
            }
        }
    };

    FormText.prototype._onInput = function(event) {
        event.target.setCustomValidity("");
    };

    FormText.prototype._cacheElements = function(wrapper) {
        this._elements = {};
        this._elements.self = wrapper;
        var hooks = this._elements.self.querySelectorAll("[data-" + NS + "-hook-" + IS_DASH + "]");
        for (var i = 0; i < hooks.length; i++) {
            var hook = hooks[i];
            var capitalized = IS;
            capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
            var key = hook.dataset[NS + "Hook" + capitalized];
            this._elements[key] = hook;
        }
    };

    FormText.prototype._setupProperties = function(options) {
        this._properties = {};

        for (var key in properties) {
            if (properties.hasOwnProperty(key)) {
                var property = properties[key];
                if (options && options[key] != null) {
                    if (property && typeof property.transform === "function") {
                        this._properties[key] = property.transform(options[key]);
                    } else {
                        this._properties[key] = options[key];
                    }
                } else {
                    this._properties[key] = properties[key]["default"];
                }
            }
        }
    };

    function onDocumentReady() {
        var elements = document.querySelectorAll(selectors.self);
        for (var i = 0; i < elements.length; i++) {
            new FormText({ element: elements[i], options: readData(elements[i]) });
        }

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body = document.querySelector("body");
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // needed for IE
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
                            elementsArray.forEach(function(element) {
                                new FormText({ element: element, options: readData(element) });
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener("DOMContentLoaded", onDocumentReady());
    }

})();

/*******************************************************************************
 * Copyright 2018 Adobe Systems Incorporated
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
/* global Granite */
(function() {
    "use strict";

    var NS = "cmp";
    var IS = "carousel";

    var keyCodes = {
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40
    };

    var selectors = {
        self: "[data-" +  NS + '-is="' + IS + '"]'
    };

    var properties = {
        /**
         * Determines whether the Carousel will automatically transition between slides
         *
         * @memberof Carousel
         * @type {Boolean}
         * @default false
         */
        "autoplay": {
            "default": false,
            "transform": function(value) {
                return !(value === null || typeof value === "undefined");
            }
        },
        /**
         * Duration (in milliseconds) before automatically transitioning to the next slide
         *
         * @memberof Carousel
         * @type {Number}
         * @default 5000
         */
        "delay": {
            "default": 5000,
            "transform": function(value) {
                value = parseFloat(value);
                return !isNaN(value) ? value : null;
            }
        }
    };

    /**
     * Carousel Configuration
     *
     * @typedef {Object} CarouselConfig Represents a Carousel configuration
     * @property {HTMLElement} element The HTMLElement representing the Carousel
     * @property {Object} options The Carousel options
     */

    /**
     * Carousel
     *
     * @class Carousel
     * @classdesc An interactive Carousel component for navigating a list of generic items
     * @param {CarouselConfig} config The Carousel configuration
     */
    function Carousel(config) {
        var that = this;

        if (config && config.element) {
            init(config);
        }

        /**
         * Initializes the Carousel
         *
         * @private
         * @param {CarouselConfig} config The Carousel configuration
         */
        function init(config) {
            // prevents multiple initialization
            config.element.removeAttribute("data-" + NS + "-is");

            setupProperties(config.options);
            cacheElements(config.element);
            that._active = 0;

            if (that._elements.item) {
                refreshActive();
                bindEvents();
                resetAutoplayInterval();
            }

            if (Granite && Granite.author && Granite.author.MessageChannel) {
                /*
                 * Editor message handling:
                 * - subscribe to "cmp.panelcontainer" message requests sent by the editor frame
                 * - check that the message data panel container type is correct and that the id (path) matches this specific Carousel component
                 * - if so, route the "navigate" operation to enact a navigation of the Carousel based on index data
                 */
                new Granite.author.MessageChannel("cqauthor", window).subscribeRequestMessage("cmp.panelcontainer", function(message) {
                    if (message.data && message.data.type === "cmp-carousel" && message.data.id === that._elements.self.dataset["cmpPanelcontainerId"]) {
                        if (message.data.operation === "navigate") {
                            navigate(message.data.index);
                        }
                    }
                });
            }
        }

        /**
         * Caches the Carousel elements as defined via the {@code data-carousel-hook="ELEMENT_NAME"} markup API
         *
         * @private
         * @param {HTMLElement} wrapper The Carousel wrapper element
         */
        function cacheElements(wrapper) {
            that._elements = {};
            that._elements.self = wrapper;
            var hooks = that._elements.self.querySelectorAll("[data-" + NS + "-hook-" + IS + "]");

            for (var i = 0; i < hooks.length; i++) {
                var hook = hooks[i];
                var capitalized = IS;
                capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
                var key = hook.dataset[NS + "Hook" + capitalized];
                if (that._elements[key]) {
                    if (!Array.isArray(that._elements[key])) {
                        var tmp = that._elements[key];
                        that._elements[key] = [tmp];
                    }
                    that._elements[key].push(hook);
                } else {
                    that._elements[key] = hook;
                }
            }
        }

        /**
         * Sets up properties for the Carousel based on the passed options.
         *
         * @private
         * @param {Object} options The Carousel options
         */
        function setupProperties(options) {
            that._properties = {};

            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    var property = properties[key];
                    var value = null;

                    if (options && options[key] != null) {
                        value = options[key];

                        // transform the provided option
                        if (property && typeof property.transform === "function") {
                            value = property.transform(value);
                        }
                    }

                    if (value === null) {
                        // value still null, take the property default
                        value = properties[key]["default"];
                    }

                    that._properties[key] = value;
                }
            }
        }

        /**
         * Binds Carousel event handling
         *
         * @private
         */
        function bindEvents() {
            if (that._elements["previous"]) {
                that._elements["previous"].addEventListener("click", function() {
                    navigate(getPreviousIndex());
                });
            }

            if (that._elements["next"]) {
                that._elements["next"].addEventListener("click", function() {
                    navigate(getNextIndex());
                });
            }

            var indicators = that._elements["indicator"];
            if (indicators) {
                for (var i = 0; i < indicators.length; i++) {
                    (function(index) {
                        indicators[i].addEventListener("click", function(event) {
                            navigateAndFocusIndicator(index);
                        });
                    })(i);
                }
            }

            that._elements.self.addEventListener("keydown", onKeyDown);
            that._elements.self.addEventListener("mouseenter", onMouseEnter);
            that._elements.self.addEventListener("mouseleave", onMouseLeave);
        }

        /**
         * Handles carousel keydown events
         *
         * @private
         * @param {Object} event The keydown event
         */
        function onKeyDown(event) {
            var index = that._active;
            var lastIndex = that._elements["indicator"].length - 1;

            switch (event.keyCode) {
                case keyCodes.ARROW_LEFT:
                case keyCodes.ARROW_UP:
                    event.preventDefault();
                    if (index > 0) {
                        navigateAndFocusIndicator(index - 1);
                    }
                    break;
                case keyCodes.ARROW_RIGHT:
                case keyCodes.ARROW_DOWN:
                    event.preventDefault();
                    if (index < lastIndex) {
                        navigateAndFocusIndicator(index + 1);
                    }
                    break;
                case keyCodes.HOME:
                    event.preventDefault();
                    navigateAndFocusIndicator(0);
                    break;
                case keyCodes.END:
                    event.preventDefault();
                    navigateAndFocusIndicator(lastIndex);
                    break;
                default:
                    return;
            }
        }

        /**
         * Handles carousel mouseenter events
         *
         * @private
         * @param {Object} event The mouseenter event
         */
        function onMouseEnter(event) {
            clearAutoplayInterval();
        }

        /**
         * Handles carousel mouseleave events
         *
         * @private
         * @param {Object} event The mouseleave event
         */
        function onMouseLeave(event) {
            resetAutoplayInterval();
        }

        /**
         * Refreshes the item markup based on the current {@code Carousel#_active} index
         *
         * @private
         */
        function refreshActive() {
            var items = that._elements["item"];
            var indicators = that._elements["indicator"];

            if (items) {
                if (Array.isArray(items)) {
                    for (var i = 0; i < items.length; i++) {
                        if (i === parseInt(that._active)) {
                            items[i].classList.add("cmp-carousel__item--active");
                            items[i].removeAttribute("aria-hidden");
                            indicators[i].classList.add("cmp-carousel__indicator--active");
                            indicators[i].setAttribute("aria-selected", true);
                            indicators[i].setAttribute("tabindex", "0");
                        } else {
                            items[i].classList.remove("cmp-carousel__item--active");
                            items[i].setAttribute("aria-hidden", true);
                            indicators[i].classList.remove("cmp-carousel__indicator--active");
                            indicators[i].setAttribute("aria-selected", false);
                            indicators[i].setAttribute("tabindex", "-1");
                        }
                    }
                } else {
                    // only one item
                    items.classList.add("cmp-carousel__item--active");
                    indicators.classList.add("cmp-carousel__indicator--active");
                }
            }
        }

        /**
         * Focuses the element and prevents scrolling the element into view
         *
         * @param {HTMLElement} element Element to focus
         */
        function focusWithoutScroll(element) {
            var x = window.scrollX;
            var y = window.scrollY;
            element.focus();
            window.scrollTo(x, y);
        }

        /**
         * Retrieves the next active index, with looping
         *
         * @private
         * @returns {Number} Index of the next carousel item
         */
        function getNextIndex() {
            return that._active === (that._elements["item"].length - 1) ? 0 : that._active + 1;
        }

        /**
         * Retrieves the previous active index, with looping
         *
         * @private
         * @returns {Number} Index of the previous carousel item
         */
        function getPreviousIndex() {
            return that._active === 0 ? (that._elements["item"].length - 1) : that._active - 1;
        }

        /**
         * Navigates to the item at the provided index
         *
         * @private
         * @param {Number} index The index of the item to navigate to
         */
        function navigate(index) {
            if (index < 0 || index > (that._elements["item"].length - 1)) {
                return;
            }

            that._active = index;
            refreshActive();

            // reset the autoplay transition interval following navigation, if not already hovering the carousel
            if (that._elements.self.parentElement.querySelector(":hover") !== that._elements.self) {
                resetAutoplayInterval();
            }
        }

        /**
         * Navigates to the item at the provided index and ensures the active indicator gains focus
         *
         * @private
         * @param {Number} index The index of the item to navigate to
         */
        function navigateAndFocusIndicator(index) {
            navigate(index);
            focusWithoutScroll(that._elements["indicator"][index]);
        }

        /**
         * Starts/resets automatic slide transition interval
         *
         * @private
         */
        function resetAutoplayInterval() {
            if (!that._properties.autoplay) {
                return;
            }
            clearAutoplayInterval();
            that._autoplayIntervalId = window.setInterval(function() {
                var indicators = that._elements["indicators"];
                if (indicators !== document.activeElement && indicators.contains(document.activeElement)) {
                    // if an indicator has focus, ensure we switch focus following navigation
                    navigateAndFocusIndicator(getNextIndex());
                } else {
                    navigate(getNextIndex());
                }
            }, that._properties.delay);
        }

        /**
         * Clears/pauses automatic slide transition interval
         *
         * @private
         */
        function clearAutoplayInterval() {
            window.clearInterval(that._autoplayIntervalId);
            that._autoplayIntervalId = null;
        }
    }

    /**
     * Reads options data from the Carousel wrapper element, defined via {@code data-cmp-*} data attributes
     *
     * @private
     * @param {HTMLElement} element The Carousel element to read options data from
     * @returns {Object} The options read from the component data attributes
     */
    function readData(element) {
        var data = element.dataset;
        var options = [];
        var capitalized = IS;
        capitalized = capitalized.charAt(0).toUpperCase() + capitalized.slice(1);
        var reserved = ["is", "hook" + capitalized];

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var value = data[key];

                if (key.indexOf(NS) === 0) {
                    key = key.slice(NS.length);
                    key = key.charAt(0).toLowerCase() + key.substring(1);

                    if (reserved.indexOf(key) === -1) {
                        options[key] = value;
                    }
                }
            }
        }

        return options;
    }

    /**
     * Document ready handler and DOM mutation observers. Initializes Carousel components as necessary.
     *
     * @private
     */
    function onDocumentReady() {
        var elements = document.querySelectorAll(selectors.self);
        for (var i = 0; i < elements.length; i++) {
            new Carousel({ element: elements[i], options: readData(elements[i]) });
        }

        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body             = document.querySelector("body");
        var observer         = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // needed for IE
                var nodesArray = [].slice.call(mutation.addedNodes);
                if (nodesArray.length > 0) {
                    nodesArray.forEach(function(addedNode) {
                        if (addedNode.querySelectorAll) {
                            var elementsArray = [].slice.call(addedNode.querySelectorAll(selectors.self));
                            elementsArray.forEach(function(element) {
                                new Carousel({ element: element, options: readData(element) });
                            });
                        }
                    });
                }
            });
        });

        observer.observe(body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState !== "loading") {
        onDocumentReady();
    } else {
        document.addEventListener("DOMContentLoaded", onDocumentReady());
    }

}());

/**********************
	Header js
/**********************/
$(document).ready(function () {
	"use strict";
	
	/* ------------- Path Name checking for header ---------------*/
	var pathName = window.location.pathname.toLowerCase();
	var pageUrl = 'others';
	if (pathName === '/content/infosys-web/en.html' || pathName === '/' || pathName === '/jp' || pathName === '/jp/' || pathName === '/cn' || pathName === '/cn/' || pathName === '/mx' || pathName === '/mx/' || pathName === '/de' || pathName === '/de/' || pathName === '/content/infosys-web/en/australia.html' || pathName === '/australia.html') {
		pageUrl = 'home';
	}

	/* ------------- Scroll Fixed second Header Industries ---------------*/
	var num = $(this).scrollTop() !== 0; /*$('header').offset().top;*/
	$(window).bind('scroll', function () {
		if (pageUrl !== 'home') {
			if ($(window).scrollTop() > num) {
				$('.hero-list').addClass('hero-list1');
				$('.listmenu').css('z-index', '9999');
				$('.hero-list1 .trigger-share .social-share > li').css('opacity','0');
                $('.social-share > li').removeClass('slideout social-share-icon');
				$('.scrollbg-show').addClass('show-strip');
				$('#logo, .insteplogocolor').attr('fill', '#007cc3');
			} else {
				num = $(this).scrollTop() !== 0;
				$('.hero-list').removeClass('hero-list1');
				$('.listmenu').css('z-index', '9');
				$('.hero-list1 .trigger-share .social-share > li').removeAttr('style');
                $('.social-share > li').removeClass('slideout social-share-icon');
				$('.scrollbg-show').removeClass('show-strip');
				$('#logo, .insteplogocolor').attr('fill', '#fff');
			}
		}
	});

	/* ------------- SCROLL UP FUNCTION HOME Pages ---------------*/
	$(window).scroll(function () {
		if ($(this).scrollTop() !== 0) {
			$('.scroll-up').fadeIn(700);
			$('.header-menu').fadeOut(700);
			$('.user-icon').css({ 'opacity': '0', 'z-index': '0' });
		} else {
			$('.scroll-up').fadeOut(700);
			$('.header-menu').fadeIn(700);
			$('.user-icon').css({ 'opacity': '1', 'z-index': '9999' });
		}

		// Scroll ProgressBar indicator
		if (pageUrl !== 'home') {
			var _document_height = $(document).height(),
				_window_height = $(window).height(),
				_scroll_top = $(window).scrollTop(),
				_w = 0;
			_w = _scroll_top * 100 / (_document_height - _window_height);
			$('.progressbar').find('> div').width(_w + '%');
		}
	});

	$('.scroll-up').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 700);
	});
	
	/* ------------- WAYPOINT PART ---------------*/
	//change menu icon background and logo color
	if ($("#do_more").length) {
		var waypoint = new Waypoint({
			element: document.getElementById('do_more'),
			handler: function () {
				$('.menu-bg').toggleClass('reverseMenu');
				$('.btn--search').toggleClass('search-toggle-bg');
				$('.stick-left-nav-ul > li').toggleClass('darkText');
				$('#logo').attr('fill', function (index, attr) {
					return attr === '#007cc3' ? '#fff' : '#007cc3';
				});
				$('.burger > .icon-bar1').toggleClass('icon-bar11');
				$('.burger > .icon-bar2').toggleClass('icon-bar21');
				$('.burger > .icon-bar3').toggleClass('icon-bar31');
			}
		});
	}
		
	/* -------------------- Dynamic Bind Sub-Header Start ----------------------- */
	var subHeaderLength = $('.header-menu ul.navbar-nav ul.dropdown-menu').children().length;
	
	if(subHeaderLength > 0) {
		for(var i=0; i<1; i++) {
			var subHeaderTitle = $('.header-menu ul.navbar-nav ul.dropdown-menu').children()[i];
			var subHeaderSubTitle = $(subHeaderTitle).children().children();
			var subHeaderSubTitleCount = Math.ceil((($(subHeaderSubTitle).length) - 1) / 3);
			var bindSubHeader = "";
			
			for(var j=0; j<$(subHeaderSubTitle).length; j++) {
				if(j==0) {
					bindSubHeader += "<ul class='col-md-4'><li class='dropdown-header'>" + $(subHeaderSubTitle)[j].textContent + "</li><li class='nav-divider'></li>";
				} else {
					bindSubHeader += "<ul class='col-md-4'><li class='dropdown-header'>&nbsp;</li><li class='nav-divider'></li>";
				}
				
				for(var k=0; k<subHeaderSubTitleCount; k++) {
					j++;
					if((($(subHeaderSubTitle).length) - 1) >= j) {
						bindSubHeader += "<li><a href='#' title='" + $(subHeaderSubTitle)[j].textContent + "'>" + $(subHeaderSubTitle)[j].textContent + "</a></li>";
					} else {
						break;
					}
				}
				if((($(subHeaderSubTitle).length) - 1) >= j) {
					j--;
					bindSubHeader += "</ul>";
				} else {
					bindSubHeader += "</ul>";
					break;
				}
			}
			$('.header-menu ul.navbar-nav ul.dropdown-menu').children()[i].innerHTML = "";
			$('.header-menu ul.navbar-nav ul.dropdown-menu').children()[i].innerHTML = bindSubHeader;			
		}
	}
	/* -------------------- Dynamic Bind Sub-Header End ------------------------- */
	
	/* ------------- Equal Height Success stories Part ---------------*/
	setTagPositionHeight();

	$(window).resize(function () {
		setTagPositionHeight();
	});

	function setTagPositionHeight() {
		$('.equal-bg, .item-list').each(function () {
			$(this).find('.tag-postion').css('top', $(this).find('.get-image-height').height());
		});
	}

	/* ------------- Mega Dropdown animation ---------------*/
	$(document).on("mouseenter", ".dropdown", function () {
		$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).fadeIn("800");
		$(this).toggleClass('open');
		$('ul.hidden-list').css('opacity', '0');
	});
	$(document).on("mouseleave", ".dropdown", function () {
		$('.dropdown-menu', this).not('.in .dropdown-menu').stop(true, true).hide();
		$(this).toggleClass('open');
		$('ul.hidden-list').css('opacity', '1');
	});
	
	//on Click BreadCrumb link
	$(document).on('click', '.hero-list > ol > li.mega-dropdown', function (e) {
		e.stopPropagation();
	});
	
	/*************** Index start ***************/
	$(window).scroll(function () {
		var windowPos = $(window).scrollTop(); // get the offset of the window from the top of page
		//Active menu
		if (windowPos >= 100) {
			$('section.scroll-section').each(function (i) {
				if ($(this).position().top <= windowPos - 0) {
					$('.sticky-left-nav li.nav-active').removeClass('nav-active mb50');
					$('.sticky-left-nav li').eq(i).addClass('nav-active mb50');
				}
			});
		} else {
			$('.stick-left-nav-ul li.nav-active-menu').removeClass('nav-active-menu');
		}
		
		/* check footer offset for left sticky nav */
		checkFooterOffset();
	});
	
	// onload Menu Active
	if ($(window).scrollTop() > 100) {
		var txx = $(window).scrollTop() + 1;
		window.scrollTo(0, txx);
	}
	
	/* This part causes smooth scrolling on nav click */
	$("nav.sticky-left-nav a").click(function (evn) {
		evn.preventDefault();
		$(this).parent().addClass("nav-active");
		$('html, body').animate({
			scrollTop: $($(this).attr('href')).offset().top + 10
		}, 500);
	});

	/* left navigation hover effects */
	$(document).on('mouseenter', '.sticky-left-nav li', function () {
		if (!$(this).hasClass('mb50')) {
			$(this).addClass('nav-active');
		}
	});
	$(document).on('mouseleave', '.sticky-left-nav li', function () {
		if (!$(this).hasClass('mb50')) {
			$(this).removeClass('nav-active');
		}
	});
	
	/* do more expand/collapse effect */
	$(document).on('click', '.expandHead', function () {
		var expandID = $(this).data('id');
		$(expandID).fadeIn();
		$(expandID).addClass('expandWrpr').removeClass('contractWrpr');
		$('.closeWrpr').addClass('closeWrprAnim');
	});
	$(document).on('click', '.closeWrpr', function () {
		$('.expandableDiv').removeClass('expandWrpr').addClass('contractWrpr');
		$('.expandableDiv').fadeOut();
		$('.closeWrpr').removeClass('closeWrprAnim');
	});

	//Contact Us Expand
	$(document).on('click', '.expand', function () {
		var expand = $(this).data('id');
		$(expand).fadeIn();
	});
	$(document).on('click', '.closeWrpr1', function () {
		$(this).parent().fadeOut();
	});

	/*Index End*/

	/* ------------- initiate counter Home Page ---------------*/
	if ($(".initiate-counter").length) {
		new Waypoint({
			element: document.getElementsByClassName('initiate-counter'),
			handler: function () {
				if (!$('.add-counter').hasClass('counter')) {
					$('.add-counter').addClass('counter');
					setTimeout(function () {
						initiateCounter();
					}, 2000);
				}
			},
			offset: 'bottom-in-view'
		});
	}

	/* initiateCounter function definition */
	function initiateCounter() {
		/* counter up initiation */
		$('.counter').each(function () {
			var target = this;
			var endVal = parseFloat($(this).attr('data-endVal'));
			var theAnimation = new CountUp(target, 0, endVal, 0, 2);
			if (endVal % 1 !== 0) {
				theAnimation = new CountUp(target, 0, endVal, 2, 2);
			}
			theAnimation.start();
		});
	}

	/* check footer's offset value and change left-navigation's position */
	function checkFooterOffset() {
        if($('.sticky-left-nav').length > 0) {
            if ($('.sticky-left-nav').offset().top + $('.sticky-left-nav').height() >= $('footer').offset().top - 10)
            {
                $('.sticky-left-nav').addClass('bottom-menu').removeClass('top-menu');
            }
    
            if ($(document).scrollTop() + window.innerHeight < $('footer').offset().top) {
                $('.sticky-left-nav').addClass('top-menu').removeClass('bottom-menu');
            }
        }         
	}

	if ($(".home_promo_banner").length) {
		var waypoint1 = new Waypoint({
			element: document.getElementsByClassName('home_promo_banner'),
			handler: function () {
				$("header .container > .navbar-header,.container > .header-menu").toggleClass('hidden-xs hidden-sm hidden-md hidden-lg');
				$("header .container").toggleClass('mt45');
			}
		});
	}
	//END
});

(function(window) {
	
	/* ------------- Path Name checking for user-icon start ---------------*/
	var pathName = window.location.pathname.toLowerCase();
	var pageUrl = 'others';
	if (pathName === '/content/infosys-web/en.html' || pathName === '/' || pathName === '/jp' || pathName === '/jp/' || pathName === '/cn' || pathName === '/cn/' || pathName === '/mx' || pathName === '/mx/' || pathName === '/de' || pathName === '/de/') {
		pageUrl = 'home';
	}
    /* ------------- Path Name checking for user-icon end ---------------*/

	'use strict';

	var mainContainer = document.querySelector('.main-wrap'), openCtrl = document.getElementById('btn-search'), closeCtrl = document
			.getElementById('btn-search-close'), searchContainer = document.querySelector('.search'), inputSearch = searchContainer
			.querySelector('.search__input');

	function init() {
		initEvents();
	}

	function initEvents() {
		openCtrl.addEventListener('click', openSearch);
		closeCtrl.addEventListener('click', closeSearch);
		document.addEventListener('keyup', function(ev) {
			if (ev.keyCode == 27) {
				closeSearch();
			}
		});
	}

	function openSearch() {
		mainContainer.classList.add('main-wrap--hide');
		$('body').css('overflow-y', 'hidden');
		$('.progressbar, .hero-list').css('display', 'none');
		$('body').find('.menu-bg').css('display', 'none');
		$('body').find('.burger').css('display', 'none');
		$('.search__color').find('.search').css('width', '100%');
		searchContainer.classList.add('search--open');
		$('.burger-search-wrapper.navbar-fixed-top').css('z-index', '0'); // For hiding burger text when open search
        $('.navbar.navbar-default.navbar-fixed-top').css('z-index', '2'); // For showing header text when open search
		$('.user-icon').css({ 'opacity': '0', 'z-index': '0' });
		setTimeout(function() {
			inputSearch.focus();
		}, 500);
	}

	function closeSearch() {
		mainContainer.classList.remove('main-wrap--hide');
		$('body').css('overflow-y', 'scroll');
		$('.progressbar, .hero-list').css('display', 'block');
		$('body').find('.menu-bg').css('display', 'block');
		$('body').find('.burger').css('display', 'block');
		$('.search__color').find('.search').css('width', 'auto');
		searchContainer.classList.remove('search--open');
		$('.navbar.navbar-default.navbar-fixed-top, .burger-search-wrapper.navbar-fixed-top').css('z-index', '2'); // For Showing header and burger text when close search
        if((pageUrl == "home" && $(window).scrollTop() != 0) || (pageUrl != "home" && $(window).scrollTop() != 0)) {
            $('.user-icon').css({ 'opacity': '0', 'z-index': '0' });
        } else {
			$('.user-icon').css({ 'opacity': '1', 'z-index': '9999' });
        }
		inputSearch.blur();
		inputSearch.value = '';
	}

	init();

})(window);

/**********************
	Header js
/**********************/
$(document).ready(function () {
	"use strict";
	/* ------------- Social Share ---------------*/
	$(document).on("click", ".trigger-share", function () {//alert("1");
		$('ul.social-share > li').toggleClass('slideout social-share-icon');
		$('.hero-list1 .trigger-share .social-share > li').css('opacity','1');
	});
	$(document).on("click", ".trigger-share-pr", function () {
		$(this).closest(".social-tag").find(".social-share-pr > li").toggleClass('slideout social-share-icon');
	});


});


function twitterShare(url, title){
   
 $.getJSON(
             "https://api-ssl.bitly.com/v3/shorten?", {
                           "access_token": "c763fa6bf73dac4f25f6d87c52fc38cadbbeb5a2",
                            "longUrl": url
                },
                function (response) {
                    //alert('url');
                          url = String(response.data.url);

                    var width=500, height=500;

                     var left = (window.screen.width / 2) - ((width / 2) + 10);
    				var top = (window.screen.height / 2) - ((height / 2) + 50);

                     	  var twitterUrl = 'https://twitter.com/intent/tweet?url='.concat(url)+'&text='+title;
    					  var popUp = window.open(twitterUrl,'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();


                 }
  );
 return false;
}


/*

insights.js

*/

$(document).ready(function(){
	$('#insights .insight-btn').attr('style', 'display: block !important');
});
/* ------------- Tab Accordion Product landing ---------------*/
$(document).ready(function () {
	if ($("#verticalTab").length) {
		$('#verticalTab').easyResponsiveTabs({
			type: 'vertical',
			width: 'auto',
			fit: true
		});
	}

    /*if($("#verticalTab ul.resp-tabs-list li").length > 0) {
    	var tabListHeight = $("#verticalTab ul.resp-tabs-list").outerHeight();
        $(".repeated_css_tab, .tabs_img").css("height", tabListHeight);
    }*/

});



(function ($, window) {
  'use strict';
  /* jshint unused:false */

  /* exported CONSTANTS */
  var CONSTANTS = {
    CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL: 50, // timeout interval for repeatedly moving the tabs container
                                                // by one increment while the mouse is held down--decrease to
                                                // make mousedown continous scrolling faster
    SCROLL_OFFSET_FRACTION: 6, // each click moves the container this fraction of the fixed container--decrease
                               // to make the tabs scroll farther per click
  
    DATA_KEY_DDMENU_MODIFIED: 'scrtabsddmenumodified',
    DATA_KEY_IS_MOUSEDOWN: 'scrtabsismousedown',
  
    CSS_CLASSES: {
      BOOTSTRAP4: 'scrtabs-bootstrap4',
      RTL: 'scrtabs-rtl',
      SCROLL_ARROW_CLICK_TARGET: 'scrtabs-click-target',
      SCROLL_ARROW_DISABLE: 'scrtabs-disable',
      SCROLL_ARROW_WITH_CLICK_TARGET: 'scrtabs-with-click-target'
    },
  
    SLIDE_DIRECTION: {
      LEFT: 1,
      RIGHT: 2
    },
  
    EVENTS: {
      CLICK: 'click.scrtabs',
      DROPDOWN_MENU_HIDE: 'hide.bs.dropdown.scrtabs',
      DROPDOWN_MENU_SHOW: 'show.bs.dropdown.scrtabs',
      FORCE_REFRESH: 'forcerefresh.scrtabs',
      MOUSEDOWN: 'mousedown.scrtabs',
      MOUSEUP: 'mouseup.scrtabs',
      TABS_READY: 'ready.scrtabs',
      TOUCH_END: 'touchend.scrtabs',
      TOUCH_MOVE: 'touchmove.scrtabs',
      TOUCH_START: 'touchstart.scrtabs',
      WINDOW_RESIZE: 'resize.scrtabs'
    }
  };
  
  // smartresize from Paul Irish (debounced window resize)
  (function (sr) {
    var debounce = function (func, threshold, execAsap) {
      var timeout;
  
      return function debounced() {
        var obj = this, args = arguments;
        function delayed() {
          if (!execAsap) {
            func.apply(obj, args);
          }
          timeout = null;
        }
  
        if (timeout) {
          clearTimeout(timeout);
        } else if (execAsap) {
          func.apply(obj, args);
        }
  
        timeout = setTimeout(delayed, threshold || 100);
      };
    };
    $.fn[sr] = function (fn, customEventName) {
      var eventName = customEventName || CONSTANTS.EVENTS.WINDOW_RESIZE;
      return fn ? this.bind(eventName, debounce(fn)) : this.trigger(sr);
    };
  
  })('smartresizeScrtabs');
  
  /* ***********************************************************************************
   * ElementsHandler - Class that each instance of ScrollingTabsControl will instantiate
   * **********************************************************************************/
  function ElementsHandler(scrollingTabsControl) {
    var ehd = this;
  
    ehd.stc = scrollingTabsControl;
  }
  
  // ElementsHandler prototype methods
  (function (p) {
      p.initElements = function (options) {
        var ehd = this;
  
        ehd.setElementReferences(options);
        ehd.setEventListeners(options);
      };
  
      p.listenForTouchEvents = function () {
        var ehd = this,
            stc = ehd.stc,
            smv = stc.scrollMovement,
            ev = CONSTANTS.EVENTS;
  
        var touching = false;
        var touchStartX;
        var startingContainerLeftPos;
        var newLeftPos;
  
        stc.$movableContainer
          .on(ev.TOUCH_START, function (e) {
            touching = true;
            startingContainerLeftPos = stc.movableContainerLeftPos;
            touchStartX = e.originalEvent.changedTouches[0].pageX;
          })
          .on(ev.TOUCH_END, function () {
            touching = false;
          })
          .on(ev.TOUCH_MOVE, function (e) {
            if (!touching) {
              return;
            }
  
            var touchPageX = e.originalEvent.changedTouches[0].pageX;
            var diff = touchPageX - touchStartX;
            if (stc.rtl) {
              diff = -diff;
            }
            var minPos;
  
            newLeftPos = startingContainerLeftPos + diff;
            if (newLeftPos > 0) {
              newLeftPos = 0;
            } else {
              minPos = smv.getMinPos();
              if (newLeftPos < minPos) {
                newLeftPos = minPos;
              }
            }
            stc.movableContainerLeftPos = newLeftPos;
  
            var leftOrRight = stc.rtl ? 'right' : 'left';
            stc.$movableContainer.css(leftOrRight, smv.getMovableContainerCssLeftVal());
            smv.refreshScrollArrowsDisabledState();
          });
      };
  
      p.refreshAllElementSizes = function () {
        var ehd = this,
            stc = ehd.stc,
            smv = stc.scrollMovement,
            scrollArrowsWereVisible = stc.scrollArrowsVisible,
            actionsTaken = {
              didScrollToActiveTab: false
            },
            isPerformingSlideAnim = false,
            minPos;
  
        ehd.setElementWidths();
        ehd.setScrollArrowVisibility();
  
        // this could have been a window resize or the removal of a
        // dynamic tab, so make sure the movable container is positioned
        // correctly because, if it is far to the left and we increased the
        // window width, it's possible that the tabs will be too far left,
        // beyond the min pos.
        if (stc.scrollArrowsVisible) {
          // make sure container not too far left
          minPos = smv.getMinPos();
  
          isPerformingSlideAnim = smv.scrollToActiveTab({
            isOnWindowResize: true
          });
  
          if (!isPerformingSlideAnim) {
            smv.refreshScrollArrowsDisabledState();
  
            if (stc.rtl) {
              if (stc.movableContainerRightPos < minPos) {
                smv.incrementMovableContainerLeft(minPos);
              }
            } else {
              if (stc.movableContainerLeftPos < minPos) {
                smv.incrementMovableContainerRight(minPos);
              }
            }
          }
  
          actionsTaken.didScrollToActiveTab = true;
  
        } else if (scrollArrowsWereVisible) {
          // scroll arrows went away after resize, so position movable container at 0
          stc.movableContainerLeftPos = 0;
          smv.slideMovableContainerToLeftPos();
        }
  
        return actionsTaken;
      };
  
      p.setElementReferences = function (settings) {
        var ehd = this,
            stc = ehd.stc,
            $tabsContainer = stc.$tabsContainer,
            $leftArrow,
            $rightArrow,
            $leftArrowClickTarget,
            $rightArrowClickTarget;
  
        stc.isNavPills = false;
  
        if (stc.rtl) {
          $tabsContainer.addClass(CONSTANTS.CSS_CLASSES.RTL);
        }
  
        if (stc.usingBootstrap4) {
          $tabsContainer.addClass(CONSTANTS.CSS_CLASSES.BOOTSTRAP4);
        }
  
        stc.$fixedContainer = $tabsContainer.find('.scrtabs-tabs-fixed-container');
        $leftArrow = stc.$fixedContainer.prev();
        $rightArrow = stc.$fixedContainer.next();
  
        // if we have custom arrow content, we might have a click target defined
        if (settings.leftArrowContent) {
          $leftArrowClickTarget = $leftArrow.find('.' + CONSTANTS.CSS_CLASSES.SCROLL_ARROW_CLICK_TARGET);
        }
  
        if (settings.rightArrowContent) {
          $rightArrowClickTarget = $rightArrow.find('.' + CONSTANTS.CSS_CLASSES.SCROLL_ARROW_CLICK_TARGET);
        }
  
        if ($leftArrowClickTarget && $leftArrowClickTarget.length) {
          $leftArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_WITH_CLICK_TARGET);
        } else {
          $leftArrowClickTarget = $leftArrow;
        }
  
        if ($rightArrowClickTarget && $rightArrowClickTarget.length) {
          $rightArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_WITH_CLICK_TARGET);
        } else {
          $rightArrowClickTarget = $rightArrow;
        }
  
        stc.$movableContainer = $tabsContainer.find('.scrtabs-tabs-movable-container');
        stc.$tabsUl = $tabsContainer.find('.nav-tabs');
  
        // check for pills
        if (!stc.$tabsUl.length) {
          stc.$tabsUl = $tabsContainer.find('.nav-pills');
  
          if (stc.$tabsUl.length) {
            stc.isNavPills = true;
          }
        }
  
        stc.$tabsLiCollection = stc.$tabsUl.find('> li');
  
        stc.$slideLeftArrow = stc.reverseScroll ? $leftArrow : $rightArrow;
        stc.$slideLeftArrowClickTarget = stc.reverseScroll ? $leftArrowClickTarget : $rightArrowClickTarget;
        stc.$slideRightArrow = stc.reverseScroll ? $rightArrow : $leftArrow;
        stc.$slideRightArrowClickTarget = stc.reverseScroll ? $rightArrowClickTarget : $leftArrowClickTarget;
        stc.$scrollArrows = stc.$slideLeftArrow.add(stc.$slideRightArrow);
  
        stc.$win = $(window);
      };
  
      p.setElementWidths = function () {
        var ehd = this,
            stc = ehd.stc;
  
        stc.winWidth = stc.$win.width();
        stc.scrollArrowsCombinedWidth = stc.$slideLeftArrow.outerWidth() + stc.$slideRightArrow.outerWidth();
  
        ehd.setFixedContainerWidth();
        ehd.setMovableContainerWidth();
      };
  
      p.setEventListeners = function (settings) {
        var ehd = this,
            stc = ehd.stc,
            evh = stc.eventHandlers,
            ev = CONSTANTS.EVENTS,
            resizeEventName = ev.WINDOW_RESIZE + stc.instanceId;
  
        if (settings.enableSwiping) {
          ehd.listenForTouchEvents();
        }
  
        stc.$slideLeftArrowClickTarget
          .off('.scrtabs')
          .on(ev.MOUSEDOWN, function (e) { evh.handleMousedownOnSlideMovContainerLeftArrow.call(evh, e); })
          .on(ev.MOUSEUP, function (e) { evh.handleMouseupOnSlideMovContainerLeftArrow.call(evh, e); })
          .on(ev.CLICK, function (e) { evh.handleClickOnSlideMovContainerLeftArrow.call(evh, e); });
  
        stc.$slideRightArrowClickTarget
          .off('.scrtabs')
          .on(ev.MOUSEDOWN, function (e) { evh.handleMousedownOnSlideMovContainerRightArrow.call(evh, e); })
          .on(ev.MOUSEUP, function (e) { evh.handleMouseupOnSlideMovContainerRightArrow.call(evh, e); })
          .on(ev.CLICK, function (e) { evh.handleClickOnSlideMovContainerRightArrow.call(evh, e); });
  
        if (stc.tabClickHandler) {
          stc.$tabsLiCollection
            .find('a[data-toggle="tab"]')
            .off(ev.CLICK)
            .on(ev.CLICK, stc.tabClickHandler);
        }
  
        stc.$win
          .off(resizeEventName)
          .smartresizeScrtabs(function (e) { evh.handleWindowResize.call(evh, e); }, resizeEventName);
  
        $('body').on(CONSTANTS.EVENTS.FORCE_REFRESH, stc.elementsHandler.refreshAllElementSizes.bind(stc.elementsHandler));
      };
  
      p.setFixedContainerWidth = function () {
        var ehd = this,
            stc = ehd.stc,
            tabsContainerRect = stc.$tabsContainer.get(0).getBoundingClientRect();
        /**
         * @author poletaew
         * It solves problem with rounding by jQuery.outerWidth
         * If we have real width 100.5 px, jQuery.outerWidth returns us 101 px and we get layout's fail
         */
        stc.fixedContainerWidth = tabsContainerRect.width || (tabsContainerRect.right - tabsContainerRect.left);
        stc.fixedContainerWidth = stc.fixedContainerWidth * stc.widthMultiplier;
  
        stc.$fixedContainer.width(stc.fixedContainerWidth);
      };
  
      p.setFixedContainerWidthForHiddenScrollArrows = function () {
        var ehd = this,
            stc = ehd.stc;
  
        stc.$fixedContainer.width(stc.fixedContainerWidth);
      };
  
      p.setFixedContainerWidthForVisibleScrollArrows = function () {
        var ehd = this,
            stc = ehd.stc;
  
        stc.$fixedContainer.width(stc.fixedContainerWidth - stc.scrollArrowsCombinedWidth);
      };
  
      p.setMovableContainerWidth = function () {
        var ehd = this,
            stc = ehd.stc,
            $tabLi = stc.$tabsUl.find('> li');
  
        stc.movableContainerWidth = 0;
  
        if ($tabLi.length) {
  
          $tabLi.each(function () {
            var $li = $(this),
                totalMargin = 0;
  
            if (stc.isNavPills) { // pills have a margin-left, tabs have no margin
              totalMargin = parseInt($li.css('margin-left'), 10) + parseInt($li.css('margin-right'), 10);
            }
  
            stc.movableContainerWidth += ($li.outerWidth() + totalMargin);
          });
  
          stc.movableContainerWidth += 1;
  
          // if the tabs don't span the width of the page, force the
          // movable container width to full page width so the bottom
          // border spans the page width instead of just spanning the
          // width of the tabs
          if (stc.movableContainerWidth < stc.fixedContainerWidth) {
            stc.movableContainerWidth = stc.fixedContainerWidth;
          }
        }
  
        stc.$movableContainer.width(stc.movableContainerWidth);
      };
  
      p.setScrollArrowVisibility = function () {
        var ehd = this,
            stc = ehd.stc,
            shouldBeVisible = stc.movableContainerWidth > stc.fixedContainerWidth;
  
        if (shouldBeVisible && !stc.scrollArrowsVisible) {
          stc.$scrollArrows.show();
          stc.scrollArrowsVisible = true;
        } else if (!shouldBeVisible && stc.scrollArrowsVisible) {
          stc.$scrollArrows.hide();
          stc.scrollArrowsVisible = false;
        }
  
        if (stc.scrollArrowsVisible) {
          ehd.setFixedContainerWidthForVisibleScrollArrows();
        } else {
          ehd.setFixedContainerWidthForHiddenScrollArrows();
        }
      };
  
  }(ElementsHandler.prototype));
  
  /* ***********************************************************************************
   * EventHandlers - Class that each instance of ScrollingTabsControl will instantiate
   * **********************************************************************************/
  function EventHandlers(scrollingTabsControl) {
    var evh = this;
  
    evh.stc = scrollingTabsControl;
  }
  
  // prototype methods
  (function (p){
    p.handleClickOnSlideMovContainerLeftArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.scrollMovement.incrementMovableContainerLeft();
    };
  
    p.handleClickOnSlideMovContainerRightArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.scrollMovement.incrementMovableContainerRight();
    };
  
    p.handleMousedownOnSlideMovContainerLeftArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, true);
      stc.scrollMovement.continueSlideMovableContainerLeft();
    };
  
    p.handleMousedownOnSlideMovContainerRightArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, true);
      stc.scrollMovement.continueSlideMovableContainerRight();
    };
  
    p.handleMouseupOnSlideMovContainerLeftArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, false);
    };
  
    p.handleMouseupOnSlideMovContainerRightArrow = function () {
      var evh = this,
          stc = evh.stc;
  
      stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, false);
    };
  
    p.handleWindowResize = function () {
      var evh = this,
          stc = evh.stc,
          newWinWidth = stc.$win.width();
  
      if (newWinWidth === stc.winWidth) {
        return false;
      }
  
      stc.winWidth = newWinWidth;
      stc.elementsHandler.refreshAllElementSizes();
    };
  
  }(EventHandlers.prototype));
  
  /* ***********************************************************************************
   * ScrollMovement - Class that each instance of ScrollingTabsControl will instantiate
   * **********************************************************************************/
  function ScrollMovement(scrollingTabsControl) {
    var smv = this;
  
    smv.stc = scrollingTabsControl;
  }
  
  // prototype methods
  (function (p) {
  
    p.continueSlideMovableContainerLeft = function () {
      var smv = this,
          stc = smv.stc;
  
      setTimeout(function() {
        if (stc.movableContainerLeftPos <= smv.getMinPos()  ||
            !stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN)) {
          return;
        }
  
        if (!smv.incrementMovableContainerLeft()) { // haven't reached max left
          smv.continueSlideMovableContainerLeft();
        }
      }, CONSTANTS.CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL);
    };
  
    p.continueSlideMovableContainerRight = function () {
      var smv = this,
          stc = smv.stc;
  
      setTimeout(function() {
        if (stc.movableContainerLeftPos >= 0  ||
            !stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN)) {
          return;
        }
  
        if (!smv.incrementMovableContainerRight()) { // haven't reached max right
          smv.continueSlideMovableContainerRight();
        }
      }, CONSTANTS.CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL);
    };
  
    p.decrementMovableContainerLeftPos = function (minPos) {
      var smv = this,
          stc = smv.stc;
  
      stc.movableContainerLeftPos -= (stc.fixedContainerWidth / CONSTANTS.SCROLL_OFFSET_FRACTION);
      if (stc.movableContainerLeftPos < minPos) {
        stc.movableContainerLeftPos = minPos;
      } else if (stc.scrollToTabEdge) {
        smv.setMovableContainerLeftPosToTabEdge(CONSTANTS.SLIDE_DIRECTION.LEFT);
  
        if (stc.movableContainerLeftPos < minPos) {
          stc.movableContainerLeftPos = minPos;
        }
      }
    };
  
    p.disableSlideLeftArrow = function () {
      var smv = this,
          stc = smv.stc;
  
      if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
        return;
      }
  
      stc.$slideLeftArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
    };
  
    p.disableSlideRightArrow = function () {
      var smv = this,
          stc = smv.stc;
  
      if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
        return;
      }
  
      stc.$slideRightArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
    };
  
    p.enableSlideLeftArrow = function () {
      var smv = this,
          stc = smv.stc;
  
      if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
        return;
      }
  
      stc.$slideLeftArrow.removeClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
    };
  
    p.enableSlideRightArrow = function () {
      var smv = this,
          stc = smv.stc;
  
      if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
        return;
      }
  
      stc.$slideRightArrow.removeClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
    };
  
    p.getMinPos = function () {
      var smv = this,
          stc = smv.stc;
  
      return stc.scrollArrowsVisible ? (stc.fixedContainerWidth - stc.movableContainerWidth - stc.scrollArrowsCombinedWidth) : 0;
    };
  
    p.getMovableContainerCssLeftVal = function () {
      var smv = this,
          stc = smv.stc;
  
      return (stc.movableContainerLeftPos === 0) ? '0' : stc.movableContainerLeftPos + 'px';
    };
  
    p.incrementMovableContainerLeft = function () {
      var smv = this,
          stc = smv.stc,
          minPos = smv.getMinPos();
  
      smv.decrementMovableContainerLeftPos(minPos);
      smv.slideMovableContainerToLeftPos();
      smv.enableSlideRightArrow();
  
      // return true if we're fully left, false otherwise
      return (stc.movableContainerLeftPos === minPos);
    };
  
    p.incrementMovableContainerRight = function (minPos) {
      var smv = this,
          stc = smv.stc;
  
      // if minPos passed in, the movable container was beyond the minPos
      if (minPos) {
        stc.movableContainerLeftPos = minPos;
      } else {
        stc.movableContainerLeftPos += (stc.fixedContainerWidth / CONSTANTS.SCROLL_OFFSET_FRACTION);
  
        if (stc.movableContainerLeftPos > 0) {
          stc.movableContainerLeftPos = 0;
        } else if (stc.scrollToTabEdge) {
          smv.setMovableContainerLeftPosToTabEdge(CONSTANTS.SLIDE_DIRECTION.RIGHT);
        }
      }
  
      smv.slideMovableContainerToLeftPos();
      smv.enableSlideLeftArrow();
  
      // return true if we're fully right, false otherwise
      // left pos of 0 is the movable container's max position (farthest right)
      return (stc.movableContainerLeftPos === 0);
    };
  
    p.refreshScrollArrowsDisabledState = function() {
      var smv = this,
          stc = smv.stc;
  
      if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
        return;
      }
  
      if (stc.movableContainerLeftPos >= 0) { // movable container fully right
        smv.disableSlideRightArrow();
        smv.enableSlideLeftArrow();
        return;
      }
  
      if (stc.movableContainerLeftPos <= smv.getMinPos()) { // fully left
        smv.disableSlideLeftArrow();
        smv.enableSlideRightArrow();
        return;
      }
  
      smv.enableSlideLeftArrow();
      smv.enableSlideRightArrow();
    };
  
    p.scrollToActiveTab = function () {
      var smv = this,
          stc = smv.stc,
          $activeTab,
          $activeTabAnchor,
          activeTabLeftPos,
          activeTabRightPos,
          rightArrowLeftPos,
          leftScrollArrowWidth,
          rightScrollArrowWidth;
  
      if (!stc.scrollArrowsVisible) {
        return;
      }
  
      if (stc.usingBootstrap4) {
        $activeTabAnchor = stc.$tabsUl.find('li > .nav-link.active');
        if ($activeTabAnchor.length) {
          $activeTab = $activeTabAnchor.parent();
        }
      } else {
        $activeTab = stc.$tabsUl.find('li.active');
      }
  
      if (!$activeTab || !$activeTab.length) {
        return;
      }
  
      rightScrollArrowWidth = stc.$slideRightArrow.outerWidth();
  
      /**
       * @author poletaew
       * We need relative offset (depends on $fixedContainer), don't absolute
       */
      activeTabLeftPos = $activeTab.offset().left - stc.$fixedContainer.offset().left;
      activeTabRightPos = activeTabLeftPos + $activeTab.outerWidth();
  
      rightArrowLeftPos = stc.fixedContainerWidth - rightScrollArrowWidth;
  
      if (stc.rtl) {
        leftScrollArrowWidth = stc.$slideLeftArrow.outerWidth();
  
        if (activeTabLeftPos < 0) { // active tab off left side
          stc.movableContainerLeftPos += activeTabLeftPos;
          smv.slideMovableContainerToLeftPos();
          return true;
        } else { // active tab off right side
          if (activeTabRightPos > rightArrowLeftPos) {
            stc.movableContainerLeftPos += (activeTabRightPos - rightArrowLeftPos) + (2 * rightScrollArrowWidth);
            smv.slideMovableContainerToLeftPos();
            return true;
          }
        }
      } else {
        if (activeTabRightPos > rightArrowLeftPos) { // active tab off right side
          stc.movableContainerLeftPos -= (activeTabRightPos - rightArrowLeftPos + rightScrollArrowWidth);
          smv.slideMovableContainerToLeftPos();
          return true;
        } else {
          leftScrollArrowWidth = stc.$slideLeftArrow.outerWidth();
          if (activeTabLeftPos < leftScrollArrowWidth) { // active tab off left side
            stc.movableContainerLeftPos += leftScrollArrowWidth - activeTabLeftPos;
            smv.slideMovableContainerToLeftPos();
            return true;
          }
        }
      }
  
      return false;
    };
  
    p.setMovableContainerLeftPosToTabEdge = function (slideDirection) {
      var smv = this,
          stc = smv.stc,
          offscreenWidth = -stc.movableContainerLeftPos,
          totalTabWidth = 0;
  
        // make sure LeftPos is set so that a tab edge will be against the
        // left scroll arrow so we won't have a partial, cut-off tab
        stc.$tabsLiCollection.each(function () {
          var tabWidth = $(this).width();
  
          totalTabWidth += tabWidth;
  
          if (totalTabWidth > offscreenWidth) {
            stc.movableContainerLeftPos = (slideDirection === CONSTANTS.SLIDE_DIRECTION.RIGHT) ? -(totalTabWidth - tabWidth) : -totalTabWidth;
            return false; // exit .each() loop
          }
  
        });
    };
  
    p.slideMovableContainerToLeftPos = function () {
      var smv = this,
          stc = smv.stc,
          minPos = smv.getMinPos(),
          leftOrRightVal;
  
      if (stc.movableContainerLeftPos > 0) {
        stc.movableContainerLeftPos = 0;
      } else if (stc.movableContainerLeftPos < minPos) {
        stc.movableContainerLeftPos = minPos;
      }
  
      stc.movableContainerLeftPos = stc.movableContainerLeftPos / 1;
      leftOrRightVal = smv.getMovableContainerCssLeftVal();
  
      smv.performingSlideAnim = true;
  
      var targetPos = stc.rtl ? { right: leftOrRightVal } : { left: leftOrRightVal };
  
      stc.$movableContainer.stop().animate(targetPos, 'slow', function __slideAnimComplete() {
        var newMinPos = smv.getMinPos();
  
        smv.performingSlideAnim = false;
  
        // if we slid past the min pos--which can happen if you resize the window
        // quickly--move back into position
        if (stc.movableContainerLeftPos < newMinPos) {
          smv.decrementMovableContainerLeftPos(newMinPos);
  
          targetPos = stc.rtl ? { right: smv.getMovableContainerCssLeftVal() } : { left: smv.getMovableContainerCssLeftVal() };
  
          stc.$movableContainer.stop().animate(targetPos, 'fast', function() {
            smv.refreshScrollArrowsDisabledState();
          });
        } else {
          smv.refreshScrollArrowsDisabledState();
        }
      });
    };
  
  }(ScrollMovement.prototype));
  
  /* **********************************************************************
   * ScrollingTabsControl - Class that each directive will instantiate
   * **********************************************************************/
  function ScrollingTabsControl($tabsContainer) {
    var stc = this;
  
    stc.$tabsContainer = $tabsContainer;
    stc.instanceId = $.fn.scrollingTabs.nextInstanceId++;
  
    stc.movableContainerLeftPos = 0;
    stc.scrollArrowsVisible = false;
    stc.scrollToTabEdge = false;
    stc.disableScrollArrowsOnFullyScrolled = false;
    stc.reverseScroll = false;
    stc.widthMultiplier = 1;
  
    stc.scrollMovement = new ScrollMovement(stc);
    stc.eventHandlers = new EventHandlers(stc);
    stc.elementsHandler = new ElementsHandler(stc);
  }
  
  // prototype methods
  (function (p) {
    p.initTabs = function (options, $scroller, readyCallback, attachTabContentToDomCallback) {
      var stc = this,
          elementsHandler = stc.elementsHandler,
          num;
  
      if (options.enableRtlSupport && $('html').attr('dir') === 'rtl') {
        stc.rtl = true;
      }
  
      if (options.scrollToTabEdge) {
        stc.scrollToTabEdge = true;
      }
  
      if (options.disableScrollArrowsOnFullyScrolled) {
        stc.disableScrollArrowsOnFullyScrolled = true;
      }
  
      if (options.reverseScroll) {
        stc.reverseScroll = true;
      }
  
      if (options.widthMultiplier !== 1) {
        num = Number(options.widthMultiplier); // handle string value
  
        if (!isNaN(num)) {
          stc.widthMultiplier = num;
        }
      }
  
      if (options.bootstrapVersion.toString().charAt(0) === '4') {
        stc.usingBootstrap4 = true;
      }
  
      setTimeout(initTabsAfterTimeout, 100);
  
      function initTabsAfterTimeout() {
        var actionsTaken;
  
        // if we're just wrapping non-data-driven tabs, the user might
        // have the .nav-tabs hidden to prevent the clunky flash of
        // multi-line tabs on page refresh, so we need to make sure
        // they're visible before trying to wrap them
        $scroller.find('.nav-tabs').show();
  
        elementsHandler.initElements(options);
        actionsTaken = elementsHandler.refreshAllElementSizes();
  
        $scroller.css('visibility', 'visible');
  
        if (attachTabContentToDomCallback) {
          attachTabContentToDomCallback();
        }
  
        if (readyCallback) {
          readyCallback();
        }
      }
    };
  
    p.scrollToActiveTab = function(options) {
      var stc = this,
          smv = stc.scrollMovement;
  
      smv.scrollToActiveTab(options);
    };
  }(ScrollingTabsControl.prototype));
  

  /* exported buildNavTabsAndTabContentForTargetElementInstance */
  var tabElements = (function () {
  
    return {
      getElTabPaneForLi: getElTabPaneForLi,
      getNewElNavTabs: getNewElNavTabs,
      getNewElScrollerElementWrappingNavTabsInstance: getNewElScrollerElementWrappingNavTabsInstance,
      getNewElTabAnchor: getNewElTabAnchor,
      getNewElTabContent: getNewElTabContent,
      getNewElTabLi: getNewElTabLi,
      getNewElTabPane: getNewElTabPane
    };
  
    ///////////////////
  
    // ---- retrieve existing elements from the DOM ----------
    function getElTabPaneForLi($li) {
      return $($li.find('a').attr('href'));
    }
  
  
    // ---- create new elements ----------
    function getNewElNavTabs() {
      return $('<ul class="nav nav-tabs" role="tablist"></ul>');
    }
  
    function getNewElScrollerElementWrappingNavTabsInstance($navTabsInstance, settings) {
      var $tabsContainer = $('<div class="scrtabs-tab-container"></div>'),
          leftArrowContent = settings.leftArrowContent || '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-left"></div>',
          $leftArrow = $(leftArrowContent),
          rightArrowContent = settings.rightArrowContent || '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-right"></div>',
          $rightArrow = $(rightArrowContent),
          $fixedContainer = $('<div class="scrtabs-tabs-fixed-container"></div>'),
          $movableContainer = $('<div class="scrtabs-tabs-movable-container"></div>');
  
      if (settings.disableScrollArrowsOnFullyScrolled) {
        $leftArrow.add($rightArrow).addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
      }
  
      return $tabsContainer
                .append($leftArrow,
                        $fixedContainer.append($movableContainer.append($navTabsInstance)),
                        $rightArrow);
    }
  
    function getNewElTabAnchor(tab, propNames) {
      return $('<a role="tab" data-toggle="tab"></a>')
              .attr('href', '#' + tab[propNames.paneId])
              .html(tab[propNames.title]);
    }
  
    function getNewElTabContent() {
      return $('<div class="tab-content"></div>');
    }
  
    function getNewElTabLi(tab, propNames, options) {
      var liContent = options.tabLiContent || '<li role="presentation" class=""></li>',
          $li = $(liContent),
          $a = getNewElTabAnchor(tab, propNames).appendTo($li);
  
      if (tab[propNames.disabled]) {
        $li.addClass('disabled');
        $a.attr('data-toggle', '');
      } else if (options.forceActiveTab && tab[propNames.active]) {
        $li.addClass('active');
      }
  
      if (options.tabPostProcessor) {
        options.tabPostProcessor($li, $a);
      }
  
      return $li;
    }
  
    function getNewElTabPane(tab, propNames, options) {
      var $pane = $('<div role="tabpanel" class="tab-pane"></div>')
                  .attr('id', tab[propNames.paneId])
                  .html(tab[propNames.content]);
  
      if (options.forceActiveTab && tab[propNames.active]) {
        $pane.addClass('active');
      }
  
      return $pane;
    }
  
  
  }()); // tabElements
  
  var tabUtils = (function () {
  
    return {
      didTabOrderChange: didTabOrderChange,
      getIndexOfClosestEnabledTab: getIndexOfClosestEnabledTab,
      getTabIndexByPaneId: getTabIndexByPaneId,
      storeDataOnLiEl: storeDataOnLiEl
    };
  
    ///////////////////
  
    function didTabOrderChange($currTabLis, updatedTabs, propNames) {
      var isTabOrderChanged = false;
  
      $currTabLis.each(function (currDomIdx) {
        var newIdx = getTabIndexByPaneId(updatedTabs, propNames.paneId, $(this).data('tab')[propNames.paneId]);
  
        if ((newIdx > -1) && (newIdx !== currDomIdx)) { // tab moved
          isTabOrderChanged = true;
          return false; // exit .each() loop
        }
      });
  
      return isTabOrderChanged;
    }
  
    function getIndexOfClosestEnabledTab($currTabLis, startIndex) {
      var lastIndex = $currTabLis.length - 1,
          closestIdx = -1,
          incrementFromStartIndex = 0,
          testIdx = 0;
  
      // expand out from the current tab looking for an enabled tab;
      // we prefer the tab after us over the tab before
      while ((closestIdx === -1) && (testIdx >= 0)) {
  
        if ( (((testIdx = startIndex + (++incrementFromStartIndex)) <= lastIndex) &&
              !$currTabLis.eq(testIdx).hasClass('disabled')) ||
              (((testIdx = startIndex - incrementFromStartIndex) >= 0) &&
               !$currTabLis.eq(testIdx).hasClass('disabled')) ) {
  
          closestIdx = testIdx;
  
        }
      }
  
      return closestIdx;
    }
  
    function getTabIndexByPaneId(tabs, paneIdPropName, paneId) {
      var idx = -1;
  
      tabs.some(function (tab, i) {
        if (tab[paneIdPropName] === paneId) {
          idx = i;
          return true; // exit loop
        }
      });
  
      return idx;
    }
  
    function storeDataOnLiEl($li, tabs, index) {
      $li.data({
        tab: $.extend({}, tabs[index]), // store a clone so we can check for changes
        index: index
      });
    }
  
  }()); // tabUtils
  
  function buildNavTabsAndTabContentForTargetElementInstance($targetElInstance, settings, readyCallback) {
    var tabs = settings.tabs,
        propNames = {
          paneId: settings.propPaneId,
          title: settings.propTitle,
          active: settings.propActive,
          disabled: settings.propDisabled,
          content: settings.propContent
        },
        ignoreTabPanes = settings.ignoreTabPanes,
        hasTabContent = tabs.length && tabs[0][propNames.content] !== undefined,
        $navTabs = tabElements.getNewElNavTabs(),
        $tabContent = tabElements.getNewElTabContent(),
        $scroller,
        attachTabContentToDomCallback = ignoreTabPanes ? null : function() {
          $scroller.after($tabContent);
        };
  
    if (!tabs.length) {
      return;
    }
  
    tabs.forEach(function(tab, index) {
      var options = {
        forceActiveTab: true,
        tabLiContent: settings.tabsLiContent && settings.tabsLiContent[index],
        tabPostProcessor: settings.tabsPostProcessors && settings.tabsPostProcessors[index]
      };
  
      tabElements
        .getNewElTabLi(tab, propNames, options)
        .appendTo($navTabs);
  
      // build the tab panes if we weren't told to ignore them and there's
      // tab content data available
      if (!ignoreTabPanes && hasTabContent) {
        tabElements
          .getNewElTabPane(tab, propNames, options)
          .appendTo($tabContent);
      }
    });
  
    $scroller = wrapNavTabsInstanceInScroller($navTabs,
                                              settings,
                                              readyCallback,
                                              attachTabContentToDomCallback);
  
    $scroller.appendTo($targetElInstance);
  
    $targetElInstance.data({
      scrtabs: {
        tabs: tabs,
        propNames: propNames,
        ignoreTabPanes: ignoreTabPanes,
        hasTabContent: hasTabContent,
        tabsLiContent: settings.tabsLiContent,
        tabsPostProcessors: settings.tabsPostProcessors,
        scroller: $scroller
      }
    });
  
    // once the nav-tabs are wrapped in the scroller, attach each tab's
    // data to it for reference later; we need to wait till they're
    // wrapped in the scroller because we wrap a *clone* of the nav-tabs
    // we built above, not the original nav-tabs
    $scroller.find('.nav-tabs > li').each(function (index) {
      tabUtils.storeDataOnLiEl($(this), tabs, index);
    });
  
    return $targetElInstance;
  }
  
  
  function wrapNavTabsInstanceInScroller($navTabsInstance, settings, readyCallback, attachTabContentToDomCallback) {
    var $scroller = tabElements.getNewElScrollerElementWrappingNavTabsInstance($navTabsInstance.clone(true), settings), // use clone because we replaceWith later
        scrollingTabsControl = new ScrollingTabsControl($scroller),
        navTabsInstanceData = $navTabsInstance.data('scrtabs');
  
    if (!navTabsInstanceData) {
      $navTabsInstance.data('scrtabs', {
        scroller: $scroller
      });
    } else {
      navTabsInstanceData.scroller = $scroller;
    }
  
    $navTabsInstance.replaceWith($scroller.css('visibility', 'hidden'));
  
    if (settings.tabClickHandler && (typeof settings.tabClickHandler === 'function')) {
      $scroller.hasTabClickHandler = true;
      scrollingTabsControl.tabClickHandler = settings.tabClickHandler;
    }
  
    $scroller.initTabs = function () {
      scrollingTabsControl.initTabs(settings,
                                    $scroller,
                                    readyCallback,
                                    attachTabContentToDomCallback);
    };
  
    $scroller.scrollToActiveTab = function() {
      scrollingTabsControl.scrollToActiveTab(settings);
    };
  
    $scroller.initTabs();
  
    listenForDropdownMenuTabs($scroller, scrollingTabsControl);
  
    return $scroller;
  }
  
  /* exported listenForDropdownMenuTabs,
              refreshTargetElementInstance,
              scrollToActiveTab */
  function checkForTabAdded(refreshData) {
    var updatedTabsArray = refreshData.updatedTabsArray,
        updatedTabsLiContent = refreshData.updatedTabsLiContent || [],
        updatedTabsPostProcessors = refreshData.updatedTabsPostProcessors || [],
        propNames = refreshData.propNames,
        ignoreTabPanes = refreshData.ignoreTabPanes,
        options = refreshData.options,
        $currTabLis = refreshData.$currTabLis,
        $navTabs = refreshData.$navTabs,
        $currTabContentPanesContainer = ignoreTabPanes ? null : refreshData.$currTabContentPanesContainer,
        $currTabContentPanes = ignoreTabPanes ? null : refreshData.$currTabContentPanes,
        isInitTabsRequired = false;
  
    // make sure each tab in the updated tabs array has a corresponding DOM element
    updatedTabsArray.forEach(function (tab, idx) {
      var $li = $currTabLis.find('a[href="#' + tab[propNames.paneId] + '"]'),
          isTabIdxPastCurrTabs = (idx >= $currTabLis.length),
          $pane;
  
      if (!$li.length) { // new tab
        isInitTabsRequired = true;
  
        // add the tab, add its pane (if necessary), and refresh the scroller
        options.tabLiContent = updatedTabsLiContent[idx];
        options.tabPostProcessor = updatedTabsPostProcessors[idx];
        $li = tabElements.getNewElTabLi(tab, propNames, options);
        tabUtils.storeDataOnLiEl($li, updatedTabsArray, idx);
  
        if (isTabIdxPastCurrTabs) { // append to end of current tabs
          $li.appendTo($navTabs);
        } else {                        // insert in middle of current tabs
          $li.insertBefore($currTabLis.eq(idx));
        }
  
        if (!ignoreTabPanes && tab[propNames.content] !== undefined) {
          $pane = tabElements.getNewElTabPane(tab, propNames, options);
          if (isTabIdxPastCurrTabs) { // append to end of current tabs
            $pane.appendTo($currTabContentPanesContainer);
          } else {                        // insert in middle of current tabs
            $pane.insertBefore($currTabContentPanes.eq(idx));
          }
        }
  
      }
  
    });
  
    return isInitTabsRequired;
  }
  
  function checkForTabPropertiesUpdated(refreshData) {
    var tabLiData = refreshData.tabLi,
        ignoreTabPanes = refreshData.ignoreTabPanes,
        $li = tabLiData.$li,
        $contentPane = tabLiData.$contentPane,
        origTabData = tabLiData.origTabData,
        newTabData = tabLiData.newTabData,
        propNames = refreshData.propNames,
        isInitTabsRequired = false;
  
    // update tab title if necessary
    if (origTabData[propNames.title] !== newTabData[propNames.title]) {
      $li.find('a[role="tab"]')
          .html(origTabData[propNames.title] = newTabData[propNames.title]);
  
      isInitTabsRequired = true;
    }
  
    // update tab disabled state if necessary
    if (origTabData[propNames.disabled] !== newTabData[propNames.disabled]) {
      if (newTabData[propNames.disabled]) { // enabled -> disabled
        $li.addClass('disabled');
        $li.find('a[role="tab"]').attr('data-toggle', '');
      } else { // disabled -> enabled
        $li.removeClass('disabled');
        $li.find('a[role="tab"]').attr('data-toggle', 'tab');
      }
  
      origTabData[propNames.disabled] = newTabData[propNames.disabled];
      isInitTabsRequired = true;
    }
  
    // update tab active state if necessary
    if (refreshData.options.forceActiveTab) {
      // set the active tab based on the tabs array regardless of the current
      // DOM state, which could have been changed by the user clicking a tab
      // without those changes being reflected back to the tab data
      $li[newTabData[propNames.active] ? 'addClass' : 'removeClass']('active');
  
      $contentPane[newTabData[propNames.active] ? 'addClass' : 'removeClass']('active');
  
      origTabData[propNames.active] = newTabData[propNames.active];
  
      isInitTabsRequired = true;
    }
  
    // update tab content pane if necessary
    if (!ignoreTabPanes && origTabData[propNames.content] !== newTabData[propNames.content]) {
      $contentPane.html(origTabData[propNames.content] = newTabData[propNames.content]);
      isInitTabsRequired = true;
    }
  
    return isInitTabsRequired;
  }
  
  function checkForTabRemoved(refreshData) {
    var tabLiData = refreshData.tabLi,
        ignoreTabPanes = refreshData.ignoreTabPanes,
        $li = tabLiData.$li,
        idxToMakeActive;
  
    if (tabLiData.newIdx !== -1) { // tab was not removed--it has a valid index
      return false;
    }
  
    // if this was the active tab, make the closest enabled tab active
    if ($li.hasClass('active')) {
  
      idxToMakeActive = tabUtils.getIndexOfClosestEnabledTab(refreshData.$currTabLis, tabLiData.currDomIdx);
      if (idxToMakeActive > -1) {
        refreshData.$currTabLis
          .eq(idxToMakeActive)
          .addClass('active');
  
        if (!ignoreTabPanes) {
          refreshData.$currTabContentPanes
            .eq(idxToMakeActive)
            .addClass('active');
        }
      }
    }
  
    $li.remove();
  
    if (!ignoreTabPanes) {
      tabLiData.$contentPane.remove();
    }
  
    return true;
  }
  
  function checkForTabsOrderChanged(refreshData) {
    var $currTabLis = refreshData.$currTabLis,
        updatedTabsArray = refreshData.updatedTabsArray,
        propNames = refreshData.propNames,
        ignoreTabPanes = refreshData.ignoreTabPanes,
        newTabsCollection = [],
        newTabPanesCollection = ignoreTabPanes ? null : [];
  
    if (!tabUtils.didTabOrderChange($currTabLis, updatedTabsArray, propNames)) {
      return false;
    }
  
    // the tab order changed...
    updatedTabsArray.forEach(function (t) {
      var paneId = t[propNames.paneId];
  
      newTabsCollection.push(
          $currTabLis
            .find('a[role="tab"][href="#' + paneId + '"]')
            .parent('li')
          );
  
      if (!ignoreTabPanes) {
        newTabPanesCollection.push($('#' + paneId));
      }
    });
  
    refreshData.$navTabs.append(newTabsCollection);
  
    if (!ignoreTabPanes) {
      refreshData.$currTabContentPanesContainer.append(newTabPanesCollection);
    }
  
    return true;
  }
  
  function checkForTabsRemovedOrUpdated(refreshData) {
    var $currTabLis = refreshData.$currTabLis,
        updatedTabsArray = refreshData.updatedTabsArray,
        propNames = refreshData.propNames,
        isInitTabsRequired = false;
  
  
    $currTabLis.each(function (currDomIdx) {
      var $li = $(this),
          origTabData = $li.data('tab'),
          newIdx = tabUtils.getTabIndexByPaneId(updatedTabsArray, propNames.paneId, origTabData[propNames.paneId]),
          newTabData = (newIdx > -1) ? updatedTabsArray[newIdx] : null;
  
      refreshData.tabLi = {
        $li: $li,
        currDomIdx: currDomIdx,
        newIdx: newIdx,
        $contentPane: tabElements.getElTabPaneForLi($li),
        origTabData: origTabData,
        newTabData: newTabData
      };
  
      if (checkForTabRemoved(refreshData)) {
        isInitTabsRequired = true;
        return; // continue to next $li in .each() since we removed this tab
      }
  
      if (checkForTabPropertiesUpdated(refreshData)) {
        isInitTabsRequired = true;
      }
    });
  
    return isInitTabsRequired;
  }
  
  function listenForDropdownMenuTabs($scroller, stc) {
    var $ddMenu;
  
    // for dropdown menus to show, we need to move them out of the
    // scroller and append them to the body
    $scroller
      .on(CONSTANTS.EVENTS.DROPDOWN_MENU_SHOW, handleDropdownShow)
      .on(CONSTANTS.EVENTS.DROPDOWN_MENU_HIDE, handleDropdownHide);
  
    function handleDropdownHide(e) {
      // move the dropdown menu back into its tab
      $(e.target).append($ddMenu.off(CONSTANTS.EVENTS.CLICK));
    }
  
    function handleDropdownShow(e) {
      var $ddParentTabLi = $(e.target),
          ddLiOffset = $ddParentTabLi.offset(),
          $currActiveTab = $scroller.find('li[role="presentation"].active'),
          ddMenuRightX,
          tabsContainerMaxX,
          ddMenuTargetLeft;
  
      $ddMenu = $ddParentTabLi
                  .find('.dropdown-menu')
                  .attr('data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED, true);
  
      // if the dropdown's parent tab li isn't already active,
      // we need to deactivate any active menu item in the dropdown
      if ($currActiveTab[0] !== $ddParentTabLi[0]) {
        $ddMenu.find('li.active').removeClass('active');
      }
  
      // we need to do our own click handling because the built-in
      // bootstrap handlers won't work since we moved the dropdown
      // menu outside the tabs container
      $ddMenu.on(CONSTANTS.EVENTS.CLICK, 'a[role="tab"]', handleClickOnDropdownMenuItem);
  
      $('body').append($ddMenu);
  
      // make sure the menu doesn't go off the right side of the page
      ddMenuRightX = $ddMenu.width() + ddLiOffset.left;
      tabsContainerMaxX = $scroller.width() - (stc.$slideRightArrow.outerWidth() + 1);
      ddMenuTargetLeft = ddLiOffset.left;
  
      if (ddMenuRightX > tabsContainerMaxX) {
        ddMenuTargetLeft -= (ddMenuRightX - tabsContainerMaxX);
      }
  
      $ddMenu.css({
        'display': 'block',
        'top': ddLiOffset.top + $ddParentTabLi.outerHeight() - 2,
        'left': ddMenuTargetLeft
      });
  
      function handleClickOnDropdownMenuItem() {
        /* jshint validthis: true */
        var $selectedMenuItemAnc = $(this),
            $selectedMenuItemLi = $selectedMenuItemAnc.parent('li'),
            $selectedMenuItemDropdownMenu = $selectedMenuItemLi.parent('.dropdown-menu'),
            targetPaneId = $selectedMenuItemAnc.attr('href');
  
        if ($selectedMenuItemLi.hasClass('active')) {
          return;
        }
  
        // once we select a menu item from the dropdown, deactivate
        // the current tab (unless it's our parent tab), deactivate
        // any active dropdown menu item, make our parent tab active
        // (if it's not already), and activate the selected menu item
        $scroller
          .find('li.active')
          .not($ddParentTabLi)
          .add($selectedMenuItemDropdownMenu.find('li.active'))
          .removeClass('active');
  
        $ddParentTabLi
          .add($selectedMenuItemLi)
          .addClass('active');
  
        // manually deactivate current active pane and activate our pane
        $('.tab-content .tab-pane.active').removeClass('active');
        $(targetPaneId).addClass('active');
      }
  
    }
  }
  
  function refreshDataDrivenTabs($container, options) {
    var instanceData = $container.data().scrtabs,
        scroller = instanceData.scroller,
        $navTabs = $container.find('.scrtabs-tab-container .nav-tabs'),
        $currTabContentPanesContainer = $container.find('.tab-content'),
        isInitTabsRequired = false,
        refreshData = {
          options: options,
          updatedTabsArray: instanceData.tabs,
          updatedTabsLiContent: instanceData.tabsLiContent,
          updatedTabsPostProcessors: instanceData.tabsPostProcessors,
          propNames: instanceData.propNames,
          ignoreTabPanes: instanceData.ignoreTabPanes,
          $navTabs: $navTabs,
          $currTabLis: $navTabs.find('> li'),
          $currTabContentPanesContainer: $currTabContentPanesContainer,
          $currTabContentPanes: $currTabContentPanesContainer.find('.tab-pane')
        };
  
    // to preserve the tab positions if we're just adding or removing
    // a tab, don't completely rebuild the tab structure, but check
    // for differences between the new tabs array and the old
    if (checkForTabAdded(refreshData)) {
      isInitTabsRequired = true;
    }
  
    if (checkForTabsOrderChanged(refreshData)) {
      isInitTabsRequired = true;
    }
  
    if (checkForTabsRemovedOrUpdated(refreshData)) {
      isInitTabsRequired = true;
    }
  
    if (isInitTabsRequired) {
      scroller.initTabs();
    }
  
    return isInitTabsRequired;
  }
  
  function refreshTargetElementInstance($container, options) {
    if (!$container.data('scrtabs')) { // target element doesn't have plugin on it
      return;
    }
  
    // force a refresh if the tabs are static html or they're data-driven
    // but the data didn't change so we didn't call initTabs()
    if ($container.data('scrtabs').isWrapperOnly || !refreshDataDrivenTabs($container, options)) {
      $('body').trigger(CONSTANTS.EVENTS.FORCE_REFRESH);
    }
  }
  
  function scrollToActiveTab() {
    /* jshint validthis: true */
    var $targetElInstance = $(this),
        scrtabsData = $targetElInstance.data('scrtabs');
  
    if (!scrtabsData) {
      return;
    }
  
    scrtabsData.scroller.scrollToActiveTab();
  }
  
  var methods = {
    destroy: function() {
      var $targetEls = this;
  
      return $targetEls.each(destroyPlugin);
    },
  
    init: function(options) {
      var $targetEls = this,
          targetElsLastIndex = $targetEls.length - 1,
          settings = $.extend({}, $.fn.scrollingTabs.defaults, options || {});
  
      // ---- tabs NOT data-driven -------------------------
      if (!settings.tabs) {
  
        // just wrap the selected .nav-tabs element(s) in the scroller
        return $targetEls.each(function(index) {
          var dataObj = {
                isWrapperOnly: true
              },
              $targetEl = $(this).data({ scrtabs: dataObj }),
              readyCallback = (index < targetElsLastIndex) ? null : function() {
                $targetEls.trigger(CONSTANTS.EVENTS.TABS_READY);
              };
  
          wrapNavTabsInstanceInScroller($targetEl, settings, readyCallback);
        });
  
      }
  
      // ---- tabs data-driven -------------------------
      return $targetEls.each(function (index) {
        var $targetEl = $(this),
            readyCallback = (index < targetElsLastIndex) ? null : function() {
              $targetEls.trigger(CONSTANTS.EVENTS.TABS_READY);
            };
  
        buildNavTabsAndTabContentForTargetElementInstance($targetEl, settings, readyCallback);
      });
    },
  
    refresh: function(options) {
      var $targetEls = this,
          settings = $.extend({}, $.fn.scrollingTabs.defaults, options || {});
  
      return $targetEls.each(function () {
        refreshTargetElementInstance($(this), settings);
      });
    },
  
    scrollToActiveTab: function() {
      return this.each(scrollToActiveTab);
    }
  };
  
  function destroyPlugin() {
    /* jshint validthis: true */
    var $targetElInstance = $(this),
        scrtabsData = $targetElInstance.data('scrtabs'),
        $tabsContainer;
  
    if (!scrtabsData) {
      return;
    }
  
    if (scrtabsData.enableSwipingElement === 'self') {
      $targetElInstance.removeClass(CONSTANTS.CSS_CLASSES.ALLOW_SCROLLBAR);
    } else if (scrtabsData.enableSwipingElement === 'parent') {
      $targetElInstance.closest('.scrtabs-tab-container').parent().removeClass(CONSTANTS.CSS_CLASSES.ALLOW_SCROLLBAR);
    }
  
    scrtabsData.scroller
      .off(CONSTANTS.EVENTS.DROPDOWN_MENU_SHOW)
      .off(CONSTANTS.EVENTS.DROPDOWN_MENU_HIDE);
  
    // if there were any dropdown menus opened, remove the css we added to
    // them so they would display correctly
    scrtabsData.scroller
      .find('[data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED + ']')
      .css({
        display: '',
        left: '',
        top: ''
      })
      .off(CONSTANTS.EVENTS.CLICK)
      .removeAttr('data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED);
  
    if (scrtabsData.scroller.hasTabClickHandler) {
      $targetElInstance
        .find('a[data-toggle="tab"]')
        .off('.scrtabs');
    }
  
    if (scrtabsData.isWrapperOnly) { // we just wrapped nav-tabs markup, so restore it
      // $targetElInstance is the ul.nav-tabs
      $tabsContainer = $targetElInstance.parents('.scrtabs-tab-container');
  
      if ($tabsContainer.length) {
        $tabsContainer.replaceWith($targetElInstance);
      }
  
    } else { // we generated the tabs from data so destroy everything we created
      if (scrtabsData.scroller && scrtabsData.scroller.initTabs) {
        scrtabsData.scroller.initTabs = null;
      }
  
      // $targetElInstance is the container for the ul.nav-tabs we generated
      $targetElInstance
        .find('.scrtabs-tab-container')
        .add('.tab-content')
        .remove();
    }
  
    $targetElInstance.removeData('scrtabs');
  
    while(--$.fn.scrollingTabs.nextInstanceId >= 0) {
      $(window).off(CONSTANTS.EVENTS.WINDOW_RESIZE + $.fn.scrollingTabs.nextInstanceId);
    }
  
    $('body').off(CONSTANTS.EVENTS.FORCE_REFRESH);
  }
  
  
  $.fn.scrollingTabs = function(methodOrOptions) {
  
    if (methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (!methodOrOptions || (typeof methodOrOptions === 'object')) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + methodOrOptions + ' does not exist on $.scrollingTabs.');
    }
  };
  
  $.fn.scrollingTabs.nextInstanceId = 0;
  
  $.fn.scrollingTabs.defaults = {
    tabs: null,
    propPaneId: 'paneId',
    propTitle: 'title',
    propActive: 'active',
    propDisabled: 'disabled',
    propContent: 'content',
    ignoreTabPanes: false,
    scrollToTabEdge: false,
    disableScrollArrowsOnFullyScrolled: false,
    forceActiveTab: false,
    reverseScroll: false,
    widthMultiplier: 1,
    tabClickHandler: null,
    //cssClassLeftArrow: 'fa fa-arrow-left',
    //cssClassRightArrow: 'fa fa-arrow-right',
    leftArrowContent: '',
    rightArrowContent: '',
    tabsLiContent: null,
    tabsPostProcessors: null,
    enableSwiping: false,
    enableRtlSupport: false,
    bootstrapVersion: 3
  };
  


}(jQuery, window));

$(document).ready(function () {
	"use strict";
	/*------------- Scrolling Tab Industry Solution ---------------*/
	if ($(".nav-tabs").length) {
		$('.nav-tabs').scrollingTabs({
				enableSwiping: true,
				scrollToTabEdge: true,
				disableScrollArrowsOnFullyScrolled: true
			})
			.on('ready.scrtabs', function () {
				$('.tab-content').show();
			});
	}
});

$(document).ready(function () {

	"use strict";
	
	/* ------------- Pentagon animation Start ---------------*/
	if ($("#pentagon").length) {
		var pentagon = anime.timeline({});
		pentagon.add({
			targets: '#digital-journey-pentagone',
			complete: function (anim) {
				$("#digital-journey-pentagone").removeClass("wow zoomIn animated");
				$("#digital-journey-pentagone").addClass("wow zoomIn animated");
				document.querySelector('#digital-journey-pentagone').setAttribute("fill", "#061838");
			}
		}).add({
			targets: '#outer-line-pentagone path, #pentagon path',
			strokeDashoffset: [anime.setDashoffset, 0],
			easing: 'easeInOutSine',
			duration: 1500,
			autoplay: false,
			delay: 1000,
			direction: 'normal',
			complete: function (anim) {

				$("text").fadeIn();

				$("#pentagone-firstidbg").removeClass("wow fadeInDown animated").addClass("wow fadeInDown animated");
				$("#pentagone-secondidbg").removeClass("wow fadeInLeft animated").addClass("wow animated fadeInLeft");
				$("#pentagone-thirdidbg, #pentagone-fourthidbg").removeClass("wow fadeInUp animated").addClass("wow fadeInUp animated");
				$("#pentagone-fifthidbg").removeClass("wow fadeInRight animated").addClass("wow fadeInRight animated");


				document.querySelector('#pentagone-firstidbg').setAttribute("fill", "#1E88E5");
				document.querySelector('#pentagone-secondidbg').setAttribute("fill", "#90CAF9");
				document.querySelector('#pentagone-thirdidbg').setAttribute("fill", "#64B5F6");
				document.querySelector('#pentagone-fourthidbg').setAttribute("fill", "#42A5F5");
				document.querySelector('#pentagone-fifthidbg').setAttribute("fill", "#2196F3");

				$('#outer-line-pentagone').fadeOut(2000);
				$("#pentagone-firstid, #pentagone-secondid, #pentagone-thirdid, #pentagone-fourthid, #pentagone-fifthid").fadeOut(2500);
			}

		});
	}
	/* ------------- Pentagon animation End ---------------*/
	
	/* ------------- Pentagon Restart Animation Start ---------------*/
	/* if ($("#overview").length) {
		var waypoint3 = new Waypoint({
			element: document.getElementById('overview'),
			handler: function () {
				$("text").fadeOut();

				$('#outer-line-pentagone').fadeIn();
				$("#pentagone-firstid, #pentagone-secondid, #pentagone-thirdid, #pentagone-fourthid, #pentagone-fifthid").fadeIn();

				$("#digital-journey-pentagone, #pentagone-firstidbg, #pentagone-secondidbg, #pentagone-thirdidbg, #pentagone-fourthidbg, #pentagone-fifthidbg").attr('fill', 'none');
				$("#digital-journey-pentagone, #pentagone-firstidbg, #pentagone-secondidbg, #pentagone-thirdidbg, #pentagone-fourthidbg, #pentagone-fifthidbg").removeClass("wow zoomIn fadeInLeft animated fadeInDown fadeInUp fadeInRight");
				pentagon.restart();
			},
			offset: 50
		});
	} */
	/* ------------- Pentagon Restart Animation End ---------------*/
	
	/* ------------- Petagon Popup Modal Start ---------------*/
	$('#petagon_modal').on('show.bs.modal', function (event) {
		var window_width = $(window).width();
		if (window_width > 767) {
			$('html, body').animate({
				scrollTop: $($('#overview')).offset().top
			}, 700);
		}

		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('petagon'); // Extract info from data-* attributes
		petagon_modal_jumpTo(recipient);
		$("#petagon_modal").removeClass("open-anim close-anim").addClass("open-anim");
	});

	$('#petagon_modal').on('shown.bs.modal', function (event) {
		$("body .modal-backdrop").css("opacity", "0");
	});

	$('#petagon_modal').on('hidden.bs.modal', function (event) {
		$("#petagon_modal").css("display", "block");
		$("#petagon_modal").removeClass("open-anim close-anim").addClass("close-anim");
	});

	function petagon_modal_jumpTo(recipient) {
		$('#petagon_modal_carousel').trigger('to.owl.carousel', recipient);
	}
	/* ------------- Petagon Popup Modal End ---------------*/
	
	/* ------------- Pentagone Slider Start ---------------*/
	var petagon_modal_length = $("#petagon_modal_carousel").find('.item').length;
	$("#petagon_modal_carousel").owlCarousel({
		touchDrag: petagon_modal_length > 1 ? true : false,
		mouseDrag: petagon_modal_length > 1 ? true : false,
		loop: petagon_modal_length > 1 ? false : false,
		//autoplay: petagon_modal_length > 1 ? 3000 : false,
		autoplay: false,
		autoplayHoverPause: petagon_modal_length > 1 ? true : true,
		responsive: {
			0: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			600: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			768: {
				items: 1,
				dots: petagon_modal_length > 1 ? false : false,
				dotsData: petagon_modal_length > 1 ? false : false,
				nav: petagon_modal_length > 1 ? true : false
			},
			1000: {
				items: 1,
				dots: petagon_modal_length > 1 ? true : false,
				dotsData: petagon_modal_length > 1 ? true : false,
				nav: petagon_modal_length > 1 ? false : false
			}
		}
	});
	/* ------------- Pentagone Slider End ---------------*/
	
});




"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};!function(t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"===("undefined"==typeof module?"undefined":_typeof(module))&&module.exports?module.exports=function(i,s){return void 0===s&&(s="undefined"!=typeof window?require("jquery"):require("jquery")(i)),t(s),s}:t(jQuery)}(function(t){return t.fn.tilt=function(i){var s=function(){this.ticking||(requestAnimationFrame(g.bind(this)),this.ticking=!0)},e=function(){var i=this;t(this).on("mousemove",o),t(this).on("mouseenter",a),this.settings.reset&&t(this).on("mouseleave",h),this.settings.glare&&t(window).on("resize",u.bind(i))},n=function(){var i=this;void 0!==this.timeout&&clearTimeout(this.timeout),t(this).css({transition:this.settings.speed+"ms "+this.settings.easing}),this.settings.glare&&this.glareElement.css({transition:"opacity "+this.settings.speed+"ms "+this.settings.easing}),this.timeout=setTimeout(function(){t(i).css({transition:""}),i.settings.glare&&i.glareElement.css({transition:""})},this.settings.speed)},a=function(i){this.ticking=!1,t(this).css({"will-change":"transform"}),n.call(this),t(this).trigger("tilt.mouseEnter")},r=function(i){return"undefined"==typeof i&&(i={pageX:t(this).offset().left+t(this).outerWidth()/2,pageY:t(this).offset().top+t(this).outerHeight()/2}),{x:i.pageX,y:i.pageY}},o=function(t){this.mousePositions=r(t),s.call(this)},h=function(){n.call(this),this.reset=!0,s.call(this),t(this).trigger("tilt.mouseLeave")},l=function(){var i=t(this).outerWidth(),s=t(this).outerHeight(),e=t(this).offset().left,n=t(this).offset().top,a=(this.mousePositions.x-e)/i,r=(this.mousePositions.y-n)/s,o=(this.settings.maxTilt/2-a*this.settings.maxTilt).toFixed(2),h=(r*this.settings.maxTilt-this.settings.maxTilt/2).toFixed(2),l=Math.atan2(this.mousePositions.x-(e+i/2),-(this.mousePositions.y-(n+s/2)))*(180/Math.PI);return{tiltX:o,tiltY:h,percentageX:100*a,percentageY:100*r,angle:l}},g=function(){return this.transforms=l.call(this),this.reset?(this.reset=!1,t(this).css("transform","perspective("+this.settings.perspective+"px) rotateX(0deg) rotateY(0deg)"),void(this.settings.glare&&(this.glareElement.css("transform","rotate(180deg) translate(-50%, -50%)"),this.glareElement.css("opacity","0")))):(t(this).css("transform","perspective("+this.settings.perspective+"px) rotateX("+("x"===this.settings.axis?0:this.transforms.tiltY)+"deg) rotateY("+("y"===this.settings.axis?0:this.transforms.tiltX)+"deg) scale3d("+this.settings.scale+","+this.settings.scale+","+this.settings.scale+")"),this.settings.glare&&(this.glareElement.css("transform","rotate("+this.transforms.angle+"deg) translate(-50%, -50%)"),this.glareElement.css("opacity",""+this.transforms.percentageY*this.settings.maxGlare/100)),t(this).trigger("change",[this.transforms]),void(this.ticking=!1))},c=function(){var i=this.settings.glarePrerender;if(i||t(this).append('<div class="js-tilt-glare"><div class="js-tilt-glare-inner"></div></div>'),this.glareElementWrapper=t(this).find(".js-tilt-glare"),this.glareElement=t(this).find(".js-tilt-glare-inner"),!i){var s={position:"absolute",top:"0",left:"0",width:"100%",height:"100%"};this.glareElementWrapper.css(s).css({overflow:"hidden"}),this.glareElement.css({position:"absolute",top:"50%",left:"50%","pointer-events":"none","background-image":"linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",width:""+2*t(this).outerWidth(),height:""+2*t(this).outerWidth(),transform:"rotate(180deg) translate(-50%, -50%)","transform-origin":"0% 0%",opacity:"0"})}},u=function(){this.glareElement.css({width:""+2*t(this).outerWidth(),height:""+2*t(this).outerWidth()})};return t.fn.tilt.destroy=function(){t(this).each(function(){t(this).find(".js-tilt-glare").remove(),t(this).css({"will-change":"",transform:""}),t(this).off("mousemove mouseenter mouseleave")})},t.fn.tilt.getValues=function(){var i=[];return t(this).each(function(){this.mousePositions=r.call(this),i.push(l.call(this))}),i},t.fn.tilt.reset=function(){t(this).each(function(){var i=this;this.mousePositions=r.call(this),this.settings=t(this).data("settings"),h.call(this),setTimeout(function(){i.reset=!1},this.settings.transition)})},this.each(function(){var s=this;this.settings=t.extend({maxTilt:t(this).is("[data-tilt-max]")?t(this).data("tilt-max"):20,perspective:t(this).is("[data-tilt-perspective]")?t(this).data("tilt-perspective"):300,easing:t(this).is("[data-tilt-easing]")?t(this).data("tilt-easing"):"cubic-bezier(.03,.98,.52,.99)",scale:t(this).is("[data-tilt-scale]")?t(this).data("tilt-scale"):"1",speed:t(this).is("[data-tilt-speed]")?t(this).data("tilt-speed"):"400",transition:!t(this).is("[data-tilt-transition]")||t(this).data("tilt-transition"),axis:t(this).is("[data-tilt-axis]")?t(this).data("tilt-axis"):null,reset:!t(this).is("[data-tilt-reset]")||t(this).data("tilt-reset"),glare:!!t(this).is("[data-tilt-glare]")&&t(this).data("tilt-glare"),maxGlare:t(this).is("[data-tilt-maxglare]")?t(this).data("tilt-maxglare"):1},i),this.init=function(){t(s).data("settings",s.settings),s.settings.glare&&c.call(s),e.call(s)},this.init()})},t("[data-tilt]").tilt(),!0});
$(document).on("change", "#select-region", function () {
	var scrollTop = 68;
	if (this.value !== "") {
		var offsetValue = document.getElementById(this.value).offsetTop;
		$('html, body').animate({
			scrollTop: offsetValue - scrollTop
		}, 500);
	}
});
/*

insights.js

"use strict";  
  
use(["/libs/sightly/js/3rd-party/q.js"], function (Q) {  
    var childProperties = Q.defer();  
    granite.resource.resolve(granite.resource.path + "/" + this.multifieldName).then(function (currentResource) {  
        currentResource.getChildren().then(function(child) {  
        childProperties.resolve(child);  
    });  
});  
    return childProperties.promise;  
}); */
$(document).ready(function () {
	"use strict";
	
	var slider_length = $("#slider_list_carousel").find('.item').length;
	//alert(slider_length);		
	$("#slider_list_carousel").owlCarousel({
		margin: 15,
		responsiveClass: true,
		responsive: {
			0: {
				items: 1,
				dots: slider_length > 1 ? true : false,
				nav: slider_length > 1 ? true : false,
				touchDrag: slider_length > 1 ? true : false,
				mouseDrag: slider_length > 1 ? true : false,
				loop: slider_length > 1 ? true : false
			},
			600: {
				items: 2,
				dots: slider_length > 1 ? true : false,
				nav: slider_length > 1 ? true : false,
				touchDrag: slider_length > 1 ? true : false,
				mouseDrag: slider_length > 1 ? true : false,
				loop: slider_length > 1 ? true : false
			},
			768: {
				items: 3,
				dots: slider_length > 3 ? true : false,
				nav: slider_length > 3 ? true : false,
				touchDrag: slider_length > 3 ? true : false,
				mouseDrag: slider_length > 3 ? true : false,
				loop: slider_length > 3 ? true : false
			},
			1025: {
				items: 4,
				dots: slider_length > 4 ? false : false,
				nav: slider_length > 4 ? true : false,
				touchDrag: slider_length > 4 ? true : false,
				mouseDrag: slider_length > 4 ? true : false,
				loop: slider_length > 4 ? true : false
			}
		}
	});
});



$(document).on('click', '.go_to', function () {
	$('html, body').animate({
		scrollTop: $(".tab-content").offset().top - 100
	}, 600);
});


$(document).ready(function(){
     $('.go_to:first-child').addClass('active');
    $('.tab-pane:first-child').addClass('active');


	$('.go_to').click( function(){



	if( $(this).hasClass('active') ){
		$('.go_to').removeClass('active');
		$(this).addClass('active');
	}
	else{
		$('.go_to').removeClass('active');
		$(this).addClass('active');
	}


	$('.tab-pane').removeClass('active')
	var currentAttr =  $(this).find('a').attr('href');
	var abs = currentAttr.substr('1')

	$('#'+abs).addClass('active');

	
});

  });






$(document).on('click', '.expand', function () {
    var expand = $(this).data('id');
    $(expand).fadeIn();
});

$(document).on('click', '.closeWrpr1', function () {
    $(this).parent().fadeOut();
});
	$(document).on('click', '.expand', function () {
		var expand = $(this).data('id');
		$(expand).fadeIn();
	});
	
	$(document).on('click', '.closeWrpr1', function () {
		$(this).parent().fadeOut();
	});
$(document).ready(function(){
  $("div #my-id-0").hover(function(){
    $(this).find('.dropdown-menu').css("display", "block");
    }, function(){
    $(this).find('.dropdown-menu').css("display", "none");    
  });
});
/*---------------------------Java Scritp for Roration icon zoomOut and zoomIn-----------------------------------*/
/*
$(function() {

    function toggleChevron(e) {
        $(e.target)
                .prev('.panel-heading')
                .find("i")
                .toggleClass('rotate-icon');        

        $('.panel-body.animated').toggleClass('zoomIn zoomOut');        
    }

    $('#accordion').on('hide.bs.collapse', toggleChevron);
    $('#accordion').on('show.bs.collapse', toggleChevron);
})*/

$(document).ready(function() {
     $("#accordion .panel-heading a:first").trigger("click");
});


$('#accordion .panel-custom').on('hide.bs.collapse', function () {
    $(this).find("i").toggleClass('rotate-icon');
	$('.panel-body.animated').toggleClass('zoomIn zoomOut');
});

$('#accordion .panel-custom').on('show.bs.collapse', function () {
    $(this).find("i").toggleClass('rotate-icon');
	$('.panel-body.animated').toggleClass('zoomIn zoomOut');
});

$(document).ready(function () {
	
	/*Data Wow Delay Increasing*/
    var number = 0.3;
	$("#resource_center div.relative").attr('data-wow-delay', function(){
    var text = "";
    number += 0.3;
    text += number +"s";
    return text;
	});
	
    /* ------------- Success Stories Load More Part ---------------*/
    var initialItems = $("#initialitems").val();
    //alert(initialItems);
    var loadMoreItems = $("#showmoreitems").val();
    //alert(loadMoreItems);

    //var tempItems = $("#items-group div:first-child > div.item-list");//document.getElementById('items-group').firstElementChild;
	var tempItems = $(".stories-list div:first-child > div.item-list");
    tempItems.hide();
    //var child = tempItems.children();
    var itemsCount = tempItems.length;
	//alert(itemsCount);
    for(i=0;i<initialItems;i++)
    {
		tempItems.eq(i).show();
    }   

    var isLanding = $("#islanding").val();
    if(isLanding != null)
    {
       if(isLanding == 'on')
       {
          if(itemsCount<=initialItems)
    	  {		
        	$('.insight-btn').attr('style', 'display: none !important');
          }
		ToggleListGrid();
       }
    }

    /* ------------- Tag Part ---------------*/
	$(document).on('click', '.tag-icon', function () {
		$(this).closest(".relative").find(".tag-position").fadeIn();
	});
	$(document).on('click', '.tag-close', function () {
		$(this).closest(".relative").find(".tag-position").fadeOut();
	});




/* ------------- Success stories grif box animation ---------------*/

	$(window).scroll(function () {
		if ($("#success_stories").length) {
			if ($(window).scrollTop() > $("#success_stories").offset().top) {
				$("#success_stories .equal-heights > .relative").addClass("wow fadeInLeft ");
				$("#success_stories .equal-heights > .relative:nth-child(1)").attr("data-wow-delay", "0.3s");
				$("#success_stories .equal-heights > .relative:nth-child(2)").attr("data-wow-delay", "0.6s");
				$("#success_stories .equal-heights > .relative:nth-child(3)").attr("data-wow-delay", "0.9s");
				$("#success_stories .equal-heights > .relative:nth-child(4)").attr("data-wow-delay", "1.2s");
			}
		}
	});

    /* ------------- Equal Height Success stories Part ---------------*/
	setTagPositionHeight();


});





	$(window).resize(function () {
		setTagPositionHeight();
	});

	function setTagPositionHeight() {
		$('.equal-bg, .item-list').each(function () {
			$(this).find('.tag-postion').css('top', $(this).find('.get-image-height').height());
		});
	}


	$(document).on("click", ".clk-fliter-overlay", function () {
		//e.preventDefault();
		$("#overlay_fliter_topic").fadeIn(600);
		$('body').css('overflow-y', 'hidden');
	});
	$(document).on("click", ".close-icon", function () {
		//e.preventDefault();
		$("#overlay_fliter_topic").fadeOut(600);
		$('body').css('overflow-y', 'scroll');
	});


	/* -------------  Success stories Case studies Grid / List change  Part ---------------*/
	$(document).on("click", "#grid", function (e) {
		e.preventDefault();
		$('#items-group .item-list').removeClass('list-group-item col-md-12 col-sm-12 col-xs-12').addClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-12 col-sm-12 col-xs-12 p0').removeClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-12');
		$('.caption-txt').addClass('col-md-12 col-sm-12 col-xs-12 relative-off').removeClass('col-md-9 col-md-pull-3 col-sm-9 col-sm-pull-3 col-xs-12');
		//$('.p0-remove').removeClass('p0');		
		//$('.bg-white').addClass('col-eq-ht');
		//$('.title-box-yellow').addClass('minus-top');

		//$('.caption-txt').addClass('relative-off');		 
		//$('.lng-txt > .mb-xs-20').addClass('pt10');		
		$('.title-box-yellow').addClass('minus-top-grd').removeClass('minus-top-lst');
		$('.lng-txt').find('.title-box-yellow').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').addClass('pt10');
		//$('.tag-bg1').addClass('tag-bg').removeClass('relative1 tag-bg1');
		//$('.tag-bg').css('position','absolute');
		//$('.item-list').find('.pt0').removeClass('pt0').addClass('pt15');
		//$('.list-popup').css('top','inh');
		//$('.bg-icon').removeClass('bg-icon-lst');

		setTagPositionHeight();

		$('#grid').addClass('active');
		$('#list').removeClass('active');
		//$('.item-list').find('.pt15').removeClass('minus-top-grd');.addClass('pt0').removeClass('pt15');		
	});

	$(document).on("click", "#list", function (e) {
		e.preventDefault();
		$('#items-group .item-list').addClass('list-group-item col-md-12 col-sm-12 col-xs-12').removeClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-push-0').removeClass('col-md-12 col-sm-12 col-xs-12 p0');
		$('.caption-txt').addClass('col-md-9 col-sm-9 col-md-pull-3 col-sm-pull-3 col-xs-12 col-xs-pull-0').removeClass('col-md-12 col-sm-12 col-xs-12 relative-off');
		$('.bg-white .mb-xs-20').addClass('p0');
		$('.title-box-yellow').addClass('minus-top-lst').removeClass('minus-top-grd');
		//$('.tag-bg').css('position','relative');
		//$('.item-list').find('.pt15').removeClass('pt15').addClass('pt0');		
		$('#items-group').find('.lng-txt').removeClass('pt10');
		//$('.bg-icon').addClass('bg-icon-lst');
		//$('.item-list').find('.pt0').removeClass('pt0').addClass('pt15');
		//$('.pt0').addClass('pt15').removeClass('pt0');

		//$('.bg-white').removeClass('col-eq-ht');
		//$('.title-box-yellow').removeClass('minus-top');
		//$('.loc').addClass('col-md-12').removeClass('col-md-6');
		//$('.lng-txt > .mb-xs-20').removeClass('pt10');
		$('.pos-abs').css('top', '0px', 'position', 'absolute');

		$('#grid').removeClass('active');
		$('#list').addClass('active');
	});


function LoadMoreItems()
{
    var loadMoreItems = $("#showmoreitems").val();
    var tempItems = $("#items-group div:first-child > div.item-list:hidden");
    var hiddenItemCount = tempItems.length;
    //alert(hiddenItemCount);
	//alert(loadMoreItems);
    if(hiddenItemCount<=loadMoreItems)
    {
        for(i=0;i<hiddenItemCount;i++)
        {
            tempItems.eq(i).show();
        }
		$('.insight-btn').attr('style', 'display: none !important');//.addClass('toggle-more');
    }
    else if(hiddenItemCount>loadMoreItems)
    {
		for(i=0;i<loadMoreItems;i++)
        {
            tempItems.eq(i).show();
        }
    }
    return false;
}

function ToggleListGrid(){

    var isGrid = $("#isgrid").val();

    var isLanding = $("#islanding").val();

    //alert(isGrid);

    //alert(isLanding);

	if(isLanding != null && isLanding=="on")
     {
       if(isGrid=="true")
       {
		$('#items-group .item-list').removeClass('list-group-item col-md-12 col-sm-12 col-xs-12').addClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-12 col-sm-12 col-xs-12 p0').removeClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-12');
		$('.caption-txt').addClass('col-md-12 col-sm-12 col-xs-12 relative-off').removeClass('col-md-9 col-md-pull-3 col-sm-9 col-sm-pull-3 col-xs-12');
		$('.title-box-yellow').addClass('minus-top-grd').removeClass('minus-top-lst');
		$('.lng-txt').find('.title-box-yellow').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').addClass('pt10');
		
		setTagPositionHeight();		
       }
       else if(isGrid=="false")
       {
		$('#items-group .item-list').addClass('list-group-item col-md-12 col-sm-12 col-xs-12').removeClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-push-0').removeClass('col-md-12 col-sm-12 col-xs-12 p0');		
		$('.caption-txt').addClass('col-md-9 col-sm-9 col-md-pull-3 col-sm-pull-3 col-xs-12 col-xs-pull-0').removeClass('col-md-12 col-sm-12 col-xs-12 relative-off');
		$('.bg-white .mb-xs-20').addClass('p0');
		$('.title-box-yellow').addClass('minus-top-lst').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').removeClass('pt10');

           $('.pos-abs').css('top','0px','position','absolute');
       }	
     }


}

function setTagPositionHeight(){
			$('.equal-bg, .item-list').each(function(){
				$(this).find('.tag-postion').css('top',$(this).find('.get-image-height').height());
			});
		}


/**********************
	Social share success stories js
/**********************/
function twitterSuccessShare(url, title){

    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }
 $.getJSON(
             "https://api-ssl.bitly.com/v3/shorten?", {
                           "access_token": "c763fa6bf73dac4f25f6d87c52fc38cadbbeb5a2",
                            "longUrl": url
                },
                function (response) {

                          url = String(response.data.url);

                     	  var twitterUrl = 'https://twitter.com/intent/tweet?url='.concat(url)+'&text='+title;
                    	var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  var popUp = window.open(twitterUrl,'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();


                 }
  );
 return false;
}

function linkedinSuccessShare(url, title){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }

                     	var liUrl = 'http://www.linkedin.com/shareArticle?mini=true&url='.concat(url)+'&title='+title;
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(liUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}

function facebookSuccessShare(url, title){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }

                     	  var fbUrl = 'http://www.facebook.com/sharer/sharer.php?s=100&u='.concat(url)+'&t='+title;
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(fbUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}
$(document).ready(function () {

/* ------------- Country Selection Part ---------------*/
	$(document).on("click", ".select-country, .option-country > ul > li", function () {
		$(".option-country").toggleClass("open-country");
		if ($(".option-country").hasClass("open-country")) {
			$(".down-arrow").addClass("up-arrow").removeClass("down-arrow");
		} else {
			$(".up-arrow").addClass("down-arrow").removeClass("up-arrow");
		}
	});
	$(document).on('click', 'body', function (e) {
		if (!$(e.target).is('.select-country > a')) {
			$('.option-country.open-country').removeClass('open-country');
			$(".up-arrow").addClass("down-arrow").removeClass("up-arrow");
		}
	});
	});
var audioFile;
var timeStamp;
var uniqueId;
var fileNameWithExt;
var fileNameNoExt;


$(document).ready(function() {

     var countOfComponents = $('input[id^="audioFilePath"]').length; 
     var i; 

     for(i=0;i<countOfComponents;i++) {

 		audioFile = $('#audioFilePath').val();

         if(audioFile !== null && audioFile !== '') {
    

		fileNameWithExt = audioFile.split('/').pop();

		fileNameNoExt = fileNameWithExt.substring(0, fileNameWithExt.length - 4);

 	if(document.getElementById("Q2-earningscall-1819171013042213789")!==null){    //checking page containaudio component

        timeStamp = Math.round((new Date()).getTime() / 1000);    //This timestamp is for acheiving the uniqueID

    //document.getElementById("Q2-earningscall-1819171013042213789").id = audioFile + timeStamp;   //Format of id is concatenating the audio file name and timestamp ("Q2-earningscall-1819171013042213789")

        document.getElementById("Q2-earningscall-1819171013042213789").id = fileNameNoExt + timeStamp;
 	    uniqueId = fileNameNoExt + timeStamp;

        playAudioVideo(uniqueId,audioFile);
    }
         }


     	document.getElementById("audioFilePath").id = "audioFilePath"+i;


    }

   function playAudioVideo(uniqueFileId,filePath){

 if(uniqueFileId!=null)	//checking page containaudio component

     {

     //Adding code so that it to fetch both audio and video
 	var xhttp;
 	var xmlDoc;
	var x;
 	var mediaExt;
    var audioWidth;
    var audioHeight;

    xhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');


 	xhttp.onreadystatechange = function() {

	 	if (this.readyState == 4 && this.status == 200) {

	 	xmlDoc = xhttp.responseXML;

				if (/Edge/.test(navigator.userAgent) || screen.availWidth <= 768) {

                x = xmlDoc.getElementsByTagName("content");
				}

          		 else {

                x = xmlDoc.getElementsByTagName("media:content");

            	}

     	mediaExt = x[0].getAttribute('url');

        if(mediaExt.indexOf(".mp3") !== -1  || mediaExt.indexOf(".MP3") !== -1)
        {
            audioWidth = 312;
         vplayercAudio(filePath, audioWidth, uniqueFileId, 'false');
            
        }
        else
        {
           audioHeight = 302;
         vplayercall(filePath, audioHeight, uniqueFileId, 'false');

        }
            


     }

};	

     xhttp.open("GET", filePath, true);
	 xhttp.send();


    }

    }


});

if(typeof jwplayer=="undefined"){var jwplayer=function(a){if(jwplayer.api){return jwplayer.api.selectPlayer(a)}};var $jw=jwplayer;jwplayer.version="5.9.2156 (Licensed version)";jwplayer.vid=document.createElement("video");jwplayer.audio=document.createElement("audio");jwplayer.source=document.createElement("source");(function(b){b.utils=function(){};b.utils.typeOf=function(d){var c=typeof d;if(c==="object"){if(d){if(d instanceof Array){c="array"}}else{c="null"}}return c};b.utils.extend=function(){var c=b.utils.extend["arguments"];if(c.length>1){for(var e=1;e<c.length;e++){for(var d in c[e]){c[0][d]=c[e][d]}}return c[0]}return null};b.utils.clone=function(f){var c;var d=b.utils.clone["arguments"];if(d.length==1){switch(b.utils.typeOf(d[0])){case"object":c={};for(var e in d[0]){c[e]=b.utils.clone(d[0][e])}break;case"array":c=[];for(var e in d[0]){c[e]=b.utils.clone(d[0][e])}break;default:return d[0];break}}return c};b.utils.extension=function(c){if(!c){return""}c=c.substring(c.lastIndexOf("/")+1,c.length);c=c.split("?")[0];if(c.lastIndexOf(".")>-1){return c.substr(c.lastIndexOf(".")+1,c.length).toLowerCase()}return};b.utils.html=function(c,d){c.innerHTML=d};b.utils.wrap=function(c,d){if(c.parentNode){c.parentNode.replaceChild(d,c)}d.appendChild(c)};b.utils.ajax=function(g,f,c){var e;if(window.XMLHttpRequest){e=new XMLHttpRequest()}else{e=new ActiveXObject("Microsoft.XMLHTTP")}e.onreadystatechange=function(){if(e.readyState===4){if(e.status===200){if(f){if(!b.utils.exists(e.responseXML)){try{if(window.DOMParser){var h=(new DOMParser()).parseFromString(e.responseText,"text/xml");if(h){e=b.utils.extend({},e,{responseXML:h})}}else{h=new ActiveXObject("Microsoft.XMLDOM");h.async="false";h.loadXML(e.responseText);e=b.utils.extend({},e,{responseXML:h})}}catch(j){if(c){c(g)}}}f(e)}}else{if(c){c(g)}}}};try{e.open("GET",g,true);e.send(null)}catch(d){if(c){c(g)}}return e};b.utils.load=function(d,e,c){d.onreadystatechange=function(){if(d.readyState===4){if(d.status===200){if(e){e()}}else{if(c){c()}}}}};b.utils.find=function(d,c){return d.getElementsByTagName(c)};b.utils.append=function(c,d){c.appendChild(d)};b.utils.isIE=function(){return((!+"\v1")||(typeof window.ActiveXObject!="undefined"))};b.utils.userAgentMatch=function(d){var c=navigator.userAgent.toLowerCase();return(c.match(d)!==null)};b.utils.isIOS=function(){return b.utils.userAgentMatch(/iP(hone|ad|od)/i)};b.utils.isIPad=function(){return b.utils.userAgentMatch(/iPad/i)};b.utils.isIPod=function(){return b.utils.userAgentMatch(/iP(hone|od)/i)};b.utils.isAndroid=function(){return b.utils.userAgentMatch(/android/i)};b.utils.isLegacyAndroid=function(){return b.utils.userAgentMatch(/android 2.[012]/i)};b.utils.isBlackberry=function(){return b.utils.userAgentMatch(/blackberry/i)};b.utils.isMobile=function(){return b.utils.userAgentMatch(/(iP(hone|ad|od))|android/i)};b.utils.getFirstPlaylistItemFromConfig=function(c){var d={};var e;if(c.playlist&&c.playlist.length){e=c.playlist[0]}else{e=c}d.file=e.file;d.levels=e.levels;d.streamer=e.streamer;d.playlistfile=e.playlistfile;d.provider=e.provider;if(!d.provider){if(d.file&&(d.file.toLowerCase().indexOf("youtube.com")>-1||d.file.toLowerCase().indexOf("youtu.be")>-1)){d.provider="youtube"}if(d.streamer&&d.streamer.toLowerCase().indexOf("rtmp://")==0){d.provider="rtmp"}if(e.type){d.provider=e.type.toLowerCase()}}if(d.provider=="audio"){d.provider="sound"}return d};b.utils.getOuterHTML=function(c){if(c.outerHTML){return c.outerHTML}else{try{return new XMLSerializer().serializeToString(c)}catch(d){return""}}};b.utils.setOuterHTML=function(f,e){if(f.outerHTML){f.outerHTML=e}else{var g=document.createElement("div");g.innerHTML=e;var c=document.createRange();c.selectNodeContents(g);var d=c.extractContents();f.parentNode.insertBefore(d,f);f.parentNode.removeChild(f)}};b.utils.hasFlash=function(){if(typeof navigator.plugins!="undefined"&&typeof navigator.plugins["Shockwave Flash"]!="undefined"){return true}if(typeof window.ActiveXObject!="undefined"){try{new ActiveXObject("ShockwaveFlash.ShockwaveFlash");return true}catch(c){}}return false};b.utils.getPluginName=function(c){if(c.lastIndexOf("/")>=0){c=c.substring(c.lastIndexOf("/")+1,c.length)}if(c.lastIndexOf("-")>=0){c=c.substring(0,c.lastIndexOf("-"))}if(c.lastIndexOf(".swf")>=0){c=c.substring(0,c.lastIndexOf(".swf"))}if(c.lastIndexOf(".js")>=0){c=c.substring(0,c.lastIndexOf(".js"))}return c};b.utils.getPluginVersion=function(c){if(c.lastIndexOf("-")>=0){if(c.lastIndexOf(".js")>=0){return c.substring(c.lastIndexOf("-")+1,c.lastIndexOf(".js"))}else{if(c.lastIndexOf(".swf")>=0){return c.substring(c.lastIndexOf("-")+1,c.lastIndexOf(".swf"))}else{return c.substring(c.lastIndexOf("-")+1)}}}return""};b.utils.getAbsolutePath=function(j,h){if(!b.utils.exists(h)){h=document.location.href}if(!b.utils.exists(j)){return undefined}if(a(j)){return j}var k=h.substring(0,h.indexOf("://")+3);var g=h.substring(k.length,h.indexOf("/",k.length+1));var d;if(j.indexOf("/")===0){d=j.split("/")}else{var e=h.split("?")[0];e=e.substring(k.length+g.length+1,e.lastIndexOf("/"));d=e.split("/").concat(j.split("/"))}var c=[];for(var f=0;f<d.length;f++){if(!d[f]||!b.utils.exists(d[f])||d[f]=="."){continue}else{if(d[f]==".."){c.pop()}else{c.push(d[f])}}}return k+g+"/"+c.join("/")};function a(d){if(!b.utils.exists(d)){return}var e=d.indexOf("://");var c=d.indexOf("?");return(e>0&&(c<0||(c>e)))}b.utils.pluginPathType={ABSOLUTE:"ABSOLUTE",RELATIVE:"RELATIVE",CDN:"CDN"};b.utils.getPluginPathType=function(d){if(typeof d!="string"){return}d=d.split("?")[0];var e=d.indexOf("://");if(e>0){return b.utils.pluginPathType.ABSOLUTE}var c=d.indexOf("/");var f=b.utils.extension(d);if(e<0&&c<0&&(!f||!isNaN(f))){return b.utils.pluginPathType.CDN}return b.utils.pluginPathType.RELATIVE};b.utils.mapEmpty=function(c){for(var d in c){return false}return true};b.utils.mapLength=function(d){var c=0;for(var e in d){c++}return c};b.utils.log=function(d,c){if(typeof console!="undefined"&&typeof console.log!="undefined"){if(c){console.log(d,c)}else{console.log(d)}}};b.utils.css=function(d,g,c){if(b.utils.exists(d)){for(var e in g){try{if(typeof g[e]==="undefined"){continue}else{if(typeof g[e]=="number"&&!(e=="zIndex"||e=="opacity")){if(isNaN(g[e])){continue}if(e.match(/color/i)){g[e]="#"+b.utils.strings.pad(g[e].toString(16),6)}else{g[e]=Math.ceil(g[e])+"px"}}}d.style[e]=g[e]}catch(f){}}}};b.utils.isYouTube=function(c){return(c.indexOf("youtube.com")>-1||c.indexOf("youtu.be")>-1)};b.utils.transform=function(e,d,c,g,h){if(!b.utils.exists(d)){d=1}if(!b.utils.exists(c)){c=1}if(!b.utils.exists(g)){g=0}if(!b.utils.exists(h)){h=0}if(d==1&&c==1&&g==0&&h==0){e.style.webkitTransform="";e.style.MozTransform="";e.style.OTransform=""}else{var f="scale("+d+","+c+") translate("+g+"px,"+h+"px)";e.style.webkitTransform=f;e.style.MozTransform=f;e.style.OTransform=f}};b.utils.stretch=function(k,q,p,g,n,h){if(typeof p=="undefined"||typeof g=="undefined"||typeof n=="undefined"||typeof h=="undefined"){return}var d=p/n;var f=g/h;var m=0;var l=0;var e=false;var c={};if(q.parentElement){q.parentElement.style.overflow="hidden"}b.utils.transform(q);switch(k.toUpperCase()){case b.utils.stretching.NONE:c.width=n;c.height=h;c.top=(g-c.height)/2;c.left=(p-c.width)/2;break;case b.utils.stretching.UNIFORM:if(d>f){c.width=n*f;c.height=h*f;if(c.width/p>0.95){e=true;d=Math.ceil(100*p/c.width)/100;f=1;c.width=p}}else{c.width=n*d;c.height=h*d;if(c.height/g>0.95){e=true;d=1;f=Math.ceil(100*g/c.height)/100;c.height=g}}c.top=(g-c.height)/2;c.left=(p-c.width)/2;break;case b.utils.stretching.FILL:if(d>f){c.width=n*d;c.height=h*d}else{c.width=n*f;c.height=h*f}c.top=(g-c.height)/2;c.left=(p-c.width)/2;break;case b.utils.stretching.EXACTFIT:c.width=n;c.height=h;var o=Math.round((n/2)*(1-1/d));var j=Math.round((h/2)*(1-1/f));e=true;c.top=c.left=0;break;default:break}if(e){b.utils.transform(q,d,f,o,j)}b.utils.css(q,c)};b.utils.stretching={NONE:"NONE",FILL:"FILL",UNIFORM:"UNIFORM",EXACTFIT:"EXACTFIT"};b.utils.deepReplaceKeyName=function(k,e,c){switch(b.utils.typeOf(k)){case"array":for(var g=0;g<k.length;g++){k[g]=b.utils.deepReplaceKeyName(k[g],e,c)}break;case"object":for(var f in k){var j,h;if(e instanceof Array&&c instanceof Array){if(e.length!=c.length){continue}else{j=e;h=c}}else{j=[e];h=[c]}var d=f;for(var g=0;g<j.length;g++){d=d.replace(new RegExp(e[g],"g"),c[g])}k[d]=b.utils.deepReplaceKeyName(k[f],e,c);if(f!=d){delete k[f]}}break}return k};b.utils.isInArray=function(e,d){if(!(e)||!(e instanceof Array)){return false}for(var c=0;c<e.length;c++){if(d===e[c]){return true}}return false};b.utils.exists=function(c){switch(typeof(c)){case"string":return(c.length>0);break;case"object":return(c!==null);case"undefined":return false}return true};b.utils.empty=function(c){if(typeof c.hasChildNodes=="function"){while(c.hasChildNodes()){c.removeChild(c.firstChild)}}};b.utils.parseDimension=function(c){if(typeof c=="string"){if(c===""){return 0}else{if(c.lastIndexOf("%")>-1){return c}else{return parseInt(c.replace("px",""),10)}}}return c};b.utils.getDimensions=function(c){if(c&&c.style){return{x:b.utils.parseDimension(c.style.left),y:b.utils.parseDimension(c.style.top),width:b.utils.parseDimension(c.style.width),height:b.utils.parseDimension(c.style.height)}}else{return{}}};b.utils.getElementWidth=function(c){if(!c){return null}else{if(c==document.body){return b.utils.parentNode(c).clientWidth}else{if(c.clientWidth>0){return c.clientWidth}else{if(c.style){return b.utils.parseDimension(c.style.width)}else{return null}}}}};b.utils.getElementHeight=function(c){if(!c){return null}else{if(c==document.body){return b.utils.parentNode(c).clientHeight}else{if(c.clientHeight>0){return c.clientHeight}else{if(c.style){return b.utils.parseDimension(c.style.height)}else{return null}}}}};b.utils.timeFormat=function(c){str="00:00";if(c>0){str=Math.floor(c/60)<10?"0"+Math.floor(c/60)+":":Math.floor(c/60)+":";str+=Math.floor(c%60)<10?"0"+Math.floor(c%60):Math.floor(c%60)}return str};b.utils.useNativeFullscreen=function(){return(navigator&&navigator.vendor&&navigator.vendor.indexOf("Apple")==0)};b.utils.parentNode=function(c){if(!c){return docuemnt.body}else{if(c.parentNode){return c.parentNode}else{if(c.parentElement){return c.parentElement}else{return c}}}};b.utils.getBoundingClientRect=function(c){if(typeof c.getBoundingClientRect=="function"){return c.getBoundingClientRect()}else{return{left:c.offsetLeft+document.body.scrollLeft,top:c.offsetTop+document.body.scrollTop,width:c.offsetWidth,height:c.offsetHeight}}};b.utils.translateEventResponse=function(e,c){var g=b.utils.extend({},c);if(e==b.api.events.JWPLAYER_FULLSCREEN&&!g.fullscreen){g.fullscreen=g.message=="true"?true:false;delete g.message}else{if(typeof g.data=="object"){g=b.utils.extend(g,g.data);delete g.data}else{if(typeof g.metadata=="object"){b.utils.deepReplaceKeyName(g.metadata,["__dot__","__spc__","__dsh__"],["."," ","-"])}}}var d=["position","duration","offset"];for(var f in d){if(g[d[f]]){g[d[f]]=Math.round(g[d[f]]*1000)/1000}}return g};b.utils.saveCookie=function(c,d){document.cookie="jwplayer."+c+"="+d+"; path=/"};b.utils.getCookies=function(){var f={};var e=document.cookie.split("; ");for(var d=0;d<e.length;d++){var c=e[d].split("=");if(c[0].indexOf("jwplayer.")==0){f[c[0].substring(9,c[0].length)]=c[1]}}return f};b.utils.readCookie=function(c){return b.utils.getCookies()[c]}})(jwplayer);(function(a){a.events=function(){};a.events.COMPLETE="COMPLETE";a.events.ERROR="ERROR"})(jwplayer);(function(jwplayer){jwplayer.events.eventdispatcher=function(debug){var _debug=debug;var _listeners;var _globallisteners;this.resetEventListeners=function(){_listeners={};_globallisteners=[]};this.resetEventListeners();this.addEventListener=function(type,listener,count){try{if(!jwplayer.utils.exists(_listeners[type])){_listeners[type]=[]}if(typeof(listener)=="string"){eval("listener = "+listener)}_listeners[type].push({listener:listener,count:count})}catch(err){jwplayer.utils.log("error",err)}return false};this.removeEventListener=function(type,listener){if(!_listeners[type]){return}try{for(var listenerIndex=0;listenerIndex<_listeners[type].length;listenerIndex++){if(_listeners[type][listenerIndex].listener.toString()==listener.toString()){_listeners[type].splice(listenerIndex,1);break}}}catch(err){jwplayer.utils.log("error",err)}return false};this.addGlobalListener=function(listener,count){try{if(typeof(listener)=="string"){eval("listener = "+listener)}_globallisteners.push({listener:listener,count:count})}catch(err){jwplayer.utils.log("error",err)}return false};this.removeGlobalListener=function(listener){if(!listener){return}try{for(var globalListenerIndex=0;globalListenerIndex<_globallisteners.length;globalListenerIndex++){if(_globallisteners[globalListenerIndex].listener.toString()==listener.toString()){_globallisteners.splice(globalListenerIndex,1);break}}}catch(err){jwplayer.utils.log("error",err)}return false};this.sendEvent=function(type,data){if(!jwplayer.utils.exists(data)){data={}}if(_debug){jwplayer.utils.log(type,data)}if(typeof _listeners[type]!="undefined"){for(var listenerIndex=0;listenerIndex<_listeners[type].length;listenerIndex++){try{_listeners[type][listenerIndex].listener(data)}catch(err){jwplayer.utils.log("There was an error while handling a listener: "+err.toString(),_listeners[type][listenerIndex].listener)}if(_listeners[type][listenerIndex]){if(_listeners[type][listenerIndex].count===1){delete _listeners[type][listenerIndex]}else{if(_listeners[type][listenerIndex].count>0){_listeners[type][listenerIndex].count=_listeners[type][listenerIndex].count-1}}}}}for(var globalListenerIndex=0;globalListenerIndex<_globallisteners.length;globalListenerIndex++){try{_globallisteners[globalListenerIndex].listener(data)}catch(err){jwplayer.utils.log("There was an error while handling a listener: "+err.toString(),_globallisteners[globalListenerIndex].listener)}if(_globallisteners[globalListenerIndex]){if(_globallisteners[globalListenerIndex].count===1){delete _globallisteners[globalListenerIndex]}else{if(_globallisteners[globalListenerIndex].count>0){_globallisteners[globalListenerIndex].count=_globallisteners[globalListenerIndex].count-1}}}}}}})(jwplayer);(function(a){var b={};a.utils.animations=function(){};a.utils.animations.transform=function(c,d){c.style.webkitTransform=d;c.style.MozTransform=d;c.style.OTransform=d;c.style.msTransform=d};a.utils.animations.transformOrigin=function(c,d){c.style.webkitTransformOrigin=d;c.style.MozTransformOrigin=d;c.style.OTransformOrigin=d;c.style.msTransformOrigin=d};a.utils.animations.rotate=function(c,d){a.utils.animations.transform(c,["rotate(",d,"deg)"].join(""))};a.utils.cancelAnimation=function(c){delete b[c.id]};a.utils.fadeTo=function(m,f,e,j,h,d){if(b[m.id]!=d&&a.utils.exists(d)){return}if(m.style.opacity==f){return}var c=new Date().getTime();if(d>c){setTimeout(function(){a.utils.fadeTo(m,f,e,j,0,d)},d-c)}if(m.style.display=="none"){m.style.display="block"}if(!a.utils.exists(j)){j=m.style.opacity===""?1:m.style.opacity}if(m.style.opacity==f&&m.style.opacity!==""&&a.utils.exists(d)){if(f===0){m.style.display="none"}return}if(!a.utils.exists(d)){d=c;b[m.id]=d}if(!a.utils.exists(h)){h=0}var k=(e>0)?((c-d)/(e*1000)):0;k=k>1?1:k;var l=f-j;var g=j+(k*l);if(g>1){g=1}else{if(g<0){g=0}}m.style.opacity=g;if(h>0){b[m.id]=d+h*1000;a.utils.fadeTo(m,f,e,j,0,b[m.id]);return}setTimeout(function(){a.utils.fadeTo(m,f,e,j,0,d)},10)}})(jwplayer);(function(a){a.utils.arrays=function(){};a.utils.arrays.indexOf=function(c,d){for(var b=0;b<c.length;b++){if(c[b]==d){return b}}return -1};a.utils.arrays.remove=function(c,d){var b=a.utils.arrays.indexOf(c,d);if(b>-1){c.splice(b,1)}}})(jwplayer);(function(a){a.utils.extensionmap={"3gp":{html5:"video/3gpp",flash:"video"},"3gpp":{html5:"video/3gpp"},"3g2":{html5:"video/3gpp2",flash:"video"},"3gpp2":{html5:"video/3gpp2"},flv:{flash:"video"},f4a:{html5:"audio/mp4"},f4b:{html5:"audio/mp4",flash:"video"},f4v:{html5:"video/mp4",flash:"video"},mov:{html5:"video/quicktime",flash:"video"},m4a:{html5:"audio/mp4",flash:"video"},m4b:{html5:"audio/mp4"},m4p:{html5:"audio/mp4"},m4v:{html5:"video/mp4",flash:"video"},mp4:{html5:"video/mp4",flash:"video"},rbs:{flash:"sound"},aac:{html5:"audio/aac",flash:"video"},mp3:{html5:"audio/mp3",flash:"sound"},ogg:{html5:"audio/ogg"},oga:{html5:"audio/ogg"},ogv:{html5:"video/ogg"},webm:{html5:"video/webm"},m3u8:{html5:"audio/x-mpegurl"},gif:{flash:"image"},jpeg:{flash:"image"},jpg:{flash:"image"},swf:{flash:"image"},png:{flash:"image"},wav:{html5:"audio/x-wav"}}})(jwplayer);(function(e){e.utils.mediaparser=function(){};var g={element:{width:"width",height:"height",id:"id","class":"className",name:"name"},media:{src:"file",preload:"preload",autoplay:"autostart",loop:"repeat",controls:"controls"},source:{src:"file",type:"type",media:"media","data-jw-width":"width","data-jw-bitrate":"bitrate"},video:{poster:"image"}};var f={};e.utils.mediaparser.parseMedia=function(j){return d(j)};function c(k,j){if(!e.utils.exists(j)){j=g[k]}else{e.utils.extend(j,g[k])}return j}function d(n,j){if(f[n.tagName.toLowerCase()]&&!e.utils.exists(j)){return f[n.tagName.toLowerCase()](n)}else{j=c("element",j);var o={};for(var k in j){if(k!="length"){var m=n.getAttribute(k);if(e.utils.exists(m)){o[j[k]]=m}}}var l=n.style["#background-color"];if(l&&!(l=="transparent"||l=="rgba(0, 0, 0, 0)")){o.screencolor=l}return o}}function h(n,k){k=c("media",k);var l=[];var j=e.utils.selectors("source",n);for(var m in j){if(!isNaN(m)){l.push(a(j[m]))}}var o=d(n,k);if(e.utils.exists(o.file)){l[0]={file:o.file}}o.levels=l;return o}function a(l,k){k=c("source",k);var j=d(l,k);j.width=j.width?j.width:0;j.bitrate=j.bitrate?j.bitrate:0;return j}function b(l,k){k=c("video",k);var j=h(l,k);return j}f.media=h;f.audio=h;f.source=a;f.video=b})(jwplayer);(function(a){a.utils.loaderstatus={NEW:"NEW",LOADING:"LOADING",ERROR:"ERROR",COMPLETE:"COMPLETE"};a.utils.scriptloader=function(c){var d=a.utils.loaderstatus.NEW;var b=new a.events.eventdispatcher();a.utils.extend(this,b);this.load=function(){if(d==a.utils.loaderstatus.NEW){d=a.utils.loaderstatus.LOADING;var e=document.createElement("script");e.onload=function(f){d=a.utils.loaderstatus.COMPLETE;b.sendEvent(a.events.COMPLETE)};e.onerror=function(f){d=a.utils.loaderstatus.ERROR;b.sendEvent(a.events.ERROR)};e.onreadystatechange=function(){if(e.readyState=="loaded"||e.readyState=="complete"){d=a.utils.loaderstatus.COMPLETE;b.sendEvent(a.events.COMPLETE)}};document.getElementsByTagName("head")[0].appendChild(e);e.src=c}};this.getStatus=function(){return d}}})(jwplayer);(function(a){a.utils.selectors=function(b,e){if(!a.utils.exists(e)){e=document}b=a.utils.strings.trim(b);var c=b.charAt(0);if(c=="#"){return e.getElementById(b.substr(1))}else{if(c=="."){if(e.getElementsByClassName){return e.getElementsByClassName(b.substr(1))}else{return a.utils.selectors.getElementsByTagAndClass("*",b.substr(1))}}else{if(b.indexOf(".")>0){var d=b.split(".");return a.utils.selectors.getElementsByTagAndClass(d[0],d[1])}else{return e.getElementsByTagName(b)}}}return null};a.utils.selectors.getElementsByTagAndClass=function(e,h,g){var j=[];if(!a.utils.exists(g)){g=document}var f=g.getElementsByTagName(e);for(var d=0;d<f.length;d++){if(a.utils.exists(f[d].className)){var c=f[d].className.split(" ");for(var b=0;b<c.length;b++){if(c[b]==h){j.push(f[d])}}}}return j}})(jwplayer);(function(a){a.utils.strings=function(){};a.utils.strings.trim=function(b){return b.replace(/^\s*/,"").replace(/\s*$/,"")};a.utils.strings.pad=function(c,d,b){if(!b){b="0"}while(c.length<d){c=b+c}return c};a.utils.strings.serialize=function(b){if(b==null){return null}else{if(b=="true"){return true}else{if(b=="false"){return false}else{if(isNaN(Number(b))||b.length>5||b.length==0){return b}else{return Number(b)}}}}};a.utils.strings.seconds=function(d){d=d.replace(",",".");var b=d.split(":");var c=0;if(d.substr(-1)=="s"){c=Number(d.substr(0,d.length-1))}else{if(d.substr(-1)=="m"){c=Number(d.substr(0,d.length-1))*60}else{if(d.substr(-1)=="h"){c=Number(d.substr(0,d.length-1))*3600}else{if(b.length>1){c=Number(b[b.length-1]);c+=Number(b[b.length-2])*60;if(b.length==3){c+=Number(b[b.length-3])*3600}}else{c=Number(d)}}}}return c};a.utils.strings.xmlAttribute=function(b,c){for(var d=0;d<b.attributes.length;d++){if(b.attributes[d].name&&b.attributes[d].name.toLowerCase()==c.toLowerCase()){return b.attributes[d].value.toString()}}return""};a.utils.strings.jsonToString=function(f){var h=h||{};if(h&&h.stringify){return h.stringify(f)}var c=typeof(f);if(c!="object"||f===null){if(c=="string"){f='"'+f.replace(/"/g,'\\"')+'"'}else{return String(f)}}else{var g=[],b=(f&&f.constructor==Array);for(var d in f){var e=f[d];switch(typeof(e)){case"string":e='"'+e.replace(/"/g,'\\"')+'"';break;case"object":if(a.utils.exists(e)){e=a.utils.strings.jsonToString(e)}break}if(b){if(typeof(e)!="function"){g.push(String(e))}}else{if(typeof(e)!="function"){g.push('"'+d+'":'+String(e))}}}if(b){return"["+String(g)+"]"}else{return"{"+String(g)+"}"}}}})(jwplayer);(function(c){var d=new RegExp(/^(#|0x)[0-9a-fA-F]{3,6}/);c.utils.typechecker=function(g,f){f=!c.utils.exists(f)?b(g):f;return e(g,f)};function b(f){var g=["true","false","t","f"];if(g.toString().indexOf(f.toLowerCase().replace(" ",""))>=0){return"boolean"}else{if(d.test(f)){return"color"}else{if(!isNaN(parseInt(f,10))&&parseInt(f,10).toString().length==f.length){return"integer"}else{if(!isNaN(parseFloat(f))&&parseFloat(f).toString().length==f.length){return"float"}}}}return"string"}function e(g,f){if(!c.utils.exists(f)){return g}switch(f){case"color":if(g.length>0){return a(g)}return null;case"integer":return parseInt(g,10);case"float":return parseFloat(g);case"boolean":if(g.toLowerCase()=="true"){return true}else{if(g=="1"){return true}}return false}return g}function a(f){switch(f.toLowerCase()){case"blue":return parseInt("0000FF",16);case"green":return parseInt("00FF00",16);case"red":return parseInt("FF0000",16);case"cyan":return parseInt("00FFFF",16);case"magenta":return parseInt("FF00FF",16);case"yellow":return parseInt("FFFF00",16);case"black":return parseInt("000000",16);case"white":return parseInt("FFFFFF",16);default:f=f.replace(/(#|0x)?([0-9A-F]{3,6})$/gi,"$2");if(f.length==3){f=f.charAt(0)+f.charAt(0)+f.charAt(1)+f.charAt(1)+f.charAt(2)+f.charAt(2)}return parseInt(f,16)}return parseInt("000000",16)}})(jwplayer);(function(a){a.utils.parsers=function(){};a.utils.parsers.localName=function(b){if(!b){return""}else{if(b.localName){return b.localName}else{if(b.baseName){return b.baseName}else{return""}}}};a.utils.parsers.textContent=function(b){if(!b){return""}else{if(b.textContent){return b.textContent}else{if(b.text){return b.text}else{return""}}}}})(jwplayer);(function(a){a.utils.parsers.jwparser=function(){};a.utils.parsers.jwparser.PREFIX="jwplayer";a.utils.parsers.jwparser.parseEntry=function(c,d){for(var b=0;b<c.childNodes.length;b++){if(c.childNodes[b].prefix==a.utils.parsers.jwparser.PREFIX){d[a.utils.parsers.localName(c.childNodes[b])]=a.utils.strings.serialize(a.utils.parsers.textContent(c.childNodes[b]));if(a.utils.parsers.localName(c.childNodes[b])=="file"&&d.levels){delete d.levels}}if(!d.file&&String(d.link).toLowerCase().indexOf("youtube")>-1){d.file=d.link}}return d};a.utils.parsers.jwparser.getProvider=function(c){if(c.type){return c.type}else{if(c.file.indexOf("youtube.com/w")>-1||c.file.indexOf("youtube.com/v")>-1||c.file.indexOf("youtu.be/")>-1){return"youtube"}else{if(c.streamer&&c.streamer.indexOf("rtmp")==0){return"rtmp"}else{if(c.streamer&&c.streamer.indexOf("http")==0){return"http"}else{var b=a.utils.strings.extension(c.file);if(extensions.hasOwnProperty(b)){return extensions[b]}}}}}return""}})(jwplayer);(function(a){a.utils.parsers.mediaparser=function(){};a.utils.parsers.mediaparser.PREFIX="media";a.utils.parsers.mediaparser.parseGroup=function(d,f){var e=false;for(var c=0;c<d.childNodes.length;c++){if(d.childNodes[c].prefix==a.utils.parsers.mediaparser.PREFIX){if(!a.utils.parsers.localName(d.childNodes[c])){continue}switch(a.utils.parsers.localName(d.childNodes[c]).toLowerCase()){case"content":if(!e){f.file=a.utils.strings.xmlAttribute(d.childNodes[c],"url")}if(a.utils.strings.xmlAttribute(d.childNodes[c],"duration")){f.duration=a.utils.strings.seconds(a.utils.strings.xmlAttribute(d.childNodes[c],"duration"))}if(a.utils.strings.xmlAttribute(d.childNodes[c],"start")){f.start=a.utils.strings.seconds(a.utils.strings.xmlAttribute(d.childNodes[c],"start"))}if(d.childNodes[c].childNodes&&d.childNodes[c].childNodes.length>0){f=a.utils.parsers.mediaparser.parseGroup(d.childNodes[c],f)}if(a.utils.strings.xmlAttribute(d.childNodes[c],"width")||a.utils.strings.xmlAttribute(d.childNodes[c],"bitrate")||a.utils.strings.xmlAttribute(d.childNodes[c],"url")){if(!f.levels){f.levels=[]}f.levels.push({width:a.utils.strings.xmlAttribute(d.childNodes[c],"width"),bitrate:a.utils.strings.xmlAttribute(d.childNodes[c],"bitrate"),file:a.utils.strings.xmlAttribute(d.childNodes[c],"url")})}break;case"title":f.title=a.utils.parsers.textContent(d.childNodes[c]);break;case"description":f.description=a.utils.parsers.textContent(d.childNodes[c]);break;case"keywords":f.tags=a.utils.parsers.textContent(d.childNodes[c]);break;case"thumbnail":f.image=a.utils.strings.xmlAttribute(d.childNodes[c],"url");break;case"credit":f.author=a.utils.parsers.textContent(d.childNodes[c]);break;case"player":var b=d.childNodes[c].url;if(b.indexOf("youtube.com")>=0||b.indexOf("youtu.be")>=0){e=true;f.file=a.utils.strings.xmlAttribute(d.childNodes[c],"url")}break;case"group":a.utils.parsers.mediaparser.parseGroup(d.childNodes[c],f);break}}}return f}})(jwplayer);(function(b){b.utils.parsers.rssparser=function(){};b.utils.parsers.rssparser.parse=function(f){var c=[];for(var e=0;e<f.childNodes.length;e++){if(b.utils.parsers.localName(f.childNodes[e]).toLowerCase()=="channel"){for(var d=0;d<f.childNodes[e].childNodes.length;d++){if(b.utils.parsers.localName(f.childNodes[e].childNodes[d]).toLowerCase()=="item"){c.push(a(f.childNodes[e].childNodes[d]))}}}}return c};function a(d){var e={};for(var c=0;c<d.childNodes.length;c++){if(!b.utils.parsers.localName(d.childNodes[c])){continue}switch(b.utils.parsers.localName(d.childNodes[c]).toLowerCase()){case"enclosure":e.file=b.utils.strings.xmlAttribute(d.childNodes[c],"url");break;case"title":e.title=b.utils.parsers.textContent(d.childNodes[c]);break;case"pubdate":e.date=b.utils.parsers.textContent(d.childNodes[c]);break;case"description":e.description=b.utils.parsers.textContent(d.childNodes[c]);break;case"link":e.link=b.utils.parsers.textContent(d.childNodes[c]);break;case"category":if(e.tags){e.tags+=b.utils.parsers.textContent(d.childNodes[c])}else{e.tags=b.utils.parsers.textContent(d.childNodes[c])}break}}e=b.utils.parsers.mediaparser.parseGroup(d,e);e=b.utils.parsers.jwparser.parseEntry(d,e);return new b.html5.playlistitem(e)}})(jwplayer);(function(a){var c={};var b={};a.plugins=function(){};a.plugins.loadPlugins=function(e,d){b[e]=new a.plugins.pluginloader(new a.plugins.model(c),d);return b[e]};a.plugins.registerPlugin=function(h,f,e){var d=a.utils.getPluginName(h);if(c[d]){c[d].registerPlugin(h,f,e)}else{a.utils.log("A plugin ("+h+") was registered with the player that was not loaded. Please check your configuration.");for(var g in b){b[g].pluginFailed()}}}})(jwplayer);(function(a){a.plugins.model=function(b){this.addPlugin=function(c){var d=a.utils.getPluginName(c);if(!b[d]){b[d]=new a.plugins.plugin(c)}return b[d]}}})(jwplayer);(function(a){a.plugins.pluginmodes={FLASH:"FLASH",JAVASCRIPT:"JAVASCRIPT",HYBRID:"HYBRID"};a.plugins.plugin=function(b){var d="http://lp.longtailvideo.com";var j=a.utils.loaderstatus.NEW;var k;var h;var l;var c=new a.events.eventdispatcher();a.utils.extend(this,c);function e(){switch(a.utils.getPluginPathType(b)){case a.utils.pluginPathType.ABSOLUTE:return b;case a.utils.pluginPathType.RELATIVE:return a.utils.getAbsolutePath(b,window.location.href);case a.utils.pluginPathType.CDN:var o=a.utils.getPluginName(b);var n=a.utils.getPluginVersion(b);var m=(window.location.href.indexOf("https://")==0)?d.replace("http://","https://secure"):d;return m+"/"+a.version.split(".")[0]+"/"+o+"/"+o+(n!==""?("-"+n):"")+".js"}}function g(m){l=setTimeout(function(){j=a.utils.loaderstatus.COMPLETE;c.sendEvent(a.events.COMPLETE)},1000)}function f(m){j=a.utils.loaderstatus.ERROR;c.sendEvent(a.events.ERROR)}this.load=function(){if(j==a.utils.loaderstatus.NEW){if(b.lastIndexOf(".swf")>0){k=b;j=a.utils.loaderstatus.COMPLETE;c.sendEvent(a.events.COMPLETE);return}j=a.utils.loaderstatus.LOADING;var m=new a.utils.scriptloader(e());m.addEventListener(a.events.COMPLETE,g);m.addEventListener(a.events.ERROR,f);m.load()}};this.registerPlugin=function(o,n,m){if(l){clearTimeout(l);l=undefined}if(n&&m){k=m;h=n}else{if(typeof n=="string"){k=n}else{if(typeof n=="function"){h=n}else{if(!n&&!m){k=o}}}}j=a.utils.loaderstatus.COMPLETE;c.sendEvent(a.events.COMPLETE)};this.getStatus=function(){return j};this.getPluginName=function(){return a.utils.getPluginName(b)};this.getFlashPath=function(){if(k){switch(a.utils.getPluginPathType(k)){case a.utils.pluginPathType.ABSOLUTE:return k;case a.utils.pluginPathType.RELATIVE:if(b.lastIndexOf(".swf")>0){return a.utils.getAbsolutePath(k,window.location.href)}return a.utils.getAbsolutePath(k,e());case a.utils.pluginPathType.CDN:if(k.indexOf("-")>-1){return k+"h"}return k+"-h"}}return null};this.getJS=function(){return h};this.getPluginmode=function(){if(typeof k!="undefined"&&typeof h!="undefined"){return a.plugins.pluginmodes.HYBRID}else{if(typeof k!="undefined"){return a.plugins.pluginmodes.FLASH}else{if(typeof h!="undefined"){return a.plugins.pluginmodes.JAVASCRIPT}}}};this.getNewInstance=function(n,m,o){return new h(n,m,o)};this.getURL=function(){return b}}})(jwplayer);(function(a){a.plugins.pluginloader=function(h,e){var g={};var k=a.utils.loaderstatus.NEW;var d=false;var b=false;var c=new a.events.eventdispatcher();a.utils.extend(this,c);function f(){if(!b){b=true;k=a.utils.loaderstatus.COMPLETE;c.sendEvent(a.events.COMPLETE)}}function j(){if(!b){var m=0;for(plugin in g){var l=g[plugin].getStatus();if(l==a.utils.loaderstatus.LOADING||l==a.utils.loaderstatus.NEW){m++}}if(m==0){f()}}}this.setupPlugins=function(n,l,s){var m={length:0,plugins:{}};var p={length:0,plugins:{}};for(var o in g){var q=g[o].getPluginName();if(g[o].getFlashPath()){m.plugins[g[o].getFlashPath()]=l.plugins[o];m.plugins[g[o].getFlashPath()].pluginmode=g[o].getPluginmode();m.length++}if(g[o].getJS()){var r=document.createElement("div");r.id=n.id+"_"+q;r.style.position="absolute";r.style.zIndex=p.length+10;p.plugins[q]=g[o].getNewInstance(n,l.plugins[o],r);p.length++;if(typeof p.plugins[q].resize!="undefined"){n.onReady(s(p.plugins[q],r,true));n.onResize(s(p.plugins[q],r))}}}n.plugins=p.plugins;return m};this.load=function(){k=a.utils.loaderstatus.LOADING;d=true;for(var l in e){if(a.utils.exists(l)){g[l]=h.addPlugin(l);g[l].addEventListener(a.events.COMPLETE,j);g[l].addEventListener(a.events.ERROR,j)}}for(l in g){g[l].load()}d=false;j()};this.pluginFailed=function(){f()};this.getStatus=function(){return k}}})(jwplayer);(function(b){var a=[];b.api=function(d){this.container=d;this.id=d.id;var m={};var t={};var p={};var c=[];var g=undefined;var k=false;var h=[];var r=undefined;var o=b.utils.getOuterHTML(d);var s={};var j={};this.getBuffer=function(){return this.callInternal("jwGetBuffer")};this.getContainer=function(){return this.container};function e(v,u){return function(A,w,x,y){if(v.renderingMode=="flash"||v.renderingMode=="html5"){var z;if(w){j[A]=w;z="jwplayer('"+v.id+"').callback('"+A+"')"}else{if(!w&&j[A]){delete j[A]}}g.jwDockSetButton(A,z,x,y)}return u}}this.getPlugin=function(u){var w=this;var v={};if(u=="dock"){return b.utils.extend(v,{setButton:e(w,v),show:function(){w.callInternal("jwDockShow");return v},hide:function(){w.callInternal("jwDockHide");return v},onShow:function(x){w.componentListener("dock",b.api.events.JWPLAYER_COMPONENT_SHOW,x);return v},onHide:function(x){w.componentListener("dock",b.api.events.JWPLAYER_COMPONENT_HIDE,x);return v}})}else{if(u=="controlbar"){return b.utils.extend(v,{show:function(){w.callInternal("jwControlbarShow");return v},hide:function(){w.callInternal("jwControlbarHide");return v},onShow:function(x){w.componentListener("controlbar",b.api.events.JWPLAYER_COMPONENT_SHOW,x);return v},onHide:function(x){w.componentListener("controlbar",b.api.events.JWPLAYER_COMPONENT_HIDE,x);return v}})}else{if(u=="display"){return b.utils.extend(v,{show:function(){w.callInternal("jwDisplayShow");return v},hide:function(){w.callInternal("jwDisplayHide");return v},onShow:function(x){w.componentListener("display",b.api.events.JWPLAYER_COMPONENT_SHOW,x);return v},onHide:function(x){w.componentListener("display",b.api.events.JWPLAYER_COMPONENT_HIDE,x);return v}})}else{return this.plugins[u]}}}};this.callback=function(u){if(j[u]){return j[u]()}};this.getDuration=function(){return this.callInternal("jwGetDuration")};this.getFullscreen=function(){return this.callInternal("jwGetFullscreen")};this.getHeight=function(){return this.callInternal("jwGetHeight")};this.getLockState=function(){return this.callInternal("jwGetLockState")};this.getMeta=function(){return this.getItemMeta()};this.getMute=function(){return this.callInternal("jwGetMute")};this.getPlaylist=function(){var v=this.callInternal("jwGetPlaylist");if(this.renderingMode=="flash"){b.utils.deepReplaceKeyName(v,["__dot__","__spc__","__dsh__"],["."," ","-"])}for(var u=0;u<v.length;u++){if(!b.utils.exists(v[u].index)){v[u].index=u}}return v};this.getPlaylistItem=function(u){if(!b.utils.exists(u)){u=this.getCurrentItem()}return this.getPlaylist()[u]};this.getPosition=function(){return this.callInternal("jwGetPosition")};this.getRenderingMode=function(){return this.renderingMode};this.getState=function(){return this.callInternal("jwGetState")};this.getVolume=function(){return this.callInternal("jwGetVolume")};this.getWidth=function(){return this.callInternal("jwGetWidth")};this.setFullscreen=function(u){if(!b.utils.exists(u)){this.callInternal("jwSetFullscreen",!this.callInternal("jwGetFullscreen"))}else{this.callInternal("jwSetFullscreen",u)}return this};this.setMute=function(u){if(!b.utils.exists(u)){this.callInternal("jwSetMute",!this.callInternal("jwGetMute"))}else{this.callInternal("jwSetMute",u)}return this};this.lock=function(){return this};this.unlock=function(){return this};this.load=function(u){this.callInternal("jwLoad",u);return this};this.playlistItem=function(u){this.callInternal("jwPlaylistItem",u);return this};this.playlistPrev=function(){this.callInternal("jwPlaylistPrev");return this};this.playlistNext=function(){this.callInternal("jwPlaylistNext");return this};this.resize=function(v,u){if(this.renderingMode=="html5"){g.jwResize(v,u)}else{this.container.width=v;this.container.height=u;var w=document.getElementById(this.id+"_wrapper");if(w){w.style.width=v+"px";w.style.height=u+"px"}}return this};this.play=function(u){if(typeof u=="undefined"){u=this.getState();if(u==b.api.events.state.PLAYING||u==b.api.events.state.BUFFERING){this.callInternal("jwPause")}else{this.callInternal("jwPlay")}}else{this.callInternal("jwPlay",u)}return this};this.pause=function(u){if(typeof u=="undefined"){u=this.getState();if(u==b.api.events.state.PLAYING||u==b.api.events.state.BUFFERING){this.callInternal("jwPause")}else{this.callInternal("jwPlay")}}else{this.callInternal("jwPause",u)}return this};this.stop=function(){this.callInternal("jwStop");return this};this.seek=function(u){this.callInternal("jwSeek",u);return this};this.setVolume=function(u){this.callInternal("jwSetVolume",u);return this};this.loadInstream=function(v,u){r=new b.api.instream(this,g,v,u);return r};this.onBufferChange=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_BUFFER,u)};this.onBufferFull=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_BUFFER_FULL,u)};this.onError=function(u){return this.eventListener(b.api.events.JWPLAYER_ERROR,u)};this.onFullscreen=function(u){return this.eventListener(b.api.events.JWPLAYER_FULLSCREEN,u)};this.onMeta=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_META,u)};this.onMute=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_MUTE,u)};this.onPlaylist=function(u){return this.eventListener(b.api.events.JWPLAYER_PLAYLIST_LOADED,u)};this.onPlaylistItem=function(u){return this.eventListener(b.api.events.JWPLAYER_PLAYLIST_ITEM,u)};this.onReady=function(u){return this.eventListener(b.api.events.API_READY,u)};this.onResize=function(u){return this.eventListener(b.api.events.JWPLAYER_RESIZE,u)};this.onComplete=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_COMPLETE,u)};this.onSeek=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_SEEK,u)};this.onTime=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_TIME,u)};this.onVolume=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_VOLUME,u)};this.onBeforePlay=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_BEFOREPLAY,u)};this.onBeforeComplete=function(u){return this.eventListener(b.api.events.JWPLAYER_MEDIA_BEFORECOMPLETE,u)};this.onBuffer=function(u){return this.stateListener(b.api.events.state.BUFFERING,u)};this.onPause=function(u){return this.stateListener(b.api.events.state.PAUSED,u)};this.onPlay=function(u){return this.stateListener(b.api.events.state.PLAYING,u)};this.onIdle=function(u){return this.stateListener(b.api.events.state.IDLE,u)};this.remove=function(){if(!k){throw"Cannot call remove() before player is ready";return}q(this)};function q(u){h=[];if(b.utils.getOuterHTML(u.container)!=o){b.api.destroyPlayer(u.id,o)}}this.setup=function(v){if(b.embed){var u=this.id;q(this);var w=b(u);w.config=v;return new b.embed(w)}return this};this.registerPlugin=function(w,v,u){b.plugins.registerPlugin(w,v,u)};this.setPlayer=function(u,v){g=u;this.renderingMode=v};this.stateListener=function(u,v){if(!t[u]){t[u]=[];this.eventListener(b.api.events.JWPLAYER_PLAYER_STATE,f(u))}t[u].push(v);return this};this.detachMedia=function(){if(this.renderingMode=="html5"){return this.callInternal("jwDetachMedia")}};this.attachMedia=function(){if(this.renderingMode=="html5"){return this.callInternal("jwAttachMedia")}};function f(u){return function(w){var v=w.newstate,y=w.oldstate;if(v==u){var x=t[v];if(x){for(var z=0;z<x.length;z++){if(typeof x[z]=="function"){x[z].call(this,{oldstate:y,newstate:v})}}}}}}this.componentListener=function(u,v,w){if(!p[u]){p[u]={}}if(!p[u][v]){p[u][v]=[];this.eventListener(v,l(u,v))}p[u][v].push(w);return this};function l(u,v){return function(x){if(u==x.component){var w=p[u][v];if(w){for(var y=0;y<w.length;y++){if(typeof w[y]=="function"){w[y].call(this,x)}}}}}}this.addInternalListener=function(u,v){try{u.jwAddEventListener(v,'function(dat) { jwplayer("'+this.id+'").dispatchEvent("'+v+'", dat); }')}catch(w){b.utils.log("Could not add internal listener")}};this.eventListener=function(u,v){if(!m[u]){m[u]=[];if(g&&k){this.addInternalListener(g,u)}}m[u].push(v);return this};this.dispatchEvent=function(w){if(m[w]){var v=_utils.translateEventResponse(w,arguments[1]);for(var u=0;u<m[w].length;u++){if(typeof m[w][u]=="function"){m[w][u].call(this,v)}}}};this.dispatchInstreamEvent=function(u){if(r){r.dispatchEvent(u,arguments)}};this.callInternal=function(){if(k){var w=arguments[0],u=[];for(var v=1;v<arguments.length;v++){u.push(arguments[v])}if(typeof g!="undefined"&&typeof g[w]=="function"){if(u.length==2){return(g[w])(u[0],u[1])}else{if(u.length==1){return(g[w])(u[0])}else{return(g[w])()}}}return null}else{h.push(arguments)}};this.playerReady=function(v){k=true;if(!g){this.setPlayer(document.getElementById(v.id))}this.container=document.getElementById(this.id);for(var u in m){this.addInternalListener(g,u)}this.eventListener(b.api.events.JWPLAYER_PLAYLIST_ITEM,function(w){s={}});this.eventListener(b.api.events.JWPLAYER_MEDIA_META,function(w){b.utils.extend(s,w.metadata)});this.dispatchEvent(b.api.events.API_READY);while(h.length>0){this.callInternal.apply(this,h.shift())}};this.getItemMeta=function(){return s};this.getCurrentItem=function(){return this.callInternal("jwGetPlaylistIndex")};function n(w,y,x){var u=[];if(!y){y=0}if(!x){x=w.length-1}for(var v=y;v<=x;v++){u.push(w[v])}return u}return this};b.api.selectPlayer=function(d){var c;if(!b.utils.exists(d)){d=0}if(d.nodeType){c=d}else{if(typeof d=="string"){c=document.getElementById(d)}}if(c){var e=b.api.playerById(c.id);if(e){return e}else{return b.api.addPlayer(new b.api(c))}}else{if(typeof d=="number"){return b.getPlayers()[d]}}return null};b.api.events={API_READY:"jwplayerAPIReady",JWPLAYER_READY:"jwplayerReady",JWPLAYER_FULLSCREEN:"jwplayerFullscreen",JWPLAYER_RESIZE:"jwplayerResize",JWPLAYER_ERROR:"jwplayerError",JWPLAYER_MEDIA_BEFOREPLAY:"jwplayerMediaBeforePlay",JWPLAYER_MEDIA_BEFORECOMPLETE:"jwplayerMediaBeforeComplete",JWPLAYER_COMPONENT_SHOW:"jwplayerComponentShow",JWPLAYER_COMPONENT_HIDE:"jwplayerComponentHide",JWPLAYER_MEDIA_BUFFER:"jwplayerMediaBuffer",JWPLAYER_MEDIA_BUFFER_FULL:"jwplayerMediaBufferFull",JWPLAYER_MEDIA_ERROR:"jwplayerMediaError",JWPLAYER_MEDIA_LOADED:"jwplayerMediaLoaded",JWPLAYER_MEDIA_COMPLETE:"jwplayerMediaComplete",JWPLAYER_MEDIA_SEEK:"jwplayerMediaSeek",JWPLAYER_MEDIA_TIME:"jwplayerMediaTime",JWPLAYER_MEDIA_VOLUME:"jwplayerMediaVolume",JWPLAYER_MEDIA_META:"jwplayerMediaMeta",JWPLAYER_MEDIA_MUTE:"jwplayerMediaMute",JWPLAYER_PLAYER_STATE:"jwplayerPlayerState",JWPLAYER_PLAYLIST_LOADED:"jwplayerPlaylistLoaded",JWPLAYER_PLAYLIST_ITEM:"jwplayerPlaylistItem",JWPLAYER_INSTREAM_CLICK:"jwplayerInstreamClicked",JWPLAYER_INSTREAM_DESTROYED:"jwplayerInstreamDestroyed"};b.api.events.state={BUFFERING:"BUFFERING",IDLE:"IDLE",PAUSED:"PAUSED",PLAYING:"PLAYING"};b.api.playerById=function(d){for(var c=0;c<a.length;c++){if(a[c].id==d){return a[c]}}return null};b.api.addPlayer=function(c){for(var d=0;d<a.length;d++){if(a[d]==c){return c}}a.push(c);return c};b.api.destroyPlayer=function(g,d){var f=-1;for(var j=0;j<a.length;j++){if(a[j].id==g){f=j;continue}}if(f>=0){var c=document.getElementById(a[f].id);if(document.getElementById(a[f].id+"_wrapper")){c=document.getElementById(a[f].id+"_wrapper")}if(c){if(d){b.utils.setOuterHTML(c,d)}else{var h=document.createElement("div");var e=c.id;if(c.id.indexOf("_wrapper")==c.id.length-8){newID=c.id.substring(0,c.id.length-8)}h.setAttribute("id",e);c.parentNode.replaceChild(h,c)}}a.splice(f,1)}return null};b.getPlayers=function(){return a.slice(0)}})(jwplayer);var _userPlayerReady=(typeof playerReady=="function")?playerReady:undefined;playerReady=function(b){var a=jwplayer.api.playerById(b.id);if(a){a.playerReady(b)}else{jwplayer.api.selectPlayer(b.id).playerReady(b)}if(_userPlayerReady){_userPlayerReady.call(this,b)}};(function(a){a.api.instream=function(c,j,n,q){var h=c;var b=j;var g=n;var k=q;var e={};var p={};function f(){h.callInternal("jwLoadInstream",n,q)}function m(r,s){b.jwInstreamAddEventListener(s,'function(dat) { jwplayer("'+h.id+'").dispatchInstreamEvent("'+s+'", dat); }')}function d(r,s){if(!e[r]){e[r]=[];m(b,r)}e[r].push(s);return this}function o(r,s){if(!p[r]){p[r]=[];d(a.api.events.JWPLAYER_PLAYER_STATE,l(r))}p[r].push(s);return this}function l(r){return function(t){var s=t.newstate,v=t.oldstate;if(s==r){var u=p[s];if(u){for(var w=0;w<u.length;w++){if(typeof u[w]=="function"){u[w].call(this,{oldstate:v,newstate:s,type:t.type})}}}}}}this.dispatchEvent=function(u,t){if(e[u]){var s=_utils.translateEventResponse(u,t[1]);for(var r=0;r<e[u].length;r++){if(typeof e[u][r]=="function"){e[u][r].call(this,s)}}}};this.onError=function(r){return d(a.api.events.JWPLAYER_ERROR,r)};this.onFullscreen=function(r){return d(a.api.events.JWPLAYER_FULLSCREEN,r)};this.onMeta=function(r){return d(a.api.events.JWPLAYER_MEDIA_META,r)};this.onMute=function(r){return d(a.api.events.JWPLAYER_MEDIA_MUTE,r)};this.onComplete=function(r){return d(a.api.events.JWPLAYER_MEDIA_COMPLETE,r)};this.onSeek=function(r){return d(a.api.events.JWPLAYER_MEDIA_SEEK,r)};this.onTime=function(r){return d(a.api.events.JWPLAYER_MEDIA_TIME,r)};this.onVolume=function(r){return d(a.api.events.JWPLAYER_MEDIA_VOLUME,r)};this.onBuffer=function(r){return o(a.api.events.state.BUFFERING,r)};this.onPause=function(r){return o(a.api.events.state.PAUSED,r)};this.onPlay=function(r){return o(a.api.events.state.PLAYING,r)};this.onIdle=function(r){return o(a.api.events.state.IDLE,r)};this.onInstreamClick=function(r){return d(a.api.events.JWPLAYER_INSTREAM_CLICK,r)};this.onInstreamDestroyed=function(r){return d(a.api.events.JWPLAYER_INSTREAM_DESTROYED,r)};this.play=function(r){b.jwInstreamPlay(r)};this.pause=function(r){b.jwInstreamPause(r)};this.seek=function(r){b.jwInstreamSeek(r)};this.destroy=function(){b.jwInstreamDestroy()};this.getState=function(){return b.jwInstreamGetState()};this.getDuration=function(){return b.jwInstreamGetDuration()};this.getPosition=function(){return b.jwInstreamGetPosition()};f()}})(jwplayer);(function(a){var c=a.utils;a.embed=function(h){var k={width:400,height:300,components:{controlbar:{position:"over"}}};var g=c.mediaparser.parseMedia(h.container);var f=new a.embed.config(c.extend(k,g,h.config),this);var j=a.plugins.loadPlugins(h.id,f.plugins);function d(n,m){for(var l in m){if(typeof n[l]=="function"){(n[l]).call(n,m[l])}}}function e(){if(j.getStatus()==c.loaderstatus.COMPLETE){for(var n=0;n<f.modes.length;n++){if(f.modes[n].type&&a.embed[f.modes[n].type]){var p=f.modes[n].config;var t=f;if(p){t=c.extend(c.clone(f),p);var s=["file","levels","playlist"];for(var m=0;m<s.length;m++){var q=s[m];if(c.exists(p[q])){for(var l=0;l<s.length;l++){if(l!=m){var o=s[l];if(c.exists(t[o])&&!c.exists(p[o])){delete t[o]}}}}}}var r=new a.embed[f.modes[n].type](document.getElementById(h.id),f.modes[n],t,j,h);if(r.supportsConfig()){r.embed();d(h,f.events);return h}}}c.log("No suitable players found");new a.embed.logo(c.extend({hide:true},f.components.logo),"none",h.id)}}j.addEventListener(a.events.COMPLETE,e);j.addEventListener(a.events.ERROR,e);j.load();return h};function b(){if(!document.body){return setTimeout(b,15)}var d=c.selectors.getElementsByTagAndClass("video","jwplayer");for(var e=0;e<d.length;e++){var f=d[e];if(f.id==""){f.id="jwplayer_"+Math.round(Math.random()*100000)}a(f.id).setup({})}}b()})(jwplayer);(function(e){var k=e.utils;function h(m){var l=[{type:"flash",src:m?m:"/jwplayer/player.swf"},{type:"html5"},{type:"download"}];if(k.isAndroid()){l[0]=l.splice(1,1,l[0])[0]}return l}var a={players:"modes",autoplay:"autostart"};function b(o){var n=o.toLowerCase();var m=["left","right","top","bottom"];for(var l=0;l<m.length;l++){if(n==m[l]){return true}}return false}function c(m){var l=false;l=(m instanceof Array)||(typeof m=="object"&&!m.position&&!m.size);return l}function j(l){if(typeof l=="string"){if(parseInt(l).toString()==l||l.toLowerCase().indexOf("px")>-1){return parseInt(l)}}return l}var g=["playlist","dock","controlbar","logo","display"];function f(l){var o={};switch(k.typeOf(l.plugins)){case"object":for(var n in l.plugins){o[k.getPluginName(n)]=n}break;case"string":var p=l.plugins.split(",");for(var m=0;m<p.length;m++){o[k.getPluginName(p[m])]=p[m]}break}return o}function d(p,o,n,l){if(k.typeOf(p[o])!="object"){p[o]={}}var m=p[o][n];if(k.typeOf(m)!="object"){p[o][n]=m={}}if(l){if(o=="plugins"){var q=k.getPluginName(n);m[l]=p[q+"."+l];delete p[q+"."+l]}else{m[l]=p[n+"."+l];delete p[n+"."+l]}}}e.embed.deserialize=function(m){var n=f(m);for(var l in n){d(m,"plugins",n[l])}for(var q in m){if(q.indexOf(".")>-1){var p=q.split(".");var o=p[0];var q=p[1];if(k.isInArray(g,o)){d(m,"components",o,q)}else{if(n[o]){d(m,"plugins",n[o],q)}}}}return m};e.embed.config=function(l,v){var u=k.extend({},l);var s;if(c(u.playlist)){s=u.playlist;delete u.playlist}u=e.embed.deserialize(u);u.height=j(u.height);u.width=j(u.width);if(typeof u.plugins=="string"){var m=u.plugins.split(",");if(typeof u.plugins!="object"){u.plugins={}}for(var q=0;q<m.length;q++){var r=k.getPluginName(m[q]);if(typeof u[r]=="object"){u.plugins[m[q]]=u[r];delete u[r]}else{u.plugins[m[q]]={}}}}for(var t=0;t<g.length;t++){var p=g[t];if(k.exists(u[p])){if(typeof u[p]!="object"){if(!u.components[p]){u.components[p]={}}if(p=="logo"){u.components[p].file=u[p]}else{u.components[p].position=u[p]}delete u[p]}else{if(!u.components[p]){u.components[p]={}}k.extend(u.components[p],u[p]);delete u[p]}}if(typeof u[p+"size"]!="undefined"){if(!u.components[p]){u.components[p]={}}u.components[p].size=u[p+"size"];delete u[p+"size"]}}if(typeof u.icons!="undefined"){if(!u.components.display){u.components.display={}}u.components.display.icons=u.icons;delete u.icons}for(var o in a){if(u[o]){if(!u[a[o]]){u[a[o]]=u[o]}delete u[o]}}var n;if(u.flashplayer&&!u.modes){n=h(u.flashplayer);delete u.flashplayer}else{if(u.modes){if(typeof u.modes=="string"){n=h(u.modes)}else{if(u.modes instanceof Array){n=u.modes}else{if(typeof u.modes=="object"&&u.modes.type){n=[u.modes]}}}delete u.modes}else{n=h()}}u.modes=n;if(s){u.playlist=s}return u}})(jwplayer);(function(a){a.embed.download=function(c,g,b,d,f){this.embed=function(){var k=a.utils.extend({},b);var q={};var j=b.width?b.width:480;if(typeof j!="number"){j=parseInt(j,10)}var m=b.height?b.height:320;if(typeof m!="number"){m=parseInt(m,10)}var u,o,n;var s={};if(b.playlist&&b.playlist.length){s.file=b.playlist[0].file;o=b.playlist[0].image;s.levels=b.playlist[0].levels}else{s.file=b.file;o=b.image;s.levels=b.levels}if(s.file){u=s.file}else{if(s.levels&&s.levels.length){u=s.levels[0].file}}n=u?"pointer":"auto";var l={display:{style:{cursor:n,width:j,height:m,backgroundColor:"#000",position:"relative",textDecoration:"none",border:"none",display:"block"}},display_icon:{style:{cursor:n,position:"absolute",display:u?"block":"none",top:0,left:0,border:0,margin:0,padding:0,zIndex:3,width:50,height:50,backgroundImage:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg==)"}},display_iconBackground:{style:{cursor:n,position:"absolute",display:u?"block":"none",top:((m-50)/2),left:((j-50)/2),border:0,width:50,height:50,margin:0,padding:0,zIndex:2,backgroundImage:"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC)"}},display_image:{style:{width:j,height:m,display:o?"block":"none",position:"absolute",cursor:n,left:0,top:0,margin:0,padding:0,textDecoration:"none",zIndex:1,border:"none"}}};var h=function(v,x,y){var w=document.createElement(v);if(y){w.id=y}else{w.id=c.id+"_jwplayer_"+x}a.utils.css(w,l[x].style);return w};q.display=h("a","display",c.id);if(u){q.display.setAttribute("href",a.utils.getAbsolutePath(u))}q.display_image=h("img","display_image");q.display_image.setAttribute("alt","Click to download...");if(o){q.display_image.setAttribute("src",a.utils.getAbsolutePath(o))}if(true){q.display_icon=h("div","display_icon");q.display_iconBackground=h("div","display_iconBackground");q.display.appendChild(q.display_image);q.display_iconBackground.appendChild(q.display_icon);q.display.appendChild(q.display_iconBackground)}_css=a.utils.css;_hide=function(v){_css(v,{display:"none"})};function r(v){_imageWidth=q.display_image.naturalWidth;_imageHeight=q.display_image.naturalHeight;t()}function t(){a.utils.stretch(a.utils.stretching.UNIFORM,q.display_image,j,m,_imageWidth,_imageHeight)}q.display_image.onerror=function(v){_hide(q.display_image)};q.display_image.onload=r;c.parentNode.replaceChild(q.display,c);var p=(b.plugins&&b.plugins.logo)?b.plugins.logo:{};q.display.appendChild(new a.embed.logo(b.components.logo,"download",c.id));f.container=document.getElementById(f.id);f.setPlayer(q.display,"download")};this.supportsConfig=function(){if(b){var j=a.utils.getFirstPlaylistItemFromConfig(b);if(typeof j.file=="undefined"&&typeof j.levels=="undefined"){return true}else{if(j.file){return e(j.file,j.provider,j.playlistfile)}else{if(j.levels&&j.levels.length){for(var h=0;h<j.levels.length;h++){if(j.levels[h].file&&e(j.levels[h].file,j.provider,j.playlistfile)){return true}}}}}}else{return true}};function e(j,l,h){if(h){return false}var k=["image","sound","youtube","http"];if(l&&(k.toString().indexOf(l)>-1)){return true}if(!l||(l&&l=="video")){var m=a.utils.extension(j);if(m&&a.utils.extensionmap[m]){return true}}return false}}})(jwplayer);(function(a){a.embed.flash=function(f,g,l,e,j){function m(o,n,p){var q=document.createElement("param");q.setAttribute("name",n);q.setAttribute("value",p);o.appendChild(q)}function k(o,p,n){return function(q){if(n){document.getElementById(j.id+"_wrapper").appendChild(p)}var s=document.getElementById(j.id).getPluginConfig("display");o.resize(s.width,s.height);var r={left:s.x,top:s.y};a.utils.css(p,r)}}function d(p){if(!p){return{}}var r={};for(var o in p){var n=p[o];for(var q in n){r[o+"."+q]=n[q]}}return r}function h(q,p){if(q[p]){var s=q[p];for(var o in s){var n=s[o];if(typeof n=="string"){if(!q[o]){q[o]=n}}else{for(var r in n){if(!q[o+"."+r]){q[o+"."+r]=n[r]}}}}delete q[p]}}function b(q){if(!q){return{}}var t={},s=[];for(var n in q){var p=a.utils.getPluginName(n);var o=q[n];s.push(n);for(var r in o){t[p+"."+r]=o[r]}}t.plugins=s.join(",");return t}function c(p){var n=p.netstreambasepath?"":"netstreambasepath="+encodeURIComponent(window.location.href.split("#")[0])+"&";for(var o in p){if(typeof(p[o])=="object"){n+=o+"="+encodeURIComponent("[[JSON]]"+a.utils.strings.jsonToString(p[o]))+"&"}else{n+=o+"="+encodeURIComponent(p[o])+"&"}}return n.substring(0,n.length-1)}this.embed=function(){l.id=j.id;var A;var r=a.utils.extend({},l);var o=r.width;var y=r.height;if(f.id+"_wrapper"==f.parentNode.id){A=document.getElementById(f.id+"_wrapper")}else{A=document.createElement("div");A.id=f.id+"_wrapper";a.utils.wrap(f,A);a.utils.css(A,{position:"relative",width:o,height:y})}var p=e.setupPlugins(j,r,k);if(p.length>0){a.utils.extend(r,b(p.plugins))}else{delete r.plugins}var s=["height","width","modes","events"];for(var v=0;v<s.length;v++){delete r[s[v]]}var q="opaque";if(r.wmode){q=r.wmode}h(r,"components");h(r,"providers");if(typeof r["dock.position"]!="undefined"){if(r["dock.position"].toString().toLowerCase()=="false"){r.dock=r["dock.position"];delete r["dock.position"]}}var x=a.utils.getCookies();for(var n in x){if(typeof(r[n])=="undefined"){r[n]=x[n]}}var z="#000000";var u;if(a.utils.isIE()){var w='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" bgcolor="'+z+'" width="100%" height="100%" id="'+f.id+'" name="'+f.id+'" tabindex=0"">';w+='<param name="movie" value="'+g.src+'">';w+='<param name="allowfullscreen" value="true">';w+='<param name="allowscriptaccess" value="always">';w+='<param name="seamlesstabbing" value="true">';w+='<param name="wmode" value="'+q+'">';w+='<param name="flashvars" value="'+c(r)+'">';w+="</object>";a.utils.setOuterHTML(f,w);u=document.getElementById(f.id)}else{var t=document.createElement("object");t.setAttribute("type","application/x-shockwave-flash");t.setAttribute("data",g.src);t.setAttribute("width","100%");t.setAttribute("height","100%");t.setAttribute("bgcolor","#000000");t.setAttribute("id",f.id);t.setAttribute("name",f.id);t.setAttribute("tabindex",0);m(t,"allowfullscreen","true");m(t,"allowscriptaccess","always");m(t,"seamlesstabbing","true");m(t,"wmode",q);m(t,"flashvars",c(r));f.parentNode.replaceChild(t,f);u=t}j.container=u;j.setPlayer(u,"flash")};this.supportsConfig=function(){if(a.utils.hasFlash()){if(l){var o=a.utils.getFirstPlaylistItemFromConfig(l);if(typeof o.file=="undefined"&&typeof o.levels=="undefined"){return true}else{if(o.file){return flashCanPlay(o.file,o.provider)}else{if(o.levels&&o.levels.length){for(var n=0;n<o.levels.length;n++){if(o.levels[n].file&&flashCanPlay(o.levels[n].file,o.provider)){return true}}}}}}else{return true}}return false};flashCanPlay=function(n,p){var o=["video","http","sound","image"];if(p&&(o.toString().indexOf(p)<0)){return true}var q=a.utils.extension(n);if(!q){return true}if(a.utils.exists(a.utils.extensionmap[q])&&!a.utils.exists(a.utils.extensionmap[q].flash)){return false}return true}}})(jwplayer);(function(a){a.embed.html5=function(c,g,b,d,f){function e(j,k,h){return function(l){var m=document.getElementById(c.id+"_displayarea");if(h){m.appendChild(k)}j.resize(m.clientWidth,m.clientHeight);k.left=m.style.left;k.top=m.style.top}}this.embed=function(){if(a.html5){d.setupPlugins(f,b,e);c.innerHTML="";var j=a.utils.extend({screencolor:"0x000000"},b);var h=["plugins","modes","events"];for(var k=0;k<h.length;k++){delete j[h[k]]}if(j.levels&&!j.sources){j.sources=b.levels}if(j.skin&&j.skin.toLowerCase().indexOf(".zip")>0){j.skin=j.skin.replace(/\.zip/i,".xml")}var l=new (a.html5(c)).setup(j);f.container=document.getElementById(f.id);f.setPlayer(l,"html5")}else{return null}};this.supportsConfig=function(){if(!!a.vid.canPlayType){if(b){var j=a.utils.getFirstPlaylistItemFromConfig(b);if(typeof j.file=="undefined"&&typeof j.levels=="undefined"){return true}else{if(j.file){return html5CanPlay(a.vid,j.file,j.provider,j.playlistfile)}else{if(j.levels&&j.levels.length){for(var h=0;h<j.levels.length;h++){if(j.levels[h].file&&html5CanPlay(a.vid,j.levels[h].file,j.provider,j.playlistfile)){return true}}}}}}else{return true}}return false};html5CanPlay=function(k,j,l,h){if(h){return false}if(l&&l=="youtube"){return true}if(l&&l!="video"&&l!="http"&&l!="sound"){return false}if(navigator.userAgent.match(/BlackBerry/i)!==null){return false}var m=a.utils.extension(j);if(!a.utils.exists(m)||!a.utils.exists(a.utils.extensionmap[m])){return true}if(!a.utils.exists(a.utils.extensionmap[m].html5)){return false}if(a.utils.isLegacyAndroid()&&m.match(/m4v|mp4/)){return true}return browserCanPlay(k,a.utils.extensionmap[m].html5)};browserCanPlay=function(j,h){if(!h){return true}if(j.canPlayType(h)){return true}else{if(h=="audio/mp3"&&navigator.userAgent.match(/safari/i)){return j.canPlayType("audio/mpeg")}else{return false}}}}})(jwplayer);(function(a){a.embed.logo=function(m,l,d){var j={prefix:"http://l.longtailvideo.com/"+l+"/",file:"",link:"",linktarget:"_top",margin:8,out:0.5,over:1,timeout:5,hide:false,position:"bottom-left"};_css=a.utils.css;var b;var h;k();function k(){o();c();f()}function o(){if(j.prefix){var q=a.version.split(/\W/).splice(0,2).join("/");if(j.prefix.indexOf(q)<0){j.prefix+=q+"/"}}h=a.utils.extend({},j,m)}function p(){var s={border:"none",textDecoration:"none",position:"absolute",cursor:"pointer",zIndex:10};s.display=h.hide?"none":"block";var r=h.position.toLowerCase().split("-");for(var q in r){s[r[q]]=h.margin}return s}function c(){b=document.createElement("img");b.id=d+"_jwplayer_logo";b.style.display="none";b.onload=function(q){_css(b,p());e()};if(!h.file){return}if(h.file.indexOf("http://")===0){b.src=h.file}else{b.src=h.prefix+h.file}}if(!h.file){return}function f(){if(h.link){b.onmouseover=g;b.onmouseout=e;b.onclick=n}else{this.mouseEnabled=false}}function n(q){if(typeof q!="undefined"){q.preventDefault();q.stopPropagation()}if(h.link){window.open(h.link,h.linktarget)}return}function e(q){if(h.link){b.style.opacity=h.out}return}function g(q){if(h.hide){b.style.opacity=h.over}return}return b}})(jwplayer);(function(a){a.html5=function(b){var c=b;this.setup=function(d){a.utils.extend(this,new a.html5.api(c,d));return this};return this}})(jwplayer);(function(a){var c=a.utils;var b=c.css;a.html5.view=function(l,D,g){var k=l;var v=D;var h=g;var M;var f;var q;var m;var B;var L;var K;var A=false;var u=false;var x,J;var e,N,r;function H(){M=document.createElement("div");M.id=v.id;M.className=v.className;_videowrapper=document.createElement("div");_videowrapper.id=M.id+"_video_wrapper";v.id=M.id+"_video";b(M,{position:"relative",height:h.height,width:h.width,padding:0,backgroundColor:P(),zIndex:0});function P(){if(k.skin.getComponentSettings("display")&&k.skin.getComponentSettings("display").backgroundcolor){return k.skin.getComponentSettings("display").backgroundcolor}return parseInt("000000",16)}b(v,{width:"100%",height:"100%",top:0,left:0,zIndex:1,margin:"auto",display:"block"});b(_videowrapper,{overflow:"hidden",position:"absolute",top:0,left:0,bottom:0,right:0});c.wrap(v,M);c.wrap(v,_videowrapper);m=document.createElement("div");m.id=M.id+"_displayarea";M.appendChild(m);_instreamArea=document.createElement("div");_instreamArea.id=M.id+"_instreamarea";b(_instreamArea,{overflow:"hidden",position:"absolute",top:0,left:0,bottom:0,right:0,zIndex:100,background:"000000",display:"none"});M.appendChild(_instreamArea)}function G(){for(var P=0;P<h.plugins.order.length;P++){var Q=h.plugins.order[P];if(c.exists(h.plugins.object[Q].getDisplayElement)){h.plugins.object[Q].height=c.parseDimension(h.plugins.object[Q].getDisplayElement().style.height);h.plugins.object[Q].width=c.parseDimension(h.plugins.object[Q].getDisplayElement().style.width);h.plugins.config[Q].currentPosition=h.plugins.config[Q].position}}s()}function p(P){u=h.fullscreen}function n(P){if(N){return}if(h.getMedia()&&h.getMedia().hasChrome()){m.style.display="none"}else{switch(P.newstate){case P.newstate==a.api.events.state.PLAYING:m.style.display="none";break;default:m.style.display="block";break}}j()}function s(Q){var S=h.getMedia()?h.getMedia().getDisplayElement():null;if(c.exists(S)){if(K!=S){if(K&&K.parentNode){K.parentNode.replaceChild(S,K)}K=S}for(var P=0;P<h.plugins.order.length;P++){var R=h.plugins.order[P];if(c.exists(h.plugins.object[R].getDisplayElement)){h.plugins.config[R].currentPosition=h.plugins.config[R].position}}}C(h.width,h.height)}this.setup=function(){if(h&&h.getMedia()){v=h.getMedia().getDisplayElement()}H();G();k.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,n);k.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_LOADED,s);k.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_BEFOREPLAY,p);k.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_META,function(Q){j()});var P;if(c.exists(window.onresize)){P=window.onresize}window.onresize=function(Q){if(c.exists(P)){try{P(Q)}catch(S){}}if(k.jwGetFullscreen()){if(!y()){var R=c.getBoundingClientRect(document.body);h.width=Math.abs(R.left)+Math.abs(R.right);h.height=window.innerHeight;C(h.width,h.height)}}else{C(h.width,h.height)}}};function I(P){switch(P.keyCode){case 27:if(k.jwGetFullscreen()){k.jwSetFullscreen(false)}break;case 32:if(k.jwGetState()!=a.api.events.state.IDLE&&k.jwGetState()!=a.api.events.state.PAUSED){k.jwPause()}else{k.jwPlay()}break}}function C(P,Y){if(M.style.display=="none"){return}var S=[].concat(h.plugins.order);S.reverse();B=S.length+2;if(u&&y()){try{if(h.fullscreen&&!h.getMedia().getDisplayElement().webkitDisplayingFullscreen){h.fullscreen=false}}catch(V){}}if(!h.fullscreen){f=P;q=Y;if(typeof P=="string"&&P.indexOf("%")>0){f=c.getElementWidth(c.parentNode(M))*parseInt(P.replace("%"),"")/100}else{f=P}if(typeof Y=="string"&&Y.indexOf("%")>0){q=c.getElementHeight(c.parentNode(M))*parseInt(Y.replace("%"),"")/100}else{q=Y}var T={top:0,bottom:0,left:0,right:0,width:f,height:q,position:"absolute"};b(m,T);var Z={};var W;try{W=h.plugins.object.display.getDisplayElement()}catch(V){}if(W){Z.width=c.parseDimension(W.style.width);Z.height=c.parseDimension(W.style.height)}var X=c.extend({},T,Z,{zIndex:_instreamArea.style.zIndex,display:_instreamArea.style.display});b(_instreamArea,X);b(M,{height:q,width:f});var U=t(E,S);if(U.length>0){B+=U.length;var R=U.indexOf("playlist"),Q=U.indexOf("controlbar");if(R>=0&&Q>=0){U[R]=U.splice(Q,1,U[R])[0]}t(o,U,true)}x=c.getElementWidth(m);J=c.getElementHeight(m)}else{if(!y()){t(d,S,true)}}j()}function t(W,S,T){var U=[];for(var R=0;R<S.length;R++){var V=S[R];if(c.exists(h.plugins.object[V].getDisplayElement)){if(h.plugins.config[V].currentPosition!=a.html5.view.positions.NONE){var P=W(V,B--);if(!P){U.push(V)}else{var Q=P.width;var X=P.height;if(T){delete P.width;delete P.height}b(h.plugins.object[V].getDisplayElement(),P);h.plugins.object[V].resize(Q,X)}}else{b(h.plugins.object[V].getDisplayElement(),{display:"none"})}}}return U}function E(Q,R){if(c.exists(h.plugins.object[Q].getDisplayElement)){if(h.plugins.config[Q].position&&O(h.plugins.config[Q].position)){if(!c.exists(h.plugins.object[Q].getDisplayElement().parentNode)){M.appendChild(h.plugins.object[Q].getDisplayElement())}var P=w(Q);P.zIndex=R;return P}}return false}function o(P,Q){if(!c.exists(h.plugins.object[P].getDisplayElement().parentNode)){m.appendChild(h.plugins.object[P].getDisplayElement())}return{position:"absolute",width:(c.getElementWidth(m)-c.parseDimension(m.style.right)),height:(c.getElementHeight(m)-c.parseDimension(m.style.bottom)),zIndex:Q}}function d(P,Q){return{position:"fixed",width:h.width,height:h.height,zIndex:Q}}var j=this.resizeMedia=function(){m.style.position="absolute";var R=h.getMedia()?h.getMedia().getDisplayElement():r;if(!R){return}if(R&&R.tagName.toLowerCase()=="video"){if(!R.videoWidth||!R.videoHeight){R.style.width=m.style.width;R.style.height=m.style.height;return}R.style.position="absolute";c.fadeTo(R,1,0.25);if(R.parentNode){R.parentNode.style.left=m.style.left;R.parentNode.style.top=m.style.top}if(h.fullscreen&&k.jwGetStretching()==a.utils.stretching.EXACTFIT&&!c.isMobile()){var P=document.createElement("div");c.stretch(a.utils.stretching.UNIFORM,P,c.getElementWidth(m),c.getElementHeight(m),x,J);c.stretch(a.utils.stretching.EXACTFIT,R,c.parseDimension(P.style.width),c.parseDimension(P.style.height),R.videoWidth?R.videoWidth:400,R.videoHeight?R.videoHeight:300);b(R,{left:P.style.left,top:P.style.top})}else{c.stretch(k.jwGetStretching(),R,c.getElementWidth(m),c.getElementHeight(m),R.videoWidth?R.videoWidth:400,R.videoHeight?R.videoHeight:300)}}else{var Q=h.plugins.object.display.getDisplayElement();if(Q){h.getMedia().resize(c.parseDimension(Q.style.width),c.parseDimension(Q.style.height))}else{h.getMedia().resize(c.parseDimension(m.style.width),c.parseDimension(m.style.height))}}};var w=this.getComponentPosition=function(Q){var R={position:"absolute",margin:0,padding:0,top:null};var P=h.plugins.config[Q].currentPosition.toLowerCase();switch(P.toUpperCase()){case a.html5.view.positions.TOP:R.top=c.parseDimension(m.style.top);R.left=c.parseDimension(m.style.left);R.width=c.getElementWidth(m)-c.parseDimension(m.style.left)-c.parseDimension(m.style.right);R.height=h.plugins.object[Q].height;m.style[P]=c.parseDimension(m.style[P])+h.plugins.object[Q].height+"px";m.style.height=c.getElementHeight(m)-R.height+"px";break;case a.html5.view.positions.RIGHT:R.top=c.parseDimension(m.style.top);R.right=c.parseDimension(m.style.right);R.width=h.plugins.object[Q].width;R.height=c.getElementHeight(m)-c.parseDimension(m.style.top)-c.parseDimension(m.style.bottom);m.style.width=c.getElementWidth(m)-R.width+"px";break;case a.html5.view.positions.BOTTOM:R.bottom=c.parseDimension(m.style.bottom);R.left=c.parseDimension(m.style.left);R.width=c.getElementWidth(m)-c.parseDimension(m.style.left)-c.parseDimension(m.style.right);R.height=h.plugins.object[Q].height;m.style.height=c.getElementHeight(m)-R.height+"px";break;case a.html5.view.positions.LEFT:R.top=c.parseDimension(m.style.top);R.left=c.parseDimension(m.style.left);R.width=h.plugins.object[Q].width;R.height=c.getElementHeight(m)-c.parseDimension(m.style.top)-c.parseDimension(m.style.bottom);m.style[P]=c.parseDimension(m.style[P])+h.plugins.object[Q].width+"px";m.style.width=c.getElementWidth(m)-R.width+"px";break;default:break}return R};this.resize=C;var F;this.fullscreen=function(S){var U;try{U=h.getMedia().getDisplayElement()}catch(T){}if(y()&&U&&U.webkitSupportsFullscreen){if(S&&!U.webkitDisplayingFullscreen){try{c.transform(U);F=m.style.display;m.style.display="none";U.webkitEnterFullscreen()}catch(R){}}else{if(!S){j();if(U.webkitDisplayingFullscreen){try{U.webkitExitFullscreen()}catch(R){}}m.style.display=F}}A=false}else{if(S){document.onkeydown=I;clearInterval(L);var Q=c.getBoundingClientRect(document.body);h.width=Math.abs(Q.left)+Math.abs(Q.right);h.height=window.innerHeight;var P={position:"fixed",width:"100%",height:"100%",top:0,left:0,zIndex:2147483000};b(M,P);P.zIndex=1;if(h.getMedia()&&h.getMedia().getDisplayElement()){b(h.getMedia().getDisplayElement(),P)}P.zIndex=2;b(m,P);A=true}else{document.onkeydown="";h.width=f;h.height=q;b(M,{position:"relative",height:h.height,width:h.width,zIndex:0});A=false}C(h.width,h.height)}};function O(P){return([a.html5.view.positions.TOP,a.html5.view.positions.RIGHT,a.html5.view.positions.BOTTOM,a.html5.view.positions.LEFT].toString().indexOf(P.toUpperCase())>-1)}function y(){if(k.jwGetState()!=a.api.events.state.IDLE&&!A&&(h.getMedia()&&h.getMedia().getDisplayElement()&&h.getMedia().getDisplayElement().webkitSupportsFullscreen)&&c.useNativeFullscreen()){return true}return false}this.setupInstream=function(P,Q){c.css(_instreamArea,{display:"block",position:"absolute"});m.style.display="none";_instreamArea.appendChild(P);r=Q;N=true};var z=this.destroyInstream=function(){_instreamArea.style.display="none";_instreamArea.innerHTML="";m.style.display="block";r=null;N=false;C(h.width,h.height)}};a.html5.view.positions={TOP:"TOP",RIGHT:"RIGHT",BOTTOM:"BOTTOM",LEFT:"LEFT",OVER:"OVER",NONE:"NONE"}})(jwplayer);(function(a){var b={backgroundcolor:"",margin:10,font:"Arial,sans-serif",fontsize:10,fontcolor:parseInt("000000",16),fontstyle:"normal",fontweight:"bold",buttoncolor:parseInt("ffffff",16),position:a.html5.view.positions.BOTTOM,idlehide:false,hideplaylistcontrols:false,forcenextprev:false,layout:{left:{position:"left",elements:[{name:"play",type:"button"},{name:"divider",type:"divider"},{name:"prev",type:"button"},{name:"divider",type:"divider"},{name:"next",type:"button"},{name:"divider",type:"divider"},{name:"elapsed",type:"text"}]},center:{position:"center",elements:[{name:"time",type:"slider"}]},right:{position:"right",elements:[{name:"duration",type:"text"},{name:"blank",type:"button"},{name:"divider",type:"divider"},{name:"mute",type:"button"},{name:"volume",type:"slider"},{name:"divider",type:"divider"},{name:"fullscreen",type:"button"}]}}};_utils=a.utils;_css=_utils.css;_hide=function(c){_css(c,{display:"none"})};_show=function(c){_css(c,{display:"block"})};a.html5.controlbar=function(m,X){window.controlbar=this;var l=m;var D=_utils.extend({},b,l.skin.getComponentSettings("controlbar"),X);if(D.position==a.html5.view.positions.NONE||typeof a.html5.view.positions[D.position]=="undefined"){return}if(_utils.mapLength(l.skin.getComponentLayout("controlbar"))>0){D.layout=l.skin.getComponentLayout("controlbar")}var af;var Q;var ae;var E;var w="none";var h;var k;var ag;var g;var f;var z;var R={};var q=false;var c={};var ab;var j=false;var p;var d;var U=false;var G=false;var H;var Z=new a.html5.eventdispatcher();_utils.extend(this,Z);function K(){if(!ab){ab=l.skin.getSkinElement("controlbar","background");if(!ab){ab={width:0,height:0,src:null}}}return ab}function O(){ae=0;E=0;Q=0;if(!q){var ao={height:K().height,backgroundColor:D.backgroundcolor};af=document.createElement("div");af.id=l.id+"_jwplayer_controlbar";_css(af,ao)}var an=(l.skin.getSkinElement("controlbar","capLeft"));var am=(l.skin.getSkinElement("controlbar","capRight"));if(an){y("capLeft","left",false,af)}ac("background",af,{position:"absolute",height:K().height,left:(an?an.width:0),zIndex:0},"img");if(K().src){R.background.src=K().src}ac("elements",af,{position:"relative",height:K().height,zIndex:1});if(am){y("capRight","right",false,af)}}this.getDisplayElement=function(){return af};this.resize=function(ao,am){S();_utils.cancelAnimation(af);f=ao;z=am;if(G!=l.jwGetFullscreen()){G=l.jwGetFullscreen();if(!G){Y()}d=undefined}var an=x();J({id:l.id,duration:ag,position:k});v({id:l.id,bufferPercent:g});return an};this.show=function(){if(j){j=false;_show(af);V()}};this.hide=function(){if(!j){j=true;_hide(af);ad()}};function r(){var an=["timeSlider","volumeSlider","timeSliderRail","volumeSliderRail"];for(var ao in an){var am=an[ao];if(typeof R[am]!="undefined"){c[am]=_utils.getBoundingClientRect(R[am])}}}var e;function Y(am){if(j){return}clearTimeout(p);if(D.position==a.html5.view.positions.OVER||l.jwGetFullscreen()){switch(l.jwGetState()){case a.api.events.state.PAUSED:case a.api.events.state.IDLE:if(af&&af.style.opacity<1&&(!D.idlehide||_utils.exists(am))){e=false;setTimeout(function(){if(!e){W()}},100)}if(D.idlehide){p=setTimeout(function(){A()},2000)}break;default:e=true;if(am){W()}p=setTimeout(function(){A()},2000);break}}else{W()}}function A(){if(!j){ad();if(af.style.opacity==1){_utils.cancelAnimation(af);_utils.fadeTo(af,0,0.1,1,0)}}}function W(){if(!j){V();if(af.style.opacity==0){_utils.cancelAnimation(af);_utils.fadeTo(af,1,0.1,0,0)}}}function I(am){return function(){if(U&&d!=am){d=am;Z.sendEvent(am,{component:"controlbar",boundingRect:P()})}}}var V=I(a.api.events.JWPLAYER_COMPONENT_SHOW);var ad=I(a.api.events.JWPLAYER_COMPONENT_HIDE);function P(){if(D.position==a.html5.view.positions.OVER||l.jwGetFullscreen()){return _utils.getDimensions(af)}else{return{x:0,y:0,width:0,height:0}}}function ac(aq,ap,ao,am){var an;if(!q){if(!am){am="div"}an=document.createElement(am);R[aq]=an;an.id=af.id+"_"+aq;ap.appendChild(an)}else{an=document.getElementById(af.id+"_"+aq)}if(_utils.exists(ao)){_css(an,ao)}return an}function N(){if(l.jwGetHeight()<=40){D.layout=_utils.clone(D.layout);for(var am=0;am<D.layout.left.elements.length;am++){if(D.layout.left.elements[am].name=="fullscreen"){D.layout.left.elements.splice(am,1)}}for(am=0;am<D.layout.right.elements.length;am++){if(D.layout.right.elements[am].name=="fullscreen"){D.layout.right.elements.splice(am,1)}}o()}al(D.layout.left);al(D.layout.center);al(D.layout.right)}function al(ap,am){var aq=ap.position=="right"?"right":"left";var ao=_utils.extend([],ap.elements);if(_utils.exists(am)){ao.reverse()}var ap=ac(ap.position+"Group",R.elements,{"float":"left",styleFloat:"left",cssFloat:"left",height:"100%"});for(var an=0;an<ao.length;an++){C(ao[an],aq,ap)}}function L(){return Q++}function C(aq,at,av){var ap,an,ao,am,aw;if(!av){av=R.elements}if(aq.type=="divider"){y("divider"+L(),at,true,av,undefined,aq.width,aq.element);return}switch(aq.name){case"play":y("playButton",at,false,av);y("pauseButton",at,true,av);T("playButton","jwPlay");T("pauseButton","jwPause");break;case"prev":y("prevButton",at,true,av);T("prevButton","jwPlaylistPrev");break;case"stop":y("stopButton",at,true,av);T("stopButton","jwStop");break;case"next":y("nextButton",at,true,av);T("nextButton","jwPlaylistNext");break;case"elapsed":y("elapsedText",at,true,av,null,null,l.skin.getSkinElement("controlbar","elapsedBackground"));break;case"time":an=!_utils.exists(l.skin.getSkinElement("controlbar","timeSliderCapLeft"))?0:l.skin.getSkinElement("controlbar","timeSliderCapLeft").width;ao=!_utils.exists(l.skin.getSkinElement("controlbar","timeSliderCapRight"))?0:l.skin.getSkinElement("controlbar","timeSliderCapRight").width;ap=at=="left"?an:ao;aw={height:K().height,position:"relative","float":"left",styleFloat:"left",cssFloat:"left"};var ar=ac("timeSlider",av,aw);y("timeSliderCapLeft",at,true,ar,"relative");y("timeSliderRail",at,false,ar,"relative");y("timeSliderBuffer",at,false,ar,"absolute");y("timeSliderProgress",at,false,ar,"absolute");y("timeSliderThumb",at,false,ar,"absolute");y("timeSliderCapRight",at,true,ar,"relative");aa("time");break;case"fullscreen":y("fullscreenButton",at,false,av);y("normalscreenButton",at,true,av);T("fullscreenButton","jwSetFullscreen",true);T("normalscreenButton","jwSetFullscreen",false);break;case"volume":an=!_utils.exists(l.skin.getSkinElement("controlbar","volumeSliderCapLeft"))?0:l.skin.getSkinElement("controlbar","volumeSliderCapLeft").width;ao=!_utils.exists(l.skin.getSkinElement("controlbar","volumeSliderCapRight"))?0:l.skin.getSkinElement("controlbar","volumeSliderCapRight").width;ap=at=="left"?an:ao;am=l.skin.getSkinElement("controlbar","volumeSliderRail").width+an+ao;aw={height:K().height,position:"relative",width:am,"float":"left",styleFloat:"left",cssFloat:"left"};var au=ac("volumeSlider",av,aw);y("volumeSliderCapLeft",at,false,au,"relative");y("volumeSliderRail",at,false,au,"relative");y("volumeSliderProgress",at,false,au,"absolute");y("volumeSliderThumb",at,false,au,"absolute");y("volumeSliderCapRight",at,false,au,"relative");aa("volume");break;case"mute":y("muteButton",at,false,av);y("unmuteButton",at,true,av);T("muteButton","jwSetMute",true);T("unmuteButton","jwSetMute",false);break;case"duration":y("durationText",at,true,av,null,null,l.skin.getSkinElement("controlbar","durationBackground"));break}}function y(ap,at,an,aw,aq,am,ao){if(_utils.exists(l.skin.getSkinElement("controlbar",ap))||ap.indexOf("Text")>0||ap.indexOf("divider")===0){var ar={height:"100%",position:aq?aq:"relative",display:"block","float":"left",styleFloat:"left",cssFloat:"left"};if((ap.indexOf("next")===0||ap.indexOf("prev")===0)&&(l.jwGetPlaylist().length<2||D.hideplaylistcontrols.toString()=="true")){if(D.forcenextprev.toString()!="true"){an=false;ar.display="none"}}var ax;if(ap.indexOf("Text")>0){ap.innerhtml="00:00";ar.font=D.fontsize+"px/"+(K().height+1)+"px "+D.font;ar.color=D.fontcolor;ar.textAlign="center";ar.fontWeight=D.fontweight;ar.fontStyle=D.fontstyle;ar.cursor="default";if(ao){ar.background="url("+ao.src+") no-repeat center";ar.backgroundSize="100% "+K().height+"px"}ar.padding="0 5px"}else{if(ap.indexOf("divider")===0){if(am){if(!isNaN(parseInt(am))){ax=parseInt(am)}}else{if(ao){var au=l.skin.getSkinElement("controlbar",ao);if(au){ar.background="url("+au.src+") repeat-x center left";ax=au.width}}else{ar.background="url("+l.skin.getSkinElement("controlbar","divider").src+") repeat-x center left";ax=l.skin.getSkinElement("controlbar","divider").width}}}else{ar.background="url("+l.skin.getSkinElement("controlbar",ap).src+") repeat-x center left";ax=l.skin.getSkinElement("controlbar",ap).width}}if(at=="left"){if(an){ae+=ax}}else{if(at=="right"){if(an){E+=ax}}}if(_utils.typeOf(aw)=="undefined"){aw=R.elements}ar.width=ax;if(q){_css(R[ap],ar)}else{var av=ac(ap,aw,ar);if(_utils.exists(l.skin.getSkinElement("controlbar",ap+"Over"))){av.onmouseover=function(ay){av.style.backgroundImage=["url(",l.skin.getSkinElement("controlbar",ap+"Over").src,")"].join("")};av.onmouseout=function(ay){av.style.backgroundImage=["url(",l.skin.getSkinElement("controlbar",ap).src,")"].join("")}}if(ap.indexOf("divider")==0){av.setAttribute("class","divider")}av.innerHTML="&nbsp;"}}}function F(){l.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,B);l.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_ITEM,t);l.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_BUFFER,v);l.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,s);l.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_TIME,J);l.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_MUTE,ak);l.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_VOLUME,n);l.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_COMPLETE,M)}function B(){if(!D.hideplaylistcontrols){if(l.jwGetPlaylist().length>1||D.forcenextprev.toString()=="true"){_show(R.nextButton);_show(R.prevButton)}else{_hide(R.nextButton);_hide(R.prevButton)}x();ah()}}function t(am){ag=l.jwGetPlaylist()[am.index].duration;J({id:l.id,duration:ag,position:0});v({id:l.id,bufferProgress:0})}function ah(){J({id:l.id,duration:l.jwGetDuration(),position:0});v({id:l.id,bufferProgress:0});ak({id:l.id,mute:l.jwGetMute()});s({id:l.id,newstate:a.api.events.state.IDLE});n({id:l.id,volume:l.jwGetVolume()})}function T(ao,ap,an){if(q){return}if(_utils.exists(l.skin.getSkinElement("controlbar",ao))){var am=R[ao];if(_utils.exists(am)){_css(am,{cursor:"pointer"});if(ap=="fullscreen"){am.onmouseup=function(aq){aq.stopPropagation();l.jwSetFullscreen(!l.jwGetFullscreen())}}else{am.onmouseup=function(aq){aq.stopPropagation();if(_utils.exists(an)){l[ap](an)}else{l[ap]()}}}}}}function aa(am){if(q){return}var an=R[am+"Slider"];_css(R.elements,{cursor:"pointer"});_css(an,{cursor:"pointer"});an.onmousedown=function(ao){w=am};an.onmouseup=function(ao){ao.stopPropagation();aj(ao.pageX)};an.onmousemove=function(ao){if(w=="time"){h=true;var ap=ao.pageX-c[am+"Slider"].left-window.pageXOffset;_css(R[w+"SliderThumb"],{left:ap})}}}function aj(an){h=false;var am;if(w=="time"){am=an-c.timeSliderRail.left+window.pageXOffset;var ap=am/c.timeSliderRail.width*ag;if(ap<0){ap=0}else{if(ap>ag){ap=ag-3}}if(l.jwGetState()==a.api.events.state.PAUSED||l.jwGetState()==a.api.events.state.IDLE){l.jwPlay()}l.jwSeek(ap)}else{if(w=="volume"){am=an-c.volumeSliderRail.left-window.pageXOffset;var ao=Math.round(am/c.volumeSliderRail.width*100);if(ao<10){ao=0}else{if(ao>100){ao=100}}if(l.jwGetMute()){l.jwSetMute(false)}l.jwSetVolume(ao)}}w="none"}function v(an){if(_utils.exists(an.bufferPercent)){g=an.bufferPercent}if(c.timeSliderRail){var ap=l.skin.getSkinElement("controlbar","timeSliderCapLeft");var ao=c.timeSliderRail.width;var am=isNaN(Math.round(ao*g/100))?0:Math.round(ao*g/100);_css(R.timeSliderBuffer,{width:am,left:ap?ap.width:0})}}function ak(am){if(am.mute){_hide(R.muteButton);_show(R.unmuteButton);_hide(R.volumeSliderProgress)}else{_show(R.muteButton);_hide(R.unmuteButton);_show(R.volumeSliderProgress)}}function s(am){if(am.newstate==a.api.events.state.BUFFERING||am.newstate==a.api.events.state.PLAYING){_show(R.pauseButton);_hide(R.playButton)}else{_hide(R.pauseButton);_show(R.playButton)}Y();if(am.newstate==a.api.events.state.IDLE){_hide(R.timeSliderBuffer);_hide(R.timeSliderProgress);_hide(R.timeSliderThumb);J({id:l.id,duration:l.jwGetDuration(),position:0})}else{_show(R.timeSliderBuffer);if(am.newstate!=a.api.events.state.BUFFERING){_show(R.timeSliderProgress);_show(R.timeSliderThumb)}}}function M(am){v({bufferPercent:0});J(_utils.extend(am,{position:0,duration:ag}))}function J(aq){if(_utils.exists(aq.position)){k=aq.position}var am=false;if(_utils.exists(aq.duration)&&aq.duration!=ag){ag=aq.duration;am=true}var ao=(k===ag===0)?0:k/ag;var at=c.timeSliderRail;if(at){var an=isNaN(Math.round(at.width*ao))?0:Math.round(at.width*ao);var ar=l.skin.getSkinElement("controlbar","timeSliderCapLeft");var ap=an+(ar?ar.width:0);if(R.timeSliderProgress){_css(R.timeSliderProgress,{width:an,left:ar?ar.width:0});if(!h){if(R.timeSliderThumb){R.timeSliderThumb.style.left=ap+"px"}}}}if(R.durationText){R.durationText.innerHTML=_utils.timeFormat(ag)}if(R.elapsedText){R.elapsedText.innerHTML=_utils.timeFormat(k)}if(am){x()}}function o(){var am=R.elements.childNodes;var ar,ap;for(var ao=0;ao<am.length;ao++){var aq=am[ao].childNodes;for(var an in aq){if(isNaN(parseInt(an,10))){continue}if(aq[an].id.indexOf(af.id+"_divider")===0&&ap&&ap.id.indexOf(af.id+"_divider")===0&&aq[an].style.backgroundImage==ap.style.backgroundImage){aq[an].style.display="none"}else{if(aq[an].id.indexOf(af.id+"_divider")===0&&ar&&ar.style.display!="none"){aq[an].style.display="block"}}if(aq[an].style.display!="none"){ap=aq[an]}ar=aq[an]}}}function ai(){if(l.jwGetFullscreen()){_show(R.normalscreenButton);_hide(R.fullscreenButton)}else{_hide(R.normalscreenButton);_show(R.fullscreenButton)}if(l.jwGetState()==a.api.events.state.BUFFERING||l.jwGetState()==a.api.events.state.PLAYING){_show(R.pauseButton);_hide(R.playButton)}else{_hide(R.pauseButton);_show(R.playButton)}if(l.jwGetMute()==true){_hide(R.muteButton);_show(R.unmuteButton);_hide(R.volumeSliderProgress)}else{_show(R.muteButton);_hide(R.unmuteButton);_show(R.volumeSliderProgress)}}function x(){o();ai();var ao={width:f};var aw={"float":"left",styleFloat:"left",cssFloat:"left"};if(D.position==a.html5.view.positions.OVER||l.jwGetFullscreen()){ao.left=D.margin;ao.width-=2*D.margin;ao.top=z-K().height-D.margin;ao.height=K().height}var aq=l.skin.getSkinElement("controlbar","capLeft");var au=l.skin.getSkinElement("controlbar","capRight");aw.width=ao.width-(aq?aq.width:0)-(au?au.width:0);var ap=_utils.getBoundingClientRect(R.leftGroup).width;var at=_utils.getBoundingClientRect(R.rightGroup).width;var ar=aw.width-ap-at-1;var an=ar;var am=l.skin.getSkinElement("controlbar","timeSliderCapLeft");var av=l.skin.getSkinElement("controlbar","timeSliderCapRight");if(_utils.exists(am)){an-=am.width}if(_utils.exists(av)){an-=av.width}R.timeSlider.style.width=ar+"px";R.timeSliderRail.style.width=an+"px";_css(af,ao);_css(R.elements,aw);_css(R.background,aw);r();return ao}function n(ar){if(_utils.exists(R.volumeSliderRail)){var ao=isNaN(ar.volume/100)?1:ar.volume/100;var ap=_utils.parseDimension(R.volumeSliderRail.style.width);var am=isNaN(Math.round(ap*ao))?0:Math.round(ap*ao);var at=_utils.parseDimension(R.volumeSliderRail.style.right);var an=(!_utils.exists(l.skin.getSkinElement("controlbar","volumeSliderCapLeft")))?0:l.skin.getSkinElement("controlbar","volumeSliderCapLeft").width;_css(R.volumeSliderProgress,{width:am,left:an});if(R.volumeSliderThumb){var aq=(am-Math.round(_utils.parseDimension(R.volumeSliderThumb.style.width)/2));aq=Math.min(Math.max(aq,0),ap-_utils.parseDimension(R.volumeSliderThumb.style.width));_css(R.volumeSliderThumb,{left:aq})}if(_utils.exists(R.volumeSliderCapLeft)){_css(R.volumeSliderCapLeft,{left:0})}}}function S(){try{var an=(l.id.indexOf("_instream")>0?l.id.replace("_instream",""):l.id);H=document.getElementById(an);H.addEventListener("mousemove",Y)}catch(am){_utils.log("Could not add mouse listeners to controlbar: "+am)}}function u(){O();N();r();q=true;F();D.idlehide=(D.idlehide.toString().toLowerCase()=="true");if(D.position==a.html5.view.positions.OVER&&D.idlehide){af.style.opacity=0;U=true}else{af.style.opacity=1;setTimeout((function(){U=true;V()}),1)}S();ah()}u();return this}})(jwplayer);(function(b){var a=["width","height","state","playlist","item","position","buffer","duration","volume","mute","fullscreen"];var c=b.utils;b.html5.controller=function(o,K,f,h){var n=o,m=f,j=h,y=K,M=true,G=-1,A=false,d=false,P,C=[],q=false;var D=(c.exists(m.config.debug)&&(m.config.debug.toString().toLowerCase()=="console")),N=new b.html5.eventdispatcher(y.id,D);c.extend(this,N);function L(T){if(q){N.sendEvent(T.type,T)}else{C.push(T)}}function s(T){if(!q){q=true;N.sendEvent(b.api.events.JWPLAYER_READY,T);if(b.utils.exists(window.playerReady)){playerReady(T)}if(b.utils.exists(window[f.config.playerReady])){window[f.config.playerReady](T)}while(C.length>0){var V=C.shift();N.sendEvent(V.type,V)}if(f.config.autostart&&!b.utils.isIOS()){O()}while(x.length>0){var U=x.shift();B(U.method,U.arguments)}}}m.addGlobalListener(L);m.addEventListener(b.api.events.JWPLAYER_MEDIA_BUFFER_FULL,function(){m.getMedia().play()});m.addEventListener(b.api.events.JWPLAYER_MEDIA_TIME,function(T){if(T.position>=m.playlist[m.item].start&&G>=0){m.playlist[m.item].start=G;G=-1}});m.addEventListener(b.api.events.JWPLAYER_MEDIA_COMPLETE,function(T){setTimeout(E,25)});m.addEventListener(b.api.events.JWPLAYER_PLAYLIST_LOADED,O);m.addEventListener(b.api.events.JWPLAYER_FULLSCREEN,p);function F(){try{P=F;if(!A){A=true;N.sendEvent(b.api.events.JWPLAYER_MEDIA_BEFOREPLAY);A=false;if(d){d=false;P=null;return}}v(m.item);if(m.playlist[m.item].levels[0].file.length>0){if(M||m.state==b.api.events.state.IDLE){m.getMedia().load(m.playlist[m.item]);M=false}else{if(m.state==b.api.events.state.PAUSED){m.getMedia().play()}}}return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T);P=null}return false}function e(){try{if(m.playlist[m.item].levels[0].file.length>0){switch(m.state){case b.api.events.state.PLAYING:case b.api.events.state.BUFFERING:if(m.getMedia()){m.getMedia().pause()}break;default:if(A){d=true}}}return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function z(T){try{if(m.playlist[m.item].levels[0].file.length>0){if(typeof T!="number"){T=parseFloat(T)}switch(m.state){case b.api.events.state.IDLE:if(G<0){G=m.playlist[m.item].start;m.playlist[m.item].start=T}if(!A){F()}break;case b.api.events.state.PLAYING:case b.api.events.state.PAUSED:case b.api.events.state.BUFFERING:m.seek(T);break}}return true}catch(U){N.sendEvent(b.api.events.JWPLAYER_ERROR,U)}return false}function w(T){P=null;if(!c.exists(T)){T=true}try{if((m.state!=b.api.events.state.IDLE||T)&&m.getMedia()){m.getMedia().stop(T)}if(A){d=true}return true}catch(U){N.sendEvent(b.api.events.JWPLAYER_ERROR,U)}return false}function k(){try{if(m.playlist[m.item].levels[0].file.length>0){if(m.config.shuffle){v(S())}else{if(m.item+1==m.playlist.length){v(0)}else{v(m.item+1)}}}if(m.state!=b.api.events.state.IDLE){var U=m.state;m.state=b.api.events.state.IDLE;N.sendEvent(b.api.events.JWPLAYER_PLAYER_STATE,{oldstate:U,newstate:b.api.events.state.IDLE})}F();return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function I(){try{if(m.playlist[m.item].levels[0].file.length>0){if(m.config.shuffle){v(S())}else{if(m.item===0){v(m.playlist.length-1)}else{v(m.item-1)}}}if(m.state!=b.api.events.state.IDLE){var U=m.state;m.state=b.api.events.state.IDLE;N.sendEvent(b.api.events.JWPLAYER_PLAYER_STATE,{oldstate:U,newstate:b.api.events.state.IDLE})}F();return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function S(){var T=null;if(m.playlist.length>1){while(!c.exists(T)){T=Math.floor(Math.random()*m.playlist.length);if(T==m.item){T=null}}}else{T=0}return T}function H(U){if(!m.playlist||!m.playlist[U]){return false}try{if(m.playlist[U].levels[0].file.length>0){var V=m.state;if(V!==b.api.events.state.IDLE){if(m.playlist[m.item]&&m.playlist[m.item].provider==m.playlist[U].provider){w(false)}else{w()}}v(U);F()}return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function v(T){if(!m.playlist[T]){return}m.setActiveMediaProvider(m.playlist[T]);if(m.item!=T){m.item=T;M=true;N.sendEvent(b.api.events.JWPLAYER_PLAYLIST_ITEM,{index:T})}}function g(U){try{v(m.item);var V=m.getMedia();switch(typeof(U)){case"number":V.volume(U);break;case"string":V.volume(parseInt(U,10));break}m.setVolume(U);return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function r(U){try{v(m.item);var V=m.getMedia();if(typeof U=="undefined"){V.mute(!m.mute);m.setMute(!m.mute)}else{if(U.toString().toLowerCase()=="true"){V.mute(true);m.setMute(true)}else{V.mute(false);m.setMute(false)}}return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function J(U,T){try{m.width=U;m.height=T;j.resize(U,T);N.sendEvent(b.api.events.JWPLAYER_RESIZE,{width:m.width,height:m.height});return true}catch(V){N.sendEvent(b.api.events.JWPLAYER_ERROR,V)}return false}function u(U,V){try{if(typeof U=="undefined"){U=!m.fullscreen}if(typeof V=="undefined"){V=true}if(U!=m.fullscreen){m.fullscreen=(U.toString().toLowerCase()=="true");j.fullscreen(m.fullscreen);if(V){N.sendEvent(b.api.events.JWPLAYER_FULLSCREEN,{fullscreen:m.fullscreen})}N.sendEvent(b.api.events.JWPLAYER_RESIZE,{width:m.width,height:m.height})}return true}catch(T){N.sendEvent(b.api.events.JWPLAYER_ERROR,T)}return false}function R(T){try{w();if(A){d=false}m.loadPlaylist(T);if(m.playlist[m.item].provider){v(m.item);if(m.config.autostart.toString().toLowerCase()=="true"&&!c.isIOS()&&!A){F()}return true}else{return false}}catch(U){N.sendEvent(b.api.events.JWPLAYER_ERROR,U)}return false}function O(T){if(!c.isIOS()){v(m.item);if(m.config.autostart.toString().toLowerCase()=="true"&&!c.isIOS()){F()}}}function p(T){u(T.fullscreen,false)}function t(){try{return m.getMedia().detachMedia()}catch(T){return null}}function l(){try{var T=m.getMedia().attachMedia();if(typeof P=="function"){P()}}catch(U){return null}}b.html5.controller.repeatoptions={LIST:"LIST",ALWAYS:"ALWAYS",SINGLE:"SINGLE",NONE:"NONE"};function E(){if(m.state!=b.api.events.state.IDLE){return}P=E;switch(m.config.repeat.toUpperCase()){case b.html5.controller.repeatoptions.SINGLE:F();break;case b.html5.controller.repeatoptions.ALWAYS:if(m.item==m.playlist.length-1&&!m.config.shuffle){H(0)}else{k()}break;case b.html5.controller.repeatoptions.LIST:if(m.item==m.playlist.length-1&&!m.config.shuffle){w();v(0)}else{k()}break;default:w();break}}var x=[];function Q(T){return function(){if(q){B(T,arguments)}else{x.push({method:T,arguments:arguments})}}}function B(V,U){var T=[];for(i=0;i<U.length;i++){T.push(U[i])}V.apply(this,T)}this.play=Q(F);this.pause=Q(e);this.seek=Q(z);this.stop=Q(w);this.next=Q(k);this.prev=Q(I);this.item=Q(H);this.setVolume=Q(g);this.setMute=Q(r);this.resize=Q(J);this.setFullscreen=Q(u);this.load=Q(R);this.playerReady=s;this.detachMedia=t;this.attachMedia=l;this.beforePlay=function(){return A}}})(jwplayer);(function(a){a.html5.defaultSkin=function(){this.text='<?xml version="1.0" ?><skin author="LongTail Video" name="Five" version="1.1"><components><component name="controlbar"><settings><setting name="margin" value="20"/><setting name="fontsize" value="11"/><setting name="fontcolor" value="0x000000"/></settings><layout><group position="left"><button name="play"/><divider name="divider"/><button name="prev"/><divider name="divider"/><button name="next"/><divider name="divider"/><text name="elapsed"/></group><group position="center"><slider name="time"/></group><group position="right"><text name="duration"/><divider name="divider"/><button name="blank"/><divider name="divider"/><button name="mute"/><slider name="volume"/><divider name="divider"/><button name="fullscreen"/></group></layout><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAElJREFUOI3t1LERACAMQlFgGvcfxNIhHMK4gsUvUviOmgtNsiAZkBSEKxKEnCYkkQrJn/YwbUNiSDDYRZaQRDaShv+oX9GBZEIuK+8hXVLs+/YAAAAASUVORK5CYII="/><element name="blankButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAYCAYAAAAyJzegAAAAFElEQVQYV2P8//8/AzpgHBUc7oIAGZdH0RjKN8EAAAAASUVORK5CYII="/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAYAAAA7zJfaAAAAQElEQVQIWz3LsRGAMADDQJ0XB5bMINABZ9GENGrszxhjT2WLSqxEJG2JQrTMdV2q5LpOAvyRaVmsi7WdeZ/7+AAaOTq7BVrfOQAAAABJRU5ErkJggg=="/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAYAAAA7zJfaAAAAQElEQVQIWz3LsRGAMADDQJ0XB5bMINABZ9GENGrszxhjT2WLSqxEJG2JQrTMdV2q5LpOAvyRaVmsi7WdeZ/7+AAaOTq7BVrfOQAAAABJRU5ErkJggg=="/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADhJREFUCB0FwcENgEAAw7Aq+893g8APUILNOQcbFRktVGqUVFRkWNz3xTa2sUaLNUosKlRUvvf5AdbWOTtzmzyWAAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAANUlEQVR42u2RsQkAAAjD/NTTPaW6dXLrINJA1kBpGPMAjDWmOgp1HFQXx+b1KOefO4oxY57R73YnVYCQUCQAAAAASUVORK5CYII="/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAIUlEQVQ4jWNgGAWjYOiD/0gYG3/U0FFDB4Oho2AUDAYAAEwiL9HrpdMVAAAAAElFTkSuQmCC"/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAQklEQVQ4y2NgGAWjYOiD/1AMA/JAfB5NjCJD/YH4PRaLyDa0H4lNNUP/DxlD59PCUBCIp3ZEwYA+NZLUKBgFgwEAAN+HLX9sB8u8AAAAAElFTkSuQmCC"/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAQElEQVQ4y2NgGAWjYOiD/0B8Hojl0cT+U2ooCL8HYn9qGwrD/bQw9P+QMXQ+tSMqnpoRBUpS+tRMUqNgFAwGAADxZy1/mHvFnAAAAABJRU5ErkJggg=="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAOElEQVRIDe3BwQkAIRADwAhhw/nU/kWwUK+KPITMABFh19Y+F0acY8CJvX9wYpXgRElwolSIiMf9ZWEDhtwurFsAAAAASUVORK5CYII="/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAN0lEQVRIDe3BwQkAMQwDMBcc55mRe9zi7RR+FCwBEWG39vcfGHFm4MTuhhMlwYlVBSdKhYh43AW/LQMKm1spzwAAAABJRU5ErkJggg=="/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAIElEQVRIiWNgGAWjYBTQBfynMR61YCRYMApGwSigMQAAiVWPcbq6UkIAAAAASUVORK5CYII="/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAYCAYAAAA/OUfnAAAAO0lEQVQYlWP4//8/Awwz0JgDBP/BeN6Cxf/hnI2btiI4u/fsQ3AOHjqK4Jw4eQbBOX/hEoKDYjSd/AMA4cS4mfLsorgAAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAJklEQVQ4y2NgGAUjDcwH4v/kaPxPikZkxcNVI9mBQ5XoGAWDFwAAsKAXKQQmfbUAAAAASUVORK5CYII="/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAMklEQVQ4y2NgGAWDHPyntub5xBr6Hwv/Pzk2/yfVG/8psRFE25Oq8T+tQnsIaB4FVAcAi2YVysVY52AAAAAASUVORK5CYII="/><element name="volumeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAgMAAACdGdVrAAAACVBMVEUAAACmpqampqbBXAu8AAAAAnRSTlMAgJsrThgAAAArSURBVAhbY2AgErBAyA4I2QEhOyBkB4TsYOhAoaCCUCUwDTDtMMNgRuMHAFB5FoGH5T0UAAAAAElFTkSuQmCC"/><element name="volumeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAgMAAACdGdVrAAAACVBMVEUAAAAAAAAAAACDY+nAAAAAAnRSTlMAgJsrThgAAAArSURBVAhbY2AgErBAyA4I2QEhOyBkB4TsYOhAoaCCUCUwDTDtMMNgRuMHAFB5FoGH5T0UAAAAAElFTkSuQmCC"/><element name="volumeSliderCapRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAYCAYAAAAyJzegAAAAFElEQVQYV2P8//8/AzpgHBUc7oIAGZdH0RjKN8EAAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAQklEQVRIiWNgGAWjYMiD/0iYFDmSLbDHImdPLQtgBpEiR7Zl2NijAA5oEkT/0Whi5UiyAJ8BVMsHNMtoo2AUDAIAAGdcIN3IDNXoAAAAAElFTkSuQmCC"/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAP0lEQVRIx2NgGAWjYMiD/1RSQ5QB/wmIUWzJfzx8qhj+n4DYCAY0DyJ7PBbYU8sHMEvwiZFtODXUjIJRMJgBACpWIN2ZxdPTAAAAAElFTkSuQmCC"/></elements></component><component name="display"><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEUAAAAAAAClZ7nPAAAAAnRSTlOZpuml+rYAAAASSURBVBhXY2AYJuA/GBwY6jQAyDyoK8QcL4QAAAAASUVORK5CYII="/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAiUlEQVR42u3XSw2AMBREURwgAQlIQAISKgUpSEFKJeCg5b0E0kWBTVcD9ySTsL0Jn9IBAAAA+K2UUrBlW/Rr5ZDoIeeuoFkxJD9ss03aIXXQqB9SttoG7ZA6qNcOKdttiwcJh9RB+iFl4SshkRBuLR72+9cvH0SOKI2HRo7x/Fi1/uoCAAAAwLsD8ki99IlO2dQAAAAASUVORK5CYII="/><element name="muteIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAVUlEQVR42u3WMQrAIAxAUW/g/SdvGmvpoOBeSHgPsjj5QTANAACARCJilIhYM0tEvJM+Ik3Id9E957kQIb+F3OdCPC0hPkQriqWx9hp/x/QGAABQyAPLB22VGrpLDgAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAA/0lEQVR42u2U0QmEMBAF7cASLMESUoIlpARLSCkpwRJSgiWkhOvAXD4WsgRkyaG5DbyB+Yvg8KITAAAAAAAYk+u61mwk15EjPtlEfihmqIiZR1Qx80ghjgdUuiHXGHSVsoag0x6x8DUoyjD5KovmEJ9NTDMRPIT0mtdIUkjlonuNohO+Ha99DTmkuGgKCTcvebAzx82ZoCWC3/3aIMWSRucaxcjORSFY4xpFdjYJGp1rFGcyCYZ/RVh6AUnfcNZ2zih3/mGj1jVCdiNDwyrq1rA/xMdeEXvDVdnYc1vDc3uPkDObXrlaxbNHSOohQhr/WOeLEWfWTgAAAAAAADzNF9sHJ7PJ57MlAAAAAElFTkSuQmCC"/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAACBklEQVR42u3Zv0sCYRzH8USTzOsHHEWGkC1HgaDgkktGDjUYtDQ01RDSljQ1BLU02+rk1NTm2NLq4Nx/0L/h9fnCd3j4cnZe1/U8xiO8h3uurufF0/3COd/3/0UWYiEWYiEWYiGJQ+J8xuPxKhXjEMZANinjIZhkGuVRNioE4wVURo4JkHm0xKWmhRAc1bh1EyCUw5BcBIjHiApKa4CErko6DEJwuRo6IRKzyJD8FJAyI3Zp2zRImiBcRhlfo5RtlxCcE3CcDNpGrhYIT2IhAJKilO0VRmzJ32fAMTpBTS0QMfGwlcuKMRftE0DJ0wCJdcOsCkBdXP3Mh9CEFUBTPS9mDZJBG6io4aqVzMdCokCw9H3kT6j/C/9iDdSeUMNC7DkyyxAs/Rk6Qss8FPWRZgdVtUH4DjxEn1zxh+/zj1wHlf4MQhNGrwqA6sY40U8JonRJwEQh+AO3AvCG6gHv4U7IY4krxkroWoAOkoQMGfCBrgIm+YBGqPENpIJ66CJg3x66Y0gnSUidAEEnNr9jjLiWMn5DiWP0OC/oAsCgkq43xBdGDMQr7YASP/vEkHvdl1+JOCcEV5sC4hGEOzTlPuKgd0b0xD4JkRcOgnRRTjdErkYhAsQVq6IdUuPJtmk7BCL3t/h88cx91pKQkI/pkDx6pmYTIjEoxiHsN1YWYiEWYiEWknhflZ5IErA5nr8AAAAASUVORK5CYII="/></elements></component><component name="dock"><settings><setting name="fontcolor" value="0xffffff"/></settings><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyAQMAAAAk8RryAAAABlBMVEUAAAAAAAClZ7nPAAAAAnRSTlOZpuml+rYAAAASSURBVBhXY2AYJuA/GBwY6jQAyDyoK8QcL4QAAAAASUVORK5CYII="/></elements></component><component name="playlist"><settings><setting name="backgroundcolor" value="0xe8e8e8"/></settings><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAIAAAC1nk4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHBJREFUaN7t2MENwCAMBEEe9N8wSKYC/D8YV7CyJoRkVtVImxkZPQInMxoP0XiIxkM0HsGbjjSNBx544IEHHnjggUe/6UQeey0PIh7XTftGxKPj4eXCtLsHHh+ZxkO0Iw8PR55Ni8ZD9Hu/EAoP0dc5RRg9qeRjVF8AAAAASUVORK5CYII="/><element name="sliderCapTop" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAHCAYAAADnCQYGAAAAFUlEQVQokWP8//8/A7UB46ihI9hQAKt6FPPXhVGHAAAAAElFTkSuQmCC"/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAKElEQVQ4y2P4//8/Az68bNmy/+iYkB6GUUNHDR01dNTQUUNHDaXcUABUDOKhcxnsSwAAAABJRU5ErkJggg=="/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAJUlEQVQ4T2P4//8/Ay4MBP9xYbz6Rg0dNXTU0FFDRw0dNZRyQwHH4NBa7GJsXAAAAABJRU5ErkJggg=="/><element name="sliderCapBottom" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAHCAYAAADnCQYGAAAAFUlEQVQokWP8//8/A7UB46ihI9hQAKt6FPPXhVGHAAAAAElFTkSuQmCC"/></elements></component></components></skin>';this.xml=null;if(window.DOMParser){parser=new DOMParser();this.xml=parser.parseFromString(this.text,"text/xml")}else{this.xml=new ActiveXObject("Microsoft.XMLDOM");this.xml.async="false";this.xml.loadXML(this.text)}return this}})(jwplayer);(function(a){_utils=a.utils;_css=_utils.css;_hide=function(b){_css(b,{display:"none"})};_show=function(b){_css(b,{display:"block"})};a.html5.display=function(k,K){var j={icons:true,showmute:false};var X=_utils.extend({},j,K);var h=k;var W={};var e;var w;var z;var T;var u;var M;var E;var N=!_utils.exists(h.skin.getComponentSettings("display").bufferrotation)?15:parseInt(h.skin.getComponentSettings("display").bufferrotation,10);var s=!_utils.exists(h.skin.getComponentSettings("display").bufferinterval)?100:parseInt(h.skin.getComponentSettings("display").bufferinterval,10);var D=-1;var v=a.api.events.state.IDLE;var O=true;var d;var C=false,V=true;var p="";var g=false;var o=false;var m;var y,R;var L=new a.html5.eventdispatcher();_utils.extend(this,L);var H={display:{style:{cursor:"pointer",top:0,left:0,overflow:"hidden"},click:n},display_icon:{style:{cursor:"pointer",position:"absolute",top:((h.skin.getSkinElement("display","background").height-h.skin.getSkinElement("display","playIcon").height)/2),left:((h.skin.getSkinElement("display","background").width-h.skin.getSkinElement("display","playIcon").width)/2),border:0,margin:0,padding:0,zIndex:3,display:"none"}},display_iconBackground:{style:{cursor:"pointer",position:"absolute",top:((w-h.skin.getSkinElement("display","background").height)/2),left:((e-h.skin.getSkinElement("display","background").width)/2),border:0,backgroundImage:(["url(",h.skin.getSkinElement("display","background").src,")"]).join(""),width:h.skin.getSkinElement("display","background").width,height:h.skin.getSkinElement("display","background").height,margin:0,padding:0,zIndex:2,display:"none"}},display_image:{style:{display:"none",width:e,height:w,position:"absolute",cursor:"pointer",left:0,top:0,margin:0,padding:0,textDecoration:"none",zIndex:1}},display_text:{style:{zIndex:4,position:"relative",opacity:0.8,backgroundColor:parseInt("000000",16),color:parseInt("ffffff",16),textAlign:"center",fontFamily:"Arial,sans-serif",padding:"0 5px",fontSize:14}}};h.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,q);h.jwAddEventListener(a.api.events.JWPLAYER_MEDIA_MUTE,q);h.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,P);h.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_ITEM,q);h.jwAddEventListener(a.api.events.JWPLAYER_ERROR,r);Q();function Q(){W.display=G("div","display");W.display_text=G("div","display_text");W.display.appendChild(W.display_text);W.display_image=G("img","display_image");W.display_image.onerror=function(Y){_hide(W.display_image)};W.display_image.onload=B;W.display_icon=G("div","display_icon");W.display_iconBackground=G("div","display_iconBackground");W.display.appendChild(W.display_image);W.display_iconBackground.appendChild(W.display_icon);W.display.appendChild(W.display_iconBackground);f();setTimeout((function(){o=true;if(X.icons.toString()=="true"){J()}}),1)}this.getDisplayElement=function(){return W.display};this.resize=function(Z,Y){if(h.jwGetFullscreen()&&_utils.isMobile()){return}_css(W.display,{width:Z,height:Y});_css(W.display_text,{width:(Z-10),top:((Y-_utils.getBoundingClientRect(W.display_text).height)/2)});_css(W.display_iconBackground,{top:((Y-h.skin.getSkinElement("display","background").height)/2),left:((Z-h.skin.getSkinElement("display","background").width)/2)});if(e!=Z||w!=Y){e=Z;w=Y;d=undefined;J()}if(!h.jwGetFullscreen()){y=Z;R=Y}c();q({})};this.show=function(){if(g){g=false;t(h.jwGetState())}};this.hide=function(){if(!g){F();g=true}};function B(Y){z=W.display_image.naturalWidth;T=W.display_image.naturalHeight;c();if(h.jwGetState()==a.api.events.state.IDLE){_css(W.display_image,{display:"block",opacity:0});_utils.fadeTo(W.display_image,1,0.1)}C=false}function c(){if(h.jwGetFullscreen()&&h.jwGetStretching()==a.utils.stretching.EXACTFIT){var Y=document.createElement("div");_utils.stretch(a.utils.stretching.UNIFORM,Y,e,w,y,R);_utils.stretch(a.utils.stretching.EXACTFIT,W.display_image,_utils.parseDimension(Y.style.width),_utils.parseDimension(Y.style.height),z,T);_css(W.display_image,{left:Y.style.left,top:Y.style.top})}else{_utils.stretch(h.jwGetStretching(),W.display_image,e,w,z,T)}}function G(Y,aa){var Z=document.createElement(Y);Z.id=h.id+"_jwplayer_"+aa;_css(Z,H[aa].style);return Z}function f(){for(var Y in W){if(_utils.exists(H[Y].click)){W[Y].onclick=H[Y].click}}}function n(Y){if(typeof Y.preventDefault!="undefined"){Y.preventDefault()}else{Y.returnValue=false}if(typeof m=="function"){m(Y);return}else{if(h.jwGetState()!=a.api.events.state.PLAYING){h.jwPlay()}else{h.jwPause()}}}function U(Y){if(E){F();return}W.display_icon.style.backgroundImage=(["url(",h.skin.getSkinElement("display",Y).src,")"]).join("");_css(W.display_icon,{width:h.skin.getSkinElement("display",Y).width,height:h.skin.getSkinElement("display",Y).height,top:(h.skin.getSkinElement("display","background").height-h.skin.getSkinElement("display",Y).height)/2,left:(h.skin.getSkinElement("display","background").width-h.skin.getSkinElement("display",Y).width)/2});b();if(_utils.exists(h.skin.getSkinElement("display",Y+"Over"))){W.display_icon.onmouseover=function(Z){W.display_icon.style.backgroundImage=["url(",h.skin.getSkinElement("display",Y+"Over").src,")"].join("")};W.display_icon.onmouseout=function(Z){W.display_icon.style.backgroundImage=["url(",h.skin.getSkinElement("display",Y).src,")"].join("")}}else{W.display_icon.onmouseover=null;W.display_icon.onmouseout=null}}function F(){if(X.icons.toString()=="true"){_hide(W.display_icon);_hide(W.display_iconBackground);S()}}function b(){if(!g&&X.icons.toString()=="true"){_show(W.display_icon);_show(W.display_iconBackground);J()}}function r(Y){E=true;F();W.display_text.innerHTML=Y.message;_show(W.display_text);W.display_text.style.top=((w-_utils.getBoundingClientRect(W.display_text).height)/2)+"px"}function I(){V=false;W.display_image.style.display="none"}function P(){v=""}function q(Y){if((Y.type==a.api.events.JWPLAYER_PLAYER_STATE||Y.type==a.api.events.JWPLAYER_PLAYLIST_ITEM)&&E){E=false;_hide(W.display_text)}var Z=h.jwGetState();if(Z==v){return}v=Z;if(D>=0){clearTimeout(D)}if(O||h.jwGetState()==a.api.events.state.PLAYING||h.jwGetState()==a.api.events.state.PAUSED){t(h.jwGetState())}else{D=setTimeout(l(h.jwGetState()),500)}}function l(Y){return(function(){t(Y)})}function t(Y){if(_utils.exists(M)){clearInterval(M);M=null;_utils.animations.rotate(W.display_icon,0)}switch(Y){case a.api.events.state.BUFFERING:if(_utils.isIPod()){I();F()}else{if(h.jwGetPlaylist()[h.jwGetPlaylistIndex()].provider=="sound"){x()}u=0;M=setInterval(function(){u+=N;_utils.animations.rotate(W.display_icon,u%360)},s);U("bufferIcon");O=true}break;case a.api.events.state.PAUSED:if(!_utils.isIPod()){if(h.jwGetPlaylist()[h.jwGetPlaylistIndex()].provider!="sound"){_css(W.display_image,{background:"transparent no-repeat center center"})}U("playIcon");O=true}break;case a.api.events.state.IDLE:if(h.jwGetPlaylist()[h.jwGetPlaylistIndex()]&&h.jwGetPlaylist()[h.jwGetPlaylistIndex()].image){x()}else{I()}U("playIcon");O=true;break;default:if(h.jwGetPlaylist()[h.jwGetPlaylistIndex()]&&h.jwGetPlaylist()[h.jwGetPlaylistIndex()].provider=="sound"){if(_utils.isIPod()){I();O=false}else{x()}}else{I();O=false}if(h.jwGetMute()&&X.showmute){U("muteIcon")}else{F()}break}D=-1}function x(){if(h.jwGetPlaylist()[h.jwGetPlaylistIndex()]){var Y=h.jwGetPlaylist()[h.jwGetPlaylistIndex()].image;if(Y){if(Y!=p){p=Y;C=true;W.display_image.src=_utils.getAbsolutePath(Y)}else{if(!(C||V)){V=true;W.display_image.style.opacity=0;W.display_image.style.display="block";_utils.fadeTo(W.display_image,1,0.1)}}}}}function A(Y){return function(){if(!o){return}if(!g&&d!=Y){d=Y;L.sendEvent(Y,{component:"display",boundingRect:_utils.getDimensions(W.display_iconBackground)})}}}var J=A(a.api.events.JWPLAYER_COMPONENT_SHOW);var S=A(a.api.events.JWPLAYER_COMPONENT_HIDE);this.setAlternateClickHandler=function(Y){m=Y};this.revertAlternateClickHandler=function(){m=undefined};return this}})(jwplayer);(function(a){var c=a.utils;var b=c.css;a.html5.dock=function(w,D){function x(){return{align:a.html5.view.positions.RIGHT}}var n=c.extend({},x(),D);if(n.align=="FALSE"){return}var j={};var A=[];var k;var F;var f=false;var C=false;var g={x:0,y:0,width:0,height:0};var z;var o;var y;var m=new a.html5.eventdispatcher();c.extend(this,m);var r=document.createElement("div");r.id=w.id+"_jwplayer_dock";r.style.opacity=1;p();w.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,q);this.getDisplayElement=function(){return r};this.setButton=function(K,H,I,J){if(!H&&j[K]){c.arrays.remove(A,K);r.removeChild(j[K].div);delete j[K]}else{if(H){if(!j[K]){j[K]={}}j[K].handler=H;j[K].outGraphic=I;j[K].overGraphic=J;if(!j[K].div){A.push(K);j[K].div=document.createElement("div");j[K].div.style.position="absolute";r.appendChild(j[K].div);j[K].div.appendChild(document.createElement("div"));j[K].div.childNodes[0].style.position="relative";j[K].div.childNodes[0].style.width="100%";j[K].div.childNodes[0].style.height="100%";j[K].div.childNodes[0].style.zIndex=10;j[K].div.childNodes[0].style.cursor="pointer";j[K].div.appendChild(document.createElement("img"));j[K].div.childNodes[1].style.position="absolute";j[K].div.childNodes[1].style.left=0;j[K].div.childNodes[1].style.top=0;if(w.skin.getSkinElement("dock","button")){j[K].div.childNodes[1].src=w.skin.getSkinElement("dock","button").src}j[K].div.childNodes[1].style.zIndex=9;j[K].div.childNodes[1].style.cursor="pointer";j[K].div.onmouseover=function(){if(j[K].overGraphic){j[K].div.childNodes[0].style.background=h(j[K].overGraphic)}if(w.skin.getSkinElement("dock","buttonOver")){j[K].div.childNodes[1].src=w.skin.getSkinElement("dock","buttonOver").src}};j[K].div.onmouseout=function(){if(j[K].outGraphic){j[K].div.childNodes[0].style.background=h(j[K].outGraphic)}if(w.skin.getSkinElement("dock","button")){j[K].div.childNodes[1].src=w.skin.getSkinElement("dock","button").src}};if(w.skin.getSkinElement("dock","button")){j[K].div.childNodes[1].src=w.skin.getSkinElement("dock","button").src}}if(j[K].outGraphic){j[K].div.childNodes[0].style.background=h(j[K].outGraphic)}else{if(j[K].overGraphic){j[K].div.childNodes[0].style.background=h(j[K].overGraphic)}}if(H){j[K].div.onclick=function(L){L.preventDefault();a(w.id).callback(K);if(j[K].overGraphic){j[K].div.childNodes[0].style.background=h(j[K].overGraphic)}if(w.skin.getSkinElement("dock","button")){j[K].div.childNodes[1].src=w.skin.getSkinElement("dock","button").src}}}}}l(k,F)};function h(H){return"url("+H+") no-repeat center center"}function t(H){}function l(H,T){p();if(A.length>0){var I=10;var S=I;var P=-1;var Q=w.skin.getSkinElement("dock","button").height;var O=w.skin.getSkinElement("dock","button").width;var M=H-O-I;var R,L;if(n.align==a.html5.view.positions.LEFT){P=1;M=I}for(var J=0;J<A.length;J++){var U=Math.floor(S/T);if((S+Q+I)>((U+1)*T)){S=((U+1)*T)+I;U=Math.floor(S/T)}var K=j[A[J]].div;K.style.top=(S%T)+"px";K.style.left=(M+(w.skin.getSkinElement("dock","button").width+I)*U*P)+"px";var N={x:c.parseDimension(K.style.left),y:c.parseDimension(K.style.top),width:O,height:Q};if(!R||(N.x<=R.x&&N.y<=R.y)){R=N}if(!L||(N.x>=L.x&&N.y>=L.y)){L=N}K.style.width=O+"px";K.style.height=Q+"px";S+=w.skin.getSkinElement("dock","button").height+I}g={x:R.x,y:R.y,width:L.x-R.x+L.width,height:R.y-L.y+L.height}}if(C!=w.jwGetFullscreen()||k!=H||F!=T){k=H;F=T;C=w.jwGetFullscreen();z=undefined;setTimeout(s,1)}}function d(H){return function(){if(!f&&z!=H&&A.length>0){z=H;m.sendEvent(H,{component:"dock",boundingRect:g})}}}function q(H){if(c.isMobile()){if(H.newstate==a.api.events.state.IDLE){v()}else{e()}}else{B()}}function B(H){if(f){return}clearTimeout(y);if(D.position==a.html5.view.positions.OVER||w.jwGetFullscreen()){switch(w.jwGetState()){case a.api.events.state.PAUSED:case a.api.events.state.IDLE:if(r&&r.style.opacity<1&&(!D.idlehide||c.exists(H))){E()}if(D.idlehide){y=setTimeout(function(){u()},2000)}break;default:if(c.exists(H)){E()}y=setTimeout(function(){u()},2000);break}}else{E()}}var s=d(a.api.events.JWPLAYER_COMPONENT_SHOW);var G=d(a.api.events.JWPLAYER_COMPONENT_HIDE);this.resize=l;var v=function(){b(r,{display:"block"});if(f){f=false;s()}};var e=function(){b(r,{display:"none"});if(!f){G();f=true}};function u(){if(!f){G();if(r.style.opacity==1){c.cancelAnimation(r);c.fadeTo(r,0,0.1,1,0)}}}function E(){if(!f){s();if(r.style.opacity==0){c.cancelAnimation(r);c.fadeTo(r,1,0.1,0,0)}}}function p(){try{o=document.getElementById(w.id);o.addEventListener("mousemove",B)}catch(H){c.log("Could not add mouse listeners to dock: "+H)}}this.hide=e;this.show=v;return this}})(jwplayer);(function(a){a.html5.eventdispatcher=function(d,b){var c=new a.events.eventdispatcher(b);a.utils.extend(this,c);this.sendEvent=function(e,f){if(!a.utils.exists(f)){f={}}a.utils.extend(f,{id:d,version:a.version,type:e});c.sendEvent(e,f)}}})(jwplayer);(function(a){var b=a.utils;a.html5.instream=function(y,m,x,z){var t={controlbarseekable:"always",controlbarpausable:true,controlbarstoppable:true,playlistclickable:true};var v,A,C=y,E=m,j=x,w=z,r,H,o,G,e,f,g,l,q,h=false,k,d,n=this;this.load=function(M,K){c();h=true;A=b.extend(t,K);v=a.html5.playlistitem(M);F();d=document.createElement("div");d.id=n.id+"_instream_container";w.detachMedia();r=g.getDisplayElement();f=E.playlist[E.item];e=C.jwGetState();if(e==a.api.events.state.BUFFERING||e==a.api.events.state.PLAYING){r.pause()}H=r.src?r.src:r.currentSrc;o=r.innerHTML;G=r.currentTime;q=new a.html5.display(n,b.extend({},E.plugins.config.display));q.setAlternateClickHandler(function(N){if(_fakemodel.state==a.api.events.state.PAUSED){n.jwInstreamPlay()}else{D(a.api.events.JWPLAYER_INSTREAM_CLICK,N)}});d.appendChild(q.getDisplayElement());if(!b.isMobile()){l=new a.html5.controlbar(n,b.extend({},E.plugins.config.controlbar,{}));if(E.plugins.config.controlbar.position==a.html5.view.positions.OVER){d.appendChild(l.getDisplayElement())}else{var L=E.plugins.object.controlbar.getDisplayElement().parentNode;L.appendChild(l.getDisplayElement())}}j.setupInstream(d,r);p();g.load(v)};this.jwInstreamDestroy=function(K){if(!h){return}h=false;if(e!=a.api.events.state.IDLE){g.load(f,false);g.stop(false)}else{g.stop(true)}g.detachMedia();j.destroyInstream();if(l){try{l.getDisplayElement().parentNode.removeChild(l.getDisplayElement())}catch(L){}}D(a.api.events.JWPLAYER_INSTREAM_DESTROYED,{reason:(K?"complete":"destroyed")},true);w.attachMedia();if(e==a.api.events.state.BUFFERING||e==a.api.events.state.PLAYING){r.play();if(E.playlist[E.item]==f){E.getMedia().seek(G)}}return};this.jwInstreamAddEventListener=function(K,L){k.addEventListener(K,L)};this.jwInstreamRemoveEventListener=function(K,L){k.removeEventListener(K,L)};this.jwInstreamPlay=function(){if(!h){return}g.play(true)};this.jwInstreamPause=function(){if(!h){return}g.pause(true)};this.jwInstreamSeek=function(K){if(!h){return}g.seek(K)};this.jwInstreamGetState=function(){if(!h){return undefined}return _fakemodel.state};this.jwInstreamGetPosition=function(){if(!h){return undefined}return _fakemodel.position};this.jwInstreamGetDuration=function(){if(!h){return undefined}return _fakemodel.duration};this.playlistClickable=function(){return(!h||A.playlistclickable.toString().toLowerCase()=="true")};function s(){_fakemodel=new a.html5.model(this,E.getMedia()?E.getMedia().getDisplayElement():E.container,E);k=new a.html5.eventdispatcher();C.jwAddEventListener(a.api.events.JWPLAYER_RESIZE,p);C.jwAddEventListener(a.api.events.JWPLAYER_FULLSCREEN,p)}function c(){_fakemodel.setMute(E.mute);_fakemodel.setVolume(E.volume)}function F(){if(!g){g=new a.html5.mediavideo(_fakemodel,E.getMedia()?E.getMedia().getDisplayElement():E.container);g.addGlobalListener(I);g.addEventListener(a.api.events.JWPLAYER_MEDIA_META,J);g.addEventListener(a.api.events.JWPLAYER_MEDIA_COMPLETE,u);g.addEventListener(a.api.events.JWPLAYER_MEDIA_BUFFER_FULL,B)}g.attachMedia()}function I(K){if(h){D(K.type,K)}}function B(K){if(h){g.play()}}function u(K){if(h){setTimeout(function(){n.jwInstreamDestroy(true)},10)}}function J(K){if(K.metadata.width&&K.metadata.height){j.resizeMedia()}}function D(K,L,M){if(h||M){k.sendEvent(K,L)}}function p(){var K=E.plugins.object.display.getDisplayElement().style;if(l){var L=E.plugins.object.controlbar.getDisplayElement().style;l.resize(b.parseDimension(K.width),b.parseDimension(L.height));_css(l.getDisplayElement(),b.extend({},L,{zIndex:1001,opacity:1}))}if(q){q.resize(b.parseDimension(K.width),b.parseDimension(K.height));_css(q.getDisplayElement(),b.extend({},K,{zIndex:1000}))}if(j){j.resizeMedia()}}this.jwPlay=function(K){if(A.controlbarpausable.toString().toLowerCase()=="true"){this.jwInstreamPlay()}};this.jwPause=function(K){if(A.controlbarpausable.toString().toLowerCase()=="true"){this.jwInstreamPause()}};this.jwStop=function(){if(A.controlbarstoppable.toString().toLowerCase()=="true"){this.jwInstreamDestroy();C.jwStop()}};this.jwSeek=function(K){switch(A.controlbarseekable.toLowerCase()){case"always":this.jwInstreamSeek(K);break;case"backwards":if(_fakemodel.position>K){this.jwInstreamSeek(K)}break}};this.jwGetPosition=function(){};this.jwGetDuration=function(){};this.jwGetWidth=C.jwGetWidth;this.jwGetHeight=C.jwGetHeight;this.jwGetFullscreen=C.jwGetFullscreen;this.jwSetFullscreen=C.jwSetFullscreen;this.jwGetVolume=function(){return E.volume};this.jwSetVolume=function(K){g.volume(K);C.jwSetVolume(K)};this.jwGetMute=function(){return E.mute};this.jwSetMute=function(K){g.mute(K);C.jwSetMute(K)};this.jwGetState=function(){return _fakemodel.state};this.jwGetPlaylist=function(){return[v]};this.jwGetPlaylistIndex=function(){return 0};this.jwGetStretching=function(){return E.config.stretching};this.jwAddEventListener=function(L,K){k.addEventListener(L,K)};this.jwRemoveEventListener=function(L,K){k.removeEventListener(L,K)};this.skin=C.skin;this.id=C.id+"_instream";s();return this}})(jwplayer);(function(a){var b={prefix:"",file:"",link:"",linktarget:"_top",margin:8,out:0.5,over:1,timeout:5,hide:true,position:"bottom-left"};_css=a.utils.css;a.html5.logo=function(n,r){var q=n;var u;var d;var t;var h=false;g();function g(){o();q.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,j);c();l()}function o(){if(b.prefix){var v=n.version.split(/\W/).splice(0,2).join("/");if(b.prefix.indexOf(v)<0){b.prefix+=v+"/"}}if(r.position==a.html5.view.positions.OVER){r.position=b.position}try{if(window.location.href.indexOf("https")==0){b.prefix=b.prefix.replace("http://l.longtailvideo.com","https://securel.longtailvideo.com")}}catch(w){}d=a.utils.extend({},b,r)}function c(){t=document.createElement("img");t.id=q.id+"_jwplayer_logo";t.style.display="none";t.onload=function(v){_css(t,k());p()};if(!d.file){return}if(d.file.indexOf("/")>=0){t.src=d.file}else{t.src=d.prefix+d.file}}if(!d.file){return}this.resize=function(w,v){};this.getDisplayElement=function(){return t};function l(){if(d.link){t.onmouseover=f;t.onmouseout=p;t.onclick=s}else{this.mouseEnabled=false}}function s(v){if(typeof v!="undefined"){v.stopPropagation()}if(!h){return}q.jwPause();q.jwSetFullscreen(false);if(d.link){window.open(d.link,d.linktarget)}return}function p(v){if(d.link&&h){t.style.opacity=d.out}return}function f(v){if(h){t.style.opacity=d.over}return}function k(){var x={textDecoration:"none",position:"absolute",cursor:"pointer"};x.display=(d.hide.toString()=="true"&&!h)?"none":"block";var w=d.position.toLowerCase().split("-");for(var v in w){x[w[v]]=parseInt(d.margin)}return x}function m(){if(d.hide.toString()=="true"){t.style.display="block";t.style.opacity=0;a.utils.fadeTo(t,d.out,0.1,parseFloat(t.style.opacity));u=setTimeout(function(){e()},d.timeout*1000)}h=true}function e(){h=false;if(d.hide.toString()=="true"){a.utils.fadeTo(t,0,0.1,parseFloat(t.style.opacity))}}function j(v){if(v.newstate==a.api.events.state.BUFFERING){clearTimeout(u);m()}}return this}})(jwplayer);(function(b){var d={ended:b.api.events.state.IDLE,playing:b.api.events.state.PLAYING,pause:b.api.events.state.PAUSED,buffering:b.api.events.state.BUFFERING};var e=b.utils;var a=e.isMobile();var c={};b.html5.mediavideo=function(h,F){var J={abort:y,canplay:p,canplaythrough:p,durationchange:u,emptied:y,ended:p,error:o,loadeddata:u,loadedmetadata:u,loadstart:p,pause:p,play:y,playing:p,progress:D,ratechange:y,seeked:p,seeking:p,stalled:p,suspend:p,timeupdate:N,volumechange:l,waiting:p,canshowcurrentframe:y,dataunavailable:y,empty:y,load:g,loadedfirstframe:y,webkitfullscreenchange:k};var K=new b.html5.eventdispatcher();e.extend(this,K);var j=h,B=F,m,f,C,T,E,M,L=false,t=false,x=false,I,G,Q;R();this.load=function(V,W){if(typeof W=="undefined"){W=true}if(!t){return}T=V;x=(T.duration>0);j.duration=T.duration;e.empty(m);Q=0;q(V.levels);if(V.levels&&V.levels.length>0){if(V.levels.length==1||e.isIOS()){m.src=V.levels[0].file}else{if(m.src){m.removeAttribute("src")}for(var U=0;U<V.levels.length;U++){var X=m.ownerDocument.createElement("source");X.src=V.levels[U].file;m.appendChild(X);Q++}}}else{m.src=V.file}m.style.display="block";m.style.opacity=1;m.volume=j.volume/100;m.muted=j.mute;if(a){P()}I=G=C=false;j.buffer=0;if(!e.exists(V.start)){V.start=0}M=(V.start>0)?V.start:-1;s(b.api.events.JWPLAYER_MEDIA_LOADED);if((!a&&V.levels.length==1)||!L){m.load()}L=false;if(W){w(b.api.events.state.BUFFERING);s(b.api.events.JWPLAYER_MEDIA_BUFFER,{bufferPercent:0});A()}if(m.videoWidth>0&&m.videoHeight>0){u()}};this.play=function(){if(!t){return}A();if(G){w(b.api.events.state.PLAYING)}else{w(b.api.events.state.BUFFERING)}m.play()};this.pause=function(){if(!t){return}m.pause();w(b.api.events.state.PAUSED)};this.seek=function(U){if(!t){return}if(!C&&m.readyState>0){if(!(j.duration<=0||isNaN(j.duration))&&!(j.position<=0||isNaN(j.position))){m.currentTime=U;m.play()}}else{M=U}};var z=this.stop=function(U){if(!t){return}if(!e.exists(U)){U=true}r();if(U){G=false;var V=navigator.userAgent;if(m.webkitSupportsFullscreen){try{m.webkitExitFullscreen()}catch(W){}}m.style.opacity=0;v();if(e.isIE()){m.src=""}else{m.removeAttribute("src")}e.empty(m);m.load();L=true}w(b.api.events.state.IDLE)};this.fullscreen=function(U){if(U===true){this.resize("100%","100%")}else{this.resize(j.config.width,j.config.height)}};this.resize=function(V,U){};this.volume=function(U){if(!a){m.volume=U/100;s(b.api.events.JWPLAYER_MEDIA_VOLUME,{volume:(U/100)})}};this.mute=function(U){if(!a){m.muted=U;s(b.api.events.JWPLAYER_MEDIA_MUTE,{mute:U})}};this.getDisplayElement=function(){return m};this.hasChrome=function(){return a&&(f==b.api.events.state.PLAYING)};this.detachMedia=function(){t=false;return this.getDisplayElement()};this.attachMedia=function(){t=true};function H(V,U){return function(W){if(e.exists(W.target.parentNode)){U(W)}}}function R(){f=b.api.events.state.IDLE;t=true;m=n();m.setAttribute("x-webkit-airplay","allow");if(B.parentNode){m.id=B.id;B.parentNode.replaceChild(m,B)}}function n(){var U=c[j.id];if(!U){if(B.tagName.toLowerCase()=="video"){U=B}else{U=document.createElement("video")}c[j.id]=U;if(!U.id){U.id=B.id}}for(var V in J){U.addEventListener(V,H(V,J[V]),true)}return U}function w(U){if(U==b.api.events.state.PAUSED&&f==b.api.events.state.IDLE){return}if(a){switch(U){case b.api.events.state.PLAYING:P();break;case b.api.events.state.BUFFERING:case b.api.events.state.PAUSED:v();break}}if(f!=U){var V=f;j.state=f=U;s(b.api.events.JWPLAYER_PLAYER_STATE,{oldstate:V,newstate:U})}}function y(U){}function l(U){var V=Math.round(m.volume*100);s(b.api.events.JWPLAYER_MEDIA_VOLUME,{volume:V},true);s(b.api.events.JWPLAYER_MEDIA_MUTE,{mute:m.muted},true)}function D(W){if(!t){return}var V;if(e.exists(W)&&W.lengthComputable&&W.total){V=W.loaded/W.total*100}else{if(e.exists(m.buffered)&&(m.buffered.length>0)){var U=m.buffered.length-1;if(U>=0){V=m.buffered.end(U)/m.duration*100}}}if(e.useNativeFullscreen()&&e.exists(m.webkitDisplayingFullscreen)){if(j.fullscreen!=m.webkitDisplayingFullscreen){s(b.api.events.JWPLAYER_FULLSCREEN,{fullscreen:m.webkitDisplayingFullscreen},true)}}if(G===false&&f==b.api.events.state.BUFFERING){s(b.api.events.JWPLAYER_MEDIA_BUFFER_FULL);G=true}if(!I){if(V==100){I=true}if(e.exists(V)&&(V>j.buffer)){j.buffer=Math.round(V);s(b.api.events.JWPLAYER_MEDIA_BUFFER,{bufferPercent:Math.round(V)})}}}function N(V){if(!t){return}if(e.exists(V)&&e.exists(V.target)){if(x>0){if(!isNaN(V.target.duration)&&(isNaN(j.duration)||j.duration<1)){if(V.target.duration==Infinity){j.duration=0}else{j.duration=Math.round(V.target.duration*10)/10}}}if(!C&&m.readyState>0){w(b.api.events.state.PLAYING)}if(f==b.api.events.state.PLAYING){if(m.readyState>0&&(M>-1||!C)){C=true;try{if(m.currentTime!=M&&M>-1){m.currentTime=M;M=-1}}catch(U){}m.volume=j.volume/100;m.muted=j.mute}j.position=j.duration>0?(Math.round(V.target.currentTime*10)/10):0;s(b.api.events.JWPLAYER_MEDIA_TIME,{position:j.position,duration:j.duration});if(j.position>=j.duration&&(j.position>0||j.duration>0)){O();return}}}D(V)}function g(U){}function p(U){if(!t){return}if(d[U.type]){if(U.type=="ended"){O()}else{w(d[U.type])}}}function u(V){if(!t){return}var U=Math.round(m.duration*10)/10;var W={height:m.videoHeight,width:m.videoWidth,duration:U};if(!x){if((j.duration<U||isNaN(j.duration))&&m.duration!=Infinity){j.duration=U}}s(b.api.events.JWPLAYER_MEDIA_META,{metadata:W})}function o(W){if(!t){return}if(f==b.api.events.state.IDLE){return}var V="There was an error: ";if((W.target.error&&W.target.tagName.toLowerCase()=="video")||W.target.parentNode.error&&W.target.parentNode.tagName.toLowerCase()=="video"){var U=!e.exists(W.target.error)?W.target.parentNode.error:W.target.error;switch(U.code){case U.MEDIA_ERR_ABORTED:e.log("User aborted the video playback.");return;case U.MEDIA_ERR_NETWORK:V="A network error caused the video download to fail part-way: ";break;case U.MEDIA_ERR_DECODE:V="The video playback was aborted due to a corruption problem or because the video used features your browser did not support: ";break;case U.MEDIA_ERR_SRC_NOT_SUPPORTED:V="The video could not be loaded, either because the server or network failed or because the format is not supported: ";break;default:V="An unknown error occurred: ";break}}else{if(W.target.tagName.toLowerCase()=="source"){Q--;if(Q>0){return}if(e.userAgentMatch(/firefox/i)){e.log("The video could not be loaded, either because the server or network failed or because the format is not supported.");z(false);return}else{V="The video could not be loaded, either because the server or network failed or because the format is not supported: "}}else{e.log("An unknown error occurred.  Continuing...");return}}z(false);V+=S();_error=true;s(b.api.events.JWPLAYER_ERROR,{message:V});return}function S(){var W="";for(var V in T.levels){var U=T.levels[V];var X=B.ownerDocument.createElement("source");W+=b.utils.getAbsolutePath(U.file);if(V<(T.levels.length-1)){W+=", "}}return W}function A(){if(!e.exists(E)){E=setInterval(function(){D()},100)}}function r(){clearInterval(E);E=null}function O(){if(f==b.api.events.state.PLAYING){z(false);s(b.api.events.JWPLAYER_MEDIA_BEFORECOMPLETE);s(b.api.events.JWPLAYER_MEDIA_COMPLETE)}}function k(U){if(e.exists(m.webkitDisplayingFullscreen)){if(j.fullscreen&&!m.webkitDisplayingFullscreen){s(b.api.events.JWPLAYER_FULLSCREEN,{fullscreen:false},true)}}}function q(W){if(W.length>0&&e.userAgentMatch(/Safari/i)&&!e.userAgentMatch(/Chrome/i)){var U=-1;for(var V=0;V<W.length;V++){switch(e.extension(W[V].file)){case"mp4":if(U<0){U=V}break;case"webm":W.splice(V,1);break}}if(U>0){var X=W.splice(U,1)[0];W.unshift(X)}}}function P(){setTimeout(function(){m.setAttribute("controls","controls")},100)}function v(){setTimeout(function(){m.removeAttribute("controls")},250)}function s(U,W,V){if(t||V){if(W){K.sendEvent(U,W)}else{K.sendEvent(U)}}}}})(jwplayer);(function(a){var c={ended:a.api.events.state.IDLE,playing:a.api.events.state.PLAYING,pause:a.api.events.state.PAUSED,buffering:a.api.events.state.BUFFERING};var b=a.utils.css;a.html5.mediayoutube=function(j,e){var f=new a.html5.eventdispatcher();a.utils.extend(this,f);var l=j;var h=document.getElementById(e.id);var g=a.api.events.state.IDLE;var n,m;function k(p){if(g!=p){var q=g;l.state=p;g=p;f.sendEvent(a.api.events.JWPLAYER_PLAYER_STATE,{oldstate:q,newstate:p})}}this.getDisplayElement=this.detachMedia=function(){return h};this.attachMedia=function(){};this.play=function(){if(g==a.api.events.state.IDLE){f.sendEvent(a.api.events.JWPLAYER_MEDIA_BUFFER,{bufferPercent:100});f.sendEvent(a.api.events.JWPLAYER_MEDIA_BUFFER_FULL);k(a.api.events.state.PLAYING)}else{if(g==a.api.events.state.PAUSED){k(a.api.events.state.PLAYING)}}};this.pause=function(){k(a.api.events.state.PAUSED)};this.seek=function(p){};this.stop=function(p){if(!_utils.exists(p)){p=true}l.position=0;k(a.api.events.state.IDLE);if(p){b(h,{display:"none"})}};this.volume=function(p){l.setVolume(p);f.sendEvent(a.api.events.JWPLAYER_MEDIA_VOLUME,{volume:Math.round(p)})};this.mute=function(p){h.muted=p;f.sendEvent(a.api.events.JWPLAYER_MEDIA_MUTE,{mute:p})};this.resize=function(q,p){if(q*p>0&&n){n.width=m.width=q;n.height=m.height=p}};this.fullscreen=function(p){if(p===true){this.resize("100%","100%")}else{this.resize(l.config.width,l.config.height)}};this.load=function(p){o(p);b(n,{display:"block"});k(a.api.events.state.BUFFERING);f.sendEvent(a.api.events.JWPLAYER_MEDIA_BUFFER,{bufferPercent:0});f.sendEvent(a.api.events.JWPLAYER_MEDIA_LOADED);this.play()};this.hasChrome=function(){return(g!=a.api.events.state.IDLE)};function o(v){var s=v.levels[0].file;s=["http://www.youtube.com/v/",d(s),"&amp;hl=en_US&amp;fs=1&autoplay=1"].join("");n=document.createElement("object");n.id=h.id;n.style.position="absolute";var u={movie:s,allowfullscreen:"true",allowscriptaccess:"always"};for(var p in u){var t=document.createElement("param");t.name=p;t.value=u[p];n.appendChild(t)}m=document.createElement("embed");n.appendChild(m);var q={src:s,type:"application/x-shockwave-flash",allowfullscreen:"true",allowscriptaccess:"always",width:n.width,height:n.height};for(var r in q){m.setAttribute(r,q[r])}n.appendChild(m);n.style.zIndex=2147483000;if(h!=n&&h.parentNode){h.parentNode.replaceChild(n,h)}h=n}function d(q){var p=q.split(/\?|\#\!/);var s="";for(var r=0;r<p.length;r++){if(p[r].substr(0,2)=="v="){s=p[r].substr(2)}}if(s==""){if(q.indexOf("/v/")>=0){s=q.substr(q.indexOf("/v/")+3)}else{if(q.indexOf("youtu.be")>=0){s=q.substr(q.indexOf("youtu.be/")+9)}else{s=q}}}if(s.indexOf("?")>-1){s=s.substr(0,s.indexOf("?"))}if(s.indexOf("&")>-1){s=s.substr(0,s.indexOf("&"))}return s}this.embed=m;return this}})(jwplayer);(function(jwplayer){var _configurableStateVariables=["width","height","start","duration","volume","mute","fullscreen","item","plugins","stretching"];var _utils=jwplayer.utils;jwplayer.html5.model=function(api,container,options){var _api=api;var _container=container;var _cookies=_utils.getCookies();var _model={id:_container.id,playlist:[],state:jwplayer.api.events.state.IDLE,position:0,buffer:0,container:_container,config:{width:480,height:320,item:-1,skin:undefined,file:undefined,image:undefined,start:0,duration:0,bufferlength:5,volume:_cookies.volume?_cookies.volume:90,mute:_cookies.mute&&_cookies.mute.toString().toLowerCase()=="true"?true:false,fullscreen:false,repeat:"",stretching:jwplayer.utils.stretching.UNIFORM,autostart:false,debug:undefined,screencolor:undefined}};var _media;var _eventDispatcher=new jwplayer.html5.eventdispatcher();var _components=["display","logo","controlbar","playlist","dock"];jwplayer.utils.extend(_model,_eventDispatcher);for(var option in options){if(typeof options[option]=="string"){var type=/color$/.test(option)?"color":null;options[option]=jwplayer.utils.typechecker(options[option],type)}var config=_model.config;var path=option.split(".");for(var edge in path){if(edge==path.length-1){config[path[edge]]=options[option]}else{if(!jwplayer.utils.exists(config[path[edge]])){config[path[edge]]={}}config=config[path[edge]]}}}for(var index in _configurableStateVariables){var configurableStateVariable=_configurableStateVariables[index];_model[configurableStateVariable]=_model.config[configurableStateVariable]}var pluginorder=_components.concat([]);if(jwplayer.utils.exists(_model.plugins)){if(typeof _model.plugins=="string"){var userplugins=_model.plugins.split(",");for(var userplugin in userplugins){if(typeof userplugins[userplugin]=="string"){pluginorder.push(userplugins[userplugin].replace(/^\s+|\s+$/g,""))}}}}if(jwplayer.utils.isMobile()){pluginorder=["display","logo","dock","playlist"];if(!jwplayer.utils.exists(_model.config.repeat)){_model.config.repeat="list"}}else{if(_model.config.chromeless){pluginorder=["logo","dock","playlist"];if(!jwplayer.utils.exists(_model.config.repeat)){_model.config.repeat="list"}}}_model.plugins={order:pluginorder,config:{},object:{}};if(typeof _model.config.components!="undefined"){for(var component in _model.config.components){_model.plugins.config[component]=_model.config.components[component]}}var playlistVisible=false;for(var pluginIndex in _model.plugins.order){var pluginName=_model.plugins.order[pluginIndex];var pluginConfig=!jwplayer.utils.exists(_model.plugins.config[pluginName])?{}:_model.plugins.config[pluginName];_model.plugins.config[pluginName]=!jwplayer.utils.exists(_model.plugins.config[pluginName])?pluginConfig:jwplayer.utils.extend(_model.plugins.config[pluginName],pluginConfig);if(!jwplayer.utils.exists(_model.plugins.config[pluginName].position)){if(pluginName=="playlist"){_model.plugins.config[pluginName].position=jwplayer.html5.view.positions.NONE}else{_model.plugins.config[pluginName].position=jwplayer.html5.view.positions.OVER}}else{if(pluginName=="playlist"){playlistVisible=true}_model.plugins.config[pluginName].position=_model.plugins.config[pluginName].position.toString().toUpperCase()}}if(_model.plugins.config.controlbar&&playlistVisible){_model.plugins.config.controlbar.hideplaylistcontrols=true}if(typeof _model.plugins.config.dock!="undefined"){if(typeof _model.plugins.config.dock!="object"){var position=_model.plugins.config.dock.toString().toUpperCase();_model.plugins.config.dock={position:position}}if(typeof _model.plugins.config.dock.position!="undefined"){_model.plugins.config.dock.align=_model.plugins.config.dock.position;_model.plugins.config.dock.position=jwplayer.html5.view.positions.OVER}if(typeof _model.plugins.config.dock.idlehide=="undefined"){try{_model.plugins.config.dock.idlehide=_model.plugins.config.controlbar.idlehide}catch(e){}}}function _loadExternal(playlistfile){var loader=new jwplayer.html5.playlistloader();loader.addEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED,function(evt){_model.playlist=new jwplayer.html5.playlist(evt);_loadComplete(true)});loader.addEventListener(jwplayer.api.events.JWPLAYER_ERROR,function(evt){_model.playlist=new jwplayer.html5.playlist({playlist:[]});_loadComplete(false)});loader.load(playlistfile)}function _loadComplete(){if(_model.config.shuffle){_model.item=_getShuffleItem()}else{if(_model.config.item>=_model.playlist.length){_model.config.item=_model.playlist.length-1}else{if(_model.config.item<0){_model.config.item=0}}_model.item=_model.config.item}_model.position=0;_model.duration=_model.playlist.length>0?_model.playlist[_model.item].duration:0;_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED,{playlist:_model.playlist});_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM,{index:_model.item})}_model.loadPlaylist=function(arg){var input;if(typeof arg=="string"){if(arg.indexOf("[")==0||arg.indexOf("{")=="0"){try{input=eval(arg)}catch(err){input=arg}}else{input=arg}}else{input=arg}var config;switch(jwplayer.utils.typeOf(input)){case"object":config=input;break;case"array":config={playlist:input};break;default:config={file:input};break}_model.playlist=new jwplayer.html5.playlist(config);_model.item=_model.config.item>=0?_model.config.item:0;if(!_model.playlist[0].provider&&_model.playlist[0].file){_loadExternal(_model.playlist[0].file)}else{_loadComplete()}};function _getShuffleItem(){var result=null;if(_model.playlist.length>1){while(!jwplayer.utils.exists(result)){result=Math.floor(Math.random()*_model.playlist.length);if(result==_model.item){result=null}}}else{result=0}return result}function forward(evt){switch(evt.type){case jwplayer.api.events.JWPLAYER_MEDIA_LOADED:_container=_media.getDisplayElement();break;case jwplayer.api.events.JWPLAYER_MEDIA_MUTE:this.mute=evt.mute;break;case jwplayer.api.events.JWPLAYER_MEDIA_VOLUME:this.volume=evt.volume;break}_eventDispatcher.sendEvent(evt.type,evt)}var _mediaProviders={};_model.setActiveMediaProvider=function(playlistItem){if(playlistItem.provider=="audio"){playlistItem.provider="sound"}var provider=playlistItem.provider;var current=_media?_media.getDisplayElement():null;if(provider=="sound"||provider=="http"||provider==""){provider="video"}if(!jwplayer.utils.exists(_mediaProviders[provider])){switch(provider){case"video":_media=new jwplayer.html5.mediavideo(_model,current?current:_container);break;case"youtube":_media=new jwplayer.html5.mediayoutube(_model,current?current:_container);break}if(!jwplayer.utils.exists(_media)){return false}_media.addGlobalListener(forward);_mediaProviders[provider]=_media}else{if(_media!=_mediaProviders[provider]){if(_media){_media.stop()}_media=_mediaProviders[provider]}}return true};_model.getMedia=function(){return _media};_model.seek=function(pos){_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_SEEK,{position:_model.position,offset:pos});return _media.seek(pos)};_model.setVolume=function(newVol){_utils.saveCookie("volume",newVol);_model.volume=newVol};_model.setMute=function(state){_utils.saveCookie("mute",state);_model.mute=state};_model.setupPlugins=function(){if(!jwplayer.utils.exists(_model.plugins)||!jwplayer.utils.exists(_model.plugins.order)||_model.plugins.order.length==0){jwplayer.utils.log("No plugins to set up");return _model}for(var i=0;i<_model.plugins.order.length;i++){try{var pluginName=_model.plugins.order[i];if(jwplayer.utils.exists(jwplayer.html5[pluginName])){if(pluginName=="playlist"){_model.plugins.object[pluginName]=new jwplayer.html5.playlistcomponent(_api,_model.plugins.config[pluginName])}else{_model.plugins.object[pluginName]=new jwplayer.html5[pluginName](_api,_model.plugins.config[pluginName])}}else{_model.plugins.order.splice(plugin,plugin+1)}if(typeof _model.plugins.object[pluginName].addGlobalListener=="function"){_model.plugins.object[pluginName].addGlobalListener(forward)}}catch(err){jwplayer.utils.log("Could not setup "+pluginName)}}};return _model}})(jwplayer);(function(a){a.html5.playlist=function(b){var d=[];if(b.playlist&&b.playlist instanceof Array&&b.playlist.length>0){for(var c in b.playlist){if(!isNaN(parseInt(c))){d.push(new a.html5.playlistitem(b.playlist[c]))}}}else{d.push(new a.html5.playlistitem(b))}return d}})(jwplayer);(function(a){var c={size:180,position:a.html5.view.positions.NONE,itemheight:60,thumbs:true,fontcolor:"#000000",overcolor:"",activecolor:"",backgroundcolor:"#f8f8f8",font:"_sans",fontsize:"",fontstyle:"",fontweight:""};var b={_sans:"Arial, Helvetica, sans-serif",_serif:"Times, Times New Roman, serif",_typewriter:"Courier New, Courier, monospace"};_utils=a.utils;_css=_utils.css;_hide=function(d){_css(d,{display:"none"})};_show=function(d){_css(d,{display:"block"})};a.html5.playlistcomponent=function(r,C){var x=r;var e=a.utils.extend({},c,x.skin.getComponentSettings("playlist"),C);if(e.position==a.html5.view.positions.NONE||typeof a.html5.view.positions[e.position]=="undefined"){return}var y;var l;var D;var d;var g;var f;var k=-1;var h={background:undefined,item:undefined,itemOver:undefined,itemImage:undefined,itemActive:undefined};this.getDisplayElement=function(){return y};this.resize=function(G,E){l=G;D=E;if(x.jwGetFullscreen()){_hide(y)}else{var F={display:"block",width:l,height:D};_css(y,F)}};this.show=function(){_show(y)};this.hide=function(){_hide(y)};function j(){y=document.createElement("div");y.id=x.id+"_jwplayer_playlistcomponent";y.style.overflow="hidden";switch(e.position){case a.html5.view.positions.RIGHT:case a.html5.view.positions.LEFT:y.style.width=e.size+"px";break;case a.html5.view.positions.TOP:case a.html5.view.positions.BOTTOM:y.style.height=e.size+"px";break}B();if(h.item){e.itemheight=h.item.height}y.style.backgroundColor="#C6C6C6";x.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,s);x.jwAddEventListener(a.api.events.JWPLAYER_PLAYLIST_ITEM,v);x.jwAddEventListener(a.api.events.JWPLAYER_PLAYER_STATE,m)}function p(){var E=document.createElement("ul");_css(E,{width:y.style.width,minWidth:y.style.width,height:y.style.height,backgroundColor:e.backgroundcolor,backgroundImage:h.background?"url("+h.background.src+")":"",color:e.fontcolor,listStyle:"none",margin:0,padding:0,fontFamily:b[e.font]?b[e.font]:b._sans,fontSize:(e.fontsize?e.fontsize:11)+"px",fontStyle:e.fontstyle,fontWeight:e.fontweight,overflowY:"auto"});return E}function z(E){return function(){var F=f.getElementsByClassName("item")[E];var G=e.fontcolor;var H=h.item?"url("+h.item.src+")":"";if(E==x.jwGetPlaylistIndex()){if(e.activecolor!==""){G=e.activecolor}if(h.itemActive){H="url("+h.itemActive.src+")"}}_css(F,{color:e.overcolor!==""?e.overcolor:G,backgroundImage:h.itemOver?"url("+h.itemOver.src+")":H})}}function o(E){return function(){var F=f.getElementsByClassName("item")[E];var G=e.fontcolor;var H=h.item?"url("+h.item.src+")":"";if(E==x.jwGetPlaylistIndex()){if(e.activecolor!==""){G=e.activecolor}if(h.itemActive){H="url("+h.itemActive.src+")"}}_css(F,{color:G,backgroundImage:H})}}function q(J){var Q=d[J];var P=document.createElement("li");P.className="item";_css(P,{height:e.itemheight,display:"block",cursor:"pointer",backgroundImage:h.item?"url("+h.item.src+")":"",backgroundSize:"100% "+e.itemheight+"px"});P.onmouseover=z(J);P.onmouseout=o(J);var K=document.createElement("div");var G=new Image();var L=0;var M=0;var N=0;if(w()&&(Q.image||Q["playlist.image"]||h.itemImage)){G.className="image";if(h.itemImage){L=(e.itemheight-h.itemImage.height)/2;M=h.itemImage.width;N=h.itemImage.height}else{M=e.itemheight*4/3;N=e.itemheight}_css(K,{height:N,width:M,"float":"left",styleFloat:"left",cssFloat:"left",margin:"0 5px 0 0",background:"black",overflow:"hidden",margin:L+"px",position:"relative"});_css(G,{position:"relative"});K.appendChild(G);G.onload=function(){a.utils.stretch(a.utils.stretching.FILL,G,M,N,this.naturalWidth,this.naturalHeight)};if(Q["playlist.image"]){G.src=Q["playlist.image"]}else{if(Q.image){G.src=Q.image}else{if(h.itemImage){G.src=h.itemImage.src}}}P.appendChild(K)}var F=l-M-L*2;if(D<e.itemheight*d.length){F-=15}var E=document.createElement("div");_css(E,{position:"relative",height:"100%",overflow:"hidden"});var H=document.createElement("span");if(Q.duration>0){H.className="duration";_css(H,{fontSize:(e.fontsize?e.fontsize:11)+"px",fontWeight:(e.fontweight?e.fontweight:"bold"),width:"40px",height:e.fontsize?e.fontsize+10:20,lineHeight:24,"float":"right",styleFloat:"right",cssFloat:"right"});H.innerHTML=_utils.timeFormat(Q.duration);E.appendChild(H)}var O=document.createElement("span");O.className="title";_css(O,{padding:"5px 5px 0 "+(L?0:"5px"),height:e.fontsize?e.fontsize+10:20,lineHeight:e.fontsize?e.fontsize+10:20,overflow:"hidden","float":"left",styleFloat:"left",cssFloat:"left",width:((Q.duration>0)?F-50:F)-10+"px",fontSize:(e.fontsize?e.fontsize:13)+"px",fontWeight:(e.fontweight?e.fontweight:"bold")});O.innerHTML=Q?Q.title:"";E.appendChild(O);if(Q.description){var I=document.createElement("span");I.className="description";_css(I,{display:"block","float":"left",styleFloat:"left",cssFloat:"left",margin:0,paddingLeft:O.style.paddingLeft,paddingRight:O.style.paddingRight,lineHeight:(e.fontsize?e.fontsize+4:16)+"px",overflow:"hidden",position:"relative"});I.innerHTML=Q.description;E.appendChild(I)}P.appendChild(E);return P}function s(F){y.innerHTML="";d=t();if(!d){return}items=[];f=p();for(var G=0;G<d.length;G++){var E=q(G);E.onclick=A(G);f.appendChild(E);items.push(E)}k=x.jwGetPlaylistIndex();o(k)();y.appendChild(f);if(_utils.isIOS()&&window.iScroll){f.style.height=e.itemheight*d.length+"px";var H=new iScroll(y.id)}}function t(){var F=x.jwGetPlaylist();var G=[];for(var E=0;E<F.length;E++){if(!F[E]["ova.hidden"]){G.push(F[E])}}return G}function A(E){return function(){x.jwPlaylistItem(E);x.jwPlay(true)}}function n(){f.scrollTop=x.jwGetPlaylistIndex()*e.itemheight}function w(){return e.thumbs.toString().toLowerCase()=="true"}function v(E){if(k>=0){o(k)();k=E.index}o(E.index)();n()}function m(){if(e.position==a.html5.view.positions.OVER){switch(x.jwGetState()){case a.api.events.state.IDLE:_show(y);break;default:_hide(y);break}}}function B(){for(var E in h){h[E]=u(E)}}function u(E){return x.skin.getSkinElement("playlist",E)}j();return this}})(jwplayer);(function(b){b.html5.playlistitem=function(d){var e={author:"",date:"",description:"",image:"",link:"",mediaid:"",tags:"",title:"",provider:"",file:"",streamer:"",duration:-1,start:0,currentLevel:-1,levels:[]};var c=b.utils.extend({},e,d);if(c.type){c.provider=c.type;delete c.type}if(c.levels.length===0){c.levels[0]=new b.html5.playlistitemlevel(c)}if(!c.provider){c.provider=a(c.levels[0])}else{c.provider=c.provider.toLowerCase()}return c};function a(e){if(b.utils.isYouTube(e.file)){return"youtube"}else{var f=b.utils.extension(e.file);var c;if(f&&b.utils.extensionmap[f]){if(f=="m3u8"){return"video"}c=b.utils.extensionmap[f].html5}else{if(e.type){c=e.type}}if(c){var d=c.split("/")[0];if(d=="audio"){return"sound"}else{if(d=="video"){return d}}}}return""}})(jwplayer);(function(a){a.html5.playlistitemlevel=function(b){var d={file:"",streamer:"",bitrate:0,width:0};for(var c in d){if(a.utils.exists(b[c])){d[c]=b[c]}}return d}})(jwplayer);(function(a){a.html5.playlistloader=function(){var c=new a.html5.eventdispatcher();a.utils.extend(this,c);this.load=function(e){a.utils.ajax(e,d,b)};function d(g){var f=[];try{var f=a.utils.parsers.rssparser.parse(g.responseXML.firstChild);c.sendEvent(a.api.events.JWPLAYER_PLAYLIST_LOADED,{playlist:new a.html5.playlist({playlist:f})})}catch(h){b("Could not parse the playlist")}}function b(e){c.sendEvent(a.api.events.JWPLAYER_ERROR,{message:e?e:"Could not load playlist an unknown reason."})}}})(jwplayer);(function(a){a.html5.skin=function(){var b={};var c=false;this.load=function(d,e){new a.html5.skinloader(d,function(f){c=true;b=f;e()},function(){new a.html5.skinloader("",function(f){c=true;b=f;e()})})};this.getSkinElement=function(d,e){if(c){try{return b[d].elements[e]}catch(f){a.utils.log("No such skin component / element: ",[d,e])}}return null};this.getComponentSettings=function(d){if(c&&b&&b[d]){return b[d].settings}return null};this.getComponentLayout=function(d){if(c){return b[d].layout}return null}}})(jwplayer);(function(a){a.html5.skinloader=function(f,p,k){var o={};var c=p;var l=k;var e=true;var j;var n=f;var s=false;function m(){if(typeof n!="string"||n===""){d(a.html5.defaultSkin().xml)}else{a.utils.ajax(a.utils.getAbsolutePath(n),function(t){try{if(a.utils.exists(t.responseXML)){d(t.responseXML);return}}catch(u){h()}d(a.html5.defaultSkin().xml)},function(t){d(a.html5.defaultSkin().xml)})}}function d(y){var E=y.getElementsByTagName("component");if(E.length===0){return}for(var H=0;H<E.length;H++){var C=E[H].getAttribute("name");var B={settings:{},elements:{},layout:{}};o[C]=B;var G=E[H].getElementsByTagName("elements")[0].getElementsByTagName("element");for(var F=0;F<G.length;F++){b(G[F],C)}var z=E[H].getElementsByTagName("settings")[0];if(z&&z.childNodes.length>0){var K=z.getElementsByTagName("setting");for(var P=0;P<K.length;P++){var Q=K[P].getAttribute("name");var I=K[P].getAttribute("value");var x=/color$/.test(Q)?"color":null;o[C].settings[Q]=a.utils.typechecker(I,x)}}var L=E[H].getElementsByTagName("layout")[0];if(L&&L.childNodes.length>0){var M=L.getElementsByTagName("group");for(var w=0;w<M.length;w++){var A=M[w];o[C].layout[A.getAttribute("position")]={elements:[]};for(var O=0;O<A.attributes.length;O++){var D=A.attributes[O];o[C].layout[A.getAttribute("position")][D.name]=D.value}var N=A.getElementsByTagName("*");for(var v=0;v<N.length;v++){var t=N[v];o[C].layout[A.getAttribute("position")].elements.push({type:t.tagName});for(var u=0;u<t.attributes.length;u++){var J=t.attributes[u];o[C].layout[A.getAttribute("position")].elements[v][J.name]=J.value}if(!a.utils.exists(o[C].layout[A.getAttribute("position")].elements[v].name)){o[C].layout[A.getAttribute("position")].elements[v].name=t.tagName}}}}e=false;r()}}function r(){clearInterval(j);if(!s){j=setInterval(function(){q()},100)}}function b(y,x){var w=new Image();var t=y.getAttribute("name");var v=y.getAttribute("src");var A;if(v.indexOf("data:image/png;base64,")===0){A=v}else{var u=a.utils.getAbsolutePath(n);var z=u.substr(0,u.lastIndexOf("/"));A=[z,x,v].join("/")}o[x].elements[t]={height:0,width:0,src:"",ready:false,image:w};w.onload=function(B){g(w,t,x)};w.onerror=function(B){s=true;r();l()};w.src=A}function h(){for(var u in o){var w=o[u];for(var t in w.elements){var x=w.elements[t];var v=x.image;v.onload=null;v.onerror=null;delete x.image;delete w.elements[t]}delete o[u]}}function q(){for(var t in o){if(t!="properties"){for(var u in o[t].elements){if(!o[t].elements[u].ready){return}}}}if(e===false){clearInterval(j);c(o)}}function g(t,v,u){if(o[u]&&o[u].elements[v]){o[u].elements[v].height=t.height;o[u].elements[v].width=t.width;o[u].elements[v].src=t.src;o[u].elements[v].ready=true;r()}else{a.utils.log("Loaded an image for a missing element: "+u+"."+v)}}m()}})(jwplayer);(function(a){a.html5.api=function(c,p){var n={};var g=document.createElement("div");c.parentNode.replaceChild(g,c);g.id=c.id;n.version=a.version;n.id=g.id;var m=new a.html5.model(n,g,p);var k=new a.html5.view(n,g,m);var l=new a.html5.controller(n,g,m,k);n.skin=new a.html5.skin();n.jwPlay=function(q){if(typeof q=="undefined"){f()}else{if(q.toString().toLowerCase()=="true"){l.play()}else{l.pause()}}};n.jwPause=function(q){if(typeof q=="undefined"){f()}else{if(q.toString().toLowerCase()=="true"){l.pause()}else{l.play()}}};function f(){if(m.state==a.api.events.state.PLAYING||m.state==a.api.events.state.BUFFERING){l.pause()}else{l.play()}}n.jwStop=l.stop;n.jwSeek=l.seek;n.jwPlaylistItem=function(q){if(d){if(d.playlistClickable()){d.jwInstreamDestroy();return l.item(q)}}else{return l.item(q)}};n.jwPlaylistNext=l.next;n.jwPlaylistPrev=l.prev;n.jwResize=l.resize;n.jwLoad=l.load;n.jwDetachMedia=l.detachMedia;n.jwAttachMedia=l.attachMedia;function j(q){return function(){return m[q]}}function e(q,s,r){return function(){var t=m.plugins.object[q];if(t&&t[s]&&typeof t[s]=="function"){t[s].apply(t,r)}}}n.jwGetPlaylistIndex=j("item");n.jwGetPosition=j("position");n.jwGetDuration=j("duration");n.jwGetBuffer=j("buffer");n.jwGetWidth=j("width");n.jwGetHeight=j("height");n.jwGetFullscreen=j("fullscreen");n.jwSetFullscreen=l.setFullscreen;n.jwGetVolume=j("volume");n.jwSetVolume=l.setVolume;n.jwGetMute=j("mute");n.jwSetMute=l.setMute;n.jwGetStretching=function(){return m.stretching.toUpperCase()};n.jwGetState=j("state");n.jwGetVersion=function(){return n.version};n.jwGetPlaylist=function(){return m.playlist};n.jwAddEventListener=l.addEventListener;n.jwRemoveEventListener=l.removeEventListener;n.jwSendEvent=l.sendEvent;n.jwDockSetButton=function(t,q,r,s){if(m.plugins.object.dock&&m.plugins.object.dock.setButton){m.plugins.object.dock.setButton(t,q,r,s)}};n.jwControlbarShow=e("controlbar","show");n.jwControlbarHide=e("controlbar","hide");n.jwDockShow=e("dock","show");n.jwDockHide=e("dock","hide");n.jwDisplayShow=e("display","show");n.jwDisplayHide=e("display","hide");var d;n.jwLoadInstream=function(r,q){if(!d){d=new a.html5.instream(n,m,k,l)}setTimeout(function(){d.load(r,q)},10)};n.jwInstreamDestroy=function(){if(d){d.jwInstreamDestroy()}};n.jwInstreamAddEventListener=o("jwInstreamAddEventListener");n.jwInstreamRemoveEventListener=o("jwInstreamRemoveEventListener");n.jwInstreamGetState=o("jwInstreamGetState");n.jwInstreamGetDuration=o("jwInstreamGetDuration");n.jwInstreamGetPosition=o("jwInstreamGetPosition");n.jwInstreamPlay=o("jwInstreamPlay");n.jwInstreamPause=o("jwInstreamPause");n.jwInstreamSeek=o("jwInstreamSeek");function o(q){return function(){if(d&&typeof d[q]=="function"){return d[q].apply(this,arguments)}else{_utils.log("Could not call instream method - instream API not initialized")}}}n.jwGetLevel=function(){};n.jwGetBandwidth=function(){};n.jwGetLockState=function(){};n.jwLock=function(){};n.jwUnlock=function(){};function b(){if(m.config.playlistfile){m.addEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,h);m.loadPlaylist(m.config.playlistfile)}else{if(typeof m.config.playlist=="string"){m.addEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,h);m.loadPlaylist(m.config.playlist)}else{m.loadPlaylist(m.config);setTimeout(h,25)}}}function h(q){m.removeEventListener(a.api.events.JWPLAYER_PLAYLIST_LOADED,h);m.setupPlugins();k.setup();var q={id:n.id,version:n.version};l.playerReady(q)}if(m.config.chromeless&&!a.utils.isIOS()){b()}else{n.skin.load(m.config.skin,b)}return n}})(jwplayer)};
$(function () {
	if (document.getElementById('galler') != null)
		$(".gallery a[rel^='prettyPhoto']").prettyPhoto();
	var currSiteUrl = $('#currentSiteUrl').val();
	if (document.getElementById('inner-page-slider') != null) {
		$('#inner-page-slider').after('<div id="inner-page-slider-pager">').cycle({
			fx: 'scrollHorz',
			speed: 400,
			pause: 1,
			timeout: 4500,
			next: '#inner-page-slider-next',
			prev: '#inner-page-slider-prev',
			pager: '#inner-page-slider-pager',
			pagerAnchorBuilder: function (idx, slide) {
				return '<a href="#">&nbsp;</a>';
			}
		});
	}


});

//changed the path to '/content/dam/.*' at required places

function vplayercall(istreamfile, hei, contid, startmode) {
	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/content/dam/infosys-web/en/audio/vplayer.swf',
		'playlistfile': istreamfile,
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': '100%',
		'height': hei,
        'mute': 'false',
//		'logo.file': '/content/dam/infosys-web/en/global-resource/images/' +  logoimagename,       commented
//		'logo.position': 'top-left',															commented   	
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
//		'skin': '/richmedia/players/vskin/infosys.zip',        									commented
		'controlbar.position': 'over',
		'plugins': {
			'/content/dam/infosys-web/en/audio/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercallFill(istreamfile, preimage, wid, hei, contid, startmode) {

	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/richmedia/players/vplayer.swf',
		'playlistfile': '/Videos/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': '100%',
		'height': hei - 10,
		'logo.file': '/SiteCollectionImages/infosys-logo.png',
		'logo.position': 'top-left',
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'skin': '/richmedia/players/vskin/infosys.zip',
		'stretching': 'fill',
		'controlbar.position': 'over',
		'plugins': {
			'/richmedia/players/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercallhei(istreamfile, preimage, wid, hei, contid, startmode) {
	jwplayer(contid).setup({
		'autostart': startmode,
		'flashplayer': '/richmedia/players/vplayer.swf',
		'playlistfile': '/Videos/vplayer/' + istreamfile + '.xml',
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'width': '100%',
		'logo.file': '/SiteCollectionImages/infosys-logo.png',
		'logo.position': 'top-left',
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'skin': '/richmedia/players/vskin/infosys.zip',
		'stretching': 'fill',
		'controlbar.position': 'over',
		'plugins': {
			'/richmedia/players/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}
		}
	});
}

function vplayercAudio(istreamfile, wid, contid, startmode) {
	var screenWidth = $(window).width();
	var playerhei = "55";
	if (screenWidth > 1024) {
		playerhei = "22";
	}
	jwplayer(contid).setup({

		'autostart': startmode,
		'flashplayer': '/content/dam/infosys-web/en/audio/vplayer.swf',
		'playlistfile': istreamfile,
		'backcolor': '000000',
		'frontcolor': 'EEEEEE',
		'lightcolor': '66FFFF',
		'controlbar': 'bottom',
 //       'mute': 'false',
		'width': wid,
		'height': playerhei,
		'author': 'Infosys Limited',
		'abouttext': 'Infosys Limited',
		'aboutlink': 'http://www.infosys.com',
		'plugins': {
			'/content/dam/infosys-web/en/audio/viral-2h.swf': {
				onpause: 'false',
				oncomplete: 'false',
				allowmenu: 'false',
				functions: 'embed'
			}

		}
	});
}
/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.5.9
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
!function(a){"use strict";"function"==typeof define&&define.amd?define(["jquery"],a):"undefined"!=typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){"use strict";var b=window.Slick||{};b=function(){function c(c,d){var f,e=this;e.defaults={accessibility:!0,adaptiveHeight:!1,appendArrows:a(c),appendDots:a(c),arrows:!0,asNavFor:null,prevArrow:'<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',nextArrow:'<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',autoplay:!1,autoplaySpeed:3e3,centerMode:!1,centerPadding:"50px",cssEase:"ease",customPaging:function(a,b){return'<button type="button" data-role="none" role="button" aria-required="false" tabindex="0">'+(b+1)+"</button>"},dots:!1,dotsClass:"slick-dots",draggable:!0,easing:"linear",edgeFriction:.35,fade:!1,focusOnSelect:!1,infinite:!0,initialSlide:0,lazyLoad:"ondemand",mobileFirst:!1,pauseOnHover:!0,pauseOnDotsHover:!1,respondTo:"window",responsive:null,rows:1,rtl:!1,slide:"",slidesPerRow:1,slidesToShow:1,slidesToScroll:1,speed:500,swipe:!0,swipeToSlide:!1,touchMove:!0,touchThreshold:5,useCSS:!0,useTransform:!1,variableWidth:!1,vertical:!1,verticalSwiping:!1,waitForAnimate:!0,zIndex:1e3},e.initials={animating:!1,dragging:!1,autoPlayTimer:null,currentDirection:0,currentLeft:null,currentSlide:0,direction:1,$dots:null,listWidth:null,listHeight:null,loadIndex:0,$nextArrow:null,$prevArrow:null,slideCount:null,slideWidth:null,$slideTrack:null,$slides:null,sliding:!1,slideOffset:0,swipeLeft:null,$list:null,touchObject:{},transformsEnabled:!1,unslicked:!1},a.extend(e,e.initials),e.activeBreakpoint=null,e.animType=null,e.animProp=null,e.breakpoints=[],e.breakpointSettings=[],e.cssTransitions=!1,e.hidden="hidden",e.paused=!1,e.positionProp=null,e.respondTo=null,e.rowCount=1,e.shouldClick=!0,e.$slider=a(c),e.$slidesCache=null,e.transformType=null,e.transitionType=null,e.visibilityChange="visibilitychange",e.windowWidth=0,e.windowTimer=null,f=a(c).data("slick")||{},e.options=a.extend({},e.defaults,f,d),e.currentSlide=e.options.initialSlide,e.originalSettings=e.options,"undefined"!=typeof document.mozHidden?(e.hidden="mozHidden",e.visibilityChange="mozvisibilitychange"):"undefined"!=typeof document.webkitHidden&&(e.hidden="webkitHidden",e.visibilityChange="webkitvisibilitychange"),e.autoPlay=a.proxy(e.autoPlay,e),e.autoPlayClear=a.proxy(e.autoPlayClear,e),e.changeSlide=a.proxy(e.changeSlide,e),e.clickHandler=a.proxy(e.clickHandler,e),e.selectHandler=a.proxy(e.selectHandler,e),e.setPosition=a.proxy(e.setPosition,e),e.swipeHandler=a.proxy(e.swipeHandler,e),e.dragHandler=a.proxy(e.dragHandler,e),e.keyHandler=a.proxy(e.keyHandler,e),e.autoPlayIterator=a.proxy(e.autoPlayIterator,e),e.instanceUid=b++,e.htmlExpr=/^(?:\s*(<[\w\W]+>)[^>]*)$/,e.registerBreakpoints(),e.init(!0),e.checkResponsive(!0)}var b=0;return c}(),b.prototype.addSlide=b.prototype.slickAdd=function(b,c,d){var e=this;if("boolean"==typeof c)d=c,c=null;else if(0>c||c>=e.slideCount)return!1;e.unload(),"number"==typeof c?0===c&&0===e.$slides.length?a(b).appendTo(e.$slideTrack):d?a(b).insertBefore(e.$slides.eq(c)):a(b).insertAfter(e.$slides.eq(c)):d===!0?a(b).prependTo(e.$slideTrack):a(b).appendTo(e.$slideTrack),e.$slides=e.$slideTrack.children(this.options.slide),e.$slideTrack.children(this.options.slide).detach(),e.$slideTrack.append(e.$slides),e.$slides.each(function(b,c){a(c).attr("data-slick-index",b)}),e.$slidesCache=e.$slides,e.reinit()},b.prototype.animateHeight=function(){var a=this;if(1===a.options.slidesToShow&&a.options.adaptiveHeight===!0&&a.options.vertical===!1){var b=a.$slides.eq(a.currentSlide).outerHeight(!0);a.$list.animate({height:b},a.options.speed)}},b.prototype.animateSlide=function(b,c){var d={},e=this;e.animateHeight(),e.options.rtl===!0&&e.options.vertical===!1&&(b=-b),e.transformsEnabled===!1?e.options.vertical===!1?e.$slideTrack.animate({left:b},e.options.speed,e.options.easing,c):e.$slideTrack.animate({top:b},e.options.speed,e.options.easing,c):e.cssTransitions===!1?(e.options.rtl===!0&&(e.currentLeft=-e.currentLeft),a({animStart:e.currentLeft}).animate({animStart:b},{duration:e.options.speed,easing:e.options.easing,step:function(a){a=Math.ceil(a),e.options.vertical===!1?(d[e.animType]="translate("+a+"px, 0px)",e.$slideTrack.css(d)):(d[e.animType]="translate(0px,"+a+"px)",e.$slideTrack.css(d))},complete:function(){c&&c.call()}})):(e.applyTransition(),b=Math.ceil(b),e.options.vertical===!1?d[e.animType]="translate3d("+b+"px, 0px, 0px)":d[e.animType]="translate3d(0px,"+b+"px, 0px)",e.$slideTrack.css(d),c&&setTimeout(function(){e.disableTransition(),c.call()},e.options.speed))},b.prototype.asNavFor=function(b){var c=this,d=c.options.asNavFor;d&&null!==d&&(d=a(d).not(c.$slider)),null!==d&&"object"==typeof d&&d.each(function(){var c=a(this).slick("getSlick");c.unslicked||c.slideHandler(b,!0)})},b.prototype.applyTransition=function(a){var b=this,c={};b.options.fade===!1?c[b.transitionType]=b.transformType+" "+b.options.speed+"ms "+b.options.cssEase:c[b.transitionType]="opacity "+b.options.speed+"ms "+b.options.cssEase,b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.autoPlay=function(){var a=this;a.autoPlayTimer&&clearInterval(a.autoPlayTimer),a.slideCount>a.options.slidesToShow&&a.paused!==!0&&(a.autoPlayTimer=setInterval(a.autoPlayIterator,a.options.autoplaySpeed))},b.prototype.autoPlayClear=function(){var a=this;a.autoPlayTimer&&clearInterval(a.autoPlayTimer)},b.prototype.autoPlayIterator=function(){var a=this;a.options.infinite===!1?1===a.direction?(a.currentSlide+1===a.slideCount-1&&(a.direction=0),a.slideHandler(a.currentSlide+a.options.slidesToScroll)):(a.currentSlide-1===0&&(a.direction=1),a.slideHandler(a.currentSlide-a.options.slidesToScroll)):a.slideHandler(a.currentSlide+a.options.slidesToScroll)},b.prototype.buildArrows=function(){var b=this;b.options.arrows===!0&&(b.$prevArrow=a(b.options.prevArrow).addClass("slick-arrow"),b.$nextArrow=a(b.options.nextArrow).addClass("slick-arrow"),b.slideCount>b.options.slidesToShow?(b.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),b.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),b.htmlExpr.test(b.options.prevArrow)&&b.$prevArrow.prependTo(b.options.appendArrows),b.htmlExpr.test(b.options.nextArrow)&&b.$nextArrow.appendTo(b.options.appendArrows),b.options.infinite!==!0&&b.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true")):b.$prevArrow.add(b.$nextArrow).addClass("slick-hidden").attr({"aria-disabled":"true",tabindex:"-1"}))},b.prototype.buildDots=function(){var c,d,b=this;if(b.options.dots===!0&&b.slideCount>b.options.slidesToShow){for(d='<ul class="'+b.options.dotsClass+'">',c=0;c<=b.getDotCount();c+=1)d+="<li>"+b.options.customPaging.call(this,b,c)+"</li>";d+="</ul>",b.$dots=a(d).appendTo(b.options.appendDots),b.$dots.find("li").first().addClass("slick-active").attr("aria-hidden","false")}},b.prototype.buildOut=function(){var b=this;b.$slides=b.$slider.children(b.options.slide+":not(.slick-cloned)").addClass("slick-slide"),b.slideCount=b.$slides.length,b.$slides.each(function(b,c){a(c).attr("data-slick-index",b).data("originalStyling",a(c).attr("style")||"")}),b.$slider.addClass("slick-slider"),b.$slideTrack=0===b.slideCount?a('<div class="slick-track"/>').appendTo(b.$slider):b.$slides.wrapAll('<div class="slick-track"/>').parent(),b.$list=b.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(),b.$slideTrack.css("opacity",0),(b.options.centerMode===!0||b.options.swipeToSlide===!0)&&(b.options.slidesToScroll=1),a("img[data-lazy]",b.$slider).not("[src]").addClass("slick-loading"),b.setupInfinite(),b.buildArrows(),b.buildDots(),b.updateDots(),b.setSlideClasses("number"==typeof b.currentSlide?b.currentSlide:0),b.options.draggable===!0&&b.$list.addClass("draggable")},b.prototype.buildRows=function(){var b,c,d,e,f,g,h,a=this;if(e=document.createDocumentFragment(),g=a.$slider.children(),a.options.rows>1){for(h=a.options.slidesPerRow*a.options.rows,f=Math.ceil(g.length/h),b=0;f>b;b++){var i=document.createElement("div");for(c=0;c<a.options.rows;c++){var j=document.createElement("div");for(d=0;d<a.options.slidesPerRow;d++){var k=b*h+(c*a.options.slidesPerRow+d);g.get(k)&&j.appendChild(g.get(k))}i.appendChild(j)}e.appendChild(i)}a.$slider.html(e),a.$slider.children().children().children().css({width:100/a.options.slidesPerRow+"%",display:"inline-block"})}},b.prototype.checkResponsive=function(b,c){var e,f,g,d=this,h=!1,i=d.$slider.width(),j=window.innerWidth||a(window).width();if("window"===d.respondTo?g=j:"slider"===d.respondTo?g=i:"min"===d.respondTo&&(g=Math.min(j,i)),d.options.responsive&&d.options.responsive.length&&null!==d.options.responsive){f=null;for(e in d.breakpoints)d.breakpoints.hasOwnProperty(e)&&(d.originalSettings.mobileFirst===!1?g<d.breakpoints[e]&&(f=d.breakpoints[e]):g>d.breakpoints[e]&&(f=d.breakpoints[e]));null!==f?null!==d.activeBreakpoint?(f!==d.activeBreakpoint||c)&&(d.activeBreakpoint=f,"unslick"===d.breakpointSettings[f]?d.unslick(f):(d.options=a.extend({},d.originalSettings,d.breakpointSettings[f]),b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b)),h=f):(d.activeBreakpoint=f,"unslick"===d.breakpointSettings[f]?d.unslick(f):(d.options=a.extend({},d.originalSettings,d.breakpointSettings[f]),b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b)),h=f):null!==d.activeBreakpoint&&(d.activeBreakpoint=null,d.options=d.originalSettings,b===!0&&(d.currentSlide=d.options.initialSlide),d.refresh(b),h=f),b||h===!1||d.$slider.trigger("breakpoint",[d,h])}},b.prototype.changeSlide=function(b,c){var f,g,h,d=this,e=a(b.target);switch(e.is("a")&&b.preventDefault(),e.is("li")||(e=e.closest("li")),h=d.slideCount%d.options.slidesToScroll!==0,f=h?0:(d.slideCount-d.currentSlide)%d.options.slidesToScroll,b.data.message){case"previous":g=0===f?d.options.slidesToScroll:d.options.slidesToShow-f,d.slideCount>d.options.slidesToShow&&d.slideHandler(d.currentSlide-g,!1,c);break;case"next":g=0===f?d.options.slidesToScroll:f,d.slideCount>d.options.slidesToShow&&d.slideHandler(d.currentSlide+g,!1,c);break;case"index":var i=0===b.data.index?0:b.data.index||e.index()*d.options.slidesToScroll;d.slideHandler(d.checkNavigable(i),!1,c),e.children().trigger("focus");break;default:return}},b.prototype.checkNavigable=function(a){var c,d,b=this;if(c=b.getNavigableIndexes(),d=0,a>c[c.length-1])a=c[c.length-1];else for(var e in c){if(a<c[e]){a=d;break}d=c[e]}return a},b.prototype.cleanUpEvents=function(){var b=this;b.options.dots&&null!==b.$dots&&(a("li",b.$dots).off("click.slick",b.changeSlide),b.options.pauseOnDotsHover===!0&&b.options.autoplay===!0&&a("li",b.$dots).off("mouseenter.slick",a.proxy(b.setPaused,b,!0)).off("mouseleave.slick",a.proxy(b.setPaused,b,!1))),b.options.arrows===!0&&b.slideCount>b.options.slidesToShow&&(b.$prevArrow&&b.$prevArrow.off("click.slick",b.changeSlide),b.$nextArrow&&b.$nextArrow.off("click.slick",b.changeSlide)),b.$list.off("touchstart.slick mousedown.slick",b.swipeHandler),b.$list.off("touchmove.slick mousemove.slick",b.swipeHandler),b.$list.off("touchend.slick mouseup.slick",b.swipeHandler),b.$list.off("touchcancel.slick mouseleave.slick",b.swipeHandler),b.$list.off("click.slick",b.clickHandler),a(document).off(b.visibilityChange,b.visibility),b.$list.off("mouseenter.slick",a.proxy(b.setPaused,b,!0)),b.$list.off("mouseleave.slick",a.proxy(b.setPaused,b,!1)),b.options.accessibility===!0&&b.$list.off("keydown.slick",b.keyHandler),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().off("click.slick",b.selectHandler),a(window).off("orientationchange.slick.slick-"+b.instanceUid,b.orientationChange),a(window).off("resize.slick.slick-"+b.instanceUid,b.resize),a("[draggable!=true]",b.$slideTrack).off("dragstart",b.preventDefault),a(window).off("load.slick.slick-"+b.instanceUid,b.setPosition),a(document).off("ready.slick.slick-"+b.instanceUid,b.setPosition)},b.prototype.cleanUpRows=function(){var b,a=this;a.options.rows>1&&(b=a.$slides.children().children(),b.removeAttr("style"),a.$slider.html(b))},b.prototype.clickHandler=function(a){var b=this;b.shouldClick===!1&&(a.stopImmediatePropagation(),a.stopPropagation(),a.preventDefault())},b.prototype.destroy=function(b){var c=this;c.autoPlayClear(),c.touchObject={},c.cleanUpEvents(),a(".slick-cloned",c.$slider).detach(),c.$dots&&c.$dots.remove(),c.$prevArrow&&c.$prevArrow.length&&(c.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),c.htmlExpr.test(c.options.prevArrow)&&c.$prevArrow.remove()),c.$nextArrow&&c.$nextArrow.length&&(c.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display",""),c.htmlExpr.test(c.options.nextArrow)&&c.$nextArrow.remove()),c.$slides&&(c.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function(){a(this).attr("style",a(this).data("originalStyling"))}),c.$slideTrack.children(this.options.slide).detach(),c.$slideTrack.detach(),c.$list.detach(),c.$slider.append(c.$slides)),c.cleanUpRows(),c.$slider.removeClass("slick-slider"),c.$slider.removeClass("slick-initialized"),c.unslicked=!0,b||c.$slider.trigger("destroy",[c])},b.prototype.disableTransition=function(a){var b=this,c={};c[b.transitionType]="",b.options.fade===!1?b.$slideTrack.css(c):b.$slides.eq(a).css(c)},b.prototype.fadeSlide=function(a,b){var c=this;c.cssTransitions===!1?(c.$slides.eq(a).css({zIndex:c.options.zIndex}),c.$slides.eq(a).animate({opacity:1},c.options.speed,c.options.easing,b)):(c.applyTransition(a),c.$slides.eq(a).css({opacity:1,zIndex:c.options.zIndex}),b&&setTimeout(function(){c.disableTransition(a),b.call()},c.options.speed))},b.prototype.fadeSlideOut=function(a){var b=this;b.cssTransitions===!1?b.$slides.eq(a).animate({opacity:0,zIndex:b.options.zIndex-2},b.options.speed,b.options.easing):(b.applyTransition(a),b.$slides.eq(a).css({opacity:0,zIndex:b.options.zIndex-2}))},b.prototype.filterSlides=b.prototype.slickFilter=function(a){var b=this;null!==a&&(b.$slidesCache=b.$slides,b.unload(),b.$slideTrack.children(this.options.slide).detach(),b.$slidesCache.filter(a).appendTo(b.$slideTrack),b.reinit())},b.prototype.getCurrent=b.prototype.slickCurrentSlide=function(){var a=this;return a.currentSlide},b.prototype.getDotCount=function(){var a=this,b=0,c=0,d=0;if(a.options.infinite===!0)for(;b<a.slideCount;)++d,b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;else if(a.options.centerMode===!0)d=a.slideCount;else for(;b<a.slideCount;)++d,b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;return d-1},b.prototype.getLeft=function(a){var c,d,f,b=this,e=0;return b.slideOffset=0,d=b.$slides.first().outerHeight(!0),b.options.infinite===!0?(b.slideCount>b.options.slidesToShow&&(b.slideOffset=b.slideWidth*b.options.slidesToShow*-1,e=d*b.options.slidesToShow*-1),b.slideCount%b.options.slidesToScroll!==0&&a+b.options.slidesToScroll>b.slideCount&&b.slideCount>b.options.slidesToShow&&(a>b.slideCount?(b.slideOffset=(b.options.slidesToShow-(a-b.slideCount))*b.slideWidth*-1,e=(b.options.slidesToShow-(a-b.slideCount))*d*-1):(b.slideOffset=b.slideCount%b.options.slidesToScroll*b.slideWidth*-1,e=b.slideCount%b.options.slidesToScroll*d*-1))):a+b.options.slidesToShow>b.slideCount&&(b.slideOffset=(a+b.options.slidesToShow-b.slideCount)*b.slideWidth,e=(a+b.options.slidesToShow-b.slideCount)*d),b.slideCount<=b.options.slidesToShow&&(b.slideOffset=0,e=0),b.options.centerMode===!0&&b.options.infinite===!0?b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)-b.slideWidth:b.options.centerMode===!0&&(b.slideOffset=0,b.slideOffset+=b.slideWidth*Math.floor(b.options.slidesToShow/2)),c=b.options.vertical===!1?a*b.slideWidth*-1+b.slideOffset:a*d*-1+e,b.options.variableWidth===!0&&(f=b.slideCount<=b.options.slidesToShow||b.options.infinite===!1?b.$slideTrack.children(".slick-slide").eq(a):b.$slideTrack.children(".slick-slide").eq(a+b.options.slidesToShow),c=b.options.rtl===!0?f[0]?-1*(b.$slideTrack.width()-f[0].offsetLeft-f.width()):0:f[0]?-1*f[0].offsetLeft:0,b.options.centerMode===!0&&(f=b.slideCount<=b.options.slidesToShow||b.options.infinite===!1?b.$slideTrack.children(".slick-slide").eq(a):b.$slideTrack.children(".slick-slide").eq(a+b.options.slidesToShow+1),c=b.options.rtl===!0?f[0]?-1*(b.$slideTrack.width()-f[0].offsetLeft-f.width()):0:f[0]?-1*f[0].offsetLeft:0,c+=(b.$list.width()-f.outerWidth())/2)),c},b.prototype.getOption=b.prototype.slickGetOption=function(a){var b=this;return b.options[a]},b.prototype.getNavigableIndexes=function(){var e,a=this,b=0,c=0,d=[];for(a.options.infinite===!1?e=a.slideCount:(b=-1*a.options.slidesToScroll,c=-1*a.options.slidesToScroll,e=2*a.slideCount);e>b;)d.push(b),b=c+a.options.slidesToScroll,c+=a.options.slidesToScroll<=a.options.slidesToShow?a.options.slidesToScroll:a.options.slidesToShow;return d},b.prototype.getSlick=function(){return this},b.prototype.getSlideCount=function(){var c,d,e,b=this;return e=b.options.centerMode===!0?b.slideWidth*Math.floor(b.options.slidesToShow/2):0,b.options.swipeToSlide===!0?(b.$slideTrack.find(".slick-slide").each(function(c,f){return f.offsetLeft-e+a(f).outerWidth()/2>-1*b.swipeLeft?(d=f,!1):void 0}),c=Math.abs(a(d).attr("data-slick-index")-b.currentSlide)||1):b.options.slidesToScroll},b.prototype.goTo=b.prototype.slickGoTo=function(a,b){var c=this;c.changeSlide({data:{message:"index",index:parseInt(a)}},b)},b.prototype.init=function(b){var c=this;a(c.$slider).hasClass("slick-initialized")||(a(c.$slider).addClass("slick-initialized"),c.buildRows(),c.buildOut(),c.setProps(),c.startLoad(),c.loadSlider(),c.initializeEvents(),c.updateArrows(),c.updateDots()),b&&c.$slider.trigger("init",[c]),c.options.accessibility===!0&&c.initADA()},b.prototype.initArrowEvents=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.on("click.slick",{message:"previous"},a.changeSlide),a.$nextArrow.on("click.slick",{message:"next"},a.changeSlide))},b.prototype.initDotEvents=function(){var b=this;b.options.dots===!0&&b.slideCount>b.options.slidesToShow&&a("li",b.$dots).on("click.slick",{message:"index"},b.changeSlide),b.options.dots===!0&&b.options.pauseOnDotsHover===!0&&b.options.autoplay===!0&&a("li",b.$dots).on("mouseenter.slick",a.proxy(b.setPaused,b,!0)).on("mouseleave.slick",a.proxy(b.setPaused,b,!1))},b.prototype.initializeEvents=function(){var b=this;b.initArrowEvents(),b.initDotEvents(),b.$list.on("touchstart.slick mousedown.slick",{action:"start"},b.swipeHandler),b.$list.on("touchmove.slick mousemove.slick",{action:"move"},b.swipeHandler),b.$list.on("touchend.slick mouseup.slick",{action:"end"},b.swipeHandler),b.$list.on("touchcancel.slick mouseleave.slick",{action:"end"},b.swipeHandler),b.$list.on("click.slick",b.clickHandler),a(document).on(b.visibilityChange,a.proxy(b.visibility,b)),b.$list.on("mouseenter.slick",a.proxy(b.setPaused,b,!0)),b.$list.on("mouseleave.slick",a.proxy(b.setPaused,b,!1)),b.options.accessibility===!0&&b.$list.on("keydown.slick",b.keyHandler),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().on("click.slick",b.selectHandler),a(window).on("orientationchange.slick.slick-"+b.instanceUid,a.proxy(b.orientationChange,b)),a(window).on("resize.slick.slick-"+b.instanceUid,a.proxy(b.resize,b)),a("[draggable!=true]",b.$slideTrack).on("dragstart",b.preventDefault),a(window).on("load.slick.slick-"+b.instanceUid,b.setPosition),a(document).on("ready.slick.slick-"+b.instanceUid,b.setPosition)},b.prototype.initUI=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.show(),a.$nextArrow.show()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.show(),a.options.autoplay===!0&&a.autoPlay()},b.prototype.keyHandler=function(a){var b=this;a.target.tagName.match("TEXTAREA|INPUT|SELECT")||(37===a.keyCode&&b.options.accessibility===!0?b.changeSlide({data:{message:"previous"}}):39===a.keyCode&&b.options.accessibility===!0&&b.changeSlide({data:{message:"next"}}))},b.prototype.lazyLoad=function(){function g(b){a("img[data-lazy]",b).each(function(){var b=a(this),c=a(this).attr("data-lazy"),d=document.createElement("img");d.onload=function(){b.animate({opacity:0},100,function(){b.attr("src",c).animate({opacity:1},200,function(){b.removeAttr("data-lazy").removeClass("slick-loading")})})},d.src=c})}var c,d,e,f,b=this;b.options.centerMode===!0?b.options.infinite===!0?(e=b.currentSlide+(b.options.slidesToShow/2+1),f=e+b.options.slidesToShow+2):(e=Math.max(0,b.currentSlide-(b.options.slidesToShow/2+1)),f=2+(b.options.slidesToShow/2+1)+b.currentSlide):(e=b.options.infinite?b.options.slidesToShow+b.currentSlide:b.currentSlide,f=e+b.options.slidesToShow,b.options.fade===!0&&(e>0&&e--,f<=b.slideCount&&f++)),c=b.$slider.find(".slick-slide").slice(e,f),g(c),b.slideCount<=b.options.slidesToShow?(d=b.$slider.find(".slick-slide"),g(d)):b.currentSlide>=b.slideCount-b.options.slidesToShow?(d=b.$slider.find(".slick-cloned").slice(0,b.options.slidesToShow),g(d)):0===b.currentSlide&&(d=b.$slider.find(".slick-cloned").slice(-1*b.options.slidesToShow),g(d))},b.prototype.loadSlider=function(){var a=this;a.setPosition(),a.$slideTrack.css({opacity:1}),a.$slider.removeClass("slick-loading"),a.initUI(),"progressive"===a.options.lazyLoad&&a.progressiveLazyLoad()},b.prototype.next=b.prototype.slickNext=function(){var a=this;a.changeSlide({data:{message:"next"}})},b.prototype.orientationChange=function(){var a=this;a.checkResponsive(),a.setPosition()},b.prototype.pause=b.prototype.slickPause=function(){var a=this;a.autoPlayClear(),a.paused=!0},b.prototype.play=b.prototype.slickPlay=function(){var a=this;a.paused=!1,a.autoPlay()},b.prototype.postSlide=function(a){var b=this;b.$slider.trigger("afterChange",[b,a]),b.animating=!1,b.setPosition(),b.swipeLeft=null,b.options.autoplay===!0&&b.paused===!1&&b.autoPlay(),b.options.accessibility===!0&&b.initADA()},b.prototype.prev=b.prototype.slickPrev=function(){var a=this;a.changeSlide({data:{message:"previous"}})},b.prototype.preventDefault=function(a){a.preventDefault()},b.prototype.progressiveLazyLoad=function(){var c,d,b=this;c=a("img[data-lazy]",b.$slider).length,c>0&&(d=a("img[data-lazy]",b.$slider).first(),d.attr("src",null),d.attr("src",d.attr("data-lazy")).removeClass("slick-loading").load(function(){d.removeAttr("data-lazy"),b.progressiveLazyLoad(),b.options.adaptiveHeight===!0&&b.setPosition()}).error(function(){d.removeAttr("data-lazy"),b.progressiveLazyLoad()}))},b.prototype.refresh=function(b){var d,e,c=this;e=c.slideCount-c.options.slidesToShow,c.options.infinite||(c.slideCount<=c.options.slidesToShow?c.currentSlide=0:c.currentSlide>e&&(c.currentSlide=e)),d=c.currentSlide,c.destroy(!0),a.extend(c,c.initials,{currentSlide:d}),c.init(),b||c.changeSlide({data:{message:"index",index:d}},!1)},b.prototype.registerBreakpoints=function(){var c,d,e,b=this,f=b.options.responsive||null;if("array"===a.type(f)&&f.length){b.respondTo=b.options.respondTo||"window";for(c in f)if(e=b.breakpoints.length-1,d=f[c].breakpoint,f.hasOwnProperty(c)){for(;e>=0;)b.breakpoints[e]&&b.breakpoints[e]===d&&b.breakpoints.splice(e,1),e--;b.breakpoints.push(d),b.breakpointSettings[d]=f[c].settings}b.breakpoints.sort(function(a,c){return b.options.mobileFirst?a-c:c-a})}},b.prototype.reinit=function(){var b=this;b.$slides=b.$slideTrack.children(b.options.slide).addClass("slick-slide"),b.slideCount=b.$slides.length,b.currentSlide>=b.slideCount&&0!==b.currentSlide&&(b.currentSlide=b.currentSlide-b.options.slidesToScroll),b.slideCount<=b.options.slidesToShow&&(b.currentSlide=0),b.registerBreakpoints(),b.setProps(),b.setupInfinite(),b.buildArrows(),b.updateArrows(),b.initArrowEvents(),b.buildDots(),b.updateDots(),b.initDotEvents(),b.checkResponsive(!1,!0),b.options.focusOnSelect===!0&&a(b.$slideTrack).children().on("click.slick",b.selectHandler),b.setSlideClasses(0),b.setPosition(),b.$slider.trigger("reInit",[b]),b.options.autoplay===!0&&b.focusHandler()},b.prototype.resize=function(){var b=this;a(window).width()!==b.windowWidth&&(clearTimeout(b.windowDelay),b.windowDelay=window.setTimeout(function(){b.windowWidth=a(window).width(),b.checkResponsive(),b.unslicked||b.setPosition()},50))},b.prototype.removeSlide=b.prototype.slickRemove=function(a,b,c){var d=this;return"boolean"==typeof a?(b=a,a=b===!0?0:d.slideCount-1):a=b===!0?--a:a,d.slideCount<1||0>a||a>d.slideCount-1?!1:(d.unload(),c===!0?d.$slideTrack.children().remove():d.$slideTrack.children(this.options.slide).eq(a).remove(),d.$slides=d.$slideTrack.children(this.options.slide),d.$slideTrack.children(this.options.slide).detach(),d.$slideTrack.append(d.$slides),d.$slidesCache=d.$slides,void d.reinit())},b.prototype.setCSS=function(a){var d,e,b=this,c={};b.options.rtl===!0&&(a=-a),d="left"==b.positionProp?Math.ceil(a)+"px":"0px",e="top"==b.positionProp?Math.ceil(a)+"px":"0px",c[b.positionProp]=a,b.transformsEnabled===!1?b.$slideTrack.css(c):(c={},b.cssTransitions===!1?(c[b.animType]="translate("+d+", "+e+")",b.$slideTrack.css(c)):(c[b.animType]="translate3d("+d+", "+e+", 0px)",b.$slideTrack.css(c)))},b.prototype.setDimensions=function(){var a=this;a.options.vertical===!1?a.options.centerMode===!0&&a.$list.css({padding:"0px "+a.options.centerPadding}):(a.$list.height(a.$slides.first().outerHeight(!0)*a.options.slidesToShow),a.options.centerMode===!0&&a.$list.css({padding:a.options.centerPadding+" 0px"})),a.listWidth=a.$list.width(),a.listHeight=a.$list.height(),a.options.vertical===!1&&a.options.variableWidth===!1?(a.slideWidth=Math.ceil(a.listWidth/a.options.slidesToShow),a.$slideTrack.width(Math.ceil(a.slideWidth*a.$slideTrack.children(".slick-slide").length))):a.options.variableWidth===!0?a.$slideTrack.width(5e3*a.slideCount):(a.slideWidth=Math.ceil(a.listWidth),a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0)*a.$slideTrack.children(".slick-slide").length)));var b=a.$slides.first().outerWidth(!0)-a.$slides.first().width();a.options.variableWidth===!1&&a.$slideTrack.children(".slick-slide").width(a.slideWidth-b)},b.prototype.setFade=function(){var c,b=this;b.$slides.each(function(d,e){c=b.slideWidth*d*-1,b.options.rtl===!0?a(e).css({position:"relative",right:c,top:0,zIndex:b.options.zIndex-2,opacity:0}):a(e).css({position:"relative",left:c,top:0,zIndex:b.options.zIndex-2,opacity:0})}),b.$slides.eq(b.currentSlide).css({zIndex:b.options.zIndex-1,opacity:1})},b.prototype.setHeight=function(){var a=this;if(1===a.options.slidesToShow&&a.options.adaptiveHeight===!0&&a.options.vertical===!1){var b=a.$slides.eq(a.currentSlide).outerHeight(!0);a.$list.css("height",b)}},b.prototype.setOption=b.prototype.slickSetOption=function(b,c,d){var f,g,e=this;if("responsive"===b&&"array"===a.type(c))for(g in c)if("array"!==a.type(e.options.responsive))e.options.responsive=[c[g]];else{for(f=e.options.responsive.length-1;f>=0;)e.options.responsive[f].breakpoint===c[g].breakpoint&&e.options.responsive.splice(f,1),f--;e.options.responsive.push(c[g])}else e.options[b]=c;d===!0&&(e.unload(),e.reinit())},b.prototype.setPosition=function(){var a=this;a.setDimensions(),a.setHeight(),a.options.fade===!1?a.setCSS(a.getLeft(a.currentSlide)):a.setFade(),a.$slider.trigger("setPosition",[a])},b.prototype.setProps=function(){var a=this,b=document.body.style;a.positionProp=a.options.vertical===!0?"top":"left","top"===a.positionProp?a.$slider.addClass("slick-vertical"):a.$slider.removeClass("slick-vertical"),(void 0!==b.WebkitTransition||void 0!==b.MozTransition||void 0!==b.msTransition)&&a.options.useCSS===!0&&(a.cssTransitions=!0),a.options.fade&&("number"==typeof a.options.zIndex?a.options.zIndex<3&&(a.options.zIndex=3):a.options.zIndex=a.defaults.zIndex),void 0!==b.OTransform&&(a.animType="OTransform",a.transformType="-o-transform",a.transitionType="OTransition",void 0===b.perspectiveProperty&&void 0===b.webkitPerspective&&(a.animType=!1)),void 0!==b.MozTransform&&(a.animType="MozTransform",a.transformType="-moz-transform",a.transitionType="MozTransition",void 0===b.perspectiveProperty&&void 0===b.MozPerspective&&(a.animType=!1)),void 0!==b.webkitTransform&&(a.animType="webkitTransform",a.transformType="-webkit-transform",a.transitionType="webkitTransition",void 0===b.perspectiveProperty&&void 0===b.webkitPerspective&&(a.animType=!1)),void 0!==b.msTransform&&(a.animType="msTransform",a.transformType="-ms-transform",a.transitionType="msTransition",void 0===b.msTransform&&(a.animType=!1)),void 0!==b.transform&&a.animType!==!1&&(a.animType="transform",a.transformType="transform",a.transitionType="transition"),a.transformsEnabled=a.options.useTransform&&null!==a.animType&&a.animType!==!1},b.prototype.setSlideClasses=function(a){var c,d,e,f,b=this;d=b.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden","true"),b.$slides.eq(a).addClass("slick-current"),b.options.centerMode===!0?(c=Math.floor(b.options.slidesToShow/2),b.options.infinite===!0&&(a>=c&&a<=b.slideCount-1-c?b.$slides.slice(a-c,a+c+1).addClass("slick-active").attr("aria-hidden","false"):(e=b.options.slidesToShow+a,d.slice(e-c+1,e+c+2).addClass("slick-active").attr("aria-hidden","false")),0===a?d.eq(d.length-1-b.options.slidesToShow).addClass("slick-center"):a===b.slideCount-1&&d.eq(b.options.slidesToShow).addClass("slick-center")),b.$slides.eq(a).addClass("slick-center")):a>=0&&a<=b.slideCount-b.options.slidesToShow?b.$slides.slice(a,a+b.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false"):d.length<=b.options.slidesToShow?d.addClass("slick-active").attr("aria-hidden","false"):(f=b.slideCount%b.options.slidesToShow,e=b.options.infinite===!0?b.options.slidesToShow+a:a,b.options.slidesToShow==b.options.slidesToScroll&&b.slideCount-a<b.options.slidesToShow?d.slice(e-(b.options.slidesToShow-f),e+f).addClass("slick-active").attr("aria-hidden","false"):d.slice(e,e+b.options.slidesToShow).addClass("slick-active").attr("aria-hidden","false")),"ondemand"===b.options.lazyLoad&&b.lazyLoad()},b.prototype.setupInfinite=function(){var c,d,e,b=this;if(b.options.fade===!0&&(b.options.centerMode=!1),b.options.infinite===!0&&b.options.fade===!1&&(d=null,b.slideCount>b.options.slidesToShow)){for(e=b.options.centerMode===!0?b.options.slidesToShow+1:b.options.slidesToShow,c=b.slideCount;c>b.slideCount-e;c-=1)d=c-1,a(b.$slides[d]).clone(!0).attr("id","").attr("data-slick-index",d-b.slideCount).prependTo(b.$slideTrack).addClass("slick-cloned");for(c=0;e>c;c+=1)d=c,a(b.$slides[d]).clone(!0).attr("id","").attr("data-slick-index",d+b.slideCount).appendTo(b.$slideTrack).addClass("slick-cloned");b.$slideTrack.find(".slick-cloned").find("[id]").each(function(){a(this).attr("id","")})}},b.prototype.setPaused=function(a){var b=this;b.options.autoplay===!0&&b.options.pauseOnHover===!0&&(b.paused=a,a?b.autoPlayClear():b.autoPlay())},b.prototype.selectHandler=function(b){var c=this,d=a(b.target).is(".slick-slide")?a(b.target):a(b.target).parents(".slick-slide"),e=parseInt(d.attr("data-slick-index"));return e||(e=0),c.slideCount<=c.options.slidesToShow?(c.setSlideClasses(e),void c.asNavFor(e)):void c.slideHandler(e)},b.prototype.slideHandler=function(a,b,c){var d,e,f,g,h=null,i=this;return b=b||!1,i.animating===!0&&i.options.waitForAnimate===!0||i.options.fade===!0&&i.currentSlide===a||i.slideCount<=i.options.slidesToShow?void 0:(b===!1&&i.asNavFor(a),d=a,h=i.getLeft(d),g=i.getLeft(i.currentSlide),i.currentLeft=null===i.swipeLeft?g:i.swipeLeft,i.options.infinite===!1&&i.options.centerMode===!1&&(0>a||a>i.getDotCount()*i.options.slidesToScroll)?void(i.options.fade===!1&&(d=i.currentSlide,c!==!0?i.animateSlide(g,function(){i.postSlide(d);
}):i.postSlide(d))):i.options.infinite===!1&&i.options.centerMode===!0&&(0>a||a>i.slideCount-i.options.slidesToScroll)?void(i.options.fade===!1&&(d=i.currentSlide,c!==!0?i.animateSlide(g,function(){i.postSlide(d)}):i.postSlide(d))):(i.options.autoplay===!0&&clearInterval(i.autoPlayTimer),e=0>d?i.slideCount%i.options.slidesToScroll!==0?i.slideCount-i.slideCount%i.options.slidesToScroll:i.slideCount+d:d>=i.slideCount?i.slideCount%i.options.slidesToScroll!==0?0:d-i.slideCount:d,i.animating=!0,i.$slider.trigger("beforeChange",[i,i.currentSlide,e]),f=i.currentSlide,i.currentSlide=e,i.setSlideClasses(i.currentSlide),i.updateDots(),i.updateArrows(),i.options.fade===!0?(c!==!0?(i.fadeSlideOut(f),i.fadeSlide(e,function(){i.postSlide(e)})):i.postSlide(e),void i.animateHeight()):void(c!==!0?i.animateSlide(h,function(){i.postSlide(e)}):i.postSlide(e))))},b.prototype.startLoad=function(){var a=this;a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&(a.$prevArrow.hide(),a.$nextArrow.hide()),a.options.dots===!0&&a.slideCount>a.options.slidesToShow&&a.$dots.hide(),a.$slider.addClass("slick-loading")},b.prototype.swipeDirection=function(){var a,b,c,d,e=this;return a=e.touchObject.startX-e.touchObject.curX,b=e.touchObject.startY-e.touchObject.curY,c=Math.atan2(b,a),d=Math.round(180*c/Math.PI),0>d&&(d=360-Math.abs(d)),45>=d&&d>=0?e.options.rtl===!1?"left":"right":360>=d&&d>=315?e.options.rtl===!1?"left":"right":d>=135&&225>=d?e.options.rtl===!1?"right":"left":e.options.verticalSwiping===!0?d>=35&&135>=d?"left":"right":"vertical"},b.prototype.swipeEnd=function(a){var c,b=this;if(b.dragging=!1,b.shouldClick=b.touchObject.swipeLength>10?!1:!0,void 0===b.touchObject.curX)return!1;if(b.touchObject.edgeHit===!0&&b.$slider.trigger("edge",[b,b.swipeDirection()]),b.touchObject.swipeLength>=b.touchObject.minSwipe)switch(b.swipeDirection()){case"left":c=b.options.swipeToSlide?b.checkNavigable(b.currentSlide+b.getSlideCount()):b.currentSlide+b.getSlideCount(),b.slideHandler(c),b.currentDirection=0,b.touchObject={},b.$slider.trigger("swipe",[b,"left"]);break;case"right":c=b.options.swipeToSlide?b.checkNavigable(b.currentSlide-b.getSlideCount()):b.currentSlide-b.getSlideCount(),b.slideHandler(c),b.currentDirection=1,b.touchObject={},b.$slider.trigger("swipe",[b,"right"])}else b.touchObject.startX!==b.touchObject.curX&&(b.slideHandler(b.currentSlide),b.touchObject={})},b.prototype.swipeHandler=function(a){var b=this;if(!(b.options.swipe===!1||"ontouchend"in document&&b.options.swipe===!1||b.options.draggable===!1&&-1!==a.type.indexOf("mouse")))switch(b.touchObject.fingerCount=a.originalEvent&&void 0!==a.originalEvent.touches?a.originalEvent.touches.length:1,b.touchObject.minSwipe=b.listWidth/b.options.touchThreshold,b.options.verticalSwiping===!0&&(b.touchObject.minSwipe=b.listHeight/b.options.touchThreshold),a.data.action){case"start":b.swipeStart(a);break;case"move":b.swipeMove(a);break;case"end":b.swipeEnd(a)}},b.prototype.swipeMove=function(a){var d,e,f,g,h,b=this;return h=void 0!==a.originalEvent?a.originalEvent.touches:null,!b.dragging||h&&1!==h.length?!1:(d=b.getLeft(b.currentSlide),b.touchObject.curX=void 0!==h?h[0].pageX:a.clientX,b.touchObject.curY=void 0!==h?h[0].pageY:a.clientY,b.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(b.touchObject.curX-b.touchObject.startX,2))),b.options.verticalSwiping===!0&&(b.touchObject.swipeLength=Math.round(Math.sqrt(Math.pow(b.touchObject.curY-b.touchObject.startY,2)))),e=b.swipeDirection(),"vertical"!==e?(void 0!==a.originalEvent&&b.touchObject.swipeLength>4&&a.preventDefault(),g=(b.options.rtl===!1?1:-1)*(b.touchObject.curX>b.touchObject.startX?1:-1),b.options.verticalSwiping===!0&&(g=b.touchObject.curY>b.touchObject.startY?1:-1),f=b.touchObject.swipeLength,b.touchObject.edgeHit=!1,b.options.infinite===!1&&(0===b.currentSlide&&"right"===e||b.currentSlide>=b.getDotCount()&&"left"===e)&&(f=b.touchObject.swipeLength*b.options.edgeFriction,b.touchObject.edgeHit=!0),b.options.vertical===!1?b.swipeLeft=d+f*g:b.swipeLeft=d+f*(b.$list.height()/b.listWidth)*g,b.options.verticalSwiping===!0&&(b.swipeLeft=d+f*g),b.options.fade===!0||b.options.touchMove===!1?!1:b.animating===!0?(b.swipeLeft=null,!1):void b.setCSS(b.swipeLeft)):void 0)},b.prototype.swipeStart=function(a){var c,b=this;return 1!==b.touchObject.fingerCount||b.slideCount<=b.options.slidesToShow?(b.touchObject={},!1):(void 0!==a.originalEvent&&void 0!==a.originalEvent.touches&&(c=a.originalEvent.touches[0]),b.touchObject.startX=b.touchObject.curX=void 0!==c?c.pageX:a.clientX,b.touchObject.startY=b.touchObject.curY=void 0!==c?c.pageY:a.clientY,void(b.dragging=!0))},b.prototype.unfilterSlides=b.prototype.slickUnfilter=function(){var a=this;null!==a.$slidesCache&&(a.unload(),a.$slideTrack.children(this.options.slide).detach(),a.$slidesCache.appendTo(a.$slideTrack),a.reinit())},b.prototype.unload=function(){var b=this;a(".slick-cloned",b.$slider).remove(),b.$dots&&b.$dots.remove(),b.$prevArrow&&b.htmlExpr.test(b.options.prevArrow)&&b.$prevArrow.remove(),b.$nextArrow&&b.htmlExpr.test(b.options.nextArrow)&&b.$nextArrow.remove(),b.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden","true").css("width","")},b.prototype.unslick=function(a){var b=this;b.$slider.trigger("unslick",[b,a]),b.destroy()},b.prototype.updateArrows=function(){var b,a=this;b=Math.floor(a.options.slidesToShow/2),a.options.arrows===!0&&a.slideCount>a.options.slidesToShow&&!a.options.infinite&&(a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false"),a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false"),0===a.currentSlide?(a.$prevArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled","false")):a.currentSlide>=a.slideCount-a.options.slidesToShow&&a.options.centerMode===!1?(a.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")):a.currentSlide>=a.slideCount-1&&a.options.centerMode===!0&&(a.$nextArrow.addClass("slick-disabled").attr("aria-disabled","true"),a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled","false")))},b.prototype.updateDots=function(){var a=this;null!==a.$dots&&(a.$dots.find("li").removeClass("slick-active").attr("aria-hidden","true"),a.$dots.find("li").eq(Math.floor(a.currentSlide/a.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden","false"))},b.prototype.visibility=function(){var a=this;document[a.hidden]?(a.paused=!0,a.autoPlayClear()):a.options.autoplay===!0&&(a.paused=!1,a.autoPlay())},b.prototype.initADA=function(){var b=this;b.$slides.add(b.$slideTrack.find(".slick-cloned")).attr({"aria-hidden":"true",tabindex:"-1"}).find("a, input, button, select").attr({tabindex:"-1"}),b.$slideTrack.attr("role","listbox"),b.$slides.not(b.$slideTrack.find(".slick-cloned")).each(function(c){a(this).attr({role:"option","aria-describedby":"slick-slide"+b.instanceUid+c})}),null!==b.$dots&&b.$dots.attr("role","tablist").find("li").each(function(c){a(this).attr({role:"presentation","aria-selected":"false","aria-controls":"navigation"+b.instanceUid+c,id:"slick-slide"+b.instanceUid+c})}).first().attr("aria-selected","true").end().find("button").attr("role","button").end().closest("div").attr("role","toolbar"),b.activateADA()},b.prototype.activateADA=function(){var a=this;a.$slideTrack.find(".slick-active").attr({"aria-hidden":"false"}).find("a, input, button, select").attr({tabindex:"0"})},b.prototype.focusHandler=function(){var b=this;b.$slider.on("focus.slick blur.slick","*",function(c){c.stopImmediatePropagation();var d=a(this);setTimeout(function(){b.isPlay&&(d.is(":focus")?(b.autoPlayClear(),b.paused=!0):(b.paused=!1,b.autoPlay()))},0)})},a.fn.slick=function(){var f,g,a=this,c=arguments[0],d=Array.prototype.slice.call(arguments,1),e=a.length;for(f=0;e>f;f++)if("object"==typeof c||"undefined"==typeof c?a[f].slick=new b(a[f],c):g=a[f].slick[c].apply(a[f].slick,d),"undefined"!=typeof g)return g;return a}});
$(document).ready(function () { var initialview=parseInt($('.slider-nav').attr("initialview"));
var deskview=parseInt($('.slider-nav').attr("deskview"));
var tabview=parseInt($('.slider-nav').attr("tabview"));
var mobview=parseInt($('.slider-nav').attr("mobview"));
var pmobview=parseInt($('.slider-nav').attr("pmobview"));
$('.slider-single').slick({
                slidesToShow: 1,
               slidesToScroll: 1,
               arrows: false,
                focusOnSelect: false,
               adaptiveHeight: false,
               infinite: false,
                useTransform: true,
               speed: 400,
                //fade: true,
                cssEase: 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
                //dots: true,
});

$('.slider-nav').on('init', function(event, slick) {
               $('.slider-nav .slick-slide.slick-current').addClass('is-active');
})
.slick({
                slidesToShow: initialview,
                slidesToScroll: initialview,
                dots: false,
                focusOnSelect: false,
                infinite: false,
                arrows: true,
                responsive: [{
                                breakpoint: 1200,
                                settings: {
                                                slidesToShow: deskview,
                                                slidesToScroll: deskview,
                                }
                },{
                                breakpoint: 1025,
                                settings: {
                                                slidesToShow: tabview,
                                                slidesToScroll: tabview,
                                }
                }, {
                                breakpoint: 992,
                                settings: {
                                                slidesToShow: mobview,
                                                slidesToScroll: mobview,
                                }
                }, {
                                breakpoint: 640,
                                settings: {
                                                slidesToShow: pmobview,
                                                slidesToScroll: pmobview,
                }
                }]
});

$('.slider-single').on('afterChange', function(event, slick, currentSlide) {
               $('.slider-nav').slick('slickGoTo', currentSlide);
               var currrentNavSlideElem = '.slider-nav .slick-slide[data-slick-index="' + currentSlide + '"]';
               $('.slider-nav .slick-slide.is-active').removeClass('is-active');
               $(currrentNavSlideElem).addClass('is-active');
});

$('.slider-nav').on('click', '.slick-slide', function(event) {
               event.preventDefault();
               var goToSingleSlide = $(this).data('slick-index');

               $('.slider-single').slick('slickGoTo', goToSingleSlide);
});

});
$(function() {

	function checkTags(tags) {
		$.each(tags, function() {
			$("#search-tags input[value=\"" + this + "\"]").prop("checked", true);
		});
	}

	function checkCategories(categories) {
		$.each(categories, function() {
			$("#search-categories input[value=\"" + this + "\"]").prop("checked", true);
		});
	}

	function checkIndustries(industries) {
		$.each(industries, function() {
			$("#search-industries input[value=\"" + this + "\"]").prop("checked", true);
		});
	}

	function uncheckCategories() {
		$("#search-categories input").each(function() {
			$(this).prop("checked", false);
		});
	}

	function uncheckIndustries() {
		$("#search-industries input").each(function() {
			$(this).prop("checked", false);
		});
	}

	function getQueryParams() {
		var object = {};
		var string = location.search;
		if (string) {
			var array = string.substr(1).split("&");
			array.forEach(function(item) {
				var str = item.split("=");
				var key = str[0];
				var val = decodeURIComponent(str[1]).replace(/\+/g, " ");
				object.hasOwnProperty(key) ? object[key].push(val) : object[key] = [ val ];
			});
		}
		return object;
	}

	$("#search-banner-form").on("keypress", "input", function(e) {
		if (e.which == 13) {
			$("#search-banner-offset").val(0);
			$("#search-banner-form").submit();
		}
	});

	$("#search-empty").on("click", "a", function() {
		$("#search-banner-text").val($(this).text());
		$("#search-banner-offset").val(0);
		$("#search-banner-form").submit();
	});

	$("#search-tags").on("change", "input", function() {
		$("#search-offset").val(0);
		$("#search-form").submit();
	});

	$("#search-categories").on("click", "a", function() {
		if ($(this).text() === "Clear") {
			uncheckCategories();
		}
		$("#search-offset").val(0);
		$("#search-form").submit();
	});

	$("#search-industries").on("click", "a", function() {
		if ($(this).text() === "Clear") {
			uncheckIndustries();
		}
		$("#search-offset").val(0);
		$("#search-form").submit();
	});

	$("#search-pagination").on("click", "a", function() {
		if ($("#search-form").length) {
			$("#search-offset").val($(this).data("offset"));
			$("#search-form").submit();
		} else {
			$("#search-banner-offset").val($(this).data("offset"));
			$("#search-banner-form").submit();
		}
	});

	var object = getQueryParams();
	if (object.hasOwnProperty("t")) {
		checkTags(object["t"]);
	}
	if (object.hasOwnProperty("c")) {
		checkCategories(object["c"]);
	}
	if (object.hasOwnProperty("i")) {
		checkIndustries(object["i"]);
	}

});

$(document).ready(function(){
$('.leader_tabs li').each(function(index){

						$(this).attr('id','demo_'+index);
               		 });

                       $('.leader_tabs li').click(function(){

                           $(this).siblings().removeClass('active');
                            $(this).addClass('active');
                            var activeIndex = $(this).index() + 1;



                            localStorage.setItem('mySelectValue', activeIndex);


                       });

							window.onload =  console.log('');

						 var activeIndex =+ localStorage.getItem('mySelectValue');

                          if (isNaN(activeIndex)) {
        					console.log('');
   						 } else {
        					$('.leader_tabs li:nth-child('+activeIndex+')').addClass('active');



    						}


    if($("#leadership").length>0) {
        var x = $('#leadership').position();
        x1 = x.top;
        window.scrollTo(0, x1);
    }

      });
// Easy Responsive Tabs Plugin
(function ($) {
    $.fn.extend({
        easyResponsiveTabs: function (options) {
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                type: 'default', //default, vertical, accordion;
                width: 'auto',
                fit: true,
                closed: false,
                activate: function(){}
            }
            //Variables
            var options = $.extend(defaults, options);            
            var opt = options, jtype = opt.type, jfit = opt.fit, jwidth = opt.width, vtabs = 'vertical', accord = 'accordion';

            //Events
            $(this).bind('tabactivate', function(e, currentTab) {
                if(typeof options.activate === 'function') {
                    options.activate.call(currentTab, e)
                }
            });

            //Main function
            this.each(function () {
                var $respTabs = $(this);
                var $respTabsList = $respTabs.find('ul.resp-tabs-list');
                $respTabs.find('ul.resp-tabs-list li').addClass('resp-tab-item');
                $respTabs.css({
                    'display': 'block',
                    'width': jwidth
                });

                $respTabs.find('.resp-tabs-container > div').addClass('resp-tab-content');
                jtab_options();
                //Properties Function
                function jtab_options() {
                    if (jtype == vtabs) {
                        $respTabs.addClass('resp-vtabs');
                    }
                    if (jfit == true) {
                        $respTabs.css({ width: '100%', margin: '0px' });
                    }
                    if (jtype == accord) {
                        $respTabs.addClass('resp-easy-accordion');
                        $respTabs.find('.resp-tabs-list').css('display', 'none');
                    }
                }

                //Assigning the h2 markup to accordion title
                var $tabItemh2;
                $respTabs.find('.resp-tab-content').before("<div class='resp-accordion' role='tab'><span class='resp-arrow'></span></div>");

                var itemCount = 0;
                $respTabs.find('.resp-accordion').each(function () {
                    $tabItemh2 = $(this);
                    var innertext = $respTabs.find('.resp-tab-item:eq(' + itemCount + ')').html();
                    $respTabs.find('.resp-accordion:eq(' + itemCount + ')').append(innertext);
                    $tabItemh2.attr('aria-controls', 'tab_item-' + (itemCount));
                    itemCount++;
                });

                //Assigning the 'aria-controls' to Tab items
                var count = 0,
                    $tabContent;
                $respTabs.find('.resp-tab-item').each(function () {
                    $tabItem = $(this);
                    $tabItem.attr('aria-controls', 'tab_item-' + (count));
                    $tabItem.attr('role', 'tab');

                    //First active tab, keep closed if option = 'closed' or option is 'accordion' and the element is in accordion mode 
                    if(options.closed !== true && !(options.closed === 'accordion' && !$respTabsList.is(':visible')) && !(options.closed === 'tabs' && $respTabsList.is(':visible'))) {                  
                        $respTabs.find('.resp-tab-item').first().addClass('resp-tab-active');
                        $respTabs.find('.resp-accordion').first().addClass('resp-tab-active');
                        $respTabs.find('.resp-tab-content').first().addClass('resp-tab-content-active').attr('style', 'display:block');
                    }

                    //Assigning the 'aria-labelledby' attr to tab-content
                    var tabcount = 0;
                    $respTabs.find('.resp-tab-content').each(function () {
                        $tabContent = $(this);
                        $tabContent.attr('aria-labelledby', 'tab_item-' + (tabcount));
                        tabcount++;
                    });
                    count++;
                });

                //Tab Click action function
                $respTabs.find("[role=tab]").each(function () {
                    var $currentTab = $(this);
                    $currentTab.click(function () {

                        var $tabAria = $currentTab.attr('aria-controls');

                        if ($currentTab.hasClass('resp-accordion') && $currentTab.hasClass('resp-tab-active')) {
                            $respTabs.find('.resp-tab-content-active').slideUp('', function () { $(this).addClass('resp-accordion-closed'); });
                            $currentTab.removeClass('resp-tab-active');
                            return false;
                        }
                        if (!$currentTab.hasClass('resp-tab-active') && $currentTab.hasClass('resp-accordion')) {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').slideUp().removeClass('resp-tab-content-active resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');

                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').slideDown().addClass('resp-tab-content-active');
                        } else {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').removeAttr('style').removeClass('resp-tab-content-active').removeClass('resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').addClass('resp-tab-content-active').attr('style', 'display:block');
                        }
                        //Trigger tab activation event
                        $currentTab.trigger('tabactivate', $currentTab);
                    });
                    //Window resize function                   
                    $(window).resize(function () {
                        $respTabs.find('.resp-accordion-closed').removeAttr('style');
                    });
                });
            });
        }
    });
})(jQuery);
/*--------extra js added by Yoga do toggle as per page properties---------*/
$(document).ready(function () {
    var activeIcon = $('#isgrid').val();
    if(activeIcon=="true")
    {
        $('#items-group .item-list').removeClass('list-group-item col-md-12 col-sm-12 col-xs-12').addClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
                                $('.thumbnail').addClass('col-md-12 col-sm-12 col-xs-12 p0').removeClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-12');
                                $('.caption-txt').addClass('col-md-12 col-sm-12 col-xs-12 relative-off').removeClass('col-md-9 col-md-pull-3 col-sm-9 col-sm-pull-3 col-xs-12');
                                $('.title-box-yellow').addClass('minus-top-grd').removeClass('minus-top-lst');
                                $('.lng-txt').find('.title-box-yellow').removeClass('minus-top-grd');
                                $('#items-group').find('.lng-txt').addClass('pt10');
                                setTagPositionHeight();

                                $('#grid').addClass('active');
								$('#list').removeClass('active');
    }
    else if(activeIcon=="false")
    {
                                $('#items-group .item-list').addClass('list-group-item col-md-12 col-sm-12 col-xs-12').removeClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
                                $('.thumbnail').addClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-push-0').removeClass('col-md-12 col-sm-12 col-xs-12 p0');
                               // $('.caption-txt').addClass('col-md-9 col-sm-9 col-md-pull-3 col-sm-pull-3 col-xs-12 col-xs-pull-0').removeClass('col-md-12 col-sm-12 col-xs-12 relative-off');
                                $('.bg-white .mb-xs-20').addClass('p0');
                                $('.title-box-yellow').addClass('minus-top-lst').removeClass('minus-top-grd');
                                $('#items-group').find('.lng-txt').removeClass('pt10');
                                $('.pos-abs').css('top', '0px', 'position', 'absolute');

                                $('#list').addClass('active');
        						$('#grid').removeClass('active');
    }
});


/* -------------  Success stories Case studies Grid / List change  Part ---------------*/
	$(document).on("click", "#grid", function (e) {
		e.preventDefault();
		$('#items-group .item-list').removeClass('list-group-item col-md-12 col-sm-12 col-xs-12').addClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-12 col-sm-12 col-xs-12 p0').removeClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-12');
		$('.caption-txt').addClass('col-md-12 col-sm-12 col-xs-12 relative-off').removeClass('col-md-9 col-md-pull-3 col-sm-9 col-sm-pull-3 col-xs-12');
		$('.title-box-yellow').addClass('minus-top-grd').removeClass('minus-top-lst');
		$('.lng-txt').find('.title-box-yellow').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').addClass('pt10');
		setTagPositionHeight();

		$('#grid').addClass('active');
		$('#list').removeClass('active');

	});

	$(document).on("click", "#list", function (e) {
		e.preventDefault();
		$('#items-group .item-list').addClass('list-group-item col-md-12 col-sm-12 col-xs-12').removeClass('grid-group-item col-md-4 col-sm-4 col-xs-12');
		$('.thumbnail').addClass('col-md-3 col-sm-3 col-xs-12 col-md-push-9 col-sm-push-9 col-xs-push-0').removeClass('col-md-12 col-sm-12 col-xs-12 p0');
		$('.caption-txt').addClass('col-md-9 col-sm-9 col-md-pull-3 col-sm-pull-3 col-xs-12 col-xs-pull-0').removeClass('col-md-12 col-sm-12 col-xs-12 relative-off');
		$('.bg-white .mb-xs-20').addClass('p0');
		$('.title-box-yellow').addClass('minus-top-lst').removeClass('minus-top-grd');
		$('#items-group').find('.lng-txt').removeClass('pt10');
		$('.pos-abs').css('top', '0px', 'position', 'absolute');

		$('#grid').removeClass('active');
		$('#list').addClass('active');
	});

	function setTagPositionHeight() {
		$('.equal-bg, .item-list').each(function () {
			$(this).find('.tag-postion').css('top', $(this).find('.get-image-height').height());
		});
	}

/* ------------- Success Stories Mobile drop-down Part ---------------*/
	$(document).on("click", ".select-case", function () {
		$(".option-case").toggleClass("open-case");
	});

	$(document).on('click', 'body', function (e) {
		if (!$(e.target).is('.select-case > a')) {
			$('.option-case.open-case').removeClass('open-case');
		}
	});

var getSelectIndexValue;
var getSelectOptions;
var prevSelect = '';
var locYear;
var sDownload;

$(document).ready(function(){
    //added code for ipad device
    var currentURL = window.location.search;
    //fetch the query values.
    year = getParameterByName('year');
    //to keep the year mentioned in url as selected in the dropdown on page load.
    $("#articleYearFilter").val(year).find("option[value="+year+"]").attr('selected', true);
    
    $(".list-inline social-share-pr").hide();
    
    var showDate = $('#hiddenShowDate').val();
    if(showDate == "true"){
        
        $('.press-release-date').show();
        
    }
    else{
        
        $('.press-release-date').hide();
        
    }
    var showDownload = $('#hiddenShowDownload').val()
    
    if(showDownload == "true"){
        sDownload =true;
        $('.pr-download').show();
        
    }
    else{
        sDownload =false;
        $('.pr-download').hide();
    }
    var  showShare = $('#hiddenShowShare').val();
    
    
    if(showShare == "true"){
        $('.last trigger-share-pr relative').show();
        
        
    }
    else{
        
        $('.last trigger-share-pr relative').hide();
    }
    
    var showDescription = $('#hiddenShowDescription').val();
    if(showDescription == "true"){
        $('.press-release-description').show();
    }
    else{
        $('.press-release-description').hide();
    }
    
});



var itemsCount;
var year;

function GetLoadMoreArticles() {
    
    
    var activeFlag = null;
    try
    {
        
        //var action = $(".show-more-press").attr("data-action");
        var method = $(".show-more-press").attr("data-method");
        
        
        //alert(action);
        //alert(method);
        
        
    }
    catch(err)
    {
        activeFlag="na";
    }
    
    
    var jsonData = {}
    var jsonObject = JSON.stringify(jsonData);
    
    itemsCount = document.getElementById("items-group").firstElementChild.children.length;
    var urlParams = new URLSearchParams(window.location.search);
    year = urlParams.get('year');
    if(year == null)
    {
        year = "";
    }
    
    var resData = null;
    var ispr =  $('#hiddenIsPR').val();
    var isevents =  $('#hiddenIsEvents').val();
    var showmoretext =   $('#hiddenShowMoreText').val();
    var url =$('#hiddenRootURL').val();
    
    var queryPart;
    var queryURL;
    var urlParams = new URLSearchParams(window.location.search);
    
    year = urlParams.get('year');
    tag = urlParams.get('tag');
    media = urlParams.get('media');
    
    if(year != null)
    {
        if(queryPart!=null)
        {
            queryPart=queryPart+"&year="+year;
        }
        else
        {
            queryPart="&year="+year;
        }
    }
    
    if(tag!=null)
        
    {
        if(queryPart!=null)
        {
            queryPart=queryPart+"&tag="+tag;
        }
        else
        {
            queryPart="&tag="+tag;
        }
    }
    
    if(tag!=null)
        
    {
        if(queryPart!=null)
        {
            queryPart=queryPart+"&media="+media;
        }
        else
        {
            queryPart="&media="+media;
        }
    }
    
    if(queryPart!=null)
    {
        queryURL="/bin/infosys/press-release?currentItemsCount="+itemsCount+"&ispr="+ispr+"&isevents="+isevents+"&url="+url+queryPart;
    }
    else
    {
        queryURL="/bin/infosys/press-release?currentItemsCount="+itemsCount+"&ispr="+ispr+"&isevents="+isevents+"&url="+url;
    }
    
    
    $.ajax({
        type: method,
        contentType: "application/json; charset=utf-8",
        url: queryURL,
        data: jsonObject,
        dataType: "json",
        processData: true,		
        success: function (responseData) {
            resData = responseData;
            insertArticleHTML(resData); //insert the child elements on load more
            
            
        },
        error: function (xhr, ajaxOptions, thrownError) {
            
        }
    });
    return false;
    
}



function insertArticleHTML(resData) {
    
    
    
    // let pageObjs = JSON.parse(resData);
    var pageObjs = JSON.parse(resData);
    var HTML =" ";
    
    //$('#items-group').empty();
    for(i=0;i<pageObjs.length;i++)
        
    {
        
        var loadMoreHTMLTitle = pageObjs[i].pageTitle;
        var loadMoreHTMLResource=pageObjs[i].pageResourceURL;
        var loadMoreHTMLDescription = pageObjs[i].pageShortDescription;
        var loadMoreButton =  pageObjs[i].pageShowMore;
        var loadMoreArticleDate =  pageObjs[i].pageArticleDate;   
        var loadMoreArticleMediaCAtegory =  pageObjs[i].pageMediaCategory; 
        var loadMoreRefLink  =pageObjs[i].pagePDFLInk;
        var loadMoreArticleLink =pageObjs[i].pageTitleURL;
		var loadMoreTitleOpenInNewTab =pageObjs[i].pageTitleOpenInNewTab;
        var loadMorePDFOpenInNewTab =pageObjs[i].pagePDFOpenInNewTab;

        var pressReleaseItem = $('.item-list');
        if(pressReleaseItem && pressReleaseItem.length>0){
            
            pressReleaseItem=pressReleaseItem[0];
            pressReleaseItem=$(pressReleaseItem).clone();
            
            
            var title=$(pressReleaseItem).find('.press-release-title');
            
            if(title && $(pressReleaseItem).find('.press-release-title').length>0){
                $(title).html(loadMoreHTMLTitle);
                $(title).attr('title',loadMoreHTMLTitle);
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
            }
            
            
            
            
            
            //social share
            
            var socialTitle=$(pressReleaseItem).find('.socialTitle');
            
            if(socialTitle && $(pressReleaseItem).find('.socialTitle').length>0){
                
                $(socialTitle).attr('data-title',loadMoreHTMLTitle);
                
                var urlofarticle;
                if(loadMoreArticleLink != "null")
                {
                    urlofarticle=loadMoreArticleLink;
                }
                else
                {
                    urlofarticle=loadMoreHTMLResource;
                }
                
                
                $(socialTitle).attr('data-link',urlofarticle);
                
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
            }
            
            
            
            
            
            // on show more appending the next child elements for title description
            var description=$(pressReleaseItem).find('.press-release-description');
            
            if(description && $(pressReleaseItem).find('.press-release-description').length>0){
                $(description).html(loadMoreHTMLDescription);
                
                if(loadMoreHTMLDescription == "null"){
                    
                    $(description).text('');
                    
                }
                else{
                    var divEle =  $('#items-group').children().first();
                    divEle.append(pressReleaseItem );
                    
                }
            }
            
            
            // on show more appending the next child elements for title link
            var refLink=$(pressReleaseItem).find('#Url');
            
            if(refLink && $(pressReleaseItem).find('#Url').length>0){
                
                var urlofarticle;
                
                if(loadMoreArticleLink != "null")
                {
                    urlofarticle=loadMoreArticleLink;
                }
                else
                {
                    urlofarticle=loadMoreHTMLResource;
                }
                
                $(refLink).attr('href',urlofarticle);
                $(refLink).attr('target',loadMoreTitleOpenInNewTab);
                
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
                
                
                if(loadMoreHTMLResource == "null"){
                    
                    $(refLink).attr('href','');
                    
                }
                else{
                    
                    
                    
                }
                
                
                
            }
            
            // on show more appending the next child elements for article date
            var date=$(pressReleaseItem).find('.press-release-date');
            
            if(date && $(pressReleaseItem).find('.press-release-date').length>0){
                $(date).text(loadMoreArticleDate);
                
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
                
                
                if(loadMoreArticleDate == "null"){
                    $(date).text('');
                    
                }
                
                else{
                    
                    
                }
            }
            
            // on show more appending the next child elements for media category
            var mediaCategory=$(pressReleaseItem).find('.press-release-mediacategory');
            if(mediaCategory && $(pressReleaseItem).find('.press-release-mediacategory').length>0){
                if(loadMoreArticleMediaCAtegory != "null"){
                    $(mediaCategory).text(loadMoreArticleMediaCAtegory);
                    var divEle =  $('#items-group').children().first();
                    divEle.append(pressReleaseItem );
                }
                else{
                }
                
            }
            
            
            
            //pagereflink 
            
            var pagereflink = $(pressReleaseItem).find('.press-releaseDownload');
            
            if(pagereflink && $(pressReleaseItem).find('.press-releaseDownload').length>0){
                $(pagereflink).attr('href',loadMoreRefLink);
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
                
                
                if(loadMoreRefLink == "null"){
                    $(pagereflink).attr('href','');
                    $(pressReleaseItem).find('.pr-download').hide();
                }
                
                else{
                    // var divEle =  $('#items-group').children().first();
                    // divEle.append(pressReleaseItem );
                    
                    
                }
                
            }
            
            
            
            else if(loadMoreRefLink != "null" && sDownload == true){
                
                var downloadHTML = "<li class='download '><a class='social-tag-icon press-releaseDownload' href='"+loadMoreRefLink+"' target='"+loadMorePDFOpenInNewTab+"' title='Download'><img src='/content/dam/infosys-web/en/global-resource/responsive/newdesign/download.svg' alt='download'/></a></li>";
                
                var socialShareHTML = $(pressReleaseItem).find('.press-release-date');
                if(socialShareHTML.length >0){
                    socialShareHTML.after(downloadHTML);
                }
                
                else{ 
                    $(pressReleaseItem).find('.social-tag').prepend(downloadHTML);
                }
                
                var divEle =  $('#items-group').children().first();
                divEle.append(pressReleaseItem );
            }
            
            
            //check whether load morebutton should  show or not
            if(loadMoreButton != "true"){
                $('.insight-btn').addClass('toggle-more');
            }
        }
    }
}
// Add all listeners in this method


// article year  filter  on change event

$("#articleYearFilter").on("change", function() {
    
    
    //getSelectOptions = document.getElementById("articleYearFilter");
    //getSelectIndexValue = getSelectOptions.options[getSelectOptions.selectedIndex].text;
    
    getSelectIndexValue = $('#articleYearFilter').val();
    var currentWebsiteUrl = window.location.href ;
    var UrlSlice = currentWebsiteUrl.split('?')[0];  ;  
    if( getSelectIndexValue != ""){           
        var appendUrlFilterIndex = UrlSlice + '?year=' + getSelectIndexValue ;
        window.location = appendUrlFilterIndex;
    }
    else{
        window.location = UrlSlice;
    }
    
});



/**********************
	Social share press release js
/**********************/
function pressReleaseTwitterSuccessShare(url, title){

    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }
 $.getJSON(
             "https://api-ssl.bitly.com/v3/shorten?", {
                           "access_token": "c763fa6bf73dac4f25f6d87c52fc38cadbbeb5a2",
                            "longUrl": url
                },
                function (response) {
						//alert("1");
                          url = String(response.data.url);

                     	  var twitterUrl = 'https://twitter.com/intent/tweet?url='.concat(url)+'&text='+title;
    					  var popUp = window.open(twitterUrl,'popupwindow','scrollbars=yes,width=500,height=600');
   						 //popUp.focus();


                 }
  );
 return false;
}

function pressReleaseLinkedinSuccessShare(url){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }

                     	var liUrl = 'http://www.linkedin.com/shareArticle?mini=true&url='.concat(url);
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(liUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}

function pressReleaseFacebookSuccessShare(url){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=window.origin;
    url=domain.concat(url);
    }

                     	  var fbUrl = 'http://www.facebook.com/sharer/sharer.php?s=100&u='.concat(url);
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(fbUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}
$(document).ready(function(){
	
//code added for ipad
var currentURL = window.location.search;
//fetch the query values.
year = getParameterByName('year');

$("#yearOption").val(year)
.find("option[value="+year+"]").attr('selected', true);


var pathName = window.location.pathname.toLowerCase();
var Querydata = window.location.search.substring(1);

//if query string is not null, make past events part active
    if(Querydata == "wcmmode=disabled"){

$("#pevent").removeClass("active");
	$("#uevent").addClass("active");
    $(".select-option").hide();
    }


//if query string is not null, make past events part active
  if (Querydata !=  "wcmmode=disabled" && Querydata != "" ) {



    $("#pevent").addClass("active");
			$("#uevent").removeClass("active");
    	$(".select-option").show();
}


//if query string is null, make upcoming events part active   
else{
 $("#pevent").removeClass("active");
	$("#uevent").addClass("active");
    $(".select-option").hide();
}


});




//to make the selected year active in year filter dropdown.


//appending the select year as query string value.
function selectChangeEvents(){
console.log("logevents");
var getSelectOptions = document.getElementById("yearOption");
var getSelectIndexValue = getSelectOptions.options[getSelectOptions.selectedIndex].text;
var currentWebsiteUrl = window.location.href ;
var splitUrl = currentWebsiteUrl.split('?')[0];  
var appendUrlFilterIndex = splitUrl + '?year=' + getSelectIndexValue ;
window.location = appendUrlFilterIndex;

}
//code added for ipad
function getParameterByName(name, url) {
     if (!url) url = window.location.href;
     name = name.replace(/[\[\]]/g, "\\$&");
     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
         results = regex.exec(url);
     if (!results) return null;
     if (!results[2]) return '';
     return decodeURIComponent(results[2].replace(/\+/g, " "));
} 






/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    // @polyfill IE <button type="submit">'s form attribute
    if (navigator.userAgent.match(/.*?(Trident|Edge)/)) {
        $(document).on("click", "button[type=submit]", function(e) {
            var formId = this.getAttribute("form");

            if (formId) {
                e.preventDefault();

                var form = document.getElementById(formId);

                if (form) {
                    var event = document.createEvent("Event");
                    event.initEvent("submit", true, true);
                    form.dispatchEvent(event);
                }
            }
        });
    }

    // @polyfill IE, FF, Chrome, Safari <button type=reset>'s form attribute
    $(document).on("click", "button[type=reset]", function(e) {
        var formId = this.getAttribute("form");
        if (formId) {
            e.preventDefault();

            var form = document.getElementById(formId);
            if (form) {
                // Using `reset()` is the most reliable approach to reset the form.
                // It will trigger cancelable `reset` event, unlike `submit()`.
                // For IE, you have to use `reset()` otherwise the form is not reseted.
                // For other UAs, triggering `reset` event is enough.
                form.reset();
            }
        }
    });

    // @polyfill IE11 ES6 Array.prototype.find
    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisObject) {
            var item;
            Array.prototype.some.call(this, function(v) {
                if (callback.apply(thisObject, arguments)) {
                    item = v;
                    return true;
                }
                return false;
            });
            return item;
        };
    }

    // @polyfill IE11
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    // @polyfill IE11
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            // This works much better than >= because it compensates for NaN:
            if (!(position < this.length)) {
                position = this.length;
            } else {
                position |= 0; // round position
            }
            return this.substr(position - searchString.length, searchString.length) === searchString;
        };
    }

    // @polyfill IE11
    if (!document.contains) {
        var containsShim = function(node) {
            if (arguments.length < 1) {
                throw new TypeError("1 argument is required");
            }

            do {
                if (this === node) {
                    return true;
                }
                if (node) {
                    node = node.parentNode;
                }
            } while (node);

            return false;
        };

        document.contains = containsShim;
        Element.prototype.contains = containsShim;
    }
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
Granite = window.Granite || {};
Granite.UI = Granite.UI || {};
Granite.UI.Foundation = Granite.UI.Foundation || {};

(function(document, $, History) {
    "use strict";

    History.options.transformHash = false; // See GRANITE-3027

    // GRANITE-10247
    // Since there is `cui-contentloaded` event wrapper at coral2.js,
    // we have to skip triggering `foundation-contentloaded` event during document ready to avoid double event.
    // Once we remove Coral2 from the system, then we can use the following code again.
    /* var doc = $(document);

    doc.on("ready", function(e) {
        doc.trigger("foundation-contentloaded");
    }); */
})(document, Granite.$, History);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $) {
    "use strict";

    Granite.UI.Foundation.Utils = Granite.UI.Foundation.Utils || (function() {
        var existingScripts = [];

        var removeEl = function(newContent, selector, comparator, existings) {
            existings = existings || $(selector);
            var nonExistings = [];

            newContent.find(selector).each(function() {
                var item = this;
                var match = existings.is(function() {
                    return comparator(this, item);
                });

                if (match) {
                    $(item).remove();
                } else {
                    nonExistings.push($(item).detach()[0]);
                }
            });

            return $(nonExistings);
        };

        /**
         * Merge array2 into array1.
         * @ignore
         *
         * @returns array1
         */
        var mergeScript = function(array1, array2) {
            if (array1.length === 0) {
                Array.prototype.push.apply(array1, array2);
                return array1;
            }

            $.each(array2, function() {
                var a2 = this;
                var match = array1.some(function(a1) {
                    return a1.src === a2.src;
                });

                if (!match) {
                    array1.push(a2);
                }
            });
            return array1;
        };

        /**
         * Includes the given scripts to the head. The script will be included in ordered-async manner.
         * @ignore
         */
        var includeScripts = function(scripts, head) {
            var deferreds = [];

            $.each(scripts, function() {
                var script = this;
                var s = document.createElement("script");

                var deferred = $.Deferred();
                deferreds.push(deferred);

                $(s).one("load error", function() {
                    deferred.resolve();
                });
                s.async = false;
                s.src = script.src;
                head.appendChild(s);
            });

            return $.when.apply(null, deferreds);
        };

        return {
            everyReverse: function(array, callback, thisArg) {
                for (var i = array.length - 1; i >= 0; i--) {
                    if (!callback.call(thisArg, array[i], i, array)) {
                        return false;
                    }
                }
                return true;
            },

            debounce: function(func, wait, immediate) {
                // See http://davidwalsh.name/javascript-debounce-function
                var timeout;

                return function() {
                    var context = this;
                    var args = arguments;
                    var later = function() {
                        timeout = null;

                        if (!immediate) {
                            func.apply(context, args);
                        }
                    };
                    var callNow = immediate && !timeout;

                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);

                    if (callNow) {
                        func.apply(context, args);
                    }
                };
            },

            processHtml: function(html, selector, callback, avoidMovingExisting) {
                var container;
                if (html.jquery) {
                    container = html;
                } else {
                    // jQuery will remove the script if we use $(html) straight away,
                    // so use innerHTML to a container instead.
                    // Using a container also handle non single element html string.
                    var div = document.createElement("div");
                    div.innerHTML = html;
                    container = $(div);
                }

                // remove all the script and css files from the new content if they are already loaded

                var remainingScripts = removeEl(container, "script[src]", function(oldEl, newEl) {
                    return oldEl.src === newEl.src;
                }, $(mergeScript(existingScripts, $("script[src]"))));

                var remainingStyles = removeEl(container, "link[rel=stylesheet]", function(oldEl, newEl) {
                    return oldEl.href === newEl.href;
                });

                var head = $("head");

                if (!avoidMovingExisting) {
                    // move existing css files to the head. See GRANITE-2503, GRANITE-2676
                    head.append($("link[rel=stylesheet]", document.body));

                    // initial page may contain scripts in the body, so remove it
                    // to prevent double loading when it's content is injected again.
                    $("script[src]", document.body).remove();
                }

                // move all the remaining script and css files to the head. See GRANITE-2498, GRANITE-3642
                var promise = includeScripts(remainingScripts, head[0]);
                head.append(remainingStyles);

                if (callback) {
                    setTimeout(function() {
                        promise.done(callback);
                    }, 0);
                }

                // at this point, no more link[rel=stylesheet] and script[src] in the body


                var content = container.find(selector);

                if (html.jquery) {
                    if (selector) {
                        return content.length ? content : container;
                    } else {
                        return container;
                    }
                } else {
                    if (selector) {
                        return content.length ? content[0].outerHTML : container[0].innerHTML;
                    } else {
                        return container[0].innerHTML;
                    }
                }
            }
        };
    })();
})(window, document, Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    Granite.UI.Foundation.Registry = Granite.UI.Foundation.Registry || (function() {
        var map = new Map();

        return {
            register: function(name, config) {
                if (map.has(name)) {
                    map.get(name).push(config);
                } else {
                    map.set(name, [ config ]);
                }
            },

            get: function(name) {
                if (map.has(name)) {
                    return map.get(name);
                } else {
                    return [];
                }
            }
        };
    })();

    Granite.UI.Foundation.Registry.register("foundation.adapters", {
        type: "foundation-registry",
        selector: $(window),
        adapter: function() {
            return Granite.UI.Foundation.Registry;
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(Granite, $) {
    "use strict";

    Granite.UI.Foundation.Adapters = Granite.UI.Foundation.Adapters || (function() {
        var registry = Granite.UI.Foundation.Registry;

        var adapters = function() {
            return registry.get("foundation.adapters");
        };

        return {
            register: function(type, selector, adapter) {
                var config = {
                    type: type,
                    selector: selector,
                    adapter: adapter
                };

                registry.register("foundation.adapters", config);
            },

            has: function(type) {
                return adapters().some(function(config) {
                    return config.type === type;
                });
            },

            get: function(type) {
                var results = [];
                adapters().forEach(function(config) {
                    if (config.type === type) {
                        results.push(config);
                    }
                });

                return results;
            },

            adapt: function(object, type) {
                if (!object || !type) {
                    return;
                }

                var $el = $(object);

                var config;
                Granite.UI.Foundation.Utils.everyReverse(adapters(), function(c) {
                    if (c.type === type && $el.is(c.selector)) {
                        config = c;
                        return false;
                    }
                    return true;
                });

                if (!config) {
                    return;
                }

                var key = "foundation.adapters.internal.adapters." + config.type;
                var cache = $el.data(key);

                if (cache && cache.config === config) {
                    return cache.instance;
                }

                var instance = config.adapter(object);
                $el.data(key, {
                    config: config,
                    instance: instance
                });

                return instance;
            }
        };
    })();

    $.fn.adaptTo = $.fn.adaptTo || function(type) {
        return Granite.UI.Foundation.Adapters.adapt(this[0], type);
    };
})(Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-tracker",
        selector: $(window),
        adapter: function() {
            var debugMode = false;

            var log = function(type, data) {
                if (debugMode) {
                    // eslint-disable-next-line no-console
                    console.dir({
                        type: type,
                        data: data
                    });
                }
            };

            return {
                setDebugMode: function(enable) {
                    debugMode = !!enable;
                },
                trackPage: function(data) {
                    log("page", data);

                    try {
                        window.Granite.Tracking.Tracker.trackPage(data);
                    } catch (ignored) {
                        // window.Granite.Tracking.Tracker may not exist, hence the try-catch block.
                    }
                },
                trackEvent: function(data) {
                    log("event", data);

                    try {
                        window.Granite.Tracking.Tracker.trackEvent(data);
                    } catch (ignored) {
                        // window.Granite.Tracking.Tracker may not exist, hence the try-catch block.
                    }
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(function() {
        var json = $("meta[name='foundation.tracking.page']", document.head).attr("content");

        if (!json) {
            return;
        }

        var page = JSON.parse(json);

        var tracker = $(window).adaptTo("foundation-tracker");
        tracker.trackPage(page);
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(document).on("click", "[data-foundation-tracking-event]", function(e) {
        var api = $(this).adaptTo("foundation-tracking-event");
        api.track(e);
    });


    // Default handler
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-tracking-event",
        selector: "[data-foundation-tracking-event]",
        adapter: function(el) {
            return {
                track: function(event) {
                    var json = el.getAttribute("data-foundation-tracking-event");

                    if (!json) {
                        return;
                    }

                    var data = JSON.parse(json);

                    data.feature = data.feature || "";
                    data.action = "click";

                    if (data.widget) {
                        data.widget.name = data.widget.name || data.element;
                    }

                    $(window).adaptTo("foundation-tracker").trackEvent(data);
                }
            };
        }
    });
})(window, document, Granite.$);

/*
  ADOBE CONFIDENTIAL

  Copyright 2018 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    if (typeof Coral === "undefined" || !Coral.tracking) {
        return;
    }

    function normalizeKeyValue(value) {
        if (typeof value !== "string") {
            return "";
        }

        return value.toLowerCase();
    }

    function omegaTracking(trackData, event, component, childComponent) {
        var omegaTrackData = {
            element: normalizeKeyValue(trackData.targetElement),
            type: normalizeKeyValue(trackData.targetType),
            action: normalizeKeyValue(trackData.eventType),
            widget: {
                name: normalizeKeyValue(trackData.rootElement),
                type: normalizeKeyValue(trackData.rootType)
            },
            feature: normalizeKeyValue(trackData.rootFeature)
        };

        var tracker = $(window).adaptTo("foundation-tracker");
        tracker.trackEvent(omegaTrackData);
    }

    // registers the listener to detect the interactions from Coral components
    Coral.tracking.addListener(omegaTracking);
}(window, Granite.$));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, Granite, Coral) {
    "use strict";

    var alertEl;
    function getAlertEl() {
        if (!alertEl) {
            alertEl = new Coral.Dialog().set({
                closable: "on"
            }).on("coral-overlay:close", function(e) {
                e.target.remove();
            });
        }
        return alertEl;
    }

    var promptEl;
    function getPromptEl() {
        if (!promptEl) {
            promptEl = new Coral.Dialog().set({
                backdrop: Coral.Dialog.backdrop.STATIC,
                interaction: "off"
            }).on("coral-overlay:close", function(e) {
                e.target.remove();
            });
        }
        return promptEl;
    }

    var maskEl;
    function getMaskEl() {
        if (!maskEl) {
            maskEl = $(document.createElement("div")).addClass("foundation-ui-mask");
            maskEl.append(new Coral.Wait().set({
                centered: true,
                size: "L"
            }));
        }
        return maskEl;
    }

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-ui",
        selector: $(window),
        adapter: function() {
            return {
                alert: function(title, message, type) {
                    var el = getAlertEl();

                    el.variant = type || "default";
                    el.header.textContent = title || "";
                    el.content.innerHTML = message || "";

                    document.body.appendChild(el);
                    el.show();
                },

                notify: function(title, message, type) {
                    var el = new Coral.Alert();
                    el.classList.add("foundation-ui-notification");
                    el.variant = type || "info";

                    el.header.textContent = title || (function() {
                        switch (type) {
                            case "error": return Granite.I18n.get("Error");
                            case "notice": return Granite.I18n.get("Notice");
                            case "success": return Granite.I18n.get("Success");
                            case "help": return Granite.I18n.get("Help");
                            default: return Granite.I18n.get("Info");
                        }
                    })();

                    el.content.innerHTML = message || "";

                    // foundation.ui.notify.positionhandler is currently a non-documented feature
                    // where it allows you to programmatically position the notification.
                    // Most of the time you can use CSS to position it, no JS is needed.
                    var noHandler = Granite.UI.Foundation.Utils.everyReverse(
                        registry.get("foundation.ui.notify.positionhandler"),
                        function(c) {
                            return c.call(el, el) === false;
                        }
                    );

                    if (noHandler) {
                        document.body.appendChild(el);
                    }

                    setTimeout(function() {
                        el.remove();
                    }, 5000);
                },

                waitTicker: function(title, message) {
                    var el = new Coral.Dialog();
                    el.backdrop = Coral.Dialog.backdrop.STATIC;
                    el.header.textContent = title;
                    el.header.insertBefore(new Coral.Wait(), el.header.firstChild);
                    el.content.innerHTML = message || "";

                    document.body.appendChild(el);
                    el.show();

                    return {
                        updateMessage: function(message) {
                            el.content.innerHTML = message;
                        },
                        clear: function() {
                            el.hide();

                            requestAnimationFrame(function() {
                                el.remove();
                            });
                        }
                    };
                },

                prompt: function(title, message, type, actions, callback) {
                    var el = getPromptEl();

                    el.variant = type || "default";
                    el.header.textContent = title || "";
                    el.content.innerHTML = message || "";
                    el.footer.innerHTML = "";

                    actions.forEach(function(a) {
                        var b = new Coral.Button();
                        b.label.textContent = a.text;

                        if (a.primary) {
                            b.variant = "primary";
                        } else if (a.warning) {
                            b.variant = "warning";
                        }

                        b.on("click", function(e) {
                            el.hide();

                            if (a.handler) {
                                a.handler(a);
                            }

                            if (callback) {
                                callback(a.id, a);
                            }
                        });

                        el.footer.appendChild(b);
                    });

                    document.body.appendChild(el);
                    el.show();
                },

                wait: function(el) {
                    getMaskEl().appendTo(el || document.body);
                },

                clearWait: function() {
                    getMaskEl().detach();
                }
            };
        }
    });
})(document, Granite.$, Granite, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var existingScripts = [];

    var removeEl = function(fragment, selector, comparator, existings) {
        existings = existings || $(selector);
        var nonExistings = [];

        Array.prototype.forEach.call(fragment.querySelectorAll(selector), function(item) {
            var match = existings.is(function() {
                return comparator(this, item);
            });

            if (match) {
                $(item).remove();
            } else {
                nonExistings.push($(item).detach()[0]);
            }
        });

        return nonExistings;
    };

    /**
     * Merge array2 into array1.
     *
     * @returns array1
     */
    var mergeScript = function(array1, array2) {
        if (array1.length === 0) {
            Array.prototype.push.apply(array1, array2);
            return array1;
        }

        $.each(array2, function() {
            var a2 = this;
            var match = array1.some(function(a1) {
                return a1.src === a2.src;
            });

            if (!match) {
                array1.push(a2);
            }
        });
        return array1;
    };

    /**
     * Includes the given scripts to the head. The script will be included in ordered-async manner.
     */
    var includeScripts = function(scripts, head) {
        var deferreds = scripts.map(function(script) {
            var deferred = $.Deferred();

            var s = document.createElement("script");
            $(s).one("load error", function() {
                deferred.resolve();
            });
            s.async = false;
            s.src = script.src;

            head.appendChild(s);

            return deferred;
        });

        return $.when.apply(null, deferreds);
    };

    var processHtml = function(fragment, avoidMovingExisting) {
        // remove all the script and css files from the new content if they are already loaded

        var remainingScripts = removeEl(fragment, "script[src]", function(oldEl, newEl) {
            return oldEl.src === newEl.src;
        }, $(mergeScript(existingScripts, $("script[src]"))));

        var remainingStyles = removeEl(fragment, "link[rel=stylesheet]", function(oldEl, newEl) {
            return oldEl.href === newEl.href;
        });

        var head = $("head");

        if (!avoidMovingExisting) {
            // move existing css files to the head. See GRANITE-2503, GRANITE-2676
            head.append($("link[rel=stylesheet]", document.body));

            // initial page may contain scripts in the body, so remove it
            // to prevent double loading when it's content is injected again.
            $("script[src]", document.body).remove();
        }

        // move all the remaining script and css files to the head. See GRANITE-2498, GRANITE-3642
        var promise = includeScripts(remainingScripts, head[0]);
        head.append(remainingStyles);

        // at this point, no more link[rel=stylesheet] and script[src] in the body

        return promise;
    };

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-htmlparser",
        selector: $(window),
        adapter: function() {
            return {
                parse: function(html, avoidMovingExisting) {
                    var fragment;

                    if (html instanceof Element || html instanceof DocumentFragment) {
                        fragment = html;
                    } else {
                        fragment = this.createFragment(html);
                    }

                    return processHtml(fragment, avoidMovingExisting).then(function() {
                        return fragment;
                    });
                },
                createFragment: function(html) {
                    var template = document.createElement("template");
                    if ("content" in template) {
                        template.innerHTML = html;
                        return document.importNode(template.content, true);
                    } else {
                        // @polyfill IE11+
                        return document.createRange().createContextualFragment(html);
                    }
                }
            };
        }
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, navigator, $) {
    "use strict";

    // Whether the OS is MacOS. This affects how the shortcuts are mapped
    var IS_MAC = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-keyboard",
        selector: $(window),
        adapter: function() {
            return {
                normalize: function(keySequence) {
                    // converts first all combinations to ctrl
                    var sanitizedShortcut = keySequence.replace(/meta|command|cmd|control/, "ctrl");
                    // and then applies the OS preferences
                    return IS_MAC ? sanitizedShortcut.replace(/control|ctrl/, "⌘") : sanitizedShortcut;
                }
            };
        }
    });
})(window, navigator, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var STORAGE_KEY = "foundation-util-messenger.internal.messages";

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-messenger",
        selector: $(window),
        adapter: function() {
            return {
                put: function(title, message, type) {
                    try {
                        var messages = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)) || [];

                        messages.push({
                            title: title,
                            message: message,
                            type: type
                        });

                        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
                    } catch (e) {
                        if (window.console) {
                            // eslint-disable-next-line no-console
                            console.warn("Error occur saving message", e);
                        }
                    }
                },

                promptAll: function() {
                    var ui = $(window).adaptTo("foundation-ui");

                    var messages = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
                    if (messages) {
                        messages.forEach(function(msgConfig) {
                            ui.notify(msgConfig.title, msgConfig.message, msgConfig.type);
                        });

                        window.sessionStorage.removeItem(STORAGE_KEY);
                    }
                }
            };
        }
    });

    $(function() {
        $(window).adaptTo("foundation-util-messenger").promptAll();
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, Granite, $) {
    "use strict";

    var MAX_URL_LENGTH = 2000;

    function adjustURL(url) {
        var convert = url.length > MAX_URL_LENGTH;

        var method = "GET";
        var newURL = url;
        var data = undefined;

        if (convert) {
            var queryIndex = url.lastIndexOf("?");

            if (queryIndex >= 0) {
                method = "POST";
                newURL = url.substring(0, queryIndex);
                data = url.substring(queryIndex + 1);
            }
        }

        return {
            method: method,
            url: newURL,
            data: data
        };
    }


    function Paginator(config) {
        this.el = config.el;
        this._$el = $(this.el);

        this.isLoading = false;
        this.hasNext = true;
        this.offset = 0;
        this.limit = config.limit || 20;

        this._resolveURL = config.resolveURL;
        this._processResponse = config.processResponse;
        this._onNewPage = config.onNewPage || $.noop;
        this._wait = config.wait || function() {
            return {
                clear: $.noop
            };
        };
        this._tolerance = 20;
        this._destroyed = false;
        this._started = false;
        this._performTimeoutId = null;
    }

    Paginator.NS = ".foundation-util-paginator";

    Paginator.prototype.start = function(offset, hasNext, forceFirstLoad, delay) {
        if (this._destroyed) {
            throw new Error("Illegal state: paginator is already destroyed");
        }
        if (this._started) {
            throw new Error("Illegal state: paginator is already started");
        }

        var self = this;
        var el = this._$el;
        this._started = true;
        this.offset = offset >= 0 ? offset : 0;
        this.hasNext = typeof hasNext === "boolean" ? hasNext : true;

        var perform = function() {
            el.on("scroll" + Paginator.NS, Granite.UI.Foundation.Utils.debounce(function() {
                if (self._destroyed) {
                    return;
                }

                var scrollHeight = el.prop("scrollHeight");
                var scrollTop = el.prop("scrollTop");
                var clientHeight = el.prop("clientHeight");

                if (clientHeight + scrollTop + self._tolerance >= scrollHeight) {
                    self._loadNextPage();
                }
            }, 100));

            self.restart(self.offset, self.hasNext, forceFirstLoad);
        };

        if (delay) {
            this._performTimeoutId = setTimeout(function() {
                perform();
            }, delay);
        } else {
            perform();
        }
    };

    Paginator.prototype.restart = function(offset, hasNext, forceFirstLoad) {
        if (this._destroyed) {
            throw new Error("Illegal state: paginator is already destroyed");
        }
        if (!this._started) {
            throw new Error("Illegal state: paginator is not yet started");
        }

        this.offset = offset >= 0 ? offset : 0;
        this.hasNext = typeof hasNext === "boolean" ? hasNext : true;

        if (forceFirstLoad && this.isLoading) {
            this._lastRequest.abort();
        }

        this._doFirstLoad(forceFirstLoad);
    };

    Paginator.prototype.destroy = function() {
        this._$el.off("scroll" + Paginator.NS);
        clearTimeout(this._performTimeoutId);

        if (this.isLoading) {
            this._lastRequest.abort();
        }

        this._destroyed = true;
    };

    /**
     * @param force
     * @returns {Boolean}
     * @private
     */
    Paginator.prototype._doFirstLoad = function(force) {
        var self = this;

        var perform = force;
        if (!perform) {
            var ch = this._$el.prop("clientHeight");
            var sh = this._$el.prop("scrollHeight");
            perform = ch > 0 && sh - ch <= this._tolerance;
        }

        if (perform) {
            this._loadNextPage().then(function() {
                self._doFirstLoad();
            });
        }
        return perform;
    };

    Paginator.prototype._loadNextPage = function() {
        var self = this;

        if (this.isLoading || !this.hasNext) {
            return $.Deferred().reject().promise();
        }

        this.isLoading = true;
        var wait = this._wait(this);

        var url = this._resolveURL(this);
        var requestInfo = adjustURL(url);

        this._lastRequest = $.ajax({
            method: requestInfo.method,
            url: requestInfo.url,
            data: requestInfo.data,
            cache: false
        });

        return this._lastRequest.then(function(response) {
            wait.clear();
            return self._processResponse(self, response);
        }, function(request, status) {
            self.isLoading = false;
            wait.clear();

            if (status !== "abort") {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Fail to load next page.");

                var ui = $(window).adaptTo("foundation-ui");
                ui.alert(title, message, "error");
            }
        }).then(function(response) {
            self.offset += response.length;
            self.hasNext = response.hasNext;
            self.isLoading = false;
            self._onNewPage(self);
        });
    };

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-paginator",
        selector: $(window),
        adapter: function() {
            return Paginator;
        }
    });
})(window, Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    function PropertyBuilder(descriptor) {
        this._descriptor = descriptor;
        this._mixins = [];
    }

    PropertyBuilder.prototype.mix = function(mixin) {
        this._mixins.push(mixin);
        return this;
    };

    PropertyBuilder.prototype.build = function() {
        var descriptor = this._descriptor;

        var getter = this._mixins.reduce(function(memo, mixin) {
            return mixin(memo);
        }, descriptor);

        var setter = this._mixins.reduceRight(function(memo, mixin) {
            return mixin(memo);
        }, descriptor);

        return {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: getter.get,
            set: setter.set
        };
    };


    PropertyBuilder.createAttrBasedProperty = function(name, defaultValue) {
        return {
            get: function() {
                var v = this.getAttribute(name);

                if (defaultValue === undefined) {
                    return v;
                } else {
                    return v === null ? defaultValue : v;
                }
            },
            set: function(value) {
                this.setAttribute(name, value);
            }
        };
    };

    PropertyBuilder.createBooleanAttrBasedProperty = function(name, defaultValue) {
        return {
            get: function() {
                if (this.hasAttribute(name)) {
                    return true;
                }
                return defaultValue === undefined ? false : defaultValue;
            },
            set: function(value) {
                if (value) {
                    this.setAttribute(name, "");
                } else {
                    this.removeAttribute(name);
                }
            }
        };
    };

    /**
     * Handles the property as integer.
     *
     * This method tries to match the behaviour of HTML.
     */
    PropertyBuilder.integerType = function(defaultValue) {
        return function(descriptor) {
            var TYPE_DEFAULT = 0;

            return {
                get: function() {
                    var int = parseInt(descriptor.get.call(this), 10);
                    return isNaN(int) ? defaultValue : int;
                },
                set: function(value) {
                    var int = parseInt(value, 10);

                    if (isNaN(int)) {
                        int = TYPE_DEFAULT;
                    }

                    descriptor.set.call(this, int);
                }
            };
        };
    };

    PropertyBuilder.positiveNumber = function(defaultValue) {
        return function(descriptor) {
            return {
                get: function() {
                    var n = descriptor.get.call(this);
                    return n < 0 ? defaultValue : n;
                },
                set: function(value) {
                    if (value < 0) {
                        throw new RangeError("Value is negative number");
                    }
                    descriptor.set.call(this, value);
                }
            };
        };
    };


    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-propertybuilder",
        selector: $(window),
        adapter: function() {
            return PropertyBuilder;
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $, URITemplate, Coral) {
    "use strict";

    /**
     * Escapes the str string so it can be used as part of a CSS selector with jQuery.
     *
     * See this:
     * https://stackoverflow.com/questions/11846311/how-do-i-select-an-element-with-a-non-alphanumeric-id-using-jquery
     * @param {String} str the string to escape.
     * @returns {String} the escaped version of the provided string.
     */
    function escapeSelector(str) {
        return str.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "\\$&");
    }

    /**
     * Detects if the provided item is entirely above the specified position.
     * @param {HTMLElement} item the item whose position to check
     * @param {Number} position the line to compare the item's position
     * @returns {Boolean} true if the item is above that line and false otherwise. Returns false if
     * the item's position cannot be determined
     */
    function isItemAbove(item, position) {
        if (item.matches("coral-masonry-item")) {
            if (!item._layoutData) {
                return false;
            }
            return item._layoutData.top + item._layoutData.height < position;
        }

        if (item.matches("[is='coral-table-row']")) {
            return item.offsetTop + item.offsetHeight < position;
        }

        return false;
    }

    /**
     * Detects if the provided item is entirely below the specified position
     * @param {HTMLElement} item the item whose position to check
     * @param {Number} position the line to compare the item's position
     * @returns {Boolean} true if the item is above that line and false otherwise. Also returns true if
     * the item's position cannot be determined
     */
    function isItemBelow(item, position) {
        if (item.matches("coral-masonry-item")) {
            if (!item._layoutData) {
                return true;
            }
            return item._layoutData.top > position;
        }

        if (item.matches("[is='coral-table-row']")) {
            return item.offsetTop > position;
        }

        return true;
    }

    /**
     * Detects if the provided item intersects the specified vertical range
     * @param {HTMLElement} item the item whose position to check
     * @param {Number} top the top line to compare the item's position to
     * @param {Number} bottom the bottom line to compare the item's position to
     * @returns {Boolean} true if the item intersects the specified vertical range and false otherwise.
     * Also returns false if the item's position cannot be determined.
     */
    function isItemVisible(item, top, bottom) {
        return !isItemAbove(item, top) && !isItemBelow(item, bottom);
    }

    /**
     * Finds a visible item in between the specified top and bottom position. Binary search is used to find the index
     * of an item that is not entirely above nor entirely below the specified vertical range.
     * @param {Array.<HTMLElement>} items the items to consider.
     * @param {Number} top the top line of the vertical range to consider.
     * @param {Number} bottom the bottom line of the vertical range to consider.
     * @returns {Number} the index of one of the items that is visible in that area.
     */
    function findOneVisibleItem(items, top, bottom) {
        var indexLow = 0;
        var indexHi = items.length - 1;

        for (var middleIndex = Math.floor((indexLow + indexHi) / 2);
            indexLow < indexHi;
            middleIndex = Math.floor((indexLow + indexHi) / 2)) {
            var middleItem = items[middleIndex];

            if (isItemVisible(middleItem, top, bottom)) {
                return middleIndex;
            }

            if (isItemAbove(middleItem, top)) {
                indexLow = middleIndex;
            } else {
                indexHi = middleIndex;
            }
        }

        return indexHi;
    }

    /**
     * Test if the item, although not visible,  is still in the shadow area.
     * @param {Number} currentIndex the index of the item to consider
     * @param {Number} lastVisibleIndex the index of the last detected visible item
     * @param {Number} shadowSize the number of elements that fit in the shadow area.
     * @returns {Boolean} true if the item is outside of the shadow or false if the item is not outside of the shadow
     */
    function wayBeyondVisibleArea(currentIndex, lastVisibleIndex, shadowSize) {
        return Math.abs(currentIndex - lastVisibleIndex) > shadowSize;
    }

    /**
     * Scan the items in the provided direction. Searches for items that are either visible or in the shadow.
     * Returns the first and and last lazy items that it finds.
     * @param {Array.<HTMLElement>}items The items to scan through.
     * @param {Number} initialIndex The index to initiate the scan from.
     * @param {Number} direction The direction in which to search:
     *          1 - search down
     *         -1 - search up
     * @param {Number} top the top line of the vertical range to consider
     * @param {Number} bottom the bottom line of the vertical range to consider
     * @param {Number} shadowSize number of items that, although not visible, are still considered during the search.
     * @returns {Object} an object with two properties:
     *        first - the index of the first found lazy item or null if none found
     *        last - the index of the last found lazy item or null if none found
     */
    function scanForLazyItems(items, initialIndex, direction, top, bottom, shadowSize) {
        var lastVisible = initialIndex;
        var firstLazyItem = null;
        var lastLazyItem = null;

        for (var currentIndex = initialIndex; currentIndex >= 0 && currentIndex < items.length;
            currentIndex += direction) {
            var currentItem = items[currentIndex];

            if (isItemVisible(currentItem, top, bottom)) {
                lastVisible = currentIndex;
            } else {
                if (wayBeyondVisibleArea(currentIndex, lastVisible, shadowSize)) {
                    break;
                }
            }

            if ($(currentItem).hasClass("is-lazyLoaded")) {
                lastLazyItem = currentIndex;
                firstLazyItem = firstLazyItem || currentIndex;
            }
        }

        return { first: firstLazyItem, last: lastLazyItem };
    }


    /**
     * Checks if there are lazy items in either the visible area of the provided collection or within a certain number
     * of items above or below the visible are (called the shadow).
     * Triggers loading of those lazy items if they are found.
     * @param {HTMLElement} collection the foundation collection element to check for lazy items.
     */
    function checkForVisibleLazyItemsInCollection(collection) {
        if ($(collection).find(".foundation-collection-item.is-lazyLoaded").length === 0) {
            return;
        }
        var items = collection.items.getAll();
        if (collection.parentElement) {
            var top = collection.parentElement.scrollTop;
            var bottom = top + collection.parentElement.clientHeight;

            if (collection.matches("[is='coral-table']")) {
                var coralTableScroll = $(collection).find("[coral-table-scroll]")[0];
                top = coralTableScroll.scrollTop;
                bottom = top + coralTableScroll.clientHeight;
            }

            var visibleItemIndex = findOneVisibleItem(items, top, bottom);

            var lazyItemsAbove = scanForLazyItems(items, visibleItemIndex, -1, top, bottom, 10);
            var lazyItemsBelow = scanForLazyItems(items, visibleItemIndex, 1, top, bottom, 10);

            var min = lazyItemsAbove.last !== null ? lazyItemsAbove.last : lazyItemsBelow.first;
            var max = lazyItemsBelow.last !== null ? lazyItemsBelow.last : lazyItemsAbove.first;

            if (min !== null && max !== null) {
                lazyLoadRange(collection, min, max);
            }
        }
    }

    /**
     * Get the element of the item in the collection that has the provided collection item id
     * @param {HTMLElement} collection the collection element to search from
     * @param {String} itemId the item id of the item whose element to return
     * @returns {HTMLElement} the element from the collection that has the provided collection id
     */
    function getPendingItemFromCollection(collection, itemId) {
        return $(collection)
            .find(".is-pending[data-granite-collection-item-id='" + escapeSelector(itemId) + "']");
    }

    /**
     * Checks the provided items for lazy items and triggers lazy loading for them. The lazy items are grouped in
     * batches spawning at most 60 items. The method then waits for all the lazy or pending items to get loaded.
     * It informs the caller when items have been loaded. It informs the caller when all items have been loaded.
     * @param {jQuery.Object} collection The collection that the items are part of.
     * @param {Array} items The items to load. If among these there are already loaded items, they are ignored.
     * If there are already pending items, the method waits for those items to get loaded and notifies the caller
     * accordingly.
     * @return {Promise} a promise that resolves to the list of items that have been loaded
     */
    function lazyLoadTheseItems(collection, items) {
        var datasourceMin = Infinity;
        var datasourceMax = -1;
        var threshold = 60;
        var idsToWaitFor = { _count: 0 };
        var filteredLoadedItems = [];
        var deferred = $.Deferred();

        function checkIfAllItemsAreLoaded(loadedItems) {
            loadedItems.forEach(function(loadedItem) {
                var itemId = loadedItem.dataset.graniteCollectionItemId;
                if (idsToWaitFor.hasOwnProperty(itemId)) {
                    filteredLoadedItems.push(loadedItem);
                    delete idsToWaitFor[itemId];
                    idsToWaitFor._count--;
                }
            });

            if (idsToWaitFor._count === 0) {
                collection.removeData("foundation-lazyLoading.internal.progressHandler");
                // resolving the deferred object is delayed so that the browser gets the opportunity to fire any
                // pending MutationObserver events. This way, processing those events will be cut short as we are
                // still within the boundaries of bulk lazy loading (like during bulk selection)
                requestAnimationFrame(function() {
                    deferred.resolve(filteredLoadedItems);
                });
            }
        }

        $(items).filter(".is-lazyLoaded,.is-pending").each(function(index, item) {
            var $item = $(item);

            idsToWaitFor[item.dataset.graniteCollectionItemId] = true;
            idsToWaitFor._count++;

            if ($item.hasClass("is-lazyLoaded")) {
                $item.addClass("is-pending").removeClass("is-lazyLoaded");

                var itemDatasourceIndex = parseInt(item.dataset.datasourceIndex, 10);

                if (datasourceMax !== -1 && itemDatasourceIndex - datasourceMin > threshold) {
                    lazyLoadFromDatasource(collection[0], datasourceMin, datasourceMax);
                    datasourceMin = Infinity;
                    datasourceMax = -1;
                }

                datasourceMax = datasourceMax > itemDatasourceIndex ? datasourceMax : itemDatasourceIndex;
                datasourceMin = datasourceMin < itemDatasourceIndex ? datasourceMin : itemDatasourceIndex;
            }
        });

        if (datasourceMax !== -1) {
            lazyLoadFromDatasource(collection[0], datasourceMin, datasourceMax);
        }

        if (idsToWaitFor._count > 0) {
            collection.data("foundation-lazyLoading.internal.progressHandler", checkIfAllItemsAreLoaded);
        } else {
            deferred.resolve([]);
        }

        return deferred.promise();
    }

    /**
     * Makes the request to load the specified range of items from the server.
     * It respects the sort criteria set in the collection paginator.
     * Replaces the items in the collection with the items from the server's response.
     * Matching is done using data-foundation-collection-item-id attribute.
     * If a callback is found to announce some more loaded elements, this method uses that callback.
     * @param {HTMLElement} collection the collection for which to load the items.
     * @param {Number} datasourceMin the datasource index (which may differ from the collection index) of
     * the first item to retrieve
     * @param {Number} datasourceMax the datasource index (which may differ from the collection index) of
     * the last item to retrieve
     */

    function lazyLoadFromDatasource(collection, datasourceMin, datasourceMax) {
        var src = collection.dataset.foundationCollectionSrc;

        if (!src) {
            return;
        }

        var uriTemplate = {
            offset: datasourceMin,
            limit: datasourceMax - datasourceMin + 1,
            id: collection.dataset.foundationCollectionId
        };

        var sorting = null;
        var layout = $(collection).data("foundation-layout");
        if (layout && layout.name === "foundation-layout-table") {
            sorting = $(collection).data("foundation-layout-table.internal.paginator.sort");
        }

        if (sorting) {
            uriTemplate.sortName = sorting.name;
            uriTemplate.sortDir = sorting.direction;
        }

        src = URITemplate.expand(src, uriTemplate);

        $.ajax(src).done(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            parser.parse(html).then(function(fragment) {
                var el = $(fragment).children();

                if (!el.hasClass("foundation-collection")) {
                    return;
                }

                var items = el.find(".foundation-collection-item:not(.is-lazyLoaded)");
                var replacedItems = [];

                items.each(function() {
                    var resultItem = this;
                    var itemId = resultItem.dataset.graniteCollectionItemId;
                    var initialElem = getPendingItemFromCollection(collection, itemId);

                    initialElem.removeClass("is-pending").each(function() {
                        $(this).replaceWith(resultItem);
                        replacedItems.push(resultItem);
                    });
                });

                var progressHandler = $(collection).data("foundation-lazyLoading.internal.progressHandler");
                if (progressHandler) {
                    progressHandler(replacedItems);
                } else {
                    $(collection).adaptTo("foundation-collection").append([]);
                }
            });
        });
    }

    /**
     * Triggers loading data for the items in the provided collection.
     * Only items from the provided index interval are considered.
     * @param {HTMLElement} collection the collection for which to load item data
     * @param {Number} min the index of the first collection item to load data for
     * @param {Number} max the index of the last collection item to load data for
     */
    function lazyLoadRange(collection, min, max) {
        var datasourceMin = Infinity;
        var datasourceMax = -1;

        var items = collection.items.getAll();
        for (var index = min; index <= max; index++) {
            var $item = $(items[index]);
            if ($item.is(".foundation-collection-item.is-lazyLoaded")) {
                $item.addClass("is-pending").removeClass("is-lazyLoaded");
                var itemDatasourceIndex = parseInt($item[0].dataset.datasourceIndex, 10);
                datasourceMax = datasourceMax > itemDatasourceIndex ? datasourceMax : itemDatasourceIndex;
                datasourceMin = datasourceMin < itemDatasourceIndex ? datasourceMin : itemDatasourceIndex;
            }
        }

        lazyLoadFromDatasource(collection, datasourceMin, datasourceMax);
    }

    /**
     * Calls the debounced wrapper for checking the lazy items for the specified collection.
     * If the wrapper does not yet exist, create it and cache it as a property of the collection.
     * @param {HTMLElement} collection the foundation collection to call the lazy items checking for.
     */
    function queueCollectionLazyItemChecker(collection) {
        collection.lazyItemChecker = collection.lazyItemChecker ||
            Granite.UI.Foundation.Utils.debounce(checkForVisibleLazyItemsInCollection, 200);

        collection.lazyItemChecker(collection);
    }

    /**
     * Test if the scroll event is for a foundation collection.
     * If this is the case, initiate the call to check for lazy items for that collection.
     * @param event the scroll event.
     */
    function filterScrollForFoundationCollection(event) {
        var $target = $(event.target);
        $target.find("coral-masonry.foundation-collection").each(function() {
            queueCollectionLazyItemChecker(this);
        });

        if (event.target.matches && event.target.matches("[coral-table-scroll]")) {
            $target.closest(".foundation-collection[is='coral-table']").each(function() {
                queueCollectionLazyItemChecker(this);
            });
        }
    }

    /**
     * Test if the transition-end event is for a foundation collection item.
     * If this is the case, initiate the call to check for lazy items for the parent collection.
     * @param event the transition end event.
     */
    function filterTransitionEndToMasonryItems(event) {
        var $elem = $(event.target);
        if ($elem.is(".foundation-collection-item.is-lazyLoaded")) {
            $elem.closest(".foundation-collection").each(function() {
                queueCollectionLazyItemChecker(this);
            });
        }
    }

    /**
     * Initiate the call to check for lazy items for all the supported foundation collections in the page.
     * Currently lazy loading is supported for tables and masonries.
     */
    function invokeForAllCollections() {
        $("coral-masonry.foundation-collection,.foundation-collection[is='coral-table']").each(function() {
            var self = this;
            Coral.commons.ready(self, function() {
                queueCollectionLazyItemChecker(self);
            });
        });
    }

    function triggerForTheTable(event) {
        queueCollectionLazyItemChecker(event.target);
    }

    document.addEventListener("scroll", filterScrollForFoundationCollection, true);
    document.addEventListener("transitionend", filterTransitionEndToMasonryItems, true);
    window.addEventListener("resize", invokeForAllCollections, true);
    $(document).on("foundation-contentloaded", invokeForAllCollections);
    $(document).on("coral-table:columnsort", triggerForTheTable);

    /**
     * Class to use for ensuring a certain list of items are loaded for a certain collection
     * @param {HTMLElement} collection the collection to load items for
     * @constructor
     */
    function LazyLoader(collection) {
        this.collection = $(collection);
    }

    /**
     * Ensures all the specified items are loaded.
     * See description of {@link lazyLoadTheseItems} for more details.
     * @param {Array} items the items to make sure are loaded.
     * @return {Promise} a promise that resolves to the list of items that have been loaded.
     */
    LazyLoader.prototype.loadItems = function(items) {
        return lazyLoadTheseItems(this.collection, items);
    };

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-util-lazyloader",
        selector: $(window),
        adapter: function() {
            return LazyLoader;
        }
    });
})(window, document, Granite, Granite.$, Granite.URITemplate, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    function updateServer(modified, deleted, action) {
        if (!action) {
            throw new Error("Error saving user preferences: action param is missing");
        }

        deleted.forEach(function(v) {
            modified[v + "@Delete"] = "";
        });

        $.post({
            url: action,
            data: modified
        }).fail(function(xhr, textStatus, errorThrown) {
            // eslint-disable-next-line no-console
            console.error("Error saving user preferences:", textStatus, errorThrown);
        });
    }

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-preference",
        selector: $(window),
        adapter: function() {
            var meta = $("meta[name='user.preferences']", document.head);
            var action = meta.attr("data-foundation-preference-action");

            var data = {};
            try {
                data = JSON.parse(meta.prop("content"));
            } catch (e) {
                // ignored
            }

            return {
                _setAction: function(v) {
                    action = v;
                },

                names: function() {
                    return Object.keys(data);
                },

                get: function(name) {
                    return data[name];
                },

                getBoolean: function(name, defaultValue) {
                    var v = this.get(name);

                    if (defaultValue !== undefined && v === undefined) {
                        return defaultValue;
                    }

                    if (typeof v === "boolean") {
                        return v;
                    } else if (v === "true") {
                        return true;
                    } else if (v === "false") {
                        return false;
                    } else {
                        return !!v;
                    }
                },

                getNumber: function(name, defaultValue) {
                    var v = this.get(name);
                    if (typeof v === "number") {
                        return v;
                    } else {
                        defaultValue = defaultValue === undefined ? 0 : defaultValue;
                        var parsed = Number(v).valueOf();
                        return isNaN(parsed) ? defaultValue : parsed;
                    }
                },

                set: function(name, value) {
                    var map = new Map();
                    map.set(name, value);

                    this.setAll(map);
                },

                setAll: function(map) {
                    var modified = {};
                    var deleted = [];

                    map.forEach(function(value, key) {
                        if (value === undefined) {
                            delete data[key];
                            deleted.push(key);
                        } else {
                            data[key] = value;
                            modified[key] = value;
                        }
                    });

                    $(document).trigger("foundation-preference-change");
                    updateServer(modified, deleted, action);
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    var everyReverse = Granite.UI.Foundation.Utils.everyReverse;
    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-response-parser",
        selector: $(window),
        adapter: function() {
            return {
                parse: function(xhr) {
                    var parsedResponse;

                    var contentType = xhr.getResponseHeader("content-type");
                    // The request from Tools/Configuration Browser/Folder edit will have not content-type
                    // http://localhost:4502/conf/global.updateconf.json
                    if (!contentType) {
                        return xhr.responseText;
                    }

                    everyReverse(registry.get("foundation.response.parser"), function(c) {
                        if (!contentType.match(c.contentType)) {
                            return true;
                        }

                        var data = c.handler(xhr);

                        if (data === false) {
                            return true;
                        }

                        parsedResponse = data;
                        return false;
                    });

                    return parsedResponse;
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.response.parser", {
        name: "foundation.json",
        contentType: /application\/json/,
        handler: function(xhr) {
            return JSON.parse(xhr.responseText);
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.response.parser", {
        name: "foundation.html",
        contentType: /text\/html/,
        handler: function(xhr) {
            return $(window).adaptTo("foundation-util-htmlparser").createFragment(xhr.responseText);
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var everyReverse = Granite.UI.Foundation.Utils.everyReverse;
    var registry = $(window).adaptTo("foundation-registry");

    /**
     * Returns the <code>FoundationValidationSelector</code> that matches the given element.
     *
     * @param selectors The array of <code>FoundationValidationSelector</code> to find the match.
     * @param $el The jQuery element to be checked against the selectors.
     */
    function getMatchingSelectorConfig(selectors, $el) {
        for (var i = selectors.length - 1; i >= 0; i--) {
            var selector = selectors[i];

            if (selector.submittable && $el.is(selector.submittable)) {
                return selector;
            }
        }
        return undefined;
    }

    /**
     * @see {@link http://www.w3.org/TR/html5/forms.html#the-constraint-validation-api}
     */
    function HTMLValidation(el, selectorConfig) {
        this.el = el;
        this.selectorConfig = selectorConfig;
        this.$el = $(el);
        this.message = null;
        this.customMessage = null;
        this.isValidated = false;

        this.state = (function(outer) {
            return {
                getCustomError: function() {
                    return !!outer.customMessage;
                },
                isValid: function() {
                    return !outer.customMessage && !outer.message;
                },
                isValidated: function() {
                    return outer.isValidated;
                }
            };
        })(this);
    }

    HTMLValidation.prototype = {
        willValidate: function() {
            if (!this.selectorConfig) {
                var selectors = registry.get("foundation.validation.selector");
                this.selectorConfig = getMatchingSelectorConfig(selectors, this.$el);
            }

            var candidate = this.selectorConfig.candidate;
            return candidate && this.$el.is(candidate);
        },

        setCustomValidity: function(message) {
            this.customMessage = message;
        },

        getValidity: function() {
            return this.state;
        },

        checkValidity: function(options) {
            options = options || {};

            if (!this.willValidate()) {
                this.message = null;
                this.customMessage = null;
                this.isValidated = true;

                if (!options.suppressEvent) {
                    this.$el.trigger("foundation-validation-valid");
                }

                return true;
            }

            this.isValidated = true;

            if (this.customMessage) {
                if (!options.suppressEvent) {
                    this.$el.trigger("foundation-validation-invalid");
                }
                return false;
            }

            this.message = null;
            everyReverse(registry.get("foundation.validation.validator"), function(v) {
                if (!v.validate) {
                    return true;
                }

                if (!this.$el.is(v.selector)) {
                    return true;
                }

                var m = v.validate(this.el);
                if (m) {
                    this.message = m;
                    return false;
                } else {
                    return true;
                }
            }, this);

            if (this.message) {
                if (!options.suppressEvent) {
                    this.$el.trigger("foundation-validation-invalid");
                }
                return false;
            }

            if (!options.suppressEvent) {
                this.$el.trigger("foundation-validation-valid");
            }

            return true;
        },

        getValidationMessage: function() {
            if (!this.willValidate()) {
                return "";
            }
            return this.customMessage || this.message || "";
        },

        updateUI: function() {
            if (this.el.dataset.foundationValidationUi === "none") {
                return;
            }

            var f;
            if (this.getValidity().isValid()) {
                f = function(v) {
                    if (!v.clear) {
                        return true;
                    }

                    if (!this.$el.is(v.selector)) {
                        return true;
                    }

                    var isNext = false;

                    v.clear(this.el, {
                        next: function() {
                            isNext = true;
                        }
                    });

                    return isNext;
                };
            } else {
                f = function(v) {
                    if (!v.show) {
                        return true;
                    }

                    if (!this.$el.is(v.selector)) {
                        return true;
                    }

                    var isNext = false;

                    v.show(this.el, this.getValidationMessage(), {
                        next: function() {
                            isNext = true;
                        }
                    });

                    return isNext;
                };
            }

            everyReverse(registry.get("foundation.validation.validator"), f, this);
        }
    };


    var submittableCache = new WeakMap();

    function getSubmittableSelector(selectors) {
        return selectors.reduceRight(function(memo, selector) {
            if (selector.submittable) {
                memo.push(selector.submittable);
            }
            return memo;
        }, []).join(",");
    }

    function isExcluded(selectors, $el) {
        return selectors.some(function(selector) {
            if (!selector.exclusion) {
                return false;
            }
            return $el.is(selector.exclusion);
        });
    }

    $.extend($.expr[":"], {
        "-foundation-submittable": function(el) {
            if (submittableCache.has(el)) {
                return submittableCache.get(el).isSubmittable;
            }

            var $el = $(el);
            var selectors = registry.get("foundation.validation.selector");

            var matchingSelectorConfig = getMatchingSelectorConfig(selectors, $el);

            var isSubmittable = false;

            if (matchingSelectorConfig) {
                isSubmittable = !isExcluded(selectors, $el);
            }

            submittableCache.set(el, {
                isSubmittable: isSubmittable,
                selectorConfig: matchingSelectorConfig
            });
            return isSubmittable;
        }
    });


    registry.register("foundation.adapters", {
        type: "foundation-validation",
        selector: ":-foundation-submittable",
        adapter: function(el) {
            return new HTMLValidation(el, submittableCache.get(el).selectorConfig);
        }
    });


    registry.register("foundation.adapters", {
        type: "foundation-validation-helper",
        selector: "*",
        adapter: function(el) {
            return {
                getSubmittables: function() {
                    var selectors = registry.get("foundation.validation.selector");

                    var fields = $(el).find(getSubmittableSelector(selectors));

                    return fields.filter(function() {
                        var isIncluded = !isExcluded(selectors, $(this));
                        submittableCache.set(this, {
                            isSubmittable: isIncluded
                        });
                        return isIncluded;
                    }).toArray();
                },

                isValid: function() {
                    return this.getSubmittables().every(function(v) {
                        var api = $(v).adaptTo("foundation-validation");
                        var state = api.getValidity();

                        if (state.isValidated()) {
                            return state.isValid();
                        } else {
                            return api.checkValidity({
                                suppressEvent: true
                            });
                        }
                    });
                }
            };
        }
    });


    /**
     * Statically validate the constraints of form.
     * @see {@link http://www.w3.org/TR/html5/forms.html#statically-validate-the-constraints}
     */
    function staticallyValidate(form) {
        return $(form.adaptTo("foundation-validation-helper").getSubmittables())
            .map(function() {
                var api = $(this).adaptTo("foundation-validation");

                if (api.checkValidity({ suppressEvent: true })) {
                    return;
                }

                return {
                    el: this,
                    api: api
                };
            }).map(function() {
                var e = $.Event("foundation-validation-invalid");
                $(this.el).trigger(e);

                if (!e.isDefaultPrevented()) {
                    return this;
                }
            });
    }

    /**
     * Interactively validate the constraints of form.
     * @see {@link http://www.w3.org/TR/html5/forms.html#interactively-validate-the-constraints}
     */
    function interactivelyValidate(form) {
        var unhandleds = staticallyValidate(form);

        if (unhandleds.length > 0) {
            unhandleds.each(function() {
                this.api.updateUI();
            });
            return false;
        }

        return true;
    }

    // Use event capturing to cancel and stop propagating the event when form is invalid
    // This way no other event handlers are executed
    document.addEventListener("submit", function(e) {
        var form = $(e.target);

        if (!form.is("form") ||
            form.prop("noValidate") === true ||
            (form.prop("noValidate") === undefined && form.attr("novalidate") !== undefined)) {
            return;
        }

        // TODO For now, let's just access private data of others for prechecked
        // Once it is confirmed that this is what we want, we can simply expose adaptTo for prechecked validation
        // e.g. `var isValidPrechecked = form.adaptTo("foundation-validation-prechecked").isValid();`
        var isValidPrechecked = form.data("foundation-validation-bind.internal.valid");

        var isValid;
        if (isValidPrechecked !== undefined) {
            isValid = isValidPrechecked;
        } else {
            isValid = interactivelyValidate(form);
        }

        if (!isValid) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    // This is compatibility layer for $.validator on top of foundation-validation.

    var warningCount = 0;

    function deprecate(topic) {
        if (window.console && warningCount < 1) {
            warningCount++;
            // eslint-disable-next-line no-console
            console.warn("@deprecated ", topic, "; use foundation-validation");
        }
    }

    $.extend($.expr[":"], {
        submittable: function(el) {
            deprecate(":submittable");
            return $(el).is(":-foundation-submittable");
        }
    });

    $.fn.willValidate = function() {
        deprecate("$.fn.willValidate");
        var api = this.adaptTo("foundation-validation");
        if (api) {
            return api.willValidate();
        } else {
            return false;
        }
    };

    $.fn.validationMessage = function() {
        deprecate("$.fn.validationMessage");
        var api = this.adaptTo("foundation-validation");
        if (api) {
            return api.getValidationMessage();
        } else {
            return "";
        }
    };

    $.fn.checkValidity = function() {
        deprecate("$.fn.checkValidity");
        var api = this.adaptTo("foundation-validation");
        if (api) {
            return api.checkValidity();
        } else {
            return true;
        }
    };

    $.fn.setCustomValidity = function(message) {
        deprecate("$.fn.setCustomValidity");
        return this.each(function() {
            var api = $(this).adaptTo("foundation-validation");
            if (api) {
                api.setCustomValidity(message);
            }
        });
    };

    $.fn.updateErrorUI = function() {
        deprecate("$.fn.updateErrorUI");
        return this.each(function() {
            var api = $(this).adaptTo("foundation-validation");
            if (api) {
                api.updateUI();
            }
        });
    };


    var registry = $(window).adaptTo("foundation-registry");

    function wrap(validator) {
        var validate = validator.validate;
        if (validate) {
            validator.validate = function(el) {
                return validate($(el));
            };
        }

        var show = validator.show;
        if (show) {
            validator.show = function(el, message, result) {
                if (show($(el), message) === $.validator.CONTINUE) {
                    result.next();
                }
            };
        }

        var clear = validator.clear;
        if (clear) {
            validator.clear = function(el, result) {
                if (clear($(el)) === $.validator.CONTINUE) {
                    result.next();
                }
            };
        }

        return validator;
    }

    $.validator = {
        CONTINUE: 1,
        STOP: 2,
        register: function() {
            deprecate("$.validator");
            $.each(arguments, function() {
                registry.register("foundation.validation.validator", wrap(this));
            });
        },
        isValid: function(root, suppressEvent) {
            deprecate("$.validator");

            return root.adaptTo("foundation-validation-helper").getSubmittables().every(function(v) {
                var api = $(v).adaptTo("foundation-validation");
                var state = api.getValidity();

                if (state.isValidated()) {
                    return state.isValid();
                } else {
                    return api.checkValidity({
                        suppressEvent: suppressEvent
                    });
                }
            });
        }
    };


    $(document).on("foundation-validation-valid", function(e) {
        $(e.target).trigger("valid");
    });

    $(document).on("foundation-validation-invalid", function(e) {
        var newEvent = $.Event("invalid", {
            isJqueryValidator: true
        });

        $(e.target).trigger(newEvent);

        if (newEvent.isDefaultPrevented()) {
            e.preventDefault();
        }
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    function getBindedElements(form) {
        var submits = form.find(".foundation-validation-bind");

        var formId = form.prop("id");
        if (formId) {
            submits = submits.add($(".foundation-validation-bind[form]").filter(function() {
                return $(this).attr("form") === formId;
            }));
        }

        return submits;
    }

    function enableNext(form) {
        var binded = getBindedElements(form);

        if (!binded.length) {
            return;
        }

        var v = form.adaptTo("foundation-validation-helper").isValid();
        form.data("foundation-validation-bind.internal.valid", v);

        binded.prop("disabled", !v);
    }

    function pushInvalid(container, invalid) {
        var key = "foundation-validation-bind.internal.invalids";

        var invalids = container.data(key);
        if (invalids === undefined) {
            invalids = [];
            container.data(key, invalids);
        }

        if (invalids.indexOf(invalid) < 0) {
            invalids.push(invalid);
        }
    }

    $(document).on("foundation-validation-invalid", "form", function(e) {
        var form = $(this);
        getBindedElements(form).prop("disabled", true);
        pushInvalid(form, e.target);
    });

    $(document).on("foundation-validation-valid", "form", function(e) {
        var form = $(this);
        var invalids = form.data("foundation-validation-bind.internal.invalids");

        if (!invalids) {
            enableNext(form);
            return;
        }

        var i = invalids.indexOf(e.target);
        if (i >= 0) {
            invalids.splice(i, 1);
        }

        if (invalids.length === 0) {
            enableNext(form);
            return;
        }

        // check if the invalids are belong to the form (they can be moved meanwhile)
        // if all of them are outside the form, then enable the binded element

        var invalid = false;

        var j = invalids.length;
        while (j--) {
            if (form.has(invalids[j]).length) {
                invalid = true;
                break;
            }
            invalids.splice(j, 1);
        }

        if (!invalid) {
            enableNext(form);
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Coral) {
    "use strict";

    //===============================================================================================================
    // WARNING Since order matters, only put generic validators and drivers in this file.
    // This file will be loaded first before other granite level validators and drivers. (e.g. layout specific ones)
    //===============================================================================================================

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.validation.validator", {
        selector: "*",
        show: function(el, message) {
            var $el = $(el);

            var fieldAPI = $el.adaptTo("foundation-field");
            if (fieldAPI && fieldAPI.setInvalid) {
                fieldAPI.setInvalid(true);
            }

            var error = $el.data("foundation-validation.internal.error");

            if (error) {
                error.content.innerHTML = message;

                if (!error.parentNode) {
                    $el.after(error);
                    error.show();
                    setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), error.id));
                }
            } else {
                error = new Coral.Tooltip();
                error.variant = "error";
                error.interaction = "off";
                error.placement = "top";
                error.target = el;
                error.content.innerHTML = message;
                error.open = true;
                error.id = Coral.commons.getUID();

                $el.data("foundation-validation.internal.error", error);
                $el.after(error);
                setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), error.id));
            }
        },
        clear: function(el) {
            var $el = $(el);

            var fieldAPI = $el.adaptTo("foundation-field");
            if (fieldAPI && fieldAPI.setInvalid) {
                fieldAPI.setInvalid(false);
            }

            var error = $el.data("foundation-validation.internal.error");
            if (error) {
                error.hide();
                error.remove();

                // Remove the ID of error from the label of field
                var labelledBy = getLabelledBy(fieldAPI);
                if (labelledBy && labelledBy.indexOf(error.id) !== -1) {
                    var newLabel = labelledBy.split(" ")
                        .filter(function(v) {
                            return v !== error.id;
                        })
                        .join(" ");
                    setLabelledBy(fieldAPI, newLabel);
                }
            }
        }
    });

    function getLabel(label, errorId) {
        if (label) {
            return label + " " + errorId;
        }
        return errorId;
    }

    /**
     * This method sets value of labelledby attribute on field.
     *
     * @param fieldAPI foundation-field
     * @param labelledBy value of labelledby attribute to set on field
     */
    function setLabelledBy(fieldAPI, labelledBy) {
        if (fieldAPI && fieldAPI.setLabelledBy) {
            fieldAPI.setLabelledBy(labelledBy);
        }
    }

    /**
     * This method gets value of labelledby attribute from field.
     *
     * @param fieldAPI foundation-field
     */
    function getLabelledBy(fieldAPI) {
        if (fieldAPI && fieldAPI.getLabelledBy) {
            return fieldAPI.getLabelledBy();
        }
    }

    // A mixed field is not supposed to be validated.
    registry.register("foundation.validation.selector", {
        exclusion: ".foundation-field-mixed"
    });

    // .foundation-field-related is not supposed to be considered as field.
    // So we have to exclude it.
    // It is usually used in hidden field for SlingPostServlet control,
    // such as <input class=".foundation-field-related" type="hidden" name="name1@Delete">
    registry.register("foundation.validation.selector", {
        exclusion: ".foundation-field-related"
    });
})(window, document, Granite.$, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Granite) {
    "use strict";

    var NON_VALID_CHARS = "%/\\:*?\"[]|\n\t\r. ";

    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector: "[data-foundation-validation~='foundation.jcr.name'],[data-validation~='foundation.jcr.name']",
        validate: function(el) {
            var v = el.value;

            for (var i = 0, ln = v.length; i < ln; i++) {
                if (NON_VALID_CHARS.indexOf(v[i]) >= 0 || v.charCodeAt(i) > 127) {
                    return Granite.I18n.get("Invalid character '{0}'. It must be a valid JCR name.", [ v[i] ]);
                }
            }
        }
    });
})(window, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var timeConfig = Granite.UI.Foundation.Time;

    if (!timeConfig) {
        // eslint-disable-next-line no-console
        console.warn("Granite.UI.Foundation.Time is not available; no setting is set");
        return;
    }

    timeConfig.relative = $(window).adaptTo("foundation-preference").get("relativeDateCutoff");
    timeConfig.locale = document.documentElement.lang || window.navigator.userLanguage || window.navigator.language;
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Coral, Granite, URITemplate) {
    "use strict";

    var DATA_ATTRIBUTE_FOUNDATION_AUTOCOMPLETE_PREFIX = "foundationAutocompleteCustom";

    var PropertyBuilder = $(window).adaptTo("foundation-util-propertybuilder");

    function resolveElement(src) {
        if (!src) {
            return $.Deferred().reject().promise();
        }

        if (src[0] === "#") {
            return $.when(document.querySelector(src));
        }

        return $.ajax({
            url: src,
            cache: false
        }).then(function(html) {
            return $(window).adaptTo("foundation-util-htmlparser").parse(html);
        }).then(function(fragment) {
            return $(fragment).children()[0];
        });
    }

    var isIE11 = window.navigator.userAgent.indexOf("Trident/7.0") >= 0;


    var DEFAULT_DELAY = 500;
    var KB_TAB = 9;
    var KB_ENTER = 13;
    var KB_ESCAPE = 27;
    var KB_ARROW_UP = 38;
    var KB_ARROW_DOWN = 40;

    var Prototype = Object.create(HTMLElement.prototype);

    Prototype.createdCallback = function() {
        var self = this;

        this._render();

        var inputTimeout;

        if (isIE11) {
            // IE 10 and 11 fire the input event when an input field with a placeholder is focused
            // or on page load when the placeholder contains certain characters, like Chinese.
            // In this case, we simply solve it by using keydown event instead.
            this._input.addEventListener("keydown", function(e) {
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(self._onUserInput.bind(self), self.delay);
            });
        } else {
            this._input.addEventListener("input", function(e) {
                clearTimeout(inputTimeout);
                inputTimeout = setTimeout(self._onUserInput.bind(self), self.delay);
            });
        }

        this._input.addEventListener("keydown", function(e) {
            switch (e.keyCode) {
                case KB_ARROW_UP:
                case KB_ARROW_DOWN:
                    e.preventDefault();
                    clearTimeout(inputTimeout);

                    if (self._suggestion.open) {
                        self._focus(self._suggestion, e.keyCode === KB_ARROW_UP);
                    } else {
                        self._onUserInput();
                    }
                    break;
                case KB_ESCAPE:
                    e.preventDefault();
                    clearTimeout(inputTimeout);
                    self._cancelSuggestion();
                    break;
                case KB_TAB:
                    clearTimeout(inputTimeout);
                    self._cancelSuggestion();
                    break;
                case KB_ENTER:
                    // this allows group mode to be submitted using ENTER
                    if (self._suggestion.open || (self.valueDisplayMode !== "inline" && self._input.value !== "")) {
                        e.preventDefault();
                    }

                    clearTimeout(inputTimeout);

                    var userInput = self._input.value.trim();

                    if (userInput.length) {
                        self._appendValue(userInput).then(function() {
                            self._cancelSuggestion();
                            self._input.value = "";
                        });
                    }
                    break;
            }
        });

        this._input.addEventListener("blur", function(e) {
            if (!self.multiple && self.forceSelection) {
                // restore last selection
                self._getValueAPI(function(api) {
                    var values = api.getValues();

                    if (values.length) {
                        self._input.value = values[0].text;
                    } else {
                        self._input.value = "";
                    }
                });
            }
        });

        $(this).on("change", "coral-taglist[foundation-autocomplete-value]", function(e) {
            self._onValueChangeByUser();
        });

        $(this).on("coral-collection:remove", "coral-taglist[foundation-autocomplete-value]", function(e) {
            if (!self.classList.contains("foundation-field-mixed")) {
                return;
            }

            var removedTag = e.originalEvent.detail.item;

            if (!removedTag.value.startsWith("+")) {
                self._removedValuesWhenMixed.push(removedTag.value);
            }
        });

        $(this).on("change foundation-field-change", function(e) {
            if (e.target !== self) {
                // Prevent the event to leak out of the autocomplete.
                e.stopImmediatePropagation();
            }
        });

        this._button.addEventListener("click", function(e) {
            e.preventDefault();
            self._togglePicker();
        });

        this._suggestion = {
            el: null,
            open: false,
            api: null
        };

        this._value = {
            el: null,
            api: null
        };

        this._picker = {
            el: null,
            open: false,
            loading: false,
            api: null
        };

        this._removedValuesWhenMixed = [];

        this._setupValueObserver();

        // Call attributeChangedCallback to handle initial setup
        var attributes = this.attributes;
        for (var i = 0; i < attributes.length; i++) {
            this.attributeChangedCallback(attributes[i].name, undefined, attributes[i].value);
        }
    };

    Prototype.attributeChangedCallback = function(name, oldVal, newVal) {
        if (name === "pickersrc") {
            this._picker.el = null;
            return;
        }

        if (name === "variant") {
            this._onVariantChange();
            return;
        }

        if (name === "name") {
            this._getValueAPI(function(api) {
                api.setName(newVal);
            });
            return;
        }

        if (name === "placeholder") {
            this._input.setAttribute("placeholder", newVal);
            return;
        }

        if (name === "labelledby") {
            this._input.setAttribute("labelledby", newVal);
            return;
        }

        if (name === "disabled") {
            var disabled = newVal !== null;

            this._input.disabled = disabled;
            this._button.disabled = disabled;

            this._getValueAPI(function(api) {
                api.setDisabled(disabled);
            });
            return;
        }

        if (name === "readonly") {
            var readOnly = newVal !== null;

            this._input.readOnly = readOnly;
            this._button.disabled = readOnly;

            this._getValueAPI(function(api) {
                api.setReadOnly(readOnly);
            });
            return;
        }

        if (name === "invalid") {
            this._input.invalid = newVal !== null;
            return;
        }

        if (name === "required") {
            this._input.setAttribute("aria-required", newVal !== null);
            return;
        }
    };

    Object.defineProperties(Prototype, {
        field: {
            get: function() {
                return this._input;
            }
        },

        delay: new PropertyBuilder(PropertyBuilder.createAttrBasedProperty("delay"))
            .mix(PropertyBuilder.integerType(DEFAULT_DELAY))
            .mix(PropertyBuilder.positiveNumber(DEFAULT_DELAY))
            .build(),

        pickerSrc: PropertyBuilder.createAttrBasedProperty("pickersrc"),

        valueDisplayMode: PropertyBuilder.createAttrBasedProperty("valuedisplaymode", "inline"),

        variant: PropertyBuilder.createAttrBasedProperty("variant"),

        name: PropertyBuilder.createAttrBasedProperty("name", ""),

        placeholder: PropertyBuilder.createAttrBasedProperty("placeholder", ""),

        labelledBy: PropertyBuilder.createAttrBasedProperty("labelledby", ""),

        disabled: PropertyBuilder.createBooleanAttrBasedProperty("disabled"),

        readOnly: PropertyBuilder.createBooleanAttrBasedProperty("readonly"),

        invalid: PropertyBuilder.createBooleanAttrBasedProperty("invalid"),

        required: PropertyBuilder.createBooleanAttrBasedProperty("required"),

        multiple: PropertyBuilder.createBooleanAttrBasedProperty("multiple"),

        forceSelection: PropertyBuilder.createBooleanAttrBasedProperty("forceselection"),

        value: {
            get: function() {
                if (this.multiple) {
                    return this.values[0];
                } else {
                    return this.values[0] || "";
                }
            },
            set: function(value) {
                this.values = [ value ];
            }
        },

        values: {
            get: function() {
                return this._getValueAPI(function(api) {
                    return api.getValues().map(function(v) {
                        return v.value;
                    });
                });
            },
            set: function(values) {
                var self = this;

                this._getValueAPI(function(api) {
                    var selections = values.map(function(v) {
                        return {
                            value: v,
                            text: v
                        };
                    });

                    if (self.multiple) {
                        api.setValues(selections);
                    } else {
                        api.setValues(selections.length > 0 ? [ selections[0] ] : []);
                    }

                    self._validate();
                });
            }
        }
    });

    Prototype.focus = function() {
        // Somehow the rAF is required to make focus() work.
        requestAnimationFrame(function() {
            this._input.focus();
        }.bind(this));
    };

    Prototype.clear = function() {
        this.values = [];
        if (this._input) {
            requestAnimationFrame(function() {
                this._input.value = "";
            }.bind(this));
        }
    };

    Prototype._render = function() {
        // clean up children
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (child.classList.contains("foundation-autocomplete-inputgroupwrapper")) {
                this.removeChild(child);
            }
        }

        this._inputGroup = document.createElement("div");
        this._inputGroup.classList.add("coral-InputGroup");

        this._input = new Coral.Textfield();
        this._input.classList.add("coral-InputGroup-input");
        this._input.autocomplete = "off";
        this._input.placeholder = this.placeholder;
        this._input.labelledBy = this.labelledBy;

        var buttonWrapper = document.createElement("span");
        buttonWrapper.classList.add("coral-InputGroup-button");

        var labelString = Granite.I18n.get("Open Selection Dialog");

        this._button = new Coral.Button().set({
            icon: "select",
            title: labelString,
            type: "button"
        });
        this._button.setAttribute("aria-label", labelString);
        buttonWrapper.appendChild(this._button);

        this._inputGroup.appendChild(this._input);
        this._inputGroup.appendChild(buttonWrapper);

        // Flexbox doesn't work with table as an item (which is used by InputGroup), so need to wrap.
        this._inputGroupWrapper = document.createElement("div");
        this._inputGroupWrapper.classList.add("foundation-autocomplete-inputgroupwrapper");
        this._inputGroupWrapper.appendChild(this._inputGroup);

        this.insertBefore(this._inputGroupWrapper, this.firstChild);

        this._onVariantChange();

        this.setAttribute("role", "combobox");
    };

    Prototype._setupValueObserver = function() {
        var self = this;

        var stack = [ this._handleInputSize(), this._handleSingleSelectionMode() ];

        var perform = function() {
            self._getValueAPI(function() {
                stack.forEach(function(v) {
                    v.perform.call(self);
                });
            });
        };

        // Do a perform for the scenario where the whole DOM structure is ready,
        // like in the case for server-side rendering.
        perform();

        var observer = new MutationObserver(function(changes) {
            changes.forEach(function(c) {
                $(c.addedNodes).filter("[foundation-autocomplete-value]").each(function() {
                    perform();
                });
                // Currently we don't handle scenario where `[foundation-autocomplete-value]` element is removed.
            });
        });

        observer.observe(this, {
            childList: true
        });
    };

    Prototype._handleInputSize = function() {
        var refreshInputSize = function(valueEl) {
            var $input = $(this._input);

            if (this.multiple && this.valueDisplayMode === "inline") {
                if (valueEl) {
                    var padding = $(valueEl).outerWidth(true);
                    $input.css("padding-left", padding);
                } else {
                    $input.css("padding-left", "");
                }
            } else {
                $input.css("padding-left", "");
            }
        }.bind(this);

        var valueResizeHandler = function(e) {
            refreshInputSize(this);
        };

        return {
            perform: function() {
                Coral.commons.addResizeListener(this._value.el, valueResizeHandler);
            },
            destroy: function() {
                refreshInputSize();
                Coral.commons.removeResizeListener(this._value.el, valueResizeHandler);
            }
        };
    };

    Prototype._handleSingleSelectionMode = function() {
        // For single selection mode, sync the first tag to the text field.

        var f = function() {
            var firstTag = this._value.el.items.getAll()[0];
            if (firstTag) {
                this._input.value = firstTag.value;
            }
        }.bind(this);

        var observer;

        return {
            perform: function() {
                if (!this.multiple) {
                    requestAnimationFrame(function() { // Wait for custom element upgrade
                        f();
                    });
                }

                observer = new MutationObserver(function(changes) {
                    if (this.multiple) {
                        return;
                    }

                    changes.forEach(function(c) {
                        var hasNewTag = $(c.addedNodes).filter("coral-tag").length;
                        if (hasNewTag) {
                            f();
                        }
                    });
                }.bind(this));

                observer.observe(this._value.el, {
                    childList: true
                });
            },
            destroy: function() {
                observer.disconnect();
            }
        };
    };

    Prototype._onVariantChange = function() {
        var value = this.variant;

        if (value === "omnisearch") {
            this._input.variant = "quiet";
            this._button.variant = "quiet";
            this._inputGroup.classList.add("coral-InputGroup--quiet");
        } else {
            this._input.variant = Coral.Textfield.variant.DEFAULT;
            this._button.variant = Coral.Button.variant.DEFAULT;
            this._inputGroup.classList.remove("coral-InputGroup--quiet");
        }
    };

    Prototype._onUserInput = function() {
        var self = this;

        if (!this.multiple) {
            this._appendValue(this._input.value.trim(), true);
        }

        var setValue = function(value) {
            self._input.value = value;
        };

        this._getSuggestionAPI(function(api) {
            var currentSelections = this._getValueAPI(function(valueAPI) {
                return valueAPI.getValues();
            }, function() {
                return [];
            });

            api.pick(self, currentSelections, self._input.value, setValue).then(function(selections) {
                self._suggestion.open = false;

                self._input.value = "";
                self._input.focus();
                self._setSelections(selections);
            }, function() {
                self._suggestion.open = false;
                self._input.focus();
            });

            self._suggestion.open = true;
        });
    };

    Prototype._onValueChangeByUser = function(deferChangeEvent) {
        var self = this;

        if (deferChangeEvent) {
            if (!this._deferChangeEvent) {
                this._deferChangeEvent = true;

                // Trigger `change` before `focusout`
                // Somehow jQuery is needed to do this and using `addEventListener` doesn't give the right order
                $(this._input).on("focusout", function f(e) {
                    if (self.contains(e.relatedTarget)) {
                        return;
                    }

                    $(self._input).off("focusout", f);
                    self._triggerChangeEvent();
                    self._deferChangeEvent = null;
                });
                this._validate();
            }
            return;
        }

        this._triggerChangeEvent();
        this._validate();
    };

    Prototype._triggerChangeEvent = function() {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, false);
        this.dispatchEvent(event);

        // Also handle other `foundation` contracts.
        $(this).trigger("foundation-field-change");
    };

    Prototype._getSuggestionAPI = function(callback, failureCallback) {
        if (!this._suggestion.api) {
            var $el = $(this).children("[foundation-autocomplete-suggestion]").first();

            if (!$el.length) {
                if (failureCallback) {
                    return failureCallback.call(this);
                }
                return;
            }

            this._suggestion.el = $el[0];
            this._suggestion.api = $el.adaptTo("foundation-picker");
        }

        return callback.call(this, this._suggestion.api);
    };

    Prototype._getValueAPI = function(callback, failureCallback) {
        if (!this._value.api) {
            var $el = $(this).children("[foundation-autocomplete-value]").first();

            if (!$el.length) {
                if (failureCallback) {
                    return failureCallback.call(this);
                }
                return;
            }

            this._value.el = $el[0];
            this._value.api = createValueAPI($el[0]);
        }

        return callback.call(this, this._value.api);
    };

    Prototype._focus = function(config, last) {
        if ("focus" in config.api) {
            config.api.focus(last);
        } else {
            config.el.focus();
        }
    };

    Prototype._validate = function() {
        var validationAPI = $(this).adaptTo("foundation-validation");
        if (validationAPI) {
            validationAPI.checkValidity();
            validationAPI.updateUI();
        }
    };

    Prototype._setSelections = function(selections, deferChangeEvent) {
        var self = this;

        self._getValueAPI(function(api) {
            if (self.multiple) {
                if (self.classList.contains("foundation-field-mixed")) {
                    api.appendValues(selections.map(function(s) {
                        var index = self._removedValuesWhenMixed.indexOf(s.value);

                        if (index >= 0) {
                            self._removedValuesWhenMixed.splice(index, 1);
                        } else {
                            s.value = "+" + s.value;
                        }
                        return s;
                    }));
                } else {
                    api.appendValues(selections);
                }
            } else {
                if (selections.length) {
                    api.setValues([ selections[0] ]);
                } else {
                    api.setValues([]);
                }
            }

            self._onValueChangeByUser(deferChangeEvent);
        });
    };

    Prototype._cancelSuggestion = function() {
        var self = this;

        if (!self._suggestion.open) {
            return;
        }

        this._getSuggestionAPI(function(api) {
            api.cancel();
            self._suggestion.open = false;
        });
    };

    Prototype._appendValue = function(userInput, deferChangeEvent) {
        var self = this;

        if (!this.multiple && userInput.length === 0) {
            this._setSelections([], deferChangeEvent);
            return $.when();
        }

        var deferred = $.Deferred();

        this._getSuggestionAPI(function(api) {
            api.resolve([ userInput ]).then(function(selections) {
                if (selections[0] !== null) {
                    self._setSelections(selections, deferChangeEvent);
                    deferred.resolve();
                } else if (!self.forceSelection) {
                    self._setSelections([{
                        value: userInput,
                        text: userInput,
                        isUserDefined: true
                    }], deferChangeEvent);
                    deferred.resolve();
                }
            });
        }, function() {
            if (self.forceSelection) {
                return deferred.reject();
            }

            self._setSelections([{
                value: userInput,
                text: userInput,
                isUserDefined: true
            }], deferChangeEvent);
            deferred.resolve();
        });

        return deferred.promise();
    };

    Prototype._resolvePickerSrc = function() {
        var currentSelections = this._getValueAPI(function(valueAPI) {
            return valueAPI.getValues();
        }, function() {
            return [];
        });
        var variables = {
            value: ""
        };

        if (currentSelections.length > 0) {
            variables.value = currentSelections[currentSelections.length - 1].value;
        }

        this._resolvedPickerSrc = URITemplate.expand(this.pickerSrc, variables);
    };

    Prototype._loadAndShowPicker = function() {
        var self = this;

        this._picker.loading = true;
        this._resolvePickerSrc();
        resolveElement(this._resolvedPickerSrc).then(function(picker) {
            self._picker.loading = false;
            self._picker.el = picker;
            self._picker.api = $(picker).adaptTo("foundation-picker");
            self._showPicker();
        }, function() {
            self._picker.loading = false;
        });
    };

    Prototype._togglePicker = function() {
        if (this._picker.loading) {
            return;
        }

        if (this._picker.el) {
            if (this._picker.open) {
                this._picker.api.cancel();
                this._onCancelPicker();
            } else {
                this._loadAndShowPicker();
            }
        } else {
            this._loadAndShowPicker();
        }
    };

    Prototype._showPicker = function() {
        var self = this;
        var api = this._picker.api;

        api.attach(this);

        var currentSelections = this._getValueAPI(function(valueAPI) {
            return valueAPI.getValues();
        }, function() {
            return [];
        });

        api.pick(this, currentSelections, this._input.value).then(function(selections) {
            self._picker.api.detach();
            self._picker.open = false;

            self._input.focus();
            self._setSelections(selections);
        }, function() {
            self._onCancelPicker();
        });

        this._focus(this._picker);

        this._picker.open = true;
    };

    Prototype._onCancelPicker = function() {
        this._picker.api.detach();
        this._picker.open = false;
        this._input.focus();
    };


    document.registerElement("foundation-autocomplete", {
        prototype: Prototype
    });


    /**
     * Create the Value API that is specifically backed by `Coral.TagList`.
     */
    function createValueAPI(el) {
        return {
            setName: function(name) {
                el.setAttribute("name", name);
            },
            setDisabled: function(disabled) {
                el.disabled = disabled;
            },
            setReadOnly: function(readOnly) {
                el.readOnly = readOnly;
            },
            getValues: function() {
                return el.items.getAll().map(function(tag) {
                    return {
                        value: tag.value,
                        text: tag.label.textContent,
                        isUserDefined: tag.hasAttribute("data-foundation-autocomplete-value-userdefined")
                    };
                });
            },
            setValues: function(selections) {
                el.items.clear();
                this.appendValues(selections);
            },
            appendValues: function(selections) {
                selections.forEach(function(s) {
                    var tag = new Coral.Tag().set({
                        closable: true,
                        value: s.value,
                        label: {
                            textContent: s.text
                        }
                    });

                    if (s.isUserDefined) {
                        tag.setAttribute("data-foundation-autocomplete-value-userdefined", "");
                    }

                    // data to be passed as data attributes
                    if (s.data) {
                        for (var key in s.data) {
                            if (s.data.hasOwnProperty(key)) {
                                var dataKey = key;
                                var firstCharacter = key.charAt(0);

                                if (firstCharacter !== firstCharacter.toUpperCase()) {
                                    dataKey = firstCharacter.toUpperCase();

                                    if (key.length > 1) {
                                        dataKey += key.substr(1);
                                    }
                                }

                                tag.dataset[DATA_ATTRIBUTE_FOUNDATION_AUTOCOMPLETE_PREFIX + dataKey] = s.data[key];
                            }
                        }
                    }

                    el.items.add(tag);
                });
            }
        };
    }


    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-overlay-anchor",
        selector: "foundation-autocomplete",
        adapter: function(el) {
            return {
                getElement: function() {
                    return el._inputGroupWrapper;
                }
            };
        }
    });


    registry.register("foundation.validation.selector", {
        submittable: "foundation-autocomplete",
        candidate: "foundation-autocomplete:not([readonly]):not([disabled])",
        exclusion: "foundation-autocomplete *"
    });

    // Validator for required of foundation-autocomplete
    registry.register("foundation.validation.validator", {
        selector: "foundation-autocomplete",
        validate: function(el) {
            if (!el.required) {
                return;
            }

            if (el.multiple && el.values.length === 0) {
                return Granite.I18n.get("Please fill out this field.");
            } else if (!el.multiple && el.value.length === 0) {
                return Granite.I18n.get("Please fill out this field.");
            }
        }
    });


    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: "foundation-autocomplete",
        adapter: function(el) {
            var $el = $(el);

            return {
                getName: function() {
                    return el.name;
                },
                setName: function(name) {
                    $el.children(".foundation-field-related").each(function() {
                        if (this.name.startsWith(el.name + "@")) {
                            this.name = name + this.name.substring(el.name.length);
                        }
                    });
                    el.name = name;
                },
                isDisabled: function() {
                    return el.disabled;
                },
                setDisabled: function(disabled) {
                    el.disabled = disabled;
                    $el.children(".foundation-field-related:not(.foundation-field-mixed-patchcontrol)")
                        .prop("disabled", disabled);
                },
                isInvalid: function() {
                    return el.invalid;
                },
                setInvalid: function(invalid) {
                    el.invalid = invalid;
                },
                isRequired: function() {
                    return el.required;
                },
                setRequired: function(required) {
                    el.required = required;
                },
                getValue: function() {
                    return el.value;
                },
                setValue: function(value) {
                    el.value = value;
                },
                getLabelledBy: function() {
                    return el.labelledBy;
                },
                setLabelledBy: function(labelledBy) {
                    el.labelledBy = labelledBy;
                },
                getValues: function() {
                    return el.values;
                },
                setValues: function(values) {
                    el.values = values;
                },
                clear: function() {
                    el.clear();
                }
            };
        }
    });

    /**
     * Register a presubmit handler to handle mixed scenario.
     */
    registry.register("foundation.form.submit", {
        selector: "*",
        handler: function(form) {
            var cleanups = [];

            $(form).find("foundation-autocomplete.foundation-field-mixed").each(function() {
                var fieldEl = this;

                fieldEl._removedValuesWhenMixed.forEach(function(value) {
                    var input = document.createElement("input");
                    input.type = "hidden";
                    input.name = fieldEl.name;
                    input.value = "-" + value;

                    fieldEl.appendChild(input);

                    cleanups.push(function() {
                        fieldEl.removeChild(input);
                    });
                });

                cleanups.push(function() {
                    fieldEl._removedValuesWhenMixed = [];
                });
            });

            return {
                post: function() {
                    cleanups.forEach(function(f) {
                        f();
                    });
                    return $.when();
                }
            };
        }
    });
})(window, document, Granite.$, Coral, Granite, Granite.URITemplate);

/*
  ADOBE CONFIDENTIAL

  Copyright 2012 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-collection adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-collection",
        selector: ".foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                append: function(items) {
                    collection.append(items);
                    collection.trigger("foundation-contentloaded");
                },

                clear: function() {
                    collection.find(".foundation-collection-item").remove();
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-selections adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-selections",
        selector: ".foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                count: function() {
                    return collection.find(".foundation-selections-item").length;
                },

                selectAll: function(suppressEvent) {
                    var length = collection
                        .find(".foundation-collection-item:not(.foundation-selections-item)")
                        .addClass("foundation-selections-item").length;

                    if (!suppressEvent && length) {
                        collection.trigger("foundation-selections-change");
                    }
                },

                clear: function(suppressEvent) {
                    var length = collection
                        .find(".foundation-selections-item")
                        .removeClass("foundation-selections-item").length;

                    if (!suppressEvent && length) {
                        collection.trigger("foundation-selections-change");
                    }
                },

                select: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) {
                        return;
                    }

                    item.toggleClass("foundation-selections-item", true);
                    collection.trigger("foundation-selections-change");
                },

                deselect: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) {
                        return;
                    }

                    item.toggleClass("foundation-selections-item", false);
                    collection.trigger("foundation-selections-change");
                },

                isAllSelected: function() {
                    var itemsCount = collection.find(".foundation-collection-item").length;
                    if (itemsCount > 0) {
                        return itemsCount === this.count();
                    }
                    return false;
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(document).on("foundation-selections-change", ".foundation-collection[role=listbox]", function(e) {
        var collection = $(this);

        collection.find(".foundation-collection-item").each(function() {
            var el = $(this);
            var isSelected = el.is(".foundation-selections-item");
            el.attr("aria-selected", isSelected);

            // @deprecated .aria-value, [data-aria-name]; please use .foundation-advancedselect instead.
            // The following code is for backward compatibility

            if (collection.hasClass("aria-skiphandling")) {
                return;
            }

            var input = el.find("input.aria-value[type=hidden]");
            input.prop("disabled", !isSelected);

            var name = collection.data("aria-name");
            if (name && !input.prop("name")) {
                input.prop("name", name);
            }

            if (input.length && window.console) {
                // eslint-disable-next-line no-console
                console.log(
                    "@deprecated .aria-value, [data-aria-name]; " +
                    "please use .foundation-advancedselect instead."
                );
            }
        });

        var api = collection.adaptTo("foundation-validation");
        if (api) {
            api.checkValidity();
            api.updateUI();
        }
    });
})(window, document, Granite.$);

/*
 ADOBE CONFIDENTIAL

 Copyright 2012 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and may be covered by U.S. and Foreign Patents,
 patents in process, and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 */
(function(document, $, Granite) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    function toggle(action, show) {
        if (show) {
            action.removeClass("foundation-collection-action-hidden");
        } else {
            action.addClass("foundation-collection-action-hidden");
        }
    }

    function isCurrentCount(countConfig, count) {
        if (count === 0 && countConfig === 0) {
            return true;
        }
        if (count > 0 && countConfig === ">0") {
            return true;
        }
        return false;
    }

    function isCurrentSelectionCount(selectionConfig, selectionCount) {
        if (selectionCount === 0 && selectionConfig === "none") {
            return true;
        }
        if (selectionCount === 1 && selectionConfig === "single") {
            return true;
        }
        if (selectionCount >= 1 && selectionConfig === "multiple") {
            return true;
        }
        return false;
    }

    /**
     * Returns <code>true</code> if the given action matches the common relationships
     * of all selected items; <code>false</code> otherwise.
     *
     * @param {jQuery} action The jQuery object wrapping <code>.foundation-collection-action</code>.
     * @param {jQuery} collection The jQuery object wrapping <code>.foundation-collection</code>
     *                            specified by <code>target</code> property of
     *                            <code>data-foundation-collection-action</code> attribute.
     */
    function isCommon(action, collection, selections, relScope) {
        if (relScope === "none") {
            return true;
        }

        var rels;

        if (relScope === "item") {
            rels = selections.toArray()
                .map(function(item) {
                    var rel = $(item).find(".foundation-collection-quickactions")
                        .data("foundationCollectionQuickactionsRel") || "";
                    rel = rel.trim();
                    return rel.length ? rel.split(/\s+/) : [];
                });

            var noRelAtAll = rels.every(function(v) {
                return v.length === 0;
            });
            if (noRelAtAll) {
                return true;
            }

            return rels.every(function(v) {
                return !v.every(function(rel) {
                    return !action.hasClass(rel);
                });
            });
        } else {
            var metaAPI = collection.adaptTo("foundation-collection-meta");

            if (!metaAPI) {
                return true;
            }

            var rawRel = metaAPI.getRelationship() || "";
            rawRel = rawRel.trim();

            rels = rawRel.length ? rawRel.split(/\s+/) : [];

            if (rels.length === 0) {
                return true;
            }

            return rels.some(function(v) {
                return action.hasClass(v);
            });
        }
    }

    function isActivate(action, config, collection, items, selections) {
        var result = true;

        if ("activeCount" in config) {
            result = isCurrentCount(config.activeCount, items.length);
        }

        if (result && "activeSelectionCount" in config) {
            result = isCurrentSelectionCount(config.activeSelectionCount, selections.length);
        }

        if (result && "activeCondition" in config) {
            Granite.UI.Foundation.Utils.everyReverse(
                registry.get("foundation.collection.action.activecondition"), function(c) {
                    if (c.name !== config.activeCondition) {
                        return true;
                    }

                    var res = c.handler.call(action[0], c.name, action[0], config, collection[0], selections.toArray());

                    // if a value is explicitly a boolean, then the condition has taken a decision and the chain of
                    // registered actions is not further executed
                    if (res === false || res === true) {
                        result = res;
                        return false;
                    }

                    // if the the action does not return a boolean, we keep executing the chain
                    return true;
                }
            );
        }

        if (result) {
            var relScope = config.ignoreRel ? "none" : (config.relScope || "item");
            result = isCommon(action, collection, selections, relScope);
        }

        return result;
    }

    function getTarget(action, config) {
        var target = config.target;

        if (!target) {
            var actionbar = action.closest(".foundation-collection-actionbar");
            if (actionbar.length) {
                target = actionbar[0].dataset.foundationCollectionActionbarTarget;
            }
        }

        return target;
    }

    $(document).on("foundation-contentloaded", function(e) {
        var cache = new Map();

        var selector = ".foundation-collection-action:not(.foundation-collection-item .foundation-collection-action)";
        $(selector, e.target).each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction") || {};

            var target = getTarget(action, config);

            if (!target) {
                return;
            }

            var collection;
            var items;
            var selections;

            if (cache.has(target)) {
                var e = cache.get(target);

                collection = e.collection;
                items = e.items;
                selections = e.selections;
            } else {
                collection = $(target);
                items = collection.find(".foundation-collection-item");
                selections = items.filter(".foundation-selections-item");

                cache.set(target, {
                    collection: collection,
                    items: items,
                    selections: selections
                });
            }

            if (!collection.length) {
                return;
            }

            toggle(action, isActivate(action, config, collection, items, selections));
        });
    });

    $(document).on("foundation-selections-change", ".foundation-collection", function(e) {
        var collection = $(this);

        var items;
        var selections;

        var selector = ".foundation-collection-action:not(.foundation-collection-item .foundation-collection-action)";
        $(selector).each(function() {
            var action = $(this);
            var config = action.data("foundationCollectionAction") || {};

            var target = getTarget(action, config);

            if (!target || !collection.is(target)) {
                return;
            }

            if (!items) {
                items = collection.find(".foundation-collection-item");
                selections = items.filter(".foundation-selections-item");
            }

            toggle(action, isActivate(action, config, collection, items, selections));
        });
    });

    $(document).on("click", ".foundation-collection-action", function(e) {
        var action = $(this);
        var config = action.data("foundationCollectionAction");

        if (!config || !config.action) {
            return;
        }

        var collection = $();
        var selectionArray = [];

        var itemEl = action.data("foundationCollectionItem");
        if (itemEl) {
            collection = $(itemEl).closest(".foundation-collection");
            selectionArray = [ itemEl ];
        } else {
            if (config.target) {
                collection = $(config.target);
                selectionArray = collection.find(".foundation-selections-item").toArray();
            } else {
                var itemOrActionBar = action.closest(".foundation-collection-item, .foundation-collection-actionbar");

                if (itemOrActionBar.hasClass("foundation-collection-actionbar")) {
                    var actionbar = itemOrActionBar;
                    collection = $(actionbar[0].dataset.foundationCollectionActionbarTarget);
                    selectionArray = collection.find(".foundation-selections-item").toArray();
                } else if (itemOrActionBar.hasClass("foundation-collection-item")) {
                    var item = itemOrActionBar;
                    collection = item.closest(".foundation-collection");
                    selectionArray = item.toArray();
                }
            }
        }

        Granite.UI.Foundation.Utils.everyReverse(registry.get("foundation.collection.action.action"), function(c) {
            if (c.name !== config.action) {
                return true;
            }

            var ignored = c.handler.call(action[0], c.name, action[0], config, collection[0], selectionArray) === false;

            if (!ignored) {
                e.preventDefault();
            }

            return ignored;
        });
    });
})(document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, URITemplate) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.collection.action.action", {
        name: "foundation.link",
        handler: function(name, el, config, collection, selections) {
            var url = URITemplate.expand(config.data.href, {
                id: collection.dataset.foundationCollectionId,
                item: selections.map(function(item) {
                    return item.dataset.foundationCollectionItemId;
                })
            });

            if (config.data.target) {
                window.open(url, config.data.target);
            } else {
                window.location = url;
            }
        }
    });
})(window, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, URITemplate) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.collection.action.action", {
        name: "foundation.pushstate",
        handler: function(name, el, config, collection, selections) {
            var contentAPI = $(".foundation-content").adaptTo("foundation-content");
            if (contentAPI) {
                var ids = selections.map(function(item) {
                    return $(item).data("foundation-collection-item-id");
                });
                var url = URITemplate.expand(config.data.href, {
                    item: ids
                });

                contentAPI.pushState(config.data.data, config.data.title, url);
            }
        }
    });
})(window, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, URITemplate) {
    "use strict";

    var cache = new Map();
    var ns = "." + Date.now();

    function resolveToggleable(control, src, target) {
        if (src) {
            var promise;

            if (cache.has(src)) {
                promise = $.Deferred().resolve(cache.get(src)).promise();
            } else {
                promise = $.ajax({
                    url: src,
                    cache: false
                });
            }

            return promise.then(function(html) {
                var el = $(html)
                    .on("foundation-toggleable-hide", function(e) {
                        var target = $(e.target);

                        requestAnimationFrame(function() {
                            target.detach();
                        });
                    })
                    .appendTo(document.body)
                    .trigger("foundation-contentloaded");

                cache.set(src, html);
                return el;
            });
        }

        var el;
        if (target) {
            el = $(target);
        } else {
            el = control.closest(".foundation-toggleable");
        }

        return $.Deferred().resolve(el).promise();
    }

    $(window).adaptTo("foundation-registry").register("foundation.collection.action.action", {
        name: "foundation.dialog",
        handler: function(name, el, config, collection, selections) {
            var control = $(el);

            var target = config.data.target;
            var nesting = config.data.nesting;

            var src;
            if (config.data.src) {
                src = URITemplate.expand(config.data.src, {
                    id: collection.dataset.foundationCollectionId,
                    item: selections.map(function(item) {
                        return item.dataset.foundationCollectionItemId;
                    })
                });
            }

            resolveToggleable(control, src, target).then(function(toggleable) {
                var api = toggleable.adaptTo("foundation-toggleable");

                toggleable.off(ns).one("foundation-form-submitted" + ns, function(e, success, xhr) {
                    if (!success) {
                        return;
                    }

                    api.hide();

                    var collectionAPI = $(collection).adaptTo("foundation-collection");
                    if ("reload" in collectionAPI) {
                        collectionAPI.reload();
                    }
                });

                // @coral Workaround: Use rAF here to wait for Coral3 component upgrade
                requestAnimationFrame(function() {
                    if (nesting === "hide") {
                        var parentAPI = control.closest(".foundation-toggleable").adaptTo("foundation-toggleable");
                        if (parentAPI) {
                            parentAPI.hide();
                        }
                    }

                    api.show(el);
                });
            });
        }
    });
})(window, document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".foundation-collection-item-activator", function(e) {
        var control = $(this);
        var item = control.closest(".foundation-collection-item");

        var api = item.closest(".foundation-collection").adaptTo("foundation-selections");
        api.select(item[0]);
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-collection-item-action adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-collection-item-action",
        selector: ".foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                execute: function(itemEl) {
                    var navigatorEl;
                    if ($(itemEl).hasClass("foundation-collection-navigator")) {
                        navigatorEl = itemEl;
                    } else {
                        navigatorEl = itemEl.querySelector(".foundation-collection-navigator");
                    }

                    if (!navigatorEl) {
                        return;
                    }

                    var href = navigatorEl.dataset.foundationCollectionNavigatorHref;
                    var target = navigatorEl.dataset.foundationCollectionNavigatorTarget || "_self";

                    if (href) {
                        window.open(href, target);
                    } else {
                        var api = collection.adaptTo("foundation-collection");
                        api.load(itemEl.dataset.foundationCollectionItemId);
                    }
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("foundation-selections-change", ".foundation-collection-masterdetail", function(e) {
        var masterCollection = $(this);
        var detailSelector = this.dataset.foundationCollectionMasterdetailTarget;

        var detailCollection = $(detailSelector);

        if (!detailCollection.length) {
            return;
        }

        var selections = masterCollection.find(".foundation-selections-item").first();

        if (!selections.length) {
            return;
        }

        var detailCollectionAPI = detailCollection.adaptTo("foundation-collection");
        detailCollectionAPI.load(selections[0].dataset.foundationCollectionItemId);
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, URITemplate, Granite) {
    "use strict";

    $(document).on("foundation-selections-change", ".foundation-collection-previewsupport", function(e) {
        var configEl = this;
        var elementEnum = configEl.dataset.foundationCollectionPreviewsupportCollection;
        var targetSelector = configEl.dataset.foundationCollectionPreviewsupportTarget;
        var src = configEl.dataset.foundationCollectionPreviewsupportSrc;

        var collection;
        if (elementEnum === "child") {
            collection = $(configEl).children(".foundation-collection");
        } else {
            collection = $(e.target);
        }

        var target = $(targetSelector);

        if (!target.length) {
            return;
        }

        var selections = collection.find(".foundation-selections-item");

        var url = URITemplate.expand(src, {
            item: selections.toArray().map(function(v) {
                return v.dataset.foundationCollectionItemId;
            })
        });

        var ui = $(window).adaptTo("foundation-ui");
        ui.wait(target[0]);

        $.ajax({
            url: url,
            cache: false
        }).then(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            return parser.parse(html).then(function(fragment) {
                ui.clearWait();

                target
                    .empty()
                    .append(fragment)
                    .trigger("foundation-contentloaded");
            });
        }, function(xhr, textStatus, errorThrown) {
            ui.clearWait();

            if (!selections.length && textStatus === "error" && errorThrown === "Not Found") {
                return;
            }

            var title = Granite.I18n.get("Error");
            var message = Granite.I18n.get("Fail to load data.");
            ui.alert(title, message, "error");
        });
    });
})(document, Granite.$, Granite.URITemplate, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".foundation-collection-selectall", function(e) {
        var $targetCollection = $(this.dataset.foundationCollectionSelectallTarget);
        var selectionAPI = $targetCollection.adaptTo("foundation-selections");
        // set the select all mode
        $targetCollection[0].dataset.foundationSelectionsSelectallMode = true;

        selectionAPI.selectAll();
    });

    // Show/hide the selectall based on selection
    $(document).on("foundation-selections-change", ".foundation-collection", function(e) {
        var $eventCollection = $(this);
        var isSingleSelectionMode = this.dataset.foundationSelectionsMode === "single";

        $(".foundation-collection-selectall").each(function(i, el) {
            var targetCollectionSelector = el.dataset.foundationCollectionSelectallTarget;

            if (!$eventCollection.is(targetCollectionSelector)) {
                return;
            }

            if (isSingleSelectionMode) {
                el.hidden = true;
            } else if (!$eventCollection.find(".foundation-collection-item").length) {
                el.hidden = true;
            } else {
                var selectionAPI = $eventCollection.adaptTo("foundation-selections");
                el.hidden = selectionAPI.isAllSelected();
                // exit select all mode when nothing is selected
                if (selectionAPI.count() === 0) {
                    delete $eventCollection[0].dataset.foundationSelectionsSelectallMode;
                }
            }
        });
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    /**
     * Default implementation of foundation-toggleable adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: ".foundation-toggleable",
        adapter: function(el) {
            var toggleable = $(el);

            return {
                isOpen: function() {
                    return toggleable.attr("hidden") === undefined;
                },

                show: function(anchor) {
                    toggleable.removeAttr("hidden");
                    toggleable.trigger("foundation-toggleable-show");
                },

                hide: function() {
                    toggleable.attr("hidden", "");
                    toggleable.trigger("foundation-toggleable-hide");
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    var cache = new Map();

    function resolveToggleable(control) {
        var el;
        var src = control.data("foundationToggleableControlSrc");
        var targetSelector = control.data("foundationToggleableControlTarget");
        var isCached = control.attr("data-foundation-toggleable-control-cache") !== "false";

        if (src) {
            if (isCached && cache.has(src)) {
                el = cache.get(src);
                el.appendTo(document.body);
                return $.Deferred().resolve(el).promise();
            }

            return $.ajax({
                url: src,
                cache: false
            }).then(function(html) {
                var el = $(html)
                    .on("foundation-toggleable-hide", function(e) {
                        var target = $(e.target);

                        requestAnimationFrame(function() {
                            target.detach();
                        });
                    })
                    .appendTo(document.body)
                    .trigger("foundation-contentloaded");

                cache.set(src, el);
                return el;
            });
        }

        if (targetSelector) {
            el = $(targetSelector);
        } else {
            el = control.closest(".foundation-toggleable");
        }

        return $.Deferred().resolve(el).promise();
    }

    function trackToggle(control, action) {
        var trackingJSON = control.attr("data-foundation-tracking-event");

        if (!trackingJSON) {
            return;
        }

        var tracking = JSON.parse(trackingJSON);

        tracking.feature = tracking.feature || "";
        tracking.type = "toggleable";
        tracking.action = action;
        tracking.widget = {
            name: tracking.element,
            type: "toggleable"
        };

        $(window).adaptTo("foundation-tracker").trackEvent(tracking);
    }


    $(document).on("click", ".foundation-toggleable-control", function(e) {
        e.preventDefault();
        var control = $(this);

        resolveToggleable(control).then(function(toggleable) {
            var api = toggleable.adaptTo("foundation-toggleable");
            var action = control.data("foundationToggleableControlAction");

            // @coral Workaround: Use rAF here to wait for Coral3 component upgrade
            requestAnimationFrame(function() {
                if (action === undefined) {
                    // Do a toggle
                    if (api.isOpen()) {
                        action = "hide";
                    } else {
                        action = "show";
                    }
                }

                trackToggle(control, action);

                if (action === "show") {
                    if (control.data("foundationToggleableControlNesting") === "hide") {
                        var parentAPI = control.closest(".foundation-toggleable").adaptTo("foundation-toggleable");
                        if (parentAPI) {
                            parentAPI.hide();
                        }
                    }

                    api.show(control[0]);
                } else if (action === "hide") {
                    api.hide();
                }
            });
        });
    });


    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-tracking-event",
        selector: ".foundation-toggleable-control[data-foundation-tracking-event]",
        adapter: function(el) {
            return {
                track: function(event) {
                    // Do nothing as we are going to do it manually
                }
            };
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".foundation-mode-change", function(e) {
        e.preventDefault();

        var button = $(this);
        var mode = button.data("foundationModeValue");
        var group = button.data("foundationModeGroup");

        button.trigger("foundation-mode-change", [ mode, group ]);
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("foundation-mode-change", function(e, mode, group) {
        $(".foundation-mode-switcher").each(function() {
            var el = $(this);
            var elGroup = el.data("foundationModeSwitcherGroup");

            if (elGroup !== group) {
                return;
            }

            el.children(".foundation-mode-switcher-item").each(function() {
                var item = $(this);
                var itemMode = item.data("foundationModeSwitcherItemMode");
                item.toggleClass("foundation-mode-switcher-item-active", itemMode === mode);
            });
        });
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var $window = $(window);
    var keyboard = $window.adaptTo("foundation-util-keyboard");
    var preference = $window.adaptTo("foundation-preference");

    // List of commands that are banned due to system-wide implications
    var COMMAND_BLACK_LIST = [
        // Omnisearch
        "/",
        // used to close dialogs
        "esc"
    ];

    /**
     * Map that contains all the commands that have been registered. It uses the shortcut as the key, and an array with
     * all the registered elements as the value.
     */
    var commandsMap = new Map();

    /**
     * Finds all registered <code>foundation-command</code>s under the given keySequence. If only one command is
     * active, it will be executed.
     *
     * @param {String} keySequence - key sequence to evaluate.
     */
    function executeCommand(keySequence) {
        // makes sure usage of ctrl, cmd, meta, etc is consistent
        var key = keyboard.normalize(keySequence.toLowerCase());

        // array of elements registered with the same key
        var elements = commandsMap.get(key);

        if (elements) {
            var commandAPI;
            // when multiple elements match the same shortcut we need to make sure that only one of them is active
            var activeElements = elements.reduce(function(res, current) {
                commandAPI = $(current).adaptTo("foundation-command");
                if (commandAPI && commandAPI.isActive()) {
                    res.push(commandAPI);
                }

                return res;
            }, []);

            if (activeElements.length === 1) {
                activeElements[0].execute();
            } else if (activeElements.length > 1) {
                // eslint-disable-next-line no-console
                console.warn("Multiple shortcuts detected and ignored: " + key);
            }
        }
    }

    /**
     * Handles the shortcut callback.
     *
     * @param {Object} event - the key event.
     */
    function onKey(event) {
        executeCommand(event.keys);
    }

    /**
     * Initializes all commands indicated in the DOM. It uses the foundation-command adapter to determine how to deal
     * with each command.
     *
     * @param {HTMLElement} container - container where we search for defined commands.
     */
    function initializeCommands(container) {
        $("[data-foundation-command]", container).each(function(index, el) {
            var commandAPI = $(el).adaptTo("foundation-command");

            if (!commandAPI) {
                return;
            }

            // all operations are done with the current OS in mind
            var shortcut = keyboard.normalize(commandAPI.getShortcut());

            if (!shortcut) {
                return;
            }

            // protected shortcuts cannot be overwritten
            if (COMMAND_BLACK_LIST.indexOf(shortcut) !== -1) {
                // shows the original shortcut instead of the normalized to help the developer find the problem
                // eslint-disable-next-line no-console
                console.warn("Shortcut is a reserved and ignored: " + commandAPI.getShortcut());
                return;
            }

            // gets the elements registered with the provided command
            var elements = commandsMap.get(shortcut);

            var commandRegistered = true;

            if (typeof elements === "undefined") {
                // initialzes the array with the first element
                commandsMap.set(shortcut, [ el ]);
                Coral.keys.on(shortcut, onKey);
            } else if (elements.indexOf(el) === -1) {
                // we only add the el again if it is not duplicate. that happens when "foundation-contentloaded" is
                // triggered multiple times

                elements.push(el);
            } else {
                commandRegistered = false;
            }

            if (commandRegistered) {
                commandAPI.enhanceUI();
            }
        });
    }

    // we detect all the shortcuts found in the DOM and registers them; first check if commands should be enabled
    if (preference.getBoolean("shortcutsEnabled", true)) {
        $(document).on("foundation-contentloaded", function(e) {
            commandsMap.forEach(function(elements, key) {
                // we start from the back to be able to remove elements as we go
                for (var i = elements.length - 1; i > -1; i--) {
                    var el = elements[i];

                    // if an element is no longer in the DOM, we remove it
                    if (!document.contains(el)) {
                        elements.splice(i, 1);
                    }
                }

                // in case all the registered elements have been removed, we proceed to remove the entry and deregister
                // the keyboard event
                if (elements.length === 0) {
                    commandsMap.delete(key);
                    // we assume the key from the commandsMap is already normalized
                    Coral.keys.off(key, onKey);
                }
            });

            initializeCommands(e.target);
        });
    }
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var ui = $(window).adaptTo("foundation-ui");

    function showDirtyMessage(buttonEl) {
        ui.prompt(Granite.I18n.get("Unsaved changes"),
            Granite.I18n.get("You have unsaved changes! Are you are sure you want to close the page?"),
            "warning", [{
                text: Granite.I18n.get("Cancel")
            }, {
                text: Granite.I18n.get("Yes"),
                primary: true,
                handler: function() {
                    window.location = buttonEl.getAttribute("href");
                }
            }]);
    }

    $(document).on("click", ".foundation-anchor", function(e) {
        e.preventDefault();

        var button = this;
        var href = button.dataset.foundationAnchorHref;
        var target = button.dataset.foundationAnchorTarget;

        if (target) {
            window.open(href, target);
        } else {
            window.location = href;
        }
    });

    $(document).on("click", ".foundation-backanchor", function(e) {
        var buttonEl = this;
        var mainFormId = buttonEl.dataset.foundationBackanchorForm;

        // If mainFormId is specified, we check only that form
        if (mainFormId) {
            var mainFormApi = $("#" + mainFormId).adaptTo("foundation-form");

            if (mainFormApi && mainFormApi.isDirty()) {
                e.preventDefault();
                showDirtyMessage(buttonEl);
            }
        } else {
            // without main form we check for all foundation-forms
            $("form.foundation-form").each(function() {
                if ($(this).adaptTo("foundation-form").isDirty()) {
                    e.preventDefault();
                    showDirtyMessage(buttonEl);
                    return false;
                }
            });
        }
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    // foundation-fixedanchor is a component to save the [href] of an <a> when the browser is reloaded.
    // We need to have this component as [href] may be generated by server using referrer header,
    // which is not working consistently across browser.

    // When the browser is reloaded using `location.reload()`, the referrer header needs to be maintained
    // (i.e. resend with the same value).
    // So far only FF is doing this correctly.
    // Chrome and Safari will use the current page as the referer, while IE doesn't send one.

    var currentUrl = window.location.href;
    var map;
    var initMap = new WeakMap();

    function manageActivator(activator) {
        var id = activator.prop("id");

        if (!id) {
            return;
        }

        var attrName = activator[0].dataset.foundationFixedanchorAttr || "href";

        if (map.has(id)) {
            var prevData = map.get(id);
            activator.attr(attrName, prevData.href);
        }

        try {
            var key = "foundation-fixedanchor::" + id;

            sessionStorage.setItem(key, JSON.stringify({
                url: currentUrl,
                id: id,
                href: activator.attr(attrName)
            }));
        } catch (e) {
            if (window.console) {
                // eslint-disable-next-line no-console
                console.warn("Error occur saving foundation-fixedanchor state", e);
            }
        }
    }

    function restoreState() {
        if (map) {
            return;
        }

        map = new Map();

        if (window !== window.parent) {
            // Currently we don't support foundation-fixedanchor inside an iframe.
            return;
        }

        try {
            var keysToBeRemoved = [];

            for (var i = 0, ln = sessionStorage.length; i < ln; i++) {
                var key = sessionStorage.key(i);

                if (!key || !key.startsWith("foundation-fixedanchor::")) {
                    continue;
                }

                var data = JSON.parse(sessionStorage.getItem(key));

                if (data.url === currentUrl) {
                    map.set(data.id, data);
                }

                keysToBeRemoved.push(key);
            }

            keysToBeRemoved.forEach(function(key) {
                sessionStorage.removeItem(key);
            });
        } catch (e) {
            if (window.console) {
                // eslint-disable-next-line no-console
                console.warn("Error occur restoring foundation-fixedanchor state", e);
            }
        }
    }

    $(document).on("foundation-contentloaded", function(e) {
        restoreState();

        $(".foundation-fixedanchor", e.target).each(function() {
            var activator = $(this);

            if (initMap.has(this)) {
                return;
            }
            initMap.set(this, true);

            manageActivator(activator);
        });
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    /**
     * The default implementation of foundation-editable adapter.
     */
    registry.register("foundation.adapters", {
        type: "foundation-editable",
        selector: ".foundation-editable",
        adapter: function(el) {
            var editable = $(el);

            return {
                edit: function() {
                    var editor;
                    Granite.UI.Foundation.Utils.everyReverse(registry.get("foundation.editable.editor"), function(c) {
                        if (!editable.is(c.selector)) {
                            return true;
                        }

                        editor = c.handler.call(editable[0], editable[0]);
                        return false;
                    });

                    if (!editor) {
                        return;
                    }

                    var pos = editable.position();

                    var wrapper = $(document.createElement("div"))
                        .css({
                            position: "absolute",
                            top: pos.top,
                            left: pos.left,
                            width: editable.css("width")
                        });

                    wrapper.append(editor.el);
                    wrapper.insertAfter(editable);
                    editor.renderCallback();

                    editable.on("foundation-editable-commit foundation-editable-cancel", function(e) {
                        wrapper.remove();
                    });
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Coral) {
    "use strict";

    var KEY_ENTER = 13;
    var KEY_ESC = 27;

    $(window).adaptTo("foundation-registry").register("foundation.editable.editor", {
        selector: ".foundation-editable[data-foundation-editable-editor='foundation.text']",
        handler: function(el) {
            var editable = $(el);

            var editor = $(new Coral.Textfield())
                .css({
                    display: "block",
                    width: "100%"
                });

            var commit = function() {
                editable.text(editor.val());
                editable.trigger("foundation-editable-commit");
            };

            var cancel = function() {
                editable.trigger("foundation-editable-cancel");
            };

            editor
                .on("blur", function(e) {
                    commit();
                })
                .on("keydown", function(e) {
                    if (e.which === KEY_ENTER) {
                        e.preventDefault();
                        commit();
                    } else if (e.which === KEY_ESC) {
                        e.preventDefault();
                        cancel();
                    }
                });

            editor.val(editable.text());

            return {
                el: editor[0],
                renderCallback: function() {
                    editor.focus();
                }
            };
        }
    });
})(window, Granite.$, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    var KEY_ENTER = 13;

    function edit(el) {
        var api = el.adaptTo("foundation-editable");
        api.edit();
    }

    $(document).on("click", ".foundation-editable-control", function(e) {
        e.preventDefault();
        edit($(this));
    });

    $(document).on("keydown", ".foundation-editable-control", function(e) {
        if (e.which !== KEY_ENTER) {
            return;
        }

        e.preventDefault();
        edit($(this));
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    /**
     * The default implementation of foundation-wizard adapter.
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-wizard",
        selector: ".foundation-wizard",
        adapter: function(el) {
            var wizard = $(el);

            return {
                toggleNext: function(enable) {
                    this.toggle("next", enable);
                },

                togglePrev: function(enable) {
                    this.toggle("prev", enable);
                },

                toggleCancel: function(enable) {
                    this.toggle("cancel", enable);
                },

                toggle: function(action, enable) {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.toggle === "function") {
                        layoutApi.toggle(action, enable);
                        return;
                    }

                    var buttons = wizard.children(".foundation-wizard-step.foundation-wizard-step-active")
                        .find(".foundation-wizard-control[data-foundation-wizard-control-action=" + action + "]");

                    buttons.each(function() {
                        if ($(this).is("button")) {
                            $(this).prop("disabled", !enable);
                        } else {
                            $(this).toggleClass("disabled", !enable);
                        }
                    });
                },

                next: function() {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.next === "function") {
                        layoutApi.next();
                        return;
                    }

                    var current = wizard.children(".foundation-wizard-step-active");
                    var next = current.nextAll(".foundation-wizard-step").first();

                    if (!next.length) {
                        return;
                    }

                    current.removeClass("foundation-wizard-step-active");
                    next.addClass("foundation-wizard-step-active");

                    wizard.trigger("foundation-wizard-stepchange", [ next[0], current[0] ]);
                },

                prev: function() {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.prev === "function") {
                        layoutApi.prev();
                        return;
                    }

                    var current = wizard.children(".foundation-wizard-step-active");
                    var prev = current.prevAll(".foundation-wizard-step").first();

                    if (!prev.length) {
                        return;
                    }

                    current.removeClass("foundation-wizard-step-active");
                    prev.addClass("foundation-wizard-step-active");

                    wizard.trigger("foundation-wizard-stepchange", [ prev[0], current[0] ]);
                },

                append: function(steps, index) {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.append === "function") {
                        layoutApi.append(steps, index);
                        return;
                    }

                    if (index === undefined) {
                        wizard.append(steps);
                        return;
                    }

                    wizard.children(".foundation-wizard-step").eq(index).after(steps);
                    wizard.trigger("foundation-contentloaded");
                },

                appendAfter: function(steps, refStep) {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.appendAfter === "function") {
                        layoutApi.appendAfter(steps, refStep);
                        return;
                    }

                    $(refStep).after(steps);
                    wizard.trigger("foundation-contentloaded");
                },

                remove: function(steps) {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.remove === "function") {
                        layoutApi.remove(steps);
                        return;
                    }

                    $(steps).remove();
                },

                getPrevSteps: function(step) {
                    var layoutApi = wizard.adaptTo("foundation-layout");
                    if (layoutApi && typeof layoutApi.getPrevSteps === "function") {
                        return layoutApi.getPrevSteps(step);
                    }

                    return $(step).prevAll(".foundation-wizard-step").toArray();
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    function toggleNext(step, enabled) {
        var wizardApi = step.closest(".foundation-wizard").adaptTo("foundation-wizard");
        wizardApi.toggleNext(enabled);
    }

    function enableNext(step) {
        var v = step.adaptTo("foundation-validation-helper").isValid();

        // Save the result of validity so that others can use this as prechecked validation to avoid double checking.
        // Note that this is a temporary approach.
        // Once it is confirmed that this is what we want, we can simply expose adaptTo for prechecked validation.
        // e.g. `var isValidPrechecked = step.adaptTo("foundation-validation-prechecked").isValid();`
        step.data("foundation-wizard-step.internal.valid", v);

        toggleNext(step, v);
    }

    function pushInvalid(step, invalid) {
        var key = "foundation-wizard.internal.invalids";

        var invalids = step.data(key);
        if (invalids === undefined) {
            invalids = [];
            step.data(key, invalids);
        }

        if (invalids.indexOf(invalid) < 0) {
            invalids.push(invalid);
        }
    }

    $(document).on("foundation-validation-invalid", ".foundation-wizard-step", function(e) {
        var step = $(this);

        if (step.data("foundationWizardStepValidation") === false) {
            return;
        }

        toggleNext(step, false);
        pushInvalid(step, e.target);
    });

    $(document).on("foundation-validation-valid", ".foundation-wizard-step", function(e) {
        var step = $(this);

        if (step.data("foundationWizardStepValidation") === false) {
            return;
        }

        var invalids = step.data("foundation-wizard.internal.invalids");

        if (!invalids) {
            enableNext(step);
            return;
        }

        var i = invalids.indexOf(e.target);
        if (i >= 0) {
            invalids.splice(i, 1);
        }

        if (invalids.length === 0) {
            enableNext(step);
            return;
        }

        // check if the invalids are belong to the step (they can be moved meanwhile)
        // if all of them are outside the step, then enable the binded element

        var invalid = false;

        var j = invalids.length;
        while (j--) {
            if (step.has(invalids[j]).length) {
                invalid = true;
                break;
            }
            invalids.splice(j, 1);
        }

        if (!invalid) {
            enableNext(step);
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, URITemplate) {
    "use strict";

    function getURITemplateVariables(containers) {
        var o = {};

        // TODO Review the usage of ":input" to change it to select the logical field.
        containers.find(":input").each(function() {
            var el = $(this);

            el.serializeArray().forEach(function(input) {
                var name = input.name;
                var value = input.value;

                var newValue;
                if (o.hasOwnProperty(name)) {
                    var a = o[name];

                    if (!Array.isArray(a)) {
                        a = [ a ];
                    }

                    a.push(value);
                    newValue = a;
                } else {
                    newValue = value;
                }

                o[name] = newValue;

                var parent = el[0].dataset.foundationUritemplateParent;
                if (parent) {
                    var p = o[parent] = o[parent] || {};
                    p[name] = o[name];
                }
            });
        });

        return o;
    }


    $(document).on("foundation-wizard-stepchange", function(e, to, prev) {
        var step = $(to);

        if (!step.hasClass("foundation-wizard-lazycontainer")) {
            return;
        }

        var src = to.dataset.foundationWizardLazycontainerSrc;

        if (!src) {
            return;
        }

        var wizard = $(e.target);
        var api = wizard.adaptTo("foundation-wizard");

        var prevSteps = $(api.getPrevSteps(to));

        if (prevSteps.length && prev && !prevSteps.is(prev)) {
            // It means the wizard is navigated backward.
            // Don't refresh the panel in that case.
            return;
        }

        var values = getURITemplateVariables(prevSteps);
        var url = URITemplate.expand(src, values);

        var LAST_URL_KEY = "foundation-wizard-lazycontainer.internal.lastURL";

        var lastURL = step.data(LAST_URL_KEY);

        if (lastURL === url) {
            return;
        }

        step.data(LAST_URL_KEY, url);

        var ui = $(window).adaptTo("foundation-ui");
        ui.wait();

        $.ajax({
            url: url,
            cache: false
        }).done(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            parser.parse(html).then(function(fragment) {
                ui.clearWait();

                step.html("").append(fragment);
                step.trigger("foundation-contentloaded");

                step.adaptTo("foundation-validation-helper").getSubmittables().every(function(v) {
                    var api = $(v).adaptTo("foundation-validation");
                    var state = api.getValidity();

                    if (!state.isValidated()) {
                        return api.checkValidity();
                    }
                    return true;
                });
            });
        })
            .fail(function() {
                ui.clearWait();

                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Something went wrong.");
                ui.alert(title, message, "error");
            });
    });
})(document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, window, $, Granite) {
    "use strict";

    var everyReverse = Granite.UI.Foundation.Utils.everyReverse;
    var registry = $(window).adaptTo("foundation-registry");
    var ui = $(window).adaptTo("foundation-ui");
    var dirtyWeakMap = new WeakMap();
    var defaultLoadingMask = {
        show: function(formEl, targetEl) {
            ui.wait(targetEl);
        },
        hide: function(formEl, targetEl) {
            ui.clearWait();
        }
    };

    function handleResponse(form, xhr) {
        return xhr
            .done(function() {
                dirtyWeakMap.delete(form[0]);
            })
            .done(createSuccessHandler(form))
            .fail(createErrorHandler(form))
            .done(function() {
                form.trigger("foundation-form-submitted", [ true, xhr ]);
            })
            .fail(function() {
                form.trigger("foundation-form-submitted", [ false, xhr ]);
            });
    }

    function handleResponses(form, xhrs) {
        $.when.apply(null, xhrs)
            .done(function() {
                dirtyWeakMap.delete(form[0]);
            })
            .done(function() {
                // Assume "foundation.content" logic for multiple responses scenario for now.
                // We don't know yet if the concept of multiple form submission is a good concept or not.

                var target = form.data("foundationFormOutputReplace");
                var replace = false;

                if (target) {
                    replace = true;
                } else {
                    target = form.data("foundationFormOutputPush");
                }

                if (!target) {
                    return;
                }

                var config = {
                    name: "foundation.content",
                    redirect: form.data("foundationFormRedirect"),
                    history: form.data("foundationFormHistory"),
                    target: target,
                    replace: replace
                };

                everyReverse(registry.get("foundation.form.response.ui.success"), function(c) {
                    if (c.name !== config.name) {
                        return true;
                    }
                    return c.handler.call(form[0], form[0], config) === false;
                });
            })
            .fail(createErrorHandler(form))
            .done(function() {
                // TODO Sending an array here breaks the contract
                // form.trigger("foundation-form-submitted", [true, xhrs]);
            })
            .fail(function() {
                // TODO Sending an array here breaks the contract
                // form.trigger("foundation-form-submitted", [false, xhrs]);
            });
    }

    function createSuccessHandler(form) {
        return function(data, textStatus, xhr) {
            var config = form.data("foundationFormResponseUiSuccess") ||
                         form.children(".foundation-form-response-ui-success").data("foundationFormResponseUiSuccess");
            if (!config) {
                // Compatibility mode for "foundation.content"

                var target = form.data("foundationFormOutputReplace");
                var replace = false;

                if (target) {
                    replace = true;
                } else {
                    target = form.data("foundationFormOutputPush");
                }

                if (!target) {
                    return;
                }

                config = {
                    name: "foundation.content",
                    redirect: form.data("foundationFormRedirect"),
                    history: form.data("foundationFormHistory"),
                    target: target,
                    replace: replace
                };
            }

            var parsedResponse = $(window).adaptTo("foundation-response-parser").parse(xhr);
            var parsedData = parseResponseData(form, xhr, parsedResponse) || data;

            everyReverse(registry.get("foundation.form.response.ui.success"), function(c) {
                if (c.name !== config.name) {
                    return true;
                }
                return c.handler.call(form[0], form[0], config, parsedData, textStatus, xhr, parsedResponse) === false;
            });
        };
    }

    function createErrorHandler(form) {
        return function(xhr, error, errorThrown) {
            if (form.data("foundationFormUi") === "none") {
                return;
            }

            var parsedResponse = $(window).adaptTo("foundation-response-parser").parse(xhr);
            var parsedData = parseResponseData(form, xhr, parsedResponse);

            everyReverse(registry.get("foundation.form.response.ui.error"), function(c) {
                return c.handler.call(form[0], form[0], parsedData, xhr, error, errorThrown) === false;
            });
        };
    }

    function parseResponseData(form, xhr, parsedResponse) {
        var contentType = xhr.getResponseHeader("content-type");

        if (!contentType) {
            return xhr.responseText;
        }
        var result;
        everyReverse(registry.get("foundation.form.response.parser"), function(c) {
            if (!form.is(c.selector)) {
                return true;
            }
            if (!contentType.match(c.contentType)) {
                return true;
            }

            var data = c.handler.call(form[0], form[0], xhr, parsedResponse);

            if (data === false) {
                return true;
            }

            result = data;
            return false;
        });

        return result;
    }

    function showLoadingMask(form) {
        var mask = form.data("foundationFormLoadingmask");

        // Currently mask only supports boolean value.
        // In the future the implementation can be pluggable (using registry, based on the value passed).
        if (mask === true) {
            var panel = $();

            var panelSelector = form.data("foundationFormOutputReplace") || form.data("foundationFormOutputPush");
            if (panelSelector) {
                panel = $(panelSelector);
            }

            var impl = defaultLoadingMask;
            impl.show(form[0], panel[0]);

            form.data("foundation-form.internal.currentLoadingMask", {
                target: panel[0],
                impl: impl
            });
        }
    }

    function clearLoadingMask(form) {
        var config = form.data("foundation-form.internal.currentLoadingMask");

        if (config) {
            config.impl.hide(form[0], config.target);
            form.removeData("foundation-form.internal.currentLoadingMask");
        }
    }

    function setDisabled(fields, value) {
        fields.each(function() {
            var api = $(this).adaptTo("foundation-field");
            if (api) {
                api.setDisabled(value);
            }
        });
    }

    function executePostSubmitHook(hooks) {
        return hooks.reduce(function(memo, h) {
            if (h.post) {
                return memo.concat(h.post());
            } else {
                return memo;
            }
        }, []);
    }

    function submitForm(form) {
        if (form.data("foundationFormActions")) {
            // Multiple form submission
            var originalAction = form.attr("action");
            var actions = form.data("foundationFormActions").split(" ");
            var xhrs = [];

            actions.forEach(function(url) {
                form.prop("action", url);

                var xhr = form.adaptTo("foundation-form").submitAsync();
                xhr.always(function() {
                    form.attr("action", originalAction);
                });
                xhrs.push(xhr);
            });

            return function() {
                handleResponses(form, xhrs);
            };
        } else {
            // Single form submission
            var xhr = form.adaptTo("foundation-form").submitAsync();

            return function() {
                return handleResponse(form, xhr);
            };
        }
    }

    function performSubmissionLifecycle(form) {
        showLoadingMask(form);

        var hooks = [];

        registry.get("foundation.form.submit").forEach(function(c) {
            if (!form.is(c.selector)) {
                return;
            }
            hooks.push(c.handler.call(form[0], form[0]));
        });

        var prePromises = hooks.reduce(function(memo, h) {
            if (h.preResult) {
                return memo.concat(h.preResult);
            } else {
                return memo;
            }
        }, []);

        return $.when.apply(null, prePromises)
            .then(function() {
                var responseHandler = submitForm(form);
                return $.when.apply(null, executePostSubmitHook(hooks)).then(responseHandler, responseHandler);
            })
            .always(function() {
                clearLoadingMask(form);
            });
    }

    $(document).on("foundation-form-submit-callback", "form.foundation-form", function(e, xhr) {
        handleResponse($(this), xhr);
    });

    $(document).on("reset", "form.foundation-form", function(e) {
        // Only reset foundation-field as standard form controls will be reset naturally during reset event
        $(this).adaptTo("foundation-form").reset(true);
    });

    $(document).on("foundation-field-change", "form.foundation-form", function(e) {
        dirtyWeakMap.set(this, true);
    });

    var submissionQueueMap = new WeakMap();

    $(document).on("submit", "form.foundation-form", function(e) {
        var form = $(this);

        if (form.data("foundationFormAjax")) {
            e.preventDefault();

            if (!form.data("foundationFormDisable")) {
                // Perform the submission in the serialized manner,
                // because there can be multiple submissions at the same time,
                // before the earlier submissions are finished.
                // We don't abort the last xhr(s), as the handlers of the form lifecycle can be complex.
                if (!submissionQueueMap.has(form[0])) {
                    submissionQueueMap.set(form[0], []);
                }
                var queue = submissionQueueMap.get(form[0]);

                queue.push(function() {
                    performSubmissionLifecycle(form).always(function() {
                        queue.shift();

                        if (queue.length) {
                            queue[0]();
                        }
                    });
                });

                if (queue.length === 1) {
                    queue[0]();
                }
            }
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-form",
        selector: "form.foundation-form",
        adapter: function(el) {
            var form = $(el);

            var resetField = function(field) {
                var api = field.adaptTo("foundation-field");
                if (api && api.reset) {
                    api.reset();
                }
            };

            return {
                submitAsync: function() {
                    // need to use attr() to get these values, see GRANITE-6288
                    var enctype = form.attr("enctype");
                    var method = form.attr("method") || "get";
                    var action = form.attr("action");

                    var isPost = method.toLowerCase() === "post";

                    if (isPost && enctype === "multipart/form-data") {
                        var formData = new FormData(form[0]);

                        return $.ajax({
                            method: method,
                            url: action,
                            contentType: false,
                            mimeType: enctype,
                            processData: false,
                            data: formData
                        });
                    }

                    return $.ajax({
                        method: method,
                        url: action,
                        contentType: enctype,
                        data: form.serialize(),
                        cache: false
                    });
                },

                reset: function(skipNative) {
                    if (!skipNative) {
                        el.reset();
                    }

                    form.find(".foundation-field-editable").each(function() {
                        var editable = $(this);
                        resetField(editable.find(".foundation-field-readonly"));
                        resetField(editable.find(".foundation-field-edit"));
                    });
                },

                isDirty: function() {
                    return dirtyWeakMap.get(el) === true;
                }
            };
        }
    });

    /**
     * Submit hook for ".foundation-field-mixed".
     */
    registry.register("foundation.form.submit", {
        selector: "*",
        handler: function(formEl) {
            var mixedFields = $(formEl).find(".foundation-field-mixed");

            // don't post mixed fields
            setDisabled(mixedFields, true);

            return {
                post: function() {
                    setDisabled(mixedFields, false);
                }
            };
        }
    });
})(document, window, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.parser", {
        name: "foundation.sling",
        selector: "*",
        contentType: /text\/html/,
        handler: function(form, xhr, parsedResponse) {
            var frag = $(parsedResponse);

            if (!frag.find("#Status").length) {
                return false;
            }

            return Array.prototype.reduce.call(frag.find("[id]"), function(memo, v) {
                if (v.href) {
                    memo[v.id] = v.href;
                } else {
                    memo[v.id] = v.textContent;
                }
                return memo;
            }, {});
        }
    });
})(document, window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.parser", {
        name: "foundation.form",
        selector: "*",
        contentType: /text\/html/,
        handler: function(form, xhr, parsedResponse) {
            var frag = $(parsedResponse);

            var statusCode = frag.find(".foundation-form-response-status-code").next().text();

            if (!statusCode) {
                return false;
            }

            return {
                statusCode: statusCode,
                message: frag.find(".foundation-form-response-status-message").next().text(),
                redirect: frag.find(".foundation-form-response-redirect").attr("href"),
                path: frag.find(".foundation-form-response-path").next().text(),
                title: frag.find(".foundation-form-response-title").next().text(),
                description: frag.find(".foundation-form-response-description").next().html()
            };
        }
    });
})(document, window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.error", {
        name: "foundation.default",
        handler: function(form, data, xhr, error, errorThrown) {
            var title = error || Granite.I18n.get("Error");
            var message = errorThrown || Granite.I18n.get("Fail to submit the form.");

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Granite) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.error", {
        name: "foundation.sling",
        handler: function(form, data, xhr, error, errorThrown) {
            if (!data || !data.Status) {
                return false;
            }

            var title = Granite.I18n.get("Error");
            var message = data.Message;

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        }
    });
})(window, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.error", {
        name: "foundation.html",
        handler: function(form, data, xhr, error, errorThrown) {
            if (!data || !data.statusCode) {
                return false;
            }

            var title = data.title || Granite.I18n.get("Error");
            var message = data.description || data.message;

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    function buildURL(base, queryString) {
        var separator;
        if (base.lastIndexOf("?") >= 0) {
            separator = "&";
        } else {
            separator = "?";
        }
        return base + separator + queryString;
    }

    function renderOutput(form, config, html) {
        var panel = $(config.target);

        var contentAPI = panel.adaptTo("foundation-content");

        if (!contentAPI) {
            panel.html(html);
            return;
        }

        var historyConfig;
        if (config.history) {
            var url = (
                config.history.url || config.history.useFormUrl
                    ? buildURL(form.attr("action"), form.serialize())
                    : undefined
            );

            historyConfig = {
                data: config.history.data,
                title: config.history.title,
                url: url
            };
        }

        if (config.replace) {
            contentAPI.replace(html, historyConfig);
        } else {
            contentAPI.push(html, historyConfig);
        }
    }

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "foundation.content",
        handler: function(el, config, data, textStatus, xhr) {
            if (!config.target) {
                return;
            }

            var form = $(el);

            if (config.redirect) {
                $.ajax({
                    url: config.redirect,
                    cache: false
                }).done(function(redirectData) {
                    renderOutput(form, config, redirectData);
                });
            } else {
                renderOutput(form, config, data);
            }
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, URITemplate) {
    "use strict";

    function open(href, newWindow) {
        if (!href || href[0] !== "/") {
            // only navigate when it starts with "/" to prevent open redirect
            return;
        }

        if (newWindow) {
            window.open(href);
        } else {
            window.location = href;
        }
    }

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "foundation.prompt.open",
        handler: function(form, config, data, textStatus, xhr) {
            var ui = $(window).adaptTo("foundation-ui");

            ui.prompt(config.title, config.message, "success", [{
                text: Granite.I18n.get("Done"),
                handler: function() {
                    open(URITemplate.expand(config.redirect, data));
                }
            }, {
                text: Granite.I18n.get("Open"),
                primary: true,
                handler: function() {
                    open(URITemplate.expand(config.open, data), true);
                    open(URITemplate.expand(config.redirect, data));
                }
            }]);
        }
    });
})(window, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, URITemplate) {
    "use strict";

    function isSameOrigin(url) {
        // url could be relative or scheme relative or absolute

        // host + port
        var host = document.location.host;
        var protocol = document.location.protocol;
        var relativeOrigin = "//" + host;
        var origin = protocol + relativeOrigin;

        // Allow absolute or scheme relative URLs to same origin
        return (url === origin || url.slice(0, origin.length + 1) === origin + "/") ||
            (url === relativeOrigin || url.slice(0, relativeOrigin.length + 1) === relativeOrigin + "/") ||
            // or any other URL that isn't scheme relative or absolute i.e. relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }


    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "foundation.redirect",
        handler: function(form, config, data, textStatus, xhr) {
            var href = URITemplate.expand(config.href, data);

            if (isSameOrigin(href)) {
                window.location = href;
            }
        }
    });
})(window, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Granite) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "foundation.reload",
        handler: function(form, config, data, textStatus, xhr) {
            var messenger = $(window).adaptTo("foundation-util-messenger");
            messenger.put(
                null,
                config.message || Granite.I18n.get("The form has been submitted successfully"),
                "success"
            );

            window.location.reload();
        }
    });
})(window, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Granite) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "foundation.collection.reload",
        handler: function(form, config, data, textStatus, xhr) {
            var messenger = $(window).adaptTo("foundation-util-messenger");
            messenger.put(
                null,
                config.message || Granite.I18n.get("The form has been submitted successfully"),
                "success"
            );

            var collection = $(config.target);
            collection.adaptTo("foundation-collection").reload();
        }
    });
})(window, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("foundation-field-change", ".foundation-field-autosubmit", function(e) {
        var form = $(this).closest("form");

        if (form.length) {
            var event = document.createEvent("Event");
            event.initEvent("submit", true, true);

            form[0].dispatchEvent(event);
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $, History) {
    "use strict";

    function createEntries(initial) {
        var entries = [ initial ];
        var currentIndex = 0;

        return {
            current: function() {
                return this.peek(0);
            },
            peek: function(delta) {
                return entries[currentIndex + delta];
            },
            pointToToken: function(token) {
                for (var i = 0, ln = entries.length; i < ln; i++) {
                    var e = entries[i];
                    if (e.token === token) {
                        currentIndex = i;
                        return e;
                    }
                }
            },
            forward: function() {
                if (currentIndex < entries.length - 1) {
                    return entries[++currentIndex];
                }
            },
            back: function() {
                if (currentIndex > 0) {
                    return entries[--currentIndex];
                }
            },
            push: function(entry) {
                entries.splice(++currentIndex, entries.length - currentIndex, entry);
            }
        };
    }

    /**
     * Returns the title from `<title>` from the given html.
     */
    function getTitle(fragment) {
        var titleEl = fragment.querySelector("title");
        return titleEl ? titleEl.textContent : null;
    }

    function generateToken() {
        return Date.now().toString();
    }


    var initialToken = generateToken();

    $(function(e) {
        var content = $(".foundation-content");
        if (!content.length) {
            return;
        }

        var state = History.getState();

        state.data.foundationContent = {
            token: initialToken
        };

        History.replaceState(state.data);

        $(window).on("statechange", function(e) {
            var state = History.getState();

            var config = state.data.foundationContent;

            if (!config) {
                return;
            }

            var content = $(".foundation-content");

            if (!content.length) {
                return;
            }

            var api = content.adaptTo("foundation-content");
            api.goToToken(config.token);
        });
    });

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-content",
        selector: ".foundation-content",
        adapter: function(el) {
            var content = $(el);
            var entries = createEntries({
                token: initialToken,
                el: content.children(".foundation-content-current")
            });

            var detachCurrent = function(content) {
                return content.children(".foundation-content-current")
                    .removeClass("foundation-content-current")
                    .detach();
            };

            var lastXhr;

            return {
                pushState: function(data, title, url) {
                    return this.go(url, false, {
                        data: data,
                        title: title,
                        url: url
                    });
                },
                replaceState: function(data, title, url) {
                    return this.go(url, true, {
                        data: data,
                        title: title,
                        url: url
                    });
                },
                go: function(url, replace, historyConfig) {
                    var self = this;

                    if (lastXhr && lastXhr.state() === "pending") {
                        lastXhr.abort();
                    }

                    var xhr = $.ajax(url, {
                        cache: false
                    });
                    lastXhr = xhr;

                    return xhr
                        .then(function(html) {
                            if (replace) {
                                return self.replace(html, historyConfig);
                            } else {
                                return self.push(html, historyConfig);
                            }
                        })
                        // .done() is handled by replace() and push()
                        .fail(function() {
                            content.trigger("foundation-content-loaded", [ false, replace, xhr ]);
                        });
                },
                goToToken: function(token) {
                    var entry = entries.pointToToken(token);

                    if (!entry || entry.el.is(".foundation-content-current")) {
                        return;
                    }

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(entry.el[0]);
                    detachCurrent(content);
                    entry.el.addClass("foundation-content-current").appendTo(content);
                },
                refresh: function() {
                    return this.go(document.location.toString(), true);
                },
                push: function(html, historyConfig) {
                    var token = generateToken();
                    var path = $(".foundation-content-path").attr("data-foundation-content-path");

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    var fragment = parser.createFragment(html);
                    var promise = parser.parse(fragment);

                    var current = $(fragment.querySelector(".foundation-content-current"));
                    if (!current.length) {
                        current = $(document.createElement("div"))
                            .addClass("foundation-content-current")
                            .append(fragment);
                    }

                    entries.push({
                        token: token,
                        el: current
                    });

                    promise.then(function() {
                        detachCurrent(content);

                        content.append(current);

                        if ($(".foundation-content-path").length === 0) {
                            $(document.createElement("div"))
                                .prop("hidden", true)
                                .attr("data-foundation-content-path", path)
                                .prependTo(current);
                        }

                        current.trigger("foundation-contentloaded");

                        if (historyConfig) {
                            var data = historyConfig.data || {};
                            data.foundationContent = {
                                token: token
                            };
                            History.pushState(data, historyConfig.title || getTitle(fragment), historyConfig.url);
                        }

                        content.trigger("foundation-content-loaded", [ true, false ]);
                    });

                    return token;
                },
                replace: function(html, historyConfig) {
                    var current = entries.current();

                    var parser = $(window).adaptTo("foundation-util-htmlparser");
                    var fragment = parser.createFragment(html);

                    parser.parse(fragment).then(function(fragment) {
                        var el = $(fragment.querySelector(".foundation-content-current"));
                        if (!el.length) {
                            el = $(fragment).children();
                        }

                        if (el.is(".foundation-content-current")) {
                            content.children(".foundation-content-current").remove();
                            el.appendTo(content).trigger("foundation-contentloaded");
                        } else {
                            content.children(".foundation-content-current")
                                .empty()
                                .append(el)
                                .trigger("foundation-contentloaded");
                        }

                        if (historyConfig) {
                            var data = historyConfig.data || {};
                            data.foundationContent = {
                                token: current.token
                            };
                            History.replaceState(data, historyConfig.title || getTitle(fragment), historyConfig.url);
                        }

                        content.trigger("foundation-content-loaded", [ true, true ]);
                    });

                    return current.token;
                },
                back: function(refresh) {
                    if (History.getState().data.foundationContent) {
                        if (refresh) {
                            var self = this;
                            $(window).one("statechange", function() {
                                self.refresh();
                            });
                        }

                        var previous = entries.peek(-1);

                        History.back();

                        return previous ? previous.token : undefined;
                    }

                    var prev = entries.back();
                    if (!prev) {
                        return;
                    }

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(prev.el[0]);
                    detachCurrent(content);
                    prev.el.addClass("foundation-content-current").appendTo(content);

                    if (refresh) {
                        this.refresh();
                    }

                    // trigger re-layout after content change (CQ5-25105)
                    // FIXME jquery-gridlayout of CoralUI needs to check if the element is detached or not.
                    // (i.e. by checking if it is a descendant of <body>)

                    var grid = $(".foundation-collection", content).data("cardView");
                    // Avoid using CUI.CardView.get(), as it will init the cardview
                    // if there is no existing cardview! (CQ-23419)

                    if (grid && grid.layout) {
                        grid.layout();
                    }

                    return prev.token;
                },
                forward: function(refresh) {
                    if (History.getState().data.foundationContent) {
                        if (refresh) {
                            var self = this;
                            $(window).one("statechange", function() {
                                self.refresh();
                            });
                        }

                        var n = entries.peek(1);

                        History.forward();

                        return n ? n.token : undefined;
                    }

                    var next = entries.forward();
                    if (!next) {
                        return;
                    }

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(next.el[0]);
                    detachCurrent(content);
                    next.el.addClass("foundation-content-current").appendTo(content);

                    if (refresh) {
                        this.refresh();
                    }

                    return next.token;
                }
            };
        }
    });
})(window, document, Granite, Granite.$, History);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".foundation-content-control", function(e) {
        e.preventDefault();
        var control = $(this);
        var action = control.data("foundationContentControlAction");
        var refresh = control.data("foundationContentControlRefresh");
        var contentAPI = control.closest(".foundation-content").adaptTo("foundation-content");

        if (action === "back") {
            contentAPI.back(refresh);
        } else if (action === "forward") {
            contentAPI.forward(refresh);
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    /**
     * Returns the value of the property of the given name.
     * @private
     */
    function prop(el, namespace, name, defaultProp) {
        return el.data(namespace + "-" + name) || (function() {
            var data = el.data(namespace);

            if (!data) {
                return undefined;
            }
            if (defaultProp && typeof data !== "object") {
                return data;
            }

            return data[name];
        })();
    }

    function getInfo(el) {
        var action = prop(el, "foundation-content-history", "action", true);

        return {
            title: prop(el, "foundation-content-history", "title"),
            url: el.prop("href"),
            replace: action !== undefined ? action === "replace" : !!prop(el, "foundation-content-history", "replace"),
            data: prop(el, "foundation-content-history", "data")
        };
    }

    $(document).on("click", "a[data-foundation-content-history]", function(e) {
        e.preventDefault();

        var a = $(this);

        var content = $(".foundation-content");
        if (!content.length) {
            return;
        }

        var info = getInfo(a);
        var api = content.adaptTo("foundation-content");

        if (info.replace) {
            api.replaceState(info.data, info.title, info.url);
        } else {
            api.pushState(info.data, info.title, info.url);
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(document).on("click", ".foundation-history-control", function(e) {
        e.preventDefault();

        var control = $(this);
        var action = control.data("foundationHistoryControlAction");

        if (action === "back") {
            window.history.back();
        } else if (action === "forward") {
            window.history.forward();
        } // implement other actions later when needed
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, URITemplate) {
    "use strict";

    var DATA_ATTRIBUTE_FOUNDATION_PICKER_BUTTONLIST_PREFIX = "foundationPickerButtonlistCustom";

    function generateId(el, name) {
        if (!el.id) {
            el.id = name + ":" + Date.now();
        }
        return el.id;
    }

    function startsWith(s1, s2) {
        return s1.substring(0, s2.length) === s2;
    }

    function isElementAbove(el1, el2) {
        var rect1 = el1.getBoundingClientRect();
        var rect2 = el2.getBoundingClientRect();
        return rect1.top < rect2.top;
    }


    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-picker",
        selector: "coral-overlay.foundation-picker-buttonlist",
        adapter: function(overlayEl) {
            var overlay = $(overlayEl);
            var currentDeferred = null;
            var currentContext = null;
            var currentSetValue = null;
            var currentQuery = null;
            var isInputDeletion = false;
            var loaderEl = $(document.createElement("div"))
                .addClass("foundation-picker-buttonlist-loader")
                .attr("role", "progressbar")
                .append(new Coral.Wait().set({
                    centered: true
                }));

            var Paginator = $(window).adaptTo("foundation-util-paginator");

            var paginator = new Paginator({
                el: overlayEl,
                limit: overlayEl.dataset.foundationPickerButtonlistLimit || 10,
                resolveURL: function(paginator) {
                    return URITemplate.expand(overlayEl.dataset.foundationPickerButtonlistSrc, {
                        offset: paginator.offset,
                        limit: paginator.limit,
                        query: currentQuery
                    });
                },
                wait: function(paginator) {
                    overlay.append(loaderEl);

                    return {
                        clear: function() {
                            loaderEl.remove();
                        }
                    };
                },
                processResponse: function(paginator, html) {
                    var paginatorDeferred = $.Deferred();

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(html).then(function(fragment) {
                        var buttonlist = $(fragment).children();

                        if (!buttonlist.is("coral-buttonlist")) {
                            return;
                        }

                        var items = buttonlist.children("button");
                        items.attr("tabindex", -1);

                        var current = overlay.children("coral-buttonlist");
                        current.append(items);

                        if (paginator.offset === 0) {
                            var firstItem = current.children("button").first();
                            if (firstItem.length) {
                                var firstItemValue = firstItem.val();

                                if (
                                    currentQuery.length > 0 &&
                                    !isInputDeletion &&
                                    startsWith(firstItemValue, currentQuery)
                                ) {
                                    if ($(currentContext).is("foundation-autocomplete")) {
                                        currentContext.field.value = firstItemValue;
                                        currentContext.field.setSelectionRange(
                                            currentQuery.length,
                                            firstItemValue.length
                                        );
                                    }

                                    firstItem.siblings(".is-focused").removeClass("is-focused");
                                    firstItem.addClass("is-focused");
                                }
                            }
                        }

                        var hasNext = buttonlist[0].dataset.foundationPickerButtonlistHasnext;
                        if (hasNext === "true") {
                            hasNext = true;
                        } else if (hasNext === "false") {
                            hasNext = false;
                        } else {
                            hasNext = items.length >= paginator.limit;
                        }

                        // Wait for custom element upgrade so that the sizing calculation is correct
                        requestAnimationFrame(function() {
                            paginatorDeferred.resolve({
                                length: items.length,
                                hasNext: hasNext
                            });
                        });
                    });

                    return paginatorDeferred.promise();
                }
            });

            var resetValue = function() {
                if (!currentSetValue) {
                    return;
                }
                currentSetValue(currentQuery);
            };

            var resetState = function() {
                currentDeferred = null;
                currentContext = null;
                currentSetValue = null;
            };

            /**
             * Extracts the data under the given namespace from the given element dataset
             *
             * @param {{HTMLElement}} element       - Element carrying the data
             * @param {string} namespace            - Namespace under which are stored the desired data
             * @returns {{}} Registry containing the key/value pairs for the given namespace
             */
            var getData = function(element, namespace) {
                var data = {};

                for (var key in element.dataset) {
                    if (element.dataset.hasOwnProperty(key)) {
                        if (key.length <= namespace.length || !key.startsWith(namespace)) {
                            continue;
                        }

                        var firstCharacter = key.charAt(namespace.length);
                        if (firstCharacter !== firstCharacter.toUpperCase()) {
                            continue;
                        }

                        var dataKey = key.substr(namespace.length);
                        data[dataKey.toLowerCase()] = element.dataset[key];
                    }
                }

                return data;
            };

            paginator.start();

            overlayEl.tabIndex = -1;
            overlayEl.placement = "bottom";
            overlayEl.collision = "flip";

            overlay.on("coral-overlay:open", function(e) {
                if (e.target !== overlayEl || !currentContext) {
                    return;
                }
                overlayEl.scrollTop = 0;

                if (currentContext.getAttribute("role") === "combobox") {
                    currentContext.setAttribute("aria-expanded", "true");
                }

                if (isElementAbove(overlayEl, currentContext)) {
                    overlay.addClass("is-above");
                } else {
                    overlay.removeClass("is-above");
                }
            });

            overlay.on("coral-overlay:close", function(e) {
                if (e.target !== overlayEl) {
                    return;
                }

                overlay.find("> coral-buttonlist > button.is-focused").removeClass("is-focused");

                if (currentContext.getAttribute("role") === "combobox") {
                    currentContext.removeAttribute("aria-activedescendant");
                    currentContext.setAttribute("aria-expanded", "false");
                }

                resetState();
            });

            overlay.on("mouseover", "coral-buttonlist > button", function(e) {
                var currentItem = $(this);
                currentItem.siblings(".is-focused").removeClass("is-focused");
                currentItem.addClass("is-focused");
            });

            overlay.on("click", "coral-buttonlist > button", function(e) {
                var selections = [{
                    value: this.value,
                    text: this.getAttribute("foundation-picker-buttonlist-text") || this.content.textContent,
                    data: getData(this, DATA_ATTRIBUTE_FOUNDATION_PICKER_BUTTONLIST_PREFIX)
                }];

                currentDeferred.resolve(selections);
                overlayEl.open = false;
            });

            $(document).on("click", function(e) {
                if (!overlayEl.open || !currentContext) {
                    return;
                }
                if (!currentContext.contains(e.target)) {
                    resetValue();
                    currentDeferred.reject();
                    overlayEl.open = false;
                }
            });

            return {
                attach: function(context) {
                    overlay.appendTo(context);
                    overlay.trigger("foundation-contentloaded");
                },
                detach: function() {
                    overlay.detach();
                },
                pick: function(context, selections, input, setValue) {
                    var isSameQuery = input === currentQuery;
                    isInputDeletion = currentQuery &&
                                        input.length < currentQuery.length &&
                                        startsWith(currentQuery, input);

                    currentDeferred = $.Deferred();
                    currentContext = context;
                    currentQuery = input;
                    currentSetValue = setValue;

                    var isCombobox = currentContext.getAttribute("role") === "combobox";

                    if (isCombobox) {
                        currentContext.field.setAttribute("aria-autocomplete", "both");
                    }

                    if (!isSameQuery) {
                        var list = overlay.children("coral-buttonlist");
                        if (!list.length) {
                            var listEl = new Coral.ButtonList().set({
                                interaction: "off"
                            });
                            overlay.append(listEl);

                            if (isCombobox) {
                                currentContext.setAttribute(
                                    "aria-owns",
                                    generateId(listEl, "foundation-picker-buttonlist")
                                );
                            }
                        } else {
                            list.children("button").remove();
                        }

                        paginator.restart(undefined, undefined, true);
                    }

                    if (!overlayEl.open) {
                        var anchorAPI = $(context).adaptTo("foundation-overlay-anchor");
                        var target = anchorAPI ? anchorAPI.getElement() : context;

                        overlay.outerWidth($(target).outerWidth());
                        overlayEl.target = target;
                        overlayEl.focusOnShow = "off";
                        overlayEl.open = true;
                    }

                    return currentDeferred.promise();
                },
                cancel: function() {
                    resetValue();
                    overlayEl.open = false;
                },
                resolve: function(rawInputs) {
                    var deferred = $.Deferred();

                    var selections = rawInputs.map(function(v) {
                        var matchedButton = overlay.find("> coral-buttonlist > button").filter(function() {
                            return this.value === v;
                        }).first();

                        if (matchedButton.length) {
                            return {
                                value: matchedButton[0].value,
                                text: matchedButton[0].getAttribute("foundation-picker-buttonlist-text") ||
                                    matchedButton[0].content.textContent,
                                data: getData(matchedButton[0], DATA_ATTRIBUTE_FOUNDATION_PICKER_BUTTONLIST_PREFIX)
                            };
                        } else {
                            return null;
                        }
                    });

                    deferred.resolve(selections);

                    return deferred.promise();
                },
                focus: function(last) {
                    // We are going to implement focus differently.
                    // We have to maintain the focus at the input instead of our own element to follow
                    // https://www.w3.org/TR/wai-aria-practices-1.1/#autocomplete

                    // When focus() is called with last = false, it means we focus on the next item.
                    // Likewise, when focus() is called with last = true, it means we focus on the prev item.

                    if (!currentSetValue) {
                        return;
                    }

                    var buttonlist = overlay.children("coral-buttonlist");
                    var currentItem = buttonlist.children(".is-focused");

                    var updateValue = function(itemEl) {
                        if (!itemEl) {
                            return;
                        }

                        itemEl.classList.add("is-focused");

                        var rect = itemEl.getBoundingClientRect();
                        var scrollContainerRect = overlayEl.getBoundingClientRect();

                        if (rect.top < scrollContainerRect.top) {
                            itemEl.scrollIntoView();
                        } else if (rect.top + rect.height > scrollContainerRect.bottom) {
                            itemEl.scrollIntoView(false);
                        }

                        generateId(itemEl, "foundation-picker-buttonlist");
                        currentContext.setAttribute("aria-activedescendant", itemEl.id);

                        currentSetValue(itemEl.value);
                    };

                    if (last) {
                        if (currentItem.length) {
                            currentItem.removeClass("is-focused");

                            var prev = currentItem.prev("button");
                            if (prev.length) {
                                updateValue(prev[0]);
                            } else {
                                resetValue();
                            }
                        } else {
                            updateValue(buttonlist.children("button:last-of-type")[0]);
                        }
                    } else {
                        if (currentItem.length) {
                            currentItem.removeClass("is-focused");

                            var next = currentItem.next("button");
                            if (next.length) {
                                updateValue(next[0]);
                            } else {
                                resetValue();
                            }
                        } else {
                            updateValue(buttonlist.children("button:first-of-type")[0]);
                        }
                    }
                }
            };
        }
    });
})(window, document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-picker",
        selector: "coral-popover.foundation-picker-collection, coral-dialog.foundation-picker-collection",
        adapter: function(el) {
            var $el = $(el);
            var currentDeferred = null;

            $el.on("coral-overlay:open", function(e) {
                if (e.target !== el) {
                    return;
                }
                // Clear the target of the popover, as when setting the target,
                // clicking the target will toggle the popover which clash with our own.
                // I wish that Coral Popover just provides an anchoring mechanic without its opinionated solution.
                e.target.target = null;
            });

            $el.on("coral-overlay:close", function(e) {
                if (e.target !== el || !currentDeferred) {
                    return;
                }
                currentDeferred.reject();
            });

            $el.on("click", ".granite-pickerdialog-submit", function(e) {
                e.preventDefault();

                var mapFn = function(itemEl) {
                    return {
                        value: itemEl.dataset.foundationPickerCollectionItemValue ||
                                itemEl.dataset.foundationCollectionItemId,
                        text: itemEl.dataset.foundationPickerCollectionItemText ||
                                $(itemEl).find(".foundation-collection-item-title").text()
                    };
                };
                var selections = $el.find(".foundation-collection .foundation-selections-item").toArray().map(mapFn);

                var d = currentDeferred;
                currentDeferred = null;

                el.open = false;
                d.resolve(selections);
            });

            $el.on("foundation-selections-change", ".foundation-collection", function(e) {
                var api = $(this).adaptTo("foundation-selections");
                $el.find(".granite-pickerdialog-submit").prop("disabled", api.count() === 0);
            });

            return {
                attach: function(context) {
                    if ($el.is("coral-dialog")) {
                        $el.appendTo(document.body);
                    } else {
                        $el.appendTo(context);
                    }

                    $el.trigger("foundation-contentloaded");
                },
                detach: function() {
                    $el.detach();
                },
                pick: function(context) {
                    currentDeferred = $.Deferred();

                    // Wait for custom element upgrade
                    requestAnimationFrame(function() {
                        // The picker is only for adding new selection(s)
                        // So we start always fresh and clear the previous selections
                        var selectApi = $el.find(".foundation-collection").adaptTo("foundation-selections");
                        if (selectApi) {
                            selectApi.clear();
                        }

                        el.target = context;
                        el.open = true;
                    });

                    return currentDeferred.promise();
                },
                cancel: function() {
                    currentDeferred = null;
                    el.open = false;
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-picker",
        selector: "coral-popover.foundation-picker-form, coral-dialog.foundation-picker-form",
        adapter: function(el) {
            var $el = $(el);
            var api = $el.adaptTo("foundation-picker-form");
            var deferred = null;

            $el.on("coral-overlay:open", function(e) {
                if (e.target !== el) {
                    return;
                }
                // Clear the target of the popover, as when setting the target,
                // clicking the target will toggle the popover which clash with our own.
                // I wish that Coral Popover just provides an anchoring mechanic without its opinionated solution.
                e.target.target = null;
            });

            $el.on("coral-overlay:close", function(e) {
                if (e.target !== el || !deferred) {
                    return;
                }
                deferred.reject();
            });

            var target = el.dataset.foundationPickerFormTarget || "form";

            $el.on("submit", target, function(e) {
                e.preventDefault();

                var d = deferred;
                deferred = null;
                el.open = false;
                d.resolve(api.getSelections());
            });

            return {
                attach: function(context) {
                    if ($el.is("coral-dialog")) {
                        $el.appendTo(document.body);
                    } else {
                        $el.appendTo(context);
                    }

                    $el.trigger("foundation-contentloaded");
                },
                detach: function() {
                    $el.detach();
                },
                pick: function(context, selections, currentInput) {
                    deferred = $.Deferred();

                    // Wait for custom element upgrade
                    requestAnimationFrame(function() {
                        api.setup(context, selections, currentInput).then(function() {
                            el.target = context;
                            el.open = true;
                        });
                    });

                    return deferred.promise();
                },
                cancel: function() {
                    deferred = null;
                    el.open = false;
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    function handleSelections(control, state, selections) {
        var config = control.data("foundationPickerControlAction");

        Granite.UI.Foundation.Utils.everyReverse(registry.get("foundation.picker.control.action"), function(c) {
            if (c.name !== config.name) {
                return true;
            }

            return c.handler.call(control[0], c.name, control[0], config, selections) === false;
        });
    }

    function show(control, state) {
        state.api.attach(this);

        state.api.pick(control[0], []).then(function(selections) {
            state.api.detach();
            state.open = false;

            handleSelections(control, state, selections);
        }, function() {
            cancel(control, state);
        });

        if ("focus" in state.api) {
            state.api.focus();
        } else {
            state.el.focus();
        }

        state.open = true;
    }

    function cancel(control, state) {
        state.api.detach();
        state.open = false;
    }

    function getState(control) {
        var KEY_STATE = "foundation-picker-control.internal.state";

        var state = control.data(KEY_STATE);

        if (!state) {
            state = {
                el: null,
                open: false,
                loading: false
            };
            control.data(KEY_STATE, state);
        }

        return state;
    }

    $(document).on("click", ".foundation-picker-control", function(e) {
        e.preventDefault();

        var control = $(this);
        var state = getState(control);

        if (state.loading) {
            return;
        }

        if (state.el) {
            if (state.open) {
                state.api.cancel();
                cancel(control, state);
            } else {
                show(control, state);
            }
        } else {
            var src = control[0].dataset.foundationPickerControlSrc;

            if (!src) {
                return;
            }

            state.loading = true;

            $.ajax({
                url: src,
                cache: false
            }).then(function(html) {
                return $(window).adaptTo("foundation-util-htmlparser").parse(html);
            }).then(function(fragment) {
                return $(fragment).children()[0];
            }).then(function(pickerEl) {
                state.loading = false;
                state.el = pickerEl;
                state.api = $(pickerEl).adaptTo("foundation-picker");

                show(control, state);
            }, function() {
                state.loading = false;
            });
        }
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, Granite, $) {
    "use strict";

    Granite.UI.Foundation.Layouts = Granite.UI.Foundation.Layouts || (function() {
        var registry = $(window).adaptTo("foundation-registry");

        var getLayout = function(name) {
            return registry.get("foundation.layouts").find(function(item) {
                return item.name === name;
            });
        };

        return {
            register: function(name, layouter, cleaner) {
                registry.register("foundation.layouts", {
                    name: name,
                    doLayout: layouter,
                    clean: cleaner
                });
            },

            layout: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                var layout = getLayout(config.name);
                if (layout) {
                    if (config.stateId) {
                        // TODO create state api
                        $.cookie(config.stateId + ".layoutId", config.layoutId, { expires: 7, path: "/" });
                    }

                    layout.doLayout(el, config);
                    $el.trigger("foundation-layout-perform");
                }
            },

            switchLayout: function(el, newConfig) {
                var $el = $(el);
                var prevConfig = $el.data("foundationLayout");

                if (prevConfig && prevConfig.name === newConfig.name) {
                    return;
                }

                if (prevConfig) {
                    var prevLayout = getLayout(prevConfig.name);
                    (prevLayout.clean || this.clean)(el, prevConfig);
                }

                $el.addClass(newConfig.name);
                $el.data("foundationLayout", newConfig);
                this.layout(el);
            },

            clean: function(el) {
                var $el = $(el);
                var config = $el.data("foundationLayout");
                $el.removeClass(config.name);
                $el.data("foundationLayout", null);

                if (config.stateId) {
                    // TODO create state api
                    $.removeCookie(config.stateId + ".layoutId", { path: "/" });
                }
            },

            cleanAll: function(el) {
                var $el = $(el);
                var prevConfig = $el.data("foundationLayout");

                if (prevConfig) {
                    var prevLayout = getLayout(prevConfig.name);
                    (prevLayout.clean || this.clean)(el, prevConfig);
                }
            }
        };
    })();

    $(document).on("foundation-contentloaded", function(e) {
        $(e.target).filter("[data-foundation-layout]").add($("[data-foundation-layout]", e.target)).each(function() {
            Granite.UI.Foundation.Layouts.layout(this);
        });
    });
})(document, Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, Granite, $) {
    "use strict";

    $(document).on("click", ".foundation-layout-control", function(e) {
        var control = $(this);
        var config = control.data("foundationLayoutControl");

        if (config.action === "switch") {
            var target = config.target ? $(config.target) : control.closest("[data-foundation-layout]");
            Granite.UI.Foundation.Layouts.switchLayout(target[0], config.config);

            // also update all layout switchers targeting the same element
            // TODO this is a temporary code that assumes cyclebuttons
            // this feature will be removed in the future!
            $(".foundation-layout-control").each(function() {
                var el = $(this);

                if (el.is(control)) {
                    return;
                }

                var elConfig = el.data("foundationLayoutControl");

                if (elConfig.action !== "switch") {
                    return;
                }
                if (config.config.name !== elConfig.config.name) {
                    return;
                }

                // eslint-disable-next-line max-len
                var sameTarget = elConfig.target ? target.is(elConfig.target) : target.is(el.closest("[data-foundation-layout]"));
                if (!sameTarget) {
                    return;
                }

                if (el.parent(".coral-CycleButton").length) {
                    el.addClass("is-active");
                    el.siblings(".foundation-layout-control").removeClass("is-active");
                } else if (el.parent("coral-cyclebutton").length) {
                    el.prop("selected", true);
                }
            });
        }
    });
})(document, Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, undefined) {
    "use strict";

    function getPersistence(local) {
        var storage = local ? window.localStorage : window.sessionStorage;
        return {
            get: function(key) {
                return JSON.parse(storage.getItem(key));
            },

            set: function(key, data) {
                storage.setItem(key, JSON.stringify(data));
            },

            remove: function(key) {
                storage.removeItem(key);
            }
        };
    }

    /**
     * Provides API related to foundation-clipboard. This is returned class from jQuery adaptTo.
     *
     * @namespace FoundationClipboard
     * @see jQuery.fn.adaptTo
     */
    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-clipboard",
        selector: $(window),
        adapter: function(el) {
            var window = $(el);
            var persistence = getPersistence();

            return /** @lends FoundationClipboard */ {
                /**
                 * @instance
                 */
                get: function(key) {
                    return persistence.get(key);
                },

                /**
                 * @instance
                 */
                set: function(key, data) {
                    persistence.set(key, data);

                    window.trigger("foundation-clipboard-change", {
                        key: key,
                        data: data,
                        timestamp: new Date().getTime()
                    });
                },

                /**
                 * @instance
                 */
                remove: function(key) {
                    persistence.remove(key);

                    window.trigger("foundation-clipboard-change", {
                        key: key,
                        data: null,
                        timestamp: new Date().getTime()
                    });
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, URITemplate) {
    "use strict";

    // keep the registry as internal in the meantime
    var registry = (function() {
        var providers = [];

        return {
            /**
             * name with namespace "foundation", "window", "document" are reserved.
             * App level code needs to use their own namespace.
             *
             * @ignore
             */
            register: function(varname, provider) {
                providers.push({
                    varname: varname,
                    provider: provider
                });
            },

            expandURITemplate: function(template) {
                if (!template) {
                    return template;
                }

                var values = providers.reduce(function(memo, v) {
                    memo[v.varname] = v.provider(v.varname);
                    return memo;
                }, {});

                return URITemplate.expand(template, values);
            },

            resolveVar: function(varname) {
                var c = providers.find(function(v) {
                    return v.varname === varname;
                });
                return c ? c.provider(varname) : undefined;
            }
        };
    })();

    registry.register("window.location", function() {
        return window.location.href;
    });

    $(document).on("click", "a.foundation-setter", function(e) {
        e.preventDefault();
        window.location = registry.expandURITemplate(this.href);
    });

    $(document).on("foundation-contentloaded", function(e) {
        $("input.foundation-setter", e.target).each(function() {
            this.value = registry.resolveVar($(this).data("foundationSetterVar"));
        });
    });
})(window, document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var $window = $(window);
    var keyboard = $window.adaptTo("foundation-util-keyboard");
    var registry = $window.adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-command",
        selector: "button[data-foundation-command],a[data-foundation-command]",
        adapter: function(el) {
            var $el = $(el);
            var shortcutHint;

            return {
                enhanceUI: function() {
                    if (!el.dataset.foundationCommandLabel) {
                        // we save the existing text to make sure that getLabel() returns the correct value
                        var title = el.textContent.trim();
                        el.dataset.foundationCommandLabel = title;
                    }

                    // if the hint has already been initialized there is nothing left to do
                    if (shortcutHint) {
                        return;
                    }

                    // makes sure that the shortcut is displayed with the operating system in mind
                    var shortcut = keyboard.normalize(this.getShortcut());

                    shortcutHint = document.createElement("span");
                    shortcutHint.classList.add("granite-command-inline");
                    shortcutHint.textContent = "(" + shortcut + ")";

                    if (el.label) {
                        el.label.appendChild(shortcutHint);
                    } else {
                        el.appendChild(shortcutHint);
                    }
                },

                execute: function() {
                    $el.click();
                },

                getLabel: function() {
                    return el.dataset.foundationCommandLabel || el.textContent.trim();
                },

                getShortcut: function() {
                    return el.dataset.foundationCommand;
                },

                isActive: function() {
                    return $el.is(":visible");
                }
            };
        }
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var requiredString;
    function getRequiredString() {
        if (!requiredString) {
            requiredString = Granite.I18n.get("Please fill out this field.");
        }
        return requiredString;
    }

    // Cancel the native invalid event (which is triggered by the browser supporting native validation)
    // to show our own UI instead
    document.addEventListener("invalid", function(e) {
        if (e.isJqueryValidator) {
            return;
        }

        e.preventDefault();

        var el = $(e.target);

        var api = el.closest(":-foundation-submittable").adaptTo("foundation-validation");
        api.checkValidity();
        api.updateUI();
    }, true);


    var registry = $(window).adaptTo("foundation-registry");


    // Selector for native elements
    registry.register("foundation.validation.selector", {
        // http://www.w3.org/TR/html5/forms.html#category-submit
        submittable: "input, textarea, select, button, object",

        // http://www.w3.org/TR/html5/forms.html#candidate-for-constraint-validation
        candidate: "input:not([readonly]):not([disabled]):not([type=hidden]):not([type=reset]):not([type=button]), " +
                    "select:not([disabled]), textarea:not([readonly]):not([disabled]), " +
                    "button:not([disabled]):not([type=reset]):not([type=button])"
    });

    // Selector for aria elements
    registry.register("foundation.validation.selector", {
        submittable: "[role=checkbox], [role=radio], [role=combobox], [role=listbox], [role=radiogroup], " +
                      "[role=tree], [role=slider], [role=spinbutton], [role=textbox]",
        candidate: "[role=checkbox]:not([aria-disabled=true]), [role=radio]:not([aria-disabled=true]), " +
                    "[role=combobox]:not([aria-disabled=true]), [role=listbox]:not([aria-disabled=true]), " +
                    "[role=radiogroup]:not([aria-disabled=true]), [role=tree]:not([aria-disabled=true]), " +
                    "[role=slider]:not([aria-disabled=true]), [role=spinbutton]:not([aria-disabled=true]), " +
                    "[role=textbox]:not([aria-disabled=true]):not([aria-readonly=true])"
    });


    // Validator for required of input and textarea
    registry.register("foundation.validation.validator", {
        selector: "input, textarea, select",
        validate: function(element) {
            var el = $(element);

            var isRequired = element.required === true ||
                (element.required === undefined && el.attr("required") !== undefined) ||
                el.attr("aria-required") === "true";

            if (!isRequired) {
                return;
            }

            var valid = false;

            if (el.is("[type=checkbox], [type=radio]")) {
                valid = element.checked;
            } else {
                valid = element.value.length > 0;
            }

            if (!valid) {
                return getRequiredString();
            }
        }
    });

    // Driver for input and textarea

    var validateHandler = function() {
        var api = $(this).adaptTo("foundation-validation");
        if (api) {
            api.checkValidity();
            api.updateUI();
        }
    };

    $(document).on("change", "input, textarea", validateHandler);
    $(document).on("input", "input, textarea", Granite.UI.Foundation.Utils.debounce(validateHandler, 500));


    // Validator for required of role=listbox
    registry.register("foundation.validation.validator", {
        selector: "[role=listbox]",
        validate: function(element) {
            var el = $(element);

            if (el.attr("aria-required") !== "true") {
                return;
            }

            var selected = false;
            el.find("[role=option]").each(function() {
                if ($(this).attr("aria-selected") === "true") {
                    selected = true;
                    return false;
                }
            });

            if (!selected) {
                return getRequiredString();
            }
        }
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-field",
        selector: "input, textarea, select",
        adapter: function(el) {
            return {
                getName: function() {
                    return el.name;
                },
                setName: function(name) {
                    el.name = name;
                },
                isDisabled: function() {
                    return el.disabled;
                },
                setDisabled: function(disabled) {
                    el.disabled = disabled;
                },
                isInvalid: function() {
                    return el.getAttribute("aria-invalid") === "true";
                },
                setInvalid: function(invalid) {
                    el.setAttribute("aria-invalid", invalid ? "true" : "false");
                },
                isRequired: function() {
                    return el.getAttribute("aria-required") === "true";
                },
                setRequired: function(required) {
                    el.setAttribute("aria-required", required ? "true" : "false");
                },
                getValue: function() {
                    if (el.type === "checkbox" || el.type === "radio") {
                        return el.checked ? el.value : null;
                    } else {
                        return el.value;
                    }
                },
                setValue: function(value) {
                    if (el.type === "checkbox" || el.type === "radio") {
                        el.checked = el.value === value;
                    } else {
                        el.value = value;
                    }
                },
                getLabelledBy: function() {
                    return el.getAttribute("aria-labelledby");
                },
                setLabelledBy: function(labelledBy) {
                    if (labelledBy) {
                        el.setAttribute("aria-labelledby", labelledBy);
                    } else {
                        el.removeAttribute("aria-labelledby");
                    }
                },
                getValues: function() {
                    if (el.tagName === "SELECT") {
                        return Array.prototype.map.call(el.selectedOptions, function(option) {
                            return option.value;
                        });
                    } else {
                        return [ this.getValue() ];
                    }
                },
                setValues: function(values) {
                    if (el.tagName === "SELECT") {
                        Array.prototype.forEach.call(el.selectedOptions, function(option) {
                            option.selected = false;
                        });

                        values.forEach(function(value) {
                            var option = Array.prototype.find.call(el.options, function(option) {
                                return option.value === value;
                            });
                            if (option) {
                                option.selected = true;
                            }
                        });
                    } else if (el.type === "checkbox" || el.type === "radio") {
                        el.checked = values.some(function(value) {
                            return el.value === value;
                        });
                    } else {
                        el.value = values[0];
                    }
                }
            };
        }
    });

    $(document).on("change", "input, textarea, select", function(e) {
        $(this).trigger("foundation-field-change");
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, Granite) {
    "use strict";

    var mixedString;
    function getMixedString() {
        if (!mixedString) {
            mixedString = Granite.I18n.get("<Mixed entries>");
        }
        return mixedString;
    }

    $(window).adaptTo("foundation-registry").register("foundation.adapters", {
        type: "foundation-field-mixed",
        selector: "input, textarea",
        adapter: function(el) {
            var field = $(el);

            return {
                setMixed: function(mixed) {
                    if (mixed) {
                        field.addClass("foundation-field-mixed");
                        field.attr("placeholder", getMixedString());
                    } else {
                        field.removeClass("foundation-field-mixed");
                        field.removeAttr("placeholder");
                    }
                }
            };
        }
    });

    $(document).on("change", ".foundation-field-mixed", function() {
        var el = $(this);
        var api = el.adaptTo("foundation-field-mixed");

        if (api) {
            api.setMixed(false);
        }
    });
})(document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, moment) {
    "use strict";
    // This is the code related to enhancement of CoralUI for Granite UI.

    $(document).on("foundation-contentloaded", function(e) {
        // Date formatting needs to be done in the client side due to usage of moment

        $("[data-datepicker-format]", e.target).each(function() {
            var el = $(this);
            var format = el.data("datepicker-format");
            if (!format) {
                return;
            }

            var date = el.text();
            if (!date) {
                return;
            }

            var m = moment(date, [ "YYYY-MM-DD[T]HH:mm:ss.SSSZ", "YYYY-MM-DD[T]HH:mm:ssZ", format ]);
            if (!m) {
                return;
            }

            el.replaceWith(m.format(format));
        });

        var now = moment().locale(document.documentElement.lang);
        var clientTZMin = now.utcOffset();
        var clientTZString = now.format("Z");

        /**
         * Display the time zone preference message if server/client time zones are different
         */
        $(".granite-datepicker-timezone", e.target).each(function() {
            var el = $(this);
            var serverTZMin = parseInt(el.attr("data-granite-datepicker-timezone-server"), 10);

            if (serverTZMin === clientTZMin) {
                el.attr("hidden", "");
                return;
            }

            el.find(".granite-datepicker-timezone-client").text(clientTZString);
        });
    });
/* global moment:false */
})(document, Granite.$, moment);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, URITemplate) {
    "use strict";
    // This is the code related to enhancement of CoralUI2 for Granite UI.
    // We still use some of Coral2 components.

    // Wraps cui-contentloaded event

    $(document).on("cui-contentloaded", function(e, options) {
        if (options && options._foundationcontentloaded) {
            return;
        }

        $(e.target).trigger("foundation-contentloaded", {
            _cuicontentloaded: true
        });
    });

    $(document).on("foundation-contentloaded", function(e, options) {
        if (options && options._cuicontentloaded) {
            return;
        }

        $(e.target).trigger("cui-contentloaded", {
            _foundationcontentloaded: true
        });
    });


    // Register some default CUI.PathBrowser option loaders
    var predicates = [ "folder", "hierarchy", "hierarchyNotFile", "nosystem" ];

    var getPagesOptionLoader = function(predicate) {
        var config = {
            name: "granite.ui.pathBrowser.pages." + predicate,
            handler: function(path, callback) {
                $.get(path + ".pages.json", {
                    predicate: predicate
                },
                function(data) {
                    var pages = data.pages;
                    var result = [];
                    for (var i = 0; i < pages.length; i++) {
                        result.push(pages[i].label);
                    }
                    if (callback) {
                        callback(result);
                    }
                }, "json");
                return false;
            }
        };

        return config;
    };

    for (var i = 0; i < predicates.length; i++) {
        CUI.PathBrowser.register("optionLoader", getPagesOptionLoader(predicates[i]));
    }


    $(document).on("foundation-contentloaded", function(e) {
        // Extend coral-SelectList to support URITemplate
        $(".granite-autocomplete.coral-Autocomplete", e.target).each(function() {
            if ($(this).data("autocomplete") === undefined) {
                new CUI.Autocomplete({
                    element: this,
                    selectlistConfig: {
                        loadData: function(start, end) {
                            // [data-granite-autocomplete-src] is URITemplate
                            // supporting "start", "end", "query" variables.

                            var src = this.$element.attr("data-granite-autocomplete-src");

                            if (!src) {
                                return;
                            }

                            var url = URITemplate.expand(src, $.extend({}, this.options.dataadditional, {
                                start: start,
                                end: end
                            }));

                            var self = this;

                            var ajax = $.get(url);
                            var promise = ajax.then(function(html) {
                                var $html = $(html);
                                var count = $html.filter("li").length;
                                self.$element.append($html);

                                // if not enough elements came back then the loading is complete
                                return count < self.options.datapagesize;
                            });

                            // Need to provide abort function.
                            // This is a bad design of CoralUI as loadData() is expected to
                            // return jQuery Ajax promise (so that the request can be aborted),
                            // but then that promise needs to return a boolean,
                            // which is not what the jQuery Ajax promise is returning!!!
                            promise.abort = function() {
                                ajax.abort();
                            };

                            return promise;
                        }
                    }
                });
            }
        });
    });


    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: ".coral-PathBrowser",
        adapter: function(el) {
            var field = $(el);
            var input = field.find(".js-coral-pathbrowser-input");
            var inputFieldAPI = input.adaptTo("foundation-field");
            var cui = field.data("pathBrowser");

            return {
                getName: inputFieldAPI.getName,
                setName: inputFieldAPI.setName,
                isDisabled: function() {
                    return !!cui.get("disabled");
                },
                setDisabled: function(disabled) {
                    cui.set("disabled", disabled);
                },
                isInvalid: inputFieldAPI.isInvalid,
                setInvalid: inputFieldAPI.setInvalid,
                isRequired: inputFieldAPI.isRequired,
                setRequired: inputFieldAPI.setRequired,
                getValue: inputFieldAPI.getValue,
                setValue: inputFieldAPI.setValue,
                getLabelledBy: inputFieldAPI.getLabelledBy,
                setLabelledBy: inputFieldAPI.setLabelledBy,
                getValues: inputFieldAPI.getValues,
                setValues: inputFieldAPI.setValues
            };
        }
    });

    $(document).on("change", ".js-coral-pathbrowser-input", function(e) {
        $(this).closest(".coral-PathBrowser").trigger("foundation-field-change");
    });


    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: ".coral-Autocomplete:not(coral-autocomplete)",
        adapter: function(el) {
            var field = $(el);
            var input = field.find(".js-coral-Autocomplete-textfield");
            var inputFieldAPI = input.adaptTo("foundation-field");
            var cui = field.data("autocomplete");

            return {
                getName: inputFieldAPI.getName,
                setName: function(name) {
                    var oldName = inputFieldAPI.getName();

                    field.children(".foundation-field-related").each(function() {
                        if (this.name.startsWith(oldName + "@")) {
                            this.name = name + this.name.substring(oldName.length);
                        }
                    });
                    inputFieldAPI.setName(name);
                },
                isDisabled: function() {
                    return !!cui.get("disabled");
                },
                setDisabled: function(disabled) {
                    cui.set("disabled", disabled);
                    field.children(".foundation-field-related").prop("disabled", disabled);
                },
                isInvalid: inputFieldAPI.isInvalid,
                setInvalid: inputFieldAPI.setInvalid,
                getLabelledBy: inputFieldAPI.getLabelledBy,
                setLabelledBy: inputFieldAPI.setLabelledBy,
                isRequired: function() {
                    return el.getAttribute("aria-required") === "true";
                },
                setRequired: function(required) {
                    el.setAttribute("aria-required", required ? "true" : "false");
                },
                getValue: function() {
                    if (cui.options.multiple) {
                        return cui.getValue()[0];
                    } else {
                        return cui.getValue();
                    }
                },
                setValue: function(value) {
                    if (cui.options.multiple) {
                        cui.clear();

                        cui._tagListWidget.addItem({
                            value: value,
                            display: value
                        });
                    } else {
                        inputFieldAPI.setValue(value);
                    }
                },
                getValues: function() {
                    if (cui.options.multiple) {
                        return cui.getValue();
                    } else {
                        return [ cui.getValue() ];
                    }
                },
                setValues: function(values) {
                    if (cui.options.multiple) {
                        cui.clear();

                        cui._tagListWidget.addItem(values.map(function(v) {
                            return {
                                value: v,
                                display: v
                            };
                        }));
                    } else {
                        inputFieldAPI.setValues(values);
                    }
                }
            };
        }
    });

    $(document).on("change:value", ".coral-Autocomplete:not(coral-autocomplete)", function(e) {
        $(this).trigger("foundation-field-change");
    });

    $(document).on("change", ".js-coral-Autocomplete-textfield", function(e) {
        $(this).closest(".coral-Autocomplete").trigger("foundation-field-change");
    });
})(document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var $window = $(window);
    var keyboard = $window.adaptTo("foundation-util-keyboard");
    var registry = $window.adaptTo("foundation-registry");

    // registers the cyclebutton items as a valid foundation-command
    registry.register("foundation.adapters", {
        type: "foundation-command",
        selector: "coral-cyclebutton-item[data-foundation-command]",
        adapter: function(el) {
            var $el = $(el);
            var $cycleButton = $el.closest("coral-cyclebutton");
            var shortcutHint;

            return {
                enhanceUI: function() {
                    if (!el.dataset.foundationCommandLabel) {
                        // we save the existing text to make sure that getLabel() returns the correct value
                        var title = el.textContent.trim();
                        el.dataset.foundationCommandLabel = title;
                    }

                    // if the hint has already been initialized there is nothing left to do
                    if (shortcutHint) {
                        return;
                    }

                    // makes sure that the shortcut is displayed with the operating system in mind
                    var shortcut = keyboard.normalize(this.getShortcut());

                    shortcutHint = document.createElement("span");
                    shortcutHint.classList.add("granite-command-alignRight");
                    shortcutHint.textContent = shortcut;

                    // we need to insertBefore for all browsers to handle the float correctly
                    if (el.content) {
                        el.content.insertBefore(shortcutHint, el.content.firstChild);
                    } else {
                        el.insertBefore(shortcutHint, el.firstChild);
                    }
                },

                execute: function() {
                    // in case the item was already selected, toggle the item by selecting the first item; if the first
                    // item was already selected, no change needs to happen
                    if (el.hasAttribute("selected")) {
                        $cycleButton[0].items.first().setAttribute("selected", true);
                    } else {
                        el.setAttribute("selected", true);
                    }
                },

                getLabel: function() {
                    return el.dataset.foundationCommandLabel || el.textContent.trim();
                },

                getShortcut: function() {
                    return el.dataset.foundationCommand;
                },

                isActive: function() {
                    // makes sure the cyclebutton is visible and the item is enabled
                    return $cycleButton.is(":visible") && !$el.prop("hidden") && !$el.prop("disabled");
                }
            };
        }
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";
    // This is code to adapt CoralUI component to foundation-toggleable
    // i.e. `$(coralEl).adaptTo("foundation-toggleable")`

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: "coral-dialog.foundation-toggleable",
        adapter: function(el) {
            var dialog = $(el);

            dialog.on("coral-overlay:beforeopen", function(e) {
                if (e.target !== el) {
                    return;
                }
                // TODO Make this event official later on
                dialog.trigger("foundation-toggleable-beforeshow");
            });

            dialog.on("coral-overlay:open", function(e) {
                if (e.target !== el) {
                    return;
                }
                dialog.trigger("foundation-toggleable-show");
            });

            dialog.on("coral-overlay:close", function(e) {
                if (e.target !== el) {
                    return;
                }
                dialog.trigger("foundation-toggleable-hide");
            });

            return {
                isOpen: function() {
                    return el.open;
                },

                show: function(anchor) {
                    el.show();
                },

                hide: function() {
                    el.hide();
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: "coral-popover.foundation-toggleable, coral-overlay.foundation-toggleable",
        adapter: function(el) {
            var popover = $(el);
            var isPopover = el.tagName.toLowerCase() === "coral-popover";

            var handleElementEscKey = function(event) {
                // here we use the private method _isTopOverlay. This is bad but there is this issue to fix it:
                // https://jira.corp.adobe.com/browse/CUI-6039
                // once that gets fix, the UT for this should fail and notify that is time to fix this code also.
                if ((event.which || event.keyCode) === 27 && el.open && el._isTopOverlay()) {
                    event.preventDefault();
                    el.hide();
                }
            };

            var handleGlobalClick = function(event) {
                var targetEl = el._getTarget();

                // Close if open and the click was outside the target and the popover
                if (targetEl && !targetEl.contains(event.target) && !el.contains(event.target)) {
                    el.hide();
                }
            };

            popover.on("coral-overlay:open", function(e) {
                if (e.target !== el) {
                    return;
                }

                popover.trigger("foundation-toggleable-show");
            });

            popover.on("coral-overlay:close", function(e) {
                if (e.target !== el) {
                    return;
                }

                if (isPopover) {
                    document.removeEventListener("click", handleGlobalClick, true);
                    el.removeEventListener("keydown", handleElementEscKey);
                }

                popover.trigger("foundation-toggleable-hide");
            });

            return {
                isOpen: function() {
                    return el.open;
                },

                show: function(anchor) {
                    if (!(anchor instanceof Element)) {
                        return;
                    }

                    el.target = anchor;

                    if (isPopover) {
                        el.interaction = "off";
                        document.addEventListener("click", handleGlobalClick, true);
                        el.addEventListener("keydown", handleElementEscKey);
                    }

                    el.show();
                },

                hide: function() {
                    el.hide();
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: "coral-panel.foundation-toggleable",
        adapter: function(el) {
            var panel = $(el);

            return {
                isOpen: function() {
                    return el.selected;
                },

                show: function(anchor) {
                    el.selected = true;
                    panel.trigger("foundation-toggleable-show");
                },

                hide: function() {
                    el.selected = false;
                    panel.trigger("foundation-toggleable-hide");
                }
            };
        }
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Coral, moment) {
    "use strict";

    var DEBOUNCE_TIMEOUT = 500;

    var requiredString;
    function getRequiredString() {
        if (!requiredString) {
            requiredString = Granite.I18n.get("Please fill out this field.");
        }
        return requiredString;
    }

    function handleValidation(el) {
        var api = el.adaptTo("foundation-validation");
        if (api) {
            api.checkValidity();
            api.updateUI();
        }
    }

    function handleShow(element, message) {
        var el = $(element);

        var field = el.closest(".coral-Form-field");

        var fieldAPI = el.adaptTo("foundation-field");
        if (fieldAPI && fieldAPI.setInvalid) {
            fieldAPI.setInvalid(true);
        }

        field.nextAll(".coral-Form-fieldinfo").addClass("u-coral-screenReaderOnly");

        var error = field.data("foundation-validation.internal.error");

        if (error) {
            var tooltip = $(error).data("foundation-validation.internal.error.tooltip");
            tooltip.content.innerHTML = message;

            if (!error.parentNode) {
                field.after(error, tooltip);
                // field.after(tooltip);
                // append tooltip ID to the labelledby attribute of field
                setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), tooltip.id));
            }
        } else {
            error = new Coral.Icon();
            error.icon = "alert";
            error.classList.add("coral-Form-fielderror");

            tooltip = new Coral.Tooltip();
            tooltip.variant = "error";
            tooltip.placement = field.closest(".coral-Form").hasClass("coral-Form--vertical") ? "left" : "bottom";
            tooltip.target = error;
            tooltip.content.innerHTML = message;
            tooltip.id = Coral.commons.getUID();

            $(error).data("foundation-validation.internal.error.tooltip", tooltip);
            error.setAttribute("aria-labelledby", tooltip.id);
            error.setAttribute("tabindex", 0);

            field.data("foundation-validation.internal.error", error);
            field.after(error, tooltip);
            // append tooltip ID to the labelledby attribute of field
            setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), tooltip.id));
        }
    }

    function handleClear(element) {
        var el = $(element);

        var field = el.closest(".coral-Form-field");

        var fieldAPI = el.adaptTo("foundation-field");
        if (fieldAPI && fieldAPI.setInvalid) {
            fieldAPI.setInvalid(false);
        }

        var error = field.data("foundation-validation.internal.error");
        if (error) {
            var tooltip = $(error).data("foundation-validation.internal.error.tooltip");
            tooltip.hide();
            tooltip.remove();
            error.remove();

            // Remove the ID of error from the label of field
            var labelledBy = getLabelledBy(fieldAPI);
            if (labelledBy && labelledBy.indexOf(tooltip.id) !== -1) {
                var newLabel = labelledBy.split(" ")
                    .filter(function(v) {
                        return v !== tooltip.id;
                    })
                    .join(" ");
                setLabelledBy(fieldAPI, newLabel);
            }
        }
        field.nextAll(".coral-Form-fieldinfo").removeClass("u-coral-screenReaderOnly");
    }

    function getLabel(label, errorId) {
        if (label) {
            return label + " " + errorId;
        }
        return errorId;
    }

    /**
     * This method sets value of labelledby attribute on field.
     *
     * @param fieldAPI foundation-field
     * @param labelledBy value of labelledby attribute to set on field
     */
    function setLabelledBy(fieldAPI, labelledBy) {
        if (fieldAPI && fieldAPI.setLabelledBy) {
            fieldAPI.setLabelledBy(labelledBy);
        }
    }

    /**
     * This method gets value of labelledby attribute from field.
     *
     * @param fieldAPI foundation-field
     */
    function getLabelledBy(fieldAPI) {
        if (fieldAPI && fieldAPI.getLabelledBy) {
            return fieldAPI.getLabelledBy();
        }
    }

    /**
    * This method computes whether a dividend is divisible by the divisor
    * or not.
    * It is capable of handling floating point arithmetic as well.
    */
    function isDivisible(dividend, divisor) {
        if (!divisor) {
            return true;
        }
        var dividendDecimal = dividend.toString().split(".");
        var divisorDecimal = divisor.toString().split(".");
        var dividendDecimalLength = (dividendDecimal[1] && dividendDecimal[1].length) || 0;
        var divisorDecimalLength = (divisorDecimal[1] && divisorDecimal[1].length) || 0;

        if (dividendDecimalLength === 0 && divisorDecimalLength === 0) {
            return (dividend % divisor) === 0;
        }
        var higherDecimalLength =
        dividendDecimalLength > divisorDecimalLength
            ? dividendDecimalLength + 1
            : divisorDecimalLength + 1;
        return ((dividend * Math.pow(10, higherDecimalLength + 1)) %
                    (divisor * Math.pow(10, higherDecimalLength + 1))) === 0;
    }

    var debounce = Granite.UI.Foundation.Utils.debounce;
    var registry = $(window).adaptTo("foundation-registry");

    var formFieldSelector = [ ".coral-Form-fieldwrapper .coral-Form-field",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-InputGroup .coral-InputGroup-input",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-DecoratedTextfield .coral-DecoratedTextfield-input",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-PathBrowser .js-coral-pathbrowser-input",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-Checkbox .coral-Checkbox-input",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-Switch .coral-Switch-input",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-Select .coral-Select-select",
        ".coral-Form-fieldwrapper .coral-Form-field.coral-FileUpload .coral-FileUpload-input" ];

    registry.register("foundation.validation.validator", {
        selector: formFieldSelector.join(", "),
        show: function(element, message) {
            handleShow(element, message);
        },
        clear: function(element) {
            handleClear(element);
        }
    });


    // Validator for password retype field
    registry.register("foundation.validation.validator", {
        selector: "input[type=password]",
        validate: function(el) {
            var $el = $(el);

            if (!el.value) {
                return;
            }

            // Note that we show the error message at the retype field.

            var retypeName = el.getAttribute("data-granite-password-retype");
            if (retypeName) {
                var $retypeField = $el.closest("form").find("input[type=password]").filter(function() {
                    return this.name === retypeName;
                });
                if ($retypeField.val()) {
                    handleValidation($retypeField);
                }
            } else {
                // If el has no selector attribute, check for another password fields that are pointing to el
                // We have to validate el against those.

                var isValid = true;

                $el.closest("form").find("input[type=password][data-granite-password-retype]").each(function() {
                    retypeName = this.getAttribute("data-granite-password-retype");

                    if (!retypeName || retypeName !== el.name) {
                        return;
                    }

                    if (this.value && this.value !== el.value) {
                        isValid = false;
                        return false;
                    }
                });

                if (!isValid) {
                    return Granite.I18n.get("Passwords do not match!");
                }
            }
        }
    });


    // Selector for coral-checkbox, coral-radio, coral-switch
    registry.register("foundation.validation.selector", {
        submittable: "coral-checkbox, coral-radio, coral-switch",
        candidate: [
            "coral-checkbox:not([readonly]):not([disabled])",
            "coral-radio:not([readonly]):not([disabled])",
            "coral-switch:not([readonly]):not([disabled])"
        ].join(", "),
        exclusion: "coral-checkbox *, coral-radio *, coral-switch *"
    });

    // Validator for required of coral-checkbox, coral-radio, coral-switch
    registry.register("foundation.validation.validator", {
        selector: "coral-checkbox, coral-radio, coral-switch",
        validate: function(el) {
            if (el.required && !el.checked) {
                return getRequiredString();
            }
        }
    });


    // Selector for coral-datepicker, coral-numberinput, coral-slider, coral-colorinput
    registry.register("foundation.validation.selector", {
        submittable: "coral-datepicker, coral-numberinput, coral-slider, coral-colorinput",
        candidate: [
            "coral-datepicker:not([readonly]):not([disabled])",
            "coral-numberinput:not([readonly]):not([disabled])",
            "coral-slider:not([readonly]):not([disabled])",
            "coral-colorinput:not([readonly]):not([disabled])"
        ].join(", "),
        exclusion: "coral-datepicker *, coral-numberinput *, coral-slider *, coral-colorinput *"
    });

    // Validator for required of coral-slider and coral-colorinput
    registry.register("foundation.validation.validator", {
        selector: "coral-slider, coral-colorinput",
        validate: function(el) {
            // Check required attribute
            if (el.required && el.value.length === 0) {
                return getRequiredString();
            }
        }
    });

    registry.register("foundation.validation.validator", {
        selector: "coral-numberinput",
        validate: function(el) {
            if (el.required && !el.value) {
                return getRequiredString();
            }

            if (el.max !== null && el.valueAsNumber > el.max) {
                return Granite.I18n.get("Please enter a value that is no more than {0}.", [ el.max ], "{0}=max number");
            }

            if (el.min !== null && el.valueAsNumber < el.min) {
                return Granite.I18n.get("Please enter a value that is no less than {0}.", [ el.min ], "{0}=min number");
            }

            if (!isNaN(el.step) && !isNaN(el.valueAsNumber) && !isDivisible(el.valueAsNumber, el.step)) {
                return Granite.I18n.get("Please enter a value that is a multiple of {0}.", [ el.step ], "{0}=step");
            }
        }
    });

    // Validator for required of coral-datepicker
    registry.register("foundation.validation.validator", {
        selector: "coral-datepicker",
        validate: function(el) {
            // Check required attribute
            if (el.required && el.value.length === 0) {
                return getRequiredString();
            }

            var $el = $(el);

            var beforeAttributeName = "data-granite-datepicker-before";
            var afterAttributeName = "data-granite-datepicker-after";
            var validationResult;

            var beforeSelector = el.getAttribute(beforeAttributeName);

            if (beforeSelector) {
                $(beforeSelector).each(function() {
                    validationResult = validateAfter(el, this);
                    if (validationResult) {
                        return false;
                    }
                });
                if (validationResult) {
                    return validationResult;
                }
            }

            var afterSelector = el.getAttribute(afterAttributeName);

            if (afterSelector) {
                $(afterSelector).each(function() {
                    validationResult = validateBefore(el, this);
                    if (validationResult) {
                        return false;
                    }
                });
                if (validationResult) {
                    return validationResult;
                }
            }

            // If el has no selector attribute, check for another datepickers that are pointing to el
            // We have to validate those (because the attribute is set there) against el.

            $("coral-datepicker[" + beforeAttributeName + "]").each(function() {
                if ($el.is(this.getAttribute(beforeAttributeName))) {
                    validationResult = validateBefore(el, this);
                    if (validationResult) {
                        handleValidation($(this));
                    }
                }
            });

            $("coral-datepicker[" + afterAttributeName + "]").each(function() {
                if ($el.is(this.getAttribute(afterAttributeName))) {
                    validationResult = validateAfter(el, this);
                    if (validationResult) {
                        handleValidation($(this));
                    }
                }
            });
        }
    });

    /**
     * Checks if the given beforeEl is before the afterEl.
     */
    function validateBefore(beforeEl, afterEl) {
        if (beforeEl.valueAsDate === null || afterEl.valueAsDate === null) {
            // It cannot be compared so ignore it.
            // The validity of the date is checked by other validator. We are dealing solely with comparison.
            return;
        }

        if (beforeEl.valueAsDate.getTime() >= afterEl.valueAsDate.getTime()) {
            return Granite.I18n.get(
                "The date is not before {0}.",
                moment(afterEl.valueAsDate).format(afterEl.displayFormat)
            );
        }
    }

    /**
     * Checks if the given afterEl is after the beforeEl.
     */
    function validateAfter(afterEl, beforeEl) {
        if (beforeEl.valueAsDate === null || afterEl.valueAsDate === null) {
            // It cannot be compared so ignore it.
            // The validity of the date is checked by other validator. We are dealing solely with comparison.
            return;
        }

        if (beforeEl.valueAsDate.getTime() >= afterEl.valueAsDate.getTime()) {
            return Granite.I18n.get(
                "The date is not after {0}.",
                moment(beforeEl.valueAsDate).format(beforeEl.displayFormat)
            );
        }
    }


    // Selector for coral-autocomplete, coral-select, coral-taglist, coral-fileupload, coral-buttongroup
    registry.register("foundation.validation.selector", {
        submittable: "coral-autocomplete, coral-select, coral-taglist, coral-fileupload, coral-buttongroup",
        candidate: [
            "coral-autocomplete:not([readonly]):not([disabled])",
            "coral-select:not([readonly]):not([disabled])",
            "coral-taglist:not([readonly]):not([disabled])",
            "coral-fileupload:not([readonly]):not([disabled])",
            "coral-buttongroup:not([readonly]):not([disabled])"
        ].join(", "),
        exclusion: "coral-autocomplete *, coral-select *, coral-taglist *, coral-fileupload *, coral-buttongroup *"
    });

    // Validator for required of coral-autocomplete, coral-select, coral-taglist, coral-fileupload, coral-buttongroup
    registry.register("foundation.validation.validator", {
        selector: "coral-autocomplete, coral-select, coral-taglist, coral-fileupload, coral-buttongroup",
        validate: function(el) {
            if (el.required) {
                if (el.values.length === 0 || (el.values.length === 1 && el.value === "")) {
                    return getRequiredString();
                }
            }
        }
    });

    // Selector for coral-multifield
    registry.register("foundation.validation.selector", {
        submittable: "coral-multifield",
        candidate: "coral-multifield",
        exclusion: "[coral-multifield-template], [coral-multifield-template] *"
    });

    // Validator for required of coral-multifield
    registry.register("foundation.validation.validator", {
        selector: "coral-multifield",
        validate: function(el) {
            if (el.getAttribute("aria-required") === "true" && el.items.getAll().length === 0) {
                return getRequiredString();
            }
        }
    });

    // Driver for coral fields
    var changeCssSelector = [
        "coral-autocomplete",
        "coral-checkbox",
        "coral-switch",
        "coral-datepicker",
        "coral-numberinput",
        "coral-colorinput",
        "coral-radio",
        "coral-select",
        "coral-slider",
        "coral-taglist",
        "coral-multifield",
        "coral-fileupload",
        "coral-buttongroup"
    ].join(", ");
    $(document).on("change", changeCssSelector, function(e) {
        handleValidation($(this));
    });

    // As it is not a ShadowDOM and Coral doesn't retarget the input event from its shadow element,
    // we have to retarget on behalf.
    var inputCssSelector = [
        "coral-datepicker input[handle]",
        "coral-numberinput input[handle]",
        "coral-colorinput input[handle]"
    ].join(", ");
    $(document).on("input", inputCssSelector, debounce(function(e) {
        handleValidation($(this).closest("coral-datepicker, coral-numberinput, coral-colorinput"));
    }, DEBOUNCE_TIMEOUT));


    // Selector for radiogroup
    registry.register("foundation.validation.selector", {
        submittable: ".coral-RadioGroup",
        candidate: ".coral-RadioGroup",
        exclusion: ".coral-RadioGroup *"
    });

    // Validator for required of radiogroup
    registry.register("foundation.validation.validator", {
        selector: ".coral-RadioGroup",
        validate: function(el) {
            var $el = $(el);

            if ($el.attr("aria-required") !== "true") {
                return;
            }

            var coral3 = $el.children("coral-radio");
            if (coral3.length) {
                if (coral3.filter("[checked]").length === 0) {
                    return getRequiredString();
                }
            } else if ($el.find("> * > :checked").length === 0) {
                return getRequiredString();
            }
        }
    });

    // Driver for coral radiogroup
    $(document).on("change", ".coral-RadioGroup", function(e) {
        handleValidation($(this));
    });


    // Selector for autocomplete
    registry.register("foundation.validation.selector", {
        submittable: ".coral-Autocomplete:not(coral-autocomplete)",
        candidate: ".coral-Autocomplete:not(coral-autocomplete)", // TODO handle readonly and disabled
        exclusion: ".coral-Autocomplete:not(coral-autocomplete) *"
    });

    // Validator for required for autocomplete
    registry.register("foundation.validation.validator", {
        selector: ".coral-Autocomplete:not(coral-autocomplete)",
        validate: function(element) {
            var el = $(element);

            // value is not required, so validation is skipped
            if (el.attr("aria-required") !== "true") {
                return;
            }

            var autocomplete = el.data("autocomplete");

            // validates both multiple and non-multiple options
            if (autocomplete.getValue().length === 0) {
                return getRequiredString();
            }
        }
    });

    // Driver for autocomplete

    $(document).on("change:value", ".coral-Autocomplete:not(coral-autocomplete)", function(e) {
        handleValidation($(this));
    });

    var acValidateHandler = function(e) {
        var el = $(this);
        var ac = el.closest(".coral-Autocomplete");

        if (ac.data("autocomplete").options.multiple) {
            return;
        }

        handleValidation(ac);
    };

    $(document).on("change", ".js-coral-Autocomplete-textfield", acValidateHandler);
    $(document).on("input", ".js-coral-Autocomplete-textfield", debounce(acValidateHandler, DEBOUNCE_TIMEOUT));


    function pushInvalid(container, invalid) {
        var key = "coral-tabview.internal.invalids";

        var invalids = container.data(key);
        if (invalids === undefined) {
            invalids = [];
            container.data(key, invalids);
        }

        if (invalids.indexOf(invalid) < 0) {
            invalids.push(invalid);
        }
    }

    $(document).on("foundation-validation-invalid", "coral-panel", function(e) {
        var panel = $(this);
        var tabview = panel.parent().parent("coral-tabview")[0];

        if (!tabview) {
            // Not the panel of the tabview.
            return;
        }

        // Wait for element upgrade
        requestAnimationFrame(function() {
            var tab = tabview.tabList.items.getAll()[panel.index()];

            tab.invalid = true;
            pushInvalid(panel, e.target);
        });
    });

    $(document).on("foundation-validation-valid", "coral-panel", function(e) {
        var panel = $(this);
        var tabview = panel.parent().parent("coral-tabview")[0];

        if (!tabview) {
            // Not the panel of the tabview.
            return;
        }

        // Wait for element upgrade
        requestAnimationFrame(function() {
            var tab = tabview.tabList.items.getAll()[panel.index()];

            var enable = function() {
                if (panel.adaptTo("foundation-validation-helper").isValid()) {
                    tab.invalid = false;
                }
            };

            var invalids = panel.data("coral-tabview.internal.invalids");

            if (!invalids) {
                enable();
                return;
            }

            var i = invalids.indexOf(e.target);
            if (i >= 0) {
                invalids.splice(i, 1);
            }

            if (invalids.length === 0) {
                enable();
                return;
            }

            // check if the invalids are belong to the panel (they can be moved meanwhile)
            // if all of them are outside the panel, then enable the binded element

            var invalid = false;

            var j = invalids.length;
            while (j--) {
                if (panel.has(invalids[j]).length) {
                    invalid = true;
                    break;
                }
                invalids.splice(j, 1);
            }

            if (!invalid) {
                enable();
            }
        });
    });
/* global moment:false */
})(window, Granite.$, Coral, moment);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");
    var $document = $(document);

    function changeName(el, oldName, newName) {
        if (el.name.startsWith(oldName + "@")) {
            el.name = newName + el.name.substring(oldName.length);
        }
    }

    var coralSelector = [
        "input[is='coral-textfield']", "textarea[is='coral-textarea']",
        "coral-checkbox", "coral-radio", "coral-switch",
        "coral-datepicker", "coral-numberinput", "coral-slider", "coral-colorinput", "coral-calendar",
        "coral-autocomplete", "coral-select", "coral-taglist", "coral-fileupload",
        "coral-buttongroup"
    ];

    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: coralSelector.join(","),
        adapter: function(el) {
            var field = $(el);

            return {
                getName: function() {
                    return el.name;
                },
                setName: function(name) {
                    field
                        .nextAll(".foundation-field-related")
                        .add(field.children(".foundation-field-related"))
                        .each(function() {
                            changeName(this, el.name, name);
                        });
                    el.name = name;
                },
                isDisabled: function() {
                    return el.disabled;
                },
                setDisabled: function(disabled) {
                    el.disabled = disabled;
                    field
                        .nextAll(".foundation-field-related")
                        .add(field.children(".foundation-field-related"))
                        .prop("disabled", disabled);
                },
                isInvalid: function() {
                    return el.hasAttribute("invalid");
                },
                setInvalid: function(invalid) {
                    if (invalid) {
                        el.setAttribute("invalid", "");
                    } else {
                        el.removeAttribute("invalid");
                    }
                },
                isRequired: function() {
                    if ($(el).is("input, textarea")) {
                        return el.getAttribute("aria-required") === "true";
                    } else {
                        return el.required;
                    }
                },
                setRequired: function(required) {
                    if ($(el).is("input, textarea")) {
                        el.setAttribute("aria-required", required ? "true" : "false");
                    } else {
                        el.required = required;
                    }
                },
                getValue: function() {
                    if ($(el).is("coral-checkbox, coral-radio, coral-switch")) {
                        return el.checked ? el.value : null;
                    } else {
                        return el.value;
                    }
                },
                setValue: function(value) {
                    if ($(el).is("coral-checkbox, coral-radio, coral-switch")) {
                        el.checked = el.value === value;
                    } else {
                        el.value = value;
                    }
                },
                getLabelledBy: function() {
                    return el.labelledBy;
                },
                setLabelledBy: function(labelledBy) {
                    el.labelledBy = labelledBy;
                },
                getValues: function() {
                    if ($(el).is("coral-checkbox, coral-radio, coral-switch")) {
                        return [ this.getValue() ];
                    }

                    if ("values" in el) {
                        return el.values;
                    } else {
                        return [ el.value ];
                    }
                },
                setValues: function(values) {
                    if ($(el).is("coral-checkbox, coral-radio, coral-switch")) {
                        el.checked = values.some(function(value) {
                            return el.value === value;
                        });
                    } else if ("values" in el) {
                        el.values = values;
                    } else {
                        el.value = values[0];
                    }
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: "coral-multifield",
        adapter: function(el) {
            var multifield = $(el);

            return {
                getName: function() {
                    // Assume that the [data-granite-coral-multifield-name] is never changed or is always in sync with
                    // the name in the template
                    return el.getAttribute("data-granite-coral-multifield-name") || "";
                },
                setName: function(name) {
                    el.setAttribute("data-granite-coral-multifield-name", name);
                },
                isDisabled: function() {
                    // we rely on the state of the add element to decide on the disabled status
                    return multifield.children("[coral-multifield-add]").prop("disabled") || false;
                },
                setDisabled: function(disabled) {
                    // we use descent selector to support nested multifields; we use a selector instead of the
                    // item.content api
                    multifield.find("> coral-multifield-item > coral-multifield-item-content").each(function() {
                        // we need the parent item to be able to hide the item controls
                        var item = $(this.parentNode);
                        // @coral: selector is not public
                        item.children("[handle='remove'], [handle='move']").prop("disabled", disabled);

                        var api = $(this.firstElementChild).adaptTo("foundation-field");
                        if (api && "setDisabled" in api) {
                            api.setDisabled(disabled);
                        }
                    });

                    multifield.children("[coral-multifield-add], .foundation-field-related").prop("disabled", disabled);
                },
                isInvalid: function() {
                    return el.getAttribute("aria-invalid") === "true";
                },
                setInvalid: function(invalid) {
                    el.setAttribute("aria-invalid", invalid ? "true" : "false");
                },
                isRequired: function() {
                    return el.getAttribute("aria-required") === "true";
                },
                setRequired: function(required) {
                    el.setAttribute("aria-required", required ? "true" : "false");
                },
                getValue: function() {
                    // we need to use the descendent selector in case we have nested multifields
                    var api = multifield
                        .find("> coral-multifield-item > coral-multifield-item-content > :first-child")
                        .first()
                        .adaptTo("foundation-field");

                    if (api && "getValue" in api) {
                        return api.getValue();
                    } else {
                        return null;
                    }
                },
                setValue: function(value) {
                    this.setValues([ value ]);
                },
                getLabelledBy: function() {
                    return el.getAttribute("aria-labelledby");
                },
                setLabelledBy: function(labelledBy) {
                    if (labelledBy) {
                        el.setAttribute("aria-labelledby", labelledBy);
                    } else {
                        el.removeAttribute("aria-labelledby");
                    }
                },
                getValues: function() {
                    return Array.prototype.map.call(
                        // we need to use the descendent selector in case we have nested multifields
                        multifield.find("> coral-multifield-item > coral-multifield-item-content"),
                        function(item) {
                            var api = $(item.firstElementChild).adaptTo("foundation-field");
                            if (api && "getValue" in api) {
                                return api.getValue();
                            } else {
                                return null;
                            }
                        });
                },
                setValues: function(values) {
                    var item;
                    var api;

                    var items = el.items.getAll();
                    var itemCount = items.length;
                    var valuesCount = values.length;

                    for (var i = 0; i < valuesCount; i++) {
                        item = items[i];

                        // if there is no item available to recycle, we use the Collection API to create an item§
                        if (typeof item === "undefined") {
                            item = el.items.add(new Coral.Multifield.Item());
                        }

                        // @coral we force the upgrade of the item so that we can set the value synchronously
                        // and we also force the item to render its content
                        window.CustomElements.upgrade(item);
                        if (!item.content.firstChild) {
                            el._renderTemplate(item);
                        }

                        api = $(item.content.firstElementChild).adaptTo("foundation-field");
                        if (api && "setValue" in api) {
                            api.setValue(values[i]);
                        }
                    }

                    // any extra item needs to be removed
                    for (var j = valuesCount; j < itemCount; j++) {
                        el.items.remove(items[j]);
                    }
                }
            };
        }
    });

    $document.on("change", coralSelector.concat("coral-multifield").join(","), function(e) {
        $(this).trigger("foundation-field-change");
    });


    registry.register("foundation.adapters", {
        type: "foundation-field",
        selector: ".coral-RadioGroup",
        adapter: function(el) {
            var field = $(el);

            return {
                getName: function() {
                    // returns empty string when no coral-radios were found
                    return field.children("coral-radio").first().prop("name") || "";
                },
                setName: function(name) {
                    var $radioElements = field.children("coral-radio");
                    var oldName = $radioElements.first().prop("name");

                    $radioElements.prop("name", name);

                    if (typeof oldName !== "undefined") {
                        field.children(".foundation-field-related").each(function() {
                            changeName(this, oldName, name);
                        });
                    }
                },
                isDisabled: function() {
                    var $radioElements = field.children("coral-radio");

                    // a radio group with no items is considered enabled
                    if ($radioElements.length === 0) {
                        return false;
                    } else {
                        return Array.prototype.every.call($radioElements, function(item) {
                            return item.disabled;
                        });
                    }
                },
                setDisabled: function(disabled) {
                    field.children("coral-radio, .foundation-field-related").prop("disabled", disabled);
                },
                isInvalid: function() {
                    return el.getAttribute("aria-invalid") === "true";
                },
                setInvalid: function(invalid) {
                    el.setAttribute("aria-invalid", invalid ? "true" : "false");
                },
                isRequired: function() {
                    return el.getAttribute("aria-required") === "true";
                },
                setRequired: function(required) {
                    el.setAttribute("aria-required", required ? "true" : "false");
                },
                getValue: function() {
                    var values = Array.prototype.reduce.call(field.children("coral-radio"), function(memo, item) {
                        if (item.checked) {
                            memo.push(item.value);
                        }
                        return memo;
                    }, []);

                    if (values.length) {
                        return values[0];
                    } else {
                        return null;
                    }
                },
                setValue: function(value) {
                    field.children("coral-radio").each(function() {
                        if (this.value === value) {
                            return this.checked = true;
                        }
                        return false;
                    });
                },
                getLabelledBy: function() {
                    var elements = field.children("coral-radio");
                    if (elements.length > 0) {
                        return elements[0].labelledBy;
                    } else {
                        return null;
                    }
                },
                setLabelledBy: function(labelledBy) {
                    field.children("coral-radio").each(function() {
                        this.labelledBy = labelledBy;
                    });
                },
                getValues: function() {
                    return Array.prototype.reduce.call(field.children("coral-radio"), function(memo, item) {
                        if (item.checked) {
                            memo.push(item.value);
                        }
                        return memo;
                    }, []);
                },
                setValues: function(values) {
                    var items = field.children("coral-radio");

                    values.forEach(function(value) {
                        items.each(function() {
                            if (this.value === value) {
                                items = items.not(this);
                                this.checked = true;
                                return false;
                            }
                        });
                    });
                }
            };
        }
    });

    $document.on("change", "coral-radio", function(e) {
        $(this).parent(".coral-RadioGroup").trigger("foundation-field-change");
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, Granite) {
    "use strict";

    var mixedString;
    function getMixedString() {
        if (!mixedString) {
            mixedString = Granite.I18n.get("<Mixed entries>");
        }
        return mixedString;
    }

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.adapters", {
        type: "foundation-field-mixed",
        selector: "coral-datepicker",
        adapter: function(el) {
            return {
                setMixed: function(mixed) {
                    if (mixed) {
                        el.classList.add("foundation-field-mixed");
                        el.placeholder = getMixedString();
                    } else {
                        el.classList.remove("foundation-field-mixed");
                        el.placeholder = "";
                    }
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-field-mixed",
        selector: "[data-init='pathbrowser']",
        adapter: function(el) {
            var field = $(el);
            var cui = field.data("pathBrowser");

            return {
                setMixed: function(mixed) {
                    if (mixed) {
                        cui.$element.addClass("foundation-field-mixed");
                        cui.$element.attr("placeholder", getMixedString());
                    } else {
                        cui.$element.removeClass("foundation-field-mixed");
                        cui.$element.removeAttr("placeholder");
                    }
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-field-mixed",
        selector: "coral-checkbox",
        adapter: function(el) {
            return {
                setMixed: function(mixed) {
                    if (mixed) {
                        el.classList.add("foundation-field-mixed");
                    } else {
                        el.classList.remove("foundation-field-mixed");
                    }
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-field-mixed",
        selector: ".js-cq-TagsPickerField[data-init='pathbrowser']",
        adapter: function(el) {
            return {
                setMixed: function(mixed) {
                    // CQ-40222
                }
            };
        }
    });
})(document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $) {
    "use strict";

    var MULTIFIELD_SELECTOR = "coral-multifield";
    var COMPOSITE_MULTIFIELD_SELECTOR = "coral-multifield[data-granite-coral-multifield-composite]";

    /**
     * Traverses the given parent and call the given callback when an element is a submittable.
     */
    function traverse(parent, callback) {
        parent.children().each(function() {
            var child = $(this);
            if (child.is(":-foundation-submittable")) {
                callback(this);
            } else {
                traverse(child, callback);
            }
        });
    }

    /**
     * Recursively renames internal fields inside multifield following pattern
     * {multifield name}/item{index}/{field name}
     * @param {HTMLElement} multifield - main element to perform name change
     * @param {String} prefix - forced prefix to use
     */
    function changeNames(multifield, prefix) {
        var $multifield = $(multifield);
        var isParentComposite = $multifield.is(COMPOSITE_MULTIFIELD_SELECTOR);
        var parentName = $multifield.adaptTo("foundation-field").getName();
        var itemPrefix = prefix || parentName;

        // not able to construct proper composite path
        if (!itemPrefix) {
            return;
        }

        multifield.items.getAll().forEach(function(item, i) {
            // clear item prefix for this iteration
            itemPrefix = prefix || parentName;

            if (isParentComposite) {
                itemPrefix += "/item" + i + "/";
            }

            traverse($(item), function(el) {
                var field = $(el);
                var fieldAPI = field.adaptTo("foundation-field");

                if (!fieldAPI) {
                    return;
                }

                if (!fieldAPI.setName) {
                    throw new Error("The field doesn't support FoundationField#setName");
                }

                var name = field.data("cachedName");

                if (!name) {
                    name = fieldAPI.getName();
                    field.data("cachedName", name);
                }

                if (!name) {
                    return;
                }

                var finalName = itemPrefix + name;
                fieldAPI.setName(finalName);

                // if our field is multifield we need to change its fields
                if (field.is(MULTIFIELD_SELECTOR)) {
                    if (field.is(COMPOSITE_MULTIFIELD_SELECTOR)) {
                        changeNames(el, finalName);
                    } else {
                        changeNames(el, itemPrefix);
                    }
                }
            });
        });
    }

    // Initialize multifield items added by JS
    $(document).on("coral-collection:add", "coral-multifield", function(event) {
        if (this === event.target) {
            // We need one more frame to make sure the item renders the template in the DOM
            Coral.commons.nextFrame(function() {
                $(this).trigger("foundation-contentloaded");
            }.bind(this));
        }
    });

    // change composite names on item manipulation
    $(document).on("coral-collection:add coral-collection:remove coral-multifield:itemorder",
        COMPOSITE_MULTIFIELD_SELECTOR, function() {
            Coral.commons.ready(this, function(el) {
                changeNames(el, "");
            });
        });

    // change composite names on initialization
    $(document).on("foundation-contentloaded", function(e) {
        var composites = $(COMPOSITE_MULTIFIELD_SELECTOR, e.target);
        composites.each(function() {
            Coral.commons.ready(this, function(el) {
                changeNames(el, "");
            });
        });
    });
})(window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, window, $) {
    "use strict";

    $(document).on("foundation-mode-change", function(e, mode, group) {
        if (mode !== "default" && mode !== "edit") {
            return;
        }

        $(".foundation-layout-form").each(function() {
            var el = $(this);

            if (group === el.data("foundationModeGroup")) {
                var edit = mode === "edit";

                el
                    .toggleClass("foundation-layout-form-mode-edit", edit)
                    .toggleClass("foundation-layout-form-mode-default", !edit);
            }
        });
    });
})(document, window, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $, Coral, URITemplate) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");
    var MODE_SELECTION = "selection";
    var MODE_DEFAULT = "default";

    function handleMode(collection, config) {
        var modeChangeHandler = function(e, mode, group) {
            if (e._foundationLayoutMasonry) {
                return;
            }
            if (mode !== MODE_DEFAULT && mode !== MODE_SELECTION) {
                return;
            }
            if (collection[0].dataset.foundationModeGroup !== group) {
                return;
            }

            changeMode(collection, config, mode);
        };

        $(document).on("foundation-mode-change", modeChangeHandler);

        var handleTouchEvent = function(e) {
            if (e.originalEvent.touches.length > 1) {
                return;
            }

            if (collection.data("foundation-layout-masonry.internal.isSelectionMode")) {
                return;
            }

            var coordinateErrorMargin = 10;
            var ns = ".foundation-layout-masonry-touch";

            var initialTouch = e.originalEvent.touches[0];
            initialTouch = {
                x: initialTouch.clientX,
                y: initialTouch.clientY
            };

            var itemEl = this;

            var timer = setTimeout(function() {
                $(document).off(ns);

                var api = collection.adaptTo("foundation-selections");
                api.select(itemEl);

                $(itemEl).data("foundation-layout-masonry.internal.avoidSelecting", true);
            }, 500);

            var cancel = function() {
                clearTimeout(timer);
                $(document).off(ns);
            };

            $(document)
                .on("touchmove" + ns, function(e) {
                    var touch = e.originalEvent.touches[0];

                    if (Math.abs(touch.clientX - initialTouch.x) > coordinateErrorMargin ||
                            Math.abs(touch.clientY - initialTouch.y) > coordinateErrorMargin) {
                        cancel();
                    }
                })
                .on("touchend" + ns, cancel)
                .on("touchcancel" + ns, cancel);
        };

        var handlePointerEvent = function(e) {
            if (e.originalEvent.button !== 0 || !e.originalEvent.isPrimary) {
                return;
            }

            if (collection.data("foundation-layout-masonry.internal.isSelectionMode")) {
                return;
            }

            var coordinateErrorMargin = 10;
            var ns = ".foundation-layout-masonry-pointer";

            var initialPoint = {
                x: e.originalEvent.clientX,
                y: e.originalEvent.clientY
            };

            var itemEl = this;

            var timer = setTimeout(function() {
                $(document).off(ns);

                var api = collection.adaptTo("foundation-selections");
                api.select(itemEl);

                $(itemEl).data("foundation-layout-masonry.internal.avoidSelecting", true);
            }, 500);

            var cancel = function() {
                clearTimeout(timer);
                $(document).off(ns);
            };

            $(document)
                .on("pointermove" + ns, function(e) {
                    if (Math.abs(e.originalEvent.clientX - initialPoint.x) > coordinateErrorMargin ||
                            Math.abs(e.originalEvent.clientY - initialPoint.y) > coordinateErrorMargin) {
                        cancel();
                    }
                })
                .on("pointerup" + ns, cancel)
                .on("pointercancel" + ns, cancel);
        };

        if (navigator.pointerEnabled) {
            collection.on("pointerdown", "coral-masonry-item", handlePointerEvent);
        } else {
            collection.on("touchstart", "coral-masonry-item", handleTouchEvent);
        }

        return function() {
            $(document).off("foundation-mode-change", modeChangeHandler);
            collection.off("touchstart", "coral-masonry-item", handleTouchEvent);
            collection.off("pointerdown", "coral-masonry-item", handlePointerEvent);
        };
    }

    function handleOrderingRequest(collection, config) {
        var orderChanged = function(e) {
            var detail = e.originalEvent.detail;

            var dragItem = detail.item;
            var dragAction = dragItem.dragAction;

            var dropZone = dragAction.dropZone;

            var before = detail.before;
            var oldBefore = detail.oldBefore;

            var action = config.itemReorderAction;

            if (!action) {
                return;
            }

            var beforeId = before ? before.dataset.foundationCollectionItemId : undefined;
            var beforeName = beforeId ? beforeId.substring(beforeId.lastIndexOf("/") + 1) : undefined;

            var rawURL = URITemplate.expand(action, {
                item: dragItem.dataset.foundationCollectionItemId,
                before: beforeId,
                beforeName: beforeName
            });

            var url = rawURL;
            var data;

            var index = rawURL.indexOf("?");
            if (index >= 0) {
                url = rawURL.substring(0, index);
                data = rawURL.substring(index + 1);
            }

            var ui = $(window).adaptTo("foundation-ui");

            ui.wait();

            $.ajax({
                url: url,
                method: "POST",
                data: data
            }).always(function() {
                ui.clearWait();
                trackEvent("order", collection, config, dragItem, { before: beforeId });
            }).fail(function(jqXHR, textStatus, errorThrown) {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Fail to reorder.");

                trackEvent("order-error", collection, config, dragItem, { before: beforeId, errorMsg: errorThrown });

                ui.alert(title, message, "error");

                if (oldBefore) {
                    $(dragItem).insertBefore(oldBefore.nextSibling);
                } else {
                    $(dragItem).insertBefore(dropZone.firstChild);
                }
            });
        };

        collection.on("coral-masonry:order", orderChanged);

        return function() {
            collection.off("coral-masonry:order", orderChanged);
        };
    }

    function handleDragging(collection, config) {
        var drag = function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
        };

        collection[0].addEventListener("coral-dragaction:dragend", drag, true);

        return function() {
            collection[0].removeEventListener("coral-dragaction:dragend", drag, true);
        };
    }

    function handleSelection(collection, config) {
        var perform = function(item) {
            var toBeSelected = !item.hasClass("foundation-selections-item");
            var api = collection.adaptTo("foundation-selections");

            if (toBeSelected) {
                var selectionMode = collection[0].dataset.foundationSelectionsMode;

                if (selectionMode === "single") {
                    collection.children(".foundation-selections-item")
                        .removeClass("foundation-selections-item")
                        .prop("selected", false);
                }

                api.select(item[0]);
            } else {
                api.deselect(item[0]);
            }
        };

        var click = function(e) {
            var item = $(e.target).closest(".foundation-collection, .foundation-collection-item, coral-quickactions");

            if (!item.hasClass("foundation-collection-item")) {
                return;
            }

            var isSelectionMode = collection.data("foundation-layout-masonry.internal.isSelectionMode");

            if (!isSelectionMode) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (item.data("foundation-layout-masonry.internal.avoidSelecting")) {
                item.removeData("foundation-layout-masonry.internal.avoidSelecting");
                return;
            }

            perform(item);
        };

        var keydown = function(e) {
            var SPACE = Coral.Keys.keyToCode("space");

            if (e.keyCode !== SPACE) {
                return;
            }

            var item = $(e.target);

            if (!item.is("coral-masonry-item")) {
                return;
            }

            e.preventDefault(); // prevent default UA behaviour such as scrolling

            perform(item);
        };

        var escape = function() {
            if (document.activeElement === collection[0] || collection[0].contains(document.activeElement)) {
                collection.adaptTo("foundation-selections").clear();
            }
        };

        collection[0].addEventListener("click", click, true);
        collection.on("keydown", "coral-masonry-item.foundation-collection-item", keydown);
        Coral.keys.on("escape", escape);

        return function() {
            collection[0].removeEventListener("click", click, true);
            collection.off("keydown", "coral-masonry-item.foundation-collection-item", keydown);
            Coral.keys.off("escape", escape);
        };
    }

    /**
     * @param {boolean} initiator <code>true</code> if we initiate the mode change.
     */
    function changeMode(collection, config, mode, initiator) {
        var isSelection = mode === MODE_SELECTION;
        var prevValue = collection.data("foundation-layout-masonry.internal.isSelectionMode");

        if (prevValue === isSelection) {
            return;
        }

        if (!initiator && !isSelection) {
            collection.children(".foundation-selections-item")
                .removeClass("foundation-selections-item")
                .prop("selected", false);
        }

        collection.data("foundation-layout-masonry.internal.isSelectionMode", isSelection);

        // Configure masonry (parent) with class to indicate that masonry-items are selectable
        if (mode === MODE_SELECTION) {
            collection.addClass("is-selectable");
        } else {
            collection.removeClass("is-selectable");
        }

        if (initiator) {
            var group = collection[0].dataset.foundationModeGroup;

            if (!group) {
                return;
            }

            var e = $.Event("foundation-mode-change");
            // Mark the event so that our own handler can detect if it is triggered by us or not.
            e._foundationLayoutMasonry = true;

            collection.trigger(e, [ mode, group ]);
        }
    }

    function handlePagination(collection, config) {
        var src = collection[0].dataset.foundationCollectionSrc;

        // hasMore is true by default
        var hasMore = collection[0].dataset.foundationLayoutMasonryHasmore !== "false";

        if (!src) {
            return;
        }

        var scrollContainer = config.scrollSrc ? collection.closest(config.scrollSrc) : collection.parent();

        var Paginator = $(window).adaptTo("foundation-util-paginator");

        function wait() {
            collection[0].dataset.graniteCollectionIsLoading = true;

            return {
                clear: function() {
                    collection[0].dataset.graniteCollectionIsLoading = false;
                }
            };
        }

        var paginator = new Paginator({
            el: scrollContainer,
            limit: config.limit || 20,
            wait: wait,
            resolveURL: function(paginator) {
                return URITemplate.expand(src, {
                    offset: paginator.offset,
                    limit: paginator.limit,
                    id: collection[0].dataset.foundationCollectionId
                });
            },
            processResponse: function(paginator, html) {
                var deferred = $.Deferred();

                var parser = $(window).adaptTo("foundation-util-htmlparser");

                collection[0].dataset.graniteCollectionIsLoading = true;
                parser.parse(html).then(function(fragment) {
                    var el = $(fragment).children();

                    if (!el.hasClass("foundation-collection")) {
                        return;
                    }

                    var items = el.children(".foundation-collection-item").toArray();

                    var collectionApi = collection.adaptTo("foundation-collection");
                    collectionApi.append(items);

                    var hasMore = el[0].dataset.foundationLayoutMasonryHasmore;
                    if (hasMore === "true") {
                        hasMore = true;
                    } else if (hasMore === "false") {
                        hasMore = false;
                    } else {
                        hasMore = items.length >= paginator.limit;
                    }

                    collection[0].dataset.graniteCollectionIsLoading = false;
                    deferred.resolve({
                        length: items.length,
                        hasNext: hasMore
                    });
                });

                return deferred.promise();
            },
            onNewPage: function() {
                collection.trigger("foundation-collection-newpage");
                trackEvent("newpage", collection, config);
            }
        });

        collection.data("foundation-layout-masonry.internal.paginator", paginator);

        var offset = collection.children(".foundation-collection-item").length;
        paginator.start(offset, hasMore, false, 500);

        return function() {
            paginator.destroy();
            collection.removeData("foundation-layout-masonry.internal.paginator");
        };
    }

    function handleNavigation(collection, config) {
        var navigate = function(itemEl) {
            collection.adaptTo("foundation-collection-item-action").execute(itemEl);
        };

        var click = function(e) {
            // Clicking the item means navigate.
            // This is annoying feature as you have to check if the event target is part of actionable element.

            var item = $(e.target).closest("button, a, coral-quickactions-item, .foundation-collection-item");

            if (item.hasClass("foundation-layout-masonry-cardwrapper")) {
                if (e.which === 1 && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    navigate(item.closest(".foundation-collection-item")[0]);
                }
                return;
            }

            if (item.hasClass("foundation-collection-item")) {
                e.preventDefault();
                navigate(item[0]);
            }
        };

        var keydown = function(e) {
            var ENTER = Coral.Keys.keyToCode("enter");

            if (e.keyCode !== ENTER || !$(e.target).is("coral-masonry-item")) {
                return;
            }

            if (!collection.data("foundation-layout-masonry.internal.isSelectionMode")) {
                navigate(e.target);
            }
        };

        collection.on("click", ".foundation-collection-item", click);
        collection.on("keydown", "coral-masonry-item", keydown);

        return function() {
            collection.off("click", ".foundation-collection-item", click);
            collection.off("keydown", "coral-masonry-item", keydown);
        };
    }

    function handleQuickactions(collection, config) {
        var overlay = function(e) {
            var isSelectionMode = collection.data("foundation-layout-masonry.internal.isSelectionMode");

            if (isSelectionMode) {
                e.preventDefault();
            }
        };

        var quickaction = function(e) {
            var target = e.explicitOriginalTarget;
            // For ff we need explicitly stop it.
            if (target.parentNode.nodeName === "CORAL-QUICKACTIONS" &&
                (target.matches("button[is='coral-button']") || target.matches("a[is='coral-anchorbutton']"))) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            var item = $(e.target).closest(".foundation-collection-item");

            var quickactions = item.find("coral-quickactions");
            if (quickactions.length) {
                quickactions[0].open = !quickactions[0].open;
            }
        };

        collection.on("coral-overlay:beforeopen", "coral-quickactions", overlay);
        collection[0].addEventListener("coral-dragaction:dragstart", quickaction, true);
        collection[0].addEventListener("coral-dragaction:dragend", quickaction, true);

        return function() {
            collection.off("coral-overlay:beforeopen", "coral-quickactions", overlay);
            collection[0].removeEventListener("coral-dragaction:dragstart", quickaction, true);
            collection[0].removeEventListener("coral-dragaction:dragend", quickaction, true);
        };
    }

    /**
     * Temporary solution to make wrap the card in a <a>.
     * This is done so that the user can leverage the native <a> behaviour,
     * such as opening the card/item in a new browser tab.
     *
     * This is temporary solution because the concept of wrapping the rich widget like card
     * in an <a> may not be a11y prove.
     * So once we review a11y, it may revamp the card itself.
     */
    function convertCard(collection) {
        var titleEl = document.querySelector(".granite-collection-pagetitle");

        collection.find("coral-card.foundation-collection-navigator").wrap(function() {
            var navigator = $(this);

            if (navigator.parent("a").length) {
                return;
            }

            var el = document.createElement("a");
            el.className = "foundation-layout-masonry-cardwrapper";
            // Make the <a> unfocusable as coral-masonry-item has the focus already.
            // Otherwise the behaviour is confusing.
            el.tabIndex = -1;

            var href = navigator[0].dataset.foundationCollectionNavigatorHref;

            if (href) {
                el.target = navigator[0].dataset.foundationCollectionNavigatorTarget;
            } else {
                if (!titleEl) {
                    return;
                }
                if (!collection.is(titleEl.dataset.graniteCollectionPagetitleTarget)) {
                    return;
                }
                href = URITemplate.expand(titleEl.dataset.graniteCollectionPagetitleSrc, {
                    id: navigator.closest(".foundation-collection-item")[0].dataset.foundationCollectionItemId
                });
            }

            el.href = href;

            return $(el);
        });
    }

    /**
     * Track events on Masonry Component.
     *
     * @param {string} eventName
     * @param {jQuery} collection
     * @param {Object} config
     * @param {HTMLElement=} collectionItem
     * @param {Object=} attributes
     */
    function trackEvent(eventName, collection, config, collectionItem, attributes) {
        var eventType = (eventName === "change" ? "masonry-item" : "masonry");
        var collectionEl = collection.get(0);
        var elementValue = collectionEl && collectionEl.dataset && collectionEl.dataset.foundationCollectionId ||
            (config && config.trackingElement) || "";
        if (collectionItem && collectionItem.dataset && collectionItem.dataset.foundationCollectionItemId) {
            elementValue = collectionItem.dataset.foundationCollectionItemId;
        } else if (!collectionItem && eventName === "change") {
            elementValue = "";
        }

        var trackingElement = (config && config.trackingElement) || "";
        var trackingFeature = (config && config.trackingFeature) || "";

        var trackData = {
            element: elementValue,
            type: eventType,
            action: eventName,
            widget: {
                name: trackingElement,
                type: "masonry"
            },
            feature: trackingFeature
        };
        if (attributes) {
            trackData.attributes = attributes;
        }

        $(window).adaptTo("foundation-tracker").trackEvent(trackData);
    }

    /**
     * Selects the given array of collection items without triggering Coral events.
     * @param items an array of collection items
     */
    function selectGivenItemsSilently(items) {
        items.forEach(function(element) {
            element.set("selected", true, true);
            element.classList.add("foundation-selections-item");
        });
    }

    registry.register("foundation.layouts", {
        name: "foundation-layout-masonry",
        doLayout: function(el, config) {
            var collection = $(el);

            // foundation-layout-masonry is exclusive to manage the layout of foundation-collection only
            if (!collection.hasClass("foundation-collection")) {
                return;
            }

            if (collection.data("foundation-layout-masonry.internal.init")) {
                return;
            }

            trackEvent("init", collection, config);

            var stack = [];

            stack.push((function() {
                collection.data("foundation-layout-masonry.internal.stack", stack);

                return function() {
                    collection.removeData("foundation-layout-masonry.internal.stack");
                };
            })());

            stack.push((function() {
                collection.data("foundation-layout-masonry.internal.init", true);

                return function() {
                    collection.removeData("foundation-layout-masonry.internal.init");
                };
            })());

            stack.push(handleMode(collection, config));
            stack.push(handleSelection(collection, config));
            stack.push(handlePagination(collection, config));
            stack.push(handleNavigation(collection, config));
            stack.push(handleQuickactions(collection, config));
            stack.push(handleDragging(collection, config));
            stack.push(handleOrderingRequest(collection, config));

            convertCard(collection);

            var selectionIds = collection.data("foundation-layout-collection-switcher.internal.selectionIds");
            var selections = $();

            if (selectionIds) {
                selections = collection.children(".foundation-collection-item").filter(function() {
                    return selectionIds.indexOf(this.dataset.foundationCollectionItemId) >= 0;
                });

                selections.each(function() {
                    $(this).attr("selected", "").addClass("foundation-selections-item");
                });
            }

            var mode = config.selectionMode || selections.length ? MODE_SELECTION : MODE_DEFAULT;

            requestAnimationFrame(function() {
                // trigger collection event after Coral upgrade
                changeMode(collection, config, mode, true);
                collection.trigger("foundation-collection-newpage");
                trackEvent("newpage", collection, config);
                collection.trigger("foundation-selections-change");
                trackEvent("change", collection, config, null, { method: "init" });
            });
        },
        clean: function(el, config) {
            var collection = $(el);
            collection.siblings(".granite-collection-loading-title-wrapper").remove();

            var stack = collection.data("foundation-layout-masonry.internal.stack");
            if (stack) {
                Granite.UI.Foundation.Utils.everyReverse(stack, function(v) {
                    if (v) {
                        v();
                    }
                    return true;
                });
            }

            collection.removeData("foundation-layout-masonry.internal.isSelectionMode");

            Granite.UI.Foundation.Layouts.clean(el);
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-collection",
        selector: ".foundation-layout-masonry.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var LazyLoader = $(window).adaptTo("foundation-util-lazyloader");
            var lazyLoader = new LazyLoader(el);

            var load = function(id, limit, restoreSelection) {
                var src = el.dataset.foundationCollectionSrc;

                if (!limit) {
                    var config = collection.data("foundationLayout");
                    limit = config.limit || 20;
                }

                var url = URITemplate.expand(src, {
                    offset: 0,
                    limit: limit,
                    id: id
                });

                return $.ajax({
                    url: url,
                    cache: false
                }).then(function(html) {
                    var deferred = $.Deferred();

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(html).then(function(fragment) {
                        var newCollection = $(fragment).children();

                        if (!newCollection.hasClass("foundation-collection")) {
                            deferred.reject(new Error("Invalid content"));
                            return;
                        }

                        if (restoreSelection) {
                            var selectionIds = collection.children(".foundation-selections-item").map(function() {
                                return this.dataset.foundationCollectionItemId;
                            }).toArray();

                            // Temporary solution to restore selection without triggering
                            // "foundation-selections-change" twice
                            newCollection.data(
                                "foundation-layout-collection-switcher.internal.selectionIds",
                                selectionIds
                            );
                        }

                        collection.trigger("foundation-collection-reload");
                        trackEvent("reload", collection, config);

                        Granite.UI.Foundation.Layouts.cleanAll(el);

                        // TBD to reuse the collection element, instead of creating a new one.
                        newCollection.replaceAll(collection);

                        requestAnimationFrame(function() {
                            // trigger collection event after Coral upgrade
                            newCollection.trigger("foundation-collection-navigate");
                            trackEvent("navigate", collection, config);
                        });

                        newCollection.trigger("foundation-contentloaded");

                        if (restoreSelection) {
                            newCollection.removeData("foundation-layout-collection-switcher.internal.selectionIds");
                        }

                        deferred.resolve(newCollection);
                    });

                    return deferred.promise();
                }, function() {
                    var title = Granite.I18n.get("Error");
                    var message = Granite.I18n.get("Fail to load data.");

                    var ui = $(window).adaptTo("foundation-ui");
                    ui.alert(title, message, "error");
                });
            };

            return {
                append: function(items) {
                    collection.append(items);
                    // auto select all the new loaded collection items when in select all mode
                    if (el.dataset.foundationSelectionsSelectallMode && items.length) {
                        items.forEach(function(element) {
                            if (!element.classList.contains("is-lazyLoaded") &&
                                !element.classList.contains("is-pending")) {
                                element.set("selected", true, true);
                                element.classList.add("foundation-selections-item");
                            }
                        });
                        lazyLoader.loadItems(items).then(function(loadedItems) {
                            selectGivenItemsSilently(loadedItems);
                            collection.trigger("foundation-selections-change");
                        });
                    }
                    convertCard(collection);
                    collection.trigger("foundation-contentloaded");
                },
                clear: function() {
                    collection.children(".foundation-collection-item").remove();
                },
                getPagination: function() {
                    var paginator = collection.data("foundation-layout-masonry.internal.paginator");
                    if (!paginator) {
                        return null;
                    }

                    var guessTotal = Number(collection.attr("data-foundation-layout-masonry-guesstotal"));

                    var hasNext;
                    if (!guessTotal) {
                        hasNext = paginator.hasNext;
                    } else if (paginator.offset >= guessTotal) {
                        hasNext = paginator.hasNext;
                    } else {
                        hasNext = null;
                    }

                    return {
                        offset: paginator.offset,
                        limit: paginator.limit,
                        guessTotal: Math.max(paginator.offset, guessTotal),
                        hasNext: hasNext
                    };
                },
                load: function(id) {
                    return load(id);
                },
                reload: function() {
                    var limit;

                    var pagination = this.getPagination();
                    if (pagination) {
                        limit = pagination.offset;
                    }
                    return load(el.dataset.foundationCollectionId, limit, true);
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-collection-meta",
        selector: ".foundation-layout-masonry.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var meta = collection.children(".foundation-collection-meta");
            var metaEl = meta[0];

            if (!metaEl) {
                return null;
            }

            return {
                getElement: function() {
                    return metaEl;
                },
                getTitle: function() {
                    return metaEl.dataset.foundationCollectionMetaTitle;
                },
                getThumbnail: function() {
                    return meta.children(".foundation-collection-meta-thumbnail")[0];
                },
                isFolder: function() {
                    return metaEl.dataset.foundationCollectionMetaFolder === "true";
                },
                getRelationship: function() {
                    return metaEl.dataset.foundationCollectionMetaRel;
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-selections",
        selector: ".foundation-layout-masonry.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var LazyLoader = $(window).adaptTo("foundation-util-lazyloader");
            var lazyLoader = new LazyLoader(el);
            var config = collection.data("foundationLayout");

            return {
                count: function() {
                    if (el.dataset.foundationSelectionsSelectallMode) {
                        var collectionAPI = collection.adaptTo("foundation-collection");
                        var paginationAPI = collectionAPI.getPagination();
                        if (paginationAPI && paginationAPI.guessTotal) {
                            var deselectedItemsCount =
                                collection.find(".foundation-collection-item:not(.foundation-selections-item)").length;
                            return paginationAPI.guessTotal - deselectedItemsCount;
                        }
                    }
                    return collection.children(".foundation-selections-item").length;
                },

                selectAll: function(suppressEvent) {
                    // select all the collection items except the placeholders
                    collection.children(".foundation-collection-item:not(.is-lazyLoaded):not(.is-pending)")
                        .addClass("foundation-selections-item")
                        .prop("selected", true);
                    // load placeholders if any available
                    var placeholders = collection.children(".foundation-collection-item.is-lazyLoaded," +
                        ".foundation-collection-item.is-pending");
                    if (placeholders.length > 0) {
                        // Classic ui.wait() method cannot do its job here. lazy loading a large number of items will
                        // block the UI thread so the wait animation will just be frozen, looking like strange UI
                        // artifacts. so just use a plain back drop, no animation.
                        var maskEl = $(document.createElement("div")).addClass("foundation-ui-mask")
                            .append('<coral-wait size="L" centered/>');
                        maskEl.appendTo(document.body);

                        lazyLoader.loadItems(placeholders.toArray()).then(function(loadedItems) {
                            selectGivenItemsSilently(loadedItems);
                            maskEl.detach();
                            if (!suppressEvent) {
                                collection.trigger("foundation-selections-change");
                                trackEvent("change", collection, config, null, { method: "selectAll" });
                            }
                        });
                    } else {
                        if (!suppressEvent) {
                            collection.trigger("foundation-selections-change");
                            trackEvent("change", collection, config, null, { method: "selectAll" });
                        }
                    }

                    changeMode(collection, config, MODE_SELECTION, true);
                },

                clear: function(suppressEvent) {
                    collection.children(".foundation-selections-item")
                        .removeClass("foundation-selections-item")
                        .prop("selected", false);

                    if (!suppressEvent) {
                        collection.trigger("foundation-selections-change");
                        trackEvent("change", collection, config, null, { method: "clear" });
                    }

                    if (config.autoDefaultMode) {
                        changeMode(collection, config, MODE_DEFAULT, true);
                    }
                },

                select: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) {
                        return;
                    }

                    changeMode(collection, collection.data("foundationLayout"), MODE_SELECTION, true);

                    el.selected = true;
                    item.addClass("foundation-selections-item");
                    collection.trigger("foundation-selections-change");
                    trackEvent("change", collection, config, el, { method: "select" });
                },

                deselect: function(el) {
                    var item = $(el);

                    if (!item.is(".foundation-collection-item")) {
                        return;
                    }

                    el.selected = false;
                    item.removeClass("foundation-selections-item");
                    collection.trigger("foundation-selections-change");
                    trackEvent("change", collection, config, el, { method: "deselect" });

                    if (config.autoDefaultMode && !collection.find(".foundation-selections-item").length) {
                        changeMode(collection, config, MODE_DEFAULT, true);
                    }
                },

                isAllSelected: function() {
                    var isSelectAllMode = el.dataset.foundationSelectionsSelectallMode;
                    var collectionAPI = collection.adaptTo("foundation-collection");
                    var paginationAPI = collectionAPI.getPagination();
                    var hasItemsToLoad = paginationAPI ? paginationAPI.hasNext : false;
                    // we need to ignore elements about to be removed from the masonry
                    var itemsCount = collection.children(".foundation-collection-item:not(.is-removing)").length;
                    var selectedItemsCount = collection.children(".foundation-selections-item").length;
                    if (itemsCount > 0) {
                        // when everything loaded in the UI is selected
                        if (itemsCount === selectedItemsCount) {
                            // in select all mode everything is or will be selected
                            if (isSelectAllMode) {
                                return true;
                            } else {
                                return !hasItemsToLoad;
                            }
                        }
                    }
                    return false;
                }
            };
        }
    });
})(window, document, Granite, Granite.$, Coral, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, Granite, $, URITemplate, Coral) {
    "use strict";

    var wizardResizeListeners = new WeakMap();

    var registry = $(window).adaptTo("foundation-registry");

    function getURITemplateVariables(containers) {
        var o = {};

        // TODO Review the usage of ":input" to change it to select the logical field.
        containers.find(":input").each(function() {
            var el = $(this);

            el.serializeArray().forEach(function(input) {
                var name = input.name;
                var value = input.value;

                var newValue;
                if (o.hasOwnProperty(name)) {
                    var a = o[name];

                    if (!Array.isArray(a)) {
                        a = [ a ];
                    }

                    a.push(value);
                    newValue = a;
                } else {
                    newValue = value;
                }

                o[name] = newValue;

                var parent = $(el).attr("data-foundation-uritemplate-parent");
                if (parent) {
                    var p = o[parent] = o[parent] || {};
                    p[name] = o[name];
                }
            });
        });

        return o;
    }

    function validate(step) {
        if (step.data("foundationWizardStepValidation") === false) {
            return true;
        }

        // TODO For now, let's just access private data of others for prechecked
        // Once it is confirmed that this is what we want, we can simply expose adaptTo for prechecked validation
        // e.g. `var isValidPrechecked = step.adaptTo("foundation-validation-prechecked").isValid();`
        var isValidPrechecked = step.data("foundation-wizard-step.internal.valid");

        if (isValidPrechecked !== undefined) {
            return isValidPrechecked;
        }

        var allValid = true;

        step.adaptTo("foundation-validation-helper").getSubmittables().forEach(function(v) {
            var api = $(v).adaptTo("foundation-validation");

            if (!api.checkValidity()) {
                allValid = false;
            }

            api.updateUI();
        });

        return allValid;
    }

    function getObsoleteSteps(current) {
        var result = [];

        // get previously loaded steps and their chains
        var loaded = current.data("foundation-wizard-step.internal.children");
        if (loaded) {
            loaded.each(function() {
                var step = $(this);

                var actualStep = step.data("foundation-layout-wizard2.internal.actualStep");
                if (!actualStep) {
                    actualStep = step;
                }

                result.push(actualStep);

                $.merge(result, getObsoleteSteps(step));
            });
        }

        return result;
    }

    function goNextStep(wizard, current, control) {
        if (!validate(current)) {
            return;
        }

        var wizardApi = wizard.adaptTo("foundation-wizard");

        var src = control.data("foundationWizardControlSrc");

        if (!src) {
            wizardApi.next();
            return;
        }

        var stepsForValues = $(wizardApi.getPrevSteps(current[0])).add(current);
        var values = getURITemplateVariables(stepsForValues);
        var url = URITemplate.expand(src, values);

        var LAST_URL_KEY = "foundation-wizard-control.internal.lastURL";

        var lastURL = control.data(LAST_URL_KEY);

        if (lastURL === url) {
            wizardApi.next();
            return;
        }

        control.data(LAST_URL_KEY, url);

        var ui = $(window).adaptTo("foundation-ui");
        ui.wait();

        $.ajax({
            url: url,
            cache: false
        }).done(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            parser.parse(html).then(function(fragment) {
                var steps = $(fragment.querySelectorAll(".foundation-wizard-step"));

                wizardApi.remove(getObsoleteSteps(current));

                // save new ones
                current.data("foundation-wizard-step.internal.children", steps);

                wizardApi.appendAfter(steps.toArray(), current[0]);
                wizardApi.next();

                ui.clearWait();
            });
        })
            .fail(function() {
                ui.clearWait();

                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Something went wrong.");
                ui.alert(title, message, "error");
            });
    }

    function handleChange(wizard) {
        var f = function(e) {
            var control = $(this);
            var action = control.data("foundationWizardControlAction");

            var panel = control.closest("coral-panel");
            if (!panel.prop("selected")) {
                e.preventDefault();
                return;
            }

            var currentStep = wizard.find(".foundation-wizard-step-active");

            if (action === "next") {
                if (control.prop("type") === "button") {
                    e.preventDefault();
                }

                goNextStep(wizard, currentStep, control);
            } else if (action === "prev") {
                e.preventDefault();

                var wizardApi = wizard.adaptTo("foundation-wizard");
                wizardApi.prev();
            }
        };

        wizard.on("click", ".foundation-wizard-control", f);

        return function() {
            wizard.off("click", ".foundation-wizard-control", f);
        };
    }

    registry.register("foundation.layouts", {
        name: "foundation-layout-wizard2",
        doLayout: function(el, config) {
            registerResize(el);
            var wizard = $(el);

            // foundation-layout-wizard2 is exclusively managing the layout of foundation-wizard only
            if (!wizard.hasClass("foundation-wizard")) {
                return;
            }

            if (wizard.data("foundation-layout-wizard2.internal.init") === true) {
                return;
            }

            var stack = [];

            stack.push((function() {
                wizard.data("foundation-layout-wizard2.internal.stack", stack);

                return function() {
                    wizard.removeData("foundation-layout-wizard2.internal.stack");
                };
            })());

            stack.push((function() {
                wizard.data("foundation-layout-wizard2.internal.init", true);

                return function() {
                    wizard.removeData("foundation-layout-wizard2.internal.init");
                };
            })());

            stack.push(handleChange(wizard));

            var firstStep = wizard.find(".foundation-wizard-step").first();
            if (firstStep.length) {
                requestAnimationFrame(function() {
                    firstStep.addClass("foundation-wizard-step-active");
                    wizard.trigger("foundation-wizard-stepchange", [ firstStep[0] ]);
                });
            }
        },
        clean: function(el, config) {
            cleanResize(el);

            var stack = $(el).data("foundation-layout-wizard2.internal.stack");
            if (stack) {
                Granite.UI.Foundation.Utils.everyReverse(stack, function(v) {
                    if (v) {
                        v();
                    }
                    return true;
                });
            }

            Granite.UI.Foundation.Layouts.clean(el);
        }
    });


    registry.register("foundation.adapters", {
        type: "foundation-wizard",
        selector: ".foundation-layout-wizard2.foundation-wizard",
        adapter: function(el) {
            var wizard = $(el);

            var extractStep = function(step) {
                var title = step.attr("data-foundation-wizard-step-title");
                var controls = step.children(".foundation-wizard-control")
                    .detach()
                    .addClass("foundation-layout-inline2-item");

                var stepContent = step.children(".foundation-wizard-step-content")
                    .removeClass("foundation-wizard-step-content")
                    .addClass("foundation-wizard-step");
                if (stepContent.length === 0) {
                    stepContent = step;
                } else {
                    step.data("foundation-layout-wizard2.internal.actualStep", stepContent);
                }

                var wrapper = new Coral.Panel();
                stepContent.appendTo(wrapper.content);

                var inlineWrapper = document.createElement("div");
                inlineWrapper.className = "foundation-layout-inline2 foundation-layout-inline2-gap";
                var control = new Coral.Panel();
                control.content.appendChild(inlineWrapper);
                controls.appendTo(inlineWrapper);

                return {
                    step: new Coral.Step().set({
                        label: {
                            textContent: title
                        }
                    }),
                    content: wrapper,
                    control: control
                };
            };

            // WARNING: The methods provided below MUST take into consideration
            // when the Coral element is not yet upgraded.

            return {
                toggleNext: function(enable) {
                    this.toggle("next", enable);
                },

                togglePrev: function(enable) {
                    this.toggle("prev", enable);
                },

                toggleCancel: function(enable) {
                    this.toggle("cancel", enable);
                },

                toggle: function(action, enable) {
                    // eslint-disable-next-line max-len
                    var button = wizard.find(".foundation-layout-wizard2-controls > coral-panel[selected] .foundation-wizard-control[data-foundation-wizard-control-action=" + action + "]");
                    button.prop("disabled", !enable);
                },

                next: function() {
                    var current = wizard.find(".foundation-layout-wizard2-contents > coral-panel[selected]");
                    var next = current.next("coral-panel");

                    if (!next.length) {
                        return;
                    }

                    var nextIndex = next.index();

                    wizard.find(".foundation-layout-wizard2-steplist > coral-step").eq(nextIndex).attr("selected", "");
                    next.attr("selected", "");
                    wizard.find(".foundation-layout-wizard2-controls > coral-panel").eq(nextIndex).attr("selected", "");

                    var currentStep = current.find(".foundation-wizard-step").removeClass("foundation-wizard-step-active"); // eslint-disable-line max-len
                    var nextStep = next.find(".foundation-wizard-step").addClass("foundation-wizard-step-active");

                    wizard.trigger("foundation-wizard-stepchange", [ nextStep[0], currentStep[0] ]);
                },

                prev: function() {
                    var current = wizard.find(".foundation-layout-wizard2-contents > coral-panel[selected]");
                    var prev = current.prev("coral-panel");

                    if (!prev.length) {
                        return;
                    }

                    var prevIndex = prev.index();

                    wizard.find(".foundation-layout-wizard2-steplist > coral-step").eq(prevIndex).attr("selected", "");
                    prev.attr("selected", "");
                    wizard.find(".foundation-layout-wizard2-controls > coral-panel").eq(prevIndex).attr("selected", "");

                    var currentStep = current.find(".foundation-wizard-step").removeClass("foundation-wizard-step-active"); // eslint-disable-line max-len
                    var prevStep = prev.find(".foundation-wizard-step").addClass("foundation-wizard-step-active");

                    wizard.trigger("foundation-wizard-stepchange", [ prevStep[0], currentStep[0] ]);
                },

                append: function(steps, index) {
                    var panels = wizard.find(".foundation-layout-wizard2-contents > coral-panel");

                    var refPanel;
                    if (index === undefined) {
                        refPanel = panels[panels.length - 1];
                    } else {
                        refPanel = panels[index];
                    }

                    this.appendAfter(steps, refPanel.querySelector(".foundation-wizard-step"));
                },

                appendAfter: function(steps, refStep) {
                    var stepList = [];
                    var contents = [];
                    var controls = [];

                    steps.forEach(function(v) {
                        var result = extractStep($(v));
                        stepList.push(result.step);
                        contents.push(result.content);
                        controls.push(result.control);
                    });

                    var refPanel = $(refStep).closest("coral-panel");
                    var refIndex = refPanel.index();

                    wizard.find(".foundation-layout-wizard2-steplist > coral-step").eq(refIndex).after(stepList);
                    refPanel.after(contents);
                    wizard.find(".foundation-layout-wizard2-controls > coral-panel").eq(refIndex).after(controls);

                    wizard.trigger("foundation-contentloaded");
                    var resizeController = wizard.data("foundation-layout-wizard2.internal.resizeController");
                    if (resizeController) {
                        resizeController.updateElement(wizard.find(".foundation-layout-wizard2-steplist")[0]);
                    }
                },

                remove: function(steps) {
                    var stepListSteps = wizard.find(".foundation-layout-wizard2-steplist > coral-step");
                    var controlPanels = wizard.find(".foundation-layout-wizard2-controls > coral-panel");
                    var tobeRemoved = [];

                    $(steps).each(function() {
                        var step = $(this);
                        var panel = step.closest("coral-panel");
                        var index = panel.index();

                        tobeRemoved.push(panel[0], stepListSteps[index], controlPanels[index]);
                    });

                    $(tobeRemoved).detach();

                    var resizeController = wizard.data("foundation-layout-wizard2.internal.resizeController");
                    if (resizeController) {
                        resizeController.updateElement(wizard.find(".foundation-layout-wizard2-steplist")[0]);
                    }
                },

                getPrevSteps: function(step) {
                    return $(step)
                        .closest("coral-panel")
                        .prevAll("coral-panel")
                        .find(".foundation-wizard-step")
                        .toArray();
                }
            };
        }
    });

    /**
     * This function takes the container of the wizard and initializes the registerController
     * @param el
     */
    function registerResize(el) {
        var wizard = $(el);
        var resizeController = wizard.data("foundation-layout-wizard2.internal.resizeController");
        if (!resizeController) {
            var stepList = wizard.find(".foundation-layout-wizard2-header > .foundation-layout-wizard2-steplist");
            var title = wizard.find(".foundation-layout-wizard2-header > .foundation-layout-wizard2-title");
            var controls = wizard.find(".foundation-layout-wizard2-header > .foundation-layout-wizard2-controls");

            resizeController = new ResizeController({
                elements: [ new ResizableElement({
                    element: stepList[0],
                    states: [ new ResizableElementState({
                        fn: function(element) {
                            var workingElement = element || this.element;
                            workingElement.setAttribute("size", "L");
                        }
                    }), new ResizableElementState({
                        fn: function(element) {
                            var workingElement = element || this.element;
                            workingElement.setAttribute("size", "S");
                        }
                    }) ]
                }), new ResizableElement({
                    element: title[0]
                }), new ResizableElement({
                    element: controls[0]
                }) ],
                container: stepList[0].parentElement
            });
            resizeController.measureElements().then(function() {
                var listener = function(event) {
                    requestAnimationFrame(function() {
                        resizeController.checkResize();
                    });
                };

                Coral.commons.addResizeListener(el, listener);
                wizardResizeListeners.set(el, listener);

                resizeController.checkResize();
            });
            // Store the resizeController on the wizard;
            wizard.data("foundation-layout-wizard2.internal.resizeController", resizeController);
        }
    }

    function cleanResize(el) {
        if (wizardResizeListeners.get(el)) {
            Coral.commons.removeResizeListener(el, wizardResizeListeners.get(el));
            wizardResizeListeners.delete(el);
        }
        var wizard = $(el);
        var resizeController = wizard.data("foundation-layout-wizard2.internal.resizeController");
        if (resizeController) {
            resizeController.clean();
            $.removeData(wizard, "foundation-layout-wizard2.internal.resizeController");
        }
    }

    /**
     * This holds the state information
     * @param config
     * @constructor
     */
    function ResizableElementState(config) {
        this.fn = config.fn;
    }

    ResizableElementState.prototype.clean = function() {
        this.fn = null;
    };

    /**
     * This is the wrapper class for a ResizableElement
     * @param config
     * @constructor
     */
    function ResizableElement(config) {
        this.element = config.element;
        this.currentState = 0;
        this.measuredWidth = -1;
        this.states = config.states;
    }

    /**
     * Measures an element actual width by making a clone and measuring how much it would expand if it were inline-block
     */
    ResizableElement.prototype.measure = function(applyInitialState) {
        var deferred = $.Deferred();
        var $cloneEl = $(this.element)
            .clone()
            .css({
                display: "inline-block",
                width: "auto",
                visibility: "hidden"
            })
            .appendTo("body");
        if (applyInitialState && this.states && this.states.length) {
            this.states[0].fn.call(this, $cloneEl[0]);
        }
        var self = this;
        Coral.commons.ready(this.element, function() {
            self.previousMeasuredWidth = self.measuredWidth;
            self.measuredWidth = $cloneEl.outerWidth(true);
            deferred.resolve(self.measuredWidth);
            $cloneEl.remove();
        });

        return deferred.promise();
    };

    /**
     * Executes the next states that should shrink the element
     * @returns {boolean}
     */
    ResizableElement.prototype.goToNextState = function() {
        if (this.states && this.states.length && this.currentState < this.states.length - 1) {
            // We can go to another shrink state
            this.states[++this.currentState].fn.call(this);
            return true;
        }
        return false;
    };

    /**
     * Executes the previous state that should grow the element
     * @returns {boolean}
     */
    ResizableElement.prototype.goToPreviousState = function() {
        if (this.states && this.states.length && this.currentState > 0) {
            // We can go to another grow state
            this.states[--this.currentState].fn.call(this);
            return true;
        }

        return false;
    };

    /**
     * Checks if the element overflows regarding to the measured width
     * @returns {boolean}
     */
    ResizableElement.prototype.overflows = function() {
        return this.element.offsetWidth < this.measuredWidth;
    };

    /**
     * Cleans the internal referances
     */
    ResizableElement.prototype.clean = function() {
        this.element = null;
        this.config = null;
        this.states.forEach(function(state) {
            state.clean();
        });
        this.states = null;
    };
    /**
     * The ResizeController handles the management of the ResizeElements
     * It will check for horizontal overflows and notify the ResizeElements if they have to adapt
     * @param config
     * @constructor
     */
    function ResizeController(config) {
        this.config = config;
        this.totalWidth = 0;
        this.elementsMap = new WeakMap();
        for (var i = 0; i < this.config.elements.length; ++i) {
            this.elementsMap.set(this.config.elements[i].element, this.config.elements[i]);
        }
    }

    /**
     * This function measures all the elements and
     * @returns Jquery.Promise this resolves after all elements have been measured and we know their totalWidth
     */
    ResizeController.prototype.measureElements = function() {
        var deferred = $.Deferred();
        var self = this;
        var promises = this.config.elements.map(function(element) {
            return element.measure();
        });

        $.when.apply($, promises).then(function() {
            for (var i = 0; i < arguments.length; ++i) {
                self.totalWidth += arguments[i] || 0;
            }
            deferred.resolve(self.totalWidth);
        });

        return deferred.promise();
    };

    /**
     *  Checks if any element overflows. It will stop after the first overflow.
     *  If an element overflow it doesn't necessarily mean it will be the element that has to change
     */
    ResizeController.prototype.elementsOverflow = function() {
        // JQuery here so we can get the width without padding
        return $(this.config.container).width() < this.totalWidth;
    };

    /**
     * Checks if elements overflow and notifies the elements.
     */
    ResizeController.prototype.checkResize = function() {
        var i;
        var element;

        if (this.elementsOverflow()) {
            if (!this.hasOverflow) {
                // TODO Generalize the use case not just one overflow down
                for (i = 0; i < this.config.elements.length; ++i) {
                    element = this.config.elements[i];
                    if (element.goToNextState()) {
                        this.hasOverflow = true;
                        break;
                    }
                }
            }
        } else {
            if (this.hasOverflow) {
                for (i = 0; i < this.config.elements.length; ++i) {
                    element = this.config.elements[i];
                    if (element.goToPreviousState()) {
                        this.hasOverflow = false;
                        break;
                    }
                }
            }
        }
    };

    /**
     * Updates the width of an element. It will recompute the element width
     * @param element
     */
    ResizeController.prototype.updateElement = function(element) {
        var resizableElem = this.elementsMap.get(element);
        var self = this;
        if (resizableElem) {
            var lastMeasuredWidth = resizableElem.measuredWidth;
            resizableElem.measure(true).then(function(newMeasure) {
                self.totalWidth -= lastMeasuredWidth;
                self.totalWidth += newMeasure;
                self.checkResize();
            });
        }
    };

    ResizeController.prototype.clean = function() {
        this.config.elements.forEach(function(element) {
            element.clean();
        });
        this.config = null;
        this.elementsMap = null;
    };
})(window, Granite, Granite.$, Granite.URITemplate, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, URITemplate) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    function getSelections(collection) {
        return $(collection[0].selectedItems);
    }

    function bulkSelect(collection, handler) {
        collection.data("foundation-layout-columnview.internal.bulkSelection", true);
        var out = handler();
        collection.removeData("foundation-layout-columnview.internal.bulkSelection");
        return out;
    }

    function setId(collection, id) {
        collection[0].dataset.foundationCollectionId = id;
        // Also remove the jquery data version, otherwise it will have the wrong value.
        collection.removeData("foundationCollectionId");
    }

    function handleMode(collection, config) {
        var modeChangeHandler = function(e, mode, group) {
            if (e._foundationLayoutColumnview) {
                return;
            }
            if (mode !== "default") {
                return;
            }
            if (collection[0].dataset.foundationModeGroup !== group) {
                return;
            }

            bulkSelect(collection, function() {
                getSelections(collection).prop("selected", false);
            });

            collection.children("coral-columnview-preview").remove();

            collection.trigger("foundation-selections-change");
        };

        $(document).on("foundation-mode-change", modeChangeHandler);

        return function() {
            $(document).off("foundation-mode-change", modeChangeHandler);
        };
    }

    function handleSelection(collection, config) {
        var onselect = function(e) {
            var selections = $(e.originalEvent.detail.selection);
            var prevSelections = $(e.originalEvent.detail.oldSelection);

            prevSelections.removeClass("foundation-selections-item");
            selections.addClass("foundation-selections-item");

            if (!collection.data("foundation-layout-columnview.internal.bulkSelection")) {
                if (selections.length) {
                    var currentId = collection[0].dataset.foundationCollectionId;

                    var newId;
                    if (collection[0].activeItem) {
                        newId = collection[0].activeItem.dataset.foundationCollectionItemId;
                    } else {
                        newId = collection.children("coral-columnview-column")[0]
                            .dataset.foundationLayoutColumnviewColumnid;
                    }

                    // When a selection causes a navigation, we have to trigger `foundation-collection-navigate` event
                    // first before `foundation-selections-change` event.
                    // Since Coral triggers its selection event first before its navigation event,
                    // let's delay triggering the selection event and do it at `handleNavigation`.
                    if (newId !== currentId) {
                        collection.data("foundation-layout-columnview.internal.delaySelectionEvent", {
                            selections: selections,
                            prevSelections: prevSelections
                        });
                    } else {
                        changeMode(collection, false, selections, prevSelections);
                        collection.trigger("foundation-selections-change");
                    }
                } else {
                    changeMode(collection, false, selections, prevSelections);
                    collection.trigger("foundation-selections-change");
                }

                if (selections.length === 1 && collection[0].dataset.foundationSelectionsMode !== "single") {
                    loadPreview(collection, config, selections[0]);
                } else {
                    collection.children("coral-columnview-preview").remove();
                }
            }
        };

        var onescape = function() {
            if (document.activeElement === collection[0] || collection[0].contains(document.activeElement)) {
                collection.adaptTo("foundation-selections").clear();
            }
        };

        collection.on("coral-columnview:change", onselect);
        Coral.keys.on("escape", onescape);

        return function() {
            collection.off("coral-columnview:change", onselect);
            Coral.keys.off("escape", onescape);
        };
    }

    function handleNavigation(collection, config) {
        var f = function(e) {
            var columnEl = e.originalEvent.detail.column;

            setId(collection, columnEl.dataset.foundationLayoutColumnviewColumnid);
            collection.trigger("foundation-collection-navigate");

            collection.trigger("foundation-selections-change");

            var delayKey = "foundation-layout-columnview.internal.delaySelectionEvent";
            var delayConfig = collection.data(delayKey);
            if (delayConfig) {
                collection.removeData(delayKey);
                changeMode(collection, false, delayConfig.selections, delayConfig.prevSelections);
            }
        };

        collection.on("coral-columnview:navigate", f);

        return function() {
            collection.off("coral-columnview:navigate", f);
        };
    }

    function loadPreview(collection, config, itemEl, refreshOnly) {
        if (!config.previewSrc) {
            return;
        }

        var parentId = itemEl.dataset.foundationCollectionItemId;

        var url = URITemplate.expand(config.previewSrc, {
            id: parentId
        });

        var responseHandler = function(html) {
            return extractColumn(html).then(function(result) {
                var newColumnEl = result.column;

                if ($(newColumnEl).is("coral-columnview-preview")) {
                    newColumnEl.dataset.foundationLayoutColumnviewColumnid = parentId;

                    if (config.previewMaximized) {
                        newColumnEl.classList.add("foundation-layout-columnview-preview-maximized");
                    }
                }

                if (refreshOnly) {
                    collection.children("coral-columnview-preview").replaceWith(newColumnEl);
                } else {
                    var oldColumnEl = $(itemEl).closest("coral-columnview-column")[0];
                    // Need to call `setNextColumn` last as it will trigger navigate event.
                    collection[0].setNextColumn(newColumnEl, oldColumnEl);
                }
            });
        };

        $.ajax({
            url: url,
            cache: false
        }).then(responseHandler, function() {
            var title = Granite.I18n.get("Error");
            var message = Granite.I18n.get("Fail to load data.");

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        });
    }

    function changeMode(collection, force, selections, prevSelections) {
        var group = collection[0].dataset.foundationModeGroup;

        if (!group) {
            return;
        }

        var afterCount = selections ? selections.length : collection.adaptTo("foundation-selections").count();
        var beforeCount = prevSelections ? prevSelections.length : 0;

        var trigger = function(mode) {
            var e = $.Event("foundation-mode-change");
            // Mark the event so that our own handler can detect if it is triggered by us or not.
            e._foundationLayoutColumnview = true;
            collection.trigger(e, [ mode, group ]);
        };

        if ((beforeCount === 0 || force) && afterCount > 0) {
            trigger("selection");
        } else if ((beforeCount > 0 || force) && afterCount === 0) {
            trigger("default");
        }
    }

    function collectionIsLoaded(collection) {
        return collection.find("coral-columnview-column[data-foundation-layout-columnview-lazy='true']").length === 0;
    }

    function handlePagination(collection, config) {
        var f = function(e) {
            var src = collection[0].dataset.foundationCollectionSrc;

            if (!src) {
                return;
            }

            var detail = e.originalEvent.detail;
            var columnView = e.target;
            var columnEl = detail.column;
            var parentItemEl = detail.item;

            var url;
            var limit = config.limit || 20;
            var responseHandler;

            if (parentItemEl) {
                var loadPreview = parentItemEl.variant !== "drilldown";
                var id = parentItemEl.dataset.foundationCollectionItemId;

                if (!loadPreview) {
                    // Load new column
                    url = URITemplate.expand(src, {
                        offset: detail.start,
                        limit: limit,
                        id: id
                    });
                } else {
                    if (config.previewSrc) {
                        // Load preview
                        url = URITemplate.expand(config.previewSrc, {
                            id: id
                        });
                    } else {
                        // Delete all following columns from the current one
                        var columns = columnView.columns.getAll();
                        var targetIndex = columns.indexOf(columnEl);

                        for (var i = columns.length - 1; targetIndex >= 0 && i > targetIndex; i--) {
                            columnView.columns.remove(columns[i]);
                        }
                    }
                }

                responseHandler = function(html) {
                    return extractColumn(html).then(function(result) {
                        var newColumnEl = result.column;
                        var newColumn = $(newColumnEl);

                        if (newColumn.is("coral-columnview-preview")) {
                            newColumnEl.dataset.foundationLayoutColumnviewColumnid = id;

                            if (config.previewMaximized) {
                                newColumn.addClass("foundation-layout-columnview-preview-maximized");
                            }
                        } else {
                            var items = newColumn.find(".foundation-collection-item");
                            var hasMore = newColumnEl.dataset.foundationLayoutColumnviewHasmore;
                            if (hasMore === "true") {
                                hasMore = true;
                            } else if (hasMore === "false") {
                                hasMore = false;
                            } else {
                                hasMore = items.length >= limit;
                            }
                            newColumn.data("foundation-layout-columnview.internal.pagination", {
                                offset: items.length,
                                limit: limit,
                                hasNext: hasMore
                            });
                        }

                        // Need to call `setNextColumn` last as it will trigger navigate event.
                        columnView.setNextColumn(newColumnEl, columnEl);
                        if (collection.data("foundation-layout-collection.internal.columnviewReloaded") &&
                            collectionIsLoaded(collection)) {
                            requestAnimationFrame(function() {
                                // trigger collection event after Coral upgrade
                                collection.trigger("foundation-collection-navigate");
                            });
                        }
                    });
                };
            } else {
                // Paginate existing column
                if (columnEl.dataset.foundationLayoutColumnviewHasmore === "false") {
                    return;
                }

                url = URITemplate.expand(src, {
                    offset: detail.start,
                    limit: limit,
                    id: columnEl.dataset.foundationLayoutColumnviewColumnid
                });

                responseHandler = function(html) {
                    return extractItems(html).then(function(result) {
                        var itemArray = result.items;

                        if (columnEl.dataset.foundationLayoutColumnviewLazy) {
                            // removes the wait
                            $(columnEl.content).empty();
                            delete columnEl.dataset.foundationLayoutColumnviewLazy;

                            if (result.meta) {
                                columnEl.content.appendChild(result.meta);
                            }

                            itemArray.forEach(function(itemEl) {
                                // Mark ancestor items as active
                                // eslint-disable-next-line max-len
                                if (columnEl.dataset.foundationLayoutColumnviewActiveitem === itemEl.dataset.foundationCollectionItemId) {
                                    delete columnEl.dataset.foundationLayoutColumnviewActiveitem;

                                    // Need to upgrade the item element before setting `active`.
                                    // Note for Chrome, upgrading is not needed as
                                    // it is already upgraded during parsing. But doing it is harmless.
                                    /* global CustomElements:false */
                                    CustomElements.upgrade(itemEl);

                                    itemEl.set("active", true, true);
                                    columnEl._oldActiveItem = itemEl;
                                }
                            });
                        }

                        itemArray.forEach(function(itemEl) {
                            // silently auto select all the new loaded collection items when in select all mode
                            if (collection[0].dataset.foundationSelectionsSelectallMode) {
                                itemEl.set("selected", true, true);
                                itemEl.classList.add("foundation-selections-item");
                            }
                            columnEl.items.add(itemEl);
                        });

                        var hasMore = result.hasMore;
                        if (hasMore === undefined) {
                            hasMore = itemArray.length >= limit;
                        }

                        columnEl.dataset.foundationLayoutColumnviewHasmore = "" + hasMore;

                        $(columnEl).data("foundation-layout-columnview.internal.pagination", {
                            offset: columnEl.items.getAll().length,
                            limit: limit,
                            hasNext: hasMore
                        });
                        if (collection.data("foundation-layout-collection.internal.columnviewReloaded") &&
                            collectionIsLoaded(collection)) {
                            requestAnimationFrame(function() {
                                // trigger collection event after Coral upgrade
                                collection.trigger("foundation-collection-navigate");
                            });
                        }
                    });
                };
            }

            if (url) {
                $.ajax({
                    url: url,
                    cache: false
                }).then(responseHandler, function() {
                    var title = Granite.I18n.get("Error");
                    var message = Granite.I18n.get("Fail to load data.");

                    var ui = $(window).adaptTo("foundation-ui");
                    ui.alert(title, message, "error");
                });
            }
        };

        // init paginator on last column
        var src = collection[0].dataset.foundationCollectionSrc;
        if (src) {
            Coral.commons.ready(collection[0], function() {
                var currentColumn = collection[0].columns.last();
                $(currentColumn).data("foundation-layout-columnview.internal.pagination", {
                    offset: currentColumn.items.getAll().length,
                    limit: config.limit || 20,
                    hasNext: currentColumn.dataset.foundationLayoutColumnviewHasmore === "true"
                });
            });
        }

        collection.on("coral-columnview:loaditems", f);

        return function() {
            collection.off("coral-columnview:loaditems", f);
        };
    }

    function extractItems(html) {
        var parser = $(window).adaptTo("foundation-util-htmlparser");

        return parser.parse(html).then(function(fragment) {
            var el = $(fragment).children();

            var column;
            if (el.is("coral-columnview-column")) {
                column = el;
            } else {
                column = el.find("coral-columnview-column").last();
            }

            var hasMore = column[0].dataset.foundationLayoutColumnviewHasmore;
            if (hasMore === "true") {
                hasMore = true;
            } else if (hasMore === "false") {
                hasMore = false;
            }

            return {
                items: column.find(".foundation-collection-item").toArray(),
                hasMore: hasMore,
                meta: column.find(".foundation-collection-meta")[0]
            };
        });
    }

    function extractColumn(html) {
        var parser = $(window).adaptTo("foundation-util-htmlparser");

        return parser.parse(html).then(function(fragment) {
            var el = $(fragment).children();

            var column;
            if (el.is("coral-columnview-column, coral-columnview-preview")) {
                column = el;
            } else {
                column = el.find("coral-columnview-column, coral-columnview-preview").last();
            }

            return {
                column: column[0]
            };
        });
    }


    registry.register("foundation.layouts", {
        name: "foundation-layout-columnview",
        doLayout: function(el, config) {
            var collection = $(el);

            // foundation-layout-columnview is exclusive to manage the layout of foundation-collection only
            if (!collection.hasClass("foundation-collection")) {
                return;
            }

            if (collection.data("foundation-layout-columnview.internal.init")) {
                return;
            }

            var stack = [];

            stack.push((function() {
                collection.data("foundation-layout-columnview.internal.stack", stack);

                return function() {
                    collection.removeData("foundation-layout-columnview.internal.stack");
                };
            })());

            stack.push((function() {
                collection.data("foundation-layout-columnview.internal.init", true);

                return function() {
                    collection.removeData("foundation-layout-columnview.internal.init");
                };
            })());

            // Restore the selections before addListener to avoid listening
            // to coral-columnview:change event when restoring.
            var selectionIds = collection.data("foundation-layout-collection-switcher.internal.selectionIds");
            if (selectionIds) {
                var selections = collection.find(".foundation-collection-item").filter(function() {
                    return selectionIds.indexOf(this.dataset.foundationCollectionItemId) >= 0;
                });

                selections.each(function() {
                    // Need to use attr here as Coral.ColumnView may not be upgraded yet
                    $(this).attr("selected", "").addClass("foundation-selections-item");
                });
            }

            stack.push(handleMode(collection, config));
            stack.push(handleNavigation(collection, config));
            stack.push(handleSelection(collection, config));
            stack.push(handlePagination(collection, config));

            requestAnimationFrame(function() {
                // trigger collection event after Coral upgrade
                changeMode(collection, true);
                collection.trigger("foundation-selections-change");
            });
        },
        clean: function(el, config) {
            var collection = $(el);

            var stack = collection.data("foundation-layout-columnview.internal.stack");
            if (stack) {
                Granite.UI.Foundation.Utils.everyReverse(stack, function(v) {
                    if (v) {
                        v();
                    }
                    return true;
                });
            }

            Granite.UI.Foundation.Layouts.clean(el);
        }
    });

    function getColumnEl(collectionEl, includePreview, id) {
        var selector = "coral-columnview-column";

        if (includePreview) {
            selector += ", coral-columnview-preview";
        }

        var result;
        $(collectionEl).children(selector).each(function() {
            if (this.dataset.foundationLayoutColumnviewColumnid === id) {
                result = this;
                return false;
            }
        });
        return result;
    }

    function getCurrentColumnEl(collectionEl, includePreview) {
        return getColumnEl(collectionEl, includePreview, collectionEl.dataset.foundationCollectionId);
    }

    function reloadColumnView(collection, id) {
        var el = collection[0];
        var src = el.dataset.foundationCollectionSrc;
        var config = collection.data("foundationLayout");
        var url = URITemplate.expand(src, {
            offset: 0,
            limit: config.limit || 20,
            id: id
        });
        return $.ajax({
            url: url,
            cache: false
        }).then(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");
            Granite.UI.Foundation.Layouts.cleanAll(collection[0]);
            parser.parse(html).then(function(fragment) {
                var newCollection = $(fragment).children();
                newCollection.data("foundation-layout-collection.internal.columnviewLoaded",
                    collection.data("foundation-layout-collection.internal.columnviewLoaded"));
                newCollection.replaceAll(collection);
                newCollection.data("foundation-layout-collection.internal.columnviewReloaded", true);
                newCollection.trigger("foundation-contentloaded");
            });
        }, function() {
            var title = Granite.I18n.get("Error");
            var message = Granite.I18n.get("Fail to load data.");

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        });
    }

    function reloadColumnItem(collection, api, id) {
        var el = collection[0];
        var targetColumnEl = getColumnEl(el, true, id);
        var parentOfTargetColumnId = null;
        var parentActiveItemId = null;
        if (targetColumnEl && targetColumnEl.previousElementSibling) {
            parentOfTargetColumnId =
                targetColumnEl.previousElementSibling.dataset.foundationLayoutColumnviewColumnid;
            if (targetColumnEl.previousElementSibling.activeItem) {
                parentActiveItemId =
                    targetColumnEl.previousElementSibling.activeItem.dataset.foundationCollectionItemId;
            }
        }
        var config = collection.data("foundationLayout");
        var src = el.dataset.foundationCollectionSrc;

        var limit;

        var pagination = $(targetColumnEl).data("foundation-layout-columnview.internal.pagination");
        if (pagination) {
            limit = pagination.offset;
        } else {
            limit = config.limit || 20;
        }

        var url = URITemplate.expand(src, {
            offset: 0,
            limit: limit,
            id: id
        });

        // Update preview when one selection is made
        var selections = getSelections(collection);
        if (selections.length === 1 && collection[0].dataset.foundationSelectionsMode !== "single") {
            loadPreview(collection, config, selections[0], true);
        }

        return $.ajax({
            url: url,
            cache: false
        }).then(function(html) {
            return extractColumn(html).then(function(result) {
                var newColumnEl = result.column;
                var newColumn = $(newColumnEl);

                var prevSelections = getSelections(collection);
                var prevSelectionIds = prevSelections.map(function() {
                    return this.dataset.foundationCollectionItemId;
                }).toArray();

                var selections = $(newColumnEl).find(".foundation-collection-item").filter(function() {
                    var match = prevSelectionIds.indexOf(this.dataset.foundationCollectionItemId) >= 0;

                    if (match) {
                        $(this).attr("selected", "").addClass("foundation-selections-item");
                    }

                    return match;
                });

                // We either switch from preview element to a column item
                // Or we delete the preview item
                if ((parentOfTargetColumnId !== null && parentActiveItemId !== null) &&
                    (targetColumnEl.nodeName !== newColumnEl.nodeName ||
                    !newColumnEl.querySelector("coral-columnview-item"))) {
                    // We need to reload so the chevron update
                    reloadColumnItem(collection, api, parentOfTargetColumnId).then(function() {
                        // Set this to false to we don't double trigger reload.
                        collection.data("foundation-layout-collection.internal.columnviewLoaded", false);
                        api.load(parentActiveItemId);
                        collection.trigger("foundation-collection-reload");
                        collection.trigger("foundation-selections-change");
                    });
                    return;
                } else {
                    $(targetColumnEl).replaceWith(newColumnEl);
                }
                newColumn.data("foundation-layout-columnview.internal.pagination", {
                    offset: newColumn.find(".foundation-collection-item").length,
                    limit: config.limit || 20
                });
                collection.trigger("foundation-collection-reload");

                collection.trigger("foundation-selections-change");
                changeMode(collection, false, selections, prevSelections);
            });
        }, function() {
            var title = Granite.I18n.get("Error");
            var message = Granite.I18n.get("Fail to load data.");

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        }).then(function() {
            return el;
        });
    }

    registry.register("foundation.adapters", {
        type: "foundation-collection",
        selector: ".foundation-layout-columnview.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            collection.data("foundation-layout-collection.internal.columnviewLoaded", true);
            return {
                append: function(items) {
                    var currentColumnEl = getCurrentColumnEl(el);
                    if (currentColumnEl) {
                        $(currentColumnEl).children("coral-columnview-column-content")
                            .append(items)
                            .trigger("foundation-contentloaded");
                    }
                },
                clear: function() {
                    var currentColumnEl = getCurrentColumnEl(el);
                    if (currentColumnEl) {
                        currentColumnEl.items.clear();
                    }
                },
                getPagination: function() {
                    var pagination = $(getCurrentColumnEl(el)).data("foundation-layout-columnview.internal.pagination");
                    if (!pagination) {
                        return null;
                    }
                    return {
                        offset: pagination.offset,
                        limit: pagination.limit,
                        hasNext: pagination.hasNext
                    };
                },
                load: function(id) {
                    var itemEl = collection.find(".foundation-collection-item").filter(function() {
                        return this.dataset.foundationCollectionItemId === id;
                    })[0];

                    if (itemEl) {
                        // Simulate the user click to replicate the loading behaviour.
                        if (collection.data("foundation-layout-collection.internal.columnviewLoaded")) {
                            collection.trigger("foundation-collection-reload");
                        } else {
                            collection.data("foundation-layout-collection.internal.columnviewLoaded", true);
                        }
                        itemEl.click();
                    } else {
                        // If the itemEl is not found and we can find the matching column,
                        // it means the id is root folder.
                        var columns = el.columns.getAll();
                        var rootColumnEl = columns.find(function(v) {
                            return v.dataset.foundationLayoutColumnviewColumnid === id;
                        });

                        if (!rootColumnEl) {
                            reloadColumnView(collection, id);
                            return;
                        }

                        var out = bulkSelect(collection, function() {
                            var prevSelections = getSelections(collection);
                            var selections = $();

                            rootColumnEl.items.getAll().forEach(function(v) {
                                v.selected = false;
                                v.active = false;
                            });

                            return {
                                prevSelections: prevSelections,
                                selections: selections
                            };
                        });
                        if (collection.data("foundation-layout-collection.internal.columnviewLoaded")) {
                            collection.trigger("foundation-collection-reload");
                        } else {
                            collection.data("foundation-layout-collection.internal.columnviewLoaded", true);
                        }
                        setId(collection, id);
                        collection.trigger("foundation-collection-navigate");

                        collection.trigger("foundation-selections-change");
                        changeMode(collection, false, out.selections, out.prevSelections);
                    }

                    return $.Deferred().resolve(el).promise();
                },
                reload: function() {
                    collection.data("foundation-layout-collection.internal.columnviewLoaded", true);
                    return reloadColumnItem(collection, this, el.dataset.foundationCollectionId);
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-collection-meta",
        selector: ".foundation-layout-columnview.foundation-collection",
        adapter: function(el) {
            var getMeta = function() {
                return $(getCurrentColumnEl(el, true)).find(".foundation-collection-meta");
            };

            return {
                getElement: function() {
                    return getMeta()[0];
                },
                getTitle: function() {
                    var meta = getMeta();
                    if (meta.length) {
                        return meta[0].dataset.foundationCollectionMetaTitle;
                    }
                    return null;
                },
                getThumbnail: function() {
                    var meta = getMeta();
                    if (meta.length) {
                        return meta.children(".foundation-collection-meta-thumbnail")[0];
                    }
                    return null;
                },
                isFolder: function() {
                    var meta = getMeta();
                    if (meta.length) {
                        return meta[0].dataset.foundationCollectionMetaFolder === "true";
                    }
                    return false;
                },
                getRelationship: function() {
                    var meta = getMeta();
                    if (meta.length) {
                        return meta[0].dataset.foundationCollectionMetaRel;
                    }
                    return null;
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-selections",
        selector: ".foundation-layout-columnview.foundation-collection",
        adapter: function(el) {
            var collection = $(el);

            return {
                count: function() {
                    if (el.dataset.foundationSelectionsSelectallMode) {
                        var collectionAPI = collection.adaptTo("foundation-collection");
                        var paginationAPI = collectionAPI.getPagination();
                        if (paginationAPI && paginationAPI.guessTotal) {
                            var deselectedItemsCount = el.columns.last().items.length - el.selectedItems.length;
                            return paginationAPI.guessTotal - deselectedItemsCount;
                        }
                    }
                    return el.selectedItems.length;
                },
                selectAll: function(suppressEvent) {
                    var out = bulkSelect(collection, function() {
                        var prevSelections = $(el.selectedItems);
                        var selections = $(el.columns.last().items.getAll()).prop("selected", true);

                        return {
                            prevSelections: prevSelections,
                            selections: selections
                        };
                    });

                    if (out.selections.length === 1 && el.dataset.foundationSelectionsMode !== "single") {
                        var config = collection.data("foundationLayout");
                        loadPreview(collection, config, out.selections[0]);
                    } else {
                        collection.children("coral-columnview-preview").remove();
                    }

                    changeMode(collection, false, out.selections, out.prevSelections);

                    if (!suppressEvent) {
                        collection.trigger("foundation-selections-change");
                    }
                },
                isAllSelected: function() {
                    var isSelectAllMode = el.dataset.foundationSelectionsSelectallMode;
                    var lastColumn = el.columns.last();
                    var hasItemsToLoad = lastColumn.dataset.foundationLayoutColumnviewHasmore === "true";
                    var lastColumnItemsCount = lastColumn.items.getAll().length;
                    var selectedItemsCount = el.selectedItems.length;
                    if (lastColumnItemsCount > 0) {
                        // when everything loaded in the UI is selected
                        if (lastColumnItemsCount === selectedItemsCount) {
                            // in select all mode everything is or will be selected
                            if (isSelectAllMode) {
                                return true;
                            } else {
                                return !hasItemsToLoad;
                            }
                        }
                    }
                    return false;
                },
                clear: function(suppressEvent) {
                    var out = bulkSelect(collection, function() {
                        var prevSelections = $(el.selectedItems).prop("selected", false);
                        var selections = $();

                        return {
                            prevSelections: prevSelections,
                            selections: selections
                        };
                    });

                    collection.children("coral-columnview-preview").remove();

                    changeMode(collection, false, out.selections, out.prevSelections);

                    if (!suppressEvent) {
                        collection.trigger("foundation-selections-change");
                    }
                },
                select: function(el) {
                    var item = $(el);

                    if (!item.hasClass("foundation-collection-item")) {
                        return;
                    }

                    el.selected = true;
                },
                deselect: function(el) {
                    var item = $(el);

                    if (!item.hasClass("foundation-collection-item")) {
                        return;
                    }

                    el.selected = false;
                }
            };
        }
    });
})(window, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, Granite, $, URITemplate) {
    "use strict";

    var registry = $(window).adaptTo("foundation-registry");

    function handleMode(collection, config) {
        var modeChangeHandler = function(e, mode, group) {
            if (e._foundationLayoutTable) {
                return;
            }
            if (mode !== "default") {
                return;
            }
            if (collection[0].dataset.foundationModeGroup !== group) {
                return;
            }

            collection.data("foundation-layout-table.internal.bulkSelection", true);

            collection.find(".foundation-selections-item").each(function() {
                this.selected = false;
            });

            collection.removeData("foundation-layout-table.internal.bulkSelection");

            collection.trigger("foundation-selections-change");
        };

        $(document).on("foundation-mode-change", modeChangeHandler);

        return function() {
            $(document).off("foundation-mode-change", modeChangeHandler);
        };
    }

    function handleSelection(collection, config) {
        var LazyLoader = $(window).adaptTo("foundation-util-lazyloader");
        var lazyLoader = new LazyLoader(collection[0]);
        var maskEl = $(document.createElement("div")).addClass("foundation-ui-mask");

        var f = function(e) {
            if (collection.data("foundation-layout-table.internal.bulkLoading")) {
                return;
            }

            var detail = e.originalEvent.detail;
            var selectionMode = collection[0].dataset.foundationSelectionsMode;

            var selections = $();
            var prevSelections = $();

            if (selectionMode === "single") {
                if (detail.oldSelection) {
                    prevSelections = $(detail.oldSelection);
                }
                if (detail.selection) {
                    selections = $(detail.selection);
                }
            } else {
                prevSelections = $(detail.oldSelection);
                selections = $(detail.selection);
            }

            prevSelections.removeClass("foundation-selections-item");
            selections.addClass("foundation-selections-item");

            if (!collection.data("foundation-layout-table.internal.bulkSelection") &&
                collection[0].dataset.foundationSelectionsSelectallMode !== "true") {
                collection.data("foundation-layout-table.internal.bulkLoading", true);

                // classic ui.wait() method cannot do its job here. lazy loading a large number of items will
                // block the UI thread so the wait animation will just be frozen, looking like strange UI artifacts.
                // so just use a plain back drop, no animation.
                maskEl.appendTo(document.body);

                var continueWithSelectionWorkflow = function(loadedItems) {
                    var lastItemIndex = loadedItems.length - 1;
                    loadedItems.forEach(function(loadedItem, index) {
                        loadedItem.set("selected", true, index !== lastItemIndex);
                        $(loadedItem).addClass("foundation-selections-item");
                    });

                    alignColumnCells(collection);
                    collection.removeData("foundation-layout-table.internal.bulkLoading");
                    // the items from the selections might got out of date
                    // (lazy loaded items were replaced with loaded items)
                    // but the number of elements is the same so this is not a problem for the moment.
                    changeMode(collection, false, selections, prevSelections);
                    collection.trigger("foundation-selections-change");
                    maskEl.detach();
                };

                lazyLoader.loadItems(selections.toArray())
                    .then(continueWithSelectionWorkflow);
            }
        };

        var escape = function() {
            if (document.activeElement === collection[0] || collection[0].contains(document.activeElement)) {
                collection.adaptTo("foundation-selections").clear();
            }
        };

        collection.on("coral-table:change", f);
        Coral.keys.on("escape", escape);

        return function() {
            collection.off("coral-table:change", f);
            Coral.keys.off("escape", escape);
        };
    }

    function changeMode(collection, force, selections, prevSelections) {
        var group = collection[0].dataset.foundationModeGroup;

        if (!group) {
            return;
        }

        var afterCount;
        if (selections) {
            afterCount = selections.length;
        } else {
            afterCount = collection.adaptTo("foundation-selections").count();
        }

        var beforeCount;
        if (prevSelections) {
            beforeCount = prevSelections.length;
        } else {
            beforeCount = 0;
        }

        var trigger = function(mode) {
            var e = $.Event("foundation-mode-change");
            // Mark the event so that our own handler can detect if it is triggered by us or not.
            e._foundationLayoutTable = true;
            collection.trigger(e, [ mode, group ]);
        };

        if ((beforeCount === 0 || force) && afterCount > 0) {
            trigger("selection");
        } else if ((beforeCount > 0 || force) && afterCount === 0) {
            trigger("default");
        }
    }

    function hasLazyOrPendingItems(collection) {
        return collection.has(".foundation-collection-item.is-lazyLoaded," +
            ".foundation-collection-item.is-pending").length;
    }

    function handleSorting(collection, config) {
        var f = function(e) {
            if (config.sortMode !== "remote") {
                return;
            }

            var paginator = collection.data("foundation-layout-table.internal.paginator");

            if (!paginator || (!paginator.hasNext && !hasLazyOrPendingItems(collection))) {
                // Even if the sort mode is server, if there is no more data, sort in the client instead.
                // No more data means all the potentially lazy loaded items are also loaded.
                return;
            }

            var detail = e.originalEvent.detail;
            var column = detail.column;

            var originalSortType = column.sortableType;
            column.sortableType = "custom";

            var src = collection[0].dataset.foundationCollectionSrc;

            var columnName = column.dataset.foundationLayoutTableColumnName;

            var direction = (function(raw) {
                switch (raw) {
                    case "ascending": return "asc";
                    case "descending": return "desc";
                    case "default": return null;
                }
            })(detail.direction || detail.sortableDirection);

            collection.data("foundation-layout-table.internal.paginator.sort", {
                name: columnName,
                direction: direction,
                originalSortType: originalSortType
            });

            var url = URITemplate.expand(src, {
                offset: 0,
                limit: paginator.limit,
                id: collection[0].dataset.foundationCollectionId,
                sortName: columnName,
                sortDir: direction
            });

            $.ajax({
                url: url,
                cache: false
            }).then(function(html) {
                extractItems(html).then(function(result) {
                    var items = result.items;

                    var collectionApi = collection.adaptTo("foundation-collection");
                    collectionApi.clear();
                    collectionApi.append(items);

                    var hasMore = result.hasMore;
                    if (hasMore === undefined) {
                        hasMore = items.length >= paginator.limit;
                    }

                    paginator.restart(items.length, hasMore);

                    column.sortableType = originalSortType;
                });
            }, function() {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Fail to load data.");

                var ui = $(window).adaptTo("foundation-ui");
                ui.alert(title, message, "error");
            });
        };

        collection.on("coral-table:beforecolumnsort", f);

        return function() {
            collection.off("coral-table:beforecolumnsort", f);
        };
    }

    function handlePagination(collection, config, reset) {
        var src = collection[0].dataset.foundationCollectionSrc;

        // hasMore is true by default
        var hasMore = collection[0].dataset.foundationLayoutTableHasmore !== "false";
        if (!src) {
            return;
        }

        var paginator;
        var f = function(scrollContainer) {
            var Paginator = $(window).adaptTo("foundation-util-paginator");

            function wait() {
                collection[0].dataset.graniteCollectionIsLoading = true;

                return {
                    clear: function() {
                        collection[0].dataset.graniteCollectionIsLoading = false;
                    }
                };
            }

            paginator = new Paginator({
                el: scrollContainer,
                limit: config.limit || 20,
                wait: wait,
                resolveURL: function(paginator) {
                    var sort = collection.data("foundation-layout-table.internal.paginator.sort");

                    return URITemplate.expand(src, {
                        offset: paginator.offset,
                        limit: paginator.limit,
                        id: collection[0].dataset.foundationCollectionId,
                        sortName: sort ? sort.name : undefined,
                        sortDir: sort ? sort.direction : undefined
                    });
                },
                processResponse: function(paginator, html) {
                    var deferred = $.Deferred();

                    collection[0].dataset.graniteCollectionIsLoading = true;
                    extractItems(html).then(function(result) {
                        var items = result.items;

                        var collectionApi = collection.adaptTo("foundation-collection");
                        collectionApi.append(items);

                        var hasMore = result.hasMore;
                        if (hasMore === undefined) {
                            hasMore = items.length >= paginator.limit;
                        }

                        collection[0].dataset.graniteCollectionIsLoading = false;
                        deferred.resolve({
                            length: items.length,
                            hasNext: hasMore
                        });
                    });

                    return deferred.promise();
                },
                onNewPage: function() {
                    collection.trigger("foundation-collection-newpage");
                }
            });

            collection.data("foundation-layout-table.internal.paginator", paginator);

            var offset = collection.find(".foundation-collection-item").length;
            paginator.start(offset, hasMore, false, 500);
        };

        var scrollContainer = collection.children("[coral-table-scroll]");

        if (scrollContainer.length) {
            f(scrollContainer);
        } else {
            requestAnimationFrame(function() {
                f(collection.children("[coral-table-scroll]"));
            });
        }

        return function() {
            if (paginator) {
                paginator.destroy();
                collection.removeData("foundation-layout-table.internal.paginator");
                collection.removeData("foundation-layout-table.internal.paginator.sort");
            }
        };
    }

    function extractItems(html) {
        var parser = $(window).adaptTo("foundation-util-htmlparser");

        return parser.parse(html).then(function(fragment) {
            var el = $(fragment).children();

            if (!el.hasClass("foundation-collection")) {
                return;
            }

            var items = el.find(".foundation-collection-item").toArray();

            var hasMore = el[0].dataset.foundationLayoutTableHasmore;
            if (hasMore === "true") {
                hasMore = true;
            } else if (hasMore === "false") {
                hasMore = false;
            }

            return {
                items: items,
                hasMore: hasMore
            };
        });
    }

    function handleNavigation(collection, config) {
        var navigate = function(itemEl) {
            collection.adaptTo("foundation-collection-item-action").execute(itemEl);
        };

        var f = function(e) {
            // Clicking the item means navigate.
            // This is annoying feature as you have to check if the event target is part of actionable element.

            var item = $(e.target).closest("[coral-table-rowselect], button, a, .foundation-collection-item");

            if (item.hasClass("foundation-layout-table-cellwrapper")) {
                if (e.which === 1 && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    navigate(item.closest(".foundation-collection-item")[0]);
                }
                return;
            }

            if (item.hasClass("foundation-collection-item")) {
                e.preventDefault();
                navigate(item[0]);
            }
        };

        collection.on("click", ".foundation-collection-item", f);

        return function() {
            collection.off("click", ".foundation-collection-item", f);
        };
    }

    function handleOrdering(collection, config) {
        var f = function(e) {
            var detail = e.originalEvent.detail;
            var row = detail.row;
            var before = detail.before;
            var oldBefore = detail.oldBefore;

            var action = config.rowReorderAction;

            if (!action) {
                return;
            }

            var beforeId = before ? before.dataset.foundationCollectionItemId : undefined;
            var beforeName = beforeId ? beforeId.substring(beforeId.lastIndexOf("/") + 1) : undefined;

            var rawURL = URITemplate.expand(action, {
                item: row.dataset.foundationCollectionItemId,
                before: beforeId,
                beforeName: beforeName
            });

            var url = rawURL;
            var data;

            var index = rawURL.indexOf("?");
            if (index >= 0) {
                url = rawURL.substring(0, index);
                data = rawURL.substring(index + 1);
            }

            var ui = $(window).adaptTo("foundation-ui");

            ui.wait();
            $.ajax({
                url: url,
                method: "POST",
                data: data
            }).always(function() {
                ui.clearWait();
                collection.trigger("foundation-collection-reload");
            }).fail(function() {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Fail to reorder.");

                ui.alert(title, message, "error");

                if (oldBefore) {
                    $(row).insertBefore(oldBefore);
                } else {
                    row.parentElement.appendChild(row);
                }
            });
        };

        collection.on("coral-table:roworder", f);

        return function() {
            collection.off("coral-table:roworder", f);
        };
    }

    /**
     * Temporary solution to text-align cells content based on their column alignment property.
     * This is done because Coral.Table removed its feature "alignment".
     */
    function alignColumnCells(collection) {
        collection.find("col[is=coral-table-column]").each(function(i, column) {
            var index = i + 1;
            var columnAlignment = column.getAttribute("alignment");

            collection
                .find("th[is=coral-table-headercell]:nth-child(" + index + "), td[is=coral-table-cell]:nth-child(" + index + ")") // eslint-disable-line max-len
                .each(function() {
                    var alignment = this.getAttribute("alignment");
                    // Default alignment for cells is "column"
                    if (!alignment || alignment === "column") {
                        this.setAttribute("alignment", columnAlignment);
                    }
                });
        });
    }

    /**
     * Temporary solution to detect and set the table variant automatically. This used to be set independently for each
     * row before the feature was removed from Coral.Table.
     */
    function detectVariant(collection) {
        if (collection.find("td[is=coral-table-cell][coral-table-rowselect]").length) {
            collection.attr("variant", "list");
        }
    }

    /**
     * Temporary solution to make wrap the title cell in a <a>.
     * This is done so that the user can leverage the native <a> behaviour,
     * such as opening the item in a new browser tab.
     */
    function convertRow(collection) {
        var titleEl = document.querySelector(".granite-collection-pagetitle");

        collection.find("tr.foundation-collection-navigator").each(function() {
            var navigator = $(this);

            // Assume the first non select cell is a title cell.
            navigator.children("td:not([coral-table-rowselect]):not(:has([coral-table-rowselect]))").first().wrapInner(
                function() {
                    var td = $(this);

                    if (td.find("a").length) {
                        return;
                    }

                    var el = document.createElement("a");
                    el.className = "foundation-layout-table-cellwrapper";

                    var href = navigator[0].dataset.foundationCollectionNavigatorHref;

                    if (href) {
                        el.target = navigator[0].dataset.foundationCollectionNavigatorTarget;
                    } else {
                        if (!titleEl) {
                            return;
                        }
                        if (!collection.is(titleEl.dataset.graniteCollectionPagetitleTarget)) {
                            return;
                        }
                        href = URITemplate.expand(titleEl.dataset.graniteCollectionPagetitleSrc, {
                            id: navigator.closest(".foundation-collection-item")[0].dataset.foundationCollectionItemId
                        });
                    }

                    el.href = href;

                    return $(el);
                });
        });
    }

    /**
     * Selects the given array of collection items without triggering Coral events.
     * @param items an array of collection items
     */
    function selectGivenItemsSilently(items) {
        items.forEach(function(element) {
            element.set("selected", true, true);
            element.classList.add("foundation-selections-item");
        });
    }

    registry.register("foundation.layouts", {
        name: "foundation-layout-table",
        doLayout: function(el, config) {
            var collection = $(el);

            // foundation-layout-table is exclusive to manage the layout of foundation-collection only
            if (!collection.hasClass("foundation-collection")) {
                return;
            }

            if (collection.data("foundation-layout-table.internal.init")) {
                return;
            }

            var stack = [];

            stack.push((function() {
                collection.data("foundation-layout-table.internal.stack", stack);

                return function() {
                    collection.removeData("foundation-layout-table.internal.stack");
                };
            })());

            stack.push((function() {
                collection.data("foundation-layout-table.internal.init", true);

                return function() {
                    collection.removeData("foundation-layout-table.internal.init");
                };
            })());

            // Restore the selections before addListener to avoid listening to coral-table:change event when restoring
            // Need to use attr here as Coral.Table may not be upgraded yet
            if (collection[0].hasAttribute("selectable")) {
                var selectionIds = collection.data("foundation-layout-collection-switcher.internal.selectionIds");
                if (selectionIds) {
                    var selections = collection.find(".foundation-collection-item").filter(function() {
                        return selectionIds.indexOf(this.dataset.foundationCollectionItemId) >= 0;
                    });

                    selections.each(function() {
                        $(this).attr("selected", "").addClass("foundation-selections-item");
                    });
                }
            }

            stack.push(handleMode(collection, config));
            stack.push(handleSelection(collection, config));
            stack.push(handleSorting(collection, config));
            stack.push(handlePagination(collection, config));
            stack.push(handleNavigation(collection, config));
            stack.push(handleOrdering(collection, config));

            convertRow(collection);
            detectVariant(collection);
            alignColumnCells(collection);

            requestAnimationFrame(function() {
                // trigger collection event after Coral upgrade
                changeMode(collection, true);
                collection.trigger("foundation-collection-newpage");
                collection.trigger("foundation-selections-change");
            });

            // handle select all mode from the coral table header checkbox as well
            collection.find("[coral-table-select]").change(function(e) {
                // prevent the coral behavior and use the select all behavior
                e.stopPropagation();
                var selectionsAPI = collection.adaptTo("foundation-selections");
                if (this.checked) {
                    el.dataset.foundationSelectionsSelectallMode = true;
                    selectionsAPI.selectAll();
                } else {
                    selectionsAPI.clear();
                }
            });
        },
        clean: function(el, config) {
            var collection = $(el);

            collection.off("change", "[coral-table-select]");

            var stack = collection.data("foundation-layout-table.internal.stack");
            if (stack) {
                Granite.UI.Foundation.Utils.everyReverse(stack, function(v) {
                    if (v) {
                        v();
                    }
                    return true;
                });
            }

            Granite.UI.Foundation.Layouts.clean(el);
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-collection",
        selector: ".foundation-layout-table.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var LazyLoader = $(window).adaptTo("foundation-util-lazyloader");
            var lazyLoader = new LazyLoader(el);

            var load = function(id, limit, restoreSelection) {
                var src = el.dataset.foundationCollectionSrc;

                if (!limit) {
                    var config = collection.data("foundationLayout");
                    limit = config && config.limit || 20;
                }

                var url = URITemplate.expand(src, {
                    offset: 0,
                    limit: limit,
                    id: id
                });

                return $.ajax({
                    url: url,
                    cache: false
                }).then(function(html) {
                    var deferred = $.Deferred();

                    var parser = $(window).adaptTo("foundation-util-htmlparser");

                    parser.parse(html).then(function(fragment) {
                        var newCollection = $(fragment).children();

                        if (!newCollection.hasClass("foundation-collection")) {
                            deferred.reject(new Error("Invalid content"));
                            return;
                        }

                        if (restoreSelection) {
                            var selectionIds = collection.find(".foundation-selections-item").map(function() {
                                return this.dataset.foundationCollectionItemId;
                            }).toArray();

                            // Temporary solution to restore selection
                            // without triggering "foundation-selections-change" twice.
                            newCollection.data(
                                "foundation-layout-collection-switcher.internal.selectionIds",
                                selectionIds
                            );
                        }
                        collection.trigger("foundation-collection-reload");
                        newCollection.data("foundation-layout-collection.internal.columnviewLoaded", true);
                        Granite.UI.Foundation.Layouts.cleanAll(el);

                        // TBD to reuse the collection element, instead of creating a new one.
                        newCollection.replaceAll(collection);

                        requestAnimationFrame(function() {
                            // trigger collection event after Coral upgrade
                            newCollection.trigger("foundation-collection-navigate");
                        });

                        newCollection.trigger("foundation-contentloaded");

                        if (restoreSelection) {
                            newCollection.removeData("foundation-layout-collection-switcher.internal.selectionIds");
                        }

                        deferred.resolve(newCollection);
                    });

                    return deferred.promise();
                }, function() {
                    var title = Granite.I18n.get("Error");
                    var message = Granite.I18n.get("Fail to load data.");

                    var ui = $(window).adaptTo("foundation-ui");
                    ui.alert(title, message, "error");
                });
            };

            return {
                append: function(items) {
                    collection.find("tbody").append(items);
                    // silently auto select all the new loaded collection items when in select all mode
                    if (el.dataset.foundationSelectionsSelectallMode) {
                        items.forEach(function(element) {
                            if (!element.classList.contains("is-lazyLoaded") &&
                                !element.classList.contains("is-pending")) {
                                element.set("selected", true, true);
                                element.classList.add("foundation-selections-item");
                            }
                        });
                        lazyLoader.loadItems(items).then(function(loadedItems) {
                            selectGivenItemsSilently(loadedItems);
                            collection.trigger("foundation-selections-change");
                        });
                    }
                    convertRow(collection);
                    alignColumnCells(collection);
                    detectVariant(collection);
                    collection.trigger("foundation-contentloaded");
                },
                clear: function() {
                    collection.find(".foundation-collection-item").remove();
                },
                getPagination: function() {
                    var paginator = collection.data("foundation-layout-table.internal.paginator");
                    if (!paginator) {
                        return null;
                    }

                    var guessTotal = Number(collection.attr("data-foundation-layout-table-guesstotal"));

                    var hasNext;
                    if (!guessTotal) {
                        hasNext = paginator.hasNext;
                    } else if (paginator.offset >= guessTotal) {
                        hasNext = paginator.hasNext;
                    } else {
                        hasNext = null;
                    }

                    return {
                        offset: paginator.offset,
                        limit: paginator.limit,
                        guessTotal: Math.max(paginator.offset, guessTotal),
                        hasNext: hasNext
                    };
                },
                load: function(id) {
                    return load(id);
                },
                reload: function() {
                    var limit;

                    var pagination = this.getPagination();
                    if (pagination) {
                        limit = pagination.offset;
                    }
                    return load(el.dataset.foundationCollectionId, limit, true);
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-collection-meta",
        selector: ".foundation-layout-table.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var meta = collection.find("> caption > .foundation-collection-meta");
            var metaEl = meta[0];

            if (!metaEl) {
                return null;
            }

            return {
                getElement: function() {
                    return metaEl;
                },
                getTitle: function() {
                    return metaEl.dataset.foundationCollectionMetaTitle;
                },
                getThumbnail: function() {
                    return meta.children(".foundation-collection-meta-thumbnail")[0];
                },
                isFolder: function() {
                    return metaEl.dataset.foundationCollectionMetaFolder === "true";
                },
                getRelationship: function() {
                    return metaEl.dataset.foundationCollectionMetaRel;
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-selections",
        selector: ".foundation-layout-table.foundation-collection",
        adapter: function(el) {
            var collection = $(el);
            var LazyLoader = $(window).adaptTo("foundation-util-lazyloader");
            var lazyLoader = new LazyLoader(el);

            return {
                count: function() {
                    if (el.dataset.foundationSelectionsSelectallMode) {
                        var collectionAPI = collection.adaptTo("foundation-collection");
                        var paginationAPI = collectionAPI.getPagination();
                        if (paginationAPI && paginationAPI.guessTotal) {
                            var deselectedItemsCount =
                                collection.find(".foundation-collection-item:not(.foundation-selections-item)").length;
                            return paginationAPI.guessTotal - deselectedItemsCount;
                        }
                    }
                    return collection.find(".foundation-selections-item").length;
                },

                selectAll: function(suppressEvent) {
                    collection.data("foundation-layout-table.internal.bulkSelection", true);

                    var prevSelections = collection.find(".foundation-selections-item");

                    var notSelected = collection
                        .find(".foundation-collection-item:not(.foundation-selections-item)" +
                            ":not(.is-lazyLoaded):not(.is-pending)").each(function(index) {
                            // select all the elements but the first,
                            // but mark them as selected silently, without triggering any other events
                            if (index > 0) {
                                this.set("selected", true, true);
                            }
                        });
                    var selections = prevSelections.add(notSelected);
                    // load placeholders if any available
                    var placeholders = collection.find(".foundation-collection-item.is-lazyLoaded," +
                        ".foundation-collection-item.is-pending");
                    if (placeholders.length > 0) {
                        // Classic ui.wait() method cannot do its job here. lazy loading a large number of items will
                        // block the UI thread so the wait animation will just be frozen, looking like strange UI
                        // artifacts. So just use a plain back drop, no animation.
                        var maskEl = $(document.createElement("div")).addClass("foundation-ui-mask")
                            .append('<coral-wait size="L" centered/>');
                        maskEl.appendTo(document.body);

                        lazyLoader.loadItems(placeholders.toArray()).then(function(loadedItems) {
                            selectGivenItemsSilently(loadedItems);
                            collection.removeData("foundation-layout-table.internal.bulkSelection");

                            // then select the first element, but this time do trigger the other events.
                            notSelected.first().prop("selected", true);

                            changeMode(collection, false, collection.find(".foundation-selections-item"),
                                prevSelections);
                            maskEl.detach();
                            if (!suppressEvent) {
                                collection.trigger("foundation-selections-change");
                            }
                        });
                    } else {
                        // then select the first element, but this time do trigger the other events.
                        notSelected.first().prop("selected", true);

                        collection.removeData("foundation-layout-table.internal.bulkSelection");

                        changeMode(collection, false, selections, prevSelections);

                        if (!suppressEvent) {
                            collection.trigger("foundation-selections-change");
                        }
                    }
                },

                isAllSelected: function() {
                    var isSelectAllMode = el.dataset.foundationSelectionsSelectallMode;
                    var collectionAPI = collection.adaptTo("foundation-collection");
                    var paginationAPI = collectionAPI.getPagination();
                    var hasItemsToLoad = paginationAPI ? paginationAPI.hasNext : false;
                    var itemsCount = collection.find(".foundation-collection-item").length;
                    var selectedItemsCount = collection.find(".foundation-selections-item").length;
                    if (itemsCount > 0) {
                        // when everything loaded in the UI is selected
                        if (itemsCount === selectedItemsCount) {
                            // in select all mode everything is or will be selected
                            if (isSelectAllMode) {
                                return true;
                            } else {
                                return !hasItemsToLoad;
                            }
                        }
                    }
                    return false;
                },

                clear: function(suppressEvent) {
                    collection.data("foundation-layout-table.internal.bulkSelection", true);

                    var prevSelections = collection.find(".foundation-selections-item").each(function(index) {
                        // deselect all the elements but the first,
                        // but mark them as not selected silently, without triggering any other events
                        if (index > 0) {
                            this.set("selected", false, true);
                        }
                    });

                    // then deselect the first element, but this time do trigger the other events.
                    prevSelections.first().prop("selected", false);

                    collection.removeData("foundation-layout-table.internal.bulkSelection");

                    changeMode(collection, false, $(), prevSelections);

                    if (!suppressEvent) {
                        collection.trigger("foundation-selections-change");
                    }
                },

                select: function(el) {
                    var item = $(el);

                    if (!item.hasClass("foundation-collection-item")) {
                        return;
                    }

                    el.selected = true;
                },

                deselect: function(el) {
                    var item = $(el);

                    if (!item.hasClass("foundation-collection-item")) {
                        return;
                    }

                    el.selected = false;
                }
            };
        }
    });
})(window, document, Granite, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, $, Coral) {
    "use strict";

    $(window).adaptTo("foundation-registry").register("foundation.validation.validator", {
        selector: ".foundation-layout-actionfield-field",
        show: function(element, message) {
            var el = $(element);

            var field = el.closest(".coral-Form-field");

            var fieldAPI = el.adaptTo("foundation-field");
            if (fieldAPI && fieldAPI.setInvalid) {
                fieldAPI.setInvalid(true);
            }

            field.nextAll(".coral-Form-fieldinfo").addClass("u-coral-screenReaderOnly");

            var error = el.data("foundation-validation.internal.error");

            if (error) {
                var tooltip = $(error).data("foundation-validation.internal.error.tooltip");
                tooltip.content.innerHTML = message;

                if (!error.parentNode) {
                    el.after(error, tooltip);
                    // field.after(tooltip);
                    // append tooltip ID to the labelledby attribute of field
                    setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), tooltip.id));
                }
            } else {
                error = new Coral.Icon();
                error.icon = "alert";
                error.classList.add("coral-Form-fielderror");

                tooltip = new Coral.Tooltip();
                tooltip.variant = "error";
                tooltip.placement = field.closest("form").hasClass("coral-Form--vertical") ? "left" : "bottom";
                tooltip.target = error;
                tooltip.content.innerHTML = message;
                tooltip.id = Coral.commons.getUID();

                $(error).data("foundation-validation.internal.error.tooltip", tooltip);
                error.setAttribute("aria-labelledby", tooltip.id);
                error.setAttribute("tabindex", 0);

                el.data("foundation-validation.internal.error", error);
                el.after(error, tooltip);
                // append tooltip ID to the labelledby attribute of field
                setLabelledBy(fieldAPI, getLabel(getLabelledBy(fieldAPI), tooltip.id));
            }
        },
        clear: function(element) {
            var el = $(element);

            var field = el.closest(".coral-Form-field");

            var fieldAPI = el.adaptTo("foundation-field");
            if (fieldAPI && fieldAPI.setInvalid) {
                fieldAPI.setInvalid(false);
            }

            var error = el.data("foundation-validation.internal.error");
            if (error) {
                var tooltip = $(error).data("foundation-validation.internal.error.tooltip");
                tooltip.hide();
                tooltip.remove();
                error.remove();

                // Remove the ID of error from the label of field
                var labelledBy = getLabelledBy(fieldAPI);
                if (labelledBy && labelledBy.indexOf(tooltip.id) !== -1) {
                    var newLabel = labelledBy.split(" ")
                        .filter(function(v) {
                            return v !== tooltip.id;
                        })
                        .join(" ");
                    setLabelledBy(fieldAPI, newLabel);
                }
            }
            field.nextAll(".coral-Form-fieldinfo").removeClass("u-coral-screenReaderOnly");
        }
    });

    function getLabel(label, errorId) {
        if (label) {
            return label + " " + errorId;
        }
        return errorId;
    }

    /**
     * This method sets value of labelledby attribute on field.
     *
     * @param fieldAPI foundation-field
     * @param labelledBy value of labelledby attribute to set on field
     */
    function setLabelledBy(fieldAPI, labelledBy) {
        if (fieldAPI && fieldAPI.setLabelledBy) {
            fieldAPI.setLabelledBy(labelledBy);
        }
    }

    /**
     * This method gets value of labelledby attribute from field.
     *
     * @param fieldAPI foundation-field
     */
    function getLabelledBy(fieldAPI) {
        if (fieldAPI && fieldAPI.getLabelledBy) {
            return fieldAPI.getLabelledBy();
        }
    }
})(window, Granite.$, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";
    var registry = $(window).adaptTo("foundation-registry");
    var debounce = Granite.UI.Foundation.Utils.debounce;

    $(document).on("foundation-contentloaded", function(e) {
        $(".foundation-layout-panel-rail-activate-panel").each(function() {
            // We need to this only once,  on page load
            $(this)
                .removeClass("foundation-layout-panel-rail-activate-panel")
                .find("coral-panel[selected]")
                .trigger("foundation-toggleable-show");
        });

        $(".foundation-container-resizable").each(function() {
            var $panel = $(this);
            var parentElement = this.parentElement;
            var resizeAPI = $panel.adaptTo("foundation-container-resizable");
            var $content = $panel.next(".foundation-layout-panel-content");
            var contentMinWidth = new Number($content[0].dataset.graniteLayoutContentMinWidth);
            if (!isNaN(contentMinWidth)) {
                resizeAPI.maxWidth = Math.max(resizeAPI.minWidth, parentElement.offsetWidth - contentMinWidth);
                resizeAPI.initialize();
            }

            resizeAPI.registerEvent(this, "foundation-toggleable-show", function() {
                $panel.css("margin-left", 0);
            }, true);

            resizeAPI.registerEvent(this, "foundation-toggleable-hide", function() {
                $panel.css("margin-left", -resizeAPI.width);
            }, true);

            var saveKey = this.dataset.graniteLayoutPanelSaveKey;
            if (saveKey) {
                resizeAPI.registerEvent(this, "foundation-resize-end", function() {
                    $.cookie(saveKey, resizeAPI.width, { expires: 7, path: "/" });
                });
            }

            var saveCookieDebouncedFn = debounce(function() {
                $.cookie(saveKey, resizeAPI.width, { expires: 7, path: "/" });
            }, 200);

            var resizePanelHandler = function() {
                requestAnimationFrame(function() {
                    var contentWidth = $content.width();
                    if (contentWidth <= contentMinWidth) {
                        resizeAPI.setWidth(contentWidth - contentMinWidth);
                        saveCookieDebouncedFn();
                    }
                    // update maxWidth;
                    resizeAPI.maxWidth = Math.max(resizeAPI.minWidth, parentElement.offsetWidth - contentMinWidth);
                });
            };

            resizePanelHandler();
            Coral.commons.addResizeListener($content[0], resizePanelHandler);
        });
    });

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: ".foundation-layout-panel-rail.foundation-toggleable",
        adapter: function(el) {
            var rail = $(el);

            return {
                isOpen: function() {
                    return el.classList.contains("foundation-layout-panel-rail-active");
                },
                show: function(anchor) {
                    el.classList.add("foundation-layout-panel-rail-active");
                    rail.trigger("foundation-toggleable-show");
                },
                hide: function() {
                    el.classList.remove("foundation-layout-panel-rail-active");

                    rail.find("> coral-panelstack > coral-panel.foundation-layout-panel-rail-panel[selected]")
                        .prop("selected", false)
                        .trigger("foundation-toggleable-hide");

                    rail.trigger("foundation-toggleable-hide");
                }
            };
        }
    });

    registry.register("foundation.adapters", {
        type: "foundation-toggleable",
        selector: "coral-panel.foundation-layout-panel-rail-panel.foundation-toggleable",
        adapter: function(el) {
            var panel = $(el);

            return {
                isOpen: function() {
                    return (
                        el.selected &&
                        panel.closest(".foundation-layout-panel-rail").adaptTo("foundation-toggleable").isOpen()
                    );
                },
                show: function(anchor) {
                    var prevSelectionEl = panel.parent("coral-panelstack")[0].selectedItem;

                    el.selected = true;
                    var rail = panel.closest(".foundation-layout-panel-rail");
                    rail.addClass("foundation-layout-panel-rail-active");

                    if (prevSelectionEl) {
                        $(prevSelectionEl).trigger("foundation-toggleable-hide");
                    }

                    panel.trigger("foundation-toggleable-show");
                    rail.trigger("foundation-toggleable-show");
                },
                hide: function() {
                    el.selected = false;
                    var rail = panel.closest(".foundation-layout-panel-rail");
                    rail.removeClass("foundation-layout-panel-rail-active");

                    panel.trigger("foundation-toggleable-hide");
                    rail.trigger("foundation-toggleable-hide");
                }
            };
        }
    });

    var loadedKey = "foundation-layout-panel-rail-panel.internal.loaded";

    $(document).on("foundation-toggleable-show", "coral-panel.foundation-layout-panel-rail-panel", function(e) {
        var src = this.dataset.foundationLayoutPanelRailPanelSrc;

        if (!src) {
            return;
        }

        var panel = $(this);

        if (panel.data(loadedKey)) {
            return;
        }

        panel.data(loadedKey, true);

        $.ajax({ url: src, cache: false })
            .done(function(html) {
                var parser = $(window).adaptTo("foundation-util-htmlparser");

                parser.parse(html).then(function(fragment) {
                    $(panel[0].content).html("").append(fragment);
                    panel.trigger("foundation-contentloaded");
                });
            })
            .fail(function() {
                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Something went wrong.");

                var ui = $(window).adaptTo("foundation-ui");
                ui.alert(title, message, "error");
            });
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";
    var registry = $(window).adaptTo("foundation-registry");

    /**
     * Constructs the Resizer utility
     *
     * @param {HTMLElement} container - the container element to add attach the resize to
     * @param {HTMLElement} resizeHandle - the handle element to attach the resize to
     * @param {Number} minWidth - the min width of the container
     * @param {Number} maxWidth - the max width of the container
     * @constructor
     */
    function Resizer(container, resizeHandle, minWidth, maxWidth) {
        this.container = container;
        this.active = true;
        this.width = container.offsetWidth;
        this.minWidth = minWidth || -1;
        this.maxWidth = maxWidth || Number.MAX_VALUE;
        this.listeners = [];
        this.resizeHandle = resizeHandle;
        this._dragFn = this.drag.bind(this);
        this._endDragFn = this.endDrag.bind(this);
    }

    /**
     * Sets the width of the container taking in account min and max setting
     *
     * @param {Number} delta - the amount with which we want to change the width
     */
    Resizer.prototype.setWidth = function(delta) {
        this.width = Math.min(Math.max(this.minWidth, this.width + delta), this.maxWidth);
        this.container.style.width = this.width + "px";
    };

    /**
     * Returns the pageX of the event taking in consideration touch
     *
     * @param {Event} evt - the event from which we get the pageX value
     * @returns {Number} - the pageX value
     */
    Resizer.prototype.getEventPageX = function(evt) {
        if (evt.pageX) {
            return evt.pageX;
        }
        if (evt.touches && evt.touches.length) {
            return evt.touches[0].pageX;
        }
    };

    /**
     * Prepares the drag operation
     *
     * @param {Event} evt - the event that generated the start
     */
    Resizer.prototype.startDrag = function(evt) {
        if (!this.active) {
            return;
        }
        evt.stopPropagation();
        this.addMoveListeners();
        this.lastX = this.getEventPageX(evt);
        document.body.classList.add("u-coral-closedHand");
        this.container.classList.add("is-dragging");
    };

    /**
     * Ends the drag operation. Cleans up the drag specific actions.
     *
     * @param {Event} evt - the event that triggered the end action
     */
    Resizer.prototype.endDrag = function(evt) {
        this.drag(evt);
        this.container.dispatchEvent(new CustomEvent("foundation-resize-end", {
            bubbles: true
        }));
        this.removeMoveListeners();
        document.body.classList.remove("u-coral-closedHand");
        this.container.classList.remove("is-dragging");
    };

    /**
     * Handles the drag action and updates the width of the container
     *
     * @param {Event} evt - the event that triggered the drag action
     */
    Resizer.prototype.drag = function(evt) {
        if (!this.active) {
            return;
        }
        evt.stopPropagation();

        requestAnimationFrame(function() {
            var currentX = Math.min(this.getEventPageX(evt), window.outerWidth);
            this.setWidth(currentX - this.lastX);
            this.lastX = currentX;
        }.bind(this));
    };

    /**
     * Initializes the resizer
     */
    Resizer.prototype.initialize = function() {
        if (this._initialized) {
            return;
        }
        if (this.resizeHandle) {
            this.registerEvent(this.resizeHandle, "mousedown", this.startDrag.bind(this));
            this.registerEvent(this.resizeHandle, "touchstart", this.startDrag.bind(this));
        }
        this._initialized = true;
    };

    /**
     * Adds the move listeners taking in consideration mouse and touch
     */
    Resizer.prototype.addMoveListeners = function() {
        window.addEventListener("mouseup", this._endDragFn);
        window.addEventListener("mousemove", this._dragFn);
        window.addEventListener("touchup", this._endDragFn);
        window.addEventListener("touchmove", this._dragFn);
    };

    /**
     * Removes the move listeners
     */
    Resizer.prototype.removeMoveListeners = function() {
        window.removeEventListener("mousemove", this._dragFn);
        window.removeEventListener("mouseup", this._endDragFn);
        window.removeEventListener("touchup", this._endDragFn);
        window.removeEventListener("touchmove", this._dragFn);
    };

    // This is here just to make sure that if we dynamically load & unload, we can clean it up
    // Otherwise if we don't do this, we will leak
    /**
     * Cleans up the internals of the resizer
     */
    Resizer.prototype.dispose = function() {
        this.listeners.each(function(listener) {
            if (listener.elem) {
                listener.useJquery ? $(listener.elem).off(listener.eventName, listener.callback)
                    : listener.elem.removeEventListener(listener.eventName, listener.callback);
            }
        });
        this.listeners = null;
        this.resizeHandle = null;
        this.container = null;
    };

    /**
     * Registers an event so it can be removed when disposing the resizer
     *
     * @param {HTMLElement} elem - the element to register the event on
     * @param {String} eventName - the event name
     * @param {Function} callback - the event handler
     * @param {Boolean} useJquery - if Jquery should be used to attaching the event
     */
    Resizer.prototype.registerEvent = function(elem, eventName, callback, useJquery) {
        this.listeners.push({
            elem: elem,
            eventName: eventName,
            callback: callback,
            useJquery: useJquery
        });
        useJquery ? $(elem).on(eventName, callback) : elem.addEventListener(eventName, callback);
    };

    registry.register("foundation.adapters", {
        type: "foundation-container-resizable",
        selector: ".foundation-container-resizable",
        adapter: function(el) {
            var minWidth = new Number(el.dataset.graniteLayoutPanelMinWidth);
            var resizeHandleElement = el.querySelector(".foundation-container-resizable-handle");
            if (isNaN(minWidth)) {
                minWidth = -1;
            }
            // In touch mode add a drag element
            if (resizeHandleElement &&
                ("ontouchstart" in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
                var dragElement = document.createElement("div");
                dragElement.classList.add("foundation-container-resizable-handle-drag");
                resizeHandleElement.appendChild(dragElement);
            }
            return new Resizer(el, resizeHandleElement, minWidth);
        }
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    function navigate(control) {
        var src = control.data("foundationAdvancedselectControlSrc");
        if (!src) {
            return;
        }

        var select = control.closest(".foundation-advancedselect");
        if (!select.length) {
            return;
        }

        var ui = $(window).adaptTo("foundation-ui");
        ui.wait();

        var navigator = select.find(".foundation-advancedselect-navigator");
        var collection = select.find(".foundation-advancedselect-collection");

        $.ajax(src)
            .done(function(html) {
                var parser = $(window).adaptTo("foundation-util-htmlparser");

                parser.parse(html).then(function(fragment) {
                    var el = $(fragment.querySelectorAll(".foundation-advancedselect"));

                    var newNav = el.find(".foundation-advancedselect-navigator");
                    navigator.replaceWith(newNav);

                    var collectionApi = collection.adaptTo("foundation-collection");

                    // NOTE A:collectionApi.clear() will trigger selectionchange event
                    // and causing the selection to be updated unwantedly, thus skip it
                    // see other NOTE A
                    select.data("foundation-advancedselect.internal.ignoreselectionevent", true);

                    collectionApi.clear();
                    collectionApi.append(el.find(".foundation-collection-item").toArray());

                    select.removeData("foundation-advancedselect.internal.ignoreselectionevent");

                    restoreSelections(select, newNav, collection);

                    select.trigger("foundation-contentloaded");

                    ui.clearWait();
                });
            })
            .fail(function() {
                ui.clearWait();

                var title = Granite.I18n.get("Error");
                var message = Granite.I18n.get("Something went wrong.");
                ui.alert(title, message, "error");
            });
    }

    function restoreSelections(select, navigator, collection) {
        var currentPath = navigator.data("foundationAdvancedselectNavigatorPath").toString();
        var store = select.data("foundation-advancedselect.internal.values") || {};

        var inputs = store[currentPath];

        if (!inputs) {
            return;
        }

        inputs.each(function(i, input) {
            select.find(".foundation-collection-item[data-foundation-collection-item-id]").each(function() {
                if ($(this).data("foundationCollectionItemId") === input.value) {
                    collection.adaptTo("foundation-selections").select(this);
                }
            });
        });
    }

    function updateSelections(select, values) {
        var navigator = select.find(".foundation-advancedselect-navigator");

        var currentPath;
        if (navigator.length) {
            currentPath = navigator.data("foundationAdvancedselectNavigatorPath").toString();
        } else {
            currentPath = "_default";
        }

        var store = select.data("foundation-advancedselect.internal.values");
        if (!store) {
            store = {};
            select.data("foundation-advancedselect.internal.values", store);
        }

        // remove existing inputs; will be recreated
        if (store[currentPath]) {
            store[currentPath].remove();
        }

        var name = select.data("foundationAdvancedselectName");

        var inputs = select.find(".foundation-advancedselect-collection .foundation-selections-item").map(function() {
            var item = $(this);
            var value = item.data("foundationCollectionItemId");

            var input;

            if (value) {
                input = $(document.createElement("input"))
                    .prop("type", "hidden")
                    .prop("name", name)
                    .prop("value", value);
            } else {
                // backward compatibility
                input = item.find("input.aria-value[type=hidden]").clone();
                input.prop("disabled", false);

                if (name && !input.prop("name")) {
                    input.prop("name", name);
                }
            }

            return input.appendTo(values)[0];
        });

        store[currentPath] = inputs;
    }

    function updateStatus(select, values) {
        var status = select.find(".foundation-advancedselect-status");

        if (!status.length) {
            return;
        }

        var template = status.data("foundationAdvancedselectStatusTemplate");
        var text = template.replace("{{count}}", values.children().length);

        status.html(text);
    }


    $(document).on("click", ".foundation-advancedselect-control", function(e) {
        e.preventDefault();

        var control = $(this);
        var action = control.data("foundationAdvancedselectControlAction");

        if (action === "foundation.navigate") {
            navigate(control);
        }
    });

    $(document).on("foundation-selections-change", ".foundation-advancedselect", function(e) {
        var select = $(this);

        // NOTE A: collectionApi.clear() will trigger selectionchange event
        // and causing the selection to be updated unwantedly, thus skip it
        // see other NOTE A
        if (select.data("foundation-advancedselect.internal.ignoreselectionevent")) {
            return;
        }

        var values = select.find(".foundation-advancedselect-values");

        updateSelections(select, values);
        updateStatus(select, values);

        var api = select.adaptTo("foundation-validation");
        if (api) {
            api.checkValidity();
            api.updateUI();
        }
    });

    var registry = $(window).adaptTo("foundation-registry");

    registry.register("foundation.validation.selector", {
        submittable: ".foundation-advancedselect",
        candidate: ".foundation-advancedselect",
        exclude: ".foundation-advancedselect *"
    });

    var requiredString;
    function getRequiredString() {
        if (!requiredString) {
            requiredString = Granite.I18n.get("Please fill out this field.");
        }
        return requiredString;
    }

    registry.register("foundation.validation.validator", {
        selector: ".foundation-advancedselect",
        validate: function(el) {
            if (el.getAttribute("aria-required") !== "true") {
                return;
            }

            var values = $(el).find(".foundation-advancedselect-values > *");

            if (values.length === 0) {
                return getRequiredString();
            }
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    function getCheckbox(li) {
        var c = li.children(":not(.foundation-nestedcheckboxlist)");
        return c.is("input:checkbox:not([disabled])") ? c : c.find("input:checkbox:not([disabled])");
    }

    function updateParent(li, checked) {
        var parent = li.closest(".foundation-nestedcheckboxlist").closest("li.foundation-nestedcheckboxlist-item");

        if (!parent.length) {
            return;
        }

        var all = Array.prototype.every.call(li.siblings("li.foundation-nestedcheckboxlist-item"), function(v) {
            return getCheckbox($(v)).is(":checked") === checked;
        });

        var parentCb = getCheckbox(parent);
        var parentCbMixed = parentCb.prop("indeterminate");

        if (all) {
            if (parentCbMixed) {
                parentCb.prop({
                    indeterminate: false,
                    checked: checked
                });

                updateParent(parent, checked);
            }
        } else {
            if (!parentCbMixed) {
                parentCb.prop({
                    indeterminate: true,
                    checked: false
                });
                updateParent(parent, checked);
            }
        }
    }

    $(document).on("change", ".foundation-nestedcheckboxlist-item", function(e) {
        e.stopPropagation();

        var li = $(this);
        var ul = li.closest(".foundation-nestedcheckboxlist");

        if (ul.data("foundation-nestedcheckboxlist-disconnected") === true) {
            return;
        }

        var checkbox = $(e.target);
        var checked = checkbox.prop("checked");
        var sublist = li.find(".foundation-nestedcheckboxlist");

        if (sublist.length && sublist.data("foundation-nestedcheckboxlist-disconnected") === true) {
            return;
        }

        li.find("ul input:checkbox").prop({
            indeterminate: false,
            checked: checked
        });

        updateParent(li, checked);
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, Coral) {
    "use strict";

    $(document).on("foundation-contentloaded", function(e) {
        $(".betty-ActionBar", e.target).each(function() {
            var actionbar = $(this);

            var KEY_INIT = "betty-ActionBar.internal.init";

            if (actionbar.data(KEY_INIT)) {
                return;
            }

            actionbar.data(KEY_INIT, true);

            Coral.commons.ready(this, function() {
                Coral.commons.addResizeListener(this, function(e) {
                    var width = actionbar.width();

                    if (width <= 360) {
                        actionbar.addClass("betty-ActionBar--collapsed");
                    } else {
                        actionbar.removeClass("betty-ActionBar--collapsed");
                    }

                    this._onLayout();
                });
            }.bind(this));
        });
    });
})(document, Granite.$, Coral);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, Coral) {
    "use strict";

    var PropertyBuilder = $(window).adaptTo("foundation-util-propertybuilder");
    var tracker = $(window).adaptTo("foundation-tracker");

    var Prototype = Object.create(HTMLElement.prototype);

    Prototype.createdCallback = function() {
        var self = this;

        this._icon = new Coral.Icon().set({
            icon: this.icon,
            size: "S"
        });
        this._icon.classList.add("betty-breadcrumbs-button-icon");

        this._buttonText = document.createElement("span");

        var chevron = new Coral.Icon().set({
            icon: "chevronDown",
            size: "XS"
        });
        chevron.classList.add("betty-breadcrumbs-button-chevron");

        this._button = new Coral.Button();
        this._button.setAttribute("variant", "quiet");
        this._button.classList.add("betty-breadcrumbs-button");
        this._button.type = "button";
        this._button.autocomplete = "off";
        this._button.tracking = "off";
        this._button.setAttribute("aria-haspopup", "true");

        // buttonInnerWrapper is needed as <button> doesn't work well with flex display.
        var buttonInnerWrapper = document.createElement("span");
        buttonInnerWrapper.className = "betty-breadcrumbs-button-innerwrapper";
        this._button.label.appendChild(buttonInnerWrapper);

        buttonInnerWrapper.appendChild(this._icon);
        buttonInnerWrapper.appendChild(this._buttonText);
        buttonInnerWrapper.appendChild(chevron);

        this._selectListEl = new Coral.SelectList();
        this._selectListEl.tracking = "off";

        // A flag to prevent infinite loop of `coral-selectlist:change` event.
        var internalSelectlistChangeEvent = false;

        var popover;

        this._selectListEl.on("coral-selectlist:change", function(e) {
            var selection = e.detail.selection;

            if (internalSelectlistChangeEvent) {
                internalSelectlistChangeEvent = false;
                return;
            }

            var item = $(selection).data("betty-breadcrumbs.internal.targetItem");

            internalSelectlistChangeEvent = true;

            // Remove the selection style.
            // Need to use rAF as the selectlist doesn't fully reflect its internal state
            // yet during `coral-selectlist:change`, which causes error in our handler.
            // This is unfortunate bad design from Coral.
            requestAnimationFrame(function() {
                // This will trigger `coral-selectlist:change`, and we have to break the loop
                // using `internalSelectlistChangeEvent`.
                selection.selected = false;
            });

            popover.open = false;

            if (item.selected) {
                return;
            }

            item.selected = true;

            // Only trigger change event for user interaction to be consistent with native element,
            // which is to prevent infinite loop.
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, false);
            self.dispatchEvent(event);

            tracker.trackEvent({
                element: item.trackingElement || item.textContent.trim(),
                type: "breadcrumbs-item",
                action: "change",
                widget: {
                    name: self.trackingElement,
                    type: "breadcrumbs"
                },
                feature: self.trackingFeature
            });
        });

        popover = new Coral.Popover().set({
            target: this._button,
            alignMy: "center top",
            alignAt: "center top",
            tracking: "off"
        });
        popover.classList.add("betty-breadcrumbs-popover");
        popover.content.appendChild(this._selectListEl);

        popover.on("coral-overlay:beforeopen", function() {
            self._updateSelectList();
        });
        popover.on("coral-overlay:open", function() {
            var selectedItem = self.selectedItem;

            var element;
            if (selectedItem) {
                element = selectedItem.trackingElement || selectedItem.textContent.trim();
            } else {
                element = "";
            }

            tracker.trackEvent({
                element: element,
                type: "breadcrumbs-popover",
                action: "open",
                widget: {
                    name: self.trackingElement,
                    type: "breadcrumbs"
                },
                feature: self.trackingFeature
            });
        });
        popover.on("coral-overlay:close", function() {
            var selectedItem = self.selectedItem;

            var element;
            if (selectedItem) {
                element = selectedItem.trackingElement || selectedItem.textContent.trim();
            } else {
                element = "";
            }

            tracker.trackEvent({
                element: element,
                type: "breadcrumbs-popover",
                action: "close",
                widget: {
                    name: self.trackingElement,
                    type: "breadcrumbs"
                },
                feature: self.trackingFeature
            });
        });

        this.insertBefore(popover, this.firstChild);
        this.insertBefore(this._button, this.firstChild);

        this._isItemDirty = true;
    };

    Prototype.attributeChangedCallback = function(name, oldVal, newVal) {
        if (name === "icon") {
            this._icon.icon = newVal;
            return;
        }
    };

    Object.defineProperties(Prototype, {
        icon: PropertyBuilder.createAttrBasedProperty("icon", ""),

        selectedItem: {
            get: function() {
                var result = null;

                $(this).children("betty-breadcrumbs-item").each(function() {
                    if (this.selected) {
                        result = this;
                        return false;
                    }
                });

                return result;
            }
        },

        trackingFeature: PropertyBuilder.createAttrBasedProperty("trackingfeature", ""),

        trackingElement: PropertyBuilder.createAttrBasedProperty("trackingelement", "")
    });

    Prototype._onItemAttached = function(item) {
        this._isItemDirty = true;

        if (item.selected) {
            this._onSelect(item);
        } else if (!this.selectedItem) {
            item.selected = true;
        }

        this._updateButtonDisability();
    };

    Prototype._onItemDetached = function(item) {
        this._isItemDirty = true;

        if (item.selected) {
            this._onUnselect(item);
        }

        this._updateButtonDisability();
    };

    Prototype._onSelect = function(item) {
        $(this).children("betty-breadcrumbs-item").not(item).each(function() {
            this._selected = false;
        });
        this._updateButtonText(item);
    };

    Prototype._onUnselect = function(item) {
        $(this).children("betty-breadcrumbs-item").not(item).first().prop("selected", true);
    };

    Prototype._onButtonTextChange = function(item) {
        this._isItemDirty = true;

        if (this.selectedItem === item) {
            this._updateButtonText(item);
        }
    };

    Prototype._updateButtonDisability = function() {
        this._button.disabled = $(this).children("betty-breadcrumbs-item").length <= 1;
    };

    Prototype._updateButtonText = function(item) {
        this._buttonText.textContent = item.textContent;
    };

    Prototype._updateSelectList = function() {
        // The current approach is to recreate the selectlist items before the popover is shown.
        // The item size is not expected to be big, and the user is not going to open the popover often.
        // The item however is expected to be added or removed pretty often (due to SPA navigation).
        // So by only generating the selectlist items lazily, we perform better overall.

        if (!this._isItemDirty) {
            return;
        }

        var selectlist = this._selectListEl;
        selectlist.items.clear();

        $(this).children("betty-breadcrumbs-item").each(function() {
            var itemEl = new Coral.SelectList.Item();
            itemEl.classList.add("betty-breadcrumbs-selectlist-item");
            itemEl.content.textContent = this.textContent;
            $(itemEl).data("betty-breadcrumbs.internal.targetItem", this);

            selectlist.items.add(itemEl);
        });

        this._isItemDirty = false;
    };

    var Breadcrumbs = document.registerElement("betty-breadcrumbs", {
        prototype: Prototype
    });


    var ItemPrototype = Object.create(HTMLElement.prototype);

    ItemPrototype.createdCallback = function() {
        this._selected = false;

        this._watchDescendants();
    };

    ItemPrototype.attachedCallback = function() {
        if ($(this.parentElement).is("betty-breadcrumbs")) {
            this._parent = this.parentElement;
            this._parent._onItemAttached(this);
        }
    };

    ItemPrototype.detachedCallback = function() {
        if (this._parent) {
            this._parent._onItemDetached(this);
        }
        this._parent = null;
    };

    Object.defineProperties(ItemPrototype, {
        // Follow HTML Select behaviour
        selected: {
            get: function() {
                return this._selected;
            },
            set: function(val) {
                if (!!val === this._selected) {
                    return;
                }

                this._selected = !!val;

                if (this._parent) {
                    if (this._selected) {
                        this._parent._onSelect(this);
                    } else {
                        this._parent._onUnselect(this);
                    }
                }
            }
        },

        trackingElement: PropertyBuilder.createAttrBasedProperty("trackingelement", "")
    });

    ItemPrototype._watchDescendants = function() {
        var self = this;

        var observer = new MutationObserver(function(changes) {
            if (self._parent) {
                self._parent._onButtonTextChange(self);
            }
        });

        observer.observe(this, {
            childList: true
        });
    };

    Breadcrumbs.Item = document.registerElement("betty-breadcrumbs-item", {
        prototype: ItemPrototype
    });
})(document, Granite.$, Coral, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("click", ".granite-collection-deselect", function(e) {
        e.preventDefault();

        var target = this.dataset.graniteCollectionDeselectTarget;

        if (target) {
            var collection = $(target);
            var api = collection.adaptTo("foundation-selections");
            api.clear();
        }
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $, URITemplate) {
    "use strict";

    function navigateTo(collectionId, collection) {
        var collectionAPI = collection.adaptTo("foundation-collection");

        if (!("load" in collectionAPI)) {
            if (console) {
                // eslint-disable-next-line no-console
                console.warn("FoundationCollection#load is not implemented; do nothing.");
            }
        }

        collectionAPI.load(collectionId);
    }

    $(document).on("change", "betty-breadcrumbs.granite-collection-navigator", function(e) {
        var selectionEl = this.selectedItem;

        var collection = $(this.dataset.graniteCollectionNavigatorTarget);
        var collectionId = selectionEl.dataset.graniteCollectionNavigatorCollectionid;

        if (collectionId) {
            $(selectionEl).prevAll("betty-breadcrumbs-item").remove();
            navigateTo(collectionId, collection);
        } else {
            window.location = selectionEl.dataset.graniteCollectionNavigatorHref;
        }
    });

    function updateNavigatorFromColumnView(control, collection) {
        var targetId = collection[0].dataset.foundationCollectionId;

        if (targetId.startsWith("parentof:")) {
            // When we have a special `parentof:` id, it means the column is representing a special root column.
            // So for the navigator purpose, we just need to select the navigator item based of the actual columnId.
            targetId = targetId.substring("parentof:".length);
        }

        var targetSelectItem = control.children("betty-breadcrumbs-item").filter(function() {
            return this.dataset.graniteCollectionNavigatorCollectionid === targetId;
        });

        if (targetSelectItem.length) {
            // The case of navigating to an ancestor.
            targetSelectItem.prop("selected", true);
            targetSelectItem.prevAll("betty-breadcrumbs-item").remove();
            return;
        }

        var targetItem = collection.find(".foundation-collection-item").filter(function() {
            return this.dataset.foundationCollectionItemId === targetId;
        });
        var targetParentId;
        var targetParentSelectItem;
        if (targetItem.length) {
            targetParentId = targetItem
                .closest("coral-columnview-column")[0]
                .dataset.foundationLayoutColumnviewColumnid;
            targetParentSelectItem = control.children("betty-breadcrumbs-item").filter(function() {
                return this.dataset.graniteCollectionNavigatorCollectionid === targetParentId;
            });
        }

        if (!targetParentId || !targetParentSelectItem || targetParentSelectItem.length === 0) {
            // We need to reconstruct the breadcrumbs as we are not having a parent;
            // This means the columnview has loaded new items
            // We keep the root
            targetParentSelectItem = null;

            var root = control.children("betty-breadcrumbs-item").last();
            var rootText = root[0].textContent;
            var rootId = root[0].dataset.graniteCollectionNavigatorCollectionid;
            root = null;
            control.children("betty-breadcrumbs-item").remove();
            var columns = collection.children("coral-columnview-column");

            columns.each(function(index, column) {
                if (index < columns.length - 1) {
                    var nextColumn = columns[index + 1];
                    var itemEl = document.createElement("betty-breadcrumbs-item");
                    var item = $(itemEl);
                    var selectedParentItem = $(column)
                        .find(".foundation-collection-item[data-foundation-collection-item-id='" +
                        nextColumn.dataset.foundationLayoutColumnviewColumnid + "']");
                    if (selectedParentItem.length) {
                        itemEl.textContent = selectedParentItem.find(".foundation-collection-item-title").text();
                        itemEl.dataset.graniteCollectionNavigatorCollectionid = selectedParentItem[0]
                            .dataset.foundationCollectionItemId;
                    }
                    targetParentSelectItem !== null ? targetParentSelectItem.before(itemEl) : control.append(item);
                    targetParentSelectItem = item;
                } else {
                    if (targetParentSelectItem && targetParentSelectItem.length) {
                        targetParentSelectItem[0].selected = true;
                    }

                    // Restore the root
                    itemEl = document.createElement("betty-breadcrumbs-item");
                    itemEl.textContent = rootText;
                    itemEl.dataset.graniteCollectionNavigatorCollectionid = rootId;
                    control.append(itemEl);
                }
            });
            return;
        }

        var currentSelectItem = targetParentSelectItem.prev("betty-breadcrumbs-item");
        var updateSelectItem = function(selectItemEl, newItemEl) {
            selectItemEl.textContent = $(newItemEl).find(".foundation-collection-item-title").text();
            selectItemEl.dataset.graniteCollectionNavigatorCollectionid = newItemEl.dataset.foundationCollectionItemId;

            selectItemEl.selected = true;
        };

        if (currentSelectItem.length) {
            // The case of navigating to a sibling.
            updateSelectItem(currentSelectItem[0], targetItem[0]);
            currentSelectItem.prevAll("betty-breadcrumbs-item").remove();
        } else {
            // The case of navigating to a child.
            var itemEl = document.createElement("betty-breadcrumbs-item");
            var item = $(itemEl);

            updateSelectItem(itemEl, targetItem[0]);
            targetParentSelectItem.before(itemEl);
            item.prevAll("betty-breadcrumbs-item").remove();
        }
    }

    function updateNavigator(control, collection) {
        var targetId = collection[0].dataset.foundationCollectionId;
        var items = control.children("betty-breadcrumbs-item");
        var targetSelectItem = items.filter(function() {
            return this.dataset.graniteCollectionNavigatorCollectionid === targetId;
        });

        if (targetSelectItem.length) {
            // The case of navigating to an ancestor.
            targetSelectItem.prop("selected", true);
            targetSelectItem.prevAll("betty-breadcrumbs-item").remove();
            return;
        }
        var getBreadcrumbItem = function(title, id, selected) {
            var itemEl = document.createElement("betty-breadcrumbs-item");
            itemEl.textContent = title;
            itemEl.dataset.graniteCollectionNavigatorCollectionid = id;
            itemEl.selected = selected;
            return itemEl;
        };
        // The case of navigating to a child.
        var tree = $(".shell-collectionpage-tree");
        if (tree.length) {
            var parentTree = tree[0].getParentIdTree(targetId);
            if (parentTree) {
                var pathsAreDifferent = false;
                var i = 0;
                // first easy check
                // if the path to the root is not the same length as the breadcrumbs that means we have a different path
                if (parentTree.length - 1 < items.length) {
                    pathsAreDifferent = true;
                }
                if (!pathsAreDifferent) {
                    // We ignore the root and the targetItem;
                    var reverseItems = parentTree.slice(0).reverse();
                    // We remove the target element
                    reverseItems.shift();
                    for (i = 0; i < parentTree.length - 1; ++i) {
                        if (reverseItems[i].id !== items[i].dataset.graniteCollectionNavigatorCollectionid) {
                            pathsAreDifferent = true;
                            break;
                        }
                    }
                }
                if (pathsAreDifferent) {
                    // We need to reload all the path;
                    for (i = 0; i < items.length - 1; ++i) {
                        $(items[i]).remove();
                    }

                    var newItem;
                    var rootItem = items[items.length - 1];
                    for (i = 1; i < parentTree.length; ++i) {
                        newItem = getBreadcrumbItem(parentTree[i].title, parentTree[i].id);
                        $(rootItem).before(newItem);
                        rootItem = newItem;
                    }
                    newItem.selected = true;
                    return;
                }
            }
        }

        var meta = collection.adaptTo("foundation-collection-meta");

        if (!meta) {
            return;
        }

        var itemEl = getBreadcrumbItem(meta.getTitle(), targetId, true);
        control.children("betty-breadcrumbs-item:first-of-type").before(itemEl);
    }

    function updateHistory(control, collection, title) {
        var state = History.getState();
        var currentConfig = state.data.shellCollection;

        var targetId = collection[0].dataset.foundationCollectionId;

        if (currentConfig && currentConfig.id === targetId) {
            return;
        }

        var src = control[0].dataset.graniteCollectionPagetitleSrc;
        if (!src) {
            return;
        }

        var pageTitle = control[0].dataset.graniteCollectionPagetitleBase;
        if (title) {
            pageTitle += " | " + title;
        }

        var url = URITemplate.expand(src, {
            id: targetId
        });

        History.pushState({
            shellCollection: {
                id: targetId,
                target: control[0].dataset.graniteCollectionPagetitleTarget
            }
        }, pageTitle, url);


        // Note that there is no change of the page hierarchy from tracking POV
        // when navigating the collection, so we simply reuse.
        var json = $("meta[name='foundation.tracking.page']", document.head).attr("content");
        if (json) {
            var pageData = JSON.parse(json);
            pageData.assetId = targetId;

            var tracker = $(window).adaptTo("foundation-tracker");
            tracker.trackPage(pageData);
        }
    }

    $(function() {
        var controlEl = document.head.querySelector(".granite-collection-pagetitle");

        if (!controlEl) {
            return;
        }

        var state = History.getState();

        var target = controlEl.dataset.graniteCollectionPagetitleTarget;
        var collectionEl = document.querySelector(target);
        var id = collectionEl.dataset.foundationCollectionId;

        state.data.shellCollection = {
            id: id,
            target: target
        };

        History.replaceState(state.data);

        $(window).on("statechange", function() {
            var state = History.getState();

            var config = state.data.shellCollection;

            if (!config) {
                return;
            }

            var collection = $(config.target);

            if (!collection[0] || collection[0].dataset.foundationCollectionId === config.id) {
                return;
            }

            var api = collection.adaptTo("foundation-collection");
            api.load(config.id);
        });
    });

    $(document).on("foundation-collection-navigate", ".foundation-collection", function(e) {
        var collection = $(this);

        $(".granite-collection-navigator").each(function() {
            var navigator = $(this);

            if (!collection.is(this.dataset.graniteCollectionNavigatorTarget)) {
                return;
            }

            if (collection.hasClass("foundation-layout-columnview")) {
                updateNavigatorFromColumnView(navigator, collection);
            } else {
                updateNavigator(navigator, collection);
            }
        });

        $(".granite-collection-pagetitle").each(function() {
            var control = $(this);

            if (!collection.is(this.dataset.graniteCollectionPagetitleTarget)) {
                return;
            }

            updateHistory(control, collection);
        });
    });
})(document, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, Granite, $, URITemplate) {
    "use strict";

    $(document).on("coral-cyclebutton:change", ".granite-collection-switcher", function(e) {
        var detail = e.originalEvent.detail;
        var selectedEl = detail.selection;

        var controlEl = this;
        var target = controlEl.dataset.graniteCollectionSwitcherTarget;
        var src = selectedEl.dataset.graniteCollectionSwitcherSrc;

        if (!src || !target) {
            return;
        }

        var collection = $(target);

        var selectionIds = Array.prototype.map.call(collection.find(".foundation-selections-item"), function(v) {
            return v.dataset.foundationCollectionItemId;
        });

        var variables = {
            id: collection[0].dataset.foundationCollectionId
        };

        var collectionAPI = collection.adaptTo("foundation-collection");
        var pagination = "getPagination" in collectionAPI ? collectionAPI.getPagination() : null;

        if (pagination && selectionIds.length) {
            variables.offset = 0;
            variables.limit = pagination.offset;
        }

        var url = URITemplate.expand(src, variables);

        Granite.UI.Foundation.Layouts.cleanAll(collection[0]);

        $.ajax({
            url: url,
            cache: false
        }).then(function(html) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            parser.parse(html).then(function(fragment) {
                var newCollection = $(fragment).children();

                newCollection.replaceAll(collection);

                if (selectionIds.length) {
                    // Temporary solution to restore selection without triggering "foundation-selections-change" twice
                    newCollection.data("foundation-layout-collection-switcher.internal.selectionIds", selectionIds);
                }

                newCollection.trigger("foundation-contentloaded");

                newCollection.removeData("foundation-layout-collection-switcher.internal.selectionIds");
            });
        }, function() {
            var title = Granite.I18n.get("Error");
            var message = Granite.I18n.get("Fail to load data.");

            var ui = $(window).adaptTo("foundation-ui");
            ui.alert(title, message, "error");
        });
    });
})(document, Granite, Granite.$, Granite.URITemplate);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("foundation-selections-change", ".foundation-collection", function() {
        var collection = $(this);
        var api = collection.adaptTo("foundation-selections");

        // Hide the create button during selection mode.
        var hidden = api.count() > 0;

        $(".granite-collection-create")
            .filter(function() {
                return collection.is(this.dataset.graniteCollectionCreateTarget);
            }).each(function() {
                if (hidden) {
                    this.classList.add("granite-collection-create-hidden");
                } else {
                    this.classList.remove("granite-collection-create-hidden");
                }
            });
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    $(document).on("foundation-collection-newpage", function(e) {
        var collection = $(e.target);

        var foundationCollection = collection.adaptTo("foundation-collection");
        var pagination;

        if (foundationCollection.getPagination) {
            pagination = foundationCollection.getPagination();
        }

        $("granite-pagingstatus.granite-collection-pagingstatus").each(function() {
            var statusEl = this;
            var target = statusEl.getAttribute("data-granite-collection-pagingstatus-target");

            if (!target || !collection.is(target)) {
                return;
            }

            if (!pagination) {
                var itemCount = collection.find(".foundation-collection-item").length;

                pagination = {
                    offset: itemCount,
                    guessTotal: itemCount,
                    hasNext: false
                };
            }

            statusEl.current = pagination.offset;
            statusEl.guessTotal = pagination.guessTotal;

            // When `pagination.hasNext = null`, use heuristic to guess `hasNext`.
            if (pagination.hasNext === null) {
                statusEl.hasNext = pagination.guessTotal > 1000;
            } else {
                statusEl.hasNext = pagination.hasNext;
            }
        });
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(document).on("coral-cyclebutton:change", ".granite-toggleable-control", function(e) {
        var control = $(this);
        var selectedEl = e.originalEvent.detail.selection;

        var action = selectedEl.dataset.graniteToggleableControlAction;

        if (action === "navigate") {
            window.location.href = selectedEl.dataset.graniteToggleableControlHref;
            return;
        }

        var targetSelector = selectedEl.dataset.graniteToggleableControlTarget;

        if (!targetSelector) {
            return;
        }

        var el = $(targetSelector);
        var api = el.adaptTo("foundation-toggleable");

        // Save the selected rail target name in the cookies.
        var saveKey = this.dataset.graniteToggleableControlSavekey;
        if (saveKey) {
            $.cookie(saveKey, selectedEl.dataset.graniteToggleableControlName || "", { expires: 7, path: "/" });
        }

        // @coral Workaround: Use rAF here to wait for Coral3 component upgrade
        requestAnimationFrame(function() {
            if (action === undefined) {
                // Do a toggle
                if (api.isOpen()) {
                    action = "hide";
                } else {
                    action = "show";
                }
            }

            if (action === "show") {
                api.show(control[0]);
            } else if (action === "hide") {
                api.hide();
            }
        });
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var PropertyBuilder = $(window).adaptTo("foundation-util-propertybuilder");

    var Prototype = Object.create(HTMLElement.prototype);

    Prototype.createdCallback = function() {
        this._render();

        // Call attributeChangedCallback to handle initial setup
        var attributes = this.attributes;
        for (var i = 0; i < attributes.length; i++) {
            this.attributeChangedCallback(attributes[i].name, undefined, attributes[i].value);
        }
    };

    Prototype.attributeChangedCallback = function(name, oldVal, newVal) {
        switch (name) {
            case "current":
            case "guesstotal":
            case "hasnext":
                this._render();
                break;
        }
    };

    Object.defineProperties(Prototype, {
        current: new PropertyBuilder(PropertyBuilder.createAttrBasedProperty("current"))
            .mix(PropertyBuilder.integerType(-1))
            .build(),

        guessTotal: new PropertyBuilder(PropertyBuilder.createAttrBasedProperty("guesstotal"))
            .mix(PropertyBuilder.integerType(-1))
            .build(),

        hasNext: PropertyBuilder.createBooleanAttrBasedProperty("hasnext")
    });

    Prototype._render = function() {
        var totalString = "" + this.guessTotal;
        if (this.hasNext) {
            totalString += "+";
        }

        this.textContent = Granite.I18n.get("{0} of {1}", [ this.current, totalString ]);
    };


    document.registerElement("granite-pagingstatus", {
        prototype: Prototype
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var $window = $(window);
    var keyboard = $window.adaptTo("foundation-util-keyboard");
    var registry = $window.adaptTo("foundation-registry");

    // registers the pulldown items as a valid foundation-command
    registry.register("foundation.adapters", {
        type: "foundation-command",
        selector: ".granite-pulldown-overlay [data-foundation-command]",
        adapter: function(el) {
            var $el = $(el);
            var $toggleableControl = $el.closest(".granite-pulldown-overlay").prev();
            var shortcutHint;

            return {
                enhanceUI: function() {
                    if (!el.dataset.foundationCommandLabel) {
                        // we save the existing text to make sure that getLabel() returns the correct value
                        var title = el.textContent.trim();
                        el.dataset.foundationCommandLabel = title;
                    }

                    // if the hint has already been initialized there is nothing left to do
                    if (shortcutHint) {
                        return;
                    }

                    // makes sure that the shortcut is displayed with the operating system in mind
                    var shortcut = keyboard.normalize(this.getShortcut());

                    shortcutHint = document.createElement("span");
                    shortcutHint.classList.add("granite-command-alignRight");
                    shortcutHint.textContent = shortcut;

                    // we need to insertBefore for all browsers to handle the float correctly
                    if (el.content) {
                        el.content.insertBefore(shortcutHint, el.content.firstChild);
                    } else {
                        el.insertBefore(shortcutHint, el.firstChild);
                    }
                },

                execute: function() {
                    $el.click();
                },

                getLabel: function() {
                    var label = el.dataset.foundationCommandLabel || el.textContent.trim();
                    return Granite.I18n.get("{0} {1}", [ $toggleableControl.text().trim(), label ]);
                },

                getShortcut: function() {
                    return el.dataset.foundationCommand;
                },

                isActive: function() {
                    return $toggleableControl.is(":visible") &&
                        !$el.prop("hidden") &&
                        !$el.hasClass("foundation-collection-action-hidden");
                }
            };
        }
    });

    // Hides pulldown activator when all items are hidden.
    function checkOverlayActivator(overlayEl) {
        var overlay = $(overlayEl);
        var hidden = true;

        overlay.find("a[is='coral-anchorlist-item']").each(function() {
            if ($(this).css("display") !== "none") {
                hidden = false;
            }
        });

        // hiding the overlay here, if it is not open, leads to bugs like this one:
        // https://jira.corp.adobe.com/browse/CQ-4207218
        if (hidden && overlayEl.open === true) {
            overlayEl.open = false;
        }

        var activator = overlay.prev();
        activator.prop("hidden", hidden);
    }

    function observe(overlayEl) {
        var observer = new MutationObserver(function(mutations) {
            var hasChange = mutations.some(function(v) {
                return v.target instanceof Coral.AnchorList.Item;
            });

            if (!hasChange) {
                return;
            }

            checkOverlayActivator(overlayEl);
        });

        observer.observe(overlayEl, {
            attributes: true,
            subtree: true,
            attributeFilter: [ "hidden", "class" ]
        });

        checkOverlayActivator(overlayEl);
    }

    var initMap = new WeakMap();

    $(document).on("foundation-contentloaded", function(e) {
        $(".granite-pulldown-overlay", e.target).each(function() {
            if (initMap.has(this)) {
                return;
            }

            observe(this);
            initMap.set(this, true);
        });
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var $window = $(window);
    var keyboard = $window.adaptTo("foundation-util-keyboard");
    var registry = $window.adaptTo("foundation-registry");

    // registers the granite-ActionGroup items as a valid foundation-command
    registry.register("foundation.adapters", {
        type: "foundation-command",
        selector: ".granite-ActionGroup-item[data-foundation-command]",
        adapter: function(el) {
            var $el = $(el);
            var $actionGroup = $el.closest(".granite-ActionGroup");
            var shortcutHint;

            return {
                enhanceUI: function() {
                    if (!el.dataset.foundationCommandLabel) {
                        // we save the existing text to make sure that getLabel() returns the correct value
                        var title = el.textContent.trim();
                        el.dataset.foundationCommandLabel = title;
                    }

                    // if the hint has already been initialized there is nothing left to do
                    if (shortcutHint) {
                        return;
                    }

                    // makes sure that the shortcut is displayed with the operating system in mind
                    var shortcut = keyboard.normalize(this.getShortcut());

                    shortcutHint = document.createElement("span");
                    shortcutHint.classList.add("granite-command-alignRight");
                    shortcutHint.textContent = shortcut;

                    // we need to insertBefore for all browsers to handle the float correctly
                    if (el.content) {
                        el.content.insertBefore(shortcutHint, el.content.firstChild);
                    } else {
                        el.insertBefore(shortcutHint, el.firstChild);
                    }
                },

                execute: function() {
                    $el.click();
                },

                getLabel: function() {
                    return el.dataset.foundationCommandLabel || el.textContent.trim();
                },

                getShortcut: function() {
                    return el.dataset.foundationCommand;
                },

                isActive: function() {
                    return $actionGroup.is(":visible") && !$el.prop("hidden") && !$el.prop("disabled");
                }
            };
        }
    });

    $(document).on("click", ".granite-ActionGroup-item", function(e) {
        var popover = $(e.target).closest("coral-popover");
        popover.hide();
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $, Granite) {
    "use strict";

    var everyReverse = Granite.UI.Foundation.Utils.everyReverse;
    var registry = $(window).adaptTo("foundation-registry");

    $(document).on("click", ".granite-form-saveactivator", function(e) {
        var el = this;
        var href = el.dataset.graniteFormSaveactivatorHref;

        var form = $("#" + el.getAttribute("form"));
        form.addClass("granite-form-saveactivator-form");

        if (href) {
            form.attr("data-granite-form-saveactivator-form-redirect", href);
        } else {
            form.removeAttr("data-granite-form-saveactivator-form-redirect");
        }
    });

    $(document).on("foundation-form-submitted", ".granite-form-saveactivator-form", function(e, status, xhr) {
        if (!status) {
            return;
        }

        var form = $(this);
        var config = form.data("foundationFormResponseUiSuccess") ||
                     form.children(".foundation-form-response-ui-success").data("foundationFormResponseUiSuccess");

        // Call redirect only if the user hasn't defined a success handler
        if (config) {
            return;
        }

        var redirectUrl = this.dataset.graniteFormSaveactivatorFormRedirect;

        if (redirectUrl) {
            config = {
                name: "foundation.redirect",
                href: redirectUrl
            };

            var messenger = $(window).adaptTo("foundation-util-messenger");
            messenger.put(null, Granite.I18n.get("The form has been submitted successfully"), "success");
        } else {
            config = {
                name: "foundation.reload"
            };
        }

        everyReverse(registry.get("foundation.form.response.ui.success"), function(c) {
            if (c.name !== config.name) {
                return true;
            }
            return c.handler.call(form[0], form[0], config) === false;
        });
    });
})(window, document, Granite.$, Granite);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    var stackMap = new WeakMap();

    function clearSelection(dialog, result) {
        var collectionSelector = dialog[0].dataset.granitePickerdialogCollection;

        if (collectionSelector) {
            var selectionAPI = $(collectionSelector).adaptTo("foundation-selections");

            if (selectionAPI) {
                selectionAPI.clear();
            }
        }

        return {
            clean: function() {
                // Do nothing
            },
            replace: function(result) {
                // Do nothing
            }
        };
    }

    function handleActionBar(dialog, result) {
        var center = result.filter("#granite-pickerdialog-search-result-titlebar-center");
        var right = result.filter("#granite-pickerdialog-search-result-titlebar-right");

        var titlebar = dialog.find(".granite-pickerdialog-titlebar");
        var prevCenter = titlebar.children("betty-titlebar-title");
        var prevRight = titlebar.children("betty-titlebar-secondary");

        if (center.length) {
            prevCenter.prop("hidden", true).after(center);
            prevRight.prop("hidden", true).after(right);
        }

        titlebar.trigger("foundation-contentloaded");

        return {
            clean: function() {
                prevCenter.prop("hidden", false);
                center.remove();

                prevRight.prop("hidden", false);
                right.remove();
            },
            replace: function(result) {
                center = result.filter("#granite-pickerdialog-search-result-titlebar-center").replaceAll(center);
                right = result.filter("#granite-pickerdialog-search-result-titlebar-right").replaceAll(right);
                titlebar.trigger("foundation-contentloaded");
            }
        };
    }

    function handleContent(dialog, result) {
        var content = result.filter("#granite-pickerdialog-search-result-content");
        var prevContent = dialog.find(".granite-pickerdialog-content .foundation-layout-panel-content");
        prevContent.prop("hidden", true);

        content
            .insertAfter(prevContent)
            .trigger("foundation-contentloaded");

        return {
            clean: function() {
                content.remove();
                prevContent.prop("hidden", false);
            },
            replace: function(result) {
                content = result.filter("#granite-pickerdialog-search-result-content")
                    .replaceAll(content)
                    .trigger("foundation-contentloaded");
            }
        };
    }

    function handleSearchField(dialog, result) {
        var searchField = dialog.find(".granite-pickerdialog-searchfield");
        var button = searchField.children("[foundation-autocomplete-button]");

        var prevIcon = button.prop("icon");

        var title = Granite.I18n.get("Close Search");

        button.prop("tabIndex", 0);
        button.prop("icon", "closeCircle");
        button.attr("title", title);
        button.attr("aria-label", title);
        button.removeAttr("role");

        var f = function(e) {
            e.preventDefault();
            this.blur();
            close(dialog);
        };

        button.on("click", f);

        return {
            clean: function() {
                var fieldAPI = searchField.adaptTo("foundation-field");
                if (fieldAPI) {
                    fieldAPI.setValue("");
                }

                button.prop("tabIndex", -1);
                button.prop("icon", prevIcon);
                button.removeAttr("title");
                button.removeAttr("aria-label");
                button.attr("role", "presentation");
                button.off("click", f);
            },
            replace: function(result) {
                // do nothing
            }
        };
    }

    function close(dialog) {
        var dialogEl = dialog[0];

        var stack = stackMap.get(dialogEl);
        if (stack) {
            Granite.UI.Foundation.Utils.everyReverse(stack, function(v) {
                v.clean();
                return true;
            });
        }

        stackMap.delete(dialogEl);
    }

    $(window).adaptTo("foundation-registry").register("foundation.form.response.ui.success", {
        name: "granite.pickerdialog.search.result",
        handler: function(formEl, config, data, textStatus, xhr, parsedResponse) {
            var parser = $(window).adaptTo("foundation-util-htmlparser");

            parser.parse(parsedResponse).then(function(fragment) {
                var result = $(fragment).children();

                var dialog = $(formEl).closest(".granite-pickerdialog");
                var dialogEl = dialog[0];

                var stack = stackMap.get(dialogEl);

                if (stack) {
                    stack.forEach(function(v) {
                        v.replace(result);
                    });
                } else {
                    stack = [];
                    stack.push(clearSelection(dialog, result));
                    stack.push(handleActionBar(dialog, result));
                    stack.push(handleContent(dialog, result));
                    stack.push(handleSearchField(dialog, result));

                    stackMap.set(dialogEl, stack);
                }
            });
        }
    });

    $(document).on("click", ".granite-pickerdialog-search-close", function(e) {
        e.preventDefault();

        var dialog = $(this).closest(".granite-pickerdialog");
        close(dialog);
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(document, $) {
    "use strict";

    function createTemplater(template) {
        return function(data) {
            if (!template) {
                return "";
            }
            return template.replace("{{count}}", data.count);
        };
    }

    function updateStatus(status, collection) {
        var templater = createTemplater(status.data("foundationAdminSelectionstatusTemplate"));
        var selectionsAPI = collection.adaptTo("foundation-selections");
        var selectedItemsCount = selectionsAPI.count();
        if (collection[0].dataset.foundationSelectionsSelectallMode === "true") {
            var collectionAPI = collection.adaptTo("foundation-collection");
            var paginationAPI = collectionAPI.getPagination();
            // in select all mode, when guessTotal is unavailable, add the + sign to show that there are more items
            // selected then what is loaded in the UI
            if (paginationAPI && !paginationAPI.guessTotal && paginationAPI.hasNext) {
                selectedItemsCount += "+";
            }
        }
        status.html(templater({
            count: selectedItemsCount
        }));
    }

    $(document).on("foundation-selections-change", ".foundation-collection", function() {
        var collection = $(this);

        $(".foundation-admin-selectionstatus")
            .filter(function() {
                return collection.is($(this).data("foundationAdminSelectionstatusTarget"));
            }).each(function() {
                var status = $(this);
                updateStatus(status, collection);
            });
    });
})(document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, $) {
    "use strict";

    $(document).on("foundation-form-submitted", "#granite-user-preferences", function(e, status) {
        if (!status) {
            return;
        }

        var form = $(this);
        var values = form.serializeArray();

        var api = $(window).adaptTo("foundation-preference");

        api.setAll(values.reduce(function(memo, v) {
            memo.set(v.name, v.value);
            return memo;
        }, new Map()));

        // Trigger `user-preferences-changed` for compatibility
        $(document).trigger($.Event("user-preferences-changed", {
            userPreferences: values
        }));

        setTimeout(function() {
            window.location.reload();
        }, 100);
    });
})(window, document, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
(function(window, document, navigator) {
    "use strict";

    // Chrome has a memory leak which can be prevented by clearing the document before leaving the page
    // See also https://code.google.com/p/chromium/issues/detail?id=270000

    var isChrome = window.chrome && /Google/.test(navigator.vendor) && !/OPR|Edge/.test(navigator.userAgent);
    if (isChrome) {
        window.addEventListener("unload", function() {
            document.documentElement.innerHTML = "";
        });
    }
})(window, document, navigator);



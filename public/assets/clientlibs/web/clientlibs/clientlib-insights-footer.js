/*!
Waypoints - 4.0.0
Copyright Â© 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/

!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=e?void 0:this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var r in t){var s=t[r];for(var a in this.waypoints[r]){var l,h,p,u,c,d=this.waypoints[r][a],f=d.options.offset,w=d.triggerPoint,y=0,g=null==w;d.element!==d.element.window&&(y=d.adapter.offset()[s.offsetProp]),"function"==typeof f?f=f.apply(d):"string"==typeof f&&(f=parseFloat(f),d.options.offset.indexOf("%")>-1&&(f=Math.ceil(s.contextDimension*f/100))),l=s.contextScroll-s.contextOffset,d.triggerPoint=y+l-f,h=w<s.oldScroll,p=d.triggerPoint>=s.oldScroll,u=h&&p,c=!h&&!p,!g&&u?(d.queueTrigger(s.backward),o[d.group.id]=d.group):!g&&c?(d.queueTrigger(s.forward),o[d.group.id]=d.group):g&&s.oldScroll>=d.triggerPoint&&(d.queueTrigger(s.forward),o[d.group.id]=d.group)}}return n.requestAnimationFrame(function(){for(var t in o)o[t].flushTriggers()}),this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
/*!
 * Isotope PACKAGED v3.0.1
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2016 Metafizzy
 */

!function(t,e){"use strict";"function"==typeof define&&define.amd?define("jquery-bridget/jquery-bridget",["jquery"],function(i){e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("jquery")):t.jQueryBridget=e(t,t.jQuery)}(window,function(t,e){"use strict";function i(i,s,a){function u(t,e,n){var o,s="$()."+i+'("'+e+'")';return t.each(function(t,u){var h=a.data(u,i);if(!h)return void r(i+" not initialized. Cannot call methods, i.e. "+s);var d=h[e];if(!d||"_"==e.charAt(0))return void r(s+" is not a valid method");var l=d.apply(h,n);o=void 0===o?l:o}),void 0!==o?o:t}function h(t,e){t.each(function(t,n){var o=a.data(n,i);o?(o.option(e),o._init()):(o=new s(n,e),a.data(n,i,o))})}a=a||e||t.jQuery,a&&(s.prototype.option||(s.prototype.option=function(t){a.isPlainObject(t)&&(this.options=a.extend(!0,this.options,t))}),a.fn[i]=function(t){if("string"==typeof t){var e=o.call(arguments,1);return u(this,t,e)}return h(this,t),this},n(a))}function n(t){!t||t&&t.bridget||(t.bridget=i)}var o=Array.prototype.slice,s=t.console,r="undefined"==typeof s?function(){}:function(t){s.error(t)};return n(e||t.jQuery),i}),function(t,e){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",e):"object"==typeof module&&module.exports?module.exports=e():t.EvEmitter=e()}("undefined"!=typeof window?window:this,function(){function t(){}var e=t.prototype;return e.on=function(t,e){if(t&&e){var i=this._events=this._events||{},n=i[t]=i[t]||[];return-1==n.indexOf(e)&&n.push(e),this}},e.once=function(t,e){if(t&&e){this.on(t,e);var i=this._onceEvents=this._onceEvents||{},n=i[t]=i[t]||{};return n[e]=!0,this}},e.off=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=i.indexOf(e);return-1!=n&&i.splice(n,1),this}},e.emitEvent=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=0,o=i[n];e=e||[];for(var s=this._onceEvents&&this._onceEvents[t];o;){var r=s&&s[o];r&&(this.off(t,o),delete s[o]),o.apply(this,e),n+=r?0:1,o=i[n]}return this}},t}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("get-size/get-size",[],function(){return e()}):"object"==typeof module&&module.exports?module.exports=e():t.getSize=e()}(window,function(){"use strict";function t(t){var e=parseFloat(t),i=-1==t.indexOf("%")&&!isNaN(e);return i&&e}function e(){}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0;h>e;e++){var i=u[e];t[i]=0}return t}function n(t){var e=getComputedStyle(t);return e||a("Style returned "+e+". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),e}function o(){if(!d){d=!0;var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style.boxSizing="border-box";var i=document.body||document.documentElement;i.appendChild(e);var o=n(e);s.isBoxSizeOuter=r=200==t(o.width),i.removeChild(e)}}function s(e){if(o(),"string"==typeof e&&(e=document.querySelector(e)),e&&"object"==typeof e&&e.nodeType){var s=n(e);if("none"==s.display)return i();var a={};a.width=e.offsetWidth,a.height=e.offsetHeight;for(var d=a.isBorderBox="border-box"==s.boxSizing,l=0;h>l;l++){var f=u[l],c=s[f],m=parseFloat(c);a[f]=isNaN(m)?0:m}var p=a.paddingLeft+a.paddingRight,y=a.paddingTop+a.paddingBottom,g=a.marginLeft+a.marginRight,v=a.marginTop+a.marginBottom,_=a.borderLeftWidth+a.borderRightWidth,I=a.borderTopWidth+a.borderBottomWidth,z=d&&r,x=t(s.width);x!==!1&&(a.width=x+(z?0:p+_));var S=t(s.height);return S!==!1&&(a.height=S+(z?0:y+I)),a.innerWidth=a.width-(p+_),a.innerHeight=a.height-(y+I),a.outerWidth=a.width+g,a.outerHeight=a.height+v,a}}var r,a="undefined"==typeof console?e:function(t){console.error(t)},u=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"],h=u.length,d=!1;return s}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("desandro-matches-selector/matches-selector",e):"object"==typeof module&&module.exports?module.exports=e():t.matchesSelector=e()}(window,function(){"use strict";var t=function(){var t=Element.prototype;if(t.matches)return"matches";if(t.matchesSelector)return"matchesSelector";for(var e=["webkit","moz","ms","o"],i=0;i<e.length;i++){var n=e[i],o=n+"MatchesSelector";if(t[o])return o}}();return function(e,i){return e[t](i)}}),function(t,e){"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["desandro-matches-selector/matches-selector"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("desandro-matches-selector")):t.fizzyUIUtils=e(t,t.matchesSelector)}(window,function(t,e){var i={};i.extend=function(t,e){for(var i in e)t[i]=e[i];return t},i.modulo=function(t,e){return(t%e+e)%e},i.makeArray=function(t){var e=[];if(Array.isArray(t))e=t;else if(t&&"number"==typeof t.length)for(var i=0;i<t.length;i++)e.push(t[i]);else e.push(t);return e},i.removeFrom=function(t,e){var i=t.indexOf(e);-1!=i&&t.splice(i,1)},i.getParent=function(t,i){for(;t!=document.body;)if(t=t.parentNode,e(t,i))return t},i.getQueryElement=function(t){return"string"==typeof t?document.querySelector(t):t},i.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},i.filterFindElements=function(t,n){t=i.makeArray(t);var o=[];return t.forEach(function(t){if(t instanceof HTMLElement){if(!n)return void o.push(t);e(t,n)&&o.push(t);for(var i=t.querySelectorAll(n),s=0;s<i.length;s++)o.push(i[s])}}),o},i.debounceMethod=function(t,e,i){var n=t.prototype[e],o=e+"Timeout";t.prototype[e]=function(){var t=this[o];t&&clearTimeout(t);var e=arguments,s=this;this[o]=setTimeout(function(){n.apply(s,e),delete s[o]},i||100)}},i.docReady=function(t){var e=document.readyState;"complete"==e||"interactive"==e?t():document.addEventListener("DOMContentLoaded",t)},i.toDashed=function(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()};var n=t.console;return i.htmlInit=function(e,o){i.docReady(function(){var s=i.toDashed(o),r="data-"+s,a=document.querySelectorAll("["+r+"]"),u=document.querySelectorAll(".js-"+s),h=i.makeArray(a).concat(i.makeArray(u)),d=r+"-options",l=t.jQuery;h.forEach(function(t){var i,s=t.getAttribute(r)||t.getAttribute(d);try{i=s&&JSON.parse(s)}catch(a){return void(n&&n.error("Error parsing "+r+" on "+t.className+": "+a))}var u=new e(t,i);l&&l.data(t,o,u)})})},i}),function(t,e){"function"==typeof define&&define.amd?define("outlayer/item",["ev-emitter/ev-emitter","get-size/get-size"],e):"object"==typeof module&&module.exports?module.exports=e(require("ev-emitter"),require("get-size")):(t.Outlayer={},t.Outlayer.Item=e(t.EvEmitter,t.getSize))}(window,function(t,e){"use strict";function i(t){for(var e in t)return!1;return e=null,!0}function n(t,e){t&&(this.element=t,this.layout=e,this.position={x:0,y:0},this._create())}function o(t){return t.replace(/([A-Z])/g,function(t){return"-"+t.toLowerCase()})}var s=document.documentElement.style,r="string"==typeof s.transition?"transition":"WebkitTransition",a="string"==typeof s.transform?"transform":"WebkitTransform",u={WebkitTransition:"webkitTransitionEnd",transition:"transitionend"}[r],h={transform:a,transition:r,transitionDuration:r+"Duration",transitionProperty:r+"Property",transitionDelay:r+"Delay"},d=n.prototype=Object.create(t.prototype);d.constructor=n,d._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},d.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},d.getSize=function(){this.size=e(this.element)},d.css=function(t){var e=this.element.style;for(var i in t){var n=h[i]||i;e[n]=t[i]}},d.getPosition=function(){var t=getComputedStyle(this.element),e=this.layout._getOption("originLeft"),i=this.layout._getOption("originTop"),n=t[e?"left":"right"],o=t[i?"top":"bottom"],s=this.layout.size,r=-1!=n.indexOf("%")?parseFloat(n)/100*s.width:parseInt(n,10),a=-1!=o.indexOf("%")?parseFloat(o)/100*s.height:parseInt(o,10);r=isNaN(r)?0:r,a=isNaN(a)?0:a,r-=e?s.paddingLeft:s.paddingRight,a-=i?s.paddingTop:s.paddingBottom,this.position.x=r,this.position.y=a},d.layoutPosition=function(){var t=this.layout.size,e={},i=this.layout._getOption("originLeft"),n=this.layout._getOption("originTop"),o=i?"paddingLeft":"paddingRight",s=i?"left":"right",r=i?"right":"left",a=this.position.x+t[o];e[s]=this.getXValue(a),e[r]="";var u=n?"paddingTop":"paddingBottom",h=n?"top":"bottom",d=n?"bottom":"top",l=this.position.y+t[u];e[h]=this.getYValue(l),e[d]="",this.css(e),this.emitEvent("layout",[this])},d.getXValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&!e?t/this.layout.size.width*100+"%":t+"px"},d.getYValue=function(t){var e=this.layout._getOption("horizontal");return this.layout.options.percentPosition&&e?t/this.layout.size.height*100+"%":t+"px"},d._transitionTo=function(t,e){this.getPosition();var i=this.position.x,n=this.position.y,o=parseInt(t,10),s=parseInt(e,10),r=o===this.position.x&&s===this.position.y;if(this.setPosition(t,e),r&&!this.isTransitioning)return void this.layoutPosition();var a=t-i,u=e-n,h={};h.transform=this.getTranslate(a,u),this.transition({to:h,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},d.getTranslate=function(t,e){var i=this.layout._getOption("originLeft"),n=this.layout._getOption("originTop");return t=i?t:-t,e=n?e:-e,"translate3d("+t+"px, "+e+"px, 0)"},d.goTo=function(t,e){this.setPosition(t,e),this.layoutPosition()},d.moveTo=d._transitionTo,d.setPosition=function(t,e){this.position.x=parseInt(t,10),this.position.y=parseInt(e,10)},d._nonTransition=function(t){this.css(t.to),t.isCleaning&&this._removeStyles(t.to);for(var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)},d.transition=function(t){if(!parseFloat(this.layout.options.transitionDuration))return void this._nonTransition(t);var e=this._transn;for(var i in t.onTransitionEnd)e.onEnd[i]=t.onTransitionEnd[i];for(i in t.to)e.ingProperties[i]=!0,t.isCleaning&&(e.clean[i]=!0);if(t.from){this.css(t.from);var n=this.element.offsetHeight;n=null}this.enableTransition(t.to),this.css(t.to),this.isTransitioning=!0};var l="opacity,"+o(a);d.enableTransition=function(){if(!this.isTransitioning){var t=this.layout.options.transitionDuration;t="number"==typeof t?t+"ms":t,this.css({transitionProperty:l,transitionDuration:t,transitionDelay:this.staggerDelay||0}),this.element.addEventListener(u,this,!1)}},d.onwebkitTransitionEnd=function(t){this.ontransitionend(t)},d.onotransitionend=function(t){this.ontransitionend(t)};var f={"-webkit-transform":"transform"};d.ontransitionend=function(t){if(t.target===this.element){var e=this._transn,n=f[t.propertyName]||t.propertyName;if(delete e.ingProperties[n],i(e.ingProperties)&&this.disableTransition(),n in e.clean&&(this.element.style[t.propertyName]="",delete e.clean[n]),n in e.onEnd){var o=e.onEnd[n];o.call(this),delete e.onEnd[n]}this.emitEvent("transitionEnd",[this])}},d.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(u,this,!1),this.isTransitioning=!1},d._removeStyles=function(t){var e={};for(var i in t)e[i]="";this.css(e)};var c={transitionProperty:"",transitionDuration:"",transitionDelay:""};return d.removeTransitionStyles=function(){this.css(c)},d.stagger=function(t){t=isNaN(t)?0:t,this.staggerDelay=t+"ms"},d.removeElem=function(){this.element.parentNode.removeChild(this.element),this.css({display:""}),this.emitEvent("remove",[this])},d.remove=function(){return r&&parseFloat(this.layout.options.transitionDuration)?(this.once("transitionEnd",function(){this.removeElem()}),void this.hide()):void this.removeElem()},d.reveal=function(){delete this.isHidden,this.css({display:""});var t=this.layout.options,e={},i=this.getHideRevealTransitionEndProperty("visibleStyle");e[i]=this.onRevealTransitionEnd,this.transition({from:t.hiddenStyle,to:t.visibleStyle,isCleaning:!0,onTransitionEnd:e})},d.onRevealTransitionEnd=function(){this.isHidden||this.emitEvent("reveal")},d.getHideRevealTransitionEndProperty=function(t){var e=this.layout.options[t];if(e.opacity)return"opacity";for(var i in e)return i},d.hide=function(){this.isHidden=!0,this.css({display:""});var t=this.layout.options,e={},i=this.getHideRevealTransitionEndProperty("hiddenStyle");e[i]=this.onHideTransitionEnd,this.transition({from:t.visibleStyle,to:t.hiddenStyle,isCleaning:!0,onTransitionEnd:e})},d.onHideTransitionEnd=function(){this.isHidden&&(this.css({display:"none"}),this.emitEvent("hide"))},d.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},n}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("outlayer/outlayer",["ev-emitter/ev-emitter","get-size/get-size","fizzy-ui-utils/utils","./item"],function(i,n,o,s){return e(t,i,n,o,s)}):"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter"),require("get-size"),require("fizzy-ui-utils"),require("./item")):t.Outlayer=e(t,t.EvEmitter,t.getSize,t.fizzyUIUtils,t.Outlayer.Item)}(window,function(t,e,i,n,o){"use strict";function s(t,e){var i=n.getQueryElement(t);if(!i)return void(u&&u.error("Bad element for "+this.constructor.namespace+": "+(i||t)));this.element=i,h&&(this.$element=h(this.element)),this.options=n.extend({},this.constructor.defaults),this.option(e);var o=++l;this.element.outlayerGUID=o,f[o]=this,this._create();var s=this._getOption("initLayout");s&&this.layout()}function r(t){function e(){t.apply(this,arguments)}return e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e}function a(t){if("number"==typeof t)return t;var e=t.match(/(^\d*\.?\d*)(\w*)/),i=e&&e[1],n=e&&e[2];if(!i.length)return 0;i=parseFloat(i);var o=m[n]||1;return i*o}var u=t.console,h=t.jQuery,d=function(){},l=0,f={};s.namespace="outlayer",s.Item=o,s.defaults={containerStyle:{position:"relative"},initLayout:!0,originLeft:!0,originTop:!0,resize:!0,resizeContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}};var c=s.prototype;n.extend(c,e.prototype),c.option=function(t){n.extend(this.options,t)},c._getOption=function(t){var e=this.constructor.compatOptions[t];return e&&void 0!==this.options[e]?this.options[e]:this.options[t]},s.compatOptions={initLayout:"isInitLayout",horizontal:"isHorizontal",layoutInstant:"isLayoutInstant",originLeft:"isOriginLeft",originTop:"isOriginTop",resize:"isResizeBound",resizeContainer:"isResizingContainer"},c._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),n.extend(this.element.style,this.options.containerStyle);var t=this._getOption("resize");t&&this.bindResize()},c.reloadItems=function(){this.items=this._itemize(this.element.children)},c._itemize=function(t){for(var e=this._filterFindItemElements(t),i=this.constructor.Item,n=[],o=0;o<e.length;o++){var s=e[o],r=new i(s,this);n.push(r)}return n},c._filterFindItemElements=function(t){return n.filterFindElements(t,this.options.itemSelector)},c.getItemElements=function(){return this.items.map(function(t){return t.element})},c.layout=function(){this._resetLayout(),this._manageStamps();var t=this._getOption("layoutInstant"),e=void 0!==t?t:!this._isLayoutInited;this.layoutItems(this.items,e),this._isLayoutInited=!0},c._init=c.layout,c._resetLayout=function(){this.getSize()},c.getSize=function(){this.size=i(this.element)},c._getMeasurement=function(t,e){var n,o=this.options[t];o?("string"==typeof o?n=this.element.querySelector(o):o instanceof HTMLElement&&(n=o),this[t]=n?i(n)[e]:o):this[t]=0},c.layoutItems=function(t,e){t=this._getItemsForLayout(t),this._layoutItems(t,e),this._postLayout()},c._getItemsForLayout=function(t){return t.filter(function(t){return!t.isIgnored})},c._layoutItems=function(t,e){if(this._emitCompleteOnItems("layout",t),t&&t.length){var i=[];t.forEach(function(t){var n=this._getItemLayoutPosition(t);n.item=t,n.isInstant=e||t.isLayoutInstant,i.push(n)},this),this._processLayoutQueue(i)}},c._getItemLayoutPosition=function(){return{x:0,y:0}},c._processLayoutQueue=function(t){this.updateStagger(),t.forEach(function(t,e){this._positionItem(t.item,t.x,t.y,t.isInstant,e)},this)},c.updateStagger=function(){var t=this.options.stagger;return null===t||void 0===t?void(this.stagger=0):(this.stagger=a(t),this.stagger)},c._positionItem=function(t,e,i,n,o){n?t.goTo(e,i):(t.stagger(o*this.stagger),t.moveTo(e,i))},c._postLayout=function(){this.resizeContainer()},c.resizeContainer=function(){var t=this._getOption("resizeContainer");if(t){var e=this._getContainerSize();e&&(this._setContainerMeasure(e.width,!0),this._setContainerMeasure(e.height,!1))}},c._getContainerSize=d,c._setContainerMeasure=function(t,e){if(void 0!==t){var i=this.size;i.isBorderBox&&(t+=e?i.paddingLeft+i.paddingRight+i.borderLeftWidth+i.borderRightWidth:i.paddingBottom+i.paddingTop+i.borderTopWidth+i.borderBottomWidth),t=Math.max(t,0),this.element.style[e?"width":"height"]=t+"px"}},c._emitCompleteOnItems=function(t,e){function i(){o.dispatchEvent(t+"Complete",null,[e])}function n(){r++,r==s&&i()}var o=this,s=e.length;if(!e||!s)return void i();var r=0;e.forEach(function(e){e.once(t,n)})},c.dispatchEvent=function(t,e,i){var n=e?[e].concat(i):i;if(this.emitEvent(t,n),h)if(this.$element=this.$element||h(this.element),e){var o=h.Event(e);o.type=t,this.$element.trigger(o,i)}else this.$element.trigger(t,i)},c.ignore=function(t){var e=this.getItem(t);e&&(e.isIgnored=!0)},c.unignore=function(t){var e=this.getItem(t);e&&delete e.isIgnored},c.stamp=function(t){t=this._find(t),t&&(this.stamps=this.stamps.concat(t),t.forEach(this.ignore,this))},c.unstamp=function(t){t=this._find(t),t&&t.forEach(function(t){n.removeFrom(this.stamps,t),this.unignore(t)},this)},c._find=function(t){return t?("string"==typeof t&&(t=this.element.querySelectorAll(t)),t=n.makeArray(t)):void 0},c._manageStamps=function(){this.stamps&&this.stamps.length&&(this._getBoundingRect(),this.stamps.forEach(this._manageStamp,this))},c._getBoundingRect=function(){var t=this.element.getBoundingClientRect(),e=this.size;this._boundingRect={left:t.left+e.paddingLeft+e.borderLeftWidth,top:t.top+e.paddingTop+e.borderTopWidth,right:t.right-(e.paddingRight+e.borderRightWidth),bottom:t.bottom-(e.paddingBottom+e.borderBottomWidth)}},c._manageStamp=d,c._getElementOffset=function(t){var e=t.getBoundingClientRect(),n=this._boundingRect,o=i(t),s={left:e.left-n.left-o.marginLeft,top:e.top-n.top-o.marginTop,right:n.right-e.right-o.marginRight,bottom:n.bottom-e.bottom-o.marginBottom};return s},c.handleEvent=n.handleEvent,c.bindResize=function(){t.addEventListener("resize",this),this.isResizeBound=!0},c.unbindResize=function(){t.removeEventListener("resize",this),this.isResizeBound=!1},c.onresize=function(){this.resize()},n.debounceMethod(s,"onresize",100),c.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},c.needsResizeLayout=function(){var t=i(this.element),e=this.size&&t;return e&&t.innerWidth!==this.size.innerWidth},c.addItems=function(t){var e=this._itemize(t);return e.length&&(this.items=this.items.concat(e)),e},c.appended=function(t){var e=this.addItems(t);e.length&&(this.layoutItems(e,!0),this.reveal(e))},c.prepended=function(t){var e=this._itemize(t);if(e.length){var i=this.items.slice(0);this.items=e.concat(i),this._resetLayout(),this._manageStamps(),this.layoutItems(e,!0),this.reveal(e),this.layoutItems(i)}},c.reveal=function(t){if(this._emitCompleteOnItems("reveal",t),t&&t.length){var e=this.updateStagger();t.forEach(function(t,i){t.stagger(i*e),t.reveal()})}},c.hide=function(t){if(this._emitCompleteOnItems("hide",t),t&&t.length){var e=this.updateStagger();t.forEach(function(t,i){t.stagger(i*e),t.hide()})}},c.revealItemElements=function(t){var e=this.getItems(t);this.reveal(e)},c.hideItemElements=function(t){var e=this.getItems(t);this.hide(e)},c.getItem=function(t){for(var e=0;e<this.items.length;e++){var i=this.items[e];if(i.element==t)return i}},c.getItems=function(t){t=n.makeArray(t);var e=[];return t.forEach(function(t){var i=this.getItem(t);i&&e.push(i)},this),e},c.remove=function(t){var e=this.getItems(t);this._emitCompleteOnItems("remove",e),e&&e.length&&e.forEach(function(t){t.remove(),n.removeFrom(this.items,t)},this)},c.destroy=function(){var t=this.element.style;t.height="",t.position="",t.width="",this.items.forEach(function(t){t.destroy()}),this.unbindResize();var e=this.element.outlayerGUID;delete f[e],delete this.element.outlayerGUID,h&&h.removeData(this.element,this.constructor.namespace)},s.data=function(t){t=n.getQueryElement(t);var e=t&&t.outlayerGUID;return e&&f[e]},s.create=function(t,e){var i=r(s);return i.defaults=n.extend({},s.defaults),n.extend(i.defaults,e),i.compatOptions=n.extend({},s.compatOptions),i.namespace=t,i.data=s.data,i.Item=r(o),n.htmlInit(i,t),h&&h.bridget&&h.bridget(t,i),i};var m={ms:1,s:1e3};return s.Item=o,s}),function(t,e){"function"==typeof define&&define.amd?define("isotope/js/item",["outlayer/outlayer"],e):"object"==typeof module&&module.exports?module.exports=e(require("outlayer")):(t.Isotope=t.Isotope||{},t.Isotope.Item=e(t.Outlayer))}(window,function(t){"use strict";function e(){t.Item.apply(this,arguments)}var i=e.prototype=Object.create(t.Item.prototype),n=i._create;i._create=function(){this.id=this.layout.itemGUID++,n.call(this),this.sortData={}},i.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var t=this.layout.options.getSortData,e=this.layout._sorters;for(var i in t){var n=e[i];this.sortData[i]=n(this.element,this)}}};var o=i.destroy;return i.destroy=function(){o.apply(this,arguments),this.css({display:""})},e}),function(t,e){"function"==typeof define&&define.amd?define("isotope/js/layout-mode",["get-size/get-size","outlayer/outlayer"],e):"object"==typeof module&&module.exports?module.exports=e(require("get-size"),require("outlayer")):(t.Isotope=t.Isotope||{},t.Isotope.LayoutMode=e(t.getSize,t.Outlayer))}(window,function(t,e){"use strict";function i(t){this.isotope=t,t&&(this.options=t.options[this.namespace],this.element=t.element,this.items=t.filteredItems,this.size=t.size)}var n=i.prototype,o=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout","_getOption"];return o.forEach(function(t){n[t]=function(){return e.prototype[t].apply(this.isotope,arguments)}}),n.needsVerticalResizeLayout=function(){var e=t(this.isotope.element),i=this.isotope.size&&e;return i&&e.innerHeight!=this.isotope.size.innerHeight},n._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},n.getColumnWidth=function(){this.getSegmentSize("column","Width")},n.getRowHeight=function(){this.getSegmentSize("row","Height")},n.getSegmentSize=function(t,e){var i=t+e,n="outer"+e;if(this._getMeasurement(i,n),!this[i]){var o=this.getFirstItemSize();this[i]=o&&o[n]||this.isotope.size["inner"+e]}},n.getFirstItemSize=function(){var e=this.isotope.filteredItems[0];return e&&e.element&&t(e.element)},n.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},n.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},i.modes={},i.create=function(t,e){function o(){i.apply(this,arguments)}return o.prototype=Object.create(n),o.prototype.constructor=o,e&&(o.options=e),o.prototype.namespace=t,i.modes[t]=o,o},i}),function(t,e){"function"==typeof define&&define.amd?define("masonry/masonry",["outlayer/outlayer","get-size/get-size"],e):"object"==typeof module&&module.exports?module.exports=e(require("outlayer"),require("get-size")):t.Masonry=e(t.Outlayer,t.getSize)}(window,function(t,e){var i=t.create("masonry");return i.compatOptions.fitWidth="isFitWidth",i.prototype._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns(),this.colYs=[];for(var t=0;t<this.cols;t++)this.colYs.push(0);this.maxY=0},i.prototype.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var t=this.items[0],i=t&&t.element;this.columnWidth=i&&e(i).outerWidth||this.containerWidth}var n=this.columnWidth+=this.gutter,o=this.containerWidth+this.gutter,s=o/n,r=n-o%n,a=r&&1>r?"round":"floor";s=Math[a](s),this.cols=Math.max(s,1)},i.prototype.getContainerWidth=function(){var t=this._getOption("fitWidth"),i=t?this.element.parentNode:this.element,n=e(i);this.containerWidth=n&&n.innerWidth},i.prototype._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth%this.columnWidth,i=e&&1>e?"round":"ceil",n=Math[i](t.size.outerWidth/this.columnWidth);n=Math.min(n,this.cols);for(var o=this._getColGroup(n),s=Math.min.apply(Math,o),r=o.indexOf(s),a={x:this.columnWidth*r,y:s},u=s+t.size.outerHeight,h=this.cols+1-o.length,d=0;h>d;d++)this.colYs[r+d]=u;return a},i.prototype._getColGroup=function(t){if(2>t)return this.colYs;for(var e=[],i=this.cols+1-t,n=0;i>n;n++){var o=this.colYs.slice(n,n+t);e[n]=Math.max.apply(Math,o)}return e},i.prototype._manageStamp=function(t){var i=e(t),n=this._getElementOffset(t),o=this._getOption("originLeft"),s=o?n.left:n.right,r=s+i.outerWidth,a=Math.floor(s/this.columnWidth);a=Math.max(0,a);var u=Math.floor(r/this.columnWidth);u-=r%this.columnWidth?0:1,u=Math.min(this.cols-1,u);for(var h=this._getOption("originTop"),d=(h?n.top:n.bottom)+i.outerHeight,l=a;u>=l;l++)this.colYs[l]=Math.max(d,this.colYs[l])},i.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var t={height:this.maxY};return this._getOption("fitWidth")&&(t.width=this._getContainerFitWidth()),t},i.prototype._getContainerFitWidth=function(){for(var t=0,e=this.cols;--e&&0===this.colYs[e];)t++;return(this.cols-t)*this.columnWidth-this.gutter},i.prototype.needsResizeLayout=function(){var t=this.containerWidth;return this.getContainerWidth(),t!=this.containerWidth},i}),function(t,e){"function"==typeof define&&define.amd?define("isotope/js/layout-modes/masonry",["../layout-mode","masonry/masonry"],e):"object"==typeof module&&module.exports?module.exports=e(require("../layout-mode"),require("masonry-layout")):e(t.Isotope.LayoutMode,t.Masonry)}(window,function(t,e){"use strict";var i=t.create("masonry"),n=i.prototype,o={_getElementOffset:!0,layout:!0,_getMeasurement:!0};for(var s in e.prototype)o[s]||(n[s]=e.prototype[s]);var r=n.measureColumns;n.measureColumns=function(){this.items=this.isotope.filteredItems,r.call(this)};var a=n._getOption;return n._getOption=function(t){return"fitWidth"==t?void 0!==this.options.isFitWidth?this.options.isFitWidth:this.options.fitWidth:a.apply(this.isotope,arguments)},i}),function(t,e){"function"==typeof define&&define.amd?define("isotope/js/layout-modes/fit-rows",["../layout-mode"],e):"object"==typeof exports?module.exports=e(require("../layout-mode")):e(t.Isotope.LayoutMode)}(window,function(t){"use strict";var e=t.create("fitRows"),i=e.prototype;return i._resetLayout=function(){this.x=0,this.y=0,this.maxY=0,this._getMeasurement("gutter","outerWidth")},i._getItemLayoutPosition=function(t){t.getSize();var e=t.size.outerWidth+this.gutter,i=this.isotope.size.innerWidth+this.gutter;0!==this.x&&e+this.x>i&&(this.x=0,this.y=this.maxY);var n={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+t.size.outerHeight),this.x+=e,n},i._getContainerSize=function(){return{height:this.maxY}},e}),function(t,e){"function"==typeof define&&define.amd?define("isotope/js/layout-modes/vertical",["../layout-mode"],e):"object"==typeof module&&module.exports?module.exports=e(require("../layout-mode")):e(t.Isotope.LayoutMode)}(window,function(t){"use strict";var e=t.create("vertical",{horizontalAlignment:0}),i=e.prototype;return i._resetLayout=function(){this.y=0},i._getItemLayoutPosition=function(t){t.getSize();var e=(this.isotope.size.innerWidth-t.size.outerWidth)*this.options.horizontalAlignment,i=this.y;return this.y+=t.size.outerHeight,{x:e,y:i}},i._getContainerSize=function(){return{height:this.y}},e}),function(t,e){"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","desandro-matches-selector/matches-selector","fizzy-ui-utils/utils","isotope/js/item","isotope/js/layout-mode","isotope/js/layout-modes/masonry","isotope/js/layout-modes/fit-rows","isotope/js/layout-modes/vertical"],function(i,n,o,s,r,a){return e(t,i,n,o,s,r,a)}):"object"==typeof module&&module.exports?module.exports=e(t,require("outlayer"),require("get-size"),require("desandro-matches-selector"),require("fizzy-ui-utils"),require("isotope/js/item"),require("isotope/js/layout-mode"),require("isotope/js/layout-modes/masonry"),require("isotope/js/layout-modes/fit-rows"),require("isotope/js/layout-modes/vertical")):t.Isotope=e(t,t.Outlayer,t.getSize,t.matchesSelector,t.fizzyUIUtils,t.Isotope.Item,t.Isotope.LayoutMode)}(window,function(t,e,i,n,o,s,r){function a(t,e){return function(i,n){for(var o=0;o<t.length;o++){var s=t[o],r=i.sortData[s],a=n.sortData[s];if(r>a||a>r){var u=void 0!==e[s]?e[s]:e,h=u?1:-1;return(r>a?1:-1)*h}}return 0}}var u=t.jQuery,h=String.prototype.trim?function(t){return t.trim()}:function(t){return t.replace(/^\s+|\s+$/g,"")},d=e.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});d.Item=s,d.LayoutMode=r;var l=d.prototype;l._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),e.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var t in r.modes)this._initLayoutMode(t)},l.reloadItems=function(){this.itemGUID=0,e.prototype.reloadItems.call(this)},l._itemize=function(){for(var t=e.prototype._itemize.apply(this,arguments),i=0;i<t.length;i++){var n=t[i];n.id=this.itemGUID++}return this._updateItemsSortData(t),t},l._initLayoutMode=function(t){var e=r.modes[t],i=this.options[t]||{};this.options[t]=e.options?o.extend(e.options,i):i,this.modes[t]=new e(this)},l.layout=function(){return!this._isLayoutInited&&this._getOption("initLayout")?void this.arrange():void this._layout()},l._layout=function(){var t=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,t),this._isLayoutInited=!0},l.arrange=function(t){this.option(t),this._getIsInstant();var e=this._filter(this.items);this.filteredItems=e.matches,this._bindArrangeComplete(),this._isInstant?this._noTransition(this._hideReveal,[e]):this._hideReveal(e),this._sort(),this._layout()},l._init=l.arrange,l._hideReveal=function(t){this.reveal(t.needReveal),this.hide(t.needHide)},l._getIsInstant=function(){var t=this._getOption("layoutInstant"),e=void 0!==t?t:!this._isLayoutInited;return this._isInstant=e,e},l._bindArrangeComplete=function(){function t(){e&&i&&n&&o.dispatchEvent("arrangeComplete",null,[o.filteredItems])}var e,i,n,o=this;this.once("layoutComplete",function(){e=!0,t()}),this.once("hideComplete",function(){i=!0,t()}),this.once("revealComplete",function(){n=!0,t()})},l._filter=function(t){var e=this.options.filter;e=e||"*";for(var i=[],n=[],o=[],s=this._getFilterTest(e),r=0;r<t.length;r++){var a=t[r];if(!a.isIgnored){var u=s(a);u&&i.push(a),u&&a.isHidden?n.push(a):u||a.isHidden||o.push(a)}}return{matches:i,needReveal:n,needHide:o}},l._getFilterTest=function(t){return u&&this.options.isJQueryFiltering?function(e){return u(e.element).is(t)}:"function"==typeof t?function(e){return t(e.element)}:function(e){return n(e.element,t)}},l.updateSortData=function(t){var e;t?(t=o.makeArray(t),e=this.getItems(t)):e=this.items,this._getSorters(),this._updateItemsSortData(e)},l._getSorters=function(){var t=this.options.getSortData;for(var e in t){var i=t[e];this._sorters[e]=f(i)}},l._updateItemsSortData=function(t){for(var e=t&&t.length,i=0;e&&e>i;i++){var n=t[i];n.updateSortData()}};var f=function(){function t(t){if("string"!=typeof t)return t;var i=h(t).split(" "),n=i[0],o=n.match(/^\[(.+)\]$/),s=o&&o[1],r=e(s,n),a=d.sortDataParsers[i[1]];
return t=a?function(t){return t&&a(r(t))}:function(t){return t&&r(t)}}function e(t,e){return t?function(e){return e.getAttribute(t)}:function(t){var i=t.querySelector(e);return i&&i.textContent}}return t}();d.sortDataParsers={parseInt:function(t){return parseInt(t,10)},parseFloat:function(t){return parseFloat(t)}},l._sort=function(){var t=this.options.sortBy;if(t){var e=[].concat.apply(t,this.sortHistory),i=a(e,this.options.sortAscending);this.filteredItems.sort(i),t!=this.sortHistory[0]&&this.sortHistory.unshift(t)}},l._mode=function(){var t=this.options.layoutMode,e=this.modes[t];if(!e)throw new Error("No layout mode: "+t);return e.options=this.options[t],e},l._resetLayout=function(){e.prototype._resetLayout.call(this),this._mode()._resetLayout()},l._getItemLayoutPosition=function(t){return this._mode()._getItemLayoutPosition(t)},l._manageStamp=function(t){this._mode()._manageStamp(t)},l._getContainerSize=function(){return this._mode()._getContainerSize()},l.needsResizeLayout=function(){return this._mode().needsResizeLayout()},l.appended=function(t){var e=this.addItems(t);if(e.length){var i=this._filterRevealAdded(e);this.filteredItems=this.filteredItems.concat(i)}},l.prepended=function(t){var e=this._itemize(t);if(e.length){this._resetLayout(),this._manageStamps();var i=this._filterRevealAdded(e);this.layoutItems(this.filteredItems),this.filteredItems=i.concat(this.filteredItems),this.items=e.concat(this.items)}},l._filterRevealAdded=function(t){var e=this._filter(t);return this.hide(e.needHide),this.reveal(e.matches),this.layoutItems(e.matches,!0),e.matches},l.insert=function(t){var e=this.addItems(t);if(e.length){var i,n,o=e.length;for(i=0;o>i;i++)n=e[i],this.element.appendChild(n.element);var s=this._filter(e).matches;for(i=0;o>i;i++)e[i].isLayoutInstant=!0;for(this.arrange(),i=0;o>i;i++)delete e[i].isLayoutInstant;this.reveal(s)}};var c=l.remove;return l.remove=function(t){t=o.makeArray(t);var e=this.getItems(t);c.call(this,t);for(var i=e&&e.length,n=0;i&&i>n;n++){var s=e[n];o.removeFrom(this.filteredItems,s)}},l.shuffle=function(){for(var t=0;t<this.items.length;t++){var e=this.items[t];e.sortData.random=Math.random()}this.options.sortBy="random",this._sort(),this._layout()},l._noTransition=function(t,e){var i=this.options.transitionDuration;this.options.transitionDuration=0;var n=t.apply(this,e);return this.options.transitionDuration=i,n},l.getFilteredItemElements=function(){return this.filteredItems.map(function(t){return t.element})},d});
/*!
 * Theia Sticky Sidebar v1.4.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2016 WeCodePixels and other contributors
 * Released under the MIT license
 */

(function ($) {
    $.fn.theiaStickySidebar = function (options) {
        var defaults = {
            'containerSelector': '',
            'additionalMarginTop': 0,
            'additionalMarginBottom': 0,
            'updateSidebarHeight': true,
            'minWidth': 0,
            'disableOnResponsiveLayouts': true,
            'sidebarBehavior': 'modern'
        };
        options = $.extend(defaults, options);

        // Validate options
        options.additionalMarginTop = parseInt(options.additionalMarginTop) || 0;
        options.additionalMarginBottom = parseInt(options.additionalMarginBottom) || 0;

        tryInitOrHookIntoEvents(options, this);

        // Try doing init, otherwise hook into window.resize and document.scroll and try again then.
        function tryInitOrHookIntoEvents(options, $that) {
            var success = tryInit(options, $that);

            if (!success) {
                console.log('TST: Body width smaller than options.minWidth. Init is delayed.');

                $(document).scroll(function (options, $that) {
                    return function (evt) {
                        var success = tryInit(options, $that);

                        if (success) {
                            $(this).unbind(evt);
                        }
                    };
                }(options, $that));
                $(window).resize(function (options, $that) {
                    return function (evt) {
                        var success = tryInit(options, $that);

                        if (success) {
                            $(this).unbind(evt);
                        }
                    };
                }(options, $that))
            }
        }

        // Try doing init if proper conditions are met.
        function tryInit(options, $that) {
            if (options.initialized === true) {
                return true;
            }

            if ($('body').width() < options.minWidth) {
                return false;
            }

            init(options, $that);

            return true;
        }

        // Init the sticky sidebar(s).
        function init(options, $that) {
            options.initialized = true;

            // Add CSS
            $('head').append($('<style>.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>'));

            $that.each(function () {
                var o = {};

                o.sidebar = $(this);

                // Save options
                o.options = options || {};

                // Get container
                o.container = $(o.options.containerSelector);
                if (o.container.length == 0) {
                    o.container = o.sidebar.parent();
                }

                // Create sticky sidebar
                o.sidebar.parents().css('-webkit-transform', 'none'); // Fix for WebKit bug - https://code.google.com/p/chromium/issues/detail?id=20574
                o.sidebar.css({
                    'position': 'relative',
                    'overflow': 'visible',
                    // The "box-sizing" must be set to "content-box" because we set a fixed height to this element when the sticky sidebar has a fixed position.
                    '-webkit-box-sizing': 'border-box',
                    '-moz-box-sizing': 'border-box',
                    'box-sizing': 'border-box'
                });

                // Get the sticky sidebar element. If none has been found, then create one.
                o.stickySidebar = o.sidebar.find('.theiaStickySidebar');
                if (o.stickySidebar.length == 0) {
                    o.sidebar.find('script').remove(); // Remove <script> tags, otherwise they will be run again on the next line.
                    o.stickySidebar = $('<div>').addClass('theiaStickySidebar').append(o.sidebar.children());
                    o.sidebar.append(o.stickySidebar);
                }

                // Get existing top and bottom margins and paddings
                o.marginTop = parseInt(o.sidebar.css('margin-top'));
                o.marginBottom = parseInt(o.sidebar.css('margin-bottom'));
                o.paddingTop = parseInt(o.sidebar.css('padding-top'));
                o.paddingBottom = parseInt(o.sidebar.css('padding-bottom'));

                // Add a temporary padding rule to check for collapsable margins.
                var collapsedTopHeight = o.stickySidebar.offset().top;
                var collapsedBottomHeight = o.stickySidebar.outerHeight();
                o.stickySidebar.css('padding-top', 1);
                o.stickySidebar.css('padding-bottom', 1);
                collapsedTopHeight -= o.stickySidebar.offset().top;
                collapsedBottomHeight = o.stickySidebar.outerHeight() - collapsedBottomHeight - collapsedTopHeight;
                if (collapsedTopHeight == 0) {
                    o.stickySidebar.css('padding-top', 0);
                    o.stickySidebarPaddingTop = 0;
                }
                else {
                    o.stickySidebarPaddingTop = 1;
                }

                if (collapsedBottomHeight == 0) {
                    o.stickySidebar.css('padding-bottom', 0);
                    o.stickySidebarPaddingBottom = 0;
                }
                else {
                    o.stickySidebarPaddingBottom = 1;
                }

                // We use this to know whether the user is scrolling up or down.
                o.previousScrollTop = null;

                // Scroll top (value) when the sidebar has fixed position.
                o.fixedScrollTop = 0;

                // Set sidebar to default values.
                resetSidebar();

                o.onScroll = function (o) {
                    // Stop if the sidebar isn't visible.
                    if (!o.stickySidebar.is(":visible")) {
                        return;
                    }

                    // Stop if the window is too small.
                    if ($('body').width() < o.options.minWidth) {
                        resetSidebar();
                        return;
                    }

                    // Stop if the sidebar width is larger than the container width (e.g. the theme is responsive and the sidebar is now below the content)
                    if (o.options.disableOnResponsiveLayouts) {
                        var sidebarWidth = o.sidebar.outerWidth(o.sidebar.css('float') == 'none');

                        if (sidebarWidth + 50 > o.container.width()) {
                            resetSidebar();
                            return;
                        }
                    }

                    var scrollTop = $(document).scrollTop();
                    var position = 'static';

                    // If the user has scrolled down enough for the sidebar to be clipped at the top, then we can consider changing its position.
                    if (scrollTop >= o.container.offset().top + (o.paddingTop + o.marginTop - o.options.additionalMarginTop)) {
                        // The top and bottom offsets, used in various calculations.
                        var offsetTop = o.paddingTop + o.marginTop + options.additionalMarginTop;
                        var offsetBottom = o.paddingBottom + o.marginBottom + options.additionalMarginBottom;

                        // All top and bottom positions are relative to the window, not to the parent elemnts.
                        var containerTop = o.container.offset().top;
                        var containerBottom = o.container.offset().top + getClearedHeight(o.container);

                        // The top and bottom offsets relative to the window screen top (zero) and bottom (window height).
                        var windowOffsetTop = 0 + options.additionalMarginTop;
                        var windowOffsetBottom;

                        var sidebarSmallerThanWindow = (o.stickySidebar.outerHeight() + offsetTop + offsetBottom) < $(window).height();
                        if (sidebarSmallerThanWindow) {
                            windowOffsetBottom = windowOffsetTop + o.stickySidebar.outerHeight();
                        }
                        else {
                            windowOffsetBottom = $(window).height() - o.marginBottom - o.paddingBottom - options.additionalMarginBottom;
                        }

                        var staticLimitTop = containerTop - scrollTop + o.paddingTop + o.marginTop;
                        var staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - o.marginBottom;

                        var top = o.stickySidebar.offset().top - scrollTop;
                        var scrollTopDiff = o.previousScrollTop - scrollTop;

                        // If the sidebar position is fixed, then it won't move up or down by itself. So, we manually adjust the top coordinate.
                        if (o.stickySidebar.css('position') == 'fixed') {
                            if (o.options.sidebarBehavior == 'modern') {
                                top += scrollTopDiff;
                            }
                        }

                        if (o.options.sidebarBehavior == 'stick-to-top') {
                            top = options.additionalMarginTop;
                        }

                        if (o.options.sidebarBehavior == 'stick-to-bottom') {
                            top = windowOffsetBottom - o.stickySidebar.outerHeight();
                        }

                        if (scrollTopDiff > 0) { // If the user is scrolling up.
                            top = Math.min(top, windowOffsetTop);
                        }
                        else { // If the user is scrolling down.
                            top = Math.max(top, windowOffsetBottom - o.stickySidebar.outerHeight());
                        }

                        top = Math.max(top, staticLimitTop);

                        top = Math.min(top, staticLimitBottom - o.stickySidebar.outerHeight());

                        // If the sidebar is the same height as the container, we won't use fixed positioning.
                        var sidebarSameHeightAsContainer = o.container.height() == o.stickySidebar.outerHeight();

                        if (!sidebarSameHeightAsContainer && top == windowOffsetTop) {
                            position = 'fixed';
                        }
                        else if (!sidebarSameHeightAsContainer && top == windowOffsetBottom - o.stickySidebar.outerHeight()) {
                            position = 'fixed';
                        }
                        else if (scrollTop + top - o.sidebar.offset().top - o.paddingTop <= options.additionalMarginTop) {
                            // Stuck to the top of the page. No special behavior.
                            position = 'static';
                        }
                        else {
                            // Stuck to the bottom of the page.
                            position = 'absolute';
                        }
                    }

                    /*
                     * Performance notice: It's OK to set these CSS values at each resize/scroll, even if they don't change.
                     * It's way slower to first check if the values have changed.
                     */
                    if (position == 'fixed') {
                        o.stickySidebar.css({
                            'position': 'fixed',
                            'width': o.sidebar.width(),
                            'top': top,
                            'left': o.sidebar.offset().left + parseInt(o.sidebar.css('padding-left'))
                        });
                    }
                    else if (position == 'absolute') {
                        var css = {};

                        if (o.stickySidebar.css('position') != 'absolute') {
                            css.position = 'absolute';
                            css.top = scrollTop + top - o.sidebar.offset().top - o.stickySidebarPaddingTop - o.stickySidebarPaddingBottom;
                        }

                        css.width = o.sidebar.width();
                        css.left = '';

                        o.stickySidebar.css(css);
                    }
                    else if (position == 'static') {
                        resetSidebar();
                    }

                    if (position != 'static') {
                        if (o.options.updateSidebarHeight == true) {
                            o.sidebar.css({
                                'min-height': o.stickySidebar.outerHeight() + o.stickySidebar.offset().top - o.sidebar.offset().top + o.paddingBottom
                            });
                        }
                    }

                    o.previousScrollTop = scrollTop;
                };

                // Initialize the sidebar's position.
                o.onScroll(o);

                // Recalculate the sidebar's position on every scroll and resize.
                $(document).scroll(function (o) {
                    return function () {
                        o.onScroll(o);
                    };
                }(o));
                $(window).resize(function (o) {
                    return function () {
                        o.stickySidebar.css({'position': 'static'});
                        o.onScroll(o);
                    };
                }(o));

                // Reset the sidebar to its default state
                function resetSidebar() {
                    o.fixedScrollTop = 0;
                    o.sidebar.css({
                        'min-height': '1px'
                    });
                    o.stickySidebar.css({
                        'position': 'static',
                        'width': ''
                    });
                }

                // Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
                function getClearedHeight(e) {
                    var height = e.height();

                    e.children().each(function () {
                        height = Math.max(height, $(this).height());
                    });

                    return height;
                }
            });
        }
    }
})(jQuery);
/*! Stellar.js v0.6.2 | Copyright 2014, Mark Dalgleish | http://markdalgleish.com/projects/stellar.js | http://markdalgleish.mit-license.org */
!function(a,b,c,d){function e(b,c){this.element=b,this.options=a.extend({},g,c),this._defaults=g,this._name=f,this.init()}var f="stellar",g={scrollProperty:"scroll",positionProperty:"position",horizontalScrolling:!0,verticalScrolling:!0,horizontalOffset:0,verticalOffset:0,responsive:!1,parallaxBackgrounds:!0,parallaxElements:!0,hideDistantElements:!0,hideElement:function(a){a.hide()},showElement:function(a){a.show()}},h={scroll:{getLeft:function(a){return a.scrollLeft()},setLeft:function(a,b){a.scrollLeft(b)},getTop:function(a){return a.scrollTop()},setTop:function(a,b){a.scrollTop(b)}},position:{getLeft:function(a){return-1*parseInt(a.css("left"),10)},getTop:function(a){return-1*parseInt(a.css("top"),10)}},margin:{getLeft:function(a){return-1*parseInt(a.css("margin-left"),10)},getTop:function(a){return-1*parseInt(a.css("margin-top"),10)}},transform:{getLeft:function(a){var b=getComputedStyle(a[0])[k];return"none"!==b?-1*parseInt(b.match(/(-?[0-9]+)/g)[4],10):0},getTop:function(a){var b=getComputedStyle(a[0])[k];return"none"!==b?-1*parseInt(b.match(/(-?[0-9]+)/g)[5],10):0}}},i={position:{setLeft:function(a,b){a.css("left",b)},setTop:function(a,b){a.css("top",b)}},transform:{setPosition:function(a,b,c,d,e){a[0].style[k]="translate3d("+(b-c)+"px, "+(d-e)+"px, 0)"}}},j=function(){var b,c=/^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,d=a("script")[0].style,e="";for(b in d)if(c.test(b)){e=b.match(c)[0];break}return"WebkitOpacity"in d&&(e="Webkit"),"KhtmlOpacity"in d&&(e="Khtml"),function(a){return e+(e.length>0?a.charAt(0).toUpperCase()+a.slice(1):a)}}(),k=j("transform"),l=a("<div />",{style:"background:#fff"}).css("background-position-x")!==d,m=l?function(a,b,c){a.css({"background-position-x":b,"background-position-y":c})}:function(a,b,c){a.css("background-position",b+" "+c)},n=l?function(a){return[a.css("background-position-x"),a.css("background-position-y")]}:function(a){return a.css("background-position").split(" ")},o=b.requestAnimationFrame||b.webkitRequestAnimationFrame||b.mozRequestAnimationFrame||b.oRequestAnimationFrame||b.msRequestAnimationFrame||function(a){setTimeout(a,1e3/60)};e.prototype={init:function(){this.options.name=f+"_"+Math.floor(1e9*Math.random()),this._defineElements(),this._defineGetters(),this._defineSetters(),this._handleWindowLoadAndResize(),this._detectViewport(),this.refresh({firstLoad:!0}),"scroll"===this.options.scrollProperty?this._handleScrollEvent():this._startAnimationLoop()},_defineElements:function(){this.element===c.body&&(this.element=b),this.$scrollElement=a(this.element),this.$element=this.element===b?a("body"):this.$scrollElement,this.$viewportElement=this.options.viewportElement!==d?a(this.options.viewportElement):this.$scrollElement[0]===b||"scroll"===this.options.scrollProperty?this.$scrollElement:this.$scrollElement.parent()},_defineGetters:function(){var a=this,b=h[a.options.scrollProperty];this._getScrollLeft=function(){return b.getLeft(a.$scrollElement)},this._getScrollTop=function(){return b.getTop(a.$scrollElement)}},_defineSetters:function(){var b=this,c=h[b.options.scrollProperty],d=i[b.options.positionProperty],e=c.setLeft,f=c.setTop;this._setScrollLeft="function"==typeof e?function(a){e(b.$scrollElement,a)}:a.noop,this._setScrollTop="function"==typeof f?function(a){f(b.$scrollElement,a)}:a.noop,this._setPosition=d.setPosition||function(a,c,e,f,g){b.options.horizontalScrolling&&d.setLeft(a,c,e),b.options.verticalScrolling&&d.setTop(a,f,g)}},_handleWindowLoadAndResize:function(){var c=this,d=a(b);c.options.responsive&&d.bind("load."+this.name,function(){c.refresh()}),d.bind("resize."+this.name,function(){c._detectViewport(),c.options.responsive&&c.refresh()})},refresh:function(c){var d=this,e=d._getScrollLeft(),f=d._getScrollTop();c&&c.firstLoad||this._reset(),this._setScrollLeft(0),this._setScrollTop(0),this._setOffsets(),this._findParticles(),this._findBackgrounds(),c&&c.firstLoad&&/WebKit/.test(navigator.userAgent)&&a(b).load(function(){var a=d._getScrollLeft(),b=d._getScrollTop();d._setScrollLeft(a+1),d._setScrollTop(b+1),d._setScrollLeft(a),d._setScrollTop(b)}),this._setScrollLeft(e),this._setScrollTop(f)},_detectViewport:function(){var a=this.$viewportElement.offset(),b=null!==a&&a!==d;this.viewportWidth=this.$viewportElement.width(),this.viewportHeight=this.$viewportElement.height(),this.viewportOffsetTop=b?a.top:0,this.viewportOffsetLeft=b?a.left:0},_findParticles:function(){{var b=this;this._getScrollLeft(),this._getScrollTop()}if(this.particles!==d)for(var c=this.particles.length-1;c>=0;c--)this.particles[c].$element.data("stellar-elementIsActive",d);this.particles=[],this.options.parallaxElements&&this.$element.find("[data-stellar-ratio]").each(function(){var c,e,f,g,h,i,j,k,l,m=a(this),n=0,o=0,p=0,q=0;if(m.data("stellar-elementIsActive")){if(m.data("stellar-elementIsActive")!==this)return}else m.data("stellar-elementIsActive",this);b.options.showElement(m),m.data("stellar-startingLeft")?(m.css("left",m.data("stellar-startingLeft")),m.css("top",m.data("stellar-startingTop"))):(m.data("stellar-startingLeft",m.css("left")),m.data("stellar-startingTop",m.css("top"))),f=m.position().left,g=m.position().top,h="auto"===m.css("margin-left")?0:parseInt(m.css("margin-left"),10),i="auto"===m.css("margin-top")?0:parseInt(m.css("margin-top"),10),k=m.offset().left-h,l=m.offset().top-i,m.parents().each(function(){var b=a(this);return b.data("stellar-offset-parent")===!0?(n=p,o=q,j=b,!1):(p+=b.position().left,void(q+=b.position().top))}),c=m.data("stellar-horizontal-offset")!==d?m.data("stellar-horizontal-offset"):j!==d&&j.data("stellar-horizontal-offset")!==d?j.data("stellar-horizontal-offset"):b.horizontalOffset,e=m.data("stellar-vertical-offset")!==d?m.data("stellar-vertical-offset"):j!==d&&j.data("stellar-vertical-offset")!==d?j.data("stellar-vertical-offset"):b.verticalOffset,b.particles.push({$element:m,$offsetParent:j,isFixed:"fixed"===m.css("position"),horizontalOffset:c,verticalOffset:e,startingPositionLeft:f,startingPositionTop:g,startingOffsetLeft:k,startingOffsetTop:l,parentOffsetLeft:n,parentOffsetTop:o,stellarRatio:m.data("stellar-ratio")!==d?m.data("stellar-ratio"):1,width:m.outerWidth(!0),height:m.outerHeight(!0),isHidden:!1})})},_findBackgrounds:function(){var b,c=this,e=this._getScrollLeft(),f=this._getScrollTop();this.backgrounds=[],this.options.parallaxBackgrounds&&(b=this.$element.find("[data-stellar-background-ratio]"),this.$element.data("stellar-background-ratio")&&(b=b.add(this.$element)),b.each(function(){var b,g,h,i,j,k,l,o=a(this),p=n(o),q=0,r=0,s=0,t=0;if(o.data("stellar-backgroundIsActive")){if(o.data("stellar-backgroundIsActive")!==this)return}else o.data("stellar-backgroundIsActive",this);o.data("stellar-backgroundStartingLeft")?m(o,o.data("stellar-backgroundStartingLeft"),o.data("stellar-backgroundStartingTop")):(o.data("stellar-backgroundStartingLeft",p[0]),o.data("stellar-backgroundStartingTop",p[1])),h="auto"===o.css("margin-left")?0:parseInt(o.css("margin-left"),10),i="auto"===o.css("margin-top")?0:parseInt(o.css("margin-top"),10),j=o.offset().left-h-e,k=o.offset().top-i-f,o.parents().each(function(){var b=a(this);return b.data("stellar-offset-parent")===!0?(q=s,r=t,l=b,!1):(s+=b.position().left,void(t+=b.position().top))}),b=o.data("stellar-horizontal-offset")!==d?o.data("stellar-horizontal-offset"):l!==d&&l.data("stellar-horizontal-offset")!==d?l.data("stellar-horizontal-offset"):c.horizontalOffset,g=o.data("stellar-vertical-offset")!==d?o.data("stellar-vertical-offset"):l!==d&&l.data("stellar-vertical-offset")!==d?l.data("stellar-vertical-offset"):c.verticalOffset,c.backgrounds.push({$element:o,$offsetParent:l,isFixed:"fixed"===o.css("background-attachment"),horizontalOffset:b,verticalOffset:g,startingValueLeft:p[0],startingValueTop:p[1],startingBackgroundPositionLeft:isNaN(parseInt(p[0],10))?0:parseInt(p[0],10),startingBackgroundPositionTop:isNaN(parseInt(p[1],10))?0:parseInt(p[1],10),startingPositionLeft:o.position().left,startingPositionTop:o.position().top,startingOffsetLeft:j,startingOffsetTop:k,parentOffsetLeft:q,parentOffsetTop:r,stellarRatio:o.data("stellar-background-ratio")===d?1:o.data("stellar-background-ratio")})}))},_reset:function(){var a,b,c,d,e;for(e=this.particles.length-1;e>=0;e--)a=this.particles[e],b=a.$element.data("stellar-startingLeft"),c=a.$element.data("stellar-startingTop"),this._setPosition(a.$element,b,b,c,c),this.options.showElement(a.$element),a.$element.data("stellar-startingLeft",null).data("stellar-elementIsActive",null).data("stellar-backgroundIsActive",null);for(e=this.backgrounds.length-1;e>=0;e--)d=this.backgrounds[e],d.$element.data("stellar-backgroundStartingLeft",null).data("stellar-backgroundStartingTop",null),m(d.$element,d.startingValueLeft,d.startingValueTop)},destroy:function(){this._reset(),this.$scrollElement.unbind("resize."+this.name).unbind("scroll."+this.name),this._animationLoop=a.noop,a(b).unbind("load."+this.name).unbind("resize."+this.name)},_setOffsets:function(){var c=this,d=a(b);d.unbind("resize.horizontal-"+this.name).unbind("resize.vertical-"+this.name),"function"==typeof this.options.horizontalOffset?(this.horizontalOffset=this.options.horizontalOffset(),d.bind("resize.horizontal-"+this.name,function(){c.horizontalOffset=c.options.horizontalOffset()})):this.horizontalOffset=this.options.horizontalOffset,"function"==typeof this.options.verticalOffset?(this.verticalOffset=this.options.verticalOffset(),d.bind("resize.vertical-"+this.name,function(){c.verticalOffset=c.options.verticalOffset()})):this.verticalOffset=this.options.verticalOffset},_repositionElements:function(){var a,b,c,d,e,f,g,h,i,j,k=this._getScrollLeft(),l=this._getScrollTop(),n=!0,o=!0;if(this.currentScrollLeft!==k||this.currentScrollTop!==l||this.currentWidth!==this.viewportWidth||this.currentHeight!==this.viewportHeight){for(this.currentScrollLeft=k,this.currentScrollTop=l,this.currentWidth=this.viewportWidth,this.currentHeight=this.viewportHeight,j=this.particles.length-1;j>=0;j--)a=this.particles[j],b=a.isFixed?1:0,this.options.horizontalScrolling?(f=(k+a.horizontalOffset+this.viewportOffsetLeft+a.startingPositionLeft-a.startingOffsetLeft+a.parentOffsetLeft)*-(a.stellarRatio+b-1)+a.startingPositionLeft,h=f-a.startingPositionLeft+a.startingOffsetLeft):(f=a.startingPositionLeft,h=a.startingOffsetLeft),this.options.verticalScrolling?(g=(l+a.verticalOffset+this.viewportOffsetTop+a.startingPositionTop-a.startingOffsetTop+a.parentOffsetTop)*-(a.stellarRatio+b-1)+a.startingPositionTop,i=g-a.startingPositionTop+a.startingOffsetTop):(g=a.startingPositionTop,i=a.startingOffsetTop),this.options.hideDistantElements&&(o=!this.options.horizontalScrolling||h+a.width>(a.isFixed?0:k)&&h<(a.isFixed?0:k)+this.viewportWidth+this.viewportOffsetLeft,n=!this.options.verticalScrolling||i+a.height>(a.isFixed?0:l)&&i<(a.isFixed?0:l)+this.viewportHeight+this.viewportOffsetTop),o&&n?(a.isHidden&&(this.options.showElement(a.$element),a.isHidden=!1),this._setPosition(a.$element,f,a.startingPositionLeft,g,a.startingPositionTop)):a.isHidden||(this.options.hideElement(a.$element),a.isHidden=!0);for(j=this.backgrounds.length-1;j>=0;j--)c=this.backgrounds[j],b=c.isFixed?0:1,d=this.options.horizontalScrolling?(k+c.horizontalOffset-this.viewportOffsetLeft-c.startingOffsetLeft+c.parentOffsetLeft-c.startingBackgroundPositionLeft)*(b-c.stellarRatio)+"px":c.startingValueLeft,e=this.options.verticalScrolling?(l+c.verticalOffset-this.viewportOffsetTop-c.startingOffsetTop+c.parentOffsetTop-c.startingBackgroundPositionTop)*(b-c.stellarRatio)+"px":c.startingValueTop,m(c.$element,d,e)}},_handleScrollEvent:function(){var a=this,b=!1,c=function(){a._repositionElements(),b=!1},d=function(){b||(o(c),b=!0)};this.$scrollElement.bind("scroll."+this.name,d),d()},_startAnimationLoop:function(){var a=this;this._animationLoop=function(){o(a._animationLoop),a._repositionElements()},this._animationLoop()}},a.fn[f]=function(b){var c=arguments;return b===d||"object"==typeof b?this.each(function(){a.data(this,"plugin_"+f)||a.data(this,"plugin_"+f,new e(this,b))}):"string"==typeof b&&"_"!==b[0]&&"init"!==b?this.each(function(){var d=a.data(this,"plugin_"+f);d instanceof e&&"function"==typeof d[b]&&d[b].apply(d,Array.prototype.slice.call(c,1)),"destroy"===b&&a.data(this,"plugin_"+f,null)}):void 0},a[f]=function(){var c=a(b);return c.stellar.apply(c,Array.prototype.slice.call(arguments,0))},a[f].scrollProperty=h,a[f].positionProperty=i,b.Stellar=e}(jQuery,this,document);
/*!
 * Parallax Columns
 * #
 *
 * Website's scrolling parallax scolumns
 */

(function($){

	$.fn.parallaxColumn = function(options){

		var defaults = {
            'column_class': '.parallax-column',
            'content_class': '.parallax-content'
        };
        options = $.extend(defaults, options);


        this.each(function(){
        	var $this = $(this),
        		$content = $this.find(options.content_class),
        		content_height = 0,
        		offset_top = 0,
        		offset_bottom = 0,
        		bottom_scroll_point = 0,

        		scrollTop = $(window).scrollTop(),
    			bottom_offset = scrollTop + $(window).height(),
    			window_height = $(window).height(),
    			_scroll_percent = (scrollTop - offset_top)*100/(bottom_scroll_point - offset_top);


    		var init_columns = function(){
        		content_height = $content.height();
        		offset_top = $this.offset().top;
        		offset_bottom = offset_top + content_height;
        		bottom_scroll_point = offset_bottom - $(window).height();

    			$this.find(options.column_class).each(function(){
    				// reset classes
    				$(this).removeClass('pc-small-xs pc-small pc-large');
    				// add classes
	    			if( $(this).outerHeight() <= $(window).height() ){
	    				$(this).addClass('pc-small-xs');
	    				$(this).parent().css('position', 'relative');
	    			}
	    			else if( $(this).outerHeight() < content_height ){
	    				$(this).addClass('pc-small');
	    				$(this).parent().css('position', 'relative');
	    			}
	    			else if( $(this).outerHeight() > content_height ){
	    				$(this).addClass('pc-large');
	    				$(this).parent().height(content_height);
	    			}
	    		});
    		};

    		var reset_columns = function(){
    			$this.find('.pc-small-xs, .pc-small, .pc-large').each(function(){
					var $col = $(this);
					$col.css({
						'position': 'relative',
						'left': 'auto',
						'top': 'auto',
						'width': '100%',
						'-webkit-transform': 'none',
						   '-moz-transform': 'none',
								'transform': 'none'
					});
					$col.parent().css('height', 'auto');
				});
    		};

    		var reset_positions = function(){
    			$this.find('.pc-small-xs, .pc-small, .pc-large').each(function(){
    				var $col = $(this);
					$col.css({
						'position': 'relative',
						'left': 'auto',
						'top': 'auto',
						'width': '100%',
						'-webkit-transform': 'none',
						   '-moz-transform': 'none',
								'transform': 'none'
					});
				});
    		}

    		// calculate column that less 
    		var calculate_small_xs = function(){

    			$this.find('.pc-small-xs').each(function(){
					var $col = $(this);
					if( (scrollTop > offset_top && bottom_offset < offset_bottom) || (scrollTop < offset_bottom - $col.height()) ){
						$col.css({
							'top': '0px',
							'left': $col.offset().left+'px',
							'width': $col.width()+'px',
							'position': 'fixed'
						});
					}
					else if( scrollTop >= offset_bottom - $col.height() ){
						var diff_height = content_height - $col.height();
						if( offset_bottom-$col.height() < scrollTop ){
							$col.css({
								'top': diff_height + 'px',
								'left': 'auto',
								'width': $col.width()+'px',
								'position': 'absolute'
							});
						}
					}
				});

    		};

    		var calculate_small = function(){

    			$this.find('.pc-small').each(function(){
					var $col = $(this);

					var diff_height = content_height-$col.height();
					var sp = scrollTop-offset_top;

					if( scrollTop + window_height >= offset_top + content_height ){
						var diff = diff_height = content_height-$col.height();
						$col.css({
							'top': diff + 'px',
							'left': 'auto',
							'width': $col.width()+'px',
							'position': 'absolute'
						});
					}
					else if( (scrollTop > offset_top && bottom_offset < offset_bottom) && ($col.height() - window_height + offset_top <= scrollTop) ){
						var diff = window_height - $col.height();
						$col.css({
							'top': diff + 'px',
							'left': $col.offset().left+'px',
							'width': $col.width()+'px',
							'position': 'fixed'
						});
					}
					else if( (scrollTop > offset_top && bottom_offset < offset_bottom) && (offset_top+diff_height <= scrollTop) ){
						$col.css({
							'top': '0',
							'left': '0',
							'width': '100%',
							'position': 'relative'
						});
					}
					

					if( scrollTop > offset_top && bottom_offset < offset_bottom && (sp >= content_height - $col.height()) ){
						
					}
					if( (scrollTop > offset_top && bottom_offset < offset_bottom) || scrollTop > offset_bottom || (scrollTop < offset_bottom - $col.height()) ){
						if( offset_bottom - window_height - 50 < scrollTop ){
							
						}
						else if( sp >= diff_height ){
							
						}
					}

				});
    		};

    		var calculate_large = function(){

    			if( scrollTop > offset_top && bottom_offset < offset_bottom ){
    				// scroll inside
    				$this.find('.pc-large').each(function(){
						var $col = $(this),
							pHeight = content_height,
							cHeight = $col.height(),
							translateY = parseInt((cHeight - pHeight)/100*_scroll_percent, 10);

						$col.css({
							'-webkit-transform': 'translate3d(0px, -'+translateY+'px, 0px)',
							   '-moz-transform': 'translate3d(0px, -'+translateY+'px, 0px)',
									'transform': 'translate3d(0px, -'+translateY+'px, 0px)'
						});
					});
    			}
    			else if( scrollTop > offset_bottom ){
    				// scroll out down
    				$this.find('.pc-large').each(function(){
						var $col = $(this),
							pHeight = content_height,
							cHeight = $col.height(),
							translateY = parseInt(cHeight - pHeight, 10);

						$col.css({
							'-webkit-transform': 'translate3d(0px, -'+translateY+'px, 0px)',
							   '-moz-transform': 'translate3d(0px, -'+translateY+'px, 0px)',
									'transform': 'translate3d(0px, -'+translateY+'px, 0px)'
						});
					});
    			}

    		};

    		// resize
    		$(window).resize(function(){
    			window_height = $(window).height();

    			if( $(window).width() >= 768 ){
	    			init_columns();
	    		}
	    		else{
	    			reset_columns();
	    		}
    		});


        	$(window).scroll(function(){
    			scrollTop = $(window).scrollTop();

    			if( scrollTop < offset_top ){
					reset_positions();
				}
				else{
					bottom_offset = scrollTop + $(window).height();
    				_scroll_percent = (scrollTop - offset_top)*100/(bottom_scroll_point - offset_top);

					calculate_small_xs();
					calculate_small();
					calculate_large();
				}

        	});
			
        	// init function
    		init_columns();
    		setTimeout(function(){
				calculate_large();
    		}, 400);

        });
		
	}

})(jQuery);
/**
 * Swiper 3.2.7
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: December 7, 2015
 */
!function(){"use strict";function e(e){e.fn.swiper=function(a){var r;return e(this).each(function(){var e=new t(this,a);r||(r=e)}),r}}var a,t=function(e,s){function i(){return"horizontal"===T.params.direction}function n(e){return Math.floor(e)}function o(){T.autoplayTimeoutId=setTimeout(function(){T.params.loop?(T.fixLoop(),T._slideNext()):T.isEnd?s.autoplayStopOnLast?T.stopAutoplay():T._slideTo(0):T._slideNext()},T.params.autoplay)}function l(e,t){var r=a(e.target);if(!r.is(t))if("string"==typeof t)r=r.parents(t);else if(t.nodeType){var s;return r.parents().each(function(e,a){a===t&&(s=t)}),s?t:void 0}if(0!==r.length)return r[0]}function d(e,a){a=a||{};var t=window.MutationObserver||window.WebkitMutationObserver,r=new t(function(e){e.forEach(function(e){T.onResize(!0),T.emit("onObserverUpdate",T,e)})});r.observe(e,{attributes:"undefined"==typeof a.attributes?!0:a.attributes,childList:"undefined"==typeof a.childList?!0:a.childList,characterData:"undefined"==typeof a.characterData?!0:a.characterData}),T.observers.push(r)}function p(e){e.originalEvent&&(e=e.originalEvent);var a=e.keyCode||e.charCode;if(!T.params.allowSwipeToNext&&(i()&&39===a||!i()&&40===a))return!1;if(!T.params.allowSwipeToPrev&&(i()&&37===a||!i()&&38===a))return!1;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))){if(37===a||39===a||38===a||40===a){var t=!1;if(T.container.parents(".swiper-slide").length>0&&0===T.container.parents(".swiper-slide-active").length)return;var r={left:window.pageXOffset,top:window.pageYOffset},s=window.innerWidth,n=window.innerHeight,o=T.container.offset();T.rtl&&(o.left=o.left-T.container[0].scrollLeft);for(var l=[[o.left,o.top],[o.left+T.width,o.top],[o.left,o.top+T.height],[o.left+T.width,o.top+T.height]],d=0;d<l.length;d++){var p=l[d];p[0]>=r.left&&p[0]<=r.left+s&&p[1]>=r.top&&p[1]<=r.top+n&&(t=!0)}if(!t)return}i()?((37===a||39===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),(39===a&&!T.rtl||37===a&&T.rtl)&&T.slideNext(),(37===a&&!T.rtl||39===a&&T.rtl)&&T.slidePrev()):((38===a||40===a)&&(e.preventDefault?e.preventDefault():e.returnValue=!1),40===a&&T.slideNext(),38===a&&T.slidePrev())}}function u(e){e.originalEvent&&(e=e.originalEvent);var a=T.mousewheel.event,t=0,r=T.rtl?-1:1;if(e.detail)t=-e.detail;else if("mousewheel"===a)if(T.params.mousewheelForceToAxis)if(i()){if(!(Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)))return;t=e.wheelDeltaX*r}else{if(!(Math.abs(e.wheelDeltaY)>Math.abs(e.wheelDeltaX)))return;t=e.wheelDeltaY}else t=Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)?-e.wheelDeltaX*r:-e.wheelDeltaY;else if("DOMMouseScroll"===a)t=-e.detail;else if("wheel"===a)if(T.params.mousewheelForceToAxis)if(i()){if(!(Math.abs(e.deltaX)>Math.abs(e.deltaY)))return;t=-e.deltaX*r}else{if(!(Math.abs(e.deltaY)>Math.abs(e.deltaX)))return;t=-e.deltaY}else t=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX*r:-e.deltaY;if(0!==t){if(T.params.mousewheelInvert&&(t=-t),T.params.freeMode){var s=T.getWrapperTranslate()+t*T.params.mousewheelSensitivity,n=T.isBeginning,o=T.isEnd;if(s>=T.minTranslate()&&(s=T.minTranslate()),s<=T.maxTranslate()&&(s=T.maxTranslate()),T.setWrapperTransition(0),T.setWrapperTranslate(s),T.updateProgress(),T.updateActiveIndex(),(!n&&T.isBeginning||!o&&T.isEnd)&&T.updateClasses(),T.params.freeModeSticky&&(clearTimeout(T.mousewheel.timeout),T.mousewheel.timeout=setTimeout(function(){T.slideReset()},300)),0===s||s===T.maxTranslate())return}else{if((new window.Date).getTime()-T.mousewheel.lastScrollTime>60)if(0>t)if(T.isEnd&&!T.params.loop||T.animating){if(T.params.mousewheelReleaseOnEdges)return!0}else T.slideNext();else if(T.isBeginning&&!T.params.loop||T.animating){if(T.params.mousewheelReleaseOnEdges)return!0}else T.slidePrev();T.mousewheel.lastScrollTime=(new window.Date).getTime()}return T.params.autoplay&&T.stopAutoplay(),e.preventDefault?e.preventDefault():e.returnValue=!1,!1}}function c(e,t){e=a(e);var r,s,n,o=T.rtl?-1:1;r=e.attr("data-swiper-parallax")||"0",s=e.attr("data-swiper-parallax-x"),n=e.attr("data-swiper-parallax-y"),s||n?(s=s||"0",n=n||"0"):i()?(s=r,n="0"):(n=r,s="0"),s=s.indexOf("%")>=0?parseInt(s,10)*t*o+"%":s*t*o+"px",n=n.indexOf("%")>=0?parseInt(n,10)*t+"%":n*t+"px",e.transform("translate3d("+s+", "+n+",0px)")}function m(e){return 0!==e.indexOf("on")&&(e=e[0]!==e[0].toUpperCase()?"on"+e[0].toUpperCase()+e.substring(1):"on"+e),e}if(!(this instanceof t))return new t(e,s);var f={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,iOSEdgeSwipeDetection:!1,iOSEdgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,scrollbar:null,scrollbarHide:!0,scrollbarDraggable:!1,scrollbarSnapOnRelease:!1,keyboardControl:!1,mousewheelControl:!1,mousewheelReleaseOnEdges:!1,mousewheelInvert:!1,mousewheelForceToAxis:!1,mousewheelSensitivity:1,hashnav:!1,breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,pagination:null,paginationElement:"span",paginationClickable:!1,paginationHide:!1,paginationBulletRender:null,resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingOnTransitionStart:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,controlBy:"slide",allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationHiddenClass:"swiper-pagination-hidden",observer:!1,observeParents:!1,a11y:!1,prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",runCallbacksOnInit:!0},h=s&&s.virtualTranslate;s=s||{};var g={};for(var v in s)if("object"!=typeof s[v]||(s[v].nodeType||s[v]===window||s[v]===document||"undefined"!=typeof r&&s[v]instanceof r||"undefined"!=typeof jQuery&&s[v]instanceof jQuery))g[v]=s[v];else{g[v]={};for(var w in s[v])g[v][w]=s[v][w]}for(var y in f)if("undefined"==typeof s[y])s[y]=f[y];else if("object"==typeof s[y])for(var b in f[y])"undefined"==typeof s[y][b]&&(s[y][b]=f[y][b]);var T=this;if(T.params=s,T.originalParams=g,T.classNames=[],"undefined"!=typeof a&&"undefined"!=typeof r&&(a=r),("undefined"!=typeof a||(a="undefined"==typeof r?window.Dom7||window.Zepto||window.jQuery:r))&&(T.$=a,T.currentBreakpoint=void 0,T.getActiveBreakpoint=function(){if(!T.params.breakpoints)return!1;var e,a=!1,t=[];for(e in T.params.breakpoints)T.params.breakpoints.hasOwnProperty(e)&&t.push(e);t.sort(function(e,a){return parseInt(e,10)>parseInt(a,10)});for(var r=0;r<t.length;r++)e=t[r],e>=window.innerWidth&&!a&&(a=e);return a||"max"},T.setBreakpoint=function(){var e=T.getActiveBreakpoint();if(e&&T.currentBreakpoint!==e){var a=e in T.params.breakpoints?T.params.breakpoints[e]:T.originalParams;for(var t in a)T.params[t]=a[t];T.currentBreakpoint=e}},T.params.breakpoints&&T.setBreakpoint(),T.container=a(e),0!==T.container.length)){if(T.container.length>1)return void T.container.each(function(){new t(this,s)});T.container[0].swiper=T,T.container.data("swiper",T),T.classNames.push("swiper-container-"+T.params.direction),T.params.freeMode&&T.classNames.push("swiper-container-free-mode"),T.support.flexbox||(T.classNames.push("swiper-container-no-flexbox"),T.params.slidesPerColumn=1),T.params.autoHeight&&T.classNames.push("swiper-container-autoheight"),(T.params.parallax||T.params.watchSlidesVisibility)&&(T.params.watchSlidesProgress=!0),["cube","coverflow"].indexOf(T.params.effect)>=0&&(T.support.transforms3d?(T.params.watchSlidesProgress=!0,T.classNames.push("swiper-container-3d")):T.params.effect="slide"),"slide"!==T.params.effect&&T.classNames.push("swiper-container-"+T.params.effect),"cube"===T.params.effect&&(T.params.resistanceRatio=0,T.params.slidesPerView=1,T.params.slidesPerColumn=1,T.params.slidesPerGroup=1,T.params.centeredSlides=!1,T.params.spaceBetween=0,T.params.virtualTranslate=!0,T.params.setWrapperSize=!1),"fade"===T.params.effect&&(T.params.slidesPerView=1,T.params.slidesPerColumn=1,T.params.slidesPerGroup=1,T.params.watchSlidesProgress=!0,T.params.spaceBetween=0,"undefined"==typeof h&&(T.params.virtualTranslate=!0)),T.params.grabCursor&&T.support.touch&&(T.params.grabCursor=!1),T.wrapper=T.container.children("."+T.params.wrapperClass),T.params.pagination&&(T.paginationContainer=a(T.params.pagination),T.params.paginationClickable&&T.paginationContainer.addClass("swiper-pagination-clickable")),T.rtl=i()&&("rtl"===T.container[0].dir.toLowerCase()||"rtl"===T.container.css("direction")),T.rtl&&T.classNames.push("swiper-container-rtl"),T.rtl&&(T.wrongRTL="-webkit-box"===T.wrapper.css("display")),T.params.slidesPerColumn>1&&T.classNames.push("swiper-container-multirow"),T.device.android&&T.classNames.push("swiper-container-android"),T.container.addClass(T.classNames.join(" ")),T.translate=0,T.progress=0,T.velocity=0,T.lockSwipeToNext=function(){T.params.allowSwipeToNext=!1},T.lockSwipeToPrev=function(){T.params.allowSwipeToPrev=!1},T.lockSwipes=function(){T.params.allowSwipeToNext=T.params.allowSwipeToPrev=!1},T.unlockSwipeToNext=function(){T.params.allowSwipeToNext=!0},T.unlockSwipeToPrev=function(){T.params.allowSwipeToPrev=!0},T.unlockSwipes=function(){T.params.allowSwipeToNext=T.params.allowSwipeToPrev=!0},T.params.grabCursor&&(T.container[0].style.cursor="move",T.container[0].style.cursor="-webkit-grab",T.container[0].style.cursor="-moz-grab",T.container[0].style.cursor="grab"),T.imagesToLoad=[],T.imagesLoaded=0,T.loadImage=function(e,a,t,r,s){function i(){s&&s()}var n;e.complete&&r?i():a?(n=new window.Image,n.onload=i,n.onerror=i,t&&(n.srcset=t),a&&(n.src=a)):i()},T.preloadImages=function(){function e(){"undefined"!=typeof T&&null!==T&&(void 0!==T.imagesLoaded&&T.imagesLoaded++,T.imagesLoaded===T.imagesToLoad.length&&(T.params.updateOnImagesReady&&T.update(),T.emit("onImagesReady",T)))}T.imagesToLoad=T.container.find("img");for(var a=0;a<T.imagesToLoad.length;a++)T.loadImage(T.imagesToLoad[a],T.imagesToLoad[a].currentSrc||T.imagesToLoad[a].getAttribute("src"),T.imagesToLoad[a].srcset||T.imagesToLoad[a].getAttribute("srcset"),!0,e)},T.autoplayTimeoutId=void 0,T.autoplaying=!1,T.autoplayPaused=!1,T.startAutoplay=function(){return"undefined"!=typeof T.autoplayTimeoutId?!1:T.params.autoplay?T.autoplaying?!1:(T.autoplaying=!0,T.emit("onAutoplayStart",T),void o()):!1},T.stopAutoplay=function(e){T.autoplayTimeoutId&&(T.autoplayTimeoutId&&clearTimeout(T.autoplayTimeoutId),T.autoplaying=!1,T.autoplayTimeoutId=void 0,T.emit("onAutoplayStop",T))},T.pauseAutoplay=function(e){T.autoplayPaused||(T.autoplayTimeoutId&&clearTimeout(T.autoplayTimeoutId),T.autoplayPaused=!0,0===e?(T.autoplayPaused=!1,o()):T.wrapper.transitionEnd(function(){T&&(T.autoplayPaused=!1,T.autoplaying?o():T.stopAutoplay())}))},T.minTranslate=function(){return-T.snapGrid[0]},T.maxTranslate=function(){return-T.snapGrid[T.snapGrid.length-1]},T.updateAutoHeight=function(){var e=T.slides.eq(T.activeIndex)[0].offsetHeight;e&&T.wrapper.css("height",T.slides.eq(T.activeIndex)[0].offsetHeight+"px")},T.updateContainerSize=function(){var e,a;e="undefined"!=typeof T.params.width?T.params.width:T.container[0].clientWidth,a="undefined"!=typeof T.params.height?T.params.height:T.container[0].clientHeight,0===e&&i()||0===a&&!i()||(e=e-parseInt(T.container.css("padding-left"),10)-parseInt(T.container.css("padding-right"),10),a=a-parseInt(T.container.css("padding-top"),10)-parseInt(T.container.css("padding-bottom"),10),T.width=e,T.height=a,T.size=i()?T.width:T.height)},T.updateSlidesSize=function(){T.slides=T.wrapper.children("."+T.params.slideClass),T.snapGrid=[],T.slidesGrid=[],T.slidesSizesGrid=[];var e,a=T.params.spaceBetween,t=-T.params.slidesOffsetBefore,r=0,s=0;"string"==typeof a&&a.indexOf("%")>=0&&(a=parseFloat(a.replace("%",""))/100*T.size),T.virtualSize=-a,T.rtl?T.slides.css({marginLeft:"",marginTop:""}):T.slides.css({marginRight:"",marginBottom:""});var o;T.params.slidesPerColumn>1&&(o=Math.floor(T.slides.length/T.params.slidesPerColumn)===T.slides.length/T.params.slidesPerColumn?T.slides.length:Math.ceil(T.slides.length/T.params.slidesPerColumn)*T.params.slidesPerColumn,"auto"!==T.params.slidesPerView&&"row"===T.params.slidesPerColumnFill&&(o=Math.max(o,T.params.slidesPerView*T.params.slidesPerColumn)));var l,d=T.params.slidesPerColumn,p=o/d,u=p-(T.params.slidesPerColumn*p-T.slides.length);for(e=0;e<T.slides.length;e++){l=0;var c=T.slides.eq(e);if(T.params.slidesPerColumn>1){var m,f,h;"column"===T.params.slidesPerColumnFill?(f=Math.floor(e/d),h=e-f*d,(f>u||f===u&&h===d-1)&&++h>=d&&(h=0,f++),m=f+h*o/d,c.css({"-webkit-box-ordinal-group":m,"-moz-box-ordinal-group":m,"-ms-flex-order":m,"-webkit-order":m,order:m})):(h=Math.floor(e/p),f=e-h*p),c.css({"margin-top":0!==h&&T.params.spaceBetween&&T.params.spaceBetween+"px"}).attr("data-swiper-column",f).attr("data-swiper-row",h)}"none"!==c.css("display")&&("auto"===T.params.slidesPerView?(l=i()?c.outerWidth(!0):c.outerHeight(!0),T.params.roundLengths&&(l=n(l))):(l=(T.size-(T.params.slidesPerView-1)*a)/T.params.slidesPerView,T.params.roundLengths&&(l=n(l)),i()?T.slides[e].style.width=l+"px":T.slides[e].style.height=l+"px"),T.slides[e].swiperSlideSize=l,T.slidesSizesGrid.push(l),T.params.centeredSlides?(t=t+l/2+r/2+a,0===e&&(t=t-T.size/2-a),Math.abs(t)<.001&&(t=0),s%T.params.slidesPerGroup===0&&T.snapGrid.push(t),T.slidesGrid.push(t)):(s%T.params.slidesPerGroup===0&&T.snapGrid.push(t),T.slidesGrid.push(t),t=t+l+a),T.virtualSize+=l+a,r=l,s++)}T.virtualSize=Math.max(T.virtualSize,T.size)+T.params.slidesOffsetAfter;var g;if(T.rtl&&T.wrongRTL&&("slide"===T.params.effect||"coverflow"===T.params.effect)&&T.wrapper.css({width:T.virtualSize+T.params.spaceBetween+"px"}),(!T.support.flexbox||T.params.setWrapperSize)&&(i()?T.wrapper.css({width:T.virtualSize+T.params.spaceBetween+"px"}):T.wrapper.css({height:T.virtualSize+T.params.spaceBetween+"px"})),T.params.slidesPerColumn>1&&(T.virtualSize=(l+T.params.spaceBetween)*o,T.virtualSize=Math.ceil(T.virtualSize/T.params.slidesPerColumn)-T.params.spaceBetween,T.wrapper.css({width:T.virtualSize+T.params.spaceBetween+"px"}),T.params.centeredSlides)){for(g=[],e=0;e<T.snapGrid.length;e++)T.snapGrid[e]<T.virtualSize+T.snapGrid[0]&&g.push(T.snapGrid[e]);T.snapGrid=g}if(!T.params.centeredSlides){for(g=[],e=0;e<T.snapGrid.length;e++)T.snapGrid[e]<=T.virtualSize-T.size&&g.push(T.snapGrid[e]);T.snapGrid=g,Math.floor(T.virtualSize-T.size)>Math.floor(T.snapGrid[T.snapGrid.length-1])&&T.snapGrid.push(T.virtualSize-T.size)}0===T.snapGrid.length&&(T.snapGrid=[0]),0!==T.params.spaceBetween&&(i()?T.rtl?T.slides.css({marginLeft:a+"px"}):T.slides.css({marginRight:a+"px"}):T.slides.css({marginBottom:a+"px"})),T.params.watchSlidesProgress&&T.updateSlidesOffset()},T.updateSlidesOffset=function(){for(var e=0;e<T.slides.length;e++)T.slides[e].swiperSlideOffset=i()?T.slides[e].offsetLeft:T.slides[e].offsetTop},T.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=T.translate||0),0!==T.slides.length){"undefined"==typeof T.slides[0].swiperSlideOffset&&T.updateSlidesOffset();var a=-e;T.rtl&&(a=e),T.slides.removeClass(T.params.slideVisibleClass);for(var t=0;t<T.slides.length;t++){var r=T.slides[t],s=(a-r.swiperSlideOffset)/(r.swiperSlideSize+T.params.spaceBetween);if(T.params.watchSlidesVisibility){var i=-(a-r.swiperSlideOffset),n=i+T.slidesSizesGrid[t],o=i>=0&&i<T.size||n>0&&n<=T.size||0>=i&&n>=T.size;o&&T.slides.eq(t).addClass(T.params.slideVisibleClass)}r.progress=T.rtl?-s:s}}},T.updateProgress=function(e){"undefined"==typeof e&&(e=T.translate||0);var a=T.maxTranslate()-T.minTranslate(),t=T.isBeginning,r=T.isEnd;0===a?(T.progress=0,T.isBeginning=T.isEnd=!0):(T.progress=(e-T.minTranslate())/a,T.isBeginning=T.progress<=0,T.isEnd=T.progress>=1),T.isBeginning&&!t&&T.emit("onReachBeginning",T),T.isEnd&&!r&&T.emit("onReachEnd",T),T.params.watchSlidesProgress&&T.updateSlidesProgress(e),T.emit("onProgress",T,T.progress)},T.updateActiveIndex=function(){var e,a,t,r=T.rtl?T.translate:-T.translate;for(a=0;a<T.slidesGrid.length;a++)"undefined"!=typeof T.slidesGrid[a+1]?r>=T.slidesGrid[a]&&r<T.slidesGrid[a+1]-(T.slidesGrid[a+1]-T.slidesGrid[a])/2?e=a:r>=T.slidesGrid[a]&&r<T.slidesGrid[a+1]&&(e=a+1):r>=T.slidesGrid[a]&&(e=a);(0>e||"undefined"==typeof e)&&(e=0),t=Math.floor(e/T.params.slidesPerGroup),t>=T.snapGrid.length&&(t=T.snapGrid.length-1),e!==T.activeIndex&&(T.snapIndex=t,T.previousIndex=T.activeIndex,T.activeIndex=e,T.updateClasses())},T.updateClasses=function(){T.slides.removeClass(T.params.slideActiveClass+" "+T.params.slideNextClass+" "+T.params.slidePrevClass);var e=T.slides.eq(T.activeIndex);if(e.addClass(T.params.slideActiveClass),e.next("."+T.params.slideClass).addClass(T.params.slideNextClass),e.prev("."+T.params.slideClass).addClass(T.params.slidePrevClass),T.bullets&&T.bullets.length>0){T.bullets.removeClass(T.params.bulletActiveClass);var t;T.params.loop?(t=Math.ceil(T.activeIndex-T.loopedSlides)/T.params.slidesPerGroup,t>T.slides.length-1-2*T.loopedSlides&&(t-=T.slides.length-2*T.loopedSlides),t>T.bullets.length-1&&(t-=T.bullets.length)):t="undefined"!=typeof T.snapIndex?T.snapIndex:T.activeIndex||0,T.paginationContainer.length>1?T.bullets.each(function(){a(this).index()===t&&a(this).addClass(T.params.bulletActiveClass)}):T.bullets.eq(t).addClass(T.params.bulletActiveClass)}T.params.loop||(T.params.prevButton&&(T.isBeginning?(a(T.params.prevButton).addClass(T.params.buttonDisabledClass),T.params.a11y&&T.a11y&&T.a11y.disable(a(T.params.prevButton))):(a(T.params.prevButton).removeClass(T.params.buttonDisabledClass),T.params.a11y&&T.a11y&&T.a11y.enable(a(T.params.prevButton)))),T.params.nextButton&&(T.isEnd?(a(T.params.nextButton).addClass(T.params.buttonDisabledClass),T.params.a11y&&T.a11y&&T.a11y.disable(a(T.params.nextButton))):(a(T.params.nextButton).removeClass(T.params.buttonDisabledClass),T.params.a11y&&T.a11y&&T.a11y.enable(a(T.params.nextButton)))))},T.updatePagination=function(){if(T.params.pagination&&T.paginationContainer&&T.paginationContainer.length>0){for(var e="",a=T.params.loop?Math.ceil((T.slides.length-2*T.loopedSlides)/T.params.slidesPerGroup):T.snapGrid.length,t=0;a>t;t++)e+=T.params.paginationBulletRender?T.params.paginationBulletRender(t,T.params.bulletClass):"<"+T.params.paginationElement+' class="'+T.params.bulletClass+'"></'+T.params.paginationElement+">";T.paginationContainer.html(e),T.bullets=T.paginationContainer.find("."+T.params.bulletClass),T.params.paginationClickable&&T.params.a11y&&T.a11y&&T.a11y.initPagination()}},T.update=function(e){function a(){r=Math.min(Math.max(T.translate,T.maxTranslate()),T.minTranslate()),T.setWrapperTranslate(r),T.updateActiveIndex(),T.updateClasses()}if(T.updateContainerSize(),T.updateSlidesSize(),T.updateProgress(),T.updatePagination(),T.updateClasses(),T.params.scrollbar&&T.scrollbar&&T.scrollbar.set(),e){var t,r;T.controller&&T.controller.spline&&(T.controller.spline=void 0),T.params.freeMode?(a(),T.params.autoHeight&&T.updateAutoHeight()):(t=("auto"===T.params.slidesPerView||T.params.slidesPerView>1)&&T.isEnd&&!T.params.centeredSlides?T.slideTo(T.slides.length-1,0,!1,!0):T.slideTo(T.activeIndex,0,!1,!0),t||a())}else T.params.autoHeight&&T.updateAutoHeight()},T.onResize=function(e){T.params.breakpoints&&T.setBreakpoint();var a=T.params.allowSwipeToPrev,t=T.params.allowSwipeToNext;if(T.params.allowSwipeToPrev=T.params.allowSwipeToNext=!0,T.updateContainerSize(),T.updateSlidesSize(),("auto"===T.params.slidesPerView||T.params.freeMode||e)&&T.updatePagination(),T.params.scrollbar&&T.scrollbar&&T.scrollbar.set(),T.controller&&T.controller.spline&&(T.controller.spline=void 0),T.params.freeMode){var r=Math.min(Math.max(T.translate,T.maxTranslate()),T.minTranslate());T.setWrapperTranslate(r),T.updateActiveIndex(),T.updateClasses(),T.params.autoHeight&&T.updateAutoHeight()}else T.updateClasses(),("auto"===T.params.slidesPerView||T.params.slidesPerView>1)&&T.isEnd&&!T.params.centeredSlides?T.slideTo(T.slides.length-1,0,!1,!0):T.slideTo(T.activeIndex,0,!1,!0);T.params.allowSwipeToPrev=a,T.params.allowSwipeToNext=t};var x=["mousedown","mousemove","mouseup"];window.navigator.pointerEnabled?x=["pointerdown","pointermove","pointerup"]:window.navigator.msPointerEnabled&&(x=["MSPointerDown","MSPointerMove","MSPointerUp"]),T.touchEvents={start:T.support.touch||!T.params.simulateTouch?"touchstart":x[0],move:T.support.touch||!T.params.simulateTouch?"touchmove":x[1],end:T.support.touch||!T.params.simulateTouch?"touchend":x[2]},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===T.params.touchEventsTarget?T.container:T.wrapper).addClass("swiper-wp8-"+T.params.direction),T.initEvents=function(e){var t=e?"off":"on",r=e?"removeEventListener":"addEventListener",i="container"===T.params.touchEventsTarget?T.container[0]:T.wrapper[0],n=T.support.touch?i:document,o=T.params.nested?!0:!1;T.browser.ie?(i[r](T.touchEvents.start,T.onTouchStart,!1),n[r](T.touchEvents.move,T.onTouchMove,o),n[r](T.touchEvents.end,T.onTouchEnd,!1)):(T.support.touch&&(i[r](T.touchEvents.start,T.onTouchStart,!1),i[r](T.touchEvents.move,T.onTouchMove,o),i[r](T.touchEvents.end,T.onTouchEnd,!1)),!s.simulateTouch||T.device.ios||T.device.android||(i[r]("mousedown",T.onTouchStart,!1),document[r]("mousemove",T.onTouchMove,o),document[r]("mouseup",T.onTouchEnd,!1))),window[r]("resize",T.onResize),T.params.nextButton&&(a(T.params.nextButton)[t]("click",T.onClickNext),T.params.a11y&&T.a11y&&a(T.params.nextButton)[t]("keydown",T.a11y.onEnterKey)),T.params.prevButton&&(a(T.params.prevButton)[t]("click",T.onClickPrev),T.params.a11y&&T.a11y&&a(T.params.prevButton)[t]("keydown",T.a11y.onEnterKey)),T.params.pagination&&T.params.paginationClickable&&(a(T.paginationContainer)[t]("click","."+T.params.bulletClass,T.onClickIndex),T.params.a11y&&T.a11y&&a(T.paginationContainer)[t]("keydown","."+T.params.bulletClass,T.a11y.onEnterKey)),(T.params.preventClicks||T.params.preventClicksPropagation)&&i[r]("click",T.preventClicks,!0)},T.attachEvents=function(e){T.initEvents()},T.detachEvents=function(){T.initEvents(!0)},T.allowClick=!0,T.preventClicks=function(e){T.allowClick||(T.params.preventClicks&&e.preventDefault(),T.params.preventClicksPropagation&&T.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))},T.onClickNext=function(e){e.preventDefault(),(!T.isEnd||T.params.loop)&&T.slideNext()},T.onClickPrev=function(e){e.preventDefault(),(!T.isBeginning||T.params.loop)&&T.slidePrev()},T.onClickIndex=function(e){e.preventDefault();var t=a(this).index()*T.params.slidesPerGroup;T.params.loop&&(t+=T.loopedSlides),T.slideTo(t)},T.updateClickedSlide=function(e){var t=l(e,"."+T.params.slideClass),r=!1;if(t)for(var s=0;s<T.slides.length;s++)T.slides[s]===t&&(r=!0);if(!t||!r)return T.clickedSlide=void 0,void(T.clickedIndex=void 0);if(T.clickedSlide=t,T.clickedIndex=a(t).index(),T.params.slideToClickedSlide&&void 0!==T.clickedIndex&&T.clickedIndex!==T.activeIndex){var i,n=T.clickedIndex;if(T.params.loop){if(T.animating)return;i=a(T.clickedSlide).attr("data-swiper-slide-index"),T.params.centeredSlides?n<T.loopedSlides-T.params.slidesPerView/2||n>T.slides.length-T.loopedSlides+T.params.slidesPerView/2?(T.fixLoop(),n=T.wrapper.children("."+T.params.slideClass+'[data-swiper-slide-index="'+i+'"]:not(.swiper-slide-duplicate)').eq(0).index(),setTimeout(function(){T.slideTo(n)},0)):T.slideTo(n):n>T.slides.length-T.params.slidesPerView?(T.fixLoop(),n=T.wrapper.children("."+T.params.slideClass+'[data-swiper-slide-index="'+i+'"]:not(.swiper-slide-duplicate)').eq(0).index(),setTimeout(function(){T.slideTo(n)},0)):T.slideTo(n)}else T.slideTo(n)}};var S,C,M,E,P,k,z,I,L,D,B="input, select, textarea, button",G=Date.now(),A=[];T.animating=!1,T.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var O,N;if(T.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),O="touchstart"===e.type,O||!("which"in e)||3!==e.which){if(T.params.noSwiping&&l(e,"."+T.params.noSwipingClass))return void(T.allowClick=!0);if(!T.params.swipeHandler||l(e,T.params.swipeHandler)){var t=T.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,r=T.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY;if(!(T.device.ios&&T.params.iOSEdgeSwipeDetection&&t<=T.params.iOSEdgeSwipeThreshold)){if(S=!0,C=!1,M=!0,P=void 0,N=void 0,T.touches.startX=t,T.touches.startY=r,E=Date.now(),T.allowClick=!0,T.updateContainerSize(),T.swipeDirection=void 0,T.params.threshold>0&&(I=!1),"touchstart"!==e.type){var s=!0;a(e.target).is(B)&&(s=!1),document.activeElement&&a(document.activeElement).is(B)&&document.activeElement.blur(),s&&e.preventDefault()}T.emit("onTouchStart",T,e)}}}},T.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!(O&&"mousemove"===e.type||e.preventedByNestedSwiper)){if(T.params.onlyExternal)return T.allowClick=!1,void(S&&(T.touches.startX=T.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,T.touches.startY=T.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,E=Date.now()));if(O&&document.activeElement&&e.target===document.activeElement&&a(e.target).is(B))return C=!0,void(T.allowClick=!1);if(M&&T.emit("onTouchMove",T,e),!(e.targetTouches&&e.targetTouches.length>1)){if(T.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,T.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof P){var t=180*Math.atan2(Math.abs(T.touches.currentY-T.touches.startY),Math.abs(T.touches.currentX-T.touches.startX))/Math.PI;P=i()?t>T.params.touchAngle:90-t>T.params.touchAngle}if(P&&T.emit("onTouchMoveOpposite",T,e),"undefined"==typeof N&&T.browser.ieTouch&&(T.touches.currentX!==T.touches.startX||T.touches.currentY!==T.touches.startY)&&(N=!0),S){if(P)return void(S=!1);if(N||!T.browser.ieTouch){T.allowClick=!1,T.emit("onSliderMove",T,e),e.preventDefault(),T.params.touchMoveStopPropagation&&!T.params.nested&&e.stopPropagation(),C||(s.loop&&T.fixLoop(),z=T.getWrapperTranslate(),T.setWrapperTransition(0),T.animating&&T.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),T.params.autoplay&&T.autoplaying&&(T.params.autoplayDisableOnInteraction?T.stopAutoplay():T.pauseAutoplay()),D=!1,T.params.grabCursor&&(T.container[0].style.cursor="move",T.container[0].style.cursor="-webkit-grabbing",T.container[0].style.cursor="-moz-grabbin",T.container[0].style.cursor="grabbing")),C=!0;var r=T.touches.diff=i()?T.touches.currentX-T.touches.startX:T.touches.currentY-T.touches.startY;r*=T.params.touchRatio,T.rtl&&(r=-r),T.swipeDirection=r>0?"prev":"next",k=r+z;var n=!0;if(r>0&&k>T.minTranslate()?(n=!1,T.params.resistance&&(k=T.minTranslate()-1+Math.pow(-T.minTranslate()+z+r,T.params.resistanceRatio))):0>r&&k<T.maxTranslate()&&(n=!1,T.params.resistance&&(k=T.maxTranslate()+1-Math.pow(T.maxTranslate()-z-r,T.params.resistanceRatio))),n&&(e.preventedByNestedSwiper=!0),!T.params.allowSwipeToNext&&"next"===T.swipeDirection&&z>k&&(k=z),!T.params.allowSwipeToPrev&&"prev"===T.swipeDirection&&k>z&&(k=z),T.params.followFinger){if(T.params.threshold>0){if(!(Math.abs(r)>T.params.threshold||I))return void(k=z);if(!I)return I=!0,T.touches.startX=T.touches.currentX,T.touches.startY=T.touches.currentY,k=z,void(T.touches.diff=i()?T.touches.currentX-T.touches.startX:T.touches.currentY-T.touches.startY)}(T.params.freeMode||T.params.watchSlidesProgress)&&T.updateActiveIndex(),T.params.freeMode&&(0===A.length&&A.push({position:T.touches[i()?"startX":"startY"],time:E}),A.push({position:T.touches[i()?"currentX":"currentY"],time:(new window.Date).getTime()})),T.updateProgress(k),T.setWrapperTranslate(k)}}}}}},T.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),M&&T.emit("onTouchEnd",T,e),M=!1,S){T.params.grabCursor&&C&&S&&(T.container[0].style.cursor="move",T.container[0].style.cursor="-webkit-grab",T.container[0].style.cursor="-moz-grab",T.container[0].style.cursor="grab");var t=Date.now(),r=t-E;if(T.allowClick&&(T.updateClickedSlide(e),T.emit("onTap",T,e),300>r&&t-G>300&&(L&&clearTimeout(L),L=setTimeout(function(){T&&(T.params.paginationHide&&T.paginationContainer.length>0&&!a(e.target).hasClass(T.params.bulletClass)&&T.paginationContainer.toggleClass(T.params.paginationHiddenClass),T.emit("onClick",T,e))},300)),300>r&&300>t-G&&(L&&clearTimeout(L),T.emit("onDoubleTap",T,e))),G=Date.now(),setTimeout(function(){T&&(T.allowClick=!0)},0),!S||!C||!T.swipeDirection||0===T.touches.diff||k===z)return void(S=C=!1);S=C=!1;var s;if(s=T.params.followFinger?T.rtl?T.translate:-T.translate:-k,T.params.freeMode){if(s<-T.minTranslate())return void T.slideTo(T.activeIndex);if(s>-T.maxTranslate())return void(T.slides.length<T.snapGrid.length?T.slideTo(T.snapGrid.length-1):T.slideTo(T.slides.length-1));if(T.params.freeModeMomentum){if(A.length>1){var i=A.pop(),n=A.pop(),o=i.position-n.position,l=i.time-n.time;T.velocity=o/l,T.velocity=T.velocity/2,Math.abs(T.velocity)<T.params.freeModeMinimumVelocity&&(T.velocity=0),(l>150||(new window.Date).getTime()-i.time>300)&&(T.velocity=0)}else T.velocity=0;A.length=0;var d=1e3*T.params.freeModeMomentumRatio,p=T.velocity*d,u=T.translate+p;T.rtl&&(u=-u);var c,m=!1,f=20*Math.abs(T.velocity)*T.params.freeModeMomentumBounceRatio;if(u<T.maxTranslate())T.params.freeModeMomentumBounce?(u+T.maxTranslate()<-f&&(u=T.maxTranslate()-f),c=T.maxTranslate(),m=!0,D=!0):u=T.maxTranslate();else if(u>T.minTranslate())T.params.freeModeMomentumBounce?(u-T.minTranslate()>f&&(u=T.minTranslate()+f),c=T.minTranslate(),m=!0,D=!0):u=T.minTranslate();else if(T.params.freeModeSticky){var h,g=0;for(g=0;g<T.snapGrid.length;g+=1)if(T.snapGrid[g]>-u){h=g;break}u=Math.abs(T.snapGrid[h]-u)<Math.abs(T.snapGrid[h-1]-u)||"next"===T.swipeDirection?T.snapGrid[h]:T.snapGrid[h-1],T.rtl||(u=-u)}if(0!==T.velocity)d=T.rtl?Math.abs((-u-T.translate)/T.velocity):Math.abs((u-T.translate)/T.velocity);else if(T.params.freeModeSticky)return void T.slideReset();T.params.freeModeMomentumBounce&&m?(T.updateProgress(c),T.setWrapperTransition(d),T.setWrapperTranslate(u),T.onTransitionStart(),T.animating=!0,T.wrapper.transitionEnd(function(){T&&D&&(T.emit("onMomentumBounce",T),T.setWrapperTransition(T.params.speed),T.setWrapperTranslate(c),T.wrapper.transitionEnd(function(){T&&T.onTransitionEnd()}))})):T.velocity?(T.updateProgress(u),T.setWrapperTransition(d),T.setWrapperTranslate(u),T.onTransitionStart(),T.animating||(T.animating=!0,T.wrapper.transitionEnd(function(){T&&T.onTransitionEnd()}))):T.updateProgress(u),T.updateActiveIndex()}return void((!T.params.freeModeMomentum||r>=T.params.longSwipesMs)&&(T.updateProgress(),T.updateActiveIndex()))}var v,w=0,y=T.slidesSizesGrid[0];
for(v=0;v<T.slidesGrid.length;v+=T.params.slidesPerGroup)"undefined"!=typeof T.slidesGrid[v+T.params.slidesPerGroup]?s>=T.slidesGrid[v]&&s<T.slidesGrid[v+T.params.slidesPerGroup]&&(w=v,y=T.slidesGrid[v+T.params.slidesPerGroup]-T.slidesGrid[v]):s>=T.slidesGrid[v]&&(w=v,y=T.slidesGrid[T.slidesGrid.length-1]-T.slidesGrid[T.slidesGrid.length-2]);var b=(s-T.slidesGrid[w])/y;if(r>T.params.longSwipesMs){if(!T.params.longSwipes)return void T.slideTo(T.activeIndex);"next"===T.swipeDirection&&(b>=T.params.longSwipesRatio?T.slideTo(w+T.params.slidesPerGroup):T.slideTo(w)),"prev"===T.swipeDirection&&(b>1-T.params.longSwipesRatio?T.slideTo(w+T.params.slidesPerGroup):T.slideTo(w))}else{if(!T.params.shortSwipes)return void T.slideTo(T.activeIndex);"next"===T.swipeDirection&&T.slideTo(w+T.params.slidesPerGroup),"prev"===T.swipeDirection&&T.slideTo(w)}}},T._slideTo=function(e,a){return T.slideTo(e,a,!0,!0)},T.slideTo=function(e,a,t,r){"undefined"==typeof t&&(t=!0),"undefined"==typeof e&&(e=0),0>e&&(e=0),T.snapIndex=Math.floor(e/T.params.slidesPerGroup),T.snapIndex>=T.snapGrid.length&&(T.snapIndex=T.snapGrid.length-1);var s=-T.snapGrid[T.snapIndex];T.params.autoplay&&T.autoplaying&&(r||!T.params.autoplayDisableOnInteraction?T.pauseAutoplay(a):T.stopAutoplay()),T.updateProgress(s);for(var i=0;i<T.slidesGrid.length;i++)-Math.floor(100*s)>=Math.floor(100*T.slidesGrid[i])&&(e=i);return!T.params.allowSwipeToNext&&s<T.translate&&s<T.minTranslate()?!1:!T.params.allowSwipeToPrev&&s>T.translate&&s>T.maxTranslate()&&(T.activeIndex||0)!==e?!1:("undefined"==typeof a&&(a=T.params.speed),T.previousIndex=T.activeIndex||0,T.activeIndex=e,T.rtl&&-s===T.translate||!T.rtl&&s===T.translate?(T.params.autoHeight&&T.updateAutoHeight(),T.updateClasses(),"slide"!==T.params.effect&&T.setWrapperTranslate(s),!1):(T.updateClasses(),T.onTransitionStart(t),0===a?(T.setWrapperTranslate(s),T.setWrapperTransition(0),T.onTransitionEnd(t)):(T.setWrapperTranslate(s),T.setWrapperTransition(a),T.animating||(T.animating=!0,T.wrapper.transitionEnd(function(){T&&T.onTransitionEnd(t)}))),!0))},T.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),T.params.autoHeight&&T.updateAutoHeight(),T.lazy&&T.lazy.onTransitionStart(),e&&(T.emit("onTransitionStart",T),T.activeIndex!==T.previousIndex&&(T.emit("onSlideChangeStart",T),T.activeIndex>T.previousIndex?T.emit("onSlideNextStart",T):T.emit("onSlidePrevStart",T)))},T.onTransitionEnd=function(e){T.animating=!1,T.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),T.lazy&&T.lazy.onTransitionEnd(),e&&(T.emit("onTransitionEnd",T),T.activeIndex!==T.previousIndex&&(T.emit("onSlideChangeEnd",T),T.activeIndex>T.previousIndex?T.emit("onSlideNextEnd",T):T.emit("onSlidePrevEnd",T))),T.params.hashnav&&T.hashnav&&T.hashnav.setHash()},T.slideNext=function(e,a,t){if(T.params.loop){if(T.animating)return!1;T.fixLoop();T.container[0].clientLeft;return T.slideTo(T.activeIndex+T.params.slidesPerGroup,a,e,t)}return T.slideTo(T.activeIndex+T.params.slidesPerGroup,a,e,t)},T._slideNext=function(e){return T.slideNext(!0,e,!0)},T.slidePrev=function(e,a,t){if(T.params.loop){if(T.animating)return!1;T.fixLoop();T.container[0].clientLeft;return T.slideTo(T.activeIndex-1,a,e,t)}return T.slideTo(T.activeIndex-1,a,e,t)},T._slidePrev=function(e){return T.slidePrev(!0,e,!0)},T.slideReset=function(e,a,t){return T.slideTo(T.activeIndex,a,e)},T.setWrapperTransition=function(e,a){T.wrapper.transition(e),"slide"!==T.params.effect&&T.effects[T.params.effect]&&T.effects[T.params.effect].setTransition(e),T.params.parallax&&T.parallax&&T.parallax.setTransition(e),T.params.scrollbar&&T.scrollbar&&T.scrollbar.setTransition(e),T.params.control&&T.controller&&T.controller.setTransition(e,a),T.emit("onSetTransition",T,e)},T.setWrapperTranslate=function(e,a,t){var r=0,s=0,o=0;i()?r=T.rtl?-e:e:s=e,T.params.roundLengths&&(r=n(r),s=n(s)),T.params.virtualTranslate||(T.support.transforms3d?T.wrapper.transform("translate3d("+r+"px, "+s+"px, "+o+"px)"):T.wrapper.transform("translate("+r+"px, "+s+"px)")),T.translate=i()?r:s;var l,d=T.maxTranslate()-T.minTranslate();l=0===d?0:(e-T.minTranslate())/d,l!==T.progress&&T.updateProgress(e),a&&T.updateActiveIndex(),"slide"!==T.params.effect&&T.effects[T.params.effect]&&T.effects[T.params.effect].setTranslate(T.translate),T.params.parallax&&T.parallax&&T.parallax.setTranslate(T.translate),T.params.scrollbar&&T.scrollbar&&T.scrollbar.setTranslate(T.translate),T.params.control&&T.controller&&T.controller.setTranslate(T.translate,t),T.emit("onSetTranslate",T,T.translate)},T.getTranslate=function(e,a){var t,r,s,i;return"undefined"==typeof a&&(a="x"),T.params.virtualTranslate?T.rtl?-T.translate:T.translate:(s=window.getComputedStyle(e,null),window.WebKitCSSMatrix?(r=s.transform||s.webkitTransform,r.split(",").length>6&&(r=r.split(", ").map(function(e){return e.replace(",",".")}).join(", ")),i=new window.WebKitCSSMatrix("none"===r?"":r)):(i=s.MozTransform||s.OTransform||s.MsTransform||s.msTransform||s.transform||s.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),t=i.toString().split(",")),"x"===a&&(r=window.WebKitCSSMatrix?i.m41:16===t.length?parseFloat(t[12]):parseFloat(t[4])),"y"===a&&(r=window.WebKitCSSMatrix?i.m42:16===t.length?parseFloat(t[13]):parseFloat(t[5])),T.rtl&&r&&(r=-r),r||0)},T.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=i()?"x":"y"),T.getTranslate(T.wrapper[0],e)},T.observers=[],T.initObservers=function(){if(T.params.observeParents)for(var e=T.container.parents(),a=0;a<e.length;a++)d(e[a]);d(T.container[0],{childList:!1}),d(T.wrapper[0],{attributes:!1})},T.disconnectObservers=function(){for(var e=0;e<T.observers.length;e++)T.observers[e].disconnect();T.observers=[]},T.createLoop=function(){T.wrapper.children("."+T.params.slideClass+"."+T.params.slideDuplicateClass).remove();var e=T.wrapper.children("."+T.params.slideClass);"auto"!==T.params.slidesPerView||T.params.loopedSlides||(T.params.loopedSlides=e.length),T.loopedSlides=parseInt(T.params.loopedSlides||T.params.slidesPerView,10),T.loopedSlides=T.loopedSlides+T.params.loopAdditionalSlides,T.loopedSlides>e.length&&(T.loopedSlides=e.length);var t,r=[],s=[];for(e.each(function(t,i){var n=a(this);t<T.loopedSlides&&s.push(i),t<e.length&&t>=e.length-T.loopedSlides&&r.push(i),n.attr("data-swiper-slide-index",t)}),t=0;t<s.length;t++)T.wrapper.append(a(s[t].cloneNode(!0)).addClass(T.params.slideDuplicateClass));for(t=r.length-1;t>=0;t--)T.wrapper.prepend(a(r[t].cloneNode(!0)).addClass(T.params.slideDuplicateClass))},T.destroyLoop=function(){T.wrapper.children("."+T.params.slideClass+"."+T.params.slideDuplicateClass).remove(),T.slides.removeAttr("data-swiper-slide-index")},T.fixLoop=function(){var e;T.activeIndex<T.loopedSlides?(e=T.slides.length-3*T.loopedSlides+T.activeIndex,e+=T.loopedSlides,T.slideTo(e,0,!1,!0)):("auto"===T.params.slidesPerView&&T.activeIndex>=2*T.loopedSlides||T.activeIndex>T.slides.length-2*T.params.slidesPerView)&&(e=-T.slides.length+T.activeIndex+T.loopedSlides,e+=T.loopedSlides,T.slideTo(e,0,!1,!0))},T.appendSlide=function(e){if(T.params.loop&&T.destroyLoop(),"object"==typeof e&&e.length)for(var a=0;a<e.length;a++)e[a]&&T.wrapper.append(e[a]);else T.wrapper.append(e);T.params.loop&&T.createLoop(),T.params.observer&&T.support.observer||T.update(!0)},T.prependSlide=function(e){T.params.loop&&T.destroyLoop();var a=T.activeIndex+1;if("object"==typeof e&&e.length){for(var t=0;t<e.length;t++)e[t]&&T.wrapper.prepend(e[t]);a=T.activeIndex+e.length}else T.wrapper.prepend(e);T.params.loop&&T.createLoop(),T.params.observer&&T.support.observer||T.update(!0),T.slideTo(a,0,!1)},T.removeSlide=function(e){T.params.loop&&(T.destroyLoop(),T.slides=T.wrapper.children("."+T.params.slideClass));var a,t=T.activeIndex;if("object"==typeof e&&e.length){for(var r=0;r<e.length;r++)a=e[r],T.slides[a]&&T.slides.eq(a).remove(),t>a&&t--;t=Math.max(t,0)}else a=e,T.slides[a]&&T.slides.eq(a).remove(),t>a&&t--,t=Math.max(t,0);T.params.loop&&T.createLoop(),T.params.observer&&T.support.observer||T.update(!0),T.params.loop?T.slideTo(t+T.loopedSlides,0,!1):T.slideTo(t,0,!1)},T.removeAllSlides=function(){for(var e=[],a=0;a<T.slides.length;a++)e.push(a);T.removeSlide(e)},T.effects={fade:{setTranslate:function(){for(var e=0;e<T.slides.length;e++){var a=T.slides.eq(e),t=a[0].swiperSlideOffset,r=-t;T.params.virtualTranslate||(r-=T.translate);var s=0;i()||(s=r,r=0);var n=T.params.fade.crossFade?Math.max(1-Math.abs(a[0].progress),0):1+Math.min(Math.max(a[0].progress,-1),0);a.css({opacity:n}).transform("translate3d("+r+"px, "+s+"px, 0px)")}},setTransition:function(e){if(T.slides.transition(e),T.params.virtualTranslate&&0!==e){var a=!1;T.slides.transitionEnd(function(){if(!a&&T){a=!0,T.animating=!1;for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],t=0;t<e.length;t++)T.wrapper.trigger(e[t])}})}}},cube:{setTranslate:function(){var e,t=0;T.params.cube.shadow&&(i()?(e=T.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),T.wrapper.append(e)),e.css({height:T.width+"px"})):(e=T.container.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),T.container.append(e))));for(var r=0;r<T.slides.length;r++){var s=T.slides.eq(r),n=90*r,o=Math.floor(n/360);T.rtl&&(n=-n,o=Math.floor(-n/360));var l=Math.max(Math.min(s[0].progress,1),-1),d=0,p=0,u=0;r%4===0?(d=4*-o*T.size,u=0):(r-1)%4===0?(d=0,u=4*-o*T.size):(r-2)%4===0?(d=T.size+4*o*T.size,u=T.size):(r-3)%4===0&&(d=-T.size,u=3*T.size+4*T.size*o),T.rtl&&(d=-d),i()||(p=d,d=0);var c="rotateX("+(i()?0:-n)+"deg) rotateY("+(i()?n:0)+"deg) translate3d("+d+"px, "+p+"px, "+u+"px)";if(1>=l&&l>-1&&(t=90*r+90*l,T.rtl&&(t=90*-r-90*l)),s.transform(c),T.params.cube.slideShadows){var m=i()?s.find(".swiper-slide-shadow-left"):s.find(".swiper-slide-shadow-top"),f=i()?s.find(".swiper-slide-shadow-right"):s.find(".swiper-slide-shadow-bottom");0===m.length&&(m=a('<div class="swiper-slide-shadow-'+(i()?"left":"top")+'"></div>'),s.append(m)),0===f.length&&(f=a('<div class="swiper-slide-shadow-'+(i()?"right":"bottom")+'"></div>'),s.append(f));s[0].progress;m.length&&(m[0].style.opacity=-s[0].progress),f.length&&(f[0].style.opacity=s[0].progress)}}if(T.wrapper.css({"-webkit-transform-origin":"50% 50% -"+T.size/2+"px","-moz-transform-origin":"50% 50% -"+T.size/2+"px","-ms-transform-origin":"50% 50% -"+T.size/2+"px","transform-origin":"50% 50% -"+T.size/2+"px"}),T.params.cube.shadow)if(i())e.transform("translate3d(0px, "+(T.width/2+T.params.cube.shadowOffset)+"px, "+-T.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+T.params.cube.shadowScale+")");else{var h=Math.abs(t)-90*Math.floor(Math.abs(t)/90),g=1.5-(Math.sin(2*h*Math.PI/360)/2+Math.cos(2*h*Math.PI/360)/2),v=T.params.cube.shadowScale,w=T.params.cube.shadowScale/g,y=T.params.cube.shadowOffset;e.transform("scale3d("+v+", 1, "+w+") translate3d(0px, "+(T.height/2+y)+"px, "+-T.height/2/w+"px) rotateX(-90deg)")}var b=T.isSafari||T.isUiWebView?-T.size/2:0;T.wrapper.transform("translate3d(0px,0,"+b+"px) rotateX("+(i()?0:t)+"deg) rotateY("+(i()?-t:0)+"deg)")},setTransition:function(e){T.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),T.params.cube.shadow&&!i()&&T.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=T.translate,t=i()?-e+T.width/2:-e+T.height/2,r=i()?T.params.coverflow.rotate:-T.params.coverflow.rotate,s=T.params.coverflow.depth,n=0,o=T.slides.length;o>n;n++){var l=T.slides.eq(n),d=T.slidesSizesGrid[n],p=l[0].swiperSlideOffset,u=(t-p-d/2)/d*T.params.coverflow.modifier,c=i()?r*u:0,m=i()?0:r*u,f=-s*Math.abs(u),h=i()?0:T.params.coverflow.stretch*u,g=i()?T.params.coverflow.stretch*u:0;Math.abs(g)<.001&&(g=0),Math.abs(h)<.001&&(h=0),Math.abs(f)<.001&&(f=0),Math.abs(c)<.001&&(c=0),Math.abs(m)<.001&&(m=0);var v="translate3d("+g+"px,"+h+"px,"+f+"px)  rotateX("+m+"deg) rotateY("+c+"deg)";if(l.transform(v),l[0].style.zIndex=-Math.abs(Math.round(u))+1,T.params.coverflow.slideShadows){var w=i()?l.find(".swiper-slide-shadow-left"):l.find(".swiper-slide-shadow-top"),y=i()?l.find(".swiper-slide-shadow-right"):l.find(".swiper-slide-shadow-bottom");0===w.length&&(w=a('<div class="swiper-slide-shadow-'+(i()?"left":"top")+'"></div>'),l.append(w)),0===y.length&&(y=a('<div class="swiper-slide-shadow-'+(i()?"right":"bottom")+'"></div>'),l.append(y)),w.length&&(w[0].style.opacity=u>0?u:0),y.length&&(y[0].style.opacity=-u>0?-u:0)}}if(T.browser.ie){var b=T.wrapper[0].style;b.perspectiveOrigin=t+"px 50%"}},setTransition:function(e){T.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},T.lazy={initialImageLoaded:!1,loadImageInSlide:function(e,t){if("undefined"!=typeof e&&("undefined"==typeof t&&(t=!0),0!==T.slides.length)){var r=T.slides.eq(e),s=r.find(".swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)");!r.hasClass("swiper-lazy")||r.hasClass("swiper-lazy-loaded")||r.hasClass("swiper-lazy-loading")||(s=s.add(r[0])),0!==s.length&&s.each(function(){var e=a(this);e.addClass("swiper-lazy-loading");var s=e.attr("data-background"),i=e.attr("data-src"),n=e.attr("data-srcset");T.loadImage(e[0],i||s,n,!1,function(){if(s?(e.css("background-image","url("+s+")"),e.removeAttr("data-background")):(n&&(e.attr("srcset",n),e.removeAttr("data-srcset")),i&&(e.attr("src",i),e.removeAttr("data-src"))),e.addClass("swiper-lazy-loaded").removeClass("swiper-lazy-loading"),r.find(".swiper-lazy-preloader, .preloader").remove(),T.params.loop&&t){var a=r.attr("data-swiper-slide-index");if(r.hasClass(T.params.slideDuplicateClass)){var o=T.wrapper.children('[data-swiper-slide-index="'+a+'"]:not(.'+T.params.slideDuplicateClass+")");T.lazy.loadImageInSlide(o.index(),!1)}else{var l=T.wrapper.children("."+T.params.slideDuplicateClass+'[data-swiper-slide-index="'+a+'"]');T.lazy.loadImageInSlide(l.index(),!1)}}T.emit("onLazyImageReady",T,r[0],e[0])}),T.emit("onLazyImageLoad",T,r[0],e[0])})}},load:function(){var e;if(T.params.watchSlidesVisibility)T.wrapper.children("."+T.params.slideVisibleClass).each(function(){T.lazy.loadImageInSlide(a(this).index())});else if(T.params.slidesPerView>1)for(e=T.activeIndex;e<T.activeIndex+T.params.slidesPerView;e++)T.slides[e]&&T.lazy.loadImageInSlide(e);else T.lazy.loadImageInSlide(T.activeIndex);if(T.params.lazyLoadingInPrevNext)if(T.params.slidesPerView>1){for(e=T.activeIndex+T.params.slidesPerView;e<T.activeIndex+T.params.slidesPerView+T.params.slidesPerView;e++)T.slides[e]&&T.lazy.loadImageInSlide(e);for(e=T.activeIndex-T.params.slidesPerView;e<T.activeIndex;e++)T.slides[e]&&T.lazy.loadImageInSlide(e)}else{var t=T.wrapper.children("."+T.params.slideNextClass);t.length>0&&T.lazy.loadImageInSlide(t.index());var r=T.wrapper.children("."+T.params.slidePrevClass);r.length>0&&T.lazy.loadImageInSlide(r.index())}},onTransitionStart:function(){T.params.lazyLoading&&(T.params.lazyLoadingOnTransitionStart||!T.params.lazyLoadingOnTransitionStart&&!T.lazy.initialImageLoaded)&&T.lazy.load()},onTransitionEnd:function(){T.params.lazyLoading&&!T.params.lazyLoadingOnTransitionStart&&T.lazy.load()}},T.scrollbar={isTouched:!1,setDragPosition:function(e){var a=T.scrollbar,t=i()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageX:e.pageX||e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageY:e.pageY||e.clientY,r=t-a.track.offset()[i()?"left":"top"]-a.dragSize/2,s=-T.minTranslate()*a.moveDivider,n=-T.maxTranslate()*a.moveDivider;s>r?r=s:r>n&&(r=n),r=-r/a.moveDivider,T.updateProgress(r),T.setWrapperTranslate(r,!0)},dragStart:function(e){var a=T.scrollbar;a.isTouched=!0,e.preventDefault(),e.stopPropagation(),a.setDragPosition(e),clearTimeout(a.dragTimeout),a.track.transition(0),T.params.scrollbarHide&&a.track.css("opacity",1),T.wrapper.transition(100),a.drag.transition(100),T.emit("onScrollbarDragStart",T)},dragMove:function(e){var a=T.scrollbar;a.isTouched&&(e.preventDefault?e.preventDefault():e.returnValue=!1,a.setDragPosition(e),T.wrapper.transition(0),a.track.transition(0),a.drag.transition(0),T.emit("onScrollbarDragMove",T))},dragEnd:function(e){var a=T.scrollbar;a.isTouched&&(a.isTouched=!1,T.params.scrollbarHide&&(clearTimeout(a.dragTimeout),a.dragTimeout=setTimeout(function(){a.track.css("opacity",0),a.track.transition(400)},1e3)),T.emit("onScrollbarDragEnd",T),T.params.scrollbarSnapOnRelease&&T.slideReset())},enableDraggable:function(){var e=T.scrollbar,t=T.support.touch?e.track:document;a(e.track).on(T.touchEvents.start,e.dragStart),a(t).on(T.touchEvents.move,e.dragMove),a(t).on(T.touchEvents.end,e.dragEnd)},disableDraggable:function(){var e=T.scrollbar,t=T.support.touch?e.track:document;a(e.track).off(T.touchEvents.start,e.dragStart),a(t).off(T.touchEvents.move,e.dragMove),a(t).off(T.touchEvents.end,e.dragEnd)},set:function(){if(T.params.scrollbar){var e=T.scrollbar;e.track=a(T.params.scrollbar),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=a('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=i()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=T.size/T.virtualSize,e.moveDivider=e.divider*(e.trackSize/T.size),e.dragSize=e.trackSize*e.divider,i()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.divider>=1?e.track[0].style.display="none":e.track[0].style.display="",T.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(T.params.scrollbar){var e,a=T.scrollbar,t=(T.translate||0,a.dragSize);e=(a.trackSize-a.dragSize)*T.progress,T.rtl&&i()?(e=-e,e>0?(t=a.dragSize-e,e=0):-e+a.dragSize>a.trackSize&&(t=a.trackSize+e)):0>e?(t=a.dragSize+e,e=0):e+a.dragSize>a.trackSize&&(t=a.trackSize-e),i()?(T.support.transforms3d?a.drag.transform("translate3d("+e+"px, 0, 0)"):a.drag.transform("translateX("+e+"px)"),a.drag[0].style.width=t+"px"):(T.support.transforms3d?a.drag.transform("translate3d(0px, "+e+"px, 0)"):a.drag.transform("translateY("+e+"px)"),a.drag[0].style.height=t+"px"),T.params.scrollbarHide&&(clearTimeout(a.timeout),a.track[0].style.opacity=1,a.timeout=setTimeout(function(){a.track[0].style.opacity=0,a.track.transition(400)},1e3))}},setTransition:function(e){T.params.scrollbar&&T.scrollbar.drag.transition(e)}},T.controller={LinearSpline:function(e,a){this.x=e,this.y=a,this.lastIndex=e.length-1;var t,r;this.x.length;this.interpolate=function(e){return e?(r=s(this.x,e),t=r-1,(e-this.x[t])*(this.y[r]-this.y[t])/(this.x[r]-this.x[t])+this.y[t]):0};var s=function(){var e,a,t;return function(r,s){for(a=-1,e=r.length;e-a>1;)r[t=e+a>>1]<=s?a=t:e=t;return e}}()},getInterpolateFunction:function(e){T.controller.spline||(T.controller.spline=T.params.loop?new T.controller.LinearSpline(T.slidesGrid,e.slidesGrid):new T.controller.LinearSpline(T.snapGrid,e.snapGrid))},setTranslate:function(e,a){function r(a){e=a.rtl&&"horizontal"===a.params.direction?-T.translate:T.translate,"slide"===T.params.controlBy&&(T.controller.getInterpolateFunction(a),i=-T.controller.spline.interpolate(-e)),i&&"container"!==T.params.controlBy||(s=(a.maxTranslate()-a.minTranslate())/(T.maxTranslate()-T.minTranslate()),i=(e-T.minTranslate())*s+a.minTranslate()),T.params.controlInverse&&(i=a.maxTranslate()-i),a.updateProgress(i),a.setWrapperTranslate(i,!1,T),a.updateActiveIndex()}var s,i,n=T.params.control;if(T.isArray(n))for(var o=0;o<n.length;o++)n[o]!==a&&n[o]instanceof t&&r(n[o]);else n instanceof t&&a!==n&&r(n)},setTransition:function(e,a){function r(a){a.setWrapperTransition(e,T),0!==e&&(a.onTransitionStart(),a.wrapper.transitionEnd(function(){i&&(a.params.loop&&"slide"===T.params.controlBy&&a.fixLoop(),a.onTransitionEnd())}))}var s,i=T.params.control;if(T.isArray(i))for(s=0;s<i.length;s++)i[s]!==a&&i[s]instanceof t&&r(i[s]);else i instanceof t&&a!==i&&r(i)}},T.hashnav={init:function(){if(T.params.hashnav){T.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e)for(var a=0,t=0,r=T.slides.length;r>t;t++){var s=T.slides.eq(t),i=s.attr("data-hash");if(i===e&&!s.hasClass(T.params.slideDuplicateClass)){var n=s.index();T.slideTo(n,a,T.params.runCallbacksOnInit,!0)}}}},setHash:function(){T.hashnav.initialized&&T.params.hashnav&&(document.location.hash=T.slides.eq(T.activeIndex).attr("data-hash")||"")}},T.disableKeyboardControl=function(){T.params.keyboardControl=!1,a(document).off("keydown",p)},T.enableKeyboardControl=function(){T.params.keyboardControl=!0,a(document).on("keydown",p)},T.mousewheel={event:!1,lastScrollTime:(new window.Date).getTime()},T.params.mousewheelControl){try{new window.WheelEvent("wheel"),T.mousewheel.event="wheel"}catch(R){}T.mousewheel.event||void 0===document.onmousewheel||(T.mousewheel.event="mousewheel"),T.mousewheel.event||(T.mousewheel.event="DOMMouseScroll")}T.disableMousewheelControl=function(){return T.mousewheel.event?(T.container.off(T.mousewheel.event,u),!0):!1},T.enableMousewheelControl=function(){return T.mousewheel.event?(T.container.on(T.mousewheel.event,u),!0):!1},T.parallax={setTranslate:function(){T.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){c(this,T.progress)}),T.slides.each(function(){var e=a(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(e[0].progress,-1),1);c(this,a)})})},setTransition:function(e){"undefined"==typeof e&&(e=T.params.speed),T.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var t=a(this),r=parseInt(t.attr("data-swiper-parallax-duration"),10)||e;0===e&&(r=0),t.transition(r)})}},T._plugins=[];for(var W in T.plugins){var V=T.plugins[W](T,T.params[W]);V&&T._plugins.push(V)}return T.callPlugins=function(e){for(var a=0;a<T._plugins.length;a++)e in T._plugins[a]&&T._plugins[a][e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},T.emitterEventListeners={},T.emit=function(e){T.params[e]&&T.params[e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);var a;if(T.emitterEventListeners[e])for(a=0;a<T.emitterEventListeners[e].length;a++)T.emitterEventListeners[e][a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);T.callPlugins&&T.callPlugins(e,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},T.on=function(e,a){return e=m(e),T.emitterEventListeners[e]||(T.emitterEventListeners[e]=[]),T.emitterEventListeners[e].push(a),T},T.off=function(e,a){var t;if(e=m(e),"undefined"==typeof a)return T.emitterEventListeners[e]=[],T;if(T.emitterEventListeners[e]&&0!==T.emitterEventListeners[e].length){for(t=0;t<T.emitterEventListeners[e].length;t++)T.emitterEventListeners[e][t]===a&&T.emitterEventListeners[e].splice(t,1);return T}},T.once=function(e,a){e=m(e);var t=function(){a(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]),T.off(e,t)};return T.on(e,t),T},T.a11y={makeFocusable:function(e){return e.attr("tabIndex","0"),e},addRole:function(e,a){return e.attr("role",a),e},addLabel:function(e,a){return e.attr("aria-label",a),e},disable:function(e){return e.attr("aria-disabled",!0),e},enable:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){13===e.keyCode&&(a(e.target).is(T.params.nextButton)?(T.onClickNext(e),T.isEnd?T.a11y.notify(T.params.lastSlideMessage):T.a11y.notify(T.params.nextSlideMessage)):a(e.target).is(T.params.prevButton)&&(T.onClickPrev(e),T.isBeginning?T.a11y.notify(T.params.firstSlideMessage):T.a11y.notify(T.params.prevSlideMessage)),a(e.target).is("."+T.params.bulletClass)&&a(e.target)[0].click())},liveRegion:a('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),notify:function(e){var a=T.a11y.liveRegion;0!==a.length&&(a.html(""),a.html(e))},init:function(){if(T.params.nextButton){var e=a(T.params.nextButton);T.a11y.makeFocusable(e),T.a11y.addRole(e,"button"),T.a11y.addLabel(e,T.params.nextSlideMessage)}if(T.params.prevButton){var t=a(T.params.prevButton);T.a11y.makeFocusable(t),T.a11y.addRole(t,"button"),T.a11y.addLabel(t,T.params.prevSlideMessage)}a(T.container).append(T.a11y.liveRegion)},initPagination:function(){T.params.pagination&&T.params.paginationClickable&&T.bullets&&T.bullets.length&&T.bullets.each(function(){var e=a(this);T.a11y.makeFocusable(e),T.a11y.addRole(e,"button"),T.a11y.addLabel(e,T.params.paginationBulletMessage.replace(/{{index}}/,e.index()+1))})},destroy:function(){T.a11y.liveRegion&&T.a11y.liveRegion.length>0&&T.a11y.liveRegion.remove()}},T.init=function(){T.params.loop&&T.createLoop(),T.updateContainerSize(),T.updateSlidesSize(),T.updatePagination(),T.params.scrollbar&&T.scrollbar&&(T.scrollbar.set(),T.params.scrollbarDraggable&&T.scrollbar.enableDraggable()),"slide"!==T.params.effect&&T.effects[T.params.effect]&&(T.params.loop||T.updateProgress(),T.effects[T.params.effect].setTranslate()),T.params.loop?T.slideTo(T.params.initialSlide+T.loopedSlides,0,T.params.runCallbacksOnInit):(T.slideTo(T.params.initialSlide,0,T.params.runCallbacksOnInit),0===T.params.initialSlide&&(T.parallax&&T.params.parallax&&T.parallax.setTranslate(),T.lazy&&T.params.lazyLoading&&(T.lazy.load(),T.lazy.initialImageLoaded=!0))),T.attachEvents(),T.params.observer&&T.support.observer&&T.initObservers(),T.params.preloadImages&&!T.params.lazyLoading&&T.preloadImages(),T.params.autoplay&&T.startAutoplay(),T.params.keyboardControl&&T.enableKeyboardControl&&T.enableKeyboardControl(),T.params.mousewheelControl&&T.enableMousewheelControl&&T.enableMousewheelControl(),T.params.hashnav&&T.hashnav&&T.hashnav.init(),T.params.a11y&&T.a11y&&T.a11y.init(),T.emit("onInit",T)},T.cleanupStyles=function(){T.container.removeClass(T.classNames.join(" ")).removeAttr("style"),T.wrapper.removeAttr("style"),T.slides&&T.slides.length&&T.slides.removeClass([T.params.slideVisibleClass,T.params.slideActiveClass,T.params.slideNextClass,T.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"),T.paginationContainer&&T.paginationContainer.length&&T.paginationContainer.removeClass(T.params.paginationHiddenClass),T.bullets&&T.bullets.length&&T.bullets.removeClass(T.params.bulletActiveClass),T.params.prevButton&&a(T.params.prevButton).removeClass(T.params.buttonDisabledClass),T.params.nextButton&&a(T.params.nextButton).removeClass(T.params.buttonDisabledClass),T.params.scrollbar&&T.scrollbar&&(T.scrollbar.track&&T.scrollbar.track.length&&T.scrollbar.track.removeAttr("style"),T.scrollbar.drag&&T.scrollbar.drag.length&&T.scrollbar.drag.removeAttr("style"))},T.destroy=function(e,a){T.detachEvents(),T.stopAutoplay(),T.params.scrollbar&&T.scrollbar&&T.params.scrollbarDraggable&&T.scrollbar.disableDraggable(),T.params.loop&&T.destroyLoop(),a&&T.cleanupStyles(),T.disconnectObservers(),T.params.keyboardControl&&T.disableKeyboardControl&&T.disableKeyboardControl(),T.params.mousewheelControl&&T.disableMousewheelControl&&T.disableMousewheelControl(),T.params.a11y&&T.a11y&&T.a11y.destroy(),T.emit("onDestroy"),e!==!1&&(T=null)},T.init(),T}};t.prototype={isSafari:function(){var e=navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1},device:function(){var e=navigator.userAgent,a=e.match(/(Android);?[\s\/]+([\d.]+)?/),t=e.match(/(iPad).*OS\s([\d_]+)/),r=e.match(/(iPod)(.*OS\s([\d_]+))?/),s=!t&&e.match(/(iPhone\sOS)\s([\d_]+)/);return{ios:t||s||r,android:a}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,a="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),t=0;t<a.length;t++)if(a[t]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}()},plugins:{}};for(var r=(function(){var e=function(e){var a=this,t=0;for(t=0;t<e.length;t++)a[t]=e[t];return a.length=e.length,this},a=function(a,t){var r=[],s=0;if(a&&!t&&a instanceof e)return a;if(a)if("string"==typeof a){var i,n,o=a.trim();if(o.indexOf("<")>=0&&o.indexOf(">")>=0){var l="div";for(0===o.indexOf("<li")&&(l="ul"),0===o.indexOf("<tr")&&(l="tbody"),(0===o.indexOf("<td")||0===o.indexOf("<th"))&&(l="tr"),0===o.indexOf("<tbody")&&(l="table"),0===o.indexOf("<option")&&(l="select"),n=document.createElement(l),n.innerHTML=a,s=0;s<n.childNodes.length;s++)r.push(n.childNodes[s])}else for(i=t||"#"!==a[0]||a.match(/[ .<>:~]/)?(t||document).querySelectorAll(a):[document.getElementById(a.split("#")[1])],s=0;s<i.length;s++)i[s]&&r.push(i[s])}else if(a.nodeType||a===window||a===document)r.push(a);else if(a.length>0&&a[0].nodeType)for(s=0;s<a.length;s++)r.push(a[s]);return new e(r)};return e.prototype={addClass:function(e){if("undefined"==typeof e)return this;for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.add(a[t]);return this},removeClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.remove(a[t]);return this},hasClass:function(e){return this[0]?this[0].classList.contains(e):!1},toggleClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var r=0;r<this.length;r++)this[r].classList.toggle(a[t]);return this},attr:function(e,a){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var t=0;t<this.length;t++)if(2===arguments.length)this[t].setAttribute(e,a);else for(var r in e)this[t][r]=e[r],this[t].setAttribute(r,e[r]);return this},removeAttr:function(e){for(var a=0;a<this.length;a++)this[a].removeAttribute(e);return this},data:function(e,a){if("undefined"!=typeof a){for(var t=0;t<this.length;t++){var r=this[t];r.dom7ElementDataStorage||(r.dom7ElementDataStorage={}),r.dom7ElementDataStorage[e]=a}return this}if(this[0]){var s=this[0].getAttribute("data-"+e);return s?s:this[0].dom7ElementDataStorage&&e in this[0].dom7ElementDataStorage?this[0].dom7ElementDataStorage[e]:void 0}},transform:function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this},on:function(e,t,r,s){function i(e){var s=e.target;if(a(s).is(t))r.call(s,e);else for(var i=a(s).parents(),n=0;n<i.length;n++)a(i[n]).is(t)&&r.call(i[n],e)}var n,o,l=e.split(" ");for(n=0;n<this.length;n++)if("function"==typeof t||t===!1)for("function"==typeof t&&(r=arguments[1],s=arguments[2]||!1),o=0;o<l.length;o++)this[n].addEventListener(l[o],r,s);else for(o=0;o<l.length;o++)this[n].dom7LiveListeners||(this[n].dom7LiveListeners=[]),this[n].dom7LiveListeners.push({listener:r,liveListener:i}),this[n].addEventListener(l[o],i,s);return this},off:function(e,a,t,r){for(var s=e.split(" "),i=0;i<s.length;i++)for(var n=0;n<this.length;n++)if("function"==typeof a||a===!1)"function"==typeof a&&(t=arguments[1],
r=arguments[2]||!1),this[n].removeEventListener(s[i],t,r);else if(this[n].dom7LiveListeners)for(var o=0;o<this[n].dom7LiveListeners.length;o++)this[n].dom7LiveListeners[o].listener===t&&this[n].removeEventListener(s[i],this[n].dom7LiveListeners[o].liveListener,r);return this},once:function(e,a,t,r){function s(n){t(n),i.off(e,a,s,r)}var i=this;"function"==typeof a&&(a=!1,t=arguments[1],r=arguments[2]),i.on(e,a,s,r)},trigger:function(e,a){for(var t=0;t<this.length;t++){var r;try{r=new window.CustomEvent(e,{detail:a,bubbles:!0,cancelable:!0})}catch(s){r=document.createEvent("Event"),r.initEvent(e,!0,!0),r.detail=a}this[t].dispatchEvent(r)}return this},transitionEnd:function(e){function a(i){if(i.target===this)for(e.call(this,i),t=0;t<r.length;t++)s.off(r[t],a)}var t,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(t=0;t<r.length;t++)s.on(r[t],a);return this},width:function(){return this[0]===window?window.innerWidth:this.length>0?parseFloat(this.css("width")):null},outerWidth:function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null},height:function(){return this[0]===window?window.innerHeight:this.length>0?parseFloat(this.css("height")):null},outerHeight:function(e){return this.length>0?e?this[0].offsetHeight+parseFloat(this.css("margin-top"))+parseFloat(this.css("margin-bottom")):this[0].offsetHeight:null},offset:function(){if(this.length>0){var e=this[0],a=e.getBoundingClientRect(),t=document.body,r=e.clientTop||t.clientTop||0,s=e.clientLeft||t.clientLeft||0,i=window.pageYOffset||e.scrollTop,n=window.pageXOffset||e.scrollLeft;return{top:a.top+i-r,left:a.left+n-s}}return null},css:function(e,a){var t;if(1===arguments.length){if("string"!=typeof e){for(t=0;t<this.length;t++)for(var r in e)this[t].style[r]=e[r];return this}if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(t=0;t<this.length;t++)this[t].style[e]=a;return this}return this},each:function(e){for(var a=0;a<this.length;a++)e.call(this[a],a,this[a]);return this},html:function(e){if("undefined"==typeof e)return this[0]?this[0].innerHTML:void 0;for(var a=0;a<this.length;a++)this[a].innerHTML=e;return this},is:function(t){if(!this[0])return!1;var r,s;if("string"==typeof t){var i=this[0];if(i===document)return t===document;if(i===window)return t===window;if(i.matches)return i.matches(t);if(i.webkitMatchesSelector)return i.webkitMatchesSelector(t);if(i.mozMatchesSelector)return i.mozMatchesSelector(t);if(i.msMatchesSelector)return i.msMatchesSelector(t);for(r=a(t),s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}if(t===document)return this[0]===document;if(t===window)return this[0]===window;if(t.nodeType||t instanceof e){for(r=t.nodeType?[t]:t,s=0;s<r.length;s++)if(r[s]===this[0])return!0;return!1}return!1},index:function(){if(this[0]){for(var e=this[0],a=0;null!==(e=e.previousSibling);)1===e.nodeType&&a++;return a}},eq:function(a){if("undefined"==typeof a)return this;var t,r=this.length;return a>r-1?new e([]):0>a?(t=r+a,new e(0>t?[]:[this[t]])):new e([this[a]])},append:function(a){var t,r;for(t=0;t<this.length;t++)if("string"==typeof a){var s=document.createElement("div");for(s.innerHTML=a;s.firstChild;)this[t].appendChild(s.firstChild)}else if(a instanceof e)for(r=0;r<a.length;r++)this[t].appendChild(a[r]);else this[t].appendChild(a);return this},prepend:function(a){var t,r;for(t=0;t<this.length;t++)if("string"==typeof a){var s=document.createElement("div");for(s.innerHTML=a,r=s.childNodes.length-1;r>=0;r--)this[t].insertBefore(s.childNodes[r],this[t].childNodes[0])}else if(a instanceof e)for(r=0;r<a.length;r++)this[t].insertBefore(a[r],this[t].childNodes[0]);else this[t].insertBefore(a,this[t].childNodes[0]);return this},insertBefore:function(e){for(var t=a(e),r=0;r<this.length;r++)if(1===t.length)t[0].parentNode.insertBefore(this[r],t[0]);else if(t.length>1)for(var s=0;s<t.length;s++)t[s].parentNode.insertBefore(this[r].cloneNode(!0),t[s])},insertAfter:function(e){for(var t=a(e),r=0;r<this.length;r++)if(1===t.length)t[0].parentNode.insertBefore(this[r],t[0].nextSibling);else if(t.length>1)for(var s=0;s<t.length;s++)t[s].parentNode.insertBefore(this[r].cloneNode(!0),t[s].nextSibling)},next:function(t){return new e(this.length>0?t?this[0].nextElementSibling&&a(this[0].nextElementSibling).is(t)?[this[0].nextElementSibling]:[]:this[0].nextElementSibling?[this[0].nextElementSibling]:[]:[])},nextAll:function(t){var r=[],s=this[0];if(!s)return new e([]);for(;s.nextElementSibling;){var i=s.nextElementSibling;t?a(i).is(t)&&r.push(i):r.push(i),s=i}return new e(r)},prev:function(t){return new e(this.length>0?t?this[0].previousElementSibling&&a(this[0].previousElementSibling).is(t)?[this[0].previousElementSibling]:[]:this[0].previousElementSibling?[this[0].previousElementSibling]:[]:[])},prevAll:function(t){var r=[],s=this[0];if(!s)return new e([]);for(;s.previousElementSibling;){var i=s.previousElementSibling;t?a(i).is(t)&&r.push(i):r.push(i),s=i}return new e(r)},parent:function(e){for(var t=[],r=0;r<this.length;r++)e?a(this[r].parentNode).is(e)&&t.push(this[r].parentNode):t.push(this[r].parentNode);return a(a.unique(t))},parents:function(e){for(var t=[],r=0;r<this.length;r++)for(var s=this[r].parentNode;s;)e?a(s).is(e)&&t.push(s):t.push(s),s=s.parentNode;return a(a.unique(t))},find:function(a){for(var t=[],r=0;r<this.length;r++)for(var s=this[r].querySelectorAll(a),i=0;i<s.length;i++)t.push(s[i]);return new e(t)},children:function(t){for(var r=[],s=0;s<this.length;s++)for(var i=this[s].childNodes,n=0;n<i.length;n++)t?1===i[n].nodeType&&a(i[n]).is(t)&&r.push(i[n]):1===i[n].nodeType&&r.push(i[n]);return new e(a.unique(r))},remove:function(){for(var e=0;e<this.length;e++)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){var e,t,r=this;for(e=0;e<arguments.length;e++){var s=a(arguments[e]);for(t=0;t<s.length;t++)r[r.length]=s[t],r.length++}return r}},a.fn=e.prototype,a.unique=function(e){for(var a=[],t=0;t<e.length;t++)-1===a.indexOf(e[t])&&a.push(e[t]);return a},a}()),s=["jQuery","Zepto","Dom7"],i=0;i<s.length;i++)window[s[i]]&&e(window[s[i]]);var n;n="undefined"==typeof r?window.Dom7||window.Zepto||window.jQuery:r,n&&("transitionEnd"in n.fn||(n.fn.transitionEnd=function(e){function a(i){if(i.target===this)for(e.call(this,i),t=0;t<r.length;t++)s.off(r[t],a)}var t,r=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=this;if(e)for(t=0;t<r.length;t++)s.on(r[t],a);return this}),"transform"in n.fn||(n.fn.transform=function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this}),"transition"in n.fn||(n.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this})),window.Swiper=t}(),"undefined"!=typeof module?module.exports=window.Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return window.Swiper});
//# sourceMappingURL=maps/swiper.min.js.map
(function($){
	"use strict";

	var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	
	var isTouchDevice = function(){
	    return true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
	}

	$('[data-bg-image]').each(function(){
		$(this).css({ 'background-image': 'url('+$(this).data('bg-image')+')' });
	});

	$('[data-bg-color]').each(function(){
		$(this).css({ 'background-color': $(this).data('bg-color') });
	});

	$('[data-width]').each(function(){
		$(this).css({ 'width': $(this).data('width') });
	});

	$('[data-height]').each(function(){
		$(this).css({ 'height': $(this).data('height') });
	});

	$('[data-alpha]').each(function(){
		$(this).css({ 'opacity': $(this).data('alpha') });
	});


	$(document).ready(function(){

		// check supports mix-blend-mode
		if ('CSS' in window && 'supports' in window.CSS) {
			var supportsMixBlendMode = window.CSS.supports('mix-blend-mode', 'multiply');
			if( !supportsMixBlendMode ){
				$('.fs-slide.fn-slide').addClass('no-blend-mode');
			}
		}

		/* Sub menu */
		$('nav.main-nav li:has(> ul)').addClass('menu-item-has-children');

		/* Mega Menu */
		$('nav.main-nav').find('.menu-item-mega').each(function(){
			var _mega = $(this);
			var _left = $('nav.main-nav').offset().left;
			_left = _left - _mega.offset().left;
			_mega.find('> ul').css({
				'left': _left+'px',
				'width': $('nav.main-nav').width()+'px'
			});
		});
		// responsive for mega menu
		$(window).resize(function(){
			$('nav.main-nav').find('.menu-item-mega').each(function(){
				var _mega = $(this);
				var _left = $('nav.main-nav').offset().left;
				_left = _left - _mega.offset().left;
				_mega.find('> ul').css({
					'left': _left+'px',
					'width': $('nav.main-nav').width()+'px'
				});
			});
		});

        /* Adding code for social-share functionality - 29/05/2019 */

        $(document).on("click", ".trigger-share-pr", function () {
		$(this).closest(".social-tag").find(".social-share-pr > li").toggleClass('slideout social-share-icon');
	});

		/* Push Menu */
		$('.burger-menu').on('click', function(){
			if( $(this).hasClass('pm-right') ){
				if( !$('.push-menu').hasClass('pm-right') ){
					$('.push-menu').addClass('pm-right');
					setTimeout(function(){
						$('.push-menu').addClass('show-pm');
					}, 200);
				}
				else{
					$('.push-menu').addClass('show-pm');
				}
			}
			else{
				if( $('.push-menu').hasClass('pm-right') ){
					$('.push-menu').removeClass('pm-right');
					setTimeout(function(){
						$('.push-menu').addClass('show-pm');
					}, 200);
				}
				else{
					$('.push-menu').addClass('show-pm');
				}
			}
		});
		// click close pm
		$('.push-menu .close-menu').on('click', function(){
			$('.push-menu').removeClass('show-pm');
		});
		// click overlay white space
		$('.push-menu .pm-overlay').on('mouseup', function(e){
			var container = $('.push-menu .pm-container');
			if (!container.is(e.target) && container.has(e.target).length === 0){
		        $('.push-menu .close-menu').trigger('click');
		    }
		});
		// press ESC button
		$(document).keyup(function(e) {
     		if (e.keyCode == 27) {
	        	if( $('.push-menu').hasClass('show-pm') ){
	        		$('.push-menu .close-menu').trigger('click');
	        	}
	    	}
		});


		// fixed footer
		if( $('body').hasClass('fixed-footer') ){
			$('body > .wrapper > .content-area').css({ 'margin-bottom': $('#footer').height() + 'px' });
			$(window).resize(function(){
				$('body > .wrapper > .content-area').css({ 'margin-bottom': $('#footer').height() + 'px' });
			});
		}


		/* Scroll to top anchor */
		$('.scroll-to-top').on('click', function(){
			$('html,body').animate({scrollTop: 0}, 'slow');
			return false;
		});


		/* News slider block */
		$('.image').each(function(){
			if ( typeof $(this).data('src') !== 'undefined' && $(this).data('src') != '' ) {
				$(this).css('background-image', 'url('+$(this).data('src')+')');
			}
		});


		/* Modal video player */
		$('.video-player').each(function(){
			var _video = $(this);
			_video.magnificPopup({
				type: 'iframe'
			});
		});
		$('.video-frame').on('click', function(){
			$(this).find('.video-player').click();
		});



		var msLayerAnimater = function(_active){
			_active.find('.animate-element').each(function(ai){
    			var _el = $(this),
    				_anim = _el.data('anim');

    			_el.css({
    				'-webkit-animation-duration': "0.5s",
    				   '-moz-animation-duration': "0.5s",
    					'-ms-animation-duration': "0.5s",
    					 '-o-animation-duration': "0.5s",
    						'animation-duration': "0.5s"
    			});

    			_el.css({
    				'-webkit-animation-delay': (ai*0.2)+"s",
    				   '-moz-animation-delay': (ai*0.2)+"s",
    					'-ms-animation-delay': (ai*0.2)+"s",
    					 '-o-animation-delay': (ai*0.2)+"s",
    						'animation-delay': (ai*0.2)+"s"
    			});
    			_el.addClass('animated ' + _anim);

    			_el.one(animationEnd, function() {
		            $(this).removeClass('animated ' + _anim);
		        });
    		});
		};

		/* News slider */
		$('.news-slider').each(function(){
			var _news_slider = $(this);
			var _id = _news_slider.find('.master-slider').attr('id');
			var slider = new MasterSlider();
			var sliderHeight = 640;

			slider.control('circletimer' , {color:"#FFFFFF" , stroke:9});

			if(_news_slider.hasClass('news-slider-hover')) {
			
				slider.control('thumblist' , { autohide:false ,dir:'v',type:'tabs', align:'right', margin:0, space:25, width:0, height:105, hideUnder:640 });
				slider.control('scrollbar' , '');
				sliderHeight = 600;
			
			} else {
				slider.control('arrows');
				slider.control('thumblist' , { autohide:false ,dir:'v',type:'tabs', align:'right', margin:10, space:25, width:280, height:175, hideUnder:640 });
				slider.control('scrollbar' , {dir:"v"});
			}

			slider.setup(_id , {
				width:1170,
				height:sliderHeight,
				space:0,
				speed: 100,
				view:'fade'
			});

			setTimeout(function(){
				slider.api.addEventListener(MSSliderEvent.CHANGE_END , function(){
			    	msLayerAnimater(_news_slider.find('.ms-slide.ms-sl-selected'));
				});
			}, 400);

		});


		/* Entertainment slider */
		$('.entertainment-slider').each(function(){
			var _news_slider = $(this);
			var _id = _news_slider.find('.master-slider').attr('id');
			var slider = new MasterSlider();
			var sliderHeight = 840;

			slider.control('thumblist' , {autohide:false ,dir:'v',type:'tabs', align:'right', margin:0, space:10, width:0, height: 150, hideUnder:640});
			slider.control('scrollbar' , '');
		
			slider.setup(_id , {
				width:1170,
				height:sliderHeight,
				space:0,
				view:'fade',
				layout: 'fillwidth'
			});

			setTimeout(function(){
				slider.api.addEventListener(MSSliderEvent.CHANGE_END , function(){
			    	msLayerAnimater(_news_slider.find('.ms-slide.ms-sl-selected'));
				});
			}, 400);

		});



		/* Gallery slider */
		$('.gallery-slider').each(function(){
			var _news_slider = $(this);
			var _id = _news_slider.find('.master-slider').attr('id');
			var slider = new MasterSlider();
			var sliderHeight = 640;
			var _speed = parseInt(_news_slider.data('speed'), 10);
				_speed = _speed > 0 ? _speed : 0;

			var _thumb_width = 90;
			var _thumb_height = 60;
			var _thumb_space = 10;

			if( _news_slider.hasClass('movie-slider') ) {
				_thumb_width = 270;
				_thumb_height = 160;
				_thumb_space = 30;
			}

		    slider.control('thumblist' , {autohide:false, dir:'h', type:'tabs', width:_thumb_width, height:_thumb_height, align:'bottom', space:_thumb_space, margin:0, hideUnder:400});
		 	slider.control('arrows', {autohide: false});
		 	slider.control('scrollbar' , {dir:'h',color:'#444',align:'bottom',autohide:false,margin:20,width:2});

		 	var _options = {
		        width: 1170,
		        height: sliderHeight,
		        space:0,
		        preload:'all',
		        view:'basic'
		    };

		    if( _speed > 0 ){
		    	_options = $.extend(_options, {speed:_speed});
		    }

		    slider.setup( _id, _options);

		    setTimeout(function(){
				slider.api.addEventListener(MSSliderEvent.CHANGE_END , function(){
			    	msLayerAnimater(_news_slider.find('.ms-slide.ms-sl-selected'));
				});
			}, 400);

		});



		// Personal Blog Main Slider
		$('.fs-slide').each(function(){
			var _slider = $(this);

			_slider.find('.swiper-container').swiper({
				slidesPerView: 1,
				spaceBetween: 0,
				speed: 800,
				loop: true,
				nextButton: _slider.find('.fs-arrow-next'),
			    prevButton: _slider.find('.fs-arrow-prev'),
			    pagination: _slider.find('.fs-pagination'),
        		paginationClickable: true,
			    onSlideNextStart: function(swiper){
			    	var _active = _slider.find('.swiper-slide').eq(swiper.activeIndex);

		    		_active.find('.fs-animate-text').each(function(ai){
		    			var _el = $(this);
		    			_el.css({
		    				'-webkit-animation-delay': (ai*0.2)+"s",
		    				   '-moz-animation-delay': (ai*0.2)+"s",
		    					'-ms-animation-delay': (ai*0.2)+"s",
		    					 '-o-animation-delay': (ai*0.2)+"s",
		    						'animation-delay': (ai*0.2)+"s"
		    			});
		    			_el.addClass('animated fadeInRight');

		    			_el.one(animationEnd, function() {
				            $(this).removeClass('animated fadeInRight');
				        });
		    		});
			    },
			    onSlidePrevStart: function(swiper){
			    	var _active = _slider.find('.swiper-slide').eq(swiper.activeIndex);
		    		_active.find('.fs-animate-text').each(function(ai){
		    			var _el = $(this);
		    			_el.css({
		    				'-webkit-animation-delay': (ai*0.2)+"s",
		    				   '-moz-animation-delay': (ai*0.2)+"s",
		    					'-ms-animation-delay': (ai*0.2)+"s",
		    					 '-o-animation-delay': (ai*0.2)+"s",
		    						'animation-delay': (ai*0.2)+"s"
		    			});
		    			_el.addClass('animated fadeInLeft');

		    			_el.one(animationEnd, function() {
				            $(this).removeClass('animated fadeInLeft');
				        });
		    		});
			    }
			});

		});



		/* fn fullwidth slide */
		$('.fn-fullslide').each(function(){
			var _slider = $(this);

			_slider.find('.swiper-container').swiper({
				slidesPerView: 'auto',
				centeredSlides: true,
				spaceBetween: 80,
				speed: 800,
				loop: true,
				nextButton: _slider.find('.fn-arrow-next'),
			    prevButton: _slider.find('.fn-arrow-prev'),
			    pagination: _slider.find('.fn-pagination'),
        		paginationClickable: true
			});
		});


		/* welcome slider */
		$('.wslider').each(function(){
			var _slider = $(this);

			_slider.find('.swiper-container').swiper({
				slidesPerView: 'auto',
				centeredSlides: true,
				spaceBetween: 80,
				speed: 800,
				loop: true,
				nextButton: _slider.find('.ws-arrow-next'),
			    prevButton: _slider.find('.ws-arrow-prev'),
			    pagination: _slider.find('.ws-pagination'),
        		paginationClickable: true
			});
		});


		/* Swiper carousel */
		$('.article-carousel').each(function(){
			var $this = $(this);
			$this.find('.swiper-container').css('width', '100%');
			$this.find('.swiper-container').swiper({
				slidesPerView: 1,
				spaceBetween: 30,
				nextButton: $this.find('.swiper-button-next'),
			    prevButton: $this.find('.swiper-button-prev'),
			});
		});

		

		$('.m-dimension-carousel').each(function(){
			var $this = $(this),
				_col = $this.data('col'),
				_row = $this.data('row'),
				_perView = _col * _row;

			$this.find('.swiper-container').css('width', '100%');
			$this.find('.swiper-container').swiper({
				slidesPerView: _col,
				slidesPerGroup: _col,
		        slidesPerColumn: _row,
				spaceBetween: 30,
				nextButton: $this.find('.swiper-button-next'),
			    prevButton: $this.find('.swiper-button-prev'),
			    breakpoints: {
		            768: {
		                slidesPerView: 3,
		                slidesPerGroup: 3
		            },
		            640: {
		                slidesPerView: 2,
		                slidesPerGroup: 2
		            },
		            480: {
		                slidesPerView: 1,
		                slidesPerGroup: 1
		            }
		        }
			});
		});



		// Personal Blog footer instagram
		$('.footer-instagram .swiper-container').swiper({
			slidesPerView: 6,
			breakpoints: {
	            1024: {
	                slidesPerView: 6
	            },
	            768: {
	                slidesPerView: 3
	            },
	            640: {
	                slidesPerView: 3
	            },
	            320: {
	                slidesPerView: 2
	            }
	        }
		});

	
		// carousel travel
		$('.carousel-travel').each(function(){
			var $this = $(this);
			var _col = $this.data('columns');
			var _space = $this.data('space');
			$this.find('.swiper-container').swiper({
				slidesPerView: _col,
				spaceBetween: _space,
				nextButton: $this.find('.swiper-button-next'),
			    prevButton: $this.find('.swiper-button-prev'),
			    breakpoints: {
			    	996: {
			    		slidesPerView: 3
			    	},
			    	767: {
			    		slidesPerView: 2
			    	},
			    	500: {
			    		slidesPerView: 1
			    	}
			    }
			});

			$this.addClass('loaded');
		});



		$('.tt-el-ticker').each(function(){
			var _ticker = $(this);
			var _strings = [];
			_ticker.find('.entry-ticker').find('span').each(function(){
				_strings.push($(this).html());
			});
			_ticker.find('.entry-ticker').html('');

			var option_tick = {
				strings: _strings,
				startDelay: 0,
				typeSpeed: -500,
				backSpeed: -800,
				backDelay: 5000,
				loop: true,
				onStringTyped: function(curStrPos){ },
				preStringTyped: function(curStrPos){
					_ticker.attr('data-current', curStrPos);
				}
			};

			_ticker.find('.entry-ticker').typed(option_tick);

			_ticker.find('.ticker-arrow-prev').on('click', function(){
				_ticker.attr('data-current', 0);

				var _cur = parseInt(_ticker.attr('data-current'), 10);
				var _cur_str = [];
				_cur = (_cur==0) ? (_strings.length-1) : _cur-1;

				for(var i=_cur; i<_strings.length; i++){
					_cur_str.push(_strings[i]);
				}

				for(var i=0; i<_cur; i++){
					_cur_str.push(_strings[i]);
				}

				option_tick = $.extend(option_tick, {strings: _cur_str});
				_ticker.find('.entry-ticker').text(_cur_str[0]);
				_ticker.find('.entry-ticker').typed(option_tick);
			});

			_ticker.find('.ticker-arrow-next').on('click', function(){
				_ticker.attr('data-current', 0);

				var _cur = parseInt(_ticker.attr('data-current'), 10);
				var _cur_str = [];
				_cur = (_cur==_strings.length-1) ? 0 : _cur+1;

				for(var i=_cur; i<_strings.length; i++){
					_cur_str.push(_strings[i]);
				}

				for(var i=0; i<_cur; i++){
					_cur_str.push(_strings[i]);
				}

				option_tick = $.extend(option_tick, {strings: _cur_str});
				_ticker.find('.entry-ticker').text(_cur_str[0]);
				_ticker.find('.entry-ticker').typed(option_tick);
			});

			/*
			strings: ["First sentence.", "Second sentence."],
            stringsElement: null,
            typeSpeed: 0,
            startDelay: 0,
            backSpeed: 0,
            backDelay: 500,
            loop: false,
            loopCount: false,
            showCursor: true,
            cursorChar: "|",
            attr: null,
            contentType: 'html',
            callback: function() {},
            preStringTyped: function() {},
            onStringTyped: function() {},
            resetCallback: function() {}
			*/

		});



		$('#search_handler').on('click', function(){
			$('#header').toggleClass('show-search');
			setTimeout(function(){
				$('#header .search-panel input').eq(0).focus();
			}, 100);
		});

		$('#header .search-panel a.close-search').on('click', function(){
			$('#header').removeClass('show-search');
		});

		// Sticky header on scroll action
		/*var headerHeight = $('#header.sticky').height();
		$('#header.sticky').next().css('margin-top', headerHeight);

		var lastScroll = $(window).scrollTop;
		$(window).scroll(function(){
	        var scroll = $(window).scrollTop();
	        if (scroll > lastScroll && headerHeight < lastScroll) {
	            $("#header").addClass('unpinned');
	        } else if (scroll < lastScroll && scroll < lastScroll - 20 || scroll < headerHeight) {
	            $("#header").removeClass('unpinned');
	        }
	        lastScroll = scroll;
	    });*/
		$(window).scroll(function() {
			if ($(this).scrollTop() != 0) {
				$("#header").addClass('unpinned');
			} else {
				$("#header").removeClass('unpinned');
			}
		});
		$('.scroll-up, .navbar-brand').click(function() {
			$('body,html').animate({
				scrollTop: 0
			}, 700);
		});

	    // Profile dropdown
	    $('.entry-name').on('click', function(){
	    	$(this).find('.entry-dropdown').toggleClass('open');
	    });

	    // Search form handler
		$('.search-handler.search-fashion').on('click', function(){
			$(this).parent().toggleClass('show-form');
			if( $(this).parent().hasClass('show-form') ){
				$(this).parent().find('form input[type="text"]').eq(0).focus();
			}
		});


		// Simple Tab
		$('.simple-tab-space').each(function(){
			var _tab = $(this);
			_tab.find('.tab-title a').on('click', function(event){
				event.preventDefault();
				_tab.find( ".tab-title a" ).removeClass('active');
				$(this).addClass('active');
				_tab.find( ".tab-panel .tab-content" ).removeClass('active');
				_tab.find( ".tab-panel .tab-content" ).eq( _tab.find(".tab-title a").index($(this)) ).addClass('active');
			});
		});


		// Circle chart
		$('.circle-chart').each(function(ci){
			var _circle = $(this),
				_id = 'circle-chart' + ci,
				_width = _circle.data('circle-width'),
				_percent = _circle.data('percent'),
				_text = _circle.data('text');

			_percent = (_percent + '').replace('%', '');
			_width = parseInt(_width, 10);

			_circle.attr('id', _id);
			var _cc = Circles.create({
				id:         _id,
				value:		_percent,
				text: 		_text,
				radius:     100,
				width:      _width,
				colors:     ['rgba(255,255,255, .05)', '#f84432']
			});

		});



		// Twitter share
		$('.twitter-shareable').on('click', function(){
			var _share = $(this);
			var _addr = window.location.href;
			window.open("http://twitter.com/share?url="+_addr+"&text="+_share.text(),"twitterwindow","height=450, width=550, top="+($(window).height()/2-225)+", left="+($(window).width()/2-275));
		});


		
		// Personal blog carousel
		$('.fs-blog-carousel').each(function(){
			var $fs = $(this),
				_col = $fs.data('col'),
				_row = $fs.data('row'),
				_responsive = $fs.data('responsive'),
				_pager = 0,
				_perView = _col * _row,
				_arr_responsive = [3,2,1];

			var _space = 30;
			if( $fs.hasClass('testimonial-slider') == true ){
				_space = 0;
			}

			if( _responsive!=='undefined' ){
				var _exp = _responsive.split(',');
				if( _exp.length>2 ){
					_arr_responsive[0] = parseInt(_exp[0], 10);
					_arr_responsive[1] = parseInt(_exp[1], 10);
					_arr_responsive[2] = parseInt(_exp[2], 10);
				}
			}

			_pager = ($fs.find('.swiper-slide').length % _perView) > 0 ? parseInt($fs.find('.swiper-slide').length / _perView, 10)+1 : parseInt($fs.find('.swiper-slide').length / _perView, 10);

			$fs.find('.fs-current-total').html(_pager);
			//fs-current-index

			$fs.find('.swiper-container').swiper({
				pagination: '.swiper-pagination',
		        slidesPerView: _col,
		        slidesPerGroup:_col,
		        slidesPerColumn: _row,
		        paginationClickable: true,
		        spaceBetween: _space,
			    prevButton: $fs.find('.swiper-prev'),
			    nextButton: $fs.find('.swiper-next'),
			    onSlideChangeEnd: function(swiper){
			    	var _current = (swiper.activeIndex % _col)>0 ? parseInt(swiper.activeIndex / _col) + 2 : parseInt(swiper.activeIndex / _col) + 1;
			    	$fs.find('.fs-current-index').html(_current);
			    },
			    breakpoints: {
		            768: {
	                	slidesPerView: _arr_responsive[0]
		            },
		            640: {
	                	slidesPerView: _arr_responsive[1]
		            },
		            320: {
		                slidesPerView: _arr_responsive[2]
		            }
		        }
			});
		});



		// Scroll indicator
		$(window).scroll(function(){
			var _document_height = $(document).height(),
				_window_height = $(window).height(),
				_scroll_top = $(window).scrollTop(),
				_w = 0;

			_w = _scroll_top*100/(_document_height-_window_height);

			$('.scroll-window-indicator').find('> div').width(_w+'%');
		});


		// animated blocks
		$('.animated-blocks').each(function(){
			var _block = $(this);

			_block.waypoint({
				handler: function(direction){
					if( !_block.hasClass('ab-animated') ){
						_block.find('.ab-item').each(function(bi){
							var _el = $(this);
			    			_el.css({
			    				'-webkit-animation-delay': (bi*0.2)+"s",
			    				   '-moz-animation-delay': (bi*0.2)+"s",
			    					'-ms-animation-delay': (bi*0.2)+"s",
			    					 '-o-animation-delay': (bi*0.2)+"s",
			    						'animation-delay': (bi*0.2)+"s"
			    			});
			    			_el.addClass('animated fadeInUp ab-visible');

			    			_el.one(animationEnd, function() {
					            $(this).removeClass('animated fadeInUp');
					        });
						});

						_block.addClass('ab-animated');
					}
				},
				continuous: false,
		  		offset: '75%'
			});
		});



		$('a.ms-love').on('click', function(){
			$(this).toggleClass('active');
		});

	});
	
	
	
	if( $('#msplayer').length ){
		var svg_pp = new SVGMorpheus('#ms_play_pause');
		var svg_vol = new SVGMorpheus('#ec_volume');

		$('#msplayer').mediaelementplayer({
			features: ['current','progress','duration','tracks'],
			success: function(media, node, player) {
				var events = ['loadstart', 'play','pause', 'ended'];
				var playlist = {playing:0, list:[]};

				$('#music_player .pl-list').find('.tr-item').each(function(){
					var _row = $(this);
					var _rid = _row.data('id');
					var _audio = _row.find('.pl-audio-item').data('url');
					var _thumb = _row.find('.pl-audio-item').data('thumb');
					var _title = _row.find('.pl-audio-item').find('.pl-item-title').text();
					var _artist = _row.find('.pl-audio-item').find('.pl-item-artist').text();

					playlist.list.push({ id:_rid, audio:_audio, thumb:_thumb, title:_title, artist:_artist});
				});
				

				// load song
				var load_song = function(load_index){
					if( playlist.list.length>0 && playlist.list.length>load_index && load_index>-1 ){
						var _current_media = playlist.list[load_index];
						playlist.playing = load_index;
						media.setSrc(_current_media.audio);
						media.load();

						$('#music_player .ms-nowplaying').find('.np-thumb').attr('src', _current_media.thumb);
						$('#music_player .ms-nowplaying').find('.np-title').text(_current_media.title);
						$('#music_player .ms-nowplaying').find('.np-artist').text(_current_media.artist);
						$('#music_player .pl-list').find('.tr-item .td-num .number.playing').removeClass('playing');
						$('#music_player .pl-list').find('.tr-item').eq(load_index).find('.td-num .number').addClass('playing');
					}
				}

				// play song
				var play_song = function(){
					media.play();
				}

				// play previous previous
				var play_prev = function(){
					if( playlist.playing == 0 && playlist.list.length>0 ){
						playlist.playing = playlist.list.length-1;
					}
					else{
						playlist.playing = playlist.playing - 1;
					}
					load_song(playlist.playing);
					play_song();
				}

				// play next song
				var play_next = function(){
					if( playlist.list.length>0 && playlist.playing == playlist.list.length-1 ){
						playlist.playing = 0;
					}
					else{
						playlist.playing = playlist.playing + 1;
					}

					if( $('#music_player .ms-control-shuffle').hasClass('active') ){
						playlist.playing = Math.floor(Math.random() * playlist.list.length-1);
					}

					load_song(playlist.playing);
					play_song();
				}

				// set first audio file
				if( playlist.list.length ){
					load_song(0);
				}

				// player events
				for (var i=0, il=events.length; i<il; i++) {
					var eventName = events[i];
					media.addEventListener(events[i], function(e) {
						if( e.type=='play' ){
							$('#music_player .ms-play').addClass('ms-pause');
							svg_pp.to('ms_pause', {duration:400, rotation:'none'});
						}
						else if( e.type=='pause' ){
							$('#music_player .ms-play').removeClass('ms-pause');
							svg_pp.to('ms_play', {duration:400, rotation:'none'});
						}
						else if( e.type=='loadstart' ){

						}
						else if( e.type=='ended' ){
							var _current_number = playlist.playing;

							if( playlist.playing==playlist.list.length-1 ){
								if( $('#music_player .ms-control-repeat').hasClass('active') ){
									_current_number = 0;
								}
								else{
									_current_number = -1;
								}
							}
							else{
								if( $('#music_player .ms-control-shuffle').hasClass('active') ){
									_current_number = Math.floor(Math.random() * playlist.list.length-1);
								}
								else{
									_current_number += 1;
								}
								
							}

							console.log('ended', _current_number);

							if( _current_number>-1 ){
								load_song(_current_number);
								play_song();
							}
						}
					});
				}

				// play action
				$('#music_player .ms-play').on('click', function(){
					if (media.paused){
						media.play();
					}
					else{
						media.pause();
					}
				});

				// previous action
				$('#music_player .ms-prev').on('click', function(){
					play_prev();
				});

				// next action
				$('#music_player .ms-next').on('click', function(){
					play_next();
				});

				// Volume
				$('#music_player .ec-vol-el').slider({
					orientation: "vertical",
					range: "min",
					min: 0,
					max: 100,
					value: 80,
					slide: function( event, ui ) {
						media.setVolume(ui.value/100);
					}
				});

				$('#music_player .ms-controls .ec-volume a').on('click', function(){
					$(this).toggleClass('ec-vol-mute');
					if( $(this).hasClass('ec-vol-mute') ){
						media.setVolume(0);
						svg_vol.to('vol_mute', {duration:400, rotation:'none'});
						$('#music_player .ec-vol-el').slider('value', 0);
					}
					else{
						media.setVolume(0.8);
						svg_vol.to('vol_max', {duration:400, rotation:'none'});
						$('#music_player .ec-vol-el').slider('value', 80);
					}
				});

				// shuffle
				$('#music_player .ms-control-shuffle').on('click', function(){
					$('.ms-control-shuffle').toggleClass('active');
				});

				// repeat
				$('#music_player .ms-control-repeat').on('click', function(){
					$(this).toggleClass('active');
				});

				// playlist
				$('#music_player .pl-list .tr-item .pl-audio-item').on('click', function(){
					var _index = $('#music_player .pl-list .tr-item').index( $(this).parents('.tr-item') );
					load_song(_index);
					play_song();
				});

			}
		});
	}


	$(window).load(function(){

		// page loaded
		$('body').addClass('page-loaded');

		// parallax columns
		$('.parallax-columns-container').parallaxColumn();

		//sticky
		$('.sticky-parent').each(function(){
			var _sticky = $(this),
				_this = this;
			_sticky.find('.sticky-column').theiaStickySidebar({
				containerSelector: _this,
	      		additionalMarginTop: 30,
	      		minWidth: 768
		    });
		});
		

		// masonry layout
		$('.masonry-layout').each(function(){
			var _masonry = $(this);
			var _col_width = _masonry.data('col-width') + '';
			if( _col_width.indexOf('col-')<0 ){
				_col_width = '.col-sm-2';
			}

			_masonry.isotope({
				itemSelector: '.masonry-item',
				masonry: {
                    columnWidth: _col_width
                }
			});

            _masonry.find('.fs-post-filter a').on('click', function(){
                var filter = $(this).data('filter');
                _masonry.isotope({ filter: filter });

                _masonry.find('.fs-post-filter li').removeClass('active');
                $(this).parent().addClass('active');
            });

		});


		$('.masonry-layout1.masonry-no-col').each(function(){
			var _masonry = $(this);

			_masonry.isotope({
				itemSelector: '.masonry-item',
				masonry: {
                    columnWidth: 1
                }
			});
		});


        // Fullwidth section
        var fullscreen_func = function(){
            $('.fullwidth-section, .fullscreen-section').each(function(){
                var $this = $(this);
                var $wrapper = $('body');

                $this.css('margin-left', '0px');

                var margin_left = $this.offset().left-$wrapper.offset().left;
                var _width = $wrapper.width();

                $this.css({
                    'margin-left': -margin_left,
                    'width': _width+'px'
                });

                if( $this.hasClass('fullscreen-section') && !$this.hasClass('tt-slider') )
                    $this.height( $(window).height() );
            });
        };
        fullscreen_func();
        $(window).resize(function(){ fullscreen_func(); });



		// Parallax
	    $('[data-section-type="parallax"]').each(function(){
	        var _this = $(this);
	        var _bg = _this.css('background-image') + '';
	        _bg = _bg.replace('url("', '').replace('")', '');
	        
	        _this.attr('data-stellar-ratio', '2');
	        _this.attr('data-stellar-background-ratio', '0.5');
	        _this.css('background-attachment', 'fixed');
			_this.css('background-size', 'cover');
	    });

	    if( !isTouchDevice() && $('[data-section-type="parallax"]').length ){
	        $(window).stellar({
	            horizontalScrolling: false,
	            verticalScrolling: true,
	            responsive: true,
	            verticalOffset: 0,
	            parallaxBackgrounds: true,
	            parallaxElements: false
	        });
	    }


	    /* Welcome page portfolio */
	    $('.welcome-folio').each(function(){
	    	var _folio = $(this);

	    	_folio.find('.wpf-viewport').isotope({
				itemSelector: '.masonry-item',
				masonry: {
                    columnWidth: '.col-lg-3'
                }
			});

            _folio.find('.wpf-filter a').on('click', function(){
                var filter = $(this).data('filter');
                _folio.find('.wpf-viewport').isotope({ filter: filter });

                _folio.find('.wpf-filter a.active').removeClass('active');
                $(this).addClass('active');
            });
	    });


	});


})(jQuery);
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/
jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})
/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
/*! 
 * Master Slider Ã¢â‚¬â€œ Responsive Touch Swipe Slider
 * Copyright Ã‚Â© 2015 All Rights Reserved. 
 *
 * @author Averta [www.averta.net]
 * @version 2.16.3
 * @date Dec 2015
 */
window.averta = {},
	function ($) {
		function getVendorPrefix() {
			if ("result" in arguments.callee) return arguments.callee.result;
			var regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/,
				someScript = document.getElementsByTagName("script")[0];
			for (var prop in someScript.style)
				if (regex.test(prop)) return arguments.callee.result = prop.match(regex)[0];
			return arguments.callee.result = "WebkitOpacity" in someScript.style ? "Webkit" : "KhtmlOpacity" in someScript.style ? "Khtml" : ""
		}

		function checkStyleValue(prop) {
			var b = document.body || document.documentElement,
				s = b.style,
				p = prop;
			if ("string" == typeof s[p]) return !0;
			v = ["Moz", "Webkit", "Khtml", "O", "ms"], p = p.charAt(0).toUpperCase() + p.substr(1);
			for (var i = 0; i < v.length; i++)
				if ("string" == typeof s[v[i] + p]) return !0;
			return !1
		}

		function supportsTransitions() {
			return checkStyleValue("transition")
		}

		function supportsTransforms() {
			return checkStyleValue("transform")
		}

		function supports3DTransforms() {
			if (!supportsTransforms()) return !1;
			var has3d, el = document.createElement("i"),
				transforms = {
					WebkitTransform: "-webkit-transform",
					OTransform: "-o-transform",
					MSTransform: "-ms-transform",
					msTransform: "-ms-transform",
					MozTransform: "-moz-transform",
					Transform: "transform",
					transform: "transform"
				};
			el.style.display = "block", document.body.insertBefore(el, null);
			for (var t in transforms) void 0 !== el.style[t] && (el.style[t] = "translate3d(1px,1px,1px)", has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]));
			return document.body.removeChild(el), null != has3d && has3d.length > 0 && "none" !== has3d
		}
		window["package"] = function (name) {
			window[name] || (window[name] = {})
		};
		var extend = function (target, object) {
			for (var key in object) target[key] = object[key]
		};
		Function.prototype.extend = function (superclass) {
			"function" == typeof superclass.prototype.constructor ? (extend(this.prototype, superclass.prototype), this.prototype.constructor = this) : (this.prototype.extend(superclass), this.prototype.constructor = this)
		};
		var trans = {
			Moz: "-moz-",
			Webkit: "-webkit-",
			Khtml: "-khtml-",
			O: "-o-",
			ms: "-ms-",
			Icab: "-icab-"
		};
		window._mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), window._touch = "ontouchstart" in document, $(document).ready(function () {
			window._jcsspfx = getVendorPrefix(), window._csspfx = trans[window._jcsspfx], window._cssanim = supportsTransitions(), window._css3d = supports3DTransforms(), window._css2d = supportsTransforms()
		}), window.parseQueryString = function (url) {
			var queryString = {};
			return url.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function ($0, $1, $2, $3) {
				queryString[$1] = $3
			}), queryString
		};
		var fps60 = 50 / 3;
		if (window.requestAnimationFrame || (window.requestAnimationFrame = function () {
				return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
					window.setTimeout(callback, fps60)
				}
			}()), window.getComputedStyle || (window.getComputedStyle = function (el) {
				return this.el = el, this.getPropertyValue = function (prop) {
					var re = /(\-([a-z]){1})/g;
					return "float" == prop && (prop = "styleFloat"), re.test(prop) && (prop = prop.replace(re, function () {
						return arguments[2].toUpperCase()
					})), el.currentStyle[prop] ? el.currentStyle[prop] : null
				}, el.currentStyle
			}), Array.prototype.indexOf || (Array.prototype.indexOf = function (elt) {
				var len = this.length >>> 0,
					from = Number(arguments[1]) || 0;
				for (from = 0 > from ? Math.ceil(from) : Math.floor(from), 0 > from && (from += len); len > from; from++)
					if (from in this && this[from] === elt) return from;
				return -1
			}), window.isMSIE = function (version) {
				if (!$.browser.msie) return !1;
				if (!version) return !0;
				var ieVer = $.browser.version.slice(0, $.browser.version.indexOf("."));
				return "string" == typeof version ? eval(-1 !== version.indexOf("<") || -1 !== version.indexOf(">") ? ieVer + version : version + "==" + ieVer) : version == ieVer
			}, $.removeDataAttrs = function ($target, exclude) {
				var i, attrName, dataAttrsToDelete = [],
					dataAttrs = $target[0].attributes,
					dataAttrsLen = dataAttrs.length;
				for (exclude = exclude || [], i = 0; dataAttrsLen > i; i++) attrName = dataAttrs[i].name, "data-" === attrName.substring(0, 5) && -1 === exclude.indexOf(attrName) && dataAttrsToDelete.push(dataAttrs[i].name);
				$.each(dataAttrsToDelete, function (index, attrName) {
					$target.removeAttr(attrName)
				})
			}, jQuery) {
			$.jqLoadFix = function () {
				if (this.complete) {
					var that = this;
					setTimeout(function () {
						$(that).load()
					}, 1)
				}
			}, jQuery.uaMatch = jQuery.uaMatch || function (ua) {
				ua = ua.toLowerCase();
				var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
				return {
					browser: match[1] || "",
					version: match[2] || "0"
				}
			}, matched = jQuery.uaMatch(navigator.userAgent), browser = {}, matched.browser && (browser[matched.browser] = !0, browser.version = matched.version), browser.chrome ? browser.webkit = !0 : browser.webkit && (browser.safari = !0);
			var isIE11 = !!navigator.userAgent.match(/Trident\/7\./);
			isIE11 && (browser.msie = "true", delete browser.mozilla), jQuery.browser = browser, $.fn.preloadImg = function (src, _event) {
				return this.each(function () {
					var $this = $(this),
						self = this,
						img = new Image;
					img.onload = function (event) {
						null == event && (event = {}), $this.attr("src", src), event.width = img.width, event.height = img.height, $this.data("width", img.width), $this.data("height", img.height), setTimeout(function () {
							_event.call(self, event)
						}, 50), img = null
					}, img.src = src
				}), this
			}
		}
	}(jQuery),
	function () {
		"use strict";
		averta.EventDispatcher = function () {
			this.listeners = {}
		}, averta.EventDispatcher.extend = function (_proto) {
			var instance = new averta.EventDispatcher;
			for (var key in instance) "constructor" != key && (_proto[key] = averta.EventDispatcher.prototype[key])
		}, averta.EventDispatcher.prototype = {
			constructor: averta.EventDispatcher,
			addEventListener: function (event, listener, ref) {
				this.listeners[event] || (this.listeners[event] = []), this.listeners[event].push({
					listener: listener,
					ref: ref
				})
			},
			removeEventListener: function (event, listener, ref) {
				if (this.listeners[event]) {
					for (var i = 0; i < this.listeners[event].length; ++i) listener === this.listeners[event][i].listener && ref === this.listeners[event][i].ref && this.listeners[event].splice(i--, 1);
					0 === this.listeners[event].length && (this.listeners[event] = null)
				}
			},
			dispatchEvent: function (event) {
				if (event.target = this, this.listeners[event.type])
					for (var i = 0, l = this.listeners[event.type].length; l > i; ++i) this.listeners[event.type][i].listener.call(this.listeners[event.type][i].ref, event)
			}
		}
	}(),
	function ($) {
		"use strict";
		var isTouch = "ontouchstart" in document,
			isPointer = window.navigator.pointerEnabled,
			isMSPoiner = !isPointer && window.navigator.msPointerEnabled,
			usePointer = isPointer || isMSPoiner,
			ev_start = (isPointer ? "pointerdown " : "") + (isMSPoiner ? "MSPointerDown " : "") + (isTouch ? "touchstart " : "") + "mousedown",
			ev_move = (isPointer ? "pointermove " : "") + (isMSPoiner ? "MSPointerMove " : "") + (isTouch ? "touchmove " : "") + "mousemove",
			ev_end = (isPointer ? "pointerup " : "") + (isMSPoiner ? "MSPointerUp " : "") + (isTouch ? "touchend " : "") + "mouseup",
			ev_cancel = (isPointer ? "pointercancel " : "") + (isMSPoiner ? "MSPointerCancel " : "") + "touchcancel";
		averta.TouchSwipe = function ($element) {
			this.$element = $element, this.enabled = !0, $element.bind(ev_start, {
				target: this
			}, this.__touchStart), $element[0].swipe = this, this.onSwipe = null, this.swipeType = "horizontal", this.noSwipeSelector = "input, textarea, button, .no-swipe, .ms-no-swipe", this.lastStatus = {}
		};
		var p = averta.TouchSwipe.prototype;
		p.getDirection = function (new_x, new_y) {
			switch (this.swipeType) {
				case "horizontal":
					return new_x <= this.start_x ? "left" : "right";
				case "vertical":
					return new_y <= this.start_y ? "up" : "down";
				case "all":
					return Math.abs(new_x - this.start_x) > Math.abs(new_y - this.start_y) ? new_x <= this.start_x ? "left" : "right" : new_y <= this.start_y ? "up" : "down"
			}
		}, p.priventDefultEvent = function (new_x, new_y) {
			var dx = Math.abs(new_x - this.start_x),
				dy = Math.abs(new_y - this.start_y),
				horiz = dx > dy;
			return "horizontal" === this.swipeType && horiz || "vertical" === this.swipeType && !horiz
		}, p.createStatusObject = function (evt) {
			var temp_x, temp_y, status_data = {};
			return temp_x = this.lastStatus.distanceX || 0, temp_y = this.lastStatus.distanceY || 0, status_data.distanceX = evt.pageX - this.start_x, status_data.distanceY = evt.pageY - this.start_y, status_data.moveX = status_data.distanceX - temp_x, status_data.moveY = status_data.distanceY - temp_y, status_data.distance = parseInt(Math.sqrt(Math.pow(status_data.distanceX, 2) + Math.pow(status_data.distanceY, 2))), status_data.duration = (new Date).getTime() - this.start_time, status_data.direction = this.getDirection(evt.pageX, evt.pageY), status_data
		}, p.__reset = function (event, jqevt) {
			this.reset = !1, this.lastStatus = {}, this.start_time = (new Date).getTime();
			var point = this.__getPoint(event, jqevt);
			this.start_x = point.pageX, this.start_y = point.pageY
		}, p.__touchStart = function (event) {
			var swipe = event.data.target,
				jqevt = event;
			if (swipe.enabled && !($(event.target).closest(swipe.noSwipeSelector, swipe.$element).length > 0)) {
				if (event = event.originalEvent, usePointer && $(this).css("-ms-touch-action", "horizontal" === swipe.swipeType ? "pan-y" : "pan-x"), !swipe.onSwipe) return void $.error("Swipe listener is undefined");
				if (!(swipe.touchStarted || isTouch && swipe.start_time && "mousedown" === event.type && (new Date).getTime() - swipe.start_time < 600)) {
					var point = swipe.__getPoint(event, jqevt);
					swipe.start_x = point.pageX, swipe.start_y = point.pageY, swipe.start_time = (new Date).getTime(), $(document).bind(ev_end, {
						target: swipe
					}, swipe.__touchEnd).bind(ev_move, {
						target: swipe
					}, swipe.__touchMove).bind(ev_cancel, {
						target: swipe
					}, swipe.__touchCancel);
					var status = swipe.createStatusObject(point);
					status.phase = "start", swipe.onSwipe.call(null, status), isTouch || jqevt.preventDefault(), swipe.lastStatus = status, swipe.touchStarted = !0
				}
			}
		}, p.__touchMove = function (event) {
			var swipe = event.data.target,
				jqevt = event;
			if (event = event.originalEvent, swipe.touchStarted) {
				clearTimeout(swipe.timo), swipe.timo = setTimeout(function () {
					swipe.__reset(event, jqevt)
				}, 60);
				var point = swipe.__getPoint(event, jqevt),
					status = swipe.createStatusObject(point);
				swipe.priventDefultEvent(point.pageX, point.pageY) && jqevt.preventDefault(), status.phase = "move", swipe.lastStatus = status, swipe.onSwipe.call(null, status)
			}
		}, p.__touchEnd = function (event) {
			var swipe = event.data.target,
				jqevt = event;
			event = event.originalEvent, clearTimeout(swipe.timo);
			var status = swipe.lastStatus;
			isTouch || jqevt.preventDefault(), status.phase = "end", swipe.touchStarted = !1, swipe.priventEvt = null, $(document).unbind(ev_end, swipe.__touchEnd).unbind(ev_move, swipe.__touchMove).unbind(ev_cancel, swipe.__touchCancel), status.speed = status.distance / status.duration, swipe.onSwipe.call(null, status)
		}, p.__touchCancel = function (event) {
			var swipe = event.data.target;
			swipe.__touchEnd(event)
		}, p.__getPoint = function (event, jqEvent) {
			return isTouch && -1 === event.type.indexOf("mouse") ? event.touches[0] : usePointer ? event : jqEvent
		}, p.enable = function () {
			this.enabled || (this.enabled = !0)
		}, p.disable = function () {
			this.enabled && (this.enabled = !1)
		}
	}(jQuery),
	function () {
		"use strict";
		averta.Ticker = function () {};
		var st = averta.Ticker,
			list = [],
			len = 0,
			__stopped = !0;
		st.add = function (listener, ref) {
			return list.push([listener, ref]), 1 === list.length && st.start(), len = list.length
		}, st.remove = function (listener, ref) {
			for (var i = 0, l = list.length; l > i; ++i) list[i] && list[i][0] === listener && list[i][1] === ref && list.splice(i, 1);
			len = list.length, 0 === len && st.stop()
		}, st.start = function () {
			__stopped && (__stopped = !1, __tick())
		}, st.stop = function () {
			__stopped = !0
		};
		var __tick = function () {
			if (!st.__stopped) {
				for (var item, i = 0; i !== len; i++) item = list[i], item[0].call(item[1]);
				requestAnimationFrame(__tick)
			}
		}
	}(),
	function () {
		"use strict";
		Date.now || (Date.now = function () {
			return (new Date).getTime()
		}), averta.Timer = function (delay, autoStart) {
			this.delay = delay, this.currentCount = 0, this.paused = !1, this.onTimer = null, this.refrence = null, autoStart && this.start()
		}, averta.Timer.prototype = {
			constructor: averta.Timer,
			start: function () {
				this.paused = !1, this.lastTime = Date.now(), averta.Ticker.add(this.update, this)
			},
			stop: function () {
				this.paused = !0, averta.Ticker.remove(this.update, this)
			},
			reset: function () {
				this.currentCount = 0, this.paused = !0, this.lastTime = Date.now()
			},
			update: function () {
				this.paused || Date.now() - this.lastTime < this.delay || (this.currentCount++, this.lastTime = Date.now(), this.onTimer && this.onTimer.call(this.refrence, this.getTime()))
			},
			getTime: function () {
				return this.delay * this.currentCount
			}
		}
	}(),
	function () {
		"use strict";
		window.CSSTween = function (element, duration, delay, ease) {
			this.$element = element, this.duration = duration || 1e3, this.delay = delay || 0, this.ease = ease || "linear"
		};
		var p = CSSTween.prototype;
		p.to = function (callback, target) {
			return this.to_cb = callback, this.to_cb_target = target, this
		}, p.from = function (callback, target) {
			return this.fr_cb = callback, this.fr_cb_target = target, this
		}, p.onComplete = function (callback, target) {
			return this.oc_fb = callback, this.oc_fb_target = target, this
		}, p.chain = function (csstween) {
			return this.chained_tween = csstween, this
		}, p.reset = function () {
			clearTimeout(this.start_to), clearTimeout(this.end_to)
		}, p.start = function () {
			var element = this.$element[0];
			clearTimeout(this.start_to), clearTimeout(this.end_to), this.fresh = !0, this.fr_cb && (element.style[window._jcsspfx + "TransitionDuration"] = "0ms", this.fr_cb.call(this.fr_cb_target));
			var that = this;
			return this.onTransComplete = function () {
				that.fresh && (that.reset(), element.style[window._jcsspfx + "TransitionDuration"] = "", element.style[window._jcsspfx + "TransitionProperty"] = "", element.style[window._jcsspfx + "TransitionTimingFunction"] = "", element.style[window._jcsspfx + "TransitionDelay"] = "", that.fresh = !1, that.chained_tween && that.chained_tween.start(), that.oc_fb && that.oc_fb.call(that.oc_fb_target))
			}, this.start_to = setTimeout(function () {
				that.$element && (element.style[window._jcsspfx + "TransitionDuration"] = that.duration + "ms", element.style[window._jcsspfx + "TransitionProperty"] = that.transProperty || "all", element.style[window._jcsspfx + "TransitionDelay"] = that.delay > 0 ? that.delay + "ms" : "", element.style[window._jcsspfx + "TransitionTimingFunction"] = that.ease, that.to_cb && that.to_cb.call(that.to_cb_target), that.end_to = setTimeout(function () {
					that.onTransComplete()
				}, that.duration + (that.delay || 0)))
			}, 100), this
		}
	}(),
	function () {
		"use strict";

		function transPos(element, properties) {
			if (void 0 !== properties.x || void 0 !== properties.y)
				if (_cssanim) {
					var trans = window._jcsspfx + "Transform";
					void 0 !== properties.x && (properties[trans] = (properties[trans] || "") + " translateX(" + properties.x + "px)", delete properties.x), void 0 !== properties.y && (properties[trans] = (properties[trans] || "") + " translateY(" + properties.y + "px)", delete properties.y)
				} else {
					if (void 0 !== properties.x) {
						var posx = "auto" !== element.css("right") ? "right" : "left";
						properties[posx] = properties.x + "px", delete properties.x
					}
					if (void 0 !== properties.y) {
						var posy = "auto" !== element.css("bottom") ? "bottom" : "top";
						properties[posy] = properties.y + "px", delete properties.y
					}
				}
			return properties
		}
		var _cssanim = null;
		window.CTween = {}, CTween.setPos = function (element, pos) {
			element.css(transPos(element, pos))
		}, CTween.animate = function (element, duration, properties, options) {
			if (null == _cssanim && (_cssanim = window._cssanim), options = options || {}, transPos(element, properties), _cssanim) {
				var tween = new CSSTween(element, duration, options.delay, EaseDic[options.ease]);
				return options.transProperty && (tween.transProperty = options.transProperty), tween.to(function () {
					element.css(properties)
				}), options.complete && tween.onComplete(options.complete, options.target), tween.start(), tween.stop = tween.reset, tween
			}
			var onCl;
			return options.delay && element.delay(options.delay), options.complete && (onCl = function () {
				options.complete.call(options.target)
			}), element.stop(!0).animate(properties, duration, options.ease || "linear", onCl), element
		}, CTween.fadeOut = function (target, duration, remove) {
			var options = {};
			remove === !0 ? options.complete = function () {
				target.remove()
			} : 2 === remove && (options.complete = function () {
				target.css("display", "none")
			}), CTween.animate(target, duration || 1e3, {
				opacity: 0
			}, options)
		}, CTween.fadeIn = function (target, duration, reset) {
			reset !== !1 && target.css("opacity", 0).css("display", ""), CTween.animate(target, duration || 1e3, {
				opacity: 1
			})
		}
	}(),
	function () {
		window.EaseDic = {
			linear: "linear",
			ease: "ease",
			easeIn: "ease-in",
			easeOut: "ease-out",
			easeInOut: "ease-in-out",
			easeInCubic: "cubic-bezier(.55,.055,.675,.19)",
			easeOutCubic: "cubic-bezier(.215,.61,.355,1)",
			easeInOutCubic: "cubic-bezier(.645,.045,.355,1)",
			easeInCirc: "cubic-bezier(.6,.04,.98,.335)",
			easeOutCirc: "cubic-bezier(.075,.82,.165,1)",
			easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)",
			easeInExpo: "cubic-bezier(.95,.05,.795,.035)",
			easeOutExpo: "cubic-bezier(.19,1,.22,1)",
			easeInOutExpo: "cubic-bezier(1,0,0,1)",
			easeInQuad: "cubic-bezier(.55,.085,.68,.53)",
			easeOutQuad: "cubic-bezier(.25,.46,.45,.94)",
			easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)",
			easeInQuart: "cubic-bezier(.895,.03,.685,.22)",
			easeOutQuart: "cubic-bezier(.165,.84,.44,1)",
			easeInOutQuart: "cubic-bezier(.77,0,.175,1)",
			easeInQuint: "cubic-bezier(.755,.05,.855,.06)",
			easeOutQuint: "cubic-bezier(.23,1,.32,1)",
			easeInOutQuint: "cubic-bezier(.86,0,.07,1)",
			easeInSine: "cubic-bezier(.47,0,.745,.715)",
			easeOutSine: "cubic-bezier(.39,.575,.565,1)",
			easeInOutSine: "cubic-bezier(.445,.05,.55,.95)",
			easeInBack: "cubic-bezier(.6,-.28,.735,.045)",
			easeOutBack: "cubic-bezier(.175, .885,.32,1.275)",
			easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"
		}
	}(),
	function () {
		"use strict";
		window.MSAligner = function (type, $container, $img) {
			this.$container = $container, this.$img = $img, this.type = type || "stretch", this.widthOnly = !1, this.heightOnly = !1
		};
		var p = MSAligner.prototype;
		p.init = function (w, h) {
			switch (this.baseWidth = w, this.baseHeight = h, this.imgRatio = w / h, this.imgRatio2 = h / w, this.type) {
				case "tile":
					this.$container.css("background-image", "url(" + this.$img.attr("src") + ")"), this.$img.remove();
					break;
				case "center":
					this.$container.css("background-image", "url(" + this.$img.attr("src") + ")"), this.$container.css({
						backgroundPosition: "center center",
						backgroundRepeat: "no-repeat"
					}), this.$img.remove();
					break;
				case "stretch":
					this.$img.css({
						width: "100%",
						height: "100%"
					});
					break;
				case "fill":
				case "fit":
					this.needAlign = !0, this.align()
			}
		}, p.align = function () {
			if (this.needAlign) {
				var cont_w = this.$container.width(),
					cont_h = this.$container.height(),
					contRatio = cont_w / cont_h;
				"fill" == this.type ? this.imgRatio < contRatio ? (this.$img.width(cont_w), this.$img.height(cont_w * this.imgRatio2)) : (this.$img.height(cont_h), this.$img.width(cont_h * this.imgRatio)) : "fit" == this.type && (this.imgRatio < contRatio ? (this.$img.height(cont_h), this.$img.width(cont_h * this.imgRatio)) : (this.$img.width(cont_w), this.$img.height(cont_w * this.imgRatio2))), this.setMargin()
			}
		}, p.setMargin = function () {
			var cont_w = this.$container.width(),
				cont_h = this.$container.height();
			this.$img.css("margin-top", (cont_h - this.$img[0].offsetHeight) / 2 + "px"), this.$img.css("margin-left", (cont_w - this.$img[0].offsetWidth) / 2 + "px")
		}
	}(),
	function () {
		"use strict";
		var _options = {
				bouncing: !0,
				snapping: !1,
				snapsize: null,
				friction: .05,
				outFriction: .05,
				outAcceleration: .09,
				minValidDist: .3,
				snappingMinSpeed: 2,
				paging: !1,
				endless: !1,
				maxSpeed: 160
			},
			Controller = function (min, max, options) {
				if (null === max || null === min) throw new Error("Max and Min values are required.");
				this.options = options || {};
				for (var key in _options) key in this.options || (this.options[key] = _options[key]);
				this._max_value = max, this._min_value = min, this.value = min, this.end_loc = min, this.current_snap = this.getSnapNum(min), this.__extrStep = 0, this.__extraMove = 0, this.__animID = -1
			},
			p = Controller.prototype;
		p.changeTo = function (value, animate, speed, snap_num, dispatch) {
			if (this.stopped = !1, this._internalStop(), value = this._checkLimits(value), speed = Math.abs(speed || 0), this.options.snapping && (snap_num = snap_num || this.getSnapNum(value), dispatch !== !1 && this._callsnapChange(snap_num), this.current_snap = snap_num), animate) {
				this.animating = !0;
				var self = this,
					active_id = ++self.__animID,
					amplitude = value - self.value,
					timeStep = 0,
					targetPosition = value,
					animFrict = 1 - self.options.friction,
					timeconst = animFrict + (speed - 20) * animFrict * 1.3 / self.options.maxSpeed,
					tick = function () {
						if (active_id === self.__animID) {
							var dis = value - self.value;
							if (!(Math.abs(dis) > self.options.minValidDist && self.animating)) return self.animating && (self.value = value, self._callrenderer()), self.animating = !1, active_id !== self.__animID && (self.__animID = -1), void self._callonComplete("anim");
							window.requestAnimationFrame(tick), self.value = targetPosition - amplitude * Math.exp(- ++timeStep * timeconst), self._callrenderer()
						}
					};
				return void tick()
			}
			this.value = value, this._callrenderer()
		}, p.drag = function (move) {
			this.start_drag && (this.drag_start_loc = this.value, this.start_drag = !1), this.animating = !1, this._deceleration = !1, this.value -= move, !this.options.endless && (this.value > this._max_value || this.value < 0) ? this.options.bouncing ? (this.__isout = !0, this.value += .6 * move) : this.value = this.value > this._max_value ? this._max_value : 0 : !this.options.endless && this.options.bouncing && (this.__isout = !1), this._callrenderer()
		}, p.push = function (speed) {
			if (this.stopped = !1, this.options.snapping && Math.abs(speed) <= this.options.snappingMinSpeed) return void this.cancel();
			if (this.__speed = speed, this.__startSpeed = speed, this.end_loc = this._calculateEnd(), this.options.snapping) {
				var snap_loc = this.getSnapNum(this.value),
					end_snap = this.getSnapNum(this.end_loc);
				if (this.options.paging) return snap_loc = this.getSnapNum(this.drag_start_loc), this.__isout = !1, void(speed > 0 ? this.gotoSnap(snap_loc + 1, !0, speed) : this.gotoSnap(snap_loc - 1, !0, speed));
				if (snap_loc === end_snap) return void this.cancel();
				this._callsnapChange(end_snap), this.current_snap = end_snap
			}
			this.animating = !1, this.__needsSnap = this.options.endless || this.end_loc > this._min_value && this.end_loc < this._max_value, this.options.snapping && this.__needsSnap && (this.__extraMove = this._calculateExtraMove(this.end_loc)), this._startDecelaration()
		}, p.bounce = function (speed) {
			this.animating || (this.stopped = !1, this.animating = !1, this.__speed = speed, this.__startSpeed = speed, this.end_loc = this._calculateEnd(), this._startDecelaration())
		}, p.stop = function () {
			this.stopped = !0, this._internalStop()
		}, p.cancel = function () {
			this.start_drag = !0, this.__isout ? (this.__speed = 4e-4, this._startDecelaration()) : this.options.snapping && this.gotoSnap(this.getSnapNum(this.value), !0)
		}, p.renderCallback = function (listener, ref) {
			this.__renderHook = {
				fun: listener,
				ref: ref
			}
		}, p.snappingCallback = function (listener, ref) {
			this.__snapHook = {
				fun: listener,
				ref: ref
			}
		}, p.snapCompleteCallback = function (listener, ref) {
			this.__compHook = {
				fun: listener,
				ref: ref
			}
		}, p.getSnapNum = function (value) {
			return Math.floor((value + this.options.snapsize / 2) / this.options.snapsize)
		}, p.nextSnap = function () {
			this._internalStop();
			var curr_snap = this.getSnapNum(this.value);
			!this.options.endless && (curr_snap + 1) * this.options.snapsize > this._max_value ? (this.__speed = 8, this.__needsSnap = !1, this._startDecelaration()) : this.gotoSnap(curr_snap + 1, !0)
		}, p.prevSnap = function () {
			this._internalStop();
			var curr_snap = this.getSnapNum(this.value);
			!this.options.endless && (curr_snap - 1) * this.options.snapsize < this._min_value ? (this.__speed = -8, this.__needsSnap = !1, this._startDecelaration()) : this.gotoSnap(curr_snap - 1, !0)
		}, p.gotoSnap = function (snap_num, animate, speed) {
			this.changeTo(snap_num * this.options.snapsize, animate, speed, snap_num)
		}, p.destroy = function () {
			this._internalStop(), this.__renderHook = null, this.__snapHook = null, this.__compHook = null
		}, p._internalStop = function () {
			this.start_drag = !0, this.animating = !1, this._deceleration = !1, this.__extrStep = 0
		}, p._calculateExtraMove = function (value) {
			var m = value % this.options.snapsize;
			return m < this.options.snapsize / 2 ? -m : this.options.snapsize - m
		}, p._calculateEnd = function (step) {
			for (var temp_speed = this.__speed, temp_value = this.value, i = 0; Math.abs(temp_speed) > this.options.minValidDist;) temp_value += temp_speed, temp_speed *= this.options.friction, i++;
			return step ? i : temp_value
		}, p._checkLimits = function (value) {
			return this.options.endless ? value : value < this._min_value ? this._min_value : value > this._max_value ? this._max_value : value
		}, p._callrenderer = function () {
			this.__renderHook && this.__renderHook.fun.call(this.__renderHook.ref, this, this.value)
		}, p._callsnapChange = function (targetSnap) {
			this.__snapHook && targetSnap !== this.current_snap && this.__snapHook.fun.call(this.__snapHook.ref, this, targetSnap, targetSnap - this.current_snap)
		}, p._callonComplete = function (type) {
			this.__compHook && !this.stopped && this.__compHook.fun.call(this.__compHook.ref, this, this.current_snap, type)
		}, p._computeDeceleration = function () {
			if (this.options.snapping && this.__needsSnap) {
				var xtr_move = (this.__startSpeed - this.__speed) / this.__startSpeed * this.__extraMove;
				this.value += this.__speed + xtr_move - this.__extrStep, this.__extrStep = xtr_move
			} else this.value += this.__speed;
			if (this.__speed *= this.options.friction, this.options.endless || this.options.bouncing || (this.value <= this._min_value ? (this.value = this._min_value, this.__speed = 0) : this.value >= this._max_value && (this.value = this._max_value, this.__speed = 0)), this._callrenderer(), !this.options.endless && this.options.bouncing) {
				var out_value = 0;
				this.value < this._min_value ? out_value = this._min_value - this.value : this.value > this._max_value && (out_value = this._max_value - this.value), this.__isout = Math.abs(out_value) >= this.options.minValidDist, this.__isout && (this.__speed * out_value <= 0 ? this.__speed += out_value * this.options.outFriction : this.__speed = out_value * this.options.outAcceleration)
			}
		}, p._startDecelaration = function () {
			if (!this._deceleration) {
				this._deceleration = !0;
				var self = this,
					tick = function () {
						self._deceleration && (self._computeDeceleration(), Math.abs(self.__speed) > self.options.minValidDist || self.__isout ? window.requestAnimationFrame(tick) : (self._deceleration = !1, self.__isout = !1, self.value = self.__needsSnap && self.options.snapping && !self.options.paging ? self._checkLimits(self.end_loc + self.__extraMove) : Math.round(self.value), self._callrenderer(), self._callonComplete("decel")))
					};
				tick()
			}
		}, window.Controller = Controller
	}(),
	function (window, document, $) {
		window.MSLayerController = function (slide) {
			this.slide = slide, this.slider = slide.slider, this.layers = [], this.layersCount = 0, this.preloadCount = 0, this.$layers = $("<div></div>").addClass("ms-slide-layers"), this.$staticLayers = $("<div></div>").addClass("ms-static-layers"), this.$fixedLayers = $("<div></div>").addClass("ms-fixed-layers"), this.$animLayers = $("<div></div>").addClass("ms-anim-layers")
		};
		var p = MSLayerController.prototype;
		p.addLayer = function (layer) {
			switch (layer.slide = this.slide, layer.controller = this, layer.$element.data("position")) {
				case "static":
					this.hasStaticLayer = !0, layer.$element.appendTo(this.$staticLayers);
					break;
				case "fixed":
					this.hasFixedLayer = !0, layer.$element.appendTo(this.$fixedLayers);
					break;
				default:
					layer.$element.appendTo(this.$animLayers)
			}
			layer.create(), this.layers.push(layer), this.layersCount++, layer.parallax && (this.hasParallaxLayer = !0), layer.needPreload && this.preloadCount++
		}, p.create = function () {
			this.slide.$element.append(this.$layers), this.$layers.append(this.$animLayers), this.hasStaticLayer && this.$layers.append(this.$staticLayers), "center" == this.slider.options.layersMode && (this.$layers.css("max-width", this.slider.options.width + "px"), this.hasFixedLayer && this.$fixedLayers.css("max-width", this.slider.options.width + "px"))
		}, p.loadLayers = function (callback) {
			if (this._onReadyCallback = callback, 0 === this.preloadCount) return void this._onlayersReady();
			for (var i = 0; i !== this.layersCount; ++i) this.layers[i].needPreload && this.layers[i].loadImage()
		}, p.prepareToShow = function () {
			this.hasParallaxLayer && this._enableParallaxEffect(), this.hasFixedLayer && this.$fixedLayers.prependTo(this.slide.view.$element)
		}, p.showLayers = function () {
			this.layersHideTween && this.layersHideTween.stop(!0), this.fixedLayersHideTween && this.fixedLayersHideTween.stop(!0), this._resetLayers(), this.$animLayers.css("opacity", "").css("display", ""), this.hasFixedLayer && this.$fixedLayers.css("opacity", "").css("display", ""), this.ready && (this._initLayers(), this._locateLayers(), this._startLayers())
		}, p.hideLayers = function () {
			if (this.slide.selected || this.slider.options.instantStartLayers) {
				var that = this;
				that.layersHideTween = CTween.animate(this.$animLayers, 500, {
					opacity: 0
				}, {
					complete: function () {
						that._resetLayers()
					}
				}), this.hasFixedLayer && (this.fixedLayersHideTween = CTween.animate(this.$fixedLayers, 500, {
					opacity: 0
				}, {
					complete: function () {
						that.$fixedLayers.detach()
					}
				})), this.hasParallaxLayer && this._disableParallaxEffect()
			}
		}, p.animHideLayers = function () {
			if (this.ready)
				for (var i = 0; i !== this.layersCount; ++i) this.layers[i].hide()
		}, p.setSize = function (width, height, hard) {
			if (this.ready && (this.slide.selected || this.hasStaticLayer) && (hard && this._initLayers(!0), this._locateLayers(!this.slide.selected)), this.slider.options.autoHeight && this.updateHeight(), "center" == this.slider.options.layersMode) {
				var left = Math.max(0, (width - this.slider.options.width) / 2) + "px";
				this.$layers[0].style.left = left, this.$fixedLayers[0].style.left = left
			}
		}, p.updateHeight = function () {
			var h = this.slide.getHeight() + "px";
			this.$layers[0].style.height = h, this.$fixedLayers[0].style.height = h
		}, p._onlayersReady = function () {
			this.ready = !0, this.hasStaticLayer && !this.slide.isSleeping && this._initLayers(!1, !0), this._onReadyCallback.call(this.slide)
		}, p.onSlideSleep = function () {}, p.onSlideWakeup = function () {
			this.hasStaticLayer && this.ready && this._initLayers(!1, !0)
		}, p.destroy = function () {
			this.slide.selected && this.hasParallaxLayer && this._disableParallaxEffect();
			for (var i = 0; i < this.layersCount; ++i) this.layers[i].$element.stop(!0).remove();
			this.$layers.remove(), this.$staticLayers.remove(), this.$fixedLayers.remove(), this.$animLayers.remove()
		}, p._startLayers = function () {
			for (var i = 0; i !== this.layersCount; ++i) this.layers[i].start()
		}, p._initLayers = function (force, onlyStatics) {
			if (!(this.init && !force || this.slider.init_safemode)) {
				this.init = onlyStatics !== !0;
				var i = 0;
				if (onlyStatics && !this.staticsInit)
					for (this.staticsInit = !0; i !== this.layersCount; ++i) this.layers[i].staticLayer && this.layers[i].init();
				else if (this.staticsInit && !force)
					for (; i !== this.layersCount; ++i) this.layers[i].staticLayer || this.layers[i].init();
				else
					for (; i !== this.layersCount; ++i) this.layers[i].init()
			}
		}, p._locateLayers = function (onlyStatics) {
			var i = 0;
			if (onlyStatics)
				for (; i !== this.layersCount; ++i) this.layers[i].staticLayer && this.layers[i].locate();
			else
				for (; i !== this.layersCount; ++i) this.layers[i].locate()
		}, p._resetLayers = function () {
			this.$animLayers.css("display", "none").css("opacity", 1);
			for (var i = 0; i !== this.layersCount; ++i) this.layers[i].reset()
		}, p._applyParallax = function (x, y, fast) {
			for (var i = 0; i !== this.layersCount; ++i) null != this.layers[i].parallax && this.layers[i].moveParallax(x, y, fast)
		}, p._enableParallaxEffect = function () {
			"swipe" === this.slider.options.parallaxMode ? this.slide.view.addEventListener(MSViewEvents.SCROLL, this._swipeParallaxMove, this) : this.slide.$element.on("mousemove", {
				that: this
			}, this._mouseParallaxMove).on("mouseleave", {
				that: this
			}, this._resetParalax)
		}, p._disableParallaxEffect = function () {
			"swipe" === this.slider.options.parallaxMode ? this.slide.view.removeEventListener(MSViewEvents.SCROLL, this._swipeParallaxMove, this) : this.slide.$element.off("mousemove", this._mouseParallaxMove).off("mouseleave", this._resetParalax)
		}, p._resetParalax = function (e) {
			var that = e.data.that;
			that._applyParallax(0, 0)
		}, p._mouseParallaxMove = function (e) {
			var that = e.data.that,
				os = that.slide.$element.offset(),
				slider = that.slider;
			if ("mouse:y-only" !== slider.options.parallaxMode) var x = e.pageX - os.left - that.slide.__width / 2;
			else var x = 0;
			if ("mouse:x-only" !== slider.options.parallaxMode) var y = e.pageY - os.top - that.slide.__height / 2;
			else var y = 0;
			that._applyParallax(-x, -y)
		}, p._swipeParallaxMove = function () {
			var value = this.slide.position - this.slide.view.__contPos;
			"v" === this.slider.options.dir ? this._applyParallax(0, value, !0) : this._applyParallax(value, 0, !0)
		}
	}(window, document, jQuery),
	function ($) {
		window.MSLayerEffects = {};
		var installed, _fade = {
			opacity: 0
		};
		MSLayerEffects.setup = function () {
			if (!installed) {
				installed = !0;
				var st = MSLayerEffects,
					transform_css = window._jcsspfx + "Transform",
					transform_orig_css = window._jcsspfx + "TransformOrigin",
					o = $.browser.opera;
				_2d = window._css2d && window._cssanim && !o, st.defaultValues = {
					left: 0,
					top: 0,
					opacity: isMSIE("<=9") ? 1 : "",
					right: 0,
					bottom: 0
				}, st.defaultValues[transform_css] = "", st.rf = 1, st.presetEffParams = {
					random: "30|300",
					"long": 300,
					"short": 30,
					"false": !1,
					"true": !0,
					tl: "top left",
					bl: "bottom left",
					tr: "top right",
					br: "bottom right",
					rt: "top right",
					lb: "bottom left",
					lt: "top left",
					rb: "bottom right",
					t: "top",
					b: "bottom",
					r: "right",
					l: "left",
					c: "center"
				}, st.fade = function () {
					return _fade
				}, st.left = _2d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "translateX(" + -dist * st.rf + "px)", r
				} : function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r.left = -dist * st.rf + "px", r
				}, st.right = _2d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "translateX(" + dist * st.rf + "px)", r
				} : function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r.left = dist * st.rf + "px", r
				}, st.top = _2d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "translateY(" + -dist * st.rf + "px)", r
				} : function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r.top = -dist * st.rf + "px", r
				}, st.bottom = _2d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "translateY(" + dist * st.rf + "px)", r
				} : function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r.top = dist * st.rf + "px", r
				}, st.from = _2d ? function (leftdis, topdis, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "translateX(" + leftdis * st.rf + "px) translateY(" + topdis * st.rf + "px)", r
				} : function (leftdis, topdis, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r.top = topdis * st.rf + "px", r.left = leftdis * st.rf + "px", r
				}, st.rotate = _2d ? function (deg, orig) {
					var r = {
						opacity: 0
					};
					return r[transform_css] = " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function () {
					return _fade
				}, st.rotateleft = _2d ? function (deg, dist, orig, fade) {
					var r = st.left(dist, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, dist, orig, fade) {
					return st.left(dist, fade)
				}, st.rotateright = _2d ? function (deg, dist, orig, fade) {
					var r = st.right(dist, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, dist, orig, fade) {
					return st.right(dist, fade)
				}, st.rotatetop = _2d ? function (deg, dist, orig, fade) {
					var r = st.top(dist, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, dist, orig, fade) {
					return st.top(dist, fade)
				}, st.rotatebottom = _2d ? function (deg, dist, orig, fade) {
					var r = st.bottom(dist, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, dist, orig, fade) {
					return st.bottom(dist, fade)
				}, st.rotatefrom = _2d ? function (deg, leftdis, topdis, orig, fade) {
					var r = st.from(leftdis, topdis, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, leftdis, topdis, orig, fade) {
					return st.from(leftdis, topdis, fade)
				}, st.skewleft = _2d ? function (deg, dist, fade) {
					var r = st.left(dist, fade);
					return r[transform_css] += " skewX(" + deg + "deg)", r
				} : function (deg, dist, fade) {
					return st.left(dist, fade)
				}, st.skewright = _2d ? function (deg, dist, fade) {
					var r = st.right(dist, fade);
					return r[transform_css] += " skewX(" + -deg + "deg)", r
				} : function (deg, dist, fade) {
					return st.right(dist, fade)
				}, st.skewtop = _2d ? function (deg, dist, fade) {
					var r = st.top(dist, fade);
					return r[transform_css] += " skewY(" + deg + "deg)", r
				} : function (deg, dist, fade) {
					return st.top(dist, fade)
				}, st.skewbottom = _2d ? function (deg, dist, fade) {
					var r = st.bottom(dist, fade);
					return r[transform_css] += " skewY(" + -deg + "deg)", r
				} : function (deg, dist, fade) {
					return st.bottom(dist, fade)
				}, st.scale = _2d ? function (x, y, orig, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, orig, fade) {
					return fade === !1 ? {} : {
						opacity: 0
					}
				}, st.scaleleft = _2d ? function (x, y, dist, orig, fade) {
					var r = st.left(dist, fade);
					return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, dist, orig, fade) {
					return st.left(dist, fade)
				}, st.scaleright = _2d ? function (x, y, dist, orig, fade) {
					var r = st.right(dist, fade);
					return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, dist, orig, fade) {
					return st.right(dist, fade)
				}, st.scaletop = _2d ? function (x, y, dist, orig, fade) {
					var r = st.top(dist, fade);
					return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, dist, orig, fade) {
					return st.top(dist, fade)
				}, st.scalebottom = _2d ? function (x, y, dist, orig, fade) {
					var r = st.bottom(dist, fade);
					return r[transform_css] = " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, dist, orig, fade) {
					return st.bottom(dist, fade)
				}, st.scalefrom = _2d ? function (x, y, leftdis, topdis, orig, fade) {
					var r = st.from(leftdis, topdis, fade);
					return r[transform_css] += " scaleX(" + x + ") scaleY(" + y + ")", orig && (r[transform_orig_css] = orig), r
				} : function (x, y, leftdis, topdis, orig, fade) {
					return st.from(leftdis, topdis, fade)
				}, st.rotatescale = _2d ? function (deg, x, y, orig, fade) {
					var r = st.scale(x, y, orig, fade);
					return r[transform_css] += " rotate(" + deg + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function (deg, x, y, orig, fade) {
					return st.scale(x, y, orig, fade)
				}, st.front = window._css3d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + dist + "px ) rotate(0.001deg)", r
				} : function () {
					return _fade
				}, st.back = window._css3d ? function (dist, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + -dist + "px ) rotate(0.001deg)", r
				} : function () {
					return _fade
				}, st.rotatefront = window._css3d ? function (deg, dist, orig, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + dist + "px ) rotate(" + (deg || .001) + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function () {
					return _fade
				}, st.rotateback = window._css3d ? function (deg, dist, orig, fade) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return r[transform_css] = "perspective(2000px) translate3d(0 , 0 ," + -dist + "px ) rotate(" + (deg || .001) + "deg)", orig && (r[transform_orig_css] = orig), r
				} : function () {
					return _fade
				}, st.rotate3dleft = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.left(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.left(dist, fade)
				}, st.rotate3dright = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.right(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.right(dist, fade)
				}, st.rotate3dtop = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.top(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.top(dist, fade)
				}, st.rotate3dbottom = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.bottom(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.bottom(dist, fade)
				}, st.rotate3dfront = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.front(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.front(dist, fade)
				}, st.rotate3dback = window._css3d ? function (x, y, z, dist, orig, fade) {
					var r = st.back(dist, fade);
					return r[transform_css] += (x ? " rotateX(" + x + "deg)" : " ") + (y ? " rotateY(" + y + "deg)" : "") + (z ? " rotateZ(" + z + "deg)" : ""), orig && (r[transform_orig_css] = orig), r
				} : function (x, y, z, dist, orig, fade) {
					return st.back(dist, fade)
				}, st.t = window._css3d ? function (fade, tx, ty, tz, r, rx, ry, rz, scx, scy, skx, sky, ox, oy, oz) {
					var _r = fade === !1 ? {} : {
							opacity: 0
						},
						transform = "perspective(2000px) ";
					"n" !== tx && (transform += "translateX(" + tx * st.rf + "px) "), "n" !== ty && (transform += "translateY(" + ty * st.rf + "px) "), "n" !== tz && (transform += "translateZ(" + tz * st.rf + "px) "), "n" !== r && (transform += "rotate(" + r + "deg) "), "n" !== rx && (transform += "rotateX(" + rx + "deg) "), "n" !== ry && (transform += "rotateY(" + ry + "deg) "), "n" !== rz && (transform += "rotateZ(" + rz + "deg) "), "n" !== skx && (transform += "skewX(" + skx + "deg) "), "n" !== sky && (transform += "skewY(" + sky + "deg) "), "n" !== scx && (transform += "scaleX(" + scx + ") "), "n" !== scy && (transform += "scaleY(" + scy + ")"), _r[transform_css] = transform;
					var trans_origin = "";
					return trans_origin += "n" !== ox ? ox + "% " : "50% ", trans_origin += "n" !== oy ? oy + "% " : "50% ", trans_origin += "n" !== oz ? oz + "px" : "", _r[transform_orig_css] = trans_origin, _r
				} : function (fade, tx, ty, tz, r) {
					var r = fade === !1 ? {} : {
						opacity: 0
					};
					return "n" !== tx && (r.left = tx * st.rf + "px"), "n" !== ty && (r.top = ty * st.rf + "px"), r
				}
			}
		}
	}(jQuery),
	function ($) {
		window.MSLayerElement = function () {
			this.start_anim = {
				name: "fade",
				duration: 1e3,
				ease: "linear",
				delay: 0
			}, this.end_anim = {
				duration: 1e3,
				ease: "linear"
			}, this.type = "text", this.resizable = !0, this.minWidth = -1, this.isVisible = !0, this.__cssConfig = ["margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "font-size", "line-height", "width", "left", "right", "top", "bottom"], this.baseStyle = {}
		};
		var p = MSLayerElement.prototype;
		p.setStartAnim = function (anim) {
			$.extend(this.start_anim, anim), $.extend(this.start_anim, this._parseEff(this.start_anim.name)), this.$element.css("visibility", "hidden")
		}, p.setEndAnim = function (anim) {
			$.extend(this.end_anim, anim)
		}, p.create = function () {
			if (this.$element.css("display", "none"), this.resizable = this.$element.data("resize") !== !1, this.fixed = this.$element.data("fixed") === !0, void 0 !== this.$element.data("widthlimit") && (this.minWidth = this.$element.data("widthlimit")), this.end_anim.name || (this.end_anim.name = this.start_anim.name), this.end_anim.time && (this.autoHide = !0), this.staticLayer = "static" === this.$element.data("position"), this.fixedLayer = "fixed" === this.$element.data("position"), this.layersCont = this.controller.$layers, this.staticLayer && this.$element.css("display", "").css("visibility", ""), void 0 !== this.$element.data("action")) {
				var slideController = this.slide.slider.slideController;
				this.$element.on("click", function (event) {
					slideController.runAction($(this).data("action")), event.preventDefault()
				}).addClass("ms-action-layer")
			}
			$.extend(this.end_anim, this._parseEff(this.end_anim.name)), this.slider = this.slide.slider;
			var layerOrigin = this.layerOrigin = this.$element.data("origin");
			if (layerOrigin) {
				var vOrigin = layerOrigin.charAt(0),
					hOrigin = layerOrigin.charAt(1),
					offsetX = this.$element.data("offset-x"),
					offsetY = this.$element.data("offset-y");
				switch (void 0 === offsetY && (offsetY = 0), vOrigin) {
					case "t":
						this.$element[0].style.top = offsetY + "px";
						break;
					case "b":
						this.$element[0].style.bottom = offsetY + "px";
						break;
					case "m":
						this.$element[0].style.top = offsetY + "px", this.middleAlign = !0
				}
				switch (void 0 === offsetX && (offsetX = 0), hOrigin) {
					case "l":
						this.$element[0].style.left = offsetX + "px";
						break;
					case "r":
						this.$element[0].style.right = offsetX + "px";
						break;
					case "c":
						this.$element[0].style.left = offsetX + "px", this.centerAlign = !0
				}
			}
			this.parallax = this.$element.data("parallax"), null != this.parallax && (this.parallax /= 100, this.$parallaxElement = $("<div></div>").addClass("ms-parallax-layer"), this.link ? (this.link.wrap(this.$parallaxElement), this.$parallaxElement = this.link.parent()) : (this.$element.wrap(this.$parallaxElement), this.$parallaxElement = this.$element.parent()), this._lastParaX = 0, this._lastParaY = 0, this._paraX = 0, this._paraY = 0, this.alignedToBot = this.layerOrigin && -1 !== this.layerOrigin.indexOf("b"), this.alignedToBot && this.$parallaxElement.css("bottom", 0), this.parallaxRender = window._css3d ? this._parallaxCSS3DRenderer : window._css2d ? this._parallaxCSS2DRenderer : this._parallax2DRenderer, "swipe" !== this.slider.options.parallaxMode && averta.Ticker.add(this.parallaxRender, this)), $.removeDataAttrs(this.$element, ["data-src"])
		}, p.init = function () {
			this.initialized = !0;
			var value;
			this.$element.css("visibility", "");
			for (var i = 0, l = this.__cssConfig.length; l > i; i++) {
				var key = this.__cssConfig[i];
				"text" === this.type && "width" === key ? value = this.$element[0].style.width : (value = this.$element.css(key), "width" !== key && "height" !== key || "0px" !== value || (value = this.$element.data(key) + "px")), "auto" != value && "" != value && "normal" != value && (this.baseStyle[key] = parseInt(value))
			}
			this.middleAlign && (this.baseHeight = this.$element.outerHeight(!1)), this.centerAlign && (this.baseWidth = this.$element.outerWidth(!1))
		}, p.locate = function () {
			if (this.slide.ready) {
				var factor, isPosition, width = parseFloat(this.layersCont.css("width")),
					height = parseFloat(this.layersCont.css("height"));
				!this.staticLayer && "none" === this.$element.css("display") && this.isVisible && this.$element.css("display", "").css("visibility", "hidden"), factor = this.resizeFactor = width / this.slide.slider.options.width;
				for (var key in this.baseStyle) isPosition = "top" === key || "left" === key || "bottom" === key || "right" === key, factor = this.fixed && isPosition ? 1 : this.resizeFactor, (this.resizable || isPosition) && ("top" === key && this.middleAlign ? (this.$element[0].style.top = "0px", this.baseHeight = this.$element.outerHeight(!1), this.$element[0].style.top = this.baseStyle.top * factor + (height - this.baseHeight) / 2 + "px") : "left" === key && this.centerAlign ? (this.$element[0].style.left = "0px", this.baseWidth = this.$element.outerWidth(!1), this.$element[0].style.left = this.baseStyle.left * factor + (width - this.baseWidth) / 2 + "px") : this.$element.css(key, this.baseStyle[key] * factor + "px"));
				this.visible(this.minWidth < width)
			}
		}, p.start = function () {
			if (!this.isShowing && !this.staticLayer) {
				this.isShowing = !0;
				var key, base;
				MSLayerEffects.rf = this.resizeFactor;
				var effect_css = MSLayerEffects[this.start_anim.eff_name].apply(null, this._parseEffParams(this.start_anim.eff_params)),
					start_css_eff = {};
				for (key in effect_css) this._checkPosKey(key, effect_css) || (null != MSLayerEffects.defaultValues[key] && (start_css_eff[key] = MSLayerEffects.defaultValues[key]), key in this.baseStyle && (base = this.baseStyle[key], this.middleAlign && "top" === key && (base += (parseInt(this.layersCont.height()) - this.$element.outerHeight(!1)) / 2), this.centerAlign && "left" === key && (base += (parseInt(this.layersCont.width()) - this.$element.outerWidth(!1)) / 2), effect_css[key] = base + parseFloat(effect_css[key]) + "px", start_css_eff[key] = base + "px"), this.$element.css(key, effect_css[key]));
				var that = this;
				clearTimeout(this.to), this.to = setTimeout(function () {
					that.$element.css("visibility", ""), that._playAnimation(that.start_anim, start_css_eff)
				}, that.start_anim.delay || .01), this.clTo = setTimeout(function () {
					that.show_cl = !0
				}, (this.start_anim.delay || .01) + this.start_anim.duration), this.autoHide && (clearTimeout(this.hto), this.hto = setTimeout(function () {
					that.hide()
				}, that.end_anim.time))
			}
		}, p.hide = function () {
			if (!this.staticLayer) {
				this.isShowing = !1;
				var effect_css = MSLayerEffects[this.end_anim.eff_name].apply(null, this._parseEffParams(this.end_anim.eff_params));
				for (key in effect_css) this._checkPosKey(key, effect_css) || (key === window._jcsspfx + "TransformOrigin" && this.$element.css(key, effect_css[key]), key in this.baseStyle && (effect_css[key] = this.baseStyle[key] + parseFloat(effect_css[key]) + "px"));
				this._playAnimation(this.end_anim, effect_css), clearTimeout(this.to), clearTimeout(this.hto), clearTimeout(this.clTo)
			}
		}, p.reset = function () {
			this.staticLayer || (this.isShowing = !1, this.$element[0].style.display = "none", this.$element.css("opacity", ""), this.$element[0].style.transitionDuration = "", this.show_tween && this.show_tween.stop(!0), clearTimeout(this.to), clearTimeout(this.hto))
		}, p.destroy = function () {
			this.reset(), this.$element.remove()
		}, p.visible = function (value) {
			this.isVisible != value && (this.isVisible = value, this.$element.css("display", value ? "" : "none"))
		}, p.moveParallax = function (x, y, fast) {
			this._paraX = x, this._paraY = y, fast && (this._lastParaX = x, this._lastParaY = y, this.parallaxRender())
		}, p._playAnimation = function (animation, css) {
			var options = {};
			animation.ease && (options.ease = animation.ease), options.transProperty = window._csspfx + "transform,opacity", this.show_tween = CTween.animate(this.$element, animation.duration, css, options)
		}, p._randomParam = function (value) {
			var min = Number(value.slice(0, value.indexOf("|"))),
				max = Number(value.slice(value.indexOf("|") + 1));
			return min + Math.random() * (max - min)
		}, p._parseEff = function (eff_name) {
			var eff_params = [];
			if (-1 !== eff_name.indexOf("(")) {
				var value, temp = eff_name.slice(0, eff_name.indexOf("(")).toLowerCase();
				eff_params = eff_name.slice(eff_name.indexOf("(") + 1, -1).replace(/\"|\'|\s/g, "").split(","), eff_name = temp;
				for (var i = 0, l = eff_params.length; l > i; ++i) value = eff_params[i], value in MSLayerEffects.presetEffParams && (value = MSLayerEffects.presetEffParams[value]), eff_params[i] = value
			}
			return {
				eff_name: eff_name,
				eff_params: eff_params
			}
		}, p._parseEffParams = function (params) {
			for (var eff_params = [], i = 0, l = params.length; l > i; ++i) {
				var value = params[i];
				"string" == typeof value && -1 !== value.indexOf("|") && (value = this._randomParam(value)), eff_params[i] = value
			}
			return eff_params
		}, p._checkPosKey = function (key, style) {
			return "left" === key && !(key in this.baseStyle) && "right" in this.baseStyle ? (style.right = -parseInt(style.left) + "px", delete style.left, !0) : "top" === key && !(key in this.baseStyle) && "bottom" in this.baseStyle ? (style.bottom = -parseInt(style.top) + "px", delete style.top, !0) : !1
		}, p._parallaxCalc = function () {
			var x_def = this._paraX - this._lastParaX,
				y_def = this._paraY - this._lastParaY;
			this._lastParaX += x_def / 12, this._lastParaY += y_def / 12, Math.abs(x_def) < .019 && (this._lastParaX = this._paraX), Math.abs(y_def) < .019 && (this._lastParaY = this._paraY)
		}, p._parallaxCSS3DRenderer = function () {
			this._parallaxCalc(), this.$parallaxElement[0].style[window._jcsspfx + "Transform"] = "translateX(" + this._lastParaX * this.parallax + "px) translateY(" + this._lastParaY * this.parallax + "px) translateZ(0)"
		}, p._parallaxCSS2DRenderer = function () {
			this._parallaxCalc(), this.$parallaxElement[0].style[window._jcsspfx + "Transform"] = "translateX(" + this._lastParaX * this.parallax + "px) translateY(" + this._lastParaY * this.parallax + "px)"
		}, p._parallax2DRenderer = function () {
			this._parallaxCalc(), this.alignedToBot ? this.$parallaxElement[0].style.bottom = this._lastParaY * this.parallax + "px" : this.$parallaxElement[0].style.top = this._lastParaY * this.parallax + "px", this.$parallaxElement[0].style.left = this._lastParaX * this.parallax + "px"
		}
	}(jQuery),
	function ($) {
		window.MSImageLayerElement = function () {
			MSLayerElement.call(this), this.needPreload = !0, this.__cssConfig = ["width", "height", "margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "left", "right", "top", "bottom"], this.type = "image"
		}, MSImageLayerElement.extend(MSLayerElement);
		var p = MSImageLayerElement.prototype,
			_super = MSLayerElement.prototype;
		p.create = function () {
			if (this.link) {
				var p = this.$element.parent();
				p.append(this.link), this.link.append(this.$element), this.link.removeClass("ms-layer"), this.$element.addClass("ms-layer"), p = null
			}
			if (_super.create.call(this), void 0 != this.$element.data("src")) this.img_src = this.$element.data("src"), this.$element.removeAttr("data-src");
			else {
				var that = this;
				this.$element.on("load", function () {
					that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
				}).each($.jqLoadFix)
			}
			$.browser.msie && this.$element.on("dragstart", function (event) {
				event.preventDefault()
			})
		}, p.loadImage = function () {
			var that = this;
			this.$element.preloadImg(this.img_src, function () {
				that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
			})
		}
	}(jQuery),
	function ($) {
		window.MSVideoLayerElement = function () {
			MSLayerElement.call(this), this.__cssConfig.push("height"), this.type = "video"
		}, MSVideoLayerElement.extend(MSLayerElement);
		var p = MSVideoLayerElement.prototype,
			_super = MSLayerElement.prototype;
		p.__playVideo = function () {
			this.img && CTween.fadeOut(this.img, 500, 2), CTween.fadeOut(this.video_btn, 500, 2), this.video_frame.attr("src", "about:blank").css("display", "block"), -1 == this.video_url.indexOf("?") && (this.video_url += "?"), this.video_frame.attr("src", this.video_url + "&autoplay=1")
		}, p.start = function () {
			_super.start.call(this), this.$element.data("autoplay") && this.__playVideo()
		}, p.reset = function () {
			return _super.reset.call(this), (this.needPreload || this.$element.data("btn")) && (this.video_btn.css("opacity", 1).css("display", "block"), this.video_frame.attr("src", "about:blank").css("display", "none")), this.needPreload ? void this.img.css("opacity", 1).css("display", "block") : void this.video_frame.attr("src", this.video_url)
		}, p.create = function () {
			_super.create.call(this), this.video_frame = this.$element.find("iframe").css({
				width: "100%",
				height: "100%"
			}), this.video_url = this.video_frame.attr("src");
			var has_img = 0 != this.$element.has("img").length;
			if (has_img || this.$element.data("btn")) {
				this.video_frame.attr("src", "about:blank").css("display", "none");
				var that = this;
				if (this.video_btn = $("<div></div>").appendTo(this.$element).addClass("ms-video-btn").click(function () {
						that.__playVideo()
					}), has_img) {
					if (this.needPreload = !0, this.img = this.$element.find("img:first").addClass("ms-video-img"), void 0 !== this.img.data("src")) this.img_src = this.img.data("src"), this.img.removeAttr("data-src");
					else {
						var that = this;
						this.img.attr("src", this.img_src).on("load", function () {
							that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
						}).each($.jqLoadFix)
					}
					$.browser.msie && this.img.on("dragstart", function (event) {
						event.preventDefault()
					})
				}
			}
		}, p.loadImage = function () {
			var that = this;
			this.img.preloadImg(this.img_src, function () {
				that.controller.preloadCount--, 0 === that.controller.preloadCount && that.controller._onlayersReady()
			})
		}
	}(jQuery),
	function ($) {
		"use strict";
		window.MSHotspotLayer = function () {
			MSLayerElement.call(this), this.__cssConfig = ["margin-top", "padding-top", "margin-bottom", "padding-left", "margin-right", "padding-right", "margin-left", "padding-bottom", "left", "right", "top", "bottom"], this.ease = "Expo", this.hide_start = !0, this.type = "hotspot"
		}, MSHotspotLayer.extend(MSLayerElement);
		var p = MSHotspotLayer.prototype,
			_super = MSLayerElement.prototype;
		p._showTT = function () {
			this.show_cl && (clearTimeout(this.hto), this._tween && this._tween.stop(!0), this.hide_start && (this.align = this._orgAlign, this._locateTT(), this.tt.css({
				display: "block"
			}), this._tween = CTween.animate(this.tt, 900, this.to, {
				ease: "easeOut" + this.ease
			}), this.hide_start = !1))
		}, p._hideTT = function () {
			if (this.show_cl) {
				this._tween && this._tween.stop(!0);
				var that = this;
				clearTimeout(this.hto), this.hto = setTimeout(function () {
					that.hide_start = !0, that._tween = CTween.animate(that.tt, 900, that.from, {
						ease: "easeOut" + that.ease,
						complete: function () {
							that.tt.css("display", "none")
						}
					})
				}, 200)
			}
		}, p._updateClassName = function (name) {
			this._lastClass && this.tt.removeClass(this._lastClass), this.tt.addClass(name), this._lastClass = name
		}, p._alignPolicy = function () {
			{
				var w = (this.tt.outerHeight(!1), Math.max(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")))),
					ww = window.innerWidth;
				window.innerHeight
			}
			switch (this.align) {
				case "top":
					if (this.base_t < 0) return "bottom";
					break;
				case "right":
					if (this.base_l + w > ww || this.base_t < 0) return "bottom";
					break;
				case "left":
					if (this.base_l < 0 || this.base_t < 0) return "bottom"
			}
			return null
		}, p._locateTT = function () {
			var os = this.$element.offset(),
				os2 = this.slide.slider.$element.offset(),
				dist = 50,
				space = 15;
			this.pos_x = os.left - os2.left - this.slide.slider.$element.scrollLeft(), this.pos_y = os.top - os2.top - this.slide.slider.$element.scrollTop(), this.from = {
				opacity: 0
			}, this.to = {
				opacity: 1
			}, this._updateClassName("ms-tooltip-" + this.align), this.tt_arrow.css("margin-left", "");
			var arrow_w = 15,
				arrow_h = 15;
			switch (this.align) {
				case "top":
					var w = Math.min(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")));
					this.base_t = this.pos_y - this.tt.outerHeight(!1) - arrow_h - space, this.base_l = this.pos_x - w / 2, this.base_l + w > window.innerWidth && (this.tt_arrow.css("margin-left", -arrow_w / 2 + this.base_l + w - window.innerWidth + "px"), this.base_l = window.innerWidth - w), this.base_l < 0 && (this.base_l = 0, this.tt_arrow.css("margin-left", -arrow_w / 2 + this.pos_x - this.tt.outerWidth(!1) / 2 + "px")), window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateY(-" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.top = this.base_t - dist + "px", this.to.top = this.base_t + "px");
					break;
				case "bottom":
					var w = Math.min(this.tt.outerWidth(!1), parseInt(this.tt.css("max-width")));
					this.base_t = this.pos_y + arrow_h + space, this.base_l = this.pos_x - w / 2, this.base_l + w > window.innerWidth && (this.tt_arrow.css("margin-left", -arrow_w / 2 + this.base_l + w - window.innerWidth + "px"), this.base_l = window.innerWidth - w), this.base_l < 0 && (this.base_l = 0, this.tt_arrow.css("margin-left", -arrow_w / 2 + this.pos_x - this.tt.outerWidth(!1) / 2 + "px")), window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateY(" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.top = this.base_t + dist + "px", this.to.top = this.base_t + "px");
					break;
				case "right":
					this.base_l = this.pos_x + arrow_w + space, this.base_t = this.pos_y - this.tt.outerHeight(!1) / 2, window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateX(" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.left = this.base_l + dist + "px", this.to.left = this.base_l + "px");
					break;
				case "left":
					this.base_l = this.pos_x - arrow_w - this.tt.outerWidth(!1) - space, this.base_t = this.pos_y - this.tt.outerHeight(!1) / 2, window._css3d ? (this.from[window._jcsspfx + "Transform"] = "translateX(-" + dist + "px)", this.to[window._jcsspfx + "Transform"] = "") : (this.from.left = this.base_l - dist + "px", this.to.left = this.base_l + "px")
			}
			var policyAlign = this._alignPolicy();
			return null !== policyAlign ? (this.align = policyAlign, void this._locateTT()) : (this.tt.css("top", parseInt(this.base_t) + "px").css("left", parseInt(this.base_l) + "px"), void this.tt.css(this.from))
		}, p.start = function () {
			_super.start.call(this), this.tt.appendTo(this.slide.slider.$element), this.tt.css("display", "none")
		}, p.reset = function () {
			_super.reset.call(this), this.tt.detach()
		}, p.create = function () {
			var that = this;
			this._orgAlign = this.align = void 0 !== this.$element.data("align") ? this.$element.data("align") : "top", this.data = this.$element.html(), this.$element.html("").on("mouseenter", function () {
				that._showTT()
			}).on("mouseleave", function () {
				that._hideTT()
			}), this.point = $('<div><div class="ms-point-center"></div><div class="ms-point-border"></div></div>').addClass("ms-tooltip-point").appendTo(this.$element);
			var link = this.$element.data("link"),
				target = this.$element.data("target");
			link && this.point.on("click", function () {
				window.open(link, target || "_self")
			}), this.tt = $("<div></div>").addClass("ms-tooltip").css("display", "hidden").css("opacity", 0), void 0 !== this.$element.data("width") && this.tt.css("width", this.$element.data("width")).css("max-width", this.$element.data("width")), this.tt_arrow = $("<div></div>").addClass("ms-tooltip-arrow").appendTo(this.tt), this._updateClassName("ms-tooltip-" + this.align), this.ttcont = $("<div></div>").addClass("ms-tooltip-cont").html(this.data).appendTo(this.tt), this.$element.data("stay-hover") === !0 && this.tt.on("mouseenter", function () {
				that.hide_start || (clearTimeout(that.hto), that._tween.stop(!0), that._showTT())
			}).on("mouseleave", function () {
				that._hideTT()
			}), _super.create.call(this)
		}
	}(jQuery),
	function () {
		window.MSButtonLayer = function () {
			MSLayerElement.call(this), this.type = "button"
		}, MSButtonLayer.extend(MSLayerElement);
		var p = MSButtonLayer.prototype,
			_super = MSLayerElement.prototype,
			positionKies = ["top", "left", "bottom", "right"];
		p.create = function () {
			_super.create.call(this), this.$element.wrap('<div class="ms-btn-container"></div>').css("position", "relative"), this.$container = this.$element.parent()
		}, p.locate = function () {
			_super.locate.call(this);
			for (var key, tempValue, i = 0; 4 > i; i++) key = positionKies[i], key in this.baseStyle && (tempValue = this.$element.css(key), this.$element.css(key, ""), this.$container.css(key, tempValue));
			this.$container.width(this.$element.outerWidth(!0)).height(this.$element.outerHeight(!0))
		}
	}(jQuery), window.MSSliderEvent = function (type) {
		this.type = type
	}, MSSliderEvent.CHANGE_START = "ms_changestart", MSSliderEvent.CHANGE_END = "ms_changeend", MSSliderEvent.WAITING = "ms_waiting", MSSliderEvent.AUTOPLAY_CHANGE = "ms_autoplaychange", MSSliderEvent.VIDEO_PLAY = "ms_videoPlay", MSSliderEvent.VIDEO_CLOSE = "ms_videoclose", MSSliderEvent.INIT = "ms_init", MSSliderEvent.HARD_UPDATE = "ms_hard_update", MSSliderEvent.RESIZE = "ms_resize", MSSliderEvent.RESERVED_SPACE_CHANGE = "ms_rsc", MSSliderEvent.DESTROY = "ms_destroy",
	function (window, document, $) {
		"use strict";
		window.MSSlide = function () {
			this.$element = null, this.$loading = $("<div></div>").addClass("ms-slide-loading"), this.view = null, this.index = -1, this.__width = 0, this.__height = 0, this.fillMode = "fill", this.selected = !1, this.pselected = !1, this.autoAppend = !0, this.isSleeping = !0, this.moz = $.browser.mozilla
		};
		var p = MSSlide.prototype;
		p.onSwipeStart = function () {
			this.link && (this.linkdis = !0), this.video && (this.videodis = !0)
		}, p.onSwipeMove = function (e) {
			var move = Math.max(Math.abs(e.data.distanceX), Math.abs(e.data.distanceY));
			this.swipeMoved = move > 4
		}, p.onSwipeCancel = function () {
			return this.swipeMoved ? void(this.swipeMoved = !1) : (this.link && (this.linkdis = !1), void(this.video && (this.videodis = !1)))
		}, p.setupLayerController = function () {
			this.hasLayers = !0, this.layerController = new MSLayerController(this)
		}, p.assetsLoaded = function () {
			this.ready = !0, this.slider.api._startTimer(), (this.selected || this.pselected && this.slider.options.instantStartLayers) && (this.hasLayers && this.layerController.showLayers(), this.vinit && (this.bgvideo.play(), this.autoPauseBgVid || (this.bgvideo.currentTime = 0))), this.isSleeping || this.setupBG(), CTween.fadeOut(this.$loading, 300, !0), (0 === this.slider.options.preload || "all" === this.slider.options.preload) && this.index < this.view.slideList.length - 1 ? this.view.slideList[this.index + 1].loadImages() : "all" === this.slider.options.preload && this.index === this.view.slideList.length - 1 && this.slider._removeLoading()
		}, p.setBG = function (img) {
			this.hasBG = !0;
			var that = this;
			this.$imgcont = $("<div></div>").addClass("ms-slide-bgcont"), this.$element.append(this.$loading).append(this.$imgcont), this.$bg_img = $(img).css("visibility", "hidden"), this.$imgcont.append(this.$bg_img), this.bgAligner = new MSAligner(that.fillMode, that.$imgcont, that.$bg_img), this.bgAligner.widthOnly = this.slider.options.autoHeight, that.slider.options.autoHeight && (that.pselected || that.selected) && that.slider.setHeight(that.slider.options.height), void 0 !== this.$bg_img.data("src") ? (this.bg_src = this.$bg_img.data("src"), this.$bg_img.removeAttr("data-src")) : this.$bg_img.one("load", function (event) {
				that._onBGLoad(event)
			}).each($.jqLoadFix)
		}, p.setupBG = function () {
			!this.initBG && this.bgLoaded && (this.initBG = !0, this.$bg_img.css("visibility", ""), this.bgWidth = this.bgNatrualWidth || this.$bg_img.width(), this.bgHeight = this.bgNatrualHeight || this.$bg_img.height(), CTween.fadeIn(this.$imgcont, 300), this.slider.options.autoHeight && this.$imgcont.height(this.bgHeight * this.ratio), this.bgAligner.init(this.bgWidth, this.bgHeight), this.setSize(this.__width, this.__height), this.slider.options.autoHeight && (this.pselected || this.selected) && this.slider.setHeight(this.getHeight()))
		}, p.loadImages = function () {
			if (!this.ls) {
				if (this.ls = !0, this.bgvideo && this.bgvideo.load(), this.hasBG && this.bg_src) {
					var that = this;
					this.$bg_img.preloadImg(this.bg_src, function (event) {
						that._onBGLoad(event)
					})
				}
				this.hasLayers && this.layerController.loadLayers(this._onLayersLoad), this.hasBG || this.hasLayers || this.assetsLoaded()
			}
		}, p._onLayersLoad = function () {
			this.layersLoaded = !0, (!this.hasBG || this.bgLoaded) && this.assetsLoaded()
		}, p._onBGLoad = function (event) {
			this.bgNatrualWidth = event.width, this.bgNatrualHeight = event.height, this.bgLoaded = !0, $.browser.msie && this.$bg_img.on("dragstart", function (event) {
				event.preventDefault()
			}), (!this.hasLayers || this.layerController.ready) && this.assetsLoaded()
		}, p.setBGVideo = function ($video) {
			if ($video[0].play) {
				if (window._mobile) return void $video.remove();
				this.bgvideo = $video[0];
				var that = this;
				$video.addClass("ms-slide-bgvideo"), $video.data("loop") !== !1 && this.bgvideo.addEventListener("ended", function () {
					that.bgvideo.play()
				}), $video.data("mute") !== !1 && (this.bgvideo.muted = !0), $video.data("autopause") === !0 && (this.autoPauseBgVid = !0), this.bgvideo_fillmode = $video.data("fill-mode") || "fill", "none" !== this.bgvideo_fillmode && (this.bgVideoAligner = new MSAligner(this.bgvideo_fillmode, this.$element, $video), this.bgvideo.addEventListener("loadedmetadata", function () {
					that.vinit || (that.vinit = !0, that.video_aspect = that.bgVideoAligner.baseHeight / that.bgVideoAligner.baseWidth, that.bgVideoAligner.init(that.bgvideo.videoWidth, that.bgvideo.videoHeight), that._alignBGVideo(), CTween.fadeIn($(that.bgvideo), 200), that.selected && that.bgvideo.play())
				})), $video.css("opacity", 0), this.$bgvideocont = $("<div></div>").addClass("ms-slide-bgvideocont").append($video), this.hasBG ? this.$imgcont.before(this.$bgvideocont) : this.$bgvideocont.appendTo(this.$element)
			}
		}, p._alignBGVideo = function () {
			this.bgvideo_fillmode && "none" !== this.bgvideo_fillmode && this.bgVideoAligner.align()
		}, p.setSize = function (width, height, hard) {
			this.__width = width, this.slider.options.autoHeight && (this.bgLoaded ? (this.ratio = this.__width / this.bgWidth, height = Math.floor(this.ratio * this.bgHeight), this.$imgcont.height(height)) : (this.ratio = width / this.slider.options.width, height = this.slider.options.height * this.ratio)), this.__height = height, this.$element.width(width).height(height), this.hasBG && this.bgLoaded && this.bgAligner.align(), this._alignBGVideo(), this.hasLayers && this.layerController.setSize(width, height, hard)
		}, p.getHeight = function () {
			return this.hasBG && this.bgLoaded ? this.bgHeight * this.ratio : Math.max(this.$element[0].clientHeight, this.slider.options.height * this.ratio)
		}, p.__playVideo = function () {
			this.vplayed || this.videodis || (this.vplayed = !0, this.slider.api.paused || (this.slider.api.pause(), this.roc = !0), this.vcbtn.css("display", ""), CTween.fadeOut(this.vpbtn, 500, !1), CTween.fadeIn(this.vcbtn, 500), CTween.fadeIn(this.vframe, 500), this.vframe.css("display", "block").attr("src", this.video + "&autoplay=1"), this.view.$element.addClass("ms-def-cursor"), this.moz && this.view.$element.css("perspective", "none"), this.view.swipeControl && this.view.swipeControl.disable(), this.slider.slideController.dispatchEvent(new MSSliderEvent(MSSliderEvent.VIDEO_PLAY)))
		}, p.__closeVideo = function () {
			if (this.vplayed) {
				this.vplayed = !1, this.roc && this.slider.api.resume();
				var that = this;
				CTween.fadeIn(this.vpbtn, 500), CTween.animate(this.vcbtn, 500, {
					opacity: 0
				}, {
					complete: function () {
						that.vcbtn.css("display", "none")
					}
				}), CTween.animate(this.vframe, 500, {
					opacity: 0
				}, {
					complete: function () {
						that.vframe.attr("src", "about:blank").css("display", "none")
					}
				}), this.moz && this.view.$element.css("perspective", ""), this.view.swipeControl && this.view.swipeControl.enable(), this.view.$element.removeClass("ms-def-cursor"), this.slider.slideController.dispatchEvent(new MSSliderEvent(MSSliderEvent.VIDEO_CLOSE))
			}
		}, p.create = function () {
			var that = this;
			this.hasLayers && this.layerController.create(), this.link && this.link.addClass("ms-slide-link").html("").click(function (e) {
				that.linkdis && e.preventDefault()
			}), this.video && (-1 === this.video.indexOf("?") && (this.video += "?"), this.vframe = $("<iframe></iframe>").addClass("ms-slide-video").css({
				width: "100%",
				height: "100%",
				display: "none"
			}).attr("src", "about:blank").attr("allowfullscreen", "true").appendTo(this.$element), this.vpbtn = $("<div></div>").addClass("ms-slide-vpbtn").click(function () {
				that.__playVideo()
			}).appendTo(this.$element), this.vcbtn = $("<div></div>").addClass("ms-slide-vcbtn").click(function () {
				that.__closeVideo()
			}).appendTo(this.$element).css("display", "none"), window._touch && this.vcbtn.removeClass("ms-slide-vcbtn").addClass("ms-slide-vcbtn-mobile").append('<div class="ms-vcbtn-txt">Close video</div>').appendTo(this.view.$element.parent())), !this.slider.options.autoHeight && this.hasBG && (this.$imgcont.css("height", "100%"), ("center" === this.fillMode || "stretch" === this.fillMode) && (this.fillMode = "fill")), this.slider.options.autoHeight && this.$element.addClass("ms-slide-auto-height"), this.sleep(!0)
		}, p.destroy = function () {
			this.hasLayers && (this.layerController.destroy(), this.layerController = null), this.$element.remove(), this.$element = null
		}, p.prepareToSelect = function () {
			this.pselected || this.selected || (this.pselected = !0, (this.link || this.video) && (this.view.addEventListener(MSViewEvents.SWIPE_START, this.onSwipeStart, this), this.view.addEventListener(MSViewEvents.SWIPE_MOVE, this.onSwipeMove, this), this.view.addEventListener(MSViewEvents.SWIPE_CANCEL, this.onSwipeCancel, this), this.linkdis = !1, this.swipeMoved = !1), this.loadImages(), this.hasLayers && this.layerController.prepareToShow(), this.ready && (this.bgvideo && this.bgvideo.play(), this.hasLayers && this.slider.options.instantStartLayers && this.layerController.showLayers()), this.moz && this.$element.css("margin-top", ""))
		}, p.select = function () {
			this.selected || (this.selected = !0, this.pselected = !1, this.$element.addClass("ms-sl-selected"), this.hasLayers && (this.slider.options.autoHeight && this.layerController.updateHeight(), this.slider.options.instantStartLayers || this.layerController.showLayers()), this.ready && this.bgvideo && this.bgvideo.play(), this.videoAutoPlay && (this.videodis = !1, this.vpbtn.trigger("click")))
		}, p.unselect = function () {
			this.pselected = !1, this.moz && this.$element.css("margin-top", "0.1px"), (this.link || this.video) && (this.view.removeEventListener(MSViewEvents.SWIPE_START, this.onSwipeStart, this), this.view.removeEventListener(MSViewEvents.SWIPE_MOVE, this.onSwipeMove, this), this.view.removeEventListener(MSViewEvents.SWIPE_CANCEL, this.onSwipeCancel, this)), this.bgvideo && (this.bgvideo.pause(), !this.autoPauseBgVid && this.vinit && (this.bgvideo.currentTime = 0)), this.hasLayers && this.layerController.hideLayers(), this.selected && (this.selected = !1, this.$element.removeClass("ms-sl-selected"), this.video && this.vplayed && (this.__closeVideo(), this.roc = !1))
		}, p.sleep = function (force) {
			(!this.isSleeping || force) && (this.isSleeping = !0, this.autoAppend && this.$element.detach(), this.hasLayers && this.layerController.onSlideSleep())
		}, p.wakeup = function () {
			this.isSleeping && (this.isSleeping = !1, this.autoAppend && this.view.$slideCont.append(this.$element), this.moz && this.$element.css("margin-top", "0.1px"), this.setupBG(), this.hasBG && this.bgAligner.align(), this.hasLayers && this.layerController.onSlideWakeup())
		}
	}(window, document, jQuery),
	function ($) {
		"use strict";
		var SliderViewList = {};
		window.MSSlideController = function (slider) {
			this._delayProgress = 0, this._timer = new averta.Timer(100), this._timer.onTimer = this.onTimer, this._timer.refrence = this, this.currentSlide = null, this.slider = slider, this.so = slider.options, averta.EventDispatcher.call(this)
		}, MSSlideController.registerView = function (name, _class) {
			if (name in SliderViewList) throw new Error(name + ", is already registered.");
			SliderViewList[name] = _class
		}, MSSlideController.SliderControlList = {}, MSSlideController.registerControl = function (name, _class) {
			if (name in MSSlideController.SliderControlList) throw new Error(name + ", is already registered.");
			MSSlideController.SliderControlList[name] = _class
		};
		var p = MSSlideController.prototype;
		p.setupView = function () {
			var that = this;
			this.resize_listener = function () {
				that.__resize()
			};
			var viewOptions = {
				spacing: this.so.space,
				mouseSwipe: this.so.mouse,
				loop: this.so.loop,
				autoHeight: this.so.autoHeight,
				swipe: this.so.swipe,
				speed: this.so.speed,
				dir: this.so.dir,
				viewNum: this.so.inView,
				critMargin: this.so.critMargin
			};
			this.so.viewOptions && $.extend(viewOptions, this.so.viewOptions), this.so.autoHeight && (this.so.heightLimit = !1);
			var viewClass = SliderViewList[this.slider.options.view] || MSBasicView;
			if (!viewClass._3dreq || window._css3d && !$.browser.msie || (viewClass = viewClass._fallback || MSBasicView), this.view = new viewClass(viewOptions), this.so.overPause) {
				var that = this;
				this.slider.$element.mouseenter(function () {
					that.is_over = !0, that._stopTimer()
				}).mouseleave(function () {
					that.is_over = !1, that._startTimer()
				})
			}
		}, p.onChangeStart = function () {
			this.change_started = !0, this.currentSlide && this.currentSlide.unselect(), this.currentSlide = this.view.currentSlide, this.currentSlide.prepareToSelect(), this.so.endPause && this.currentSlide.index === this.slider.slides.length - 1 && (this.pause(), this.skipTimer()), this.so.autoHeight && this.slider.setHeight(this.currentSlide.getHeight()), this.so.deepLink && this.__updateWindowHash(), this.dispatchEvent(new MSSliderEvent(MSSliderEvent.CHANGE_START))
		}, p.onChangeEnd = function () {
			if (this.change_started = !1, this._startTimer(), this.currentSlide.select(), this.so.preload > 1) {
				var loc, i, slide, l = this.so.preload - 1;
				for (i = 1; l >= i; ++i) {
					if (loc = this.view.index + i, loc >= this.view.slideList.length) {
						if (!this.so.loop) {
							i = l;
							continue
						}
						loc -= this.view.slideList.length
					}
					slide = this.view.slideList[loc], slide && slide.loadImages()
				}
				for (l > this.view.slideList.length / 2 && (l = Math.floor(this.view.slideList.length / 2)), i = 1; l >= i; ++i) {
					if (loc = this.view.index - i, 0 > loc) {
						if (!this.so.loop) {
							i = l;
							continue
						}
						loc = this.view.slideList.length + loc
					}
					slide = this.view.slideList[loc], slide && slide.loadImages()
				}
			}
			this.dispatchEvent(new MSSliderEvent(MSSliderEvent.CHANGE_END))
		}, p.onSwipeStart = function () {
			this.skipTimer()
		}, p.skipTimer = function () {
			this._timer.reset(), this._delayProgress = 0, this.dispatchEvent(new MSSliderEvent(MSSliderEvent.WAITING))
		}, p.onTimer = function () {
			if (this._timer.getTime() >= 1e3 * this.view.currentSlide.delay && (this.skipTimer(), this.view.next(), this.hideCalled = !1), this._delayProgress = this._timer.getTime() / (10 * this.view.currentSlide.delay), this.so.hideLayers && !this.hideCalled && 1e3 * this.view.currentSlide.delay - this._timer.getTime() <= 300) {
				var currentSlide = this.view.currentSlide;
				currentSlide.hasLayers && currentSlide.layerController.animHideLayers(), this.hideCalled = !0
			}
			this.dispatchEvent(new MSSliderEvent(MSSliderEvent.WAITING))
		}, p._stopTimer = function () {
			this._timer && this._timer.stop()
		}, p._startTimer = function () {
			this.paused || this.is_over || !this.currentSlide || !this.currentSlide.ready || this.change_started || this._timer.start()
		}, p.__appendSlides = function () {
			var slide, loc, i = 0,
				l = this.view.slideList.length - 1;
			for (i; l > i; ++i) slide = this.view.slideList[i], slide.detached || (slide.$element.detach(), slide.detached = !0);
			for (this.view.appendSlide(this.view.slideList[this.view.index]), l = 3, i = 1; l >= i; ++i) {
				if (loc = this.view.index + i, loc >= this.view.slideList.length) {
					if (!this.so.loop) {
						i = l;
						continue
					}
					loc -= this.view.slideList.length
				}
				slide = this.view.slideList[loc], slide.detached = !1, this.view.appendSlide(slide)
			}
			for (l > this.view.slideList.length / 2 && (l = Math.floor(this.view.slideList.length / 2)), i = 1; l >= i; ++i) {
				if (loc = this.view.index - i, 0 > loc) {
					if (!this.so.loop) {
						i = l;
						continue
					}
					loc = this.view.slideList.length + loc
				}
				slide = this.view.slideList[loc], slide.detached = !1, this.view.appendSlide(slide)
			}
		}, p.__resize = function (hard) {
			this.created && (this.width = this.slider.$element[0].clientWidth || this.so.width, this.so.fullwidth || (this.width = Math.min(this.width, this.so.width)), this.so.fullheight ? (this.so.heightLimit = !1, this.so.autoHeight = !1, this.height = this.slider.$element[0].clientHeight) : this.height = this.width / this.slider.aspect, this.so.autoHeight ? (this.currentSlide.setSize(this.width, null, hard), this.view.setSize(this.width, this.currentSlide.getHeight(), hard)) : this.view.setSize(this.width, Math.max(this.so.minHeight, this.so.heightLimit ? Math.min(this.height, this.so.height) : this.height), hard), this.slider.$controlsCont && this.so.centerControls && this.so.fullwidth && this.view.$element.css("left", Math.min(0, -(this.slider.$element[0].clientWidth - this.so.width) / 2) + "px"), this.dispatchEvent(new MSSliderEvent(MSSliderEvent.RESIZE)))
		}, p.__dispatchInit = function () {
			this.dispatchEvent(new MSSliderEvent(MSSliderEvent.INIT))
		}, p.__updateWindowHash = function () {
			var hash = window.location.hash,
				dl = this.so.deepLink,
				dlt = this.so.deepLinkType,
				eq = "path" === dlt ? "/" : "=",
				sep = "path" === dlt ? "/" : "&",
				sliderHash = dl + eq + (this.view.index + 1),
				regTest = new RegExp(dl + eq + "[0-9]+", "g");
			window.location.hash = "" === hash ? sep + sliderHash : regTest.test(hash) ? hash.replace(regTest, sliderHash) : hash + sep + sliderHash
		}, p.__curentSlideInHash = function () {
			var hash = window.location.hash,
				dl = this.so.deepLink,
				dlt = this.so.deepLinkType,
				eq = "path" === dlt ? "/" : "=",
				regTest = new RegExp(dl + eq + "[0-9]+", "g");
			if (regTest.test(hash)) {
				var index = Number(hash.match(regTest)[0].match(/[0-9]+/g).pop());
				if (!isNaN(index)) return index - 1
			}
			return -1
		}, p.__onHashChanged = function () {
			var index = this.__curentSlideInHash(); - 1 !== index && this.gotoSlide(index)
		}, p.setup = function () {
			this.created = !0, this.paused = !this.so.autoplay, this.view.addEventListener(MSViewEvents.CHANGE_START, this.onChangeStart, this), this.view.addEventListener(MSViewEvents.CHANGE_END, this.onChangeEnd, this), this.view.addEventListener(MSViewEvents.SWIPE_START, this.onSwipeStart, this), this.currentSlide = this.view.slideList[this.so.start - 1], this.__resize();
			var slideInHash = this.__curentSlideInHash(),
				startSlide = -1 !== slideInHash ? slideInHash : this.so.start - 1;
			if (this.view.create(startSlide), 0 === this.so.preload && this.view.slideList[0].loadImages(), this.scroller = this.view.controller, this.so.wheel) {
				var that = this,
					last_time = (new Date).getTime();
				this.wheellistener = function (event) {
					var e = window.event || event.orginalEvent || event;
					e.preventDefault();
					var current_time = (new Date).getTime();
					if (!(400 > current_time - last_time)) {
						last_time = current_time;
						var delta = Math.abs(e.detail || e.wheelDelta);
						$.browser.mozilla && (delta *= 100);
						var scrollThreshold = 15;
						return e.detail < 0 || e.wheelDelta > 0 ? delta >= scrollThreshold && that.previous(!0) : delta >= scrollThreshold && that.next(!0), !1
					}
				}, $.browser.mozilla ? this.slider.$element[0].addEventListener("DOMMouseScroll", this.wheellistener) : this.slider.$element.bind("mousewheel", this.wheellistener)
			}
			0 === this.slider.$element[0].clientWidth && (this.slider.init_safemode = !0), this.__resize();
			var that = this;
			this.so.deepLink && $(window).on("hashchange", function () {
				that.__onHashChanged()
			})
		}, p.index = function () {
			return this.view.index
		}, p.count = function () {
			return this.view.slidesCount
		}, p.next = function (checkLoop) {
			this.skipTimer(), this.view.next(checkLoop)
		}, p.previous = function (checkLoop) {
			this.skipTimer(), this.view.previous(checkLoop)
		}, p.gotoSlide = function (index) {
			index = Math.min(index, this.count() - 1), this.skipTimer(), this.view.gotoSlide(index)
		}, p.destroy = function (reset) {
			this.dispatchEvent(new MSSliderEvent(MSSliderEvent.DESTROY)), this.slider.destroy(reset)
		}, p._destroy = function () {
			this._timer.reset(), this._timer = null, $(window).unbind("resize", this.resize_listener), this.view.destroy(), this.view = null, this.so.wheel && ($.browser.mozilla ? this.slider.$element[0].removeEventListener("DOMMouseScroll", this.wheellistener) : this.slider.$element.unbind("mousewheel", this.wheellistener), this.wheellistener = null), this.so = null
		}, p.runAction = function (action) {
			var actionParams = [];
			if (-1 !== action.indexOf("(")) {
				var temp = action.slice(0, action.indexOf("("));
				actionParams = action.slice(action.indexOf("(") + 1, -1).replace(/\"|\'|\s/g, "").split(","), action = temp
			}
			action in this ? this[action].apply(this, actionParams) : console
		}, p.update = function (hard) {
			this.slider.init_safemode && hard && (this.slider.init_safemode = !1), this.__resize(hard), hard && this.dispatchEvent(new MSSliderEvent(MSSliderEvent.HARD_UPDATE))
		}, p.locate = function () {
			this.__resize()
		}, p.resume = function () {
			this.paused && (this.paused = !1, this._startTimer())
		}, p.pause = function () {
			this.paused || (this.paused = !0, this._stopTimer())
		}, p.currentTime = function () {
			return this._delayProgress
		}, averta.EventDispatcher.extend(p)
	}(jQuery),
	function ($) {
		"use strict";
		var LayerTypes = {
			image: MSImageLayerElement,
			text: MSLayerElement,
			video: MSVideoLayerElement,
			hotspot: MSHotspotLayer,
			button: MSButtonLayer
		};
		window.MasterSlider = function () {
			this.options = {
				forceInit: !0,
				autoplay: !1,
				loop: !1,
				mouse: !0,
				swipe: !0,
				grabCursor: !0,
				space: 0,
				fillMode: "fill",
				start: 1,
				view: "basic",
				width: 300,
				height: 150,
				inView: 15,
				critMargin: 1,
				heightLimit: !0,
				smoothHeight: !0,
				autoHeight: !1,
				minHeight: -1,
				fullwidth: !1,
				fullheight: !1,
				autofill: !1,
				layersMode: "center",
				hideLayers: !1,
				endPause: !1,
				centerControls: !0,
				overPause: !0,
				shuffle: !1,
				speed: 17,
				dir: "h",
				preload: 0,
				wheel: !1,
				layout: "boxed",
				autofillTarget: null,
				fullscreenMargin: 0,
				instantStartLayers: !1,
				parallaxMode: "mouse",
				rtl: !1,
				deepLink: null,
				deepLinkType: "path",
				disablePlugins: []
			}, this.slides = [], this.activePlugins = [], this.$element = null, this.lastMargin = 0, this.leftSpace = 0, this.topSpace = 0, this.rightSpace = 0, this.bottomSpace = 0, this._holdOn = 0;
			var that = this;
			this.resize_listener = function () {
				that._resize()
			}, $(window).bind("resize", this.resize_listener)
		}, MasterSlider.author = "Averta Ltd. (www.averta.net)", MasterSlider.version = "2.16.3", MasterSlider.releaseDate = "Dec 2015", MasterSlider._plugins = [];
		var MS = MasterSlider;
		MS.registerPlugin = function (plugin) {
			-1 === MS._plugins.indexOf(plugin) && MS._plugins.push(plugin)
		};
		var p = MasterSlider.prototype;
		p.__setupSlides = function () {
			var new_slide, that = this,
				ind = 0;
			this.$element.children(".ms-slide").each(function () {
				var $slide_ele = $(this);
				new_slide = new MSSlide, new_slide.$element = $slide_ele, new_slide.slider = that, new_slide.delay = void 0 !== $slide_ele.data("delay") ? $slide_ele.data("delay") : 3, new_slide.fillMode = void 0 !== $slide_ele.data("fill-mode") ? $slide_ele.data("fill-mode") : that.options.fillMode, new_slide.index = ind++;
				var slide_img = $slide_ele.children("img:not(.ms-layer)");
				slide_img.length > 0 && new_slide.setBG(slide_img[0]);
				var slide_video = $slide_ele.children("video");
				if (slide_video.length > 0 && new_slide.setBGVideo(slide_video), that.controls)
					for (var i = 0, l = that.controls.length; l > i; ++i) that.controls[i].slideAction(new_slide);
				$slide_ele.children("a").each(function () {
					var $this = $(this);
					"video" === this.getAttribute("data-type") ? (new_slide.video = this.getAttribute("href"), new_slide.videoAutoPlay = $this.data("autoplay"), $this.remove()) : $this.hasClass("ms-layer") || (new_slide.link = $(this))
				});
				that.__createSlideLayers(new_slide, $slide_ele.find(".ms-layer")), that.slides.push(new_slide), that.slideController.view.addSlide(new_slide)
			})
		}, p.__createSlideLayers = function (slide, layers) {
			0 != layers.length && (slide.setupLayerController(), layers.each(function (index, domEle) {
				var $parent_ele, $layer_element = $(this);
				"A" === domEle.nodeName && "image" === $layer_element.find(">img").data("type") && ($parent_ele = $(this), $layer_element = $parent_ele.find("img"));
				var layer = new(LayerTypes[$layer_element.data("type") || "text"]);
				layer.$element = $layer_element, layer.link = $parent_ele;
				var eff_parameters = {},
					end_eff_parameters = {};
				void 0 !== $layer_element.data("effect") && (eff_parameters.name = $layer_element.data("effect")), void 0 !== $layer_element.data("ease") && (eff_parameters.ease = $layer_element.data("ease")), void 0 !== $layer_element.data("duration") && (eff_parameters.duration = $layer_element.data("duration")), void 0 !== $layer_element.data("delay") && (eff_parameters.delay = $layer_element.data("delay")), $layer_element.data("hide-effect") && (end_eff_parameters.name = $layer_element.data("hide-effect")), $layer_element.data("hide-ease") && (end_eff_parameters.ease = $layer_element.data("hide-ease")), void 0 !== $layer_element.data("hide-duration") && (end_eff_parameters.duration = $layer_element.data("hide-duration")), void 0 !== $layer_element.data("hide-time") && (end_eff_parameters.time = $layer_element.data("hide-time")), layer.setStartAnim(eff_parameters), layer.setEndAnim(end_eff_parameters), slide.layerController.addLayer(layer)
			}))
		}, p._removeLoading = function () {
			$(window).unbind("resize", this.resize_listener), this.$element.removeClass("before-init").css("visibility", "visible").css("height", "").css("opacity", 0), CTween.fadeIn(this.$element), this.$loading.remove(), this.slideController && this.slideController.__resize()
		}, p._resize = function () {
			if (this.$loading) {
				var h = this.$loading[0].clientWidth / this.aspect;
				h = this.options.heightLimit ? Math.min(h, this.options.height) : h, this.$loading.height(h), this.$element.height(h)
			}
		}, p._shuffleSlides = function () {
			for (var r, slides = this.$element.children(".ms-slide"), i = 0, l = slides.length; l > i; ++i) r = Math.floor(Math.random() * (l - 1)), i != r && (this.$element[0].insertBefore(slides[i], slides[r]), slides = this.$element.children(".ms-slide"))
		}, p._setupSliderLayout = function () {
			this._updateSideMargins(), this.lastMargin = this.leftSpace;
			var lo = this.options.layout;
			"boxed" !== lo && "partialview" !== lo && (this.options.fullwidth = !0), ("fullscreen" === lo || "autofill" === lo) && (this.options.fullheight = !0, "autofill" === lo && (this.$autofillTarget = $(this.options.autofillTarget), 0 === this.$autofillTarget.length && (this.$autofillTarget = this.$element.parent()))), "partialview" === lo && this.$element.addClass("ms-layout-partialview"), ("fullscreen" === lo || "fullwidth" === lo || "autofill" === lo) && ($(window).bind("resize", {
				that: this
			}, this._updateLayout), this._updateLayout()), $(window).bind("resize", this.slideController.resize_listener)
		}, p._updateLayout = function (event) {
			var that = event ? event.data.that : this,
				lo = that.options.layout,
				$element = that.$element,
				$win = $(window);
			if ("fullscreen" === lo) document.body.style.overflow = "hidden", $element.height($win.height() - that.options.fullscreenMargin - that.topSpace - that.bottomSpace), document.body.style.overflow = "";
			else if ("autofill" === lo) return void $element.height(that.$autofillTarget.height() - that.options.fullscreenMargin - that.topSpace - that.bottomSpace).width(that.$autofillTarget.width() - that.leftSpace - that.rightSpace);
			$element.width($win.width() - that.leftSpace - that.rightSpace);
			var margin = -$element.offset().left + that.leftSpace + that.lastMargin;
			$element.css("margin-left", margin), that.lastMargin = margin
		}, p._init = function () {
			if (!(this._holdOn > 0) && this._docReady) {
				if (this.initialized = !0, "all" !== this.options.preload && this._removeLoading(), this.options.shuffle && this._shuffleSlides(), MSLayerEffects.setup(), this.slideController.setupView(), this.view = this.slideController.view, this.$controlsCont = $("<div></div>").addClass("ms-inner-controls-cont"), this.options.centerControls && this.$controlsCont.css("max-width", this.options.width + "px"), this.$controlsCont.prepend(this.view.$element), this.$msContainer = $("<div></div>").addClass("ms-container").prependTo(this.$element).append(this.$controlsCont), this.controls)
					for (var i = 0, l = this.controls.length; l > i; ++i) this.controls[i].setup();
				if (this._setupSliderLayout(), this.__setupSlides(), this.slideController.setup(), this.controls)
					for (i = 0, l = this.controls.length; l > i; ++i) this.controls[i].create();
				if (this.options.autoHeight && this.slideController.view.$element.height(this.slideController.currentSlide.getHeight()), this.options.swipe && !window._touch && this.options.grabCursor && this.options.mouse) {
					var $view = this.view.$element;
					$view.mousedown(function () {
						$view.removeClass("ms-grab-cursor"), $view.addClass("ms-grabbing-cursor"), $.browser.msie && window.ms_grabbing_curosr && ($view[0].style.cursor = "url(" + window.ms_grabbing_curosr + "), move")
					}).addClass("ms-grab-cursor"), $(document).mouseup(function () {
						$view.removeClass("ms-grabbing-cursor"), $view.addClass("ms-grab-cursor"), $.browser.msie && window.ms_grab_curosr && ($view[0].style.cursor = "url(" + window.ms_grab_curosr + "), move")
					})
				}
				this.slideController.__dispatchInit()
			}
		}, p.setHeight = function (value) {
			this.options.smoothHeight ? (this.htween && (this.htween.reset ? this.htween.reset() : this.htween.stop(!0)), this.htween = CTween.animate(this.slideController.view.$element, 500, {
				height: value
			}, {
				ease: "easeOutQuart"
			})) : this.slideController.view.$element.height(value)
		}, p.reserveSpace = function (side, space) {
			var sideSpace = side + "Space",
				pos = this[sideSpace];
			return this[sideSpace] += space, this._updateSideMargins(), pos
		}, p._updateSideMargins = function () {
			this.$element.css("margin", this.topSpace + "px " + this.rightSpace + "px " + this.bottomSpace + "px " + this.leftSpace + "px")
		}, p._realignControls = function () {
			this.rightSpace = this.leftSpace = this.topSpace = this.bottomSpace = 0, this._updateSideMargins(), this.api.dispatchEvent(new MSSliderEvent(MSSliderEvent.RESERVED_SPACE_CHANGE))
		}, p.control = function (control, options) {
			if (control in MSSlideController.SliderControlList) {
				this.controls || (this.controls = []);
				var ins = new MSSlideController.SliderControlList[control](options);
				return ins.slider = this, this.controls.push(ins), this
			}
		}, p.holdOn = function () {
			this._holdOn++
		}, p.release = function () {
			this._holdOn--, this._init()
		}, p.setup = function (target, options) {
			if (this.$element = "string" == typeof target ? $("#" + target) : target.eq(0), this.setupMarkup = this.$element.html(), 0 !== this.$element.length) {
				this.$element.addClass("master-slider").addClass("before-init"), $.browser.msie ? this.$element.addClass("ms-ie").addClass("ms-ie" + $.browser.version.slice(0, $.browser.version.indexOf("."))) : $.browser.webkit ? this.$element.addClass("ms-wk") : $.browser.mozilla && this.$element.addClass("ms-moz");
				var ua = navigator.userAgent.toLowerCase(),
					isAndroid = ua.indexOf("android") > -1;
				isAndroid && this.$element.addClass("ms-android");
				var that = this;
				$.extend(this.options, options), this.aspect = this.options.width / this.options.height, this.$loading = $("<div></div>").addClass("ms-loading-container").insertBefore(this.$element).append($("<div></div>").addClass("ms-loading")), this.$loading.parent().css("position", "relative"), this.options.autofill && (this.options.fullwidth = !0, this.options.fullheight = !0), this.options.fullheight && this.$element.addClass("ms-fullheight"), this._resize(), this.slideController = new MSSlideController(this), this.api = this.slideController;
				for (var i = 0, l = MS._plugins.length; i !== l; i++) {
					var plugin = MS._plugins[i]; - 1 === this.options.disablePlugins.indexOf(plugin.name) && this.activePlugins.push(new plugin(this))
				}
				return this.options.forceInit && MasterSlider.addJQReadyErrorCheck(this), $(document).ready(function () {
					that.initialize || (that._docReady = !0, that._init())
				}), this
			}
		}, p.destroy = function (insertMarkup) {
			for (var i = 0, l = this.activePlugins.length; i !== l; i++) this.activePlugins[i].destroy();
			if (this.controls)
				for (i = 0, l = this.controls.length; i !== l; i++) this.controls[i].destroy();
			this.slideController && this.slideController._destroy(), this.$loading && this.$loading.remove(), insertMarkup ? this.$element.html(this.setupMarkup).css("visibility", "hidden") : this.$element.remove();
			var lo = this.options.layout;
			("fullscreen" === lo || "fullwidth" === lo) && $(window).unbind("resize", this._updateLayout), this.view = null, this.slides = null, this.options = null, this.slideController = null, this.api = null, this.resize_listener = null, this.activePlugins = null
		}
	}(jQuery),
	function ($, window, document, undefined) {
		function MasterSliderPlugin(element, options) {
			this.element = element, this.$element = $(element), this.settings = $.extend({}, defaults, options), this._defaults = defaults, this._name = pluginName, this.init()
		}
		var pluginName = "masterslider",
			defaults = {
				controls: {}
			};
		$.extend(MasterSliderPlugin.prototype, {
			init: function () {
				var self = this;
				this._slider = new MasterSlider;
				for (var control in this.settings.controls) this._slider.control(control, this.settings.controls[control]);
				this._slider.setup(this.$element, this.settings);
				var _superDispatch = this._slider.api.dispatchEvent;
				this._slider.api.dispatchEvent = function (event) {
					self.$element.trigger(event.type), _superDispatch.call(this, event)
				}
			},
			api: function () {
				return this._slider.api
			},
			slider: function () {
				return this._slider
			}
		}), $.fn[pluginName] = function (options) {
			var args = arguments,
				plugin = "plugin_" + pluginName;
			if (options === undefined || "object" == typeof options) return this.each(function () {
				$.data(this, plugin) || $.data(this, plugin, new MasterSliderPlugin(this, options))
			});
			if ("string" == typeof options && "_" !== options[0] && "init" !== options) {
				var returns;
				return this.each(function () {
					var instance = $.data(this, plugin);
					instance instanceof MasterSliderPlugin && "function" == typeof instance[options] && (returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1))), instance instanceof MasterSliderPlugin && "function" == typeof instance._slider.api[options] && (returns = instance._slider.api[options].apply(instance._slider.api, Array.prototype.slice.call(args, 1))), "destroy" === options && $.data(this, plugin, null)
				}), returns !== undefined ? returns : this
			}
		}
	}(jQuery, window, document),
	function ($, window) {
		"use strict";
		var sliderInstances = [];
		MasterSlider.addJQReadyErrorCheck = function (slider) {
			sliderInstances.push(slider)
		};
		var _ready = $.fn.ready,
			_onerror = window.onerror;
		$.fn.ready = function () {
			window.onerror = function () {
				if (0 !== sliderInstances.length)
					for (var i = 0, l = sliderInstances.length; i !== l; i++) {
						var slider = sliderInstances[i];
						slider.initialized || (slider._docReady = !0, slider._init())
					}
				return _onerror ? _onerror.apply(this, arguments) : !1
			}, _ready.apply(this, arguments)
		}
	}(jQuery, window, document), window.MSViewEvents = function (type, data) {
		this.type = type, this.data = data
	}, MSViewEvents.SWIPE_START = "swipeStart", MSViewEvents.SWIPE_END = "swipeEnd", MSViewEvents.SWIPE_MOVE = "swipeMove", MSViewEvents.SWIPE_CANCEL = "swipeCancel", MSViewEvents.SCROLL = "scroll", MSViewEvents.CHANGE_START = "slideChangeStart", MSViewEvents.CHANGE_END = "slideChangeEnd",
	function ($) {
		"use strict";
		window.MSBasicView = function (options) {
			this.options = {
				loop: !1,
				dir: "h",
				autoHeight: !1,
				spacing: 5,
				mouseSwipe: !0,
				swipe: !0,
				speed: 17,
				minSlideSpeed: 2,
				viewNum: 20,
				critMargin: 1
			}, $.extend(this.options, options), this.dir = this.options.dir, this.loop = this.options.loop, this.spacing = this.options.spacing, this.__width = 0, this.__height = 0, this.__cssProb = "h" === this.dir ? "left" : "top", this.__offset = "h" === this.dir ? "offsetLeft" : "offsetTop", this.__dimension = "h" === this.dir ? "__width" : "__height", this.__translate_end = window._css3d ? " translateZ(0px)" : "", this.$slideCont = $("<div></div>").addClass("ms-slide-container"), this.$element = $("<div></div>").addClass("ms-view").addClass("ms-basic-view").append(this.$slideCont), this.currentSlide = null, this.index = -1, this.slidesCount = 0, this.slides = [], this.slideList = [], this.viewSlidesList = [], this.css3 = window._cssanim, this.start_buffer = 0, this.firstslide_snap = 0, this.slideChanged = !1, this.controller = new Controller(0, 0, {
				snapping: !0,
				snapsize: 100,
				paging: !0,
				snappingMinSpeed: this.options.minSlideSpeed,
				friction: (100 - .5 * this.options.speed) / 100,
				endless: this.loop
			}), this.controller.renderCallback("h" === this.dir ? this._horizUpdate : this._vertiUpdate, this), this.controller.snappingCallback(this.__snapUpdate, this), this.controller.snapCompleteCallback(this.__snapCompelet, this), averta.EventDispatcher.call(this)
		};
		var p = MSBasicView.prototype;
		p.__snapCompelet = function () {
			this.slideChanged && (this.slideChanged = !1, this.__locateSlides(), this.start_buffer = 0, this.dispatchEvent(new MSViewEvents(MSViewEvents.CHANGE_END)))
		}, p.__snapUpdate = function (controller, snap, change) {
			if (this.loop) {
				var target_index = this.index + change;
				this.updateLoop(target_index), target_index >= this.slidesCount && (target_index -= this.slidesCount), 0 > target_index && (target_index = this.slidesCount + target_index), this.index = target_index
			} else {
				if (0 > snap || snap >= this.slidesCount) return;
				this.index = snap
			}
			this._checkCritMargins(), $.browser.mozilla && (this.slideList[this.index].$element[0].style.marginTop = "0.1px", this.currentSlide && (this.currentSlide.$element[0].style.marginTop = ""));
			var new_slide = this.slideList[this.index];
			new_slide !== this.currentSlide && (this.currentSlide = new_slide, this.autoUpdateZIndex && this.__updateSlidesZindex(), this.slideChanged = !0, this.dispatchEvent(new MSViewEvents(MSViewEvents.CHANGE_START)))
		}, p._checkCritMargins = function () {
			if (!this.normalMode) {
				var hlf = Math.floor(this.options.viewNum / 2),
					inView = this.viewSlidesList.indexOf(this.slideList[this.index]),
					size = this[this.__dimension] + this.spacing,
					cm = this.options.critMargin;
				return this.loop ? void((cm >= inView || inView >= this.viewSlidesList.length - cm) && (size *= inView - hlf, this.__locateSlides(!1, size + this.start_buffer), this.start_buffer += size)) : void((cm > inView && this.index >= cm || inView >= this.viewSlidesList.length - cm && this.index < this.slidesCount - cm) && this.__locateSlides(!1))
			}
		}, p._vertiUpdate = function (controller, value) {
			return this.__contPos = value, this.dispatchEvent(new MSViewEvents(MSViewEvents.SCROLL)), this.css3 ? void(this.$slideCont[0].style[window._jcsspfx + "Transform"] = "translateY(" + -value + "px)" + this.__translate_end) : void(this.$slideCont[0].style.top = -value + "px")
		}, p._horizUpdate = function (controller, value) {
			return this.__contPos = value, this.dispatchEvent(new MSViewEvents(MSViewEvents.SCROLL)), this.css3 ? void(this.$slideCont[0].style[window._jcsspfx + "Transform"] = "translateX(" + -value + "px)" + this.__translate_end) : void(this.$slideCont[0].style.left = -value + "px")
		}, p.__updateViewList = function () {
			if (this.normalMode) return void(this.viewSlidesList = this.slides);
			var temp = this.viewSlidesList.slice();
			this.viewSlidesList = [];
			var l, i = 0,
				hlf = Math.floor(this.options.viewNum / 2);
			if (this.loop)
				for (; i !== this.options.viewNum; i++) this.viewSlidesList.push(this.slides[this.currentSlideLoc - hlf + i]);
			else {
				for (i = 0; i !== hlf && this.index - i !== -1; i++) this.viewSlidesList.unshift(this.slideList[this.index - i]);
				for (i = 1; i !== hlf && this.index + i !== this.slidesCount; i++) this.viewSlidesList.push(this.slideList[this.index + i])
			}
			for (i = 0, l = temp.length; i !== l; i++) - 1 === this.viewSlidesList.indexOf(temp[i]) && temp[i].sleep();
			temp = null, this.currentSlide && this.__updateSlidesZindex()
		}, p.__locateSlides = function (move, start) {
			this.__updateViewList(), start = this.loop ? start || 0 : this.slides.indexOf(this.viewSlidesList[0]) * (this[this.__dimension] + this.spacing);
			for (var slide, l = this.viewSlidesList.length, i = 0; i !== l; i++) {
				var pos = start + i * (this[this.__dimension] + this.spacing);
				slide = this.viewSlidesList[i], slide.wakeup(), slide.position = pos, slide.$element[0].style[this.__cssProb] = pos + "px"
			}
			move !== !1 && this.controller.changeTo(this.slideList[this.index].position, !1, null, null, !1)
		}, p.__createLoopList = function () {
			var return_arr = [],
				i = 0,
				count = this.slidesCount / 2,
				before_count = this.slidesCount % 2 === 0 ? count - 1 : Math.floor(count),
				after_count = this.slidesCount % 2 === 0 ? count : Math.floor(count);
			for (this.currentSlideLoc = before_count, i = 1; before_count >= i; ++i) return_arr.unshift(this.slideList[this.index - i < 0 ? this.slidesCount - i + this.index : this.index - i]);
			for (return_arr.push(this.slideList[this.index]), i = 1; after_count >= i; ++i) return_arr.push(this.slideList[this.index + i >= this.slidesCount ? this.index + i - this.slidesCount : this.index + i]);
			return return_arr
		}, p.__getSteps = function (index, target) {
			var right = index > target ? this.slidesCount - index + target : target - index,
				left = Math.abs(this.slidesCount - right);
			return left > right ? right : -left
		}, p.__pushEnd = function () {
			var first_slide = this.slides.shift(),
				last_slide = this.slides[this.slidesCount - 2];
			if (this.slides.push(first_slide), this.normalMode) {
				var pos = last_slide.$element[0][this.__offset] + this.spacing + this[this.__dimension];
				first_slide.$element[0].style[this.__cssProb] = pos + "px", first_slide.position = pos
			}
		}, p.__pushStart = function () {
			var last_slide = this.slides.pop(),
				first_slide = this.slides[0];
			if (this.slides.unshift(last_slide), this.normalMode) {
				var pos = first_slide.$element[0][this.__offset] - this.spacing - this[this.__dimension];
				last_slide.$element[0].style[this.__cssProb] = pos + "px", last_slide.position = pos
			}
		}, p.__updateSlidesZindex = function () {
			{
				var slide, l = this.viewSlidesList.length;
				Math.floor(l / 2)
			}
			if (this.loop)
				for (var loc = this.viewSlidesList.indexOf(this.currentSlide), i = 0; i !== l; i++) slide = this.viewSlidesList[i], this.viewSlidesList[i].$element.css("z-index", loc >= i ? i + 1 : l - i);
			else {
				for (var beforeNum = this.currentSlide.index - this.viewSlidesList[0].index, i = 0; i !== l; i++) this.viewSlidesList[i].$element.css("z-index", beforeNum >= i ? i + 1 : l - i);
				this.currentSlide.$element.css("z-index", l)
			}
		}, p.addSlide = function (slide) {
			slide.view = this, this.slides.push(slide), this.slideList.push(slide), this.slidesCount++
		}, p.appendSlide = function (slide) {
			this.$slideCont.append(slide.$element)
		}, p.updateLoop = function (index) {
			if (this.loop)
				for (var steps = this.__getSteps(this.index, index), i = 0, l = Math.abs(steps); l > i; ++i) 0 > steps ? this.__pushStart() : this.__pushEnd()
		}, p.gotoSlide = function (index, fast) {
			this.updateLoop(index), this.index = index;
			var target_slide = this.slideList[index];
			this._checkCritMargins(), this.controller.changeTo(target_slide.position, !fast, null, null, !1), target_slide !== this.currentSlide && (this.slideChanged = !0, this.currentSlide = target_slide, this.autoUpdateZIndex && this.__updateSlidesZindex(), this.dispatchEvent(new MSViewEvents(MSViewEvents.CHANGE_START)), fast && this.dispatchEvent(new MSViewEvents(MSViewEvents.CHANGE_END)))
		}, p.next = function (checkLoop) {
			return checkLoop && !this.loop && this.index + 1 >= this.slidesCount ? void this.controller.bounce(10) : void this.gotoSlide(this.index + 1 >= this.slidesCount ? 0 : this.index + 1)
		}, p.previous = function (checkLoop) {
			return checkLoop && !this.loop && this.index - 1 < 0 ? void this.controller.bounce(-10) : void this.gotoSlide(this.index - 1 < 0 ? this.slidesCount - 1 : this.index - 1)
		}, p.setupSwipe = function () {
			this.swipeControl = new averta.TouchSwipe(this.$element), this.swipeControl.swipeType = "h" === this.dir ? "horizontal" : "vertical";
			var that = this;
			this.swipeControl.onSwipe = "h" === this.dir ? function (status) {
				that.horizSwipeMove(status)
			} : function (status) {
				that.vertSwipeMove(status)
			}
		}, p.vertSwipeMove = function (status) {
			var phase = status.phase;
			if ("start" === phase) this.controller.stop(), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_START, status));
			else if ("move" === phase && (!this.loop || Math.abs(this.currentSlide.position - this.controller.value + status.moveY) < this.cont_size / 2)) this.controller.drag(status.moveY), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_MOVE, status));
			else if ("end" === phase || "cancel" === phase) {
				var speed = status.distanceY / status.duration * 50 / 3,
					speedh = Math.abs(status.distanceY / status.duration * 50 / 3);
				Math.abs(speed) > .1 && Math.abs(speed) >= speedh ? (this.controller.push(-speed), speed > this.controller.options.snappingMinSpeed && this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_END, status))) : (this.controller.cancel(), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_CANCEL, status)))
			}
		}, p.horizSwipeMove = function (status) {
			var phase = status.phase;
			if ("start" === phase) this.controller.stop(), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_START, status));
			else if ("move" === phase && (!this.loop || Math.abs(this.currentSlide.position - this.controller.value + status.moveX) < this.cont_size / 2)) this.controller.drag(status.moveX), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_MOVE, status));
			else if ("end" === phase || "cancel" === phase) {
				var speed = status.distanceX / status.duration * 50 / 3,
					speedv = Math.abs(status.distanceY / status.duration * 50 / 3);
				Math.abs(speed) > .1 && Math.abs(speed) >= speedv ? (this.controller.push(-speed), speed > this.controller.options.snappingMinSpeed && this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_END, status))) : (this.controller.cancel(), this.dispatchEvent(new MSViewEvents(MSViewEvents.SWIPE_CANCEL, status)))
			}
		}, p.setSize = function (width, height, hard) {
			if (this.lastWidth !== width || height !== this.lastHeight || hard) {
				this.$element.width(width).height(height);
				for (var i = 0; i < this.slidesCount; ++i) this.slides[i].setSize(width, height, hard);
				this.__width = width, this.__height = height, this.__created && (this.__locateSlides(), this.cont_size = (this.slidesCount - 1) * (this[this.__dimension] + this.spacing), this.loop || (this.controller._max_value = this.cont_size), this.controller.options.snapsize = this[this.__dimension] + this.spacing, this.controller.changeTo(this.currentSlide.position, !1, null, null, !1), this.controller.cancel(), this.lastWidth = width, this.lastHeight = height)
			}
		}, p.create = function (index) {
			this.__created = !0, this.index = Math.min(index || 0, this.slidesCount - 1), this.lastSnap = this.index, this.loop && (this.slides = this.__createLoopList()), this.normalMode = this.slidesCount <= this.options.viewNum;
			for (var i = 0; i < this.slidesCount; ++i) this.slides[i].create();
			this.__locateSlides(), this.controller.options.snapsize = this[this.__dimension] + this.spacing, this.loop || (this.controller._max_value = (this.slidesCount - 1) * (this[this.__dimension] + this.spacing)), this.gotoSlide(this.index, !0), this.options.swipe && (window._touch || this.options.mouseSwipe) && this.setupSwipe()
		}, p.destroy = function () {
			if (this.__created) {
				for (var i = 0; i < this.slidesCount; ++i) this.slides[i].destroy();
				this.slides = null, this.slideList = null, this.$element.remove(), this.controller.destroy(), this.controller = null
			}
		}, averta.EventDispatcher.extend(p), MSSlideController.registerView("basic", MSBasicView)
	}(jQuery),
	function () {
		"use strict";
		window.MSWaveView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-wave-view"), this.$slideCont.css(window._csspfx + "transform-style", "preserve-3d"), this.autoUpdateZIndex = !0
		}, MSWaveView.extend(MSBasicView), MSWaveView._3dreq = !0, MSWaveView._fallback = MSBasicView;
		var p = MSWaveView.prototype,
			_super = MSBasicView.prototype;
		p._horizUpdate = function (controller, value) {
			_super._horizUpdate.call(this, controller, value);
			for (var slide, distance, cont_scroll = -value, i = 0; i < this.slidesCount; ++i) slide = this.slideList[i], distance = -cont_scroll - slide.position, this.__updateSlidesHoriz(slide, distance)
		}, p._vertiUpdate = function (controller, value) {
			_super._vertiUpdate.call(this, controller, value);
			for (var slide, distance, cont_scroll = -value, i = 0; i < this.slidesCount; ++i) slide = this.slideList[i], distance = -cont_scroll - slide.position, this.__updateSlidesVertic(slide, distance)
		}, p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			slide.$element.css(window._csspfx + "transform", "translateZ(" + 3 * -value + "px) rotateY(0.01deg)")
		}, p.__updateSlidesVertic = function (slide, distance) {
			this.__updateSlidesHoriz(slide, distance)
		}, MSSlideController.registerView("wave", MSWaveView)
	}(jQuery),
	function () {
		window.MSFadeBasicView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-fade-basic-view")
		}, MSFadeBasicView.extend(MSWaveView); {
			var p = MSFadeBasicView.prototype;
			MSFadeBasicView.prototype
		}
		p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(.6 * distance / this.__width);
			value = 1 - Math.min(value, .6), slide.$element.css("opacity", value)
		}, p.__updateSlidesVertic = function (slide, distance) {
			this.__updateSlidesHoriz(slide, distance)
		}, MSSlideController.registerView("fadeBasic", MSFadeBasicView), MSWaveView._fallback = MSFadeBasicView
	}(),
	function () {
		window.MSFadeWaveView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-fade-wave-view")
		}, MSFadeWaveView.extend(MSWaveView), MSFadeWaveView._3dreq = !0, MSFadeWaveView._fallback = MSFadeBasicView; {
			var p = MSFadeWaveView.prototype;
			MSWaveView.prototype
		}
		p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			value = Math.min(value, 100), slide.$element.css("opacity", 1 - value / 300), slide.$element[0].style[window._jcsspfx + "Transform"] = "scale(" + (1 - value / 800) + ") rotateY(0.01deg) "
		}, p.__updateSlidesVertic = function (slide, distance) {
			this.__updateSlidesHoriz(slide, distance)
		}, MSSlideController.registerView("fadeWave", MSFadeWaveView)
	}(),
	function () {
		"use strict";
		window.MSFlowView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-flow-view")
		}, MSFlowView.extend(MSWaveView), MSFlowView._3dreq = !0, MSFlowView._fallback = MSFadeBasicView; {
			var p = MSFlowView.prototype;
			MSWaveView.prototype
		}
		p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width),
				rvalue = Math.min(.3 * value, 30) * (0 > distance ? -1 : 1),
				zvalue = 1.2 * value;
			slide.$element[0].style[window._jcsspfx + "Transform"] = "translateZ(" + 5 * -zvalue + "px) rotateY(" + rvalue + "deg) "
		}, p.__updateSlidesVertic = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width),
				rvalue = Math.min(.3 * value, 30) * (0 > distance ? -1 : 1),
				zvalue = 1.2 * value;
			slide.$element[0].style[window._jcsspfx + "Transform"] = "translateZ(" + 5 * -zvalue + "px) rotateX(" + -rvalue + "deg) "
		}, MSSlideController.registerView("flow", MSFlowView)
	}(jQuery),
	function () {
		window.MSFadeFlowView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-fade-flow-view")
		}, MSFadeFlowView.extend(MSWaveView), MSFadeFlowView._3dreq = !0; {
			var p = MSFadeFlowView.prototype;
			MSWaveView.prototype
		}
		p.__calculate = function (distance) {
			var value = Math.min(Math.abs(100 * distance / this.__width), 100),
				rvalue = Math.min(.5 * value, 50) * (0 > distance ? -1 : 1);
			return {
				value: value,
				rvalue: rvalue
			}
		}, p.__updateSlidesHoriz = function (slide, distance) {
			var clc = this.__calculate(distance);
			slide.$element.css("opacity", 1 - clc.value / 300), slide.$element[0].style[window._jcsspfx + "Transform"] = "translateZ(" + -clc.value + "px) rotateY(" + clc.rvalue + "deg) "
		}, p.__updateSlidesVertic = function (slide, distance) {
			var clc = this.__calculate(distance);
			slide.$element.css("opacity", 1 - clc.value / 300), slide.$element[0].style[window._jcsspfx + "Transform"] = "translateZ(" + -clc.value + "px) rotateX(" + -clc.rvalue + "deg) "
		}, MSSlideController.registerView("fadeFlow", MSFadeFlowView)
	}(),
	function ($) {
		"use strict";
		window.MSMaskView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-mask-view")
		}, MSMaskView.extend(MSBasicView);
		var p = MSMaskView.prototype,
			_super = MSBasicView.prototype;
		p.addSlide = function (slide) {
			slide.view = this, slide.$frame = $("<div></div>").addClass("ms-mask-frame").append(slide.$element), slide.$element[0].style.position = "relative", slide.autoAppend = !1, this.slides.push(slide), this.slideList.push(slide), this.slidesCount++
		}, p.setSize = function (width, height) {
			for (var slider = this.slides[0].slider, i = 0; i < this.slidesCount; ++i) this.slides[i].$frame[0].style.width = width + "px", slider.options.autoHeight || (this.slides[i].$frame[0].style.height = height + "px");
			_super.setSize.call(this, width, height)
		}, p._horizUpdate = function (controller, value) {
			_super._horizUpdate.call(this, controller, value);
			var i = 0;
			if (this.css3)
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style[window._jcsspfx + "Transform"] = "translateX(" + (value - this.slideList[i].position) + "px)" + this.__translate_end;
			else
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style.left = value - this.slideList[i].position + "px"
		}, p._vertiUpdate = function (controller, value) {
			_super._vertiUpdate.call(this, controller, value);
			var i = 0;
			if (this.css3)
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style[window._jcsspfx + "Transform"] = "translateY(" + (value - this.slideList[i].position) + "px)" + this.__translate_end;
			else
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style.top = value - this.slideList[i].position + "px"
		}, p.__pushEnd = function () {
			var first_slide = this.slides.shift(),
				last_slide = this.slides[this.slidesCount - 2];
			if (this.slides.push(first_slide), this.normalMode) {
				var pos = last_slide.$frame[0][this.__offset] + this.spacing + this[this.__dimension];
				first_slide.$frame[0].style[this.__cssProb] = pos + "px", first_slide.position = pos
			}
		}, p.__pushStart = function () {
			var last_slide = this.slides.pop(),
				first_slide = this.slides[0];
			if (this.slides.unshift(last_slide), this.normalMode) {
				var pos = first_slide.$frame[0][this.__offset] - this.spacing - this[this.__dimension];
				last_slide.$frame[0].style[this.__cssProb] = pos + "px", last_slide.position = pos
			}
		}, p.__updateViewList = function () {
			if (this.normalMode) return void(this.viewSlidesList = this.slides);
			var temp = this.viewSlidesList.slice();
			this.viewSlidesList = [];
			var l, i = 0,
				hlf = Math.floor(this.options.viewNum / 2);
			if (this.loop)
				for (; i !== this.options.viewNum; i++) this.viewSlidesList.push(this.slides[this.currentSlideLoc - hlf + i]);
			else {
				for (i = 0; i !== hlf && this.index - i !== -1; i++) this.viewSlidesList.unshift(this.slideList[this.index - i]);
				for (i = 1; i !== hlf && this.index + i !== this.slidesCount; i++) this.viewSlidesList.push(this.slideList[this.index + i])
			}
			for (i = 0, l = temp.length; i !== l; i++) - 1 === this.viewSlidesList.indexOf(temp[i]) && (temp[i].sleep(), temp[i].$frame.detach());
			temp = null
		}, p.__locateSlides = function (move, start) {
			this.__updateViewList(), start = this.loop ? start || 0 : this.slides.indexOf(this.viewSlidesList[0]) * (this[this.__dimension] + this.spacing);
			for (var slide, l = this.viewSlidesList.length, i = 0; i !== l; i++) {
				var pos = start + i * (this[this.__dimension] + this.spacing);
				if (slide = this.viewSlidesList[i], this.$slideCont.append(slide.$frame), slide.wakeup(!1), slide.position = pos, slide.selected && slide.bgvideo) try {
					slide.bgvideo.play()
				} catch (e) {}
				slide.$frame[0].style[this.__cssProb] = pos + "px"
			}
			move !== !1 && this.controller.changeTo(this.slideList[this.index].position, !1, null, null, !1)
		}, MSSlideController.registerView("mask", MSMaskView)
	}(jQuery),
	function () {
		"use strict";
		window.MSParallaxMaskView = function (options) {
			MSMaskView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-parallax-mask-view")
		}, MSParallaxMaskView.extend(MSMaskView), MSParallaxMaskView.parallaxAmount = .5;
		var p = MSParallaxMaskView.prototype,
			_super = MSBasicView.prototype;
		p._horizUpdate = function (controller, value) {
			_super._horizUpdate.call(this, controller, value);
			var i = 0;
			if (this.css3)
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style[window._jcsspfx + "Transform"] = "translateX(" + (value - this.slideList[i].position) * MSParallaxMaskView.parallaxAmount + "px)" + this.__translate_end;
			else
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style.left = (value - this.slideList[i].position) * MSParallaxMaskView.parallaxAmount + "px"
		}, p._vertiUpdate = function (controller, value) {
			_super._vertiUpdate.call(this, controller, value);
			var i = 0;
			if (this.css3)
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style[window._jcsspfx + "Transform"] = "translateY(" + (value - this.slideList[i].position) * MSParallaxMaskView.parallaxAmount + "px)" + this.__translate_end;
			else
				for (i = 0; i < this.slidesCount; ++i) this.slideList[i].$element[0].style.top = (value - this.slideList[i].position) * MSParallaxMaskView.parallaxAmount + "px"
		}, MSSlideController.registerView("parallaxMask", MSParallaxMaskView)
	}(jQuery),
	function () {
		"use strict";
		window.MSFadeView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-fade-view"), this.controller.renderCallback(this.__update, this)
		}, MSFadeView.extend(MSBasicView);
		var p = MSFadeView.prototype,
			_super = MSBasicView.prototype;
		p.__update = function (controller, value) {
			for (var slide, distance, cont_scroll = -value, i = 0; i < this.slidesCount; ++i) slide = this.slideList[i], distance = -cont_scroll - slide.position, this.__updateSlides(slide, distance)
		}, p.__updateSlides = function (slide, distance) {
			var value = Math.abs(distance / this[this.__dimension]);
			0 >= 1 - value ? slide.$element.fadeTo(0, 0).css("visibility", "hidden") : slide.$element.fadeTo(0, 1 - value).css("visibility", "")
		}, p.__locateSlides = function (move, start) {
			this.__updateViewList(), start = this.loop ? start || 0 : this.slides.indexOf(this.viewSlidesList[0]) * (this[this.__dimension] + this.spacing);
			for (var slide, l = this.viewSlidesList.length, i = 0; i !== l; i++) {
				var pos = start + i * this[this.__dimension];
				slide = this.viewSlidesList[i], slide.wakeup(), slide.position = pos
			}
			move !== !1 && this.controller.changeTo(this.slideList[this.index].position, !1, null, null, !1)
		}, p.__pushEnd = function () {
			var first_slide = this.slides.shift(),
				last_slide = this.slides[this.slidesCount - 2];
			this.slides.push(first_slide), first_slide.position = last_slide.position + this[this.__dimension]
		}, p.__pushStart = function () {
			var last_slide = this.slides.pop(),
				first_slide = this.slides[0];
			this.slides.unshift(last_slide), last_slide.position = first_slide.position - this[this.__dimension]
		}, p.create = function (index) {
			_super.create.call(this, index), this.spacing = 0, this.controller.options.minValidDist = 10
		}, MSSlideController.registerView("fade", MSFadeView)
	}(jQuery),
	function () {
		"use strict";
		window.MSScaleView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-scale-view"), this.controller.renderCallback(this.__update, this)
		}, MSScaleView.extend(MSFadeView);
		var p = MSScaleView.prototype,
			_super = MSFadeView.prototype;
		p.__updateSlides = function (slide, distance) {
			var value = Math.abs(distance / this[this.__dimension]),
				element = slide.$element[0];
			0 >= 1 - value ? (element.style.opacity = 0, element.style.visibility = "hidden", element.style[window._jcsspfx + "Transform"] = "") : (element.style.opacity = 1 - value, element.style.visibility = "", element.style[window._jcsspfx + "Transform"] = "perspective(2000px) translateZ(" + value * (0 > distance ? -.5 : .5) * 300 + "px)")
		}, p.create = function (index) {
			_super.create.call(this, index), this.controller.options.minValidDist = .03
		}, MSSlideController.registerView("scale", MSScaleView)
	}(jQuery),
	function () {
		"use strict";
		window.MSStackView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-stack-view"), this.controller.renderCallback(this.__update, this), this.autoUpdateZIndex = !0
		}, MSStackView.extend(MSFadeView), MSStackView._3dreq = !0, MSStackView._fallback = MSFadeView;
		var p = MSStackView.prototype,
			_super = MSFadeView.prototype;
		p.__updateSlidesZindex = function () {
			for (var slide, l = this.viewSlidesList.length, i = 0; i !== l; i++) slide = this.viewSlidesList[i], this.viewSlidesList[i].$element.css("z-index", l - i)
		}, p.__updateSlides = function (slide, distance) {
			var value = Math.abs(distance / this[this.__dimension]),
				element = slide.$element[0];
			0 >= 1 - value ? (element.style.opacity = 1, element.style.visibility = "hidden", element.style[window._jcsspfx + "Transform"] = "") : (element.style.visibility = "", element.style[window._jcsspfx + "Transform"] = 0 > distance ? "perspective(2000px) translateZ(" + -300 * value + "px)" : this.__translate + "(" + -value * this[this.__dimension] + "px)")
		}, p.create = function (index) {
			_super.create.call(this, index), this.controller.options.minValidDist = .03, this.__translate = "h" === this.dir ? "translateX" : "translateY"
		}, MSSlideController.registerView("stack", MSStackView)
	}(jQuery),
	function () {
		"use strict";
		var perspective = 2e3;
		window.MSFocusView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-focus-view"), this.options.centerSpace = this.options.centerSpace || 1
		}, MSFocusView.extend(MSWaveView), MSFocusView._3dreq = !0, MSFocusView._fallback = MSFadeBasicView; {
			var p = MSFocusView.prototype;
			MSWaveView.prototype
		}
		p.__calcview = function (z, w) {
			var a = w / 2 * z / (z + perspective);
			return a * (z + perspective) / perspective
		}, p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			value = 15 * -Math.min(value, 100), slide.$element.css(window._csspfx + "transform", "translateZ(" + (value + 1) + "px) rotateY(0.01deg) translateX(" + (0 > distance ? 1 : -1) * -this.__calcview(value, this.__width) * this.options.centerSpace + "px)")
		}, p.__updateSlidesVertic = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			value = 15 * -Math.min(value, 100), slide.$element.css(window._csspfx + "transform", "translateZ(" + (value + 1) + "px) rotateY(0.01deg) translateY(" + (0 > distance ? 1 : -1) * -this.__calcview(value, this.__width) * this.options.centerSpace + "px)")
		}, MSSlideController.registerView("focus", MSFocusView)
	}(),
	function () {
		window.MSPartialWaveView = function (options) {
			MSWaveView.call(this, options), this.$element.removeClass("ms-wave-view").addClass("ms-partial-wave-view")
		}, MSPartialWaveView.extend(MSWaveView), MSPartialWaveView._3dreq = !0, MSPartialWaveView._fallback = MSFadeBasicView; {
			var p = MSPartialWaveView.prototype;
			MSWaveView.prototype
		}
		p.__updateSlidesHoriz = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			slide.hasBG && slide.$bg_img.css("opacity", (100 - Math.abs(120 * distance / this.__width / 3)) / 100), slide.$element.css(window._csspfx + "transform", "translateZ(" + 3 * -value + "px) rotateY(0.01deg) translateX(" + .75 * distance + "px)")
		}, p.__updateSlidesVertic = function (slide, distance) {
			var value = Math.abs(100 * distance / this.__width);
			slide.hasBG && slide.$bg_img.css("opacity", (100 - Math.abs(120 * distance / this.__width / 3)) / 100), slide.$element.css(window._csspfx + "transform", "translateZ(" + 3 * -value + "px) rotateY(0.01deg) translateY(" + .75 * distance + "px)")
		}, MSSlideController.registerView("partialWave", MSPartialWaveView)
	}(),
	function () {
		"use strict";
		window.MSBoxView = function (options) {
			MSBasicView.call(this, options), this.$element.removeClass("ms-basic-view").addClass("ms-box-view"), this.controller.renderCallback(this.__update, this)
		}, MSBoxView.extend(MSFadeView), MSBoxView._3dreq = !0;
		var p = MSBoxView.prototype,
			_super = MSFadeView.prototype;
		p.__updateSlides = function (slide, distance) {
			var value = Math.abs(distance / this[this.__dimension]),
				element = slide.$element[0];
			0 >= 1 - value ? (element.style.visibility = "hidden", element.style[window._jcsspfx + "Transform"] = "") : (element.style.visibility = "", element.style[window._jcsspfx + "Transform"] = "rotate" + this._rotateDir + "(" + value * (0 > distance ? 1 : -1) * 90 * this._calcFactor + "deg)", element.style[window._jcsspfx + "TransformOrigin"] = "50% 50% -" + slide[this.__dimension] / 2 + "px", element.style.zIndex = Math.ceil(2 * (1 - value)))
		}, p.create = function (index) {
			_super.create.call(this, index), this.controller.options.minValidDist = .03, this._rotateDir = "h" === this.options.dir ? "Y" : "X", this._calcFactor = "h" === this.options.dir ? 1 : -1
		}, MSSlideController.registerView("box", MSBoxView)
	}(jQuery),
	function ($) {
		"use strict";
		var BaseControl = function () {
				this.options = {
					prefix: "ms-",
					autohide: !0,
					overVideo: !0,
					customClass: null
				}
			},
			p = BaseControl.prototype;
		p.slideAction = function () {}, p.setup = function () {
			this.cont = this.options.insertTo ? $(this.options.insertTo) : this.slider.$controlsCont, this.options.overVideo || this._hideOnvideoStarts()
		}, p.checkHideUnder = function () {
			this.options.hideUnder && (this.needsRealign = !this.options.insetTo && ("left" === this.options.align || "right" === this.options.align) && this.options.inset === !1, $(window).bind("resize", {
				that: this
			}, this.onResize), this.onResize())
		}, p.onResize = function (event) {
			var that = event && event.data.that || this,
				w = window.innerWidth;
			w <= that.options.hideUnder && !that.detached ? (that.hide(!0), that.detached = !0, that.onDetach()) : w >= that.options.hideUnder && that.detached && (that.detached = !1, that.visible(), that.onAppend())
		}, p.create = function () {
			this.options.autohide && (this.hide(!0), this.slider.$controlsCont.mouseenter($.proxy(this._onMouseEnter, this)).mouseleave($.proxy(this._onMouseLeave, this)).mousedown($.proxy(this._onMouseDown, this)), this.$element && this.$element.mouseenter($.proxy(this._onMouseEnter, this)).mouseleave($.proxy(this._onMouseLeave, this)).mousedown($.proxy(this._onMouseDown, this)), $(document).mouseup($.proxy(this._onMouseUp, this))), this.options.align && this.$element.addClass("ms-align-" + this.options.align), this.options.customClass && this.$element && this.$element.addClass(this.options.customClass)
		}, p._onMouseEnter = function () {
			this._disableAH || this.mdown || this.visible(), this.mleave = !1
		}, p._onMouseLeave = function () {
			this.mdown || this.hide(), this.mleave = !0
		}, p._onMouseDown = function () {
			this.mdown = !0
		}, p._onMouseUp = function () {
			this.mdown && this.mleave && this.hide(), this.mdown = !1
		}, p.onAppend = function () {
			this.needsRealign && this.slider._realignControls()
		}, p.onDetach = function () {
			this.needsRealign && this.slider._realignControls()
		}, p._hideOnvideoStarts = function () {
			var that = this;
			this.slider.api.addEventListener(MSSliderEvent.VIDEO_PLAY, function () {
				that._disableAH = !0, that.hide()
			}), this.slider.api.addEventListener(MSSliderEvent.VIDEO_CLOSE, function () {
				that._disableAH = !1, that.visible()
			})
		}, p.hide = function (fast) {
			if (fast) this.$element.css("opacity", 0), this.$element.css("display", "none");
			else {
				clearTimeout(this.hideTo);
				var $element = this.$element;
				this.hideTo = setTimeout(function () {
					CTween.fadeOut($element, 400, !1)
				}, 20)
			}
			this.$element.addClass("ms-ctrl-hide")
		}, p.visible = function () {
			this.detached || (clearTimeout(this.hideTo), this.$element.css("display", ""), CTween.fadeIn(this.$element, 400, !1), this.$element.removeClass("ms-ctrl-hide"))
		}, p.destroy = function () {
			this.options && this.options.hideUnder && $(window).unbind("resize", this.onResize)
		}, window.BaseControl = BaseControl
	}(jQuery),
	function ($) {
		"use strict";
		var MSArrows = function (options) {
			BaseControl.call(this), $.extend(this.options, options)
		};
		MSArrows.extend(BaseControl);
		var p = MSArrows.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			var that = this;
			this.$next = $("<div></div>").addClass(this.options.prefix + "nav-next").bind("click", function () {
				that.slider.api.next(!0)
			}), this.$prev = $("<div></div>").addClass(this.options.prefix + "nav-prev").bind("click", function () {
				that.slider.api.previous(!0)
			}), _super.setup.call(this), this.cont.append(this.$next), this.cont.append(this.$prev), this.checkHideUnder()
		}, p.hide = function (fast) {
			return fast ? (this.$prev.css("opacity", 0).css("display", "none"), void this.$next.css("opacity", 0).css("display", "none")) : (CTween.fadeOut(this.$prev, 400, !1), CTween.fadeOut(this.$next, 400, !1), this.$prev.addClass("ms-ctrl-hide"), void this.$next.addClass("ms-ctrl-hide"))
		}, p.visible = function () {
			this.detached || (CTween.fadeIn(this.$prev, 400), CTween.fadeIn(this.$next, 400), this.$prev.removeClass("ms-ctrl-hide").css("display", ""), this.$next.removeClass("ms-ctrl-hide").css("display", ""))
		}, p.destroy = function () {
			_super.destroy(), this.$next.remove(), this.$prev.remove()
		}, window.MSArrows = MSArrows, MSSlideController.registerControl("arrows", MSArrows)
	}(jQuery),
	function ($) {
		"use strict";
		var MSThumblist = function (options) {
			BaseControl.call(this), this.options.dir = "h", this.options.wheel = "v" === options.dir, this.options.arrows = !1, this.options.speed = 17, this.options.align = null, this.options.inset = !1, this.options.margin = 10, this.options.space = 10, this.options.width = 100, this.options.height = 100, this.options.type = "thumbs", this.options.hover = !1, $.extend(this.options, options), this.thumbs = [], this.index_count = 0, this.__dimen = "h" === this.options.dir ? "width" : "height", this.__alignsize = "h" === this.options.dir ? "height" : "width", this.__jdimen = "h" === this.options.dir ? "outerWidth" : "outerHeight", this.__pos = "h" === this.options.dir ? "left" : "top", this.click_enable = !0
		};
		MSThumblist.extend(BaseControl);
		var p = MSThumblist.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			if (this.$element = $("<div></div>").addClass(this.options.prefix + "thumb-list"), "tabs" === this.options.type && this.$element.addClass(this.options.prefix + "tabs"), this.$element.addClass("ms-dir-" + this.options.dir), _super.setup.call(this), this.$element.appendTo(this.slider.$controlsCont === this.cont ? this.slider.$element : this.cont), this.$thumbscont = $("<div></div>").addClass("ms-thumbs-cont").appendTo(this.$element), this.options.arrows) {
				var that = this;
				this.$fwd = $("<div></div>").addClass("ms-thumblist-fwd").appendTo(this.$element).click(function () {
					that.controller.push(-15)
				}), this.$bwd = $("<div></div>").addClass("ms-thumblist-bwd").appendTo(this.$element).click(function () {
					that.controller.push(15)
				})
			}
			if (!this.options.insetTo && this.options.align) {
				var align = this.options.align;
				this.options.inset ? this.$element.css(align, this.options.margin) : "top" === align ? this.$element.detach().prependTo(this.slider.$element).css({
					"margin-bottom": this.options.margin,
					position: "relative"
				}) : "bottom" === align ? this.$element.css({
					"margin-top": this.options.margin,
					position: "relative"
				}) : (this.slider.api.addEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.align()), "v" === this.options.dir ? this.$element.width(this.options.width) : this.$element.height(this.options.height)
			}
			this.checkHideUnder()
		}, p.align = function () {
			if (!this.detached) {
				var align = this.options.align,
					pos = this.slider.reserveSpace(align, this.options[this.__alignsize] + 2 * this.options.margin);
				this.$element.css(align, -pos - this.options[this.__alignsize] - this.options.margin)
			}
		}, p.slideAction = function (slide) {
			var thumb_ele = slide.$element.find(".ms-thumb"),
				that = this,
				thumb_frame = $("<div></div>").addClass("ms-thumb-frame").append(thumb_ele).append($('<div class="ms-thumb-ol"></div>')).bind(this.options.hover ? "hover" : "click", function () {
					that.changeSlide(thumb_frame)
				});
			if (this.options.align && thumb_frame.width(this.options.width - ("v" === this.options.dir && "tabs" === this.options.type ? 12 : 0)).height(this.options.height).css("margin-" + ("v" === this.options.dir ? "bottom" : "right"), this.options.space), thumb_frame[0].index = this.index_count++, this.$thumbscont.append(thumb_frame), this.options.fillMode && thumb_ele.is("img")) {
				var aligner = new window.MSAligner(this.options.fillMode, thumb_frame, thumb_ele);
				thumb_ele[0].aligner = aligner, thumb_ele.one("load", function () {
					var $this = $(this);
					$this[0].aligner.init($this.width(), $this.height()), $this[0].aligner.align()
				}).each($.jqLoadFix)
			}
			$.browser.msie && thumb_ele.on("dragstart", function (event) {
				event.preventDefault()
			}), this.thumbs.push(thumb_frame)
		}, p.create = function () {
			_super.create.call(this), this.__translate_end = window._css3d ? " translateZ(0px)" : "", this.controller = new Controller(0, 0, {
				snappingMinSpeed: 2,
				friction: (100 - .5 * this.options.speed) / 100
			}), this.controller.renderCallback("h" === this.options.dir ? this._hMove : this._vMove, this);
			var that = this;
			this.resize_listener = function () {
				that.__resize()
			}, $(window).bind("resize", this.resize_listener), this.thumbSize = this.thumbs[0][this.__jdimen](!0), this.setupSwipe(), this.__resize();
			var that = this;
			this.options.wheel && (this.wheellistener = function (event) {
				var e = window.event || event.orginalEvent || event,
					delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
				return that.controller.push(10 * -delta), !1
			}, $.browser.mozilla ? this.$element[0].addEventListener("DOMMouseScroll", this.wheellistener) : this.$element.bind("mousewheel", this.wheellistener)), this.slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.update, this), this.slider.api.addEventListener(MSSliderEvent.HARD_UPDATE, this.realignThumbs, this), this.cindex = this.slider.api.index(), this.select(this.thumbs[this.cindex])
		}, /*p._hMove = function (controller, value) {
			return this.__contPos = value, window._cssanim ? void(this.$thumbscont[0].style[window._jcsspfx + "Transform"] = "translateX(" + -value + "px)" + this.__translate_end) : void(this.$thumbscont[0].style.left = -value + "px")
		},p._vMove = function (controller, value) {
			return this.__contPos = value, window._cssanim ? void(this.$thumbscont[0].style[window._jcsspfx + "Transform"] = "translateY(" + -value + "px)" + this.__translate_end) : void(this.$thumbscont[0].style.top = -value + "px")
		},*/ p.setupSwipe = function () {
			this.swipeControl = new averta.TouchSwipe(this.$element), this.swipeControl.swipeType = "h" === this.options.dir ? "horizontal" : "vertical";
			var that = this;
			this.swipeControl.onSwipe = "h" === this.options.dir ? function (status) {
				that.horizSwipeMove(status)
			} : function (status) {
				that.vertSwipeMove(status)
			}
		}, p.vertSwipeMove = function (status) {
			if (!this.dTouch) {
				var phase = status.phase;
				if ("start" === phase) this.controller.stop();
				else if ("move" === phase) this.controller.drag(status.moveY);
				else if ("end" === phase || "cancel" === phase) {
					var speed = Math.abs(status.distanceY / status.duration * 50 / 3);
					speed > .1 ? this.controller.push(-status.distanceY / status.duration * 50 / 3) : (this.click_enable = !0, this.controller.cancel())
				}
			}
		}, p.horizSwipeMove = function (status) {
			if (!this.dTouch) {
				var phase = status.phase;
				if ("start" === phase) this.controller.stop(), this.click_enable = !1;
				else if ("move" === phase) this.controller.drag(status.moveX);
				else if ("end" === phase || "cancel" === phase) {
					var speed = Math.abs(status.distanceX / status.duration * 50 / 3);
					speed > .1 ? this.controller.push(-status.distanceX / status.duration * 50 / 3) : (this.click_enable = !0, this.controller.cancel())
				}
			}
		}, p.update = function () {
			var nindex = this.slider.api.index();
			this.cindex !== nindex && (null != this.cindex && this.unselect(this.thumbs[this.cindex]), this.cindex = nindex, this.select(this.thumbs[this.cindex]), this.dTouch || this.updateThumbscroll())
		}, p.realignThumbs = function () {
			this.$element.find(".ms-thumb").each(function (index, thumb) {
				thumb.aligner && thumb.aligner.align()
			})
		}, p.updateThumbscroll = function () {
			var pos = this.thumbSize * this.cindex;
			if (0 / 0 == this.controller.value && (this.controller.value = 0), pos - this.controller.value < 0) return void this.controller.gotoSnap(this.cindex, !0);
			if (pos + this.thumbSize - this.controller.value > this.$element[this.__dimen]()) {
				var first_snap = this.cindex - Math.floor(this.$element[this.__dimen]() / this.thumbSize) + 1;
				return void this.controller.gotoSnap(first_snap, !0)
			}
		}, p.changeSlide = function (thumb) {
			this.click_enable && this.cindex !== thumb[0].index && this.slider.api.gotoSlide(thumb[0].index)
		}, p.unselect = function (ele) {
			ele.removeClass("ms-thumb-frame-selected")
		}, p.select = function (ele) {
			ele.addClass("ms-thumb-frame-selected")
		}, p.__resize = function () {
			var size = this.$element[this.__dimen]();
			if (this.ls !== size) {
				this.ls = size, this.thumbSize = this.thumbs[0][this.__jdimen](!0);
				var len = this.slider.api.count() * this.thumbSize;
				this.$thumbscont[0].style[this.__dimen] = len + "px", size >= len ? (this.dTouch = !0, this.controller.stop(), this.$thumbscont[0].style[this.__pos] = .5 * (size - len) + "px", this.$thumbscont[0].style[window._jcsspfx + "Transform"] = "") : (this.dTouch = !1, this.click_enable = !0, this.$thumbscont[0].style[this.__pos] = "", this.controller._max_value = len - size, this.controller.options.snapsize = this.thumbSize, this.updateThumbscroll())
			}
		}, p.destroy = function () {
			_super.destroy(), this.options.wheel && ($.browser.mozilla ? this.$element[0].removeEventListener("DOMMouseScroll", this.wheellistener) : this.$element.unbind("mousewheel", this.wheellistener), this.wheellistener = null), $(window).unbind("resize", this.resize_listener), this.$element.remove(), this.slider.api.removeEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.slider.api.removeEventListener(MSSliderEvent.CHANGE_START, this.update, this)
		}, window.MSThumblist = MSThumblist, MSSlideController.registerControl("thumblist", MSThumblist)
	}(jQuery),
	function ($) {
		"use strict";
		var MSBulltes = function (options) {
			BaseControl.call(this), this.options.dir = "h", this.options.inset = !0, this.options.margin = 10, this.options.space = 10, $.extend(this.options, options), this.bullets = []
		};
		MSBulltes.extend(BaseControl);
		var p = MSBulltes.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			if (_super.setup.call(this), this.$element = $("<div></div>").addClass(this.options.prefix + "bullets").addClass("ms-dir-" + this.options.dir).appendTo(this.cont), this.$bullet_cont = $("<div></div>").addClass("ms-bullets-count").appendTo(this.$element), !this.options.insetTo && this.options.align) {
				var align = this.options.align;
				this.options.inset && this.$element.css(align, this.options.margin)
			}
			this.checkHideUnder()
		}, p.create = function () {
			_super.create.call(this);
			var that = this;
			this.slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.update, this), this.cindex = this.slider.api.index();
			for (var i = 0; i < this.slider.api.count(); ++i) {
				var bullet = $("<div></div>").addClass("ms-bullet");
				bullet[0].index = i, bullet.on("click", function () {
					that.changeSlide(this.index)
				}), this.$bullet_cont.append(bullet), this.bullets.push(bullet), "h" === this.options.dir ? bullet.css("margin", this.options.space / 2) : bullet.css("margin", this.options.space)
			}
			"h" === this.options.dir ? this.$element.width(bullet.outerWidth(!0) * this.slider.api.count()) : this.$element.css("margin-top", -this.$element.outerHeight(!0) / 2), this.select(this.bullets[this.cindex])
		}, p.update = function () {
			var nindex = this.slider.api.index();
			this.cindex !== nindex && (null != this.cindex && this.unselect(this.bullets[this.cindex]), this.cindex = nindex, this.select(this.bullets[this.cindex]))
		}, p.changeSlide = function (index) {
			this.cindex !== index && this.slider.api.gotoSlide(index)
		}, p.unselect = function (ele) {
			ele.removeClass("ms-bullet-selected")
		}, p.select = function (ele) {
			ele.addClass("ms-bullet-selected")
		}, p.destroy = function () {
			_super.destroy(), this.slider.api.removeEventListener(MSSliderEvent.CHANGE_START, this.update, this), this.$element.remove()
		}, window.MSBulltes = MSBulltes, MSSlideController.registerControl("bullets", MSBulltes)
	}(jQuery),
	function ($) {
		"use strict";
		var MSScrollbar = function (options) {
			BaseControl.call(this), this.options.dir = "h", this.options.autohide = !0, this.options.width = 4, this.options.color = "#3D3D3D", this.options.margin = 10, $.extend(this.options, options), this.__dimen = "h" === this.options.dir ? "width" : "height", this.__jdimen = "h" === this.options.dir ? "outerWidth" : "outerHeight", this.__pos = "h" === this.options.dir ? "left" : "top", this.__translate_end = window._css3d ? " translateZ(0px)" : "", this.__translate_start = "h" === this.options.dir ? " translateX(" : "translateY("
		};
		MSScrollbar.extend(BaseControl);
		var p = MSScrollbar.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			if (this.$element = $("<div></div>").addClass(this.options.prefix + "sbar").addClass("ms-dir-" + this.options.dir), _super.setup.call(this), this.$element.appendTo(this.slider.$controlsCont === this.cont ? this.slider.$element : this.cont), this.$bar = $("<div></div>").addClass(this.options.prefix + "bar").appendTo(this.$element), this.slider.options.loop && (this.disable = !0, this.$element.remove()), "v" === this.options.dir ? this.$bar.width(this.options.width) : this.$bar.height(this.options.width), this.$bar.css("background-color", this.options.color), !this.options.insetTo && this.options.align) {
				this.$element.css("v" === this.options.dir ? {
					right: "auto",
					left: "auto"
				} : {
					top: "auto",
					bottom: "auto"
				});
				var align = this.options.align;
				this.options.inset ? this.$element.css(align, this.options.margin) : "top" === align ? this.$element.prependTo(this.slider.$element).css({
					"margin-bottom": this.options.margin,
					position: "relative"
				}) : "bottom" === align ? this.$element.css({
					"margin-top": this.options.margin,
					position: "relative"
				}) : (this.slider.api.addEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.align())
			}
			this.checkHideUnder()
		}, p.align = function () {
			if (!this.detached) {
				var align = this.options.align,
					pos = this.slider.reserveSpace(align, 2 * this.options.margin + this.options.width);
				this.$element.css(align, -pos - this.options.margin - this.options.width)
			}
		}, p.create = function () {
			if (!this.disable) {
				this.scroller = this.slider.api.scroller, this.slider.api.view.addEventListener(MSViewEvents.SCROLL, this._update, this), this.slider.api.addEventListener(MSSliderEvent.RESIZE, this._resize, this), this._resize(), this.options.autohide && this.$bar.css("opacity", "0")
			}
		}, p._resize = function () {
			this.vdimen = this.$element[this.__dimen](), this.bar_dimen = this.slider.api.view["__" + this.__dimen] * this.vdimen / this.scroller._max_value, this.$bar[this.__dimen](this.bar_dimen)
		}, p._update = function () {
			var value = this.scroller.value * (this.vdimen - this.bar_dimen) / this.scroller._max_value;
			if (this.lvalue !== value) {
				if (this.lvalue = value, this.options.autohide) {
					clearTimeout(this.hto), this.$bar.css("opacity", "1");
					var that = this;
					this.hto = setTimeout(function () {
						that.$bar.css("opacity", "0")
					}, 150)
				}
				return 0 > value ? void(this.$bar[0].style[this.__dimen] = this.bar_dimen + value + "px") : (value > this.vdimen - this.bar_dimen && (this.$bar[0].style[this.__dimen] = this.vdimen - value + "px"), window._cssanim ? void(this.$bar[0].style[window._jcsspfx + "Transform"] = this.__translate_start + value + "px)" + this.__translate_end) : void(this.$bar[0].style[this.__pos] = value + "px"))
			}
		}, p.destroy = function () {
			_super.destroy(), this.slider.api.view.removeEventListener(MSViewEvents.SCROLL, this._update, this), this.slider.api.removeEventListener(MSSliderEvent.RESIZE, this._resize, this), this.slider.api.removeEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.$element.remove()
		}, window.MSScrollbar = MSScrollbar, MSSlideController.registerControl("scrollbar", MSScrollbar)
	}(jQuery),
	function ($) {
		"use strict";
		var MSTimerbar = function (options) {
			BaseControl.call(this), this.options.autohide = !1, this.options.width = 4, this.options.color = "#FFFFFF", this.options.inset = !0, this.options.margin = 0, $.extend(this.options, options)
		};
		MSTimerbar.extend(BaseControl);
		var p = MSTimerbar.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			if (_super.setup.call(this), this.$element = $("<div></div>").addClass(this.options.prefix + "timerbar"), _super.setup.call(this), this.$element.appendTo(this.slider.$controlsCont === this.cont ? this.slider.$element : this.cont), this.$bar = $("<div></div>").addClass("ms-time-bar").appendTo(this.$element), "v" === this.options.dir ? (this.$bar.width(this.options.width), this.$element.width(this.options.width)) : (this.$bar.height(this.options.width), this.$element.height(this.options.width)), this.$bar.css("background-color", this.options.color), !this.options.insetTo && this.options.align) {
				this.$element.css({
					top: "auto",
					bottom: "auto"
				});
				var align = this.options.align;
				this.options.inset ? this.$element.css(align, this.options.margin) : "top" === align ? this.$element.prependTo(this.slider.$element).css({
					"margin-bottom": this.options.margin,
					position: "relative"
				}) : "bottom" === align ? this.$element.css({
					"margin-top": this.options.margin,
					position: "relative"
				}) : (this.slider.api.addEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.align())
			}
			this.checkHideUnder()
		}, p.align = function () {
			if (!this.detached) {
				var align = this.options.align,
					pos = this.slider.reserveSpace(align, 2 * this.options.margin + this.options.width);
				this.$element.css(align, -pos - this.options.margin - this.options.width)
			}
		}, p.create = function () {
			_super.create.call(this), this.slider.api.addEventListener(MSSliderEvent.WAITING, this._update, this), this._update()
		}, p._update = function () {
			this.$bar[0].style.width = this.slider.api._delayProgress + "%"
		}, p.destroy = function () {
			_super.destroy(), this.slider.api.removeEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.slider.api.removeEventListener(MSSliderEvent.WAITING, this._update, this), this.$element.remove()
		}, window.MSTimerbar = MSTimerbar, MSSlideController.registerControl("timebar", MSTimerbar)
	}(jQuery),
	function ($) {
		"use strict";
		var MSCircleTimer = function (options) {
			BaseControl.call(this), this.options.color = "#A2A2A2", this.options.stroke = 10, this.options.radius = 4, this.options.autohide = !1, $.extend(this.options, options)
		};
		MSCircleTimer.extend(BaseControl);
		var p = MSCircleTimer.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			return _super.setup.call(this), this.$element = $("<div></div>").addClass(this.options.prefix + "ctimer").appendTo(this.cont), this.$canvas = $("<canvas></canvas>").addClass("ms-ctimer-canvas").appendTo(this.$element), this.$bar = $("<div></div>").addClass("ms-ctimer-bullet").appendTo(this.$element), this.$canvas[0].getContext ? (this.ctx = this.$canvas[0].getContext("2d"), this.prog = 0, this.__w = 2 * (this.options.radius + this.options.stroke / 2), this.$canvas[0].width = this.__w, this.$canvas[0].height = this.__w, void this.checkHideUnder()) : (this.destroy(), void(this.disable = !0))
		}, p.create = function () {
			if (!this.disable) {
				_super.create.call(this), this.slider.api.addEventListener(MSSliderEvent.WAITING, this._update, this);
				var that = this;
				this.$element.click(function () {
					that.slider.api.paused ? that.slider.api.resume() : that.slider.api.pause()
				}), this._update()
			}
		}, p._update = function () {
			var that = this;
			$(this).stop(!0).animate({
				prog: .01 * this.slider.api._delayProgress
			}, {
				duration: 200,
				step: function () {
					that._draw()
				}
			})
		}, p._draw = function () {
			this.ctx.clearRect(0, 0, this.__w, this.__w), this.ctx.beginPath(), this.ctx.arc(.5 * this.__w, .5 * this.__w, this.options.radius, 1.5 * Math.PI, 1.5 * Math.PI + 2 * Math.PI * this.prog, !1), this.ctx.strokeStyle = this.options.color, this.ctx.lineWidth = this.options.stroke, this.ctx.stroke()
		}, p.destroy = function () {
			_super.destroy(), this.disable || ($(this).stop(!0), this.slider.api.removeEventListener(MSSliderEvent.WAITING, this._update, this), this.$element.remove())
		}, window.MSCircleTimer = MSCircleTimer, MSSlideController.registerControl("circletimer", MSCircleTimer)
	}(jQuery),
	function ($) {
		"use strict";
		window.MSLightbox = function (options) {
			BaseControl.call(this, options), this.options.autohide = !1, $.extend(this.options, options), this.data_list = []
		}, MSLightbox.fadeDuratation = 400, MSLightbox.extend(BaseControl);
		var p = MSLightbox.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			_super.setup.call(this), this.$element = $("<div></div>").addClass(this.options.prefix + "lightbox-btn").appendTo(this.cont), this.checkHideUnder()
		}, p.slideAction = function (slide) {
			$("<div></div>").addClass(this.options.prefix + "lightbox-btn").appendTo(slide.$element).append($(slide.$element.find(".ms-lightbox")))
		}, p.create = function () {
			_super.create.call(this)
		}, MSSlideController.registerControl("lightbox", MSLightbox)
	}(jQuery),
	function ($) {
		"use strict";
		window.MSSlideInfo = function (options) {
			BaseControl.call(this, options), this.options.autohide = !1, this.options.align = null, this.options.inset = !1, this.options.margin = 10, this.options.size = 100, this.options.dir = "h", $.extend(this.options, options), this.data_list = []
		}, MSSlideInfo.fadeDuratation = 400, MSSlideInfo.extend(BaseControl);
		var p = MSSlideInfo.prototype,
			_super = BaseControl.prototype;
		p.setup = function () {
			if (this.$element = $("<div></div>").addClass(this.options.prefix + "slide-info").addClass("ms-dir-" + this.options.dir), _super.setup.call(this), this.$element.appendTo(this.slider.$controlsCont === this.cont ? this.slider.$element : this.cont), !this.options.insetTo && this.options.align) {
				var align = this.options.align;
				this.options.inset ? this.$element.css(align, this.options.margin) : "top" === align ? this.$element.prependTo(this.slider.$element).css({
					"margin-bottom": this.options.margin,
					position: "relative"
				}) : "bottom" === align ? this.$element.css({
					"margin-top": this.options.margin,
					position: "relative"
				}) : (this.slider.api.addEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.align()), "v" === this.options.dir ? this.$element.width(this.options.size) : this.$element.css("min-height", this.options.size)
			}
			this.checkHideUnder()
		}, p.align = function () {
			if (!this.detached) {
				var align = this.options.align,
					pos = this.slider.reserveSpace(align, this.options.size + 2 * this.options.margin);
				this.$element.css(align, -pos - this.options.size - this.options.margin)
			}
		}, p.slideAction = function (slide) {
			var info_ele = $(slide.$element.find(".ms-info"));
			info_ele.detach(), this.data_list[slide.index] = info_ele
		}, p.create = function () {
			_super.create.call(this), this.slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.update, this), this.cindex = this.slider.api.index(), this.switchEle(this.data_list[this.cindex])
		}, p.update = function () {
			var nindex = this.slider.api.index();
			this.switchEle(this.data_list[nindex]), this.cindex = nindex
		}, p.switchEle = function (ele) {
			if (this.current_ele) {
				this.current_ele[0].tween && this.current_ele[0].tween.stop(!0), this.current_ele[0].tween = CTween.animate(this.current_ele, MSSlideInfo.fadeDuratation, {
					opacity: 0
				}, {
					complete: function () {
						this.detach(), this[0].tween = null, ele.css("position", "relative")
					},
					target: this.current_ele
				}), ele.css("position", "absolute")
			}
			this.__show(ele)
		}, p.__show = function (ele) {
			ele.appendTo(this.$element).css("opacity", "0"), this.current_ele && ele.height(Math.max(ele.height(), this.current_ele.height())), clearTimeout(this.tou), this.tou = setTimeout(function () {
				CTween.fadeIn(ele, MSSlideInfo.fadeDuratation), ele.css("height", "")
			}, MSSlideInfo.fadeDuratation), ele[0].tween && ele[0].tween.stop(!0), this.current_ele = ele
		}, p.destroy = function () {
			_super.destroy(), clearTimeout(this.tou), this.current_ele && this.current_ele[0].tween && this.current_ele[0].tween.stop("true"), this.$element.remove(), this.slider.api.removeEventListener(MSSliderEvent.RESERVED_SPACE_CHANGE, this.align, this), this.slider.api.removeEventListener(MSSliderEvent.CHANGE_START, this.update, this)
		}, MSSlideController.registerControl("slideinfo", MSSlideInfo)
	}(jQuery),
	function ($) {
		window.MSGallery = function (id, slider) {
			this.id = id, this.slider = slider, this.telement = $("#" + id), this.botcont = $("<div></div>").addClass("ms-gallery-botcont").appendTo(this.telement), this.thumbcont = $("<div></div>").addClass("ms-gal-thumbcont hide-thumbs").appendTo(this.botcont), this.playbtn = $("<div></div>").addClass("ms-gal-playbtn").appendTo(this.botcont), this.thumbtoggle = $("<div></div>").addClass("ms-gal-thumbtoggle").appendTo(this.botcont), slider.control("thumblist", {
				insertTo: this.thumbcont,
				autohide: !1,
				dir: "h"
			}), slider.control("slidenum", {
				insertTo: this.botcont,
				autohide: !1
			}), slider.control("slideinfo", {
				insertTo: this.botcont,
				autohide: !1
			}), slider.control("timebar", {
				insertTo: this.botcont,
				autohide: !1
			}), slider.control("bullets", {
				insertTo: this.botcont,
				autohide: !1
			})
		};
		var p = MSGallery.prototype;
		p._init = function () {
			var that = this;
			this.slider.api.paused || this.playbtn.addClass("btn-pause"), this.playbtn.click(function () {
				that.slider.api.paused ? (that.slider.api.resume(), that.playbtn.addClass("btn-pause")) : (that.slider.api.pause(), that.playbtn.removeClass("btn-pause"))
			}), this.thumbtoggle.click(function () {
				that.vthumbs ? (that.thumbtoggle.removeClass("btn-hide"), that.vthumbs = !1, that.thumbcont.addClass("hide-thumbs")) : (that.thumbtoggle.addClass("btn-hide"), that.thumbcont.removeClass("hide-thumbs"), that.vthumbs = !0)
			})
		}, p.setup = function () {
			var that = this;
			$(document).ready(function () {
				that._init()
			})
		}
	}(jQuery),
	function ($) {
		var getPhotosetURL = function (key, id, count) {
				return "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + key + "&photoset_id=" + id + "&per_page=" + count + "&extras=url_o,description,date_taken,owner_name,views&format=json&jsoncallback=?"
			},
			getUserPublicURL = function (key, id, count) {
				return "https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=" + key + "&user_id=" + id + "&per_page=" + count + "&extras=url_o,description,date_taken,owner_name,views&format=json&jsoncallback=?"
			},
			getImageSource = function (fid, server, id, secret, size, data) {
				return "_o" === size && data ? data.url_o : "https://farm" + fid + ".staticflickr.com/" + server + "/" + id + "_" + secret + size + ".jpg"
			};
		window.MSFlickrV2 = function (slider, options) {
			var _options = {
				count: 10,
				type: "photoset",
				thumbSize: "q",
				imgSize: "c"
			};
			if (this.slider = slider, this.slider.holdOn(), !options.key) return void this.errMsg("Flickr API Key required. Please add it in settings.");
			$.extend(_options, options), this.options = _options;
			var that = this;
			"photoset" === this.options.type ? $.getJSON(getPhotosetURL(this.options.key, this.options.id, this.options.count), function (data) {
				that._photosData(data)
			}) : $.getJSON(getUserPublicURL(this.options.key, this.options.id, this.options.count), function (data) {
				that.options.type = "photos", that._photosData(data)
			}), "" !== this.options.imgSize && "-" !== this.options.imgSize && (this.options.imgSize = "_" + this.options.imgSize), this.options.thumbSize = "_" + this.options.thumbSize, this.slideTemplate = this.slider.$element.find(".ms-slide")[0].outerHTML, this.slider.$element.find(".ms-slide").remove()
		};
		var p = MSFlickrV2.prototype;
		p._photosData = function (data) {
			if ("fail" === data.stat) return void this.errMsg("Flickr API ERROR#" + data.code + ": " + data.message); {
				var that = this;
				this.options.author || this.options.desc
			}
			$.each(data[this.options.type].photo, function (i, item) {
				var slide_cont = that.slideTemplate.replace(/{{[\w-]+}}/g, function (match) {
					return match = match.replace(/{{|}}/g, ""), shortCodes[match] ? shortCodes[match](item, that) : "{{" + match + "}}"
				});
				$(slide_cont).appendTo(that.slider.$element)
			}), that._initSlider()
		}, p.errMsg = function (msg) {
			this.slider.$element.css("display", "block"), this.errEle || (this.errEle = $('<div style="font-family:Arial; color:red; font-size:12px; position:absolute; top:10px; left:10px"></div>').appendTo(this.slider.$loading)), this.errEle.html(msg)
		}, p._initSlider = function () {
			this.slider.release()
		};
		var shortCodes = {
			image: function (data, that) {
				return getImageSource(data.farm, data.server, data.id, data.secret, that.options.imgSize, data)
			},
			thumb: function (data, that) {
				return getImageSource(data.farm, data.server, data.id, data.secret, that.options.thumbSize)
			},
			title: function (data) {
				return data.title
			},
			"owner-name": function (data) {
				return data.ownername
			},
			"date-taken": function (data) {
				return data.datetaken
			},
			views: function (data) {
				return data.views
			},
			description: function (data) {
				return data.description._content
			}
		}
	}(jQuery),
	function ($) {
		window.MSFacebookGallery = function (slider, options) {
			var _options = {
				count: 10,
				type: "photostream",
				thumbSize: "320",
				imgSize: "orginal",
				https: !1,
				token: ""
			};
			this.slider = slider, this.slider.holdOn(), $.extend(_options, options), this.options = _options, this.graph = "https://graph.facebook.com";
			var that = this;
			"photostream" === this.options.type ? $.getJSON(this.graph + "/" + this.options.username + "/photos/uploaded/?fields=source,name,link,images,from&limit=" + this.options.count + "&access_token=" + this.options.token, function (data) {
				that._photosData(data)
			}) : $.getJSON(this.graph + "/" + this.options.albumId + "/photos?fields=source,name,link,images,from&limit=" + this.options.count + "&access_token=" + this.options.token, function (data) {
				that._photosData(data)
			}), this.slideTemplate = this.slider.$element.find(".ms-slide")[0].outerHTML, this.slider.$element.find(".ms-slide").remove()
		};
		var p = MSFacebookGallery.prototype;
		p._photosData = function (content) {
			if (content.error) return void this.errMsg("Facebook API ERROR#" + content.error.code + "(" + content.error.type + "): " + content.error.message);
			for (var that = this, i = (this.options.author || this.options.desc, 0), l = content.data.length; i !== l; i++) {
				var slide_cont = that.slideTemplate.replace(/{{[\w-]+}}/g, function (match) {
					return match = match.replace(/{{|}}/g, ""), shortCodes[match] ? shortCodes[match](content.data[i], that) : "{{" + match + "}}"
				});
				$(slide_cont).appendTo(that.slider.$element)
			}
			that._initSlider()
		}, p.errMsg = function (msg) {
			this.slider.$element.css("display", "block"), this.errEle || (this.errEle = $('<div style="font-family:Arial; color:red; font-size:12px; position:absolute; top:10px; left:10px"></div>').appendTo(this.slider.$loading)), this.errEle.html(msg)
		}, p._initSlider = function () {
			this.slider.release()
		};
		var getImageSource = function (images, size) {
				if ("orginal" === size) return images[0].source;
				for (var i = 0, l = images.length; i !== l; i++)
					if (-1 !== images[i].source.indexOf(size + "x" + size)) return images[i].source;
				return images[0].source
			},
			shortCodes = {
				image: function (data, that) {
					return getImageSource(data.images, that.options.imgSize)
				},
				thumb: function (data, that) {
					return getImageSource(data.images, that.options.thumbSize)
				},
				name: function (data) {
					return data.name
				},
				"owner-name": function (data) {
					return data.from.name
				},
				link: function (data) {
					return data.link
				}
			}
	}(jQuery),
	function ($) {
		"use strict";
		window.MSScrollParallax = function (slider, parallax, bgparallax, fade) {
			this.fade = fade, this.slider = slider, this.parallax = parallax / 100, this.bgparallax = bgparallax / 100, slider.api.addEventListener(MSSliderEvent.INIT, this.init, this), slider.api.addEventListener(MSSliderEvent.DESTROY, this.destory, this), slider.api.addEventListener(MSSliderEvent.CHANGE_END, this.resetLayers, this), slider.api.addEventListener(MSSliderEvent.CHANGE_START, this.updateCurrentSlide, this)
		}, window.MSScrollParallax.setup = function (slider, parallax, bgparallax, fade) {
			return window._mobile ? void 0 : (null == parallax && (parallax = 50), null == bgparallax && (bgparallax = 40), new MSScrollParallax(slider, parallax, bgparallax, fade))
		};
		var p = window.MSScrollParallax.prototype;
		p.init = function () {
			this.slider.$element.addClass("ms-scroll-parallax"), this.sliderOffset = this.slider.$element.offset().top, this.updateCurrentSlide();
			for (var slide, slides = this.slider.api.view.slideList, i = 0, l = slides.length; i !== l; i++) slide = slides[i], slide.hasLayers && (slide.layerController.$layers.wrap('<div class="ms-scroll-parallax-cont"></div>'), slide.$scrollParallaxCont = slide.layerController.$layers.parent());
			$(window).on("scroll", {
				that: this
			}, this.moveParallax).trigger("scroll")
		}, p.resetLayers = function () {
			if (this.lastSlide) {
				var layers = this.lastSlide.$scrollParallaxCont;
				window._css2d ? (layers && (layers[0].style[window._jcsspfx + "Transform"] = ""), this.lastSlide.hasBG && (this.lastSlide.$imgcont[0].style[window._jcsspfx + "Transform"] = "")) : (layers && (layers[0].style.top = ""), this.lastSlide.hasBG && (this.lastSlide.$imgcont[0].style.top = "0px"))
			}
		}, p.updateCurrentSlide = function () {
			this.lastSlide = this.currentSlide, this.currentSlide = this.slider.api.currentSlide, this.moveParallax({
				data: {
					that: this
				}
			})
		}, p.moveParallax = function (e) {
			var that = e.data.that,
				slider = that.slider,
				offset = that.sliderOffset,
				scrollTop = $(window).scrollTop(),
				layers = that.currentSlide.$scrollParallaxCont,
				out = offset - scrollTop;
			0 >= out ? (layers && (window._css3d ? layers[0].style[window._jcsspfx + "Transform"] = "translateY(" + -out * that.parallax + "px) translateZ(0.4px)" : window._css2d ? layers[0].style[window._jcsspfx + "Transform"] = "translateY(" + -out * that.parallax + "px)" : layers[0].style.top = -out * that.parallax + "px"), that.updateSlidesBG(-out * that.bgparallax + "px", !0), layers && that.fade && layers.css("opacity", 1 - Math.min(1, -out / slider.api.height))) : (layers && (window._css2d ? layers[0].style[window._jcsspfx + "Transform"] = "" : layers[0].style.top = ""), that.updateSlidesBG("0px", !1), layers && that.fade && layers.css("opacity", 1))
		}, p.updateSlidesBG = function (pos, fixed) {
			for (var slides = this.slider.api.view.slideList, position = !fixed || $.browser.msie || $.browser.opera ? "" : "fixed", i = 0, l = slides.length; i !== l; i++) slides[i].hasBG && (slides[i].$imgcont[0].style.position = position, slides[i].$imgcont[0].style.top = pos), slides[i].$bgvideocont && (slides[i].$bgvideocont[0].style.position = position, slides[i].$bgvideocont[0].style.top = pos)
		}, p.destory = function () {
			slider.api.removeEventListener(MSSliderEvent.INIT, this.init, this), slider.api.removeEventListener(MSSliderEvent.DESTROY, this.destory, this), slider.api.removeEventListener(MSSliderEvent.CHANGE_END, this.resetLayers, this), slider.api.removeEventListener(MSSliderEvent.CHANGE_START, this.updateCurrentSlide, this), $(window).off("scroll", this.moveParallax)
		}
	}(jQuery),
	function ($, document, window) {
		var PId = 0;
		if (window.MasterSlider) {
			var KeyboardNav = function (slider) {
				this.slider = slider, this.PId = PId++, this.slider.options.keyboard && slider.api.addEventListener(MSSliderEvent.INIT, this.init, this)
			};
			KeyboardNav.name = "MSKeyboardNav";
			var p = KeyboardNav.prototype;
			p.init = function () {
				var api = this.slider.api;
				$(document).on("keydown.kbnav" + this.PId, function (event) {
					var which = event.which;
					37 === which || 40 === which ? api.previous(!0) : (38 === which || 39 === which) && api.next(!0)
				})
			}, p.destroy = function () {
				$(document).off("keydown.kbnav" + this.PId), this.slider.api.removeEventListener(MSSliderEvent.INIT, this.init, this)
			}, MasterSlider.registerPlugin(KeyboardNav)
		}
	}(jQuery, document, window),
	function ($, document, window) {
		var PId = 0,
			$window = $(window),
			$doc = $(document);
		if (window.MasterSlider) {
			var StartOnAppear = function (slider) {
				this.PId = PId++, this.slider = slider, this.$slider = slider.$element, this.slider.options.startOnAppear && (slider.holdOn(), $doc.ready($.proxy(this.init, this)))
			};
			StartOnAppear.name = "MSStartOnAppear";
			var p = StartOnAppear.prototype;
			p.init = function () {
				this.slider.api;
				$window.on("scroll.soa" + this.PId, $.proxy(this._onScroll, this)).trigger("scroll")
			}, p._onScroll = function () {
				var vpBottom = $window.scrollTop() + $window.height(),
					top = this.$slider.offset().top;
				vpBottom > top && ($window.off("scroll.soa" + this.PId), this.slider.release())
			}, p.destroy = function () {}, MasterSlider.registerPlugin(StartOnAppear)
		}
	}(jQuery, document, window),
	function (document, window) {
		var filterUnits = {
				"hue-rotate": "deg",
				blur: "px"
			},
			initialValues = {
				opacity: 1,
				contrast: 1,
				brightness: 1,
				saturate: 1,
				"hue-rotate": 0,
				invert: 0,
				sepia: 0,
				blur: 0,
				grayscale: 0
			};
		if (window.MasterSlider) {
			var Filters = function (slider) {
				this.slider = slider, this.slider.options.filters && slider.api.addEventListener(MSSliderEvent.INIT, this.init, this)
			};
			Filters.name = "MSFilters";
			var p = Filters.prototype;
			p.init = function () {
				var api = this.slider.api,
					view = api.view;
				this.filters = this.slider.options.filters, this.slideList = view.slideList, this.slidesCount = view.slidesCount, this.dimension = view[view.__dimension], this.target = "slide" === this.slider.options.filterTarget ? "$element" : "$bg_img", this.filterName = $.browser.webkit ? "WebkitFilter" : "filter";
				var superFun = view.controller.__renderHook.fun,
					superRef = view.controller.__renderHook.ref;
				view.controller.renderCallback(function (controller, value) {
					superFun.call(superRef, controller, value), this.applyEffect(value)
				}, this), this.applyEffect(view.controller.value)
			}, p.applyEffect = function (value) {
				for (var factor, slide, i = 0; i < this.slidesCount; ++i) slide = this.slideList[i], factor = Math.min(1, Math.abs(value - slide.position) / this.dimension), slide[this.target] && ($.browser.msie ? null != this.filters.opacity && slide[this.target].opacity(1 - this.filters.opacity * factor) : slide[this.target][0].style[this.filterName] = this.generateStyle(factor))
			}, p.generateStyle = function (factor) {
				var unit, style = "";
				for (var filter in this.filters) unit = filterUnits[filter] || "", style += filter + "(" + (initialValues[filter] + (this.filters[filter] - initialValues[filter]) * factor) + ") ";
				return style
			}, p.destroy = function () {
				this.slider.api.removeEventListener(MSSliderEvent.INIT, this.init, this)
			}, MasterSlider.registerPlugin(Filters)
		}
	}(document, window, jQuery),
	function ($, document, window) {
		if (window.MasterSlider) {
			var ScrollToAction = function (slider) {
				this.slider = slider, slider.api.addEventListener(MSSliderEvent.INIT, this.init, this)
			};
			ScrollToAction.name = "MSScrollToAction";
			var p = ScrollToAction.prototype;
			p.init = function () {
				var api = this.slider.api;
				api.scrollToEnd = _scrollToEnd, api.scrollTo = _scrollTo
			}, p.destroy = function () {};
			var _scrollTo = function (target, duration) {
					var target = (this.slider.$element, $(target).eq(0));
					0 !== target.length && (null == duration && (duration = 1.4), $("html, body").animate({
						scrollTop: target.offset().top
					}, 1e3 * duration, "easeInOutQuad"))
				},
				_scrollToEnd = function (duration) {
					var sliderEle = this.slider.$element;
					null == duration && (duration = 1.4), $("html, body").animate({
						scrollTop: sliderEle.offset().top + sliderEle.outerHeight(!1)
					}, 1e3 * duration, "easeInOutQuad")
				};
			MasterSlider.registerPlugin(ScrollToAction)
		}
	}(jQuery, document, window);
//# sourceMappingURL=masterslider.min.js.map
/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;
(function (window) {
	'use strict';

	var mainContainer = document.querySelector('.main-wrap'),
		openCtrl = document.getElementById('btn-search'),
		closeCtrl = document.getElementById('btn-search-close'),
		searchContainer = document.querySelector('.search'),
		inputSearch = searchContainer.querySelector('.search__input');

	function init() {
		initEvents();
	}

	function initEvents() {
		openCtrl.addEventListener('click', openSearch);
		closeCtrl.addEventListener('click', closeSearch);
		document.addEventListener('keyup', function (ev) {
			// escape key.
			if (ev.keyCode == 27) {
				closeSearch();
			}
		});
	}

	function openSearch() {
		mainContainer.classList.add('main-wrap--hide');
		$('body').css('overflow-y', 'hidden');
		$('.progressbar, .hero-list').css('display', 'none');
		$('.search__color').find('.search').css('width', '100%');
		$('.scroll-window-indicator').hide();
		searchContainer.classList.add('search--open');
		setTimeout(function () {
			inputSearch.focus();
		}, 500);
	}

	function closeSearch() {
		mainContainer.classList.remove('main-wrap--hide');
		//$('body').css('overflow-y','scroll');
		$('.progressbar, .hero-list').css('display', 'block');
		$('.search__color').find('.search').css('width', 'auto');
		$('.scroll-window-indicator').show();
		searchContainer.classList.remove('search--open');
		inputSearch.blur();
		inputSearch.value = '';
	}

	init();

})(window);

/**********************
	Social share success stories js
/**********************/
function twitterSuccessShare(title){
var url = window.location.href;
title = encodeURIComponent(title);
    
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

function linkedinSuccessShare(){
   
						var url = window.location.href;
                     	var liUrl = 'http://www.linkedin.com/shareArticle?mini=true&url='.concat(url);
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(liUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}

function facebookSuccessShare(){
    					var url = window.location.href;

                     	  var fbUrl = 'http://www.facebook.com/sharer/sharer.php?s=100&u='.concat(url);
    					var width=500, height=500;
						var left = (window.screen.width / 2) - ((width / 2) + 10);
    					var top = (window.screen.height / 2) - ((height / 2) + 50);
    					  popUp = window.open(encodeURI(fbUrl),'popupwindow','scrollbars=no,width='+ width +',height='+ height +',top='+ top +', left='+ left +'');
   						 //popUp.focus();
    					return false;
}

/************************************
	Social share success stories js
/************************************/

function twitterSuccessStoriesShare(url, title){
	var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=location.origin;
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

function linkedinSuccessStoriesShare(url){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=location.origin;
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

function facebookSuccessStoriesShare(url){
    var external = "http://";
    var secureExternal = "https://";
    var res = url.match(external)||url.match(secureExternal);
    if(res==null){
    var domain=location.origin;
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

YUI.add("gallery-placeholder",function(d){var b=d.ClassNameManager.getClassName,a=b("placeholder"),c=b("placeholder","text");d.namespace("Plugin").Placeholder=d.Base.create("placeholder",d.Plugin.Base,[],{hide:function(g){var f=this.get("host");if(f.hasClass(c)){f.set("value","");f.removeClass(c);}},show:function(g){var f=this.get("host"),h=this.get("text");if(f.get("value")===""){f.set("value",h);f.addClass(c);}},_handleKeydown:function(h){var f=h.keyCode||h.which,g=[13,16,17,18,27,37,38,39,40,224];if(!!~d.Array.indexOf(g,f)){return;}this.hide();},_setUIPlaceholder:function(g,f){var e=this.get("host");if(f){if(this._keydownListener){this._keydownListener.detach();}if(!this._focusListener){this._focusListener=e.on("focus",this.hide,this);}if(d.config.doc.activeElement!==d.Node.getDOMNode(e)){this.show();}}else{if(this._focusListener){this._focusListener.detach();}if(!this._keydownListener){this._keydownListenr=e.after("keydown",this._handleKeydown,this);}this.show();}},initializer:function(){var e=this.get("host");e.addClass(a);this.after("textChange",function(f){this._setUIPlaceholder(f.newVal,this.get("hideOnFocus"));});this.after("hideOnFocusChange",function(f){this._setUIPlaceholder(this.get("text"),f.newVal);});this._setUIPlaceholder(this.get("text"),this.get("hideOnFocus"));if(!this._vcHandler){this._vcHandler=e.on("valueChange",function(f){if(f.newVal){this.hide();}},this);}if(!this._blurListener){this._blurListener=e.on("blur",function(){d.later(300,this,function(){this.show();});},this);}},destructor:function(){var e=this.get("host");e.removeClass(a);if(this._focusListener){this._focusListener.detach();}if(this._blurListener){this._blurListener.detach();}if(this._keydownListener){this._keydownListener.detach();}}},{CN_PLACEHOLDER_TEXT:c,NS:"placeholder",ATTRS:{hideOnFocus:{value:true},text:{value:"Example"}}});},"@VERSION@",{requires:["node","base-build","plugin","classnamemanager","event-valuechange"]});
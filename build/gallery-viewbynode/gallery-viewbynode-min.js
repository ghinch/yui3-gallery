YUI.add("gallery-viewbynode",function(d){var c={},b=d.ClassNameManager.getClassName("view");if(!d.View.getByNode){d.View.getByNode=function(f){var e;f=d.Node.one(f);if(f){f=f.ancestor("."+b,true);if(f){e=c[d.stamp(f,true)];}}return e||null;};}function a(){this.after("init",this._afterInitCacheContainer);this.after("destroy",this._afterDestroyRemoveFromCache);this.after("init",this._addClassName);}a.prototype={_addClassName:function(){if(!this.container){this.container=d.Node.create("<div />");}this.container.addClass(b);},_afterInitCacheContainer:function(){var e=this.container;if(e){c[d.stamp(e,true)]=this;}},_afterDestroyRemoveFromCache:function(){var e=this.container;if(e){delete c[d.stamp(e,true)];}}};d.namespace("Ext").ViewByNode=a;},"@VERSION@",{requires:["view","classnamemanager","node-base"]});
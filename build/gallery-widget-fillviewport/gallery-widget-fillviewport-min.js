YUI.add("gallery-widget-fillviewport",function(C){var K="bindUI",O="syncUI",G="",L="childrenContainer",D="headerContent",F="bodyContent",E="footerContent",H="body",B="resize",M="width",J="height",N="fillViewport",A="fillViewportChange";function I(){C.before(this._bindUIFillVP,this,K);C.before(this._syncUIFillVP,this,O);}I.ATTRS={fillViewport:{value:true}};I.prototype={_originalWidth:null,_originalHeight:null,_resizeListener:null,_maximize:function(Q){var P=C.DOM.viewportRegion();this.setAttrs({width:P.width,height:P.height});},_setUIFillVP:function(P){C.one(H).setStyles({padding:(P?0:G),margin:(P?0:G)});if(P){this._originalWidth=this.get(M);this._originalHeight=this.get(J);this._resizeListener=C.on(B,C.bind(this._maximize,this),window);this._maximize();}else{if(this._resizeListener){this._resizeListener.detach();this._resizeListener=null;this.set(M,this._originalWidth);this.set(J,this._originalHeight);}}},_bindUIFillVP:function(){this.after(A,function(P){this._setUIFillVP(P.newVal);},this);},_syncUIFillVP:function(){var P=this.get(N);this._setUIFillVP(P);}};C.WidgetFillViewport=I;},"@VERSION@",{requires:["widget-base"]});
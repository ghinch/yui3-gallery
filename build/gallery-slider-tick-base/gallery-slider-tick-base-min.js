YUI.add("gallery-slider-tick-base",function(B){var A="values";B.SliderTickBase=B.Base.create("gallery-slider-tick-base",B.SliderBase,[],{addTickMarks:function(){var D=this.get(A);if(D){var H=this.rail;var C=this.thumb.getStyle(this._key.dim);C=parseFloat(C)||15;if(this.graphic==null){this.graphic=new B.Graphic({render:H});}this.graphic.removeAllShapes();for(var F=0;F<D.length;F++){var G=D[F];var E=this._valueToOffset(G)+(C/2);this._drawTickMark(E,"#CDCDCD");}}},_drawTickMark:function(C,F){var D=this.get("axis");var E=this.graphic.addShape((D==="x"?{type:"rect",width:1,height:3,x:C,y:2}:{type:"rect",width:3,height:1,x:2,y:C}));E.set("stroke",{color:F,weight:1,opacity:0.5});E.set("fill",{color:F,opacity:0.5});var G=this.graphic.addShape((D==="x"?{type:"rect",width:1,height:3,x:C,y:15}:{type:"rect",width:3,height:1,x:15,y:C}));G.set("stroke",{color:F,weight:1,opacity:0.5});G.set("fill",{color:F,opacity:0.5});}},{ATTRS:{}});},"@VERSION@",{requires:["node","slider-base","graphics"],optional:["node","slider-base","graphics"],skinnable:false});
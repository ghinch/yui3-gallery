YUI.add("gallery-compare",function(a){a.Compare=function(d,c){if((d===null&&c!==null)||(c===null&&d!==null)||(d===undefined&&c!==undefined)||(c===undefined&&d!==undefined)){return false;}if(a.Lang.isFunction(d)){return a.Compare.functions(d,c);}else{if(a.Lang.isArray(d)){return a.Compare.arrays(d,c);}else{if(a.Lang.isObject(d)){return a.Compare.objects(d,c);}else{if(d!=c){return false;}else{return true;}}}}};a.aggregate(a.Compare,{functions:function(d,c){if(typeof(d)!=typeof(c)||(d.toString()!=c.toString())){return false;}return true;},objects:function(d,c,e){if(!a.Lang.isObject(d)||!a.Lang.isObject(c)){return false;}var g,f;for(f in d){if(a.Object.owns(d,f)){g=d[f];if(typeof c[f]!=typeof g){return false;}if(g){if(!(f in c)){return false;}if(a.Lang.isFunction(g)){if(!a.Compare.functions(g,c[f])){return false;}}else{if(a.Lang.isArray(g)){if(!a.Compare.arrays(g,c[f])){return false;}}else{if(a.Lang.isObject(g)){if(!a.Compare.objects(g,c[f])){return false;}}else{if(g!=c[f]){return false;}}}}}else{if(c[f]){return false;}}}}for(f in c){if(!(f in d)){return false;}}return true;},arrays:function(e,c){if(!a.Lang.isArray(e)||!a.Lang.isArray(c)){return false;}if(e.length!=c.length){return false;}for(var f=0,d=e.length;f<d;f++){if(a.Lang.isFunction(e[f])){if(!a.Compare.functions(e[f],c[f])){return false;}}else{if(a.Lang.isArray(e[f])){if(!a.Compare.arrays(e[f],c[f])){return false;}}else{if(a.Lang.isObject(e[f])){if(!a.Compare.objects(e[f],c[f])){return false;}}else{if(e[f]!=c[f]){return false;}}}}}return true;}});},"@VERSION@",{requires:["yui"]});
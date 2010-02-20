YUI.add("gallery-form",function(C){function I(){I.superclass.constructor.apply(this,arguments);}C.mix(I,{NAME:"form",ATTRS:{method:{value:"post",validator:function(N){return this._validateMethod(N);},setter:function(N){return N.toLowerCase();}},action:{value:"",validator:C.Lang.isString},fields:{writeOnce:true,validator:function(N){return this._validateFields(N);},setter:function(N){return this._setFields(N);}},inlineValidation:{value:false,validator:C.Lang.isBoolean},resetAfterSubmit:{value:true,validator:C.Lang.isBoolean},encodingType:{value:I.URL_ENCODED,validator:C.Lang.isNumber}},HTML_PARSER:{action:function(N){return this._parseAction(N);},method:function(N){return this._parseMethod(N);},fields:function(N){return this._parseFields(N);}},FORM_TEMPLATE:"<form></form>",URL_ENCODED:1,MULTIPART_ENCODED:2});C.extend(I,C.Widget,{_formNode:null,_ioIds:null,_validateMethod:function(N){if(!C.Lang.isString(N)){return false;}if(N.toLowerCase()!="get"&&N.toLowerCase()!="post"){return false;}return true;},_validateFields:function(O){if(!C.Lang.isArray(O)){return false;}var N=true;C.Array.each(O,function(R,Q,P){if((!R instanceof C.FormField)||(!C.Lang.isObject(R))){N=false;}});return N;},_setFields:function(N){N=N||[];var O,P;C.Array.each(N,function(S,R,Q){if(!S._classes){P=S.type;if(C.Lang.isFunction(P)){O=P;}else{if(P=="hidden"){O=C.HiddenField;}else{if(P=="checkbox"){O=C.CheckboxField;}else{if(P=="radio"){O=C.RadioField;}else{if(P=="password"){O=C.PasswordField;}else{if(P=="textarea"){O=C.TextareaField;}else{if(P=="select"){O=C.SelectField;}else{if(P=="choice"){O=C.ChoiceField;}else{if(P=="file"){O=C.FileField;}else{if(P=="button"||P=="submit"||P=="reset"){O=C.Button;if(P=="submit"){S.onclick={fn:this.submit,scope:this};}else{if(P=="reset"){S.onclick={fn:this.reset,scope:this};}}}else{O=C.TextField;}}}}}}}}}}N[R]=new O(S);}},this);return N;},_parseAction:function(N){var O=N.one("form");if(O){return O.get("action");}},_parseMethod:function(N){var O=N.one("form");if(O){return O.get("method");}},_parseFields:function(O){var P=O.all("*"),Q=O.all("label"),N=[];P.each(function(T,S,R){var X=T.get("nodeName"),V=T.get("id"),U,W=[];if(X=="INPUT"){U={type:T.get("type"),name:T.get("name"),value:T.get("value"),checked:T.get("checked")};if(U.type=="submit"||U.type=="reset"||U.type=="button"){U.label=T.get("value");}}else{if(X=="BUTTON"){U={type:"button",name:T.get("name"),label:T.get("innerHTML")};}else{if(X=="SELECT"){T.all("option").each(function(Z,a,Y){W.push({label:Z.get("innerHTML"),value:Z.get("value")});});U={type:"select",name:T.get("name"),choices:W};}else{if(X=="TEXTAREA"){U={type:"textarea",name:T.get("name"),value:T.get("innerHTML")};}}}}if(U){if(V){U.id=V;Q.some(function(Z,a,Y){if(Z.get("htmlFor")==V){U.label=Z.get("innerHTML");}});}N.push(U);}T.remove();});return N;},_renderFormNode:function(){var N=this.get("contentBox"),O=N.query("form");if(!O){O=C.Node.create(I.FORM_TEMPLATE);N.appendChild(O);}this._formNode=O;},_renderFormFields:function(){var N=this.get("fields");C.Array.each(N,function(Q,P,O){Q.render(this._formNode);},this);},_syncFormAttributes:function(){this._formNode.setAttrs({action:this.get("action"),method:this.get("method"),id:this.get("id")});if(this.get("encodingType")===I.MULTIPART_ENCODED){this._formNode.setAttribute("enctype","multipart/form-data");}},_runValidation:function(){var N=this.get("fields"),O=true;C.Array.each(N,function(R,Q,P){R.set("error",null);if(R.validateField()===false){O=false;}});return O;},_enableInlineValidation:function(){var N=this.get("fields");C.Array.each(N,function(Q,P,O){Q.set("validateInline",true);});},_disableInlineValidation:function(){var N=this.get("fields");C.Array.each(N,function(Q,P,O){Q.set("validateInline",false);});},_handleIOSuccess:function(N,O){if(typeof this._ioIds[N]!="undefined"){delete this._ioIds[N];this.fire("success",{response:O});}},_handleIOFailure:function(N,O){if(typeof this._ioIds[N]!="undefined"){this.fire("failure",{response:O});delete this._ioIds[N];}},reset:function(){this._formNode.reset();var N=this.get("fields");C.Array.each(N,function(Q,P,O){Q.resetFieldNode();Q.set("error",null);});},submit:function(){if(this._runValidation()){var O=this.get("action"),P=this.get("method"),Q,N;N={method:P,form:{id:this._formNode},upload:(this.get("encodingType")===I.MULTIPART_ENCODED)};Q=C.io(O,N);this._ioIds[Q.id]=Q;}},getField:function(O){var N=this.get("fields"),P;if(C.Lang.isNumber(O)){return N[O];}else{if(C.Lang.isString(O)){C.Array.each(N,function(S,R,Q){if(S.get("name")==O){P=S;}});return P;}}},initializer:function(N){this._ioIds={};this.publish("submit");this.publish("reset");this.publish("success");this.publish("failure");},destructor:function(){this._formNode=null;},renderUI:function(){this._renderFormNode();this._renderFormFields();},bindUI:function(){this._formNode.on("submit",C.bind(function(N){N.halt();},this));this.after("inlineValidationChange",C.bind(function(N){if(N.newValue===true){this._enableInlineValidation();}else{this._disableInlineValidation();}},this));this.after("success",C.bind(function(N){if(this.get("resetAfterSubmit")===true){this.reset();}},this));C.on("io:success",C.bind(this._handleIOSuccess,this));C.on("io:failure",C.bind(this._handleIOFailure,this));},syncUI:function(){this._syncFormAttributes();if(this.get("inlineValidation")===true){this._enableInlineValidation();}}});C.Form=I;function D(){D.superclass.constructor.apply(this,arguments);}C.mix(D,{NAME:"form-field",ATTRS:{id:{value:C.guid(),validator:C.Lang.isString,writeOnce:true},name:{validator:C.Lang.isString,writeOnce:true},value:{value:"",validator:C.Lang.isString},label:{value:"",validator:C.Lang.isString},validator:{value:function(N){return true;},validator:function(N){return this._validateValidator(N);},setter:function(N){return this._setValidator(N);}},error:{value:false,validator:function(N){return this._validateError(N);}},required:{value:false,validator:C.Lang.isBoolean},validateInline:{value:false,validator:C.Lang.isBoolean}},tabIndex:1,VALIDATE_EMAIL_ADDRESS:function(P,O){var N=/^([\w]+(?:\.[\w]+)*)@((?:[\w]+\.)*\w[\w]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
if(N.test(P)===false){O.set("error",D.INVALID_EMAIL_MESSAGE);return false;}return true;},INVALID_EMAIL_MESSAGE:"Please enter a valid email address",VALIDATE_PHONE_NUMBER:function(P,O){var N=/^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;if(N.test(P)===false){O.set("error",D.INVALID_PHONE_NUMBER);return false;}return true;},INVALID_PHONE_NUMBER:"Please enter a valid phone number",VALIDATE_IP_ADDRESS:function(R,Q){var O=/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,N,P=true;if(O.test(R)===false){P=false;}N=R.split(".");C.Array.each(N,function(T,U,S){var V=parseInt(T,10);if(V<0||V>255){P=false;}});if(P===false){Q.set("error",D.INVALID_IP_MESSAGE);}return P;},INVALID_IP_MESSAGE:"Please enter a valid IP address",VALIDATE_DATE:function(P,O){var N=/^([1-9]|1[0-2])(\-|\/)([0-2][0-9]|3[0-1])(\-|\/)(\d{4}|\d{2})$/;if(N.test(P)===false){O.set("error",D.INVALID_DATE_MESSAGE);return false;}return true;},INVALID_DATE_MESSAGE:"Please enter a a valid date",VALIDATE_TIME:function(P,O){var N=/^([1-9]|1[0-2]):[0-5]\d(:[0-5]\d(\.\d{1,3})?)?$/;if(N.test(P)===false){O.set("error",D.INVALID_TIME_MESSAGE);return false;}return true;},INVALID_TIME_MESSAGE:"Please enter a valid time",VALIDATE_POSTAL_CODE:function(Q,P){var N,O=true;if(Q.length==6||Q.length==7){N=/^[a-zA-Z]\d[a-zA-Z](-|\s)?\d[a-zA-Z]\d$/;}else{if(Q.length==5||Q.length==10){N=/^\d{5}((-|\s)\d{4})?$/;}else{if(Q.length>0){O=false;}}}if(O===false||(N&&N.test(Q)===false)){P.set("error",D.INVALID_POSTAL_CODE_MESSAGE);return false;}return true;},INVALID_POSTAL_CODE_MESSAGE:"Please enter a valid postal code",VALIDATE_NO_SPECIAL_CHARS:function(P,O){var N=/^[a-zA-Z0-9]*$/;if(N.test(P)===false){O.set("error",D.INVALID_SPECIAL_CHARS);return false;}return true;},INVALID_SPECIAL_CHARS:"Please use only letters and numbers",INPUT_TEMPLATE:"<input />",LABEL_TEMPLATE:"<label></label>",REQUIRED_ERROR_TEXT:"This field is required"});C.extend(D,C.Widget,{_labelNode:null,_fieldNode:null,_errorNode:null,_nodeType:"text",_initialValue:null,_validateError:function(N){if(C.Lang.isString(N)){return true;}if(N===null||typeof N=="undefined"){return true;}return false;},_validateValidator:function(O){if(C.Lang.isString(O)){var N=/^(email|phone|ip|date|time|postal|special)$/;if(N.test(O)===true){return true;}}if(C.Lang.isFunction(O)){return true;}return false;},_setValidator:function(N){if(N=="email"){return D.VALIDATE_EMAIL_ADDRESS;}else{if(N=="phone"){return D.VALIDATE_PHONE_NUMBER;}else{if(N=="ip"){return D.VALIDATE_IP_ADDRESS;}else{if(N=="date"){return D.VALIDATE_DATE;}else{if(N=="time"){return D.VALIDATE_TIME;}else{if(N=="postal"){return D.VALIDATE_POSTAL_CODE;}else{if(N=="special"){return D.VALIDATE_NO_SPECIAL_CHARS;}}}}}}}return N;},_renderLabelNode:function(){var N=this.get("contentBox"),O=N.query("label");if(!O||O.get("for")!=this.get("id")){O=C.Node.create(D.LABEL_TEMPLATE);N.appendChild(O);}this._labelNode=O;},_renderFieldNode:function(){var N=this.get("contentBox"),O=N.query("#"+this.get("id"));if(!O){O=C.Node.create(D.INPUT_TEMPLATE);N.appendChild(O);}this._fieldNode=O;},_syncLabelNode:function(){if(this._labelNode){this._labelNode.setAttrs({innerHTML:this.get("label")});this._labelNode.setAttribute("for",this.get("id"));}},_syncFieldNode:function(){this._fieldNode.setAttrs({name:this.get("name"),type:this._nodeType,id:this.get("id"),value:this.get("value")});this._fieldNode.setAttribute("tabindex",D.tabIndex);D.tabIndex++;},_syncError:function(){var N=this.get("error");if(N){this._showError(N);}},_checkRequired:function(){if(this.get("required")===true&&this.get("value").length===0){return false;}return true;},_showError:function(O){var N=this.get("contentBox"),P=C.Node.create("<span>"+O+"</span>");P.addClass("error");N.insertBefore(P,this._labelNode);this._errorNode=P;},_clearError:function(){if(this._errorNode){var N=this.get("contentBox");N.removeChild(this._errorNode);this._errorNode=null;}},_enableInlineValidation:function(){this.after("valueChange",C.bind(this.validateField,this));},_disableInlineValidation:function(){this.detach("valueChange",this.validateField,this);},validateField:function(P){var O=this.get("value"),N=this.get("validator");this.set("error",null);if(P&&P.src!="ui"){return false;}if(!this._checkRequired()){this.set("error",D.REQUIRED_ERROR_TEXT);return false;}else{if(!O){return true;}}return N.call(this,O,this);},resetFieldNode:function(){this.set("value",this._initialValue);this._fieldNode.set("value",this._initialValue);this.fire("nodeReset");},clear:function(){this.set("value","");this._fieldNode.set("value","");this._initialValue=null;this.fire("clear");},initializer:function(){this.publish("blur");this.publish("change");this.publish("focus");this.publish("clear");this.publish("nodeReset");},destructor:function(N){},renderUI:function(){this._renderLabelNode();this._renderFieldNode();},bindUI:function(){this._fieldNode.on("change",C.bind(function(N){this.set("value",this._fieldNode.get("value"),{src:"ui"});this.fire("change",N);},this));this.on("valueChange",C.bind(function(N){if(N.src!="ui"){this._fieldNode.set("value",N.newVal);}},this));this._fieldNode.on("blur",C.bind(function(N){this.set("value",this._fieldNode.get("value"),{src:"ui"});this.fire("blur",N);},this));this._fieldNode.on("focus",C.bind(function(N){this.fire("focus",N);},this));this.on("errorChange",C.bind(function(N){if(N.newVal){this._showError(N.newVal);}else{this._clearError();}},this));this.on("validateInlineChange",C.bind(function(N){if(N.newVal===true){this._enableInlineValidation();}else{this._disableInlineValidation();}},this));},syncUI:function(){this.get("boundingBox").removeAttribute("tabindex");this._syncLabelNode();this._syncFieldNode();this._syncError();this._initialValue=this.get("value");if(this.get("validateInline")===true){this._enableInlineValidation();}}});C.FormField=D;function J(){J.superclass.constructor.apply(this,arguments);}C.mix(J,{NAME:"text-field"});C.extend(J,C.FormField,{_nodeType:"text"});
C.TextField=J;function A(){A.superclass.constructor.apply(this,arguments);}C.mix(A,{NAME:"password-field"});C.extend(A,C.FormField,{_nodeType:"password"});C.PasswordField=A;function F(){F.superclass.constructor.apply(this,arguments);}C.mix(F,{NAME:"checkbox-field",ATTRS:{"checked":{value:false,validator:C.Lang.isBoolean}}});C.extend(F,C.FormField,{_nodeType:"checkbox",_syncChecked:function(){this._fieldNode.set("checked",this.get("checked"));},initializer:function(){F.superclass.initializer.apply(this,arguments);},renderUI:function(){this._renderFieldNode();this._renderLabelNode();},syncUI:function(){F.superclass.syncUI.apply(this,arguments);this._syncChecked();},bindUI:function(){F.superclass.bindUI.apply(this,arguments);this.after("checkedChange",C.bind(function(N){if(N.src!="ui"){this._fieldNode.set("checked",N.newVal);}},this));this._fieldNode.after("change",C.bind(function(N){this.set("checked",N.currentTarget.get("checked"),{src:"ui"});},this));}});C.CheckboxField=F;function E(){E.superclass.constructor.apply(this,arguments);}C.mix(E,{NAME:"radio-field"});C.extend(E,C.CheckboxField,{_nodeType:"radio"});C.RadioField=E;function M(){M.superclass.constructor.apply(this,arguments);}C.mix(M,{NAME:"hidden-field",ATTRS:{displayValue:{value:false,writeOnce:true,validator:C.Lang.isBoolean}}});C.extend(M,C.FormField,{_nodeType:"hidden",_valueDisplayNode:null,_renderValueDisplayNode:function(){if(this.get("displayValue")===true){var O=C.Node.create("<div></div>"),N=this.get("contentBox");N.appendChild(O);this._valueDisplayNode=O;}},renderUI:function(){M.superclass.renderUI.apply(this,arguments);this._renderValueDisplayNode();},bindUI:function(){M.superclass.bindUI.apply(this,arguments);if(this.get("displayValue")===true){this.after("valueChange",C.bind(function(N,O){this._valueDisplayNode.set("innerHTML",O.newVal);},this,true));}},clear:function(){}});C.HiddenField=M;function G(){G.superclass.constructor.apply(this,arguments);}C.mix(G,{NAME:"textarea-field",NODE_TEMPLATE:"<textarea></textarea>"});C.extend(G,C.FormField,{_renderFieldNode:function(){var N=this.get("contentBox"),O=N.query("#"+this.get("id"));if(!O){O=C.Node.create(C.substitute(G.NODE_TEMPLATE,{name:this.get("name"),type:"text",id:this.get("id"),value:this.get("value")}));N.appendChild(O);}O.setAttribute("tabindex",C.FormField.tabIndex);C.FormField.tabIndex++;this._fieldNode=O;}});C.TextareaField=G;function L(){L.superclass.constructor.apply(this,arguments);}C.mix(L,{NAME:"choice-field",ATTRS:{choices:{validator:function(N){return this._validateChoices(N);}},multiple:{validator:C.Lang.isBoolean,value:false}}});C.extend(L,C.FormField,{_validateChoices:function(P){if(!C.Lang.isArray(P)){return false;}var O=0,N=P.length;for(;O<N;O++){if(!C.Lang.isObject(P[O])){delete P[O];continue;}if(!P[O].label||!C.Lang.isString(P[O].label)||!P[O].value||!C.Lang.isString(P[O].value)){delete P[O];continue;}}if(P.length===0){return false;}return true;},_renderLabelNode:function(){var N=this.get("contentBox"),O=C.Node.create("<span>"+this.get("label")+"</span>");N.appendChild(O);this._labelNode=O;},_renderFieldNode:function(){var N=this.get("contentBox"),O=this.get("choices");C.Array.each(O,function(U,S,R){var Q={value:U.value,id:(this.get("id")+"_choice"+S),name:this.get("name"),label:U.label},P=(this.get("multiple")===true?C.CheckboxField:C.RadioField),T=new P(Q);T.render(N);},this);this._fieldNode=N.all("input");},_syncFieldNode:function(){},clear:function(){this._fieldNode.each(function(O,N,P){O.setAttribute("checked",false);},this);this.set("value","");},bindUI:function(){this._fieldNode.on("change",C.bind(function(N){this._fieldNode.each(function(P,O,Q){if(P.get("checked")===true){this.set("value",P.get("value"));}},this);},this));}});C.ChoiceField=L;function B(){B.superclass.constructor.apply(this,arguments);}C.mix(B,{NAME:"select-field",NODE_TEMPLATE:"<select></select>",OPTION_TEMPLATE:"<option></option>",DEFAULT_OPTION_TEXT:"Choose one"});C.extend(B,C.ChoiceField,{_renderFieldNode:function(){var N=this.get("contentBox"),O=N.query("#"+this.get("id"));if(!O){O=C.Node.create(B.NODE_TEMPLATE);N.appendChild(O);}this._fieldNode=O;this._renderOptionNodes();},_renderOptionNodes:function(){var O=this.get("choices"),N;N=C.Node.create(B.OPTION_TEMPLATE);this._fieldNode.appendChild(N);C.Array.each(O,function(R,Q,P){N=C.Node.create(B.OPTION_TEMPLATE);this._fieldNode.appendChild(N);},this);},_syncFieldNode:function(){B.superclass.constructor.superclass._syncFieldNode.apply(this,arguments);this._fieldNode.setAttrs({multiple:(this.get("multiple")===true?"multiple":"")});},_syncOptionNodes:function(){var P=this.get("choices"),N=this.get("contentBox"),O=N.all("option");O.each(function(T,S,R){var Q=(S===0?B.DEFAULT_OPTION_TEXT:P[S-1].label),U=(S===0?"":P[S-1].value);T.setAttrs({innerHTML:Q,value:U});},this);},clear:function(){this._fieldNode.value="";},bindUI:function(){B.superclass.constructor.superclass.bindUI.apply(this,arguments);},syncUI:function(){B.superclass.syncUI.apply(this,arguments);this._syncOptionNodes();}});C.SelectField=B;function H(){H.superclass.constructor.apply(this,arguments);}C.mix(H,{NAME:"button",HTML_PARSER:{},ATTRS:{onclick:{validator:function(N){if(C.Lang.isObject(N)===false){return false;}if(typeof N.fn=="undefined"||C.Lang.isFunction(N.fn)===false){return false;}return true;},value:{fn:function(N){}},setter:function(N){N.scope=N.scope||this;N.argument=N.argument||{};return N;}}},NODE_TEMPLATE:"<button></button>"});C.extend(H,C.FormField,{_renderButtonNode:function(){var N=this.get("contentBox"),O;O=C.Node.create(H.NODE_TEMPLATE);N.appendChild(O);this._fieldNode=O;},_syncLabelNode:function(){},_syncFieldNode:function(){this._fieldNode.setAttrs({innerHTML:this.get("label"),id:this.get("id")});},_setClickHandler:function(){if(!this._fieldNode){return;}var N=this.get("onclick");C.Event.purgeElement(this._fieldNode,true,"click");C.on("click",C.bind(N.fn,N.scope,true),this._fieldNode);},renderUI:function(){this._renderButtonNode();},bindUI:function(){this.after("onclickChange",C.bind(this._setClickHandler,this,true));
this._setClickHandler();}});C.Button=H;function K(){K.superclass.constructor.apply(this,arguments);}C.mix(K,{NAME:"file-field",FILE_INPUT_TEMPLATE:'<input type="file" />'});C.extend(K,C.FormField,{_nodeType:"file",_renderFieldNode:function(){var N=this.get("contentBox"),O=N.query("#"+this.get("id"));if(!O){O=C.Node.create(K.FILE_INPUT_TEMPLATE);N.appendChild(O);}this._fieldNode=O;}});C.FileField=K;},"@VERSION@",{requires:["node","widget","io-form"]});
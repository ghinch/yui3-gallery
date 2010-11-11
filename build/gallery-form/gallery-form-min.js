YUI.add("gallery-form",function(A){A.Form=A.Base.create("form",A.Widget,[A.WidgetParent],{toString:function(){return this.name;},CONTENT_TEMPLATE:"<form></form>",_ioIds:null,_validateMethod:function(B){if(!A.Lang.isString(B)){return false;}if(B.toLowerCase()!="get"&&B.toLowerCase()!="post"){return false;}return true;},_parseAction:function(B){var C=B.one("form");if(!C){C=B;}if(C){return C.get("action");}},_parseMethod:function(B){var C=B.one("form");if(!C){C=B;}if(C){return C.get("method");}},_parseFields:function(C){var E=C.all("*"),F=C.all("label"),B=[],D={text:A.TextField,hidden:A.HiddenField,file:A.FileField,checkbox:A.CheckboxField,radio:A.RadioField,reset:A.ResetButton,submit:A.SubmitButton,button:(A.Button||A.FormButton)};E.each(function(J,H,G){var N=J.get("nodeName"),L=J.get("id"),I,K,M=[];if(N=="INPUT"){I=J.get("type");K={type:(D[I]?D[I]:A.TextField),name:J.get("name"),value:J.get("value"),checked:J.get("checked")};if(K.type==D.button){K.label=J.get("value");}}else{if(N=="BUTTON"){K={type:D.button,name:J.get("name"),label:J.get("innerHTML")};}else{if(N=="SELECT"){J.all("option").each(function(P,Q,O){M.push({label:P.get("innerHTML"),value:P.get("value")});});K={type:A.SelectField,name:J.get("name"),choices:M};}else{if(N=="TEXTAREA"){K={type:A.TextareaField,name:J.get("name"),value:J.get("innerHTML")};}}}}if(K){if(L){K.id=L;F.some(function(P,Q,O){if(P.get("htmlFor")==L){K.label=P.get("innerHTML");}});}B.push(K);}J.remove();});return B;},_syncFormAttributes:function(){var B=this.get("contentBox");B.setAttrs({action:this.get("action"),method:this.get("method")});if(this.get("encodingType")===A.Form.MULTIPART_ENCODED){B.setAttribute("enctype","multipart/form-data");}},_runValidation:function(){var B=true;this.each(function(C){C.set("error",null);if(C.validateField()===false){B=false;}});return B;},_enableInlineValidation:function(){this.each(function(B){B.set("validateInline",true);});},_disableInlineValidation:function(){this.each(function(B){B.set("validateInline",false);});},_handleIOEvent:function(D,B,C){if(this._ioIds[B]!==undefined){this.fire(D,{response:C});}},reset:function(){this.each(function(C){C.resetFieldNode();C.set("error",null);});var B=A.Node.getDOMNode(this.get("contentBox"));if(A.Lang.isFunction(B.reset)){B.reset();}},submit:function(){if(this.get("skipValidationBeforeSubmit")===true||this._runValidation()){var C=this.get("action"),E=this.get("method"),D=this.get("submitViaIO"),F,B;if(D===true){B={method:E,form:{id:this.get("contentBox"),upload:(this.get("encodingType")===A.Form.MULTIPART_ENCODED)}};F=A.io(C,B);this._ioIds[F.id]=F;}else{this.get("contentBox").submit();}}},getField:function(B){var C;if(A.Lang.isNumber(B)){C=this.item(B);}else{if(A.Lang.isString(B)){this.each(function(D){if(D.get("name")==B){C=D;}});}}return C;},initializer:function(B){this._ioIds={};this.publish("submit");this.publish("reset");this.publish("start");this.publish("success");this.publish("failure");this.publish("complete");this.publish("xdr");},destructor:function(){},renderUI:function(){},bindUI:function(){this.get("contentBox").on("submit",A.bind(function(B){B.halt();},this));this.after("inlineValidationChange",A.bind(function(B){if(B.newVal===true){this._enableInlineValidation();}else{this._disableInlineValidation();}},this));this.after("success",A.bind(function(B){if(this.get("resetAfterSubmit")===true){this.reset();}},this));A.on("io:start",A.bind(this._handleIOEvent,this,"start"));A.on("io:complete",A.bind(this._handleIOEvent,this,"complete"));A.on("io:xdr",A.bind(this._handleIOEvent,this,"xdr"));A.on("io:success",A.bind(this._handleIOEvent,this,"success"));A.on("io:failure",A.bind(this._handleIOEvent,this,"failure"));this.each(A.bind(function(B){if(B.name=="submit-button"){B.on("click",A.bind(this.submit,this));}else{if(B.name=="reset-button"){B.on("click",A.bind(this.reset,this));}}},this));},syncUI:function(){this._syncFormAttributes();if(this.get("inlineValidation")===true){this._enableInlineValidation();}}},{ATTRS:{defaultChildType:{valueFn:function(){return A.TextField;}},method:{value:"post",validator:function(B){return this._validateMethod(B);},setter:function(B){return B.toLowerCase();}},action:{value:".",validator:A.Lang.isString},fields:{setter:function(B){return this.set("children",B);}},inlineValidation:{value:false,validator:A.Lang.isBoolean},resetAfterSubmit:{value:true,validator:A.Lang.isBoolean},encodingType:{value:1,validator:A.Lang.isNumber},skipValidationBeforeSubmit:{value:false,validator:A.Lang.isBoolean},submitViaIO:{value:true,validator:A.Lang.isBoolean}},HTML_PARSER:{action:function(B){return this._parseAction(B);},method:function(B){return this._parseMethod(B);},children:function(B){return this._parseFields(B);}},FORM_TEMPLATE:"<form></form>",URL_ENCODED:1,MULTIPART_ENCODED:2});A.FormField=A.Base.create("form-field",A.Widget,[A.WidgetParent,A.WidgetChild],{toString:function(){return this.name;},_labelNode:null,_fieldNode:null,_errorNode:null,_initialValue:null,_validateError:function(B){if(A.Lang.isString(B)){return true;}if(B===null||typeof B=="undefined"){return true;}return false;},_validateValidator:function(C){if(A.Lang.isString(C)){var B=/^(email|phone|ip|date|time|postal|special)$/;if(B.test(C)===true){return true;}}if(A.Lang.isFunction(C)){return true;}return false;},_setValidator:function(C){var B={email:A.FormField.VALIDATE_EMAIL_ADDRESS,phone:A.FormField.VALIDATE_PHONE_NUMBER,ip:A.FormField.VALIDATE_IP_ADDRESS,date:A.FormField.VALIDATE_DATE,time:A.FormField.VALIDATE_TIME,postal:A.FormField.VALIDATE_POSTAL_CODE,special:A.FormField.VALIDATE_NO_SPECIAL_CHARS};return(B[C]?B[C]:C);},_renderLabelNode:function(){var B=this.get("contentBox"),C=B.one("label");if(!C||C.get("for")!=this.get("id")){C=A.Node.create(A.FormField.LABEL_TEMPLATE);B.appendChild(C);}this._labelNode=C;},_renderFieldNode:function(){var B=this.get("contentBox"),C=B.one("#"+this.get("id"));if(!C){C=A.Node.create(A.FormField.INPUT_TEMPLATE);B.appendChild(C);}this._fieldNode=C;},_syncLabelNode:function(){if(this._labelNode){this._labelNode.setAttrs({innerHTML:this.get("label")});
this._labelNode.setAttribute("for",this.get("id")+A.FormField.FIELD_ID_SUFFIX);}},_syncFieldNode:function(){var B=this.name.split("-")[0];if(!B){return;}this._fieldNode.setAttrs({name:this.get("name"),type:B,id:this.get("id")+A.FormField.FIELD_ID_SUFFIX,value:this.get("value")});this._fieldNode.setAttribute("tabindex",A.FormField.tabIndex);A.FormField.tabIndex++;},_syncError:function(){var B=this.get("error");if(B){this._showError(B);}},_syncDisabled:function(C){var B=this.get("disabled");if(B===true){this._fieldNode.setAttribute("disabled","disabled");}else{this._fieldNode.removeAttribute("disabled");}},_checkRequired:function(){if(this.get("required")===true&&this.get("value").length===0){return false;}return true;},_showError:function(C){var B=this.get("contentBox"),D=A.Node.create("<span>"+C+"</span>");D.addClass("error");B.insertBefore(D,this._labelNode);this._errorNode=D;},_clearError:function(){if(this._errorNode){var B=this.get("contentBox");B.removeChild(this._errorNode);this._errorNode=null;}},_enableInlineValidation:function(){this.after("valueChange",A.bind(this.validateField,this));},_disableInlineValidation:function(){this.detach("valueChange",this.validateField,this);},validateField:function(D){var C=this.get("value"),B=this.get("validator");this.set("error",null);if(D&&D.src!="ui"){return false;}if(!this._checkRequired()){this.set("error",A.FormField.REQUIRED_ERROR_TEXT);return false;}else{if(!C){return true;}}return B.call(this,C,this);},resetFieldNode:function(){this.set("value",this._initialValue);this._fieldNode.set("value",this._initialValue);this.fire("nodeReset");},clear:function(){this.set("value","");this._fieldNode.set("value","");this._initialValue=null;this.fire("clear");},initializer:function(){this.publish("blur");this.publish("change");this.publish("focus");this.publish("clear");this.publish("nodeReset");this._initialValue=this.get("value");},destructor:function(B){},renderUI:function(){this._renderLabelNode();this._renderFieldNode();},bindUI:function(){this._fieldNode.on("change",A.bind(function(B){this.set("value",this._fieldNode.get("value"),{src:"ui"});this.fire("change",B);},this));this.on("valueChange",A.bind(function(B){if(B.src!="ui"){this._fieldNode.set("value",B.newVal);}},this));this._fieldNode.on("blur",A.bind(function(B){this.set("value",this._fieldNode.get("value"),{src:"ui"});this.fire("blur",B);},this));this._fieldNode.on("focus",A.bind(function(B){this.fire("focus",B);},this));this.on("errorChange",A.bind(function(B){if(B.newVal){this._showError(B.newVal);}else{this._clearError();}},this));this.on("validateInlineChange",A.bind(function(B){if(B.newVal===true){this._enableInlineValidation();}else{this._disableInlineValidation();}},this));this.on("disabledChange",A.bind(function(B){this._syncDisabled();},this));},syncUI:function(){this.get("boundingBox").removeAttribute("tabindex");this._syncLabelNode();this._syncFieldNode();this._syncError();this._syncDisabled();if(this.get("validateInline")===true){this._enableInlineValidation();}}},{ATTRS:{id:{value:A.guid(),validator:A.Lang.isString,writeOnce:true},name:{validator:A.Lang.isString,writeOnce:true},value:{value:"",validator:A.Lang.isString},label:{value:"",validator:A.Lang.isString},validator:{value:function(B){return true;},validator:function(B){return this._validateValidator(B);},setter:function(B){return this._setValidator(B);}},error:{value:false,validator:function(B){return this._validateError(B);}},required:{value:false,validator:A.Lang.isBoolean},validateInline:{value:false,validator:A.Lang.isBoolean},disabled:{value:false,validator:A.Lang.isBoolean}},tabIndex:1,VALIDATE_EMAIL_ADDRESS:function(D,C){var B=/^([\w]+(?:\.[\w]+)*)@((?:[\w]+\.)*\w[\w]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;if(B.test(D)===false){C.set("error",A.FormField.INVALID_EMAIL_MESSAGE);return false;}return true;},INVALID_EMAIL_MESSAGE:"Please enter a valid email address",VALIDATE_PHONE_NUMBER:function(D,C){var B=/^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;if(B.test(D)===false){C.set("error",A.FormField.INVALID_PHONE_NUMBER);return false;}return true;},INVALID_PHONE_NUMBER:"Please enter a valid phone number",VALIDATE_IP_ADDRESS:function(F,E){var C=/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,B,D=true;if(C.test(F)===false){D=false;}B=F.split(".");A.Array.each(B,function(H,I,G){var J=parseInt(H,10);if(J<0||J>255){D=false;}});if(D===false){E.set("error",A.FormField.INVALID_IP_MESSAGE);}return D;},INVALID_IP_MESSAGE:"Please enter a valid IP address",VALIDATE_DATE:function(D,C){var B=/^([1-9]|1[0-2])(\-|\/)([0-2][0-9]|3[0-1])(\-|\/)(\d{4}|\d{2})$/;if(B.test(D)===false){C.set("error",A.FormField.INVALID_DATE_MESSAGE);return false;}return true;},INVALID_DATE_MESSAGE:"Please enter a a valid date",VALIDATE_TIME:function(D,C){var B=/^([1-9]|1[0-2]):[0-5]\d(:[0-5]\d(\.\d{1,3})?)?$/;if(B.test(D)===false){C.set("error",A.FormField.INVALID_TIME_MESSAGE);return false;}return true;},INVALID_TIME_MESSAGE:"Please enter a valid time",VALIDATE_POSTAL_CODE:function(E,D){var B,C=true;if(E.length==6||E.length==7){B=/^[a-zA-Z]\d[a-zA-Z](-|\s)?\d[a-zA-Z]\d$/;}else{if(E.length==5||E.length==10){B=/^\d{5}((-|\s)\d{4})?$/;}else{if(E.length>0){C=false;}}}if(C===false||(B&&B.test(E)===false)){D.set("error",A.FormField.INVALID_POSTAL_CODE_MESSAGE);return false;}return true;},INVALID_POSTAL_CODE_MESSAGE:"Please enter a valid postal code",VALIDATE_NO_SPECIAL_CHARS:function(D,C){var B=/^[a-zA-Z0-9]*$/;if(B.test(D)===false){C.set("error",A.FormField.INVALID_SPECIAL_CHARS);return false;}return true;},INVALID_SPECIAL_CHARS:"Please use only letters and numbers",INPUT_TEMPLATE:"<input />",LABEL_TEMPLATE:"<label></label>",REQUIRED_ERROR_TEXT:"This field is required",FIELD_ID_SUFFIX:"-field"});A.TextField=A.Base.create("text-field",A.FormField,[A.WidgetChild]);A.PasswordField=A.Base.create("password-field",A.FormField,[A.WidgetChild]);A.CheckboxField=A.Base.create("checkbox-field",A.FormField,[A.WidgetChild],{_syncChecked:function(){this._fieldNode.set("checked",this.get("checked"));
},initializer:function(){A.CheckboxField.superclass.initializer.apply(this,arguments);},syncUI:function(){A.CheckboxField.superclass.syncUI.apply(this,arguments);this._syncChecked();},bindUI:function(){A.CheckboxField.superclass.bindUI.apply(this,arguments);this.after("checkedChange",A.bind(function(B){if(B.src!="ui"){this._fieldNode.set("checked",B.newVal);}},this));this._fieldNode.after("change",A.bind(function(B){this.set("checked",B.currentTarget.get("checked"),{src:"ui"});},this));}},{ATTRS:{"checked":{value:false,validator:A.Lang.isBoolean}}});A.RadioField=A.Base.create("radio-field",A.FormField,[A.WidgetChild]);A.HiddenField=A.Base.create("hidden-field",A.FormField,[A.WidgetChild],{_valueDisplayNode:null,_renderValueDisplayNode:function(){if(this.get("displayValue")===true){var C=A.Node.create("<div></div>"),B=this.get("contentBox");B.appendChild(C);this._valueDisplayNode=C;}},renderUI:function(){A.HiddenField.superclass.renderUI.apply(this,arguments);this._renderValueDisplayNode();},bindUI:function(){A.HiddenField.superclass.bindUI.apply(this,arguments);if(this.get("displayValue")===true){this.after("valueChange",A.bind(function(B,C){this._valueDisplayNode.set("innerHTML",C.newVal);},this,true));}},clear:function(){}},{ATTRS:{displayValue:{value:false,writeOnce:true,validator:A.Lang.isBoolean}}});A.TextareaField=A.Base.create("textarea-field",A.FormField,[A.WidgetChild],{_renderFieldNode:function(){var B=this.get("contentBox"),C=B.one("#"+this.get("id"));if(!C){C=A.Node.create(A.TextareaField.NODE_TEMPLATE);C.setAttrs({name:this.get("name"),innerHTML:this.get("value")});B.appendChild(C);}C.setAttribute("tabindex",A.FormField.tabIndex);A.FormField.tabIndex++;this._fieldNode=C;}},{NODE_TEMPLATE:"<textarea></textarea>"});A.ChoiceField=A.Base.create("choice-field",A.FormField,[A.WidgetParent,A.WidgetChild],{_validateChoices:function(D){if(!A.Lang.isArray(D)){return false;}var C=0,B=D.length;for(;C<B;C++){if(!A.Lang.isObject(D[C])){delete D[C];continue;}if(!D[C].label||!A.Lang.isString(D[C].label)||!D[C].value||!A.Lang.isString(D[C].value)){delete D[C];continue;}}if(D.length===0){return false;}return true;},_renderLabelNode:function(){var B=this.get("contentBox"),C=A.Node.create("<span></span>");C.set("innerHTML",this.get("label"));B.appendChild(C);this._labelNode=C;},_renderFieldNode:function(){var D=this.get("contentBox"),E=this.get("choices"),B=this.get("multi"),C=(B===true?A.CheckboxField:A.RadioField);A.Array.each(E,function(J,H,G){var F={value:J.value,id:(this.get("id")+"_choice"+H),name:this.get("name"),label:J.label},I=new C(F);I.render(D);},this);this._fieldNode=D.all("input");},_syncFieldNode:function(){},clear:function(){this._fieldNode.each(function(C,B,D){C.setAttribute("checked",false);},this);this.set("value","");},bindUI:function(){this._fieldNode.on("change",A.bind(function(B){this._fieldNode.each(function(D,C,E){if(D.get("checked")===true){this.set("value",D.get("value"));}},this);},this));}},{ATTRS:{choices:{validator:function(B){return this._validateChoices(B);}},multi:{validator:A.Lang.isBoolean,value:false}}});A.SelectField=A.Base.create("select-field",A.ChoiceField,[A.WidgetParent,A.WidgetChild],{_renderFieldNode:function(){var B=this.get("contentBox"),C=B.one("#"+this.get("id"));if(!C){C=A.Node.create(A.SelectField.NODE_TEMPLATE);B.appendChild(C);}this._fieldNode=C;this._renderOptionNodes();},_renderOptionNodes:function(){var C=this.get("choices"),B;if(this.get("useDefaultOption")===true){B=A.Node.create(A.SelectField.OPTION_TEMPLATE);this._fieldNode.appendChild(B);}A.Array.each(C,function(F,E,D){B=A.Node.create(A.SelectField.OPTION_TEMPLATE);this._fieldNode.appendChild(B);},this);},_syncFieldNode:function(){A.SelectField.superclass.constructor.superclass._syncFieldNode.apply(this,arguments);this._fieldNode.setAttrs({multiple:(this.get("multi")===true?"multiple":"")});},_syncOptionNodes:function(){var F=this.get("choices"),B=this.get("contentBox"),D=B.all("option"),E=this.get("useDefaultOption"),C=this.get("value");if(E===true){F.unshift({label:A.SelectField.DEFAULT_OPTION_TEXT,value:""});}D.each(function(J,I,H){var G=F[I].label,K=F[I].value;J.setAttrs({innerHTML:G,value:K});if(C==K){J.setAttrs({selected:true,defaultSelected:true});}},this);},clear:function(){this._fieldNode.value="";},bindUI:function(){A.SelectField.superclass.constructor.superclass.bindUI.apply(this,arguments);},syncUI:function(){A.SelectField.superclass.syncUI.apply(this,arguments);this._syncOptionNodes();}},{NODE_TEMPLATE:"<select></select>",OPTION_TEMPLATE:"<option></option>",DEFAULT_OPTION_TEXT:"Choose one",ATTRS:{useDefaultOption:{validator:A.Lang.isBoolean,value:true}}});A.FormButton=A.Base.create("button-field",A.FormField,[A.WidgetChild],{_renderButtonNode:function(){var B=this.get("contentBox"),C;C=A.Node.create(A.FormButton.NODE_TEMPLATE);B.appendChild(C);this._fieldNode=C;},_syncLabelNode:function(){},_syncFieldNode:function(){this._fieldNode.setAttrs({innerHTML:this.get("label"),id:this.get("id")});this.get("contentBox").addClass("first-child");},_setClickHandler:function(){if(!this._fieldNode){return;}var B=this.get("onclick");A.Event.purgeElement(this._fieldNode,true,"click");A.on("click",A.bind(B.fn,B.scope,true),this._fieldNode);},renderUI:function(){this._renderButtonNode();},bindUI:function(){this.after("onclickChange",A.bind(this._setClickHandler,this,true));this._setClickHandler();}},{ATTRS:{onclick:{validator:function(B){if(A.Lang.isObject(B)===false){return false;}if(typeof B.fn=="undefined"||A.Lang.isFunction(B.fn)===false){return false;}return true;},value:{fn:function(B){}},setter:function(B){B.scope=B.scope||this;B.argument=B.argument||{};return B;}}},NODE_TEMPLATE:"<button></button>"});A.FileField=A.Base.create("file-field",A.FormField,[A.WidgetChild],{_renderFieldNode:function(){var B=this.get("contentBox"),C=B.one("#"+this.get("id"));if(!C){C=A.Node.create(A.FileField.FILE_INPUT_TEMPLATE);B.appendChild(C);}this._fieldNode=C;}},{FILE_INPUT_TEMPLATE:'<input type="file" />'});
A.SubmitButton=A.Base.create("submit-button",A.FormField,[A.WidgetChild],{_renderLabelNode:function(){}});A.ResetButton=A.Base.create("reset-button",A.FormField,[A.WidgetChild],{_renderLabelNode:function(){}});},"@VERSION@",{requires:["node","widget-base","widget-htmlparser","io-form","widget-parent","widget-child","base-build","substitute"]});
YUI.add('gallery-form', function(Y) {

/**
 * Create a form object that can handle both client and server side validation
 *
 * @module form
 */


/**
 * Creates an form which contains fields, and does clientside validation, as well
 * as handling input from the server.
 *
 * @class Form
 * @extends Widget
 * @param config {Object} Configuration object
 * @constructor
 */
function Form () {
    Form.superclass.constructor.apply(this,arguments);
}

Y.mix(Form, {
    NAME : 'form',
    
    ATTRS : {
        method : {
            value : 'post',
            validator : function (val) {
                return this._validateAction(val);
            },
            setter : function (val) {
                return val.toLowerCase();
            }
        },
        action : {
            value : '',
            validator : Y.Lang.isString
        },
        fields : {
			writeOnce : true,
            validator : function (val) {
                return this._validateFields(val);
            },
            setter : function (fields) {
				fields = fields || [];
                var i=0, l=fields.length, f, fieldType, t;

		        for (;i<l;i++) {
		            
		            if (!fields[i]._classes) {
		                t = fields[i].type;
		                if (Y.Lang.isFunction(t)) {
		                    fieldType = t;
		                } else {
		                    if (t == 'hidden') {
		                        fieldType = Y.HiddenField;
		                    } else if (t == 'checkbox') {
		                        fieldType = Y.CheckboxField;
		                    } else if (t == 'textarea') {
		                        fieldType = Y.TextareaField;
		                    } else if (t == 'select') {
		                        fieldType = Y.SelectField;
		                    } else if (t == 'choice') {
		                        fieldType = Y.ChoiceField;
							} else if (t == 'button' || t == 'submit' || t == 'reset') {
								fieldType = Y.Button;
                                if (t =='submit') {
                                    fields[i].onclick = {
                                        fn : this.submit,
                                        scope : this
                                    };
                                } else if (t == 'reset') {
                                    fields[i].onclick = {
                                        fn : this.reset,
                                        scope : this
                                    };
                                }
		                    } else {
		                        fieldType = Y.TextField;
		                    }
		                }
		                
		                f = new fieldType(fields[i]);
		                fields[i] = f;
		            }
		        }
		        return fields;
            }
            
        },
        errors : {
            validator : function(val) {
                if (!Y.Lang.isArray(val)) {
                    return false;
                }

                var valid = true, i = 0, l = val.length;
                for (;i<l;i++) {
                    if (!Y.Lang.isObject(val[i]) ||
                        !val[i].name ||
                        !val[i].message) {
                        valid = false;
                        break;
                    }
                }
                return valid;
            }
        }
    },

	HTML_PARSER : {
		form : 'form',
		fields : function(contentBox) {
			var children = contentBox.all('*'),
				labels = contentBox.all('label'),
				fields = [];
			
			children.each(function(node, index, nodeList) {
				var nodeName = node.get('nodeName'), 
					nodeId = node.get('id'),
					o, c = [];
				if (nodeName == 'INPUT') {
					o = {
						type: node.get('type'),
						name : node.get('name'),
						value : node.get('value')
					};

					if (o.type == 'submit' || o.type == 'reset' || o.type == 'button') {
						o.label = node.get('value');
					}
				} else if (nodeName == 'BUTTON') {
					o = {
						type : 'button',
						name : node.get('name'),
						label : node.get('innerHTML')
					};
				} else if (nodeName == 'SELECT') {
					node.all('option').each(function (optNode, optNodeIndex, optNodeList) {
						c.push({
							label : optNode.get('innerHTML'),
							value : optNode.get('value')
						});
					});
					o = {
						type : 'select',
						name : node.get('name'),
						choices : c
					};
				}
				
				if (o) {
					if (nodeId) {
						o.id = nodeId;
						labels.some(function(labelNode, labelNodeIndex, labelNodeList) {
							if (labelNode.get('htmlFor') == nodeId) {
								o.label = labelNode.get('innerHTML');
							}
						});
					}
					fields.push(o);
				}
				node.remove();
			});

			return fields;
		}
    },

    FORM_TEMPLATE : '<form method="{method}" action="{action}"></form>'
});

Y.extend(Form, Y.Widget, {
    _formNode : null,
    
    _fields : null,
    
    _io : null,
    
    _validateAction : function (val) {
        if (!Y.Lang.isString(val)) {
            return false;
        }
        if (val.toLowerCase() != 'get' && val.toLowerCase() != 'post') {
            return false;
        }
        return true;    
    },
    
    _validateFields : function (val) {
        if (!Y.Lang.isArray(val)) {
            return false;
        }

        for (var i=0,l=val.length;i<l;i++) {
            if (val[i]._classes) {
                continue;
            } else if (Y.Lang.isObject(val[i])) {
                if (!val[i].name) {
                    return false;
                }
                continue;
            } else {
                return false;
            }
        }
        return true;
    },
            
    initializer : function (config) {
        this._io = {};

        this.publish('formSubmit');
        this.publish('formReset');
    },
    
    destructor : function () {
        this._formNode = null;
    },
        
    _renderFormNode : function () {
        var contentBox = this.get('contentBox'),
            form = contentBox.query('form');

        if (!form) {
            form = Y.Node.create(Y.substitute(Form.FORM_TEMPLATE, {
                method : this.get('method'),
                action : this.get('action')
            }));
            contentBox.appendChild(form);
        }
        
        form.set('id',Y.guid());
        
        this._formNode = form;
    },
    
    _renderFormFields : function() {
        var fields = this.get('fields'),
            i=0, l=fields.length;

        for (;i<l;i++) {
			fields[i].render(this._formNode);
		}
    },
    
    renderUI : function () {
        this._renderFormNode();
        this._renderFormFields();
    },
    
    bindUI : function () {
        Y.on('submit', Y.bind(function (bool, e) {
            e.halt();
        }, this, true), this._formNode);

        Y.on('io:failure', Y.bind(function (bool, ioId, response) {
            if (this._io.ioId) {
                delete this._io.ioId;
                this._handleIOFailure(response);
            }
        }, this, true));

        Y.on('io:success', Y.bind(function(bool, ioId, response) {
            if (typeof this._io[ioId] != 'undefined') {
                delete this._io.ioId;
                this._handleIOSuccess(response);
            }
        }, this, true));
    },
    
    _setFormAttributes : function () {
        this._formNode.setAttribute('action', this.get('action'));
        this._formNode.setAttribute('method', this.get('method'));    
    },
    
    _setErrors : function () {
        var errors = this.get('errors'), field, i = 0, l = errors.length;
        
        for (;i<l;i++) {
            field = this.getField(errors[i].name);
            if (field) {
                field.showError(errors[i].message);            
            }
        }
        
        this.reset('errors');
    },
    
    syncUI : function () {
        this._setFormAttributes();
        if (this.get('errors')) {
            this._setErrors();
        }
		this.get('boundingBox').removeAttribute('tabindex');
    },
        
    _validateForm : function () {
        var fields = this.get('fields'),
            i=0, l=fields.length,
            isValid = true,
            result;
                
        for (;i<l;i++) {
            result = fields[i].validate();
            if (result === false) {
                isValid = false;
            }
        }
                
        return isValid;
    },

    _handleIOSuccess : function (ioResponse) {
        this.reset();
        this.fire('success', {response : ioResponse});
    },

    _handleIOFailure : function (ioResponse) {
        this.fire('failure', {response : ioResponse});
    },


    
    submit : function () {
        if (this._validateForm()) {
            var a = this.get('action'),
                m = this.get('method'),
                i = this._formNode.get('id'),
                cfg = {
                    method : m,
                    form : {id : i}
                },
                transaction = Y.io(a, cfg);

            this._io[transaction.id] = transaction;
        }
    },
    
    getField : function (selector) {
        var fields = this.get('fields'), i=0, l=fields.length;
        if (Y.Lang.isNumber(selector)) {
            return fields[selector];
        } else if (Y.Lang.isString(selector)) {
            for (;i<l;i++) {
                if (fields[i].get('name') == selector) {
                    return fields[i];
                }
            }
        }
    },
    
    clearErrors : function () {
        for (var fields=this.get('fields'), i=0, l=fields.length;i<l;i++) {
            fields[i].clearError();
        }
    },
    
    reset : function () {
        this.clearErrors();
        this._formNode.reset();
        for (var fields=this.get('fields'), i=0, l=fields.length;i<l;i++) {
            fields[i].clear();
        }
    }
});

Y.Form = Form;
/**
 * @class FormField
 * @extends Widget
 * @param config {Object} Configuration object
 * @constructor
 * @description A representation of an individual form field.
 */
function FormField () {
    FormField.superclass.constructor.apply(this,arguments);
}

Y.mix(FormField, {
    
    /**
     * @property FormField.NAME
     * @type String
     * @static
     * @description The identity of the widget.
     */
    NAME : 'form-field',
    
    /**
     * @property FormField.ATTRS
     * @type Object
     * @protected
     * @static
     * @description Static property used to define the default attribute configuration of
     * the Widget.
     */    
    ATTRS : {
        /**
         * @attribute id
         * @type String
         * @default Either a user defined ID or a randomly generated by Y.guid()
         * @description A randomly generated ID that will be assigned to the field and used 
         * in the label's for attribute
         */
        id : {
            value : Y.guid()
        },
                
        /**
         * @attribute name
         * @type String
         * @default ""
         * @writeOnce
         * @description The name attribute to use on the field
         */        
        name : {
            value : '',
            validator : Y.Lang.isString,
            writeOnce : true
        },
        
        /**
         * @attribute value
         * @type String
         * @default ""
         * @description The current value of the form field
         */
        value : {
            value : '',
            validator : Y.Lang.isString
        },
        
        /**
         * @attribute label
         * @type String
         * @default ""
         * @description Label of the form field
         */
        label : {
            value : '',
            validator : Y.Lang.isString
        },
        
        /**
         * @attribute validator
         * @type Function
         * @default function () { return true; }
         * @description Used to validate this field by the Form class
         */
        validator : {
            value : function (val) {
                return true;
            },
            validator : Y.Lang.isFunction
        },
        
        /**
         * @attribute required
         * @type Boolean
         * @default false
         * @description Set true if this field must be filled out when submitted
         */
        required : {
            value : false,
            validator : Y.Lang.isBoolean
        }
    },

	tabIndex : 0,

    INPUT_TEMPLATE : '<input type="{type}" name="{name}" id="{id}" value="{value}">',
    TEXTAREA_TEMPLATE : '<textarea name="{name}" id="{id}">{value}</textarea>',
    LABEL_TEMPLATE : '<label for="{id}">{label}</label>',
    SELECT_TEMPLATE : '<select name="{name}" id="{id}" {multiple}></select>'
});

Y.extend(FormField, Y.Widget, {
    /**
     * @property _labelNode
     * @protected
     * @type Object
     * @description The label node for this form field
     */
    _labelNode : null,

    /**
     * @property _fieldNode
     * @protected
     * @type Object
     * @description The form field itself
     */    
    _fieldNode : null,

    /**
     * @property _errorNode
     * @protected
     * @type Object
     * @description If a validation error occurs, it will be displayed in this node
     */    
    _errorNode : null,
    
    _nodeType : 'text',
    
    /**
     * @method initializer
     * @description Initializes the various methods
     */
    initializer : function () {
        this.publish('blur');
        this.publish('change');
        this.publish('focus');
    },
    destructor : function (config) {
    
    },

    _renderLabelNode : function () {
        var contentBox = this.get('contentBox'),
            labelNode = contentBox.query('label');
        
        if (!labelNode || labelNode.get('for') != this.get('id')) {
            labelNode = Y.Node.create(Y.substitute(FormField.LABEL_TEMPLATE, {
                label : this.get('label'),
                id : this.get('id')
            }));
            contentBox.appendChild(labelNode);
        }
        
        this._labelNode = labelNode;     
    },
    
    _renderFieldNode : function () {
        var contentBox = this.get('contentBox'),
            field = contentBox.query('#' + this.get('id'));
                
        if (!field) {
            field = Y.Node.create(Y.substitute(FormField.INPUT_TEMPLATE, {
                name : this.get('name'), 
                type : this._nodeType,
                id : this.get('id'),
                value : this.get('value')
            }));
            contentBox.appendChild(field);
        }

		field.setAttribute('tabindex', FormField.tabIndex);
		FormField.tabIndex++;

        this._fieldNode = field;
    },
    
    showError : function (errMsg) {
        var contentBox = this.get('contentBox'),
            errorNode = Y.Node.create('<span>' + errMsg + '</span>');
        
        errorNode.addClass('error');
        console.log(this._labelNode);
        contentBox.insertBefore(errorNode,this._labelNode);
        
        this._errorNode = errorNode;
    },
    
    clearError : function () {
        if (this._errorNode) {
            var contentBox = this.get('contentBox');
            contentBox.removeChild(this._errorNode);
            this._errorNode = null;
        }
    },
    
    _checkRequired : function () {
        var ok = true;
        if (this.get('required') === true && this.get('value').length === 0) {
            ok = false;
        }
        return ok;
    },
    
    validate : function () {
        var value = this.get('value'),
            validator = this.get('validator');

        this.clearError();

        if (!this._checkRequired()) {
            this.showError('This field is required');
            return false;
        }

                            
        return validator.call(this, value);
    },

    /**
     * @method renderUI
     * @description Draws the UI elements of the field
     */    
    renderUI : function () {
        this._renderLabelNode();
        this._renderFieldNode();
    },

    bindUI : function () {
        if (this._fieldNode) {
            this._fieldNode.on('change', Y.bind(function (e) {
                this.set('value', this._fieldNode.get('value'));
            }, this, true));
        }
        
        this.on('valueChange', Y.bind(function (b, e) {
            this._fieldNode.set('value', e.newVal);
        }, this, true)); 
    },
    /**
     * Synchronizes the DOM state with the attribute settings
     *
     * @method syncUI
     */    
    syncUI : function () {
		this.get('boundingBox').removeAttribute('tabindex');
    },

    /**
     * Clears the value of this field
     *
     * @method clear
     */
     clear : function () {
        this.set('value', '');
        this._fieldNode.set('value', '');
    }
});

Y.FormField = FormField;
/**
 * @class TextField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A text field node
 */
function TextField () {
    TextField.superclass.constructor.apply(this,arguments);
}

Y.mix(TextField, {
    NAME : 'text-field'
    
});

Y.extend(TextField, Y.FormField, {
    _nodeType : 'text'
});

Y.TextField = TextField;
/**
 * @class CheckboxField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A checkbox field node
 */
function CheckboxField () {
    CheckboxField.superclass.constructor.apply(this,arguments);
}

Y.mix(CheckboxField, {
    NAME : 'checkbox-field'
    
});

Y.extend(CheckboxField, Y.FormField, {
    _nodeType : 'checkbox'
});

Y.CheckboxField = CheckboxField;
/**
 * @class HiddenField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A hidden field node
 */
function HiddenField () {
    HiddenField.superclass.constructor.apply(this,arguments);
}

Y.mix(HiddenField, {
    NAME : 'hidden-field',

	ATTRS : {
		displayValue : {
			value : false,
			validator : Y.Lang.isBoolean
		}
	}

});

Y.extend(HiddenField, Y.FormField, {
    _nodeType : 'hidden',

	_valueDisplayNode : null,

	renderUI : function () {
		HiddenField.superclass.renderUI.apply(this, arguments);
		
		if (this.get('displayValue') === true) {
			var div = Y.Node.create('<div></div>'),
				contentBox = this.get('contentBox');

			contentBox.appendChild(div);
			this._valueDisplayNode = div;
		}
	},

	bindUI : function () {
		HiddenField.superclass.bindUI.apply(this, arguments);

		if (this.get('displayValue') === true) {
			this.after('valueChange', Y.bind(function(m, e) {
				this._valueDisplayNode.set('innerHTML', e.newVal);
			}, this, true));
		}
	}
});

Y.HiddenField = HiddenField;
/**
 * @class TextareaField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A hidden field node
 */
function TextareaField () {
    TextareaField.superclass.constructor.apply(this,arguments);
}

Y.mix(TextareaField, {
    NAME : 'textarea-field'
    
});

Y.extend(TextareaField, Y.FormField, {
    _renderFieldNode : function () {
        var contentBox = this.get('contentBox'),
            field = contentBox.query('#' + this.get('id'));
                
        if (!field) {
            field = Y.Node.create(Y.substitute(FormField.TEXTAREA_TEMPLATE, {
                name : this.get('name'), 
                type : 'text',
                id : this.get('id'),
                value : this.get('value')
            }));
            contentBox.appendChild(field);
        }

		field.setAttribute('tabindex', Y.FormField.tabIndex);
		Y.FormField.tabIndex++;
        
        this._fieldNode = field;
    }
});

Y.TextareaField = TextareaField;
/**
 * @class SelectField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A hidden field node
 */
function SelectField () {
    SelectField.superclass.constructor.apply(this,arguments);
}

Y.mix(SelectField, {
    NAME : 'select-field',
    
    ATTRS : {
        choices : {
            validator : function (val) {
                if (!Y.Lang.isArray(val)) {
                    return false;
                }
                
                for (var i=0, l=val.length;i<l;i++) {
                    if (!Y.Lang.isObject(val[i])) {
                        return false;
                    }
                    if (!val[i].label || !Y.Lang.isString(val[i].label) || !val[i].value || !Y.Lang.isString(val[i].value)) {
                        return false;
                    }
                }
                
                return true;
            }
        },
        multiple : {
            validator : Y.Lang.isBoolean,
            value : false
        }
    }    
});

Y.extend(SelectField, Y.FormField, {
    _renderFieldNode : function () {
        var contentBox = this.get('contentBox'),
            field = contentBox.query('#' + this.get('id'));
                
        if (!field) {
            field = Y.Node.create(Y.substitute(FormField.SELECT_TEMPLATE, {
                name : this.get('name'), 
                id : this.get('id'),
                multiple : (this.get('multiple') === true ? 'multiple' : '')
            }));
            contentBox.appendChild(field);
        }
        
        this._fieldNode = field;

        this._renderOptionNodes();
    },
    
    _renderOptionNodes : function () {
        var choices = this.get('choices'),
            i=0, l=choices.length, 
            elOption;
        
        if (this.get('multiple') === false) {
            this._fieldNode.appendChild(new Option('Choose one', ''));
        }
        
        for(;i<l;i++) {
            elOption = new Option(choices[i].label, choices[i].value);
            this._fieldNode.appendChild(elOption);
        }
    },
    
    clear : function () {
        this._fieldNode.value = '';
    }
});

Y.SelectField = SelectField;
/**
 * @class ChoiceField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A form field which allows one or multiple values from a 
 * selection of choices
 */
function ChoiceField() {
    ChoiceField.superclass.constructor.apply(this,arguments);
}

Y.mix(ChoiceField, {
    NAME : 'choice-field'
});

Y.extend(ChoiceField, Y.SelectField, {
    _choiceNodes : null,
    
    _renderLabelNode : function () {
        var contentBox = this.get('contentBox'),
            titleNode = Y.Node.create('<span>' + this.get('label') + '</span>');
        
        contentBox.appendChild(titleNode);
        
        this._labelNode = titleNode;
    },
    
    _renderFieldNode : function () {
        var contentBox = this.get('contentBox'),
            choices = this.get('choices'),
            i=0, l=choices.length,
            elLabel, elField, nId;
        
        this._choiceNodes = [];
        
        for(;i<l;i++) {
            nId = Y.guid();
            
            elLabel = Y.Node.create(Y.substitute(FormField.LABEL_TEMPLATE, {
                label : choices[i].label,
                id : nId
            }));
            
            contentBox.appendChild(elLabel);
            
            elField = Y.Node.create(Y.substitute(FormField.INPUT_TEMPLATE, {
                name : this.get('name'), 
                type : (this.get('multiple') === true ? 'checkbox' : 'radio'),
                id : nId,
                value : choices[i].value
            }));
            
            contentBox.appendChild(elField);
            
            this._choiceNodes.push({label : elLabel, field : elField});
        }
    },
            
    _checkRequired : function () {
        var ok = false, choices = this._choiceNodes, i=0, l=choices.length;
        
        if (this.get('required')) {
            for (; i<l; i++) {
                if (choices[i].field.get('checked') === true) {
                    ok = true;
                    break;
                }
            }
        }
        
        return ok;
    },
    
    clear : function () {
        var choices = this.choiceNodes, i=0, l=choices.length;

        for (;i<l;i++) {
            choices[i].field.checked = false;
        }
        
        this.set('value', '');
    }
});

Y.ChoiceField = ChoiceField;
function Button () {
    Button.superclass.constructor.apply(this,arguments);
}

Y.mix(Button, {
    NAME : 'button',
    
    HTML_PARSER : {
        
    },

    ATTRS : {
        onclick : {
			validator : function (val) {
				if (Y.Lang.isObject(val) === false) {
					return false;
				}
				if (typeof val.fn == 'undefined' ||
					Y.Lang.isFunction(val.fn) === false) {
					return false;
				}
				return true;
			},
			value : {
				fn : function (e) {

				}
			},
            setter : function (val) {
                val.scope = val.scope || this;
                val.argument = val.argument || {};
                return val;
            }
        }
    },

    NODE_TEMPLATE : '<button id="{id}">{label}</button>'
});

Y.extend(Button, Y.FormField, {
    _renderButtonNode : function () {
        var contentBox = this.get('contentBox'), bn;
        
        bn = Y.Node.create(Y.substitute(Button.NODE_TEMPLATE, {
            label : this.get('label'),
            id : this.get('id')
        }));
        contentBox.appendChild(bn);
        this._fieldNode = bn;
    },

	_setClickHandler : function () {
		if (!this._fieldNode) {
			return;
		}

		var oc = this.get('onclick');
		Y.Event.purgeElement(this._fieldNode, true, 'click');
		Y.on('click', Y.bind(oc.fn, oc.scope, true), this._fieldNode);
	},

	renderUI : function () {
		this._renderButtonNode();
	},

	bindUI : function () {
		this.after('onclickChange', Y.bind(this._setClickHandler, this, true));
	},

	syncUI : function () {
		Button.superclass.syncUI.apply(this, arguments);
		this._setClickHandler();
	}
});

Y.Button = Button;


}, '@VERSION@' ,{requires:['node', 'attribute', 'widget', 'io-form', 'substitute']});

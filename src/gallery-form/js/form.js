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

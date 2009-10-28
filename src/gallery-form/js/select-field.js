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
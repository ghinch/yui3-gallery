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
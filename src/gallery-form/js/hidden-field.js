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

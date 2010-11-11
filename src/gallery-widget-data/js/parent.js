	function WidgetParentData() {
		Y.Do.before(this._beforeCreate, this, '_createChild');
	}

	WidgetParentData.ATTRS = {
		defaultCfg : {}
	};
	
	WidgetParentData.prototype = {
		_beforeCreate : function (child) {
			var o = {data : child},
				defaultCfg = Y.clone(this.get('defaultCfg') || {});

			return new Y.Do.AlterArgs('', [Y.mix(defaultCfg, o)]);
		}
	};

	Y.WidgetParentData = WidgetParentData;

	function WidgetData () {
		Y.after(this._bindWidgetData, this, 'bindUI');
		Y.after(function () {
			this._setNodeContent(this.get('data'));
		}, this, 'syncUI');
	}

	WidgetData.ATTRS = {
		renderFn : {},
		data : {}
	};

	WidgetData.prototype = {
		_setNodeContent : function (data) {
			var renderFn = this.get('renderFn'),
				cb = this.get('contentBox');

			if (Y.Lang.isFunction(renderFn)) {
				renderFn.call(this, cb, data);
			} else {
				cb.setContent(data);
			}
		},

		_bindWidgetData : function () {
			this.after('dataChange', function (e) {
				this._setNodeContent(e.newVal);
			}, this);

			this.after('renderFnChange', function (e) {
				if (e.silent) {
					return;
				}
				this._setNodeContent(this.get('data'));
			}, this);
		}
	};

	Y.WidgetData = WidgetData;

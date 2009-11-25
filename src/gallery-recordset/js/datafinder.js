function DataFinder () {
	DataFinder.superclass.constructor.apply(this, arguments);
}

Y.mix(DataFinder, {
	NAME : "datafinder",

	ATTRS : {
		dataSource : {
			validator : function (val) {
				return this._validateDataSource(val);
			}
		}
	}
});

Y.extend(DataFinder, Y.Base, {
	_query : null,

	_validateDataSource : function (val) {
		if (val instanceof Y.DataSource.Local) {
			return true;
		}
		return false;
	},

	initializer : function () {
		this.publish('success');
		this.publish('failure');
	},

	setParam : function (param, value) {
		if (typeof this._query === undefined || this._query === null) {
			this._query = '';
		}

		this._query += '&' + param + '=' + value;

		return this;
	},

	fetch : function () {
		var ds = this.get('dataSource');
		ds.sendRequest(this._query, {
			success : function (args) {
				var self = args.callback.argument,
					rs;
				if (args.response && args.response.results && !args.response.error) {
					rs = new Y.RecordSet();
					rs.setRecords(args.response.results, 0);
					self.fire('success', {
						request : args.request, 
						records : rs, 
						meta : args.response.meta
					});
				}
			}, 
			failure : function (args) {
				this.fire('failure', args);
			},
			argument : this
		});
	}
});

Y.DataFinder = DataFinder;

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
	_params : null,

	_validateDataSource : function (val) {
		if (val instanceof Y.DataSource.Local) {
			return true;
		}
		return false;
	},

	initializer : function () {
		this.publish('success');
		this.publish('failure');

		this._params = {};
	},

	generateQuery : function (params) {
		var query = '',
			key;
		for (key in params) {
			if (Y.Object.hasKey(params, key)) {
				query += key + '/' + params[key] + '/';
			}
		}
		return query;
	},

	setParam : function (key, value) {
		this._params[key] = value;
	},

	setParams : function (map) {
		for (var key in map) {
			if (Y.Object.hasKey(map, key)) {
				this._params[key] = map[key];
			}
		}
	},

	clearParam : function (key) {
		if (Y.Object.hasKey(this._params, key)) {
			delete this._params[key];
		}
	},

	fetch : function () {
		var ds = this.get('dataSource'),
			query = this.generateQuery(this._params);

		ds.sendRequest(query, {
			success : function (args) {
				var self = args.callback.argument,
					rs;
				if (args.response && args.response.results && !args.response.error) {
					rs = new Y.RecordSet();
					rs.setRecords(args.response.results, 0);
					self.fire('success', {
						request : args.request, 
						recordset : rs, 
						meta : args.response.meta
					});
				} else {
					self.fire('failure', args);
				}
			}, 
			failure : function (args) {
				var self = args.callback.argument;
				self.fire('failure', args);
			},
			argument : this
		});
	}
});

Y.DataFinder = DataFinder;

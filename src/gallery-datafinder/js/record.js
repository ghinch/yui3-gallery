function Record (map) {
	this._count = Record._count;
	this._uid = Record.UID_PREFIX + this._count;
	Record._count++;
	this._data = {};
	if (Y.Lang.isObject(map)) {
		for (var key in map) {
			if (Y.Object.hasKey(map, key)) {
				this._data[key] = map[key];
			}
		}
	}
}

Record._count = 0;

Record.UID_PREFIX = "yui-rec";

Record.prototype = {
	_count : null,

	_uid : null,

	_data : null,

	getCount : function () {
		return this._count;
	},

	getId : function () {
		return this._uid;
	},

	getData : function (key) {
		if (Y.Lang.isString(key)) {
			return this._data[key];
		} else {
			return this._data;
		}
	},

	setData : function (data) {
		if (Y.Lang.isObject(data)) {
			var o = {};
			if (data.key && data.value) {
				o[data.key] = data.value;
				data = o;
			}

			for (o in data) {
				if (Y.Object.hasKey(data, o) && this._data[o]) {
					this._data[o] = data[o];
				}
			}
			
			return this._data;
		}
		return null;
	}
};

Y.Record = Record;

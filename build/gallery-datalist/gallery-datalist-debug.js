YUI.add('gallery-datalist', function(Y) {

function ListView () {
	ListView.superclass.constructor.apply(this, arguments);
}

Y.mix (ListView, {
	NAME : 'listview',

	ATTRS : {
		formatter : {
			value : function (node, record) {
				node.set('innerHTML', record);
			},
			validator : Y.Lang.isFunction
		},
		EMPTY_LIST_MESSAGE : {
			value : "There are no list items",
			validator : Y.Lang.isString
		}
	},
	
	LIST_NODE_TEMPLATE : '<li></li>'
});

Y.extend(ListView, Y.Widget, {
	_rootNode : null,

	_recordSet : null,

	_chain : null,

	_createChain : function () {
		this._chain = new Y.Chain();
	},

	_createListNode: function(record) {
		var li = Y.Node.create(ListView.LIST_NODE_TEMPLATE);
		return this._updateListNode(li, record);
	},

	/**
	 * Formats the given LI with new data from the Record
	 *
	 * @method _updateListNode
	 * @param elNode {HTMLElement}
	 * @param oRecord {YAHOO.widget.Record}
	 * @return {HTMLElement} The new LI element
	 * @private
	 */
	_updateListNode: function(node, record) {
		node.setStyle('display', 'none');

		/*if (this.get('sort') !== WDUI.widget.List.SORT_NONE) {
			var dd = DDM.getDDById(elNode.id);
			if (dd && dd.unreg) {
				dd.unreg();
			}
		}*/

		node.setAttribute('id', record.getId());
		//Dom.addClass(elNode, this.LIST_NODE_CLASS);

		this._formatNode(node, record);

		node.setStyle('display', '');
		return node;
	},

	_deleteListNode: function(record) {
		/*var dd = DDM.getDDById(oRecord.getId());
		if (dd) {
			dd.unreg();
		}*/

		var el = Y.one("#" + record.getId()),
			recIndex = this._recordSet.getRecordIndex(record);

		el.remove();
		this._recordSet.deleteRecord(recIndex, 1);
		//this.fireEvent('nodeDeletedEvent');

		if (this._recordSet.getLength() === 0) {
			this.showMessage(this.get('EMPTY_LIST_MESSAGE'));
			//this.fireEvent("emptyListEvent");
		}
	},

	_renderRootNode : function () {
		var elList = Y.Node.create('<ul></ul>'),
			contentBox = this.get('contentBox');
		
		contentBox.appendChild(elList);
		this._rootNode = elList;
	},

	_renderChildren: function() {
		this._chain.stop();

		var allRecords = this._recordSet.getRecords(),
			newNodes = document.createDocumentFragment(),
			startIndex = 0;

		this._chain.add(Y.bind(function (records) {
			var existingNodes = this._rootNode.get('children'),
				toRemove;

			while (this._rootNode.hasChildNodes() && existingNodes.size() > records.length) {
				toRemove = existingNodes.item(existingNodes.size() - 1);
				toRemove.detach();
				this._rootNode.removeChild(toRemove);
				existingNodes = this._rootNode.get('children');
			}
		}, this, allRecords));

		this._chain.add(Y.bind(function (records) {
			var existingNodes = this._rootNode.get('children');
			existingNodes.each(function (node, index, array) {
				this._updateListNode(node, records[index]);
				startIndex = index + 1;
			}, this);
		}, this, allRecords));

		this._chain.add(Y.bind(function (records) {
			Y.Array.each(records, function (record, index, array) {
				if (startIndex !== 0 && index <= startIndex) {
					return;
				}
				var li = this._createListNode(record);
				newNodes.appendChild(Y.Node.getDOMNode(li));
			}, this);
		}, this, allRecords));

		this._chain.add(Y.bind(function () {
			this._rootNode.appendChild(newNodes);
		}, this));

		this._chain.run();
	},

	addRow : function (data, index) {
		if (!data) {
			return;
		}

		var newRecord = this._recordSet.addRecord(data, index),
			recordIndex = this._recordSet.getRecordIndex(newRecord);

		if (Y.Lang.isNumber(recordIndex)) {
			this._chain.add(Y.bind(function (record) {
				var node = this._createListNode(record);

				if (recordIndex == this._rootNode.get('children').size()) {
					this._rootNode.appendChild(node);
				} else {
					this._rootNode.insert(node, index);
				}
			}, this, newRecord));

			this._chain.run();
			return newRecord;
		}
	},

	addRows : function (rows, index) {
		if (!rows || !Y.Lang.isArray(rows)) {
			return;
		}

		index = index || this._recordSet.getLength();

		var records = [];

		Y.each(rows, function (data, i, a) {
			this._chain.add(Y.bind(function(d, r) {
				var newRecord = this.addRow(d, index);
				if (newRecord) {
					++index;
				}
				r.push(newRecord);
			}, this, data, records));
		}, this);

		this._chain.run();

		return records;
	},

	removeRow : function (node) {
		var record, data;

		if (typeof node == 'string' || node.nodeName) {
			node = Y.one(node);
			if (node) {
				record = this._recordSet.getRecord(node.get('id'));
			}
		} else if (Y.Lang.isNumber(node)) {
			record = this._recordSet.getRecord(node);
		} else if (node instanceof Y.Record) {
			record = node;
		}

		if (!record) {
			return;
		}

		data = record.getData();
		this._deleteListNode(record);

		return data;
	},

	updateRow : function (node, data) {
		var record;
		
		if (Y.Lang.isNumber(node)) {
			record = this._recordSet.getRecord(node);
			if (!record) {
				return;
			}
			node = Y.one('#' + record.getId());
		} else {
			node = Y.one(node);
			if (!node) {
				return;
			}
			record = this._recordSet.getRecord(node.get('id'));
		}

		record = this._recordSet.updateRecord(record, data);
		node = this._updateListNode(node, record);
		return record;
	},
	
	showMessage : function (msg) {
		//this.clear();
		var msgNode = Y.Node.create(ListView.LIST_NODE_TEMPLATE);
		this._rootNode.appendChild(msgNode);
		msgNode.set('innerHTML', msg);
	},

	_formatNode : function (node, record) {
		this.get('formatter').call(this, node, record);
	},

	clear : function () {
		this._recordSet.reset();
		this._renderChildren();
	},

	setRecords : function (recordset) {
		this._recordSet = recordset;
		this._renderChildren();
	},

	initializer : function () {
		this._createChain();
	},
	
	destructor : function () {
		this.clear();
		this._rootNode.remove();
		this._rootNode = null;
		this._recordSet = null;
	},

	renderUI : function () {
		this._renderRootNode();
	},

	bindUI : function () {

	},

	syncUI : function () {

	}
});

Y.ListView = ListView;
function TableView () {
	TableView.superclass.constructor.apply(this, arguments);
}

Y.mix(TableView, {
	NAME : "tableview",

	ATTRS : {

	}
});

Y.extend(TableView, Y.ListView, {

});

Y.TableView = TableView;
function Chain () {
	Chain.superclass.constructor.apply(this, arguments);
}

Y.mix(Chain, {
	name : 'chain'
});

Y.extend(Chain, Y.Queue, {
	id : 0,

	run : function () {
		var c = this._q[0],
			fn, args, ms, self = this;

		if (!c) {
			return this;
		}

		fn = c.method || c;
		args = c.argument || [];
		ms = c.timeout || 0;

		if (!Y.Lang.isArray(args)) {
			args = [args];
		}

		if (typeof fn == 'function') {
			if (ms < 0) {
				this.id = ms;
				if (c.until) {
					for(;c.until();) {
						fn.apply({}, args);
					}
				} else if (c.iterations) {
					for(;c.iterations-- > 0;) {
						fn.apply({}, args);
					}
				} else {
					fn.apply({}, args);
				}
				this.next();
				this.id = 0;
				return this.run();
			} else {
				if (c.until) {
					if (c.until()) {
						this.next();
						return this.run();
					}
				} else if (!c.iterations || !--c.iterations) {
					this.next();
				}

				this.id = setTimeout(function () {
					fn.apply({}, args);
					if (self.id) {
						self.id = 0;
						self.run();
					}
				}, ms);
			}
		}

		return this;
	},

	pause : function () {
		if (this.id > 0) {
			clearTimeout(this.id);
		}
		this.id = 0;
		return this;
	},

	stop : function () {
		this.pause();
		this._q = [];
		return this;
	}
});

Y.Chain = Chain;


}, '@VERSION@' ,{requires:['gallery-datafinder', 'queue-promote', 'collection', 'widget']});

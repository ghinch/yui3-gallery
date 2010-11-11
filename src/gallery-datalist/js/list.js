	Y.ListItem = Y.Base.create('list-item', Y.Widget, [Y.WidgetChild, Y.WidgetData], {
		BOUNDING_TEMPLATE : '<li></li>'
	});

	var List = Y.Base.create('list', Y.Widget, [Y.WidgetParent, Y.WidgetParentData], {
	}, {
		ATTRS : {
			defaultChildType : {
				value : Y.ListItem
			}
		}
	});

	Y.UnorderedList = Y.Base.create('unordered-list', List, [], {
		CONTENT_TEMPLATE : '<ul></ul>'
	});

	Y.OrderedList = Y.Base.create('ordered-list', List, [], {
		CONTENT_TEMPLATE : '<ol></ol>'
	});

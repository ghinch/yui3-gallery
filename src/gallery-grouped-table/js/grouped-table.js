var YgetCN = Y.ClassNameManager.getClassName,

    CLASS_GROUP_HEAD = YgetCN('grouped', 'datatable', 'group'),
    CLASS_GROUP_BODY = YgetCN('grouped', 'datatable', 'data'),
    CLASS_GROUP_TOGGLE = YgetCN('grouped', 'datatable', 'group', 'toggle'),
    CLASS_GROUP_HIDDEN = YgetCN('grouped', 'datatable', 'group', 'hidden'),

    TEMPLATE_GROUP_THEAD = '<thead class="' + CLASS_GROUP_HEAD + '"></thead>',
    TEMPLATE_GROUP_TBODY = '<tbody class="' + CLASS_GROUP_BODY + '"></tbody>',
    TEMPLATE_GROUP_TR = '<tr></tr>',
    TEMPLATE_GROUP_TH = '<th></th>',
    TEMPLATE_GROUP_DIV = '<div class="yui3-datatable-liner" />',
    TEMPLATE_GROUP_A = '<a href="#" class="' + CLASS_GROUP_TOGGLE + '"></a>';

Y.namespace('Plugin').GroupedDataTable = Y.Base.create('grouped-datatable', Y.Plugin.Base, [], {
    _getGroups : function () {
        return this._groups;
    },

    _defaultRenderGroupLabel : function (node, key, records) {
        return node.setContent(key);
    },

    _handleGroupToggleClick : function (e) {
        e.preventDefault();
        
        var thead = e.target.ancestor('thead', false),
            key = thead.getData('key'),
            tbody = this._groups[key].body;

        thead.toggleClass(CLASS_GROUP_HIDDEN);

        if (thead.hasClass(CLASS_GROUP_HIDDEN)) {
            tbody.hide();
        } else {
            tbody.show();
        }
    },

    _addGroupThead : function (group, key) {
        var th = Y.Node.create(TEMPLATE_GROUP_TH),
            tr = Y.Node.create(TEMPLATE_GROUP_TR),
            liner = Y.Node.create(TEMPLATE_GROUP_DIV),
            a = Y.Node.create(TEMPLATE_GROUP_A),
            thead = Y.Node.create(TEMPLATE_GROUP_THEAD),
            host = this.get('host'),
            columns = host.get('columnset'),
            renderLabel = this.get('groupLabelRenderer');

        tr.append(th);
        th.append(liner);
        liner.append(a);
        th.setAttribute('colspan', columns.keys.length);
        thead.append(tr);
        renderLabel(a, key, group);
        
        return thead;
    },

    _addGroupTbody : function (group, key) {
        var tbody = Y.Node.create(TEMPLATE_GROUP_TBODY);

        return tbody;
    },

    _renderUIGroups : function (groups) {
        var host = this.get('host'),
            insertMarker;

        Y.Object.each(groups, function (g, k) {
            // Clear out previously used groups
            if (!g.records.length) {
                g.head.remove();
                g.body.remove();
                delete groups[k];
                return;
            }

            if (!insertMarker) {
                insertMarker = host._theadNode;
            }

            // Insert the group heading
            if (!g.head) {
                g.head = this._addGroupThead(g, k);
                g.head.setData('key', k);
                g.head.setData('firstChildId', g.records[0].get('data.id'));
            }

            if (insertMarker) {
                insertMarker.insert(g.head, 'after');
            } else {
                host._tableNode.append(g.head);
            }
            insertMarker = g.head;

            if (!g.body) {
                g.body = this._addGroupTbody(g, k);
            }

            g.body.empty();

            var o = {}, 
                cellValueTemplate = host.get('tdValueTemplate'),
                columns = host.get('columnset').keys,
                i, len, column, formatter;

            o.tbody = g.body;
            /* TAKEN DIRECTLY FROM _uiSetRecordset in Datatable.Base */
            o.rowTemplate = host.get('trTemplate');
            o.columns = [];

            for (i = columns.length - 1; i >= 0; --i) {
                column = columns[i];
                o.columns[i] = {
                    column : column,
                    fields : column.get('field'),
                    classes: column.get('classnames')
                };

                formatter = column.get('formatter');
                if (!Y.Lang.isFunction(formatter)) {
                    if (!Y.Lang.isString(formatter)) {
                        formatter = cellValueTemplate;
                    }
                    formatter = Y.bind(Y.Lang.sub, host, formatter);
                }

                o.columns[i].formatter = formatter;
            }
            /* End copy */

            for (i = 0, len = g.records.length; i < len; ++i) {
                o.record = g.records[i];
                o.data   = o.record.get("data");
                o.rowindex = i;
                host._addTbodyTrNode(o);
            }

            insertMarker.insert(g.body, 'after');
            insertMarker = g.body;

        }, this);
    },

    _beforeUISetRecordset : function (recordset) {
        var host = this.get('host'),
            records = recordset.get('records'),
            groupBy = this.get('groupBy'),
            existingGroups = this._groups || {},
            groups = {};

        Y.Object.each(groups, function (g) {
            g.records = [];
        });

        Y.Array.each(records, function (rec) {
            var key, g;
            if (Y.Lang.isFunction(groupBy)) {
                key = groupBy(rec);
            } else {
                key = rec.getValue(groupBy);
            }

            if (!Y.Lang.isString(key) && !Y.Lang.isNumber(key)) {
                return;
            }

            g = existingGroups[key] || {
                records : []
            };

            g.records.push(rec);

            groups[key] = g;
        });

        this._groups = groups;

        this._renderUIGroups(groups);

        return new Y.Do.Halt();
    },

    _bindUI : function () {
        var cb = this.get('host').get('contentBox');
        cb.delegate('click', this._handleGroupToggleClick, '.' + CLASS_GROUP_TOGGLE, this);
    },

    initializer : function () {
        this.doBefore('_uiSetRecordset', this._beforeUISetRecordset);
        this.doAfter('bindUI', this._bindUI);
    }
    
}, {
    NS : 'group',
    ATTRS : {
        groups : {
            readOnly : true,
            getter : '_getGroups'
        },
        groupLabelRenderer : {
            valueFn : function () {
                return this._defaultRenderGroupLabel;
            }
        },
        groupBy : {
        }
    }
});

/*
 * File: app/view/myContactListItem.js
 *
 * This file was generated by Sencha Architect version 2.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.0.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('Payback.view.myContactListItem', {
    extend: 'Ext.dataview.component.DataItem',
    alias: 'widget.myContactListItem',

    config: {
        baseCls: 'x-data-item',
        updateRecord: function(newRecord, oldeRecord) {
            //bug in framework, this stops propagation of event in deleteButtonTap and allows the record to be deleted from the store
            this.callParent(arguments);

            newRecord.getData(true);
            this.child('component').setData(newRecord.data);
        },
        cls: [
            'x-list-item'
        ],
        items: [
            {
                xtype: 'container',
                baseCls: 'x-list-item-label',
                itemId: 'contactListItemDetail',
                tpl: [
                    '<div>',
                    '{name}  ',
                    '<b style=\'float: right;color:red;\'>',
                    '{[(values.balance<0)?\'-\':\'\']}${[Math.abs(values.balance).toFixed(2)]}',
                    '</b>',
                    '<br>',
                    '</div>'
                ],
                items: [
                    {
                        xtype: 'button',
                        docked: 'right',
                        height: 24,
                        hidden: true,
                        itemId: 'deleteContact',
                        margin: '0 0 0 10px',
                        ui: 'gray-button',
                        text: 'delete'
                    }
                ]
            }
        ],
        listeners: [
            {
                fn: 'onContactDeleteButtonTap',
                event: 'tap',
                delegate: '#deleteContact'
            }
        ]
    },

    onContactDeleteButtonTap: function(button, e, options) {

        //bug in framework, stops propagation of event, without this sometimes both the itemtap 
        //and deletebuttontap would get fired after a previous record is deleted, this.callParent in updateRecords fixes this also so this might not be needed
        e.stopEvent(); 

        var debts = this.getRecord().debts();
        var debtStore = Ext.getStore('Debts');
        var paymentStore = Ext.getStore('Payments');

        //remove payments from each debt
        debts.each(function(item,index,length){
            var payments = item.payments();
            paymentStore.remove(payments.getData().items); //remove from store
            payments.removeAll(); //remove from associated store
            paymentStore.sync(); //sync payments with localStorage
        });

        //remove debts from person
        debtStore.remove(debts.getData().items); //remove from store
        debts.removeAll(); //remove from associated store
        debtStore.sync(); //sync debts with localStorage

        //removes person from store 
        var dataview = this.up('dataview');
        dataview.getStore().remove(this.getRecord()); //remove person
        dataview.getStore().sync(); //sync with localStorage

        //update the summary
        Payback.app.application.getController('Payback.controller.Summary').updateSummary();
    },

    updateRecord: function(newRecord, oldeRecord) {
        //bug in framework, this stops propagation of event in deleteButtonTap and allows the record to be deleted from the store
        this.callParent(arguments);

        newRecord.getData(true);
        this.child('component').setData(newRecord.data);
    }

});
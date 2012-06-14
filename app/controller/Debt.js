/*
 * File: app/controller/Debt.js
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

Ext.define('Payback.controller.Debt', {
    extend: 'Ext.app.Controller',
    config: {
        refs: {
            DebtDetail: {
                selector: 'DebtDetail',
                xtype: 'DebtDetail',
                autoCreate: true
            },
            myDebtDataView: '#myDebtDataView',
            myPaymentDataView: '#myPaymentDataView',
            addPaymentButton: '#addPayment',
            emailDebtButton: '#emailDebt'
        },

        control: {
            "#addDebt": {
                tap: 'onAddDebtTap'
            },
            "#saveDebt": {
                tap: 'onSaveDebtTap'
            },
            "#cancelDebt": {
                tap: 'onCanelButtonTap'
            },
            "#myDebtDataView": {
                itemswipe: 'onDataviewItemSwipe',
                itemtap: 'onDataviewItemTap'
            },
            "#emailDebt": {
                tap: 'onEmailDebtTap'
            }
        }
    },

    onAddDebtTap: function(button, e, options) {
        var form = this.getDebtDetail();
        form.reset();
        form.setRecord(null); //remove record from form

        //clears filter placed on Payment store
        Ext.getStore('Payments').clearFilter();

        //hides buttons and payment data view on new debts
        this.getAddPaymentButton().hide();
        this.getMyPaymentDataView().hide();
        this.getEmailDebtButton().hide();

        //set active item
        Ext.Viewport.setActiveItem(form);
    },

    onSaveDebtTap: function(button, e, options) {


        var form = this.getDebtDetail(),
            record = form.getRecord(),
            values = form.getValues(),
            person = this.getDebtDetail().down('selectfield').record; //gets person from selectfield

            if(record) { //edit old record

                //sets values from form into record
                record.set(values);

            //if the person is modified in the record
            if (record.isModified('person_id')) {
                record.getPerson().debts().remove(record); //remove debts from old
                record.setPerson(values.person_id); //sets new

                // The following two lines work around a bug that causes the Person instance not to be updated correctly
                delete record.PersonBelongsToInstance;
                record.getPerson(); // bug, Sets up the Person instance reference again
            }

            record.set('balance',0); //bug in the framework, setting the balance calls the convert field again to update the debt
            record.commit(); //bug in the framework, saving a record does not remove modified flags
            record.save();
        } else {  //new record 
            var debt = person.debts().add(values)[0]; //add values
            person.debts().sync();
            debt.getPerson(); //bug in the framework, this associates the debt with the person in the store

            //bug in the framework, this allows the dataview to update the list when a record is added the first time and no other are in the store
            debt.save({
                callback:function(){
                    this.getMyDebtDataView().refresh();
                }
            },this);

        }


        //calc balance for the person
        person.calcBalance();

        //load data into debt store from localStorage
        Ext.getStore('Debts').load();

        //update people store
        Ext.getStore('People').load(function(){
            this.getApplication().getController('Summary').updateSummary();
        },
        this);

        //set active item
        Ext.Viewport.setActiveItem(0);
    },

    onCanelButtonTap: function(button, e, options) {
        this.getDebtDetail().reset(); //reset form

        //set active item
        Ext.Viewport.setActiveItem(0);
    },

    onDataviewItemSwipe: function(dataview, index, target, record, e, options) {
        var deleteButtons = dataview.query('button');

        //hides other delete buttons
        for (var i=0; i < deleteButtons.length; i++) {
            deleteButtons[i].hide();
        }

        //shows current delete button
        target.query('button')[0].show();

        //hides delete button after tapped
        Ext.Viewport.element.on({tap:function(){
            target.query('button')[0].hide();
        }, single:true});
    },

    onDataviewItemTap: function(dataview, index, target, record, e, options) {

        var form = this.getDebtDetail();
        form.setRecord(record); //sets record for the form

        //clears filter on store and sets a new one, this shows only the payments associated with the debt tapped
        Ext.getStore('Payments').clearFilter();
        Ext.getStore('Payments').filter({property: "debt_id", value: record.get('id')});

        //show hidden components
        this.getAddPaymentButton().show();
        this.getMyPaymentDataView().show();
        this.getEmailDebtButton().show();

        Ext.Viewport.setActiveItem(form);
    },

    onEmailDebtTap: function(button, e, options) {

        var record = this.getDebtDetail().getRecord();
        record.set('balance',0); //bug in framework, calls convert field again on debt, this updates the debt with any new payments added to debt

        var person = this.getDebtDetail().down('selectfield').record, //gets person from selectfield
        email = person.get('email'),
        name = person.get('name'),
        subject = encodeURIComponent("Where's my money?!"),
        body = encodeURIComponent("Dear "+name+",\n\nYou owe me $"+record.get('balance')+". Pay soon or my friend Li'l Abe will come pay ya a visit.\n\nSincerely,\n\nYour friendly neighborhood loan shark");

        window.location.href = "mailto:"+email+"?subject=" + subject+"&body="+body; 
    }

});
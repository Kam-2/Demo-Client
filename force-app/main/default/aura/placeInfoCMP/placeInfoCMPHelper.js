({
    updateAccount : function(component) {
        var action = component.get("c.updateAccount");
        if(action == null)
            return;
        action.setParams({
            recordId : component.get("v.recordId"),
            street : component.get("v.address.street"),
            city : component.get("v.address.city"),
            Country : component.get("v.address.Country"),
            State : component.get("v.address.State"),
            Postalcode : component.get("v.address.Postalcode"),
            openHours : component.get("v.result.Openinghours"),
            phone : component.get("v.result.phoneNumber"),
            internationalPhone : component.get("v.result.mobileNumber"),
            rating : component.get("v.result.rating"),
            reviews : JSON.stringify(component.get("v.result.reviews")),
            urls : JSON.stringify(component.get("v.result.photos")),
            placeid : component.get("v.result.place_id"),
            status : component.get("v.result.business_status"),
            noofAPIConsumed : component.get("v.result.noofAPIRequest")

        });
        action.setCallback(this,function(a){
            var state = a.getState();
            component.set('v.spinner', false);
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },
    updateAccountAddress : function(component) {
        var action = component.get("c.updateAccountAddress");
        action.setParams({
            recordId : component.get("v.recordId"),
            street : component.get("v.address.street"),
            city : component.get("v.address.city"),
            Country : component.get("v.address.Country"),
            State : component.get("v.address.State"),
            Postalcode : component.get("v.address.Postalcode")

        });
        action.setCallback(this,function(a){
            var state = a.getState();
            component.set('v.spinner', false);
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                //this.showToast('Success','Updated Successfully','success');
                this.showToast('Success','Billing Address & Shipping Address has been updated successfully','success');
                
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },   
        handleSaveAddress : function(component, event, helper){

            component.set('v.spinner', true);
            component.set('v.hasError', false);
            component.set('v.errorMsg','');
            helper.updateAccountAddress(component);
           
    },
    /*updateAccountOpeningHours : function(component, event) {
        var action = component.get("c.updateAccountGoogleInfoOpenCloseHours");
        action.setParams({
            recordId : component.get("v.recordId"),
            openHours : component.get("v.result.Openinghours")
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },
    updateAccountPhone : function(component, event) {
        var action = component.get("c.updateAccountGoogleInfoMobile");
        action.setParams({
            recordId : component.get("v.recordId"),
            phone : component.get("v.result.phoneNumber"),
            internationalPhone : component.get("v.result.mobileNumber")
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },*/
    updatePropertyAddress : function(component) {
        var action = component.get("c.updatePropertyAddress");
        if(action == null)
            return;
        action.setParams({
            recordId : component.get("v.recordId"),
            street : component.get("v.address.street"),
            city : component.get("v.address.city"),
            Country : component.get("v.address.Country"),
            State : component.get("v.address.State"),
            Postalcode : component.get("v.address.Postalcode"),
            openHours : component.get("v.result.Openinghours"),
            phone : component.get("v.result.phoneNumber"),
            internationalPhone : component.get("v.result.mobileNumber"),
            rating : component.get("v.result.rating"),
            reviews : JSON.stringify(component.get("v.result.reviews")),
            urls : JSON.stringify(component.get("v.result.photos")),
            placeid : component.get("v.result.place_id"),
            status : component.get("v.result.business_status"),
            noofAPIConsumed : component.get("v.result.noofAPIRequest")
        });
        
        action.setCallback(this,function(a){
            var state = a.getState();
            component.set('v.spinner', false);
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },
    /*updatePropertyOpeningHours : function(component, event) {
        var action = component.get("c.updatePropertyGoogleInfoOpenCloseHours");
        action.setParams({
            recordId : component.get("v.recordId"),
            openHours : component.get("v.result.Openinghours")
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },
    updatePropertyPhone : function(component, event) {
        var action = component.get("c.updatePropertyGoogleInfoMobile");
        action.setParams({
            recordId : component.get("v.recordId"),
            phone : component.get("v.result.phoneNumber"),
            internationalPhone : component.get("v.result.mobileNumber")
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },*/
    showToast : function(title,msg,type) {
        console.log('#Toast');
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title : title,
            message: msg,
            duration:' 5000',
            key: 'info_alt',
            type: type,
            mode: 'dismissible'
        });
        toastEvent.fire();
    },
    helperSaveImage : function(component, event,imgurl) {
        var action = component.get("c.saveImage");
        action.setParams({
            recordId : component.get("v.recordId"),
            Urls : imgurl
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                this.showToast('Success','Updated Successfully','success');
                $A.get('e.force:refreshView').fire();

            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        this.showToast('Error',errors[0].message,'error');
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                this.showToast('Error','No response from server or client is offline.','error');
            }
        });       
        $A.enqueueAction(action);
    },    

    helperMapMarker: function(component,name,city,country,postalCode,state,street) {

        component.set('v.mapMarkers', [
            {
                location: {
                    City: city,
                    Country: country,
                    PostalCode: postalCode,
                    State: state,
                    Street: street
                },
                title: name,
            }
        ]);
        component.set('v.zoomLevel', 16);
    },
    
    //added new code
    isBillingAndShippingDifferent: function(component) {
        var recordId = component.get("v.recordId");
        var action = component.get("c.checkAddressDifference");
        
        action.setParams({
            recordId: recordId
        });
        
        // Return a promise to handle the asynchronous call
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    resolve(response.getReturnValue());
                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors && errors[0] && errors[0].message) {
                        reject(errors[0].message);
                    } else {
                        reject("Unknown error");
                    }
                }
            });
            
            $A.enqueueAction(action);
        });
    }
    //ended new code
})
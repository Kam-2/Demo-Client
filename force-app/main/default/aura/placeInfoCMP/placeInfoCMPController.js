({
    doInit : function(component, event, helper) {
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let todayIndex = new Date().getDay();
        let today = days[todayIndex];
        component.set("v.today", today);
        console.log("Today"+today);
        console.log(component.get("v.recordId"));
        console.log(component.get("v.sObjectName"));  
        var recordId = component.get("v.recordId");
        var objectName = component.get("v.sObjectName");
        let urlString = window.location.href;
        //alert(urlString.split('/lightning')[0]);  
        component.set('v.spinner', true);
        component.set("v.lcUrl",urlString.split('/lightning')[0]); 

        var action = component.get("c.checkLastSyncDate");
        action.setParams({
            recordId : recordId,
            objectName : objectName,
            dayname:today
        });
        action.setCallback(this,function(a){
            var state = a.getState();
            if(state === "SUCCESS"){
                //alert('Record is Created Successfully');
                
                var apexresponse = a.getReturnValue();

                var result = {};
                result.name =apexresponse.name;
                result.rating =apexresponse.rating;
                result.phoneNumber =apexresponse.phoneNumber;
                result.mobileNumber =apexresponse.mobileNumber;
                result.business_status =  apexresponse.business_status;
                if(apexresponse.address!=null){
                result.address = JSON.parse(apexresponse.address);
                    console.log('result.address',result.address);
                helper.helperMapMarker(component,result.name,result.address.city,result.address.Country,result.address.Postalcode,
                    result.address.State,result.address.street );
                }
                if(apexresponse.reviews!=null)
                result.reviews = JSON.parse(apexresponse.reviews);
                
                result.Openinghours =apexresponse.Openinghours;
                //result.Openinghours =apexresponse.Openinghours.filter(item => item.includes("Wednesday"))
                console.log('result.Openinghours'+result.Openinghours);
                console.log('photos'+apexresponse.photos);
                if(apexresponse.photos!=null && apexresponse.photos!= 'undefined')
                {
                result.photos = JSON.parse(apexresponse.photos);
                console.log('photos'+JSON.parse(apexresponse.photos));
                }

                if(apexresponse.hasAPIExhausted){
                    component.set('v.hasError', true);
                    component.set('v.errorMsg','This information is more than a month old and is not updated as your Google account has reached the maximum number of free requests per month. You can upgade to a paid Google account or view the old information.' );
                    component.set('v.spinner', false);
                }else{
                    component.set('v.hasError', false);
                    component.set('v.errorMsg', '');
                }
                if(apexresponse.isExpired && objectName == 'Account' && !apexresponse.hasAPIExhausted)
                {    
                    component.set('v.loadVF',true);
                    component.set("v.vfUrl",'/apex/PlacesInfoVF?id='+recordId+'&lcHost='+urlString.split('/lightning')[0]);   
                    
                }
                else if(apexresponse.isExpired && objectName == 'Property_District360__c' && !apexresponse.hasAPIExhausted){
                    component.set('v.loadVF',true);
                    component.set("v.vfUrl",'/apex/PropertyPlacesInfoVF?id='+recordId+'&lcHost='+urlString.split('/lightning')[0]);   
                }
                
                var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
                ];
                var t ;
                
                if(typeof apexresponse.lastUpdatedOn !='undefined' && apexresponse.lastUpdatedOn!=null)
                    t = new Date(apexresponse.lastUpdatedOn);
                else
                    t= new Date();
                       
                result.lastUpdatedOn = t.getDate() + ' ' + monthNames[t.getMonth()] + ', ' + t.getFullYear();
                                   
                component.set("v.result",result);
                //alert(result.address);
                component.set("v.address",result.address);
                if(apexresponse.Openinghours != null && apexresponse.Openinghours !='undefined'){
                	let filtered = apexresponse.Openinghours.filter(item => item.includes(today));
                
                // Filter items that do NOT contain today's day
                	let excluded = apexresponse.Openinghours.filter(item => !item.includes(today));
                	component.set("v.filteredOpeningHours", filtered);
        			component.set("v.excludedOpeningHours", excluded);
            }
                if( result.name!=null){
                    
                    component.set('v.spinner', false);
                }
            } else if(state === "ERROR"){
                var errors = action.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        //alert(errors[0].message);
                        helper.showToast('Error',errors[0].message,'error');
                        component.set('v.spinner', false);
                    }
                }
            }else if (status === "INCOMPLETE") {
                //alert('No response from server or client is offline.');
                helper.showToast('Error','No response from server or client is offline.','error');
                component.set('v.spinner', false);
            }
        });       
        $A.enqueueAction(action);
        
		//window.removeEventListener("message", ()=>{alert('Removed all events')},false);
		//added new code
        if (component.get("v.sObjectName") === "Account") {
            helper.isBillingAndShippingDifferent(component)
            .then(function(isDifferent) {
                component.set("v.billingShippingAddressSame", !isDifferent);
            })
            .catch(function(error) {
                console.error("Error checking address difference: " + error);
            });
        }
		//ended new code
        
        
        window.addEventListener("message", function(event) {
            
           // console.log('Raw:'+ event);
           console.log('Lightning Gets: ', event.data);
            var result = JSON.parse(event.data);
            if(result.id != component.get("v.recordId"))
                              return;   
            
            if((result!=null && result.name==null)){
                component.set('v.spinner', false);
                if(result.Error !=null){
                    component.set('v.loadVF',false);
                    component.set('v.hasError', true);
                    component.set('v.errorMsg',result.Error );
                    
                }
                if(objectName == 'Account'){
                    component.set('v.loadVF',false);
                    component.set("v.vfUrl",'');

                }
                else if(objectName == 'd360v1__Property_District360__c'){
                    component.set('v.loadVF',false);
                    component.set("v.vfUrl",'');
                }    
                         
                return;
            }
            
            var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
            var t ;
           
            if(typeof result.lastUpdatedOn !='undefined' && result.lastUpdatedOn!=null)
                t = new Date(result.lastUpdatedOn);
            else
                t= new Date();
                  
            result.lastUpdatedOn = t.getDate() + ' ' + monthNames[t.getMonth()] + ', ' + t.getFullYear();

           
            //var result= {"name":"CUBE84 - Salesforce Partner","rating":5,"phoneNumber":"(202) 505-1056","mobileNumber":"+1 202-505-1056","address":{"street":"2221 South Clark Street","city":"Arlington","State":"Virginia","Country":"United States","Postalcode":"22202"},"reviews":[{"author_name":"Arun Jayaraman","author_url":"https://www.google.com/maps/contrib/105849967955765113028/reviews","language":"en","profile_photo_url":"https://lh4.ggpht.com/-ekkkUA3EHOc/AAAAAAAAAAI/AAAAAAAAAAA/hhLgXahwXBY/s128-c0x00000000-cc-rp-mo/photo.jpg","rating":5,"relative_time_description":"2 months ago","text":"Very good location and good team to work with.","time":1585861363},{"author_name":"Saurav Sharma","author_url":"https://www.google.com/maps/contrib/116539403675612455410/reviews","language":"en","profile_photo_url":"https://lh3.ggpht.com/-qT40nFNmRTM/AAAAAAAAAAI/AAAAAAAAAAA/aP3ySbIxO_s/s128-c0x00000000-cc-rp-mo-ba4/photo.jpg","rating":5,"relative_time_description":"8 months ago","text":"Amazing team.","time":1570566924},{"author_name":"naresh kumar","author_url":"https://www.google.com/maps/contrib/107684773590782450362/reviews","profile_photo_url":"https://lh3.ggpht.com/-JV__fF7oDG0/AAAAAAAAAAI/AAAAAAAAAAA/BlecPZ61YE4/s128-c0x00000000-cc-rp-mo/photo.jpg","rating":5,"relative_time_description":"2 months ago","text":"","time":1585859487}],"Openinghours":["Monday: 9:00 AM – 5:00 PM","Tuesday: 9:00 AM – 5:00 PM","Wednesday: 9:00 AM – 5:00 PM","Thursday: 9:00 AM – 5:00 PM","Friday: 9:00 AM – 5:00 PM","Saturday: Closed","Sunday: Closed"],"photos":[{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAEfL4dZT-EIc-fjMjm0AJDgo56zbeBq2G96ZOep1FvVP9_6blk_5pT_hBmpFN0ZYHZ_Q4pCyexh9QSz50S1i8YV8C01aR7dmaeWeL8J9uG0QIfb6blXDo9c2KwelqFhmuEhDfJHqUztl6BjlXzu_pfwYvGhS_HLIYTkryCXZazDMi3lvx3dFkZg&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=74654"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAyCc3ErKDHyY7Nsprtwn2RW-p4QCR6JjvxklK_j_rFaZrUdtXoarXO9LZisNXUDC4SPry_MMphzZtBANAlGK0pZFWeSY6HoZ6jfwRgP_vxG4tfyNy4loIuSyrFlIrAZ5REhBp2bjwznpAnkOtHALkveb2GhSeQgi3KL17crypWM8hj5X-cxSEbw&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=5966"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAA59Gde58OYwgIoV9Gb95L_9NCfApPgejX7y-3kGusxPPTu1ycCnBcwx1HSs4L4phsvy1dDQDAn3rvxyqmDnkz9iv7KWPcMyVuSaP42Gu5jO5vL_Ji3EExf3mqxbkueRVkEhA3fxWw_M13Lby6iM3hOn-7GhQVmcGYon-v_c3m2YDH_HOlrWfpgg&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=4479"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAA7wtKywcC3-4yHlBMos93U7WHQy7Ec5EJhd0C1wd1GprzD3boQI-2LLydIHvHpf5u3j3hM57NfoER-oXzEWpkw5cQyxJ_xb6cHV067zp9b7WNcBGeNh7ApjB-ZczjqaDYEhB1Wm7FO5w_0piZGklv3SvPGhRbG5DXrgxXyvEtzS6Jnj7BAo9GGg&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=125871"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAgwl9bm6KKDD1ELlSMw2BfTxWMmD8pjJifBBY1bSjZv0QHEasMfE65NBTBxXV1dVkGLAEoNhpinQ3_fFtZ9rjiRbwqt4uCHm5iLlKsSM5Y8qD7byEpJr_IlLvc0Evh_r3EhCZa359icpMfuYiK0G1o-GnGhSt0CBnLaKhK5AkqxY5lbXEq2LuDw&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=92698"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAANzfdOgH5IbWAx8g7G0vLdmGq2mg8U1Bovqd-CmJalwRCKV92mvUjjbWvz_KNs7cJMqOLwHpGZ1b116Qq8EQsKgfseBRNcTSL-7BYzM25m1w61jqcZ7BMJOUhUKjJJQbWEhDSZYug4ONfbAxDdc91kynBGhQcXoUf7KHJfS-ONP5WDjkjIqdoug&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=67801"},{"url":"https://maps.googleapis.com/maps/api/place/js/PhotoService.GetPhoto?1sCmRaAAAAAKlxgoqpIx3s5DgHKelqhuz4ooevAggOBbrs4Ggmy5-iRH6XfhVuYYj5wYjlm-D0scZarSdEMZhOhGNL875PxLc9x4LLfzIWQ9FXUybiHcp0-idFiphCF0jploRcSh3JEhAHcQiS2zvzCwQxS8FTwG6KGhSsO0xRZY_FVVyKzAb8lTN7kyP_tw&3u700&5m1&2e1&callback=none&key=AIzaSyDEou3cOo61nSpKWN1YVQHpDLBMRgKETxg&token=10126"}]};
            component.set("v.result",result);
            component.set('v.loadVF',false);
             console.log('150 result.address',result.address);
            if(typeof result.address !='undefined'){
                console.log('151 result.address',result.address);
                component.set("v.address",result.address); 
            helper.helperMapMarker(component,result.name,result.address.city,result.address.Country,
                                    result.address.Postalcode,
                                   result.address.State,result.address.street );}
            if(objectName == 'Account'){
                component.set("v.vfUrl",'');
                component.set('v.hasError', false);
                component.set('v.errorMsg','');

                helper.updateAccount(component);
                component.set('v.spinner', false);
            }
            else if(objectName == 'd360v1__Property_District360__c'){
                component.set("v.vfUrl",'');
                component.set('v.hasError', false);
                component.set('v.errorMsg','' );

                helper.updatePropertyAddress(component);
                component.set('v.spinner', false);
            }
        }, false);  

           
    },
    doneRendering : function(component, event, helper){
        if(!component.get("v.isDoneRendering")){
            component.set("v.isDoneRendering", true);
            //do something after component is first rendered
            
          }
    },
    handleSave : function(component, event, helper){

            if(component.get("v.sObjectName") == "Account")
            {
                console.log('#Helper');
                component.set('v.spinner', true);
                component.set('v.hasError', false);
                component.set('v.errorMsg','' );      
                component.set('v.loadVF',true);
                component.set("v.vfUrl",'/apex/PlacesInfoVF?id='+component.get("v.recordId")+'&lcHost='+component.get("v.lcUrl")); 
                console.log(component.get("v.lcUrl"));
                //helper.updateAccountMailingAddress(component, event);
            }else if(component.get("v.sObjectName") == "d360v1__Property_District360__c"){
                component.set('v.spinner', true);
                component.set('v.hasError', false);
                component.set('v.errorMsg','' );     
                component.set('v.loadVF',true);
                component.set("v.vfUrl",'/apex/PropertyPlacesInfoVF?id='+component.get("v.recordId")+'&lcHost='+component.get("v.lcUrl"));
                //helper.updatePropertyAddress(component, event);
            }
             
    },
    handleSaveAddress : function(component, event, helper){

            component.set('v.spinner', true);
            component.set('v.hasError', false);
            component.set('v.errorMsg','');
        	component.set('v.loadVF',false);
            helper.updateAccountAddress(component);
        //added new code
        if (component.get("v.sObjectName") === "Account") {
            helper.isBillingAndShippingDifferent(component)
            .then(function(isDifferent) {
                component.set("v.billingShippingAddressSame", !isDifferent);
            })
            .catch(function(error) {
                console.error("Error checking address difference: " + error);
            });
        }
        //ended new code
           
    },
    /*handleSaveOpeninghours : function(component, event, helper){
        var msg ='Are you sure you want to replace the opening hours?';
        if (!confirm(msg)) {
            return false;
        } else {
            if(component.get("v.sObjectName") == "Account")
            {
                console.log('#Helper');
                helper.updateAccountOpeningHours(component, event);
            }else if(component.get("v.sObjectName") == "Property_District360__c"){
                helper.updatePropertyOpeningHours(component, event);
            }
        }       
    },   
    handleSavePhone : function(component, event, helper){
        var msg ='Are you sure you want to replace the mobile numbers?';
        if (!confirm(msg)) {
            return false;
        } else {
            if(component.get("v.sObjectName") == "Account")
            {
                console.log('#Helper');
                helper.updateAccountPhone(component, event);
            }else if(component.get("v.sObjectName") == "Property_District360__c"){
                helper.updatePropertyPhone(component, event);
            }
        }       
    },  */
    onClickImage : function(component, event, helper){
        var urlval = event.getSource().get("v.id");
        //alert(urlval);
        //console.log(event.getSource().get("v.src"));
        //console.log(JSON.parse(JSON.stringify(event.getSource())));
        var msg ='Are you sure you want to save the image?';
        if (!confirm(msg)) {
            return false;
        } else {
            helper.helperSaveImage(component, event,urlval);
        }     
    },
    handleDestroy : function(component, event, helper){
        //alert('Remove');
        //window.removeEventListener('message', function(event) {});
    },
    displayBusinessHours : function(component, event, helper){
        console.log("called"+component.get("v.isDropdownClicked"));
        component.set("v.isDropdownClicked", !component.get("v.isDropdownClicked"));
	}
})
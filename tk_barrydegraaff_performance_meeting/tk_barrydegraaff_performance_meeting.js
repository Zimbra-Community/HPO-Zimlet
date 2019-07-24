/**
Copyright (C) 2014-2019 Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
*/

//Constructor
function tk_barrydegraaff_performance_meeting_HandlerObject() {
};


tk_barrydegraaff_performance_meeting_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_performance_meeting_HandlerObject.prototype.constructor = tk_barrydegraaff_performance_meeting_HandlerObject;

tk_barrydegraaff_performance_meeting_HandlerObject.prototype.toString =
function() {
   return "tk_barrydegraaff_performance_meeting_HandlerObject";
};

/** 
 * Creates the Zimlet, extends {@link https://files.zimbra.com/docs/zimlet/zcs/8.6.0/jsapi-zimbra-doc/symbols/ZmZimletBase.html ZmZimletBase}.
 * @class
 * @extends ZmZimletBase
 *  */
var HPOZimlet = tk_barrydegraaff_performance_meeting_HandlerObject;

/** 
 * This method gets called when Zimbra Zimlet framework initializes.
 * HPOZimlet uses the init function to load openpgp.js and configure the user settings and runtime variables.
 */
HPOZimlet.prototype.init = function() {
try {
   AjxDispatcher.require(["Calendar", "TinyMCE", "CalendarAppt","PreferencesCore","Preferences"]);
} catch (err) { console.log('HPOZimlet err'+err);}
};

HPOZimlet.prototype.onShowView = function(view) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_performance_meeting').handlerObject;

   ZmPref.registerPref("CAL_DEFAULT_APPT_DURATION", {
   displayName:		ZmMsg.defaultApptDuration,
   displayContainer:	ZmPref.TYPE_SELECT,
   displayOptions:		["25","30","50","60","75","90","100","120"],
   options:			["1500", "1800", "3000", "3600", "4500", "5400", "6000", "7200"]
   });   

   if(view.indexOf('APPT')>-1)
   {

   
      setTimeout(function(){
         try {
            var targetHTMLId = appCtxt.getCurrentController()._composeView._apptEditView._notesHtmlEditor.__internalId;
         } catch(err)
         {
            return;
         }

         appCtxt.getCurrentController()._composeView.setComposeMode(Dwt.HTML);
         
         //Set a nice indication of this Zimlet
         appCtxt.getCurrentController()._composeView._apptEditView.setApptMessage("High Performance Meeting");
         
         //Append UI components

         if(!document.getElementById('HPOZimlet-ApptFields'+targetHTMLId))
         {
            var divHTML = '<div id="HPOZimlet-ApptFields'+targetHTMLId+'"><h1>Meeting Purpose (Mandatory)</h1><textarea id="HPOZimletTextAreaPurpose'+targetHTMLId+'"></textarea><h1>Decisions To Be Made (Mandatory)</h1><textarea id="HPOZimletTextAreaDecisions'+targetHTMLId+'"></textarea><textarea style="display:none" id="HPOZimletTextAreaPurposeOriginal'+targetHTMLId+'"></textarea><textarea style="display:none" id="HPOZimletTextAreaDecisionsOriginal'+targetHTMLId+'"></textarea>';         
            document.getElementById(targetHTMLId).insertAdjacentHTML('afterend',divHTML);
            tinyMCE.execCommand("mceAddEditor",false,'HPOZimletTextAreaPurpose'+targetHTMLId);
            tinyMCE.execCommand("mceAddEditor",false,'HPOZimletTextAreaDecisions'+targetHTMLId);
            
            //hide original save, send and close button
            document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SEND_INVITE').parentNode.style.display = "none";
            document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SAVE').parentNode.style.display = "none";
            document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__CANCEL').parentNode.style.display = "none";

            var origCloseXBtn = document.getElementById("zb__App__tab_"+appCtxt.getCurrentViewId()+"_right_icon").outerHTML;
            var newCloseXBtn = origCloseXBtn.replace(/id="(.*?)"/g, 'id="HPOZimletCloseX'+targetHTMLId+'"');
            document.getElementById("zb__App__tab_"+appCtxt.getCurrentViewId()+"_right_icon").insertAdjacentHTML('beforebegin',newCloseXBtn);

            //remove the close option on the tab, as we did not implement that way of saving draft with attachment         
            document.getElementById("zb__App__tab_"+appCtxt.getCurrentViewId()+"_right_icon").style=('display:none');
            
            document.getElementById('HPOZimletCloseX'+targetHTMLId).onmouseover = function(){this.firstChild.className = 'ImgClose'};
            document.getElementById('HPOZimletCloseX'+targetHTMLId).onmouseout = function(){this.firstChild.className = 'ImgCloseGray'};
            document.getElementById('HPOZimletCloseX'+targetHTMLId).onclick = AjxCallback.simpleClosure(zimletInstance._closeBtnListener, zimletInstance);

            //disable text mode appointments
            appCtxt.getCurrentController()._textModeOkCallback = function() {
               //text mode not implemented
            };
            
            //remove text/plain switcher from options menu
            for (var i = 0; i < appCtxt.getCurrentController().getToolbar().getButton(ZmOperation.COMPOSE_OPTIONS).getMenu()._children._array.length; i++) {
               if(appCtxt.getCurrentController().getToolbar().getButton(ZmOperation.COMPOSE_OPTIONS).getMenu()._children._array[i]._data.value == "text/plain")
               {
                  appCtxt.getCurrentController().getToolbar().getButton(ZmOperation.COMPOSE_OPTIONS).getMenu()._children._array[i].dispose();
               }
            }

            //Hide original notes field
            document.getElementById(targetHTMLId).style.display = "none";            
         }
         
         //Parse existing meeting data
         if(appCtxt.getCurrentController()._composeView.getAppt().viewMode == "EDIT")
         {
            //This is loads of fun
            //var content = tinyMCE.editors[targetHTMLId+'_body'].getContent();
            //var content = appCtxt.getCurrentController()._composeView.getAppt().getNotesPart('text/html');
            var content = appCtxt.getCurrentController()._composeView._setData[0].getNotesPart('text/html');
            content = HPOZimlet.prototype.decode(content);
            content = content.replace(/(\r|\n)/g, "");

            var matches = content.match(/<div style="text-transform:none">.*?<div style="text-transform:capitalize">/g);

            if(matches)
            {
               //remove `data separators`
               matches[0] = matches[0].replace(/<div style="text-transform:none">/g,"");
               matches[0] = matches[0].replace(/<div style="text-transform:capitalize">/g,"");
               matches[1] = matches[1].replace(/<div style="text-transform:none">/g,"");
               matches[1] = matches[1].replace(/<div style="text-transform:capitalize">/g,"");            
               tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].setContent(DOMPurify.sanitize(matches[0]));
               tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].setContent(DOMPurify.sanitize(matches[1]));
               
               //store the processed value of tinyMCE editor upon loading so we can check for changes
               document.getElementById('HPOZimletTextAreaPurposeOriginal'+targetHTMLId).value=tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].getContent();
               document.getElementById('HPOZimletTextAreaDecisionsOriginal'+targetHTMLId).value=tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].getContent();
            }
            else
            {
               tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].setContent(DOMPurify.sanitize(content));
            }
         }
         
         //Add change listener
         /*
          * would be nice, but Zimbra captures the backspace button and such....
         tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].on("change", function() { HPOZimlet.prototype.enableSaveSend();});
         tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].on("change", function() { HPOZimlet.prototype.enableSaveSend();});
         tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].on("keypress", function() { HPOZimlet.prototype.enableSaveSend();});
         tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].on("keypress", function() { HPOZimlet.prototype.enableSaveSend();});*/
         HPOZimlet.prototype.enableSaveSend();


      }, 0);
   }
};

HPOZimlet.prototype.enableSaveSend = function() {
   setTimeout(function() {
      try {
      var targetHTMLId = appCtxt.getCurrentController()._composeView._apptEditView._notesHtmlEditor.__internalId;
      var notesFieldsContentA = tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].getContent();
      var notesFieldsContentB = tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].getContent();
   
      if(notesFieldsContentA.length < 20 || notesFieldsContentB.length < 20)   
      {
         appCtxt.getCurrentController().getToolbar().getButton("HPOZimletOpSend").setEnabled(false);
         appCtxt.getCurrentController().getToolbar().getButton("HPOZimletOpSave").setEnabled(false);
      }
      else
      {
         appCtxt.getCurrentController().getToolbar().getButton("HPOZimletOpSend").setEnabled(true);
         appCtxt.getCurrentController().getToolbar().getButton("HPOZimletOpSave").setEnabled(true);      
      }   
   // Again
   HPOZimlet.prototype.enableSaveSend();
   } catch(err){
      //we are destroyed
   }
   
   // Every 3 sec
   }, 100);
};

HPOZimlet.prototype.decode = function(str)
{
   return str.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
   });
};

HPOZimlet.prototype.initializeToolbar = function(app, toolbar, controller, view) {
   view = appCtxt.getViewTypeFromId(view);
	if(view.indexOf('APPT')>-1) {
		var buttonArgs = {
			text	: ZmMsg.send,
         showImageInToolbar: false,
         showTextInToolbar: true,
         tooltip: ZmMsg.sendInvites,
         enabled: false,
         index: 1
		};

		if(!toolbar.getButton('HPOZimletOpSend')) {
			var button = toolbar.createButton('HPOZimletOpSend', buttonArgs);
			button.addSelectionListener(new AjxListener(this, this._sendBtnListener, [controller]));
		}

		var buttonArgs = {
			text	: ZmMsg.save,
         showImageInToolbar: false,
         showTextInToolbar: true,
         tooltip: ZmMsg.saveToCalendar,
         enabled: false,
         index: 2
		};
		if(!toolbar.getButton('HPOZimletOpSave')) {
			var button = toolbar.createButton('HPOZimletOpSave', buttonArgs);
			button.addSelectionListener(new AjxListener(this, this._saveBtnListener, [controller]));
		}

		var buttonArgs = {
			text	: ZmMsg.close,
         showImageInToolbar: false,
         showTextInToolbar: true,
         tooltip: ZmMsg.closeTooltip,
         enabled: true,
         index: 3
		};
		if(!toolbar.getButton('HPOZimletOpClose')) {
			var button = toolbar.createButton('HPOZimletOpClose', buttonArgs);
			button.addSelectionListener(new AjxListener(this, this._closeBtnListener, [controller]));
		}
	}
};

HPOZimlet.prototype._sendBtnListener = function() {
   if(this._saveNotes())
   {
      this._originalSendBtnClicker();
   }   
};

HPOZimlet.prototype._saveBtnListener = function() {
   if(this._saveNotes())
   {
      this._originalSaveBtnClicker();
   }   
};


HPOZimlet.prototype._saveNotes = function() {
   var targetHTMLId = appCtxt.getCurrentController()._composeView._apptEditView._notesHtmlEditor.__internalId;
   var notesFieldsContentA = tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].getContent();
   var notesFieldsContentB = tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].getContent();
   
   if(appCtxt.getCurrentController()._composeView.getAppt().name.length < 1)
   {
      HPOZimlet.prototype.status(ZmMsg.errorMissingSubject,ZmStatusView.LEVEL_WARNING);
      return false;
   }
   
   if(notesFieldsContentA.length < 20 || notesFieldsContentB.length < 20)
   {
      HPOZimlet.prototype.status("Please enter more information for Meeting Purpose and Decisions Made.",ZmStatusView.LEVEL_WARNING);
      return false;
   }
   
   var bodyText = '<div style="font-family: arial\, helvetica\, sans-serif\; font-size: 12pt\; color: #000000"><div><span style="text-decoration:underline" data-mce-style="text-decoration: underline\;"><strong>Meeting Purpose</strong></span></div><div></div><div style="text-transform:none">'+notesFieldsContentA+'</div><div style="text-transform:capitalize">&nbsp;</div><div></div><div><span style="text-decoration: underline\;" data-mce-style="text-decoration: underline\;"><strong>Decisions To Be Made</strong></span></div><div></div><div style="text-transform:none">'+notesFieldsContentB+'</div><div style="text-transform:capitalize">&nbsp;</div></div>';
   tinyMCE.editors[targetHTMLId+'_body'].setContent(DOMPurify.sanitize(bodyText));
   tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].setContent('');
   tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].setContent('');
   return true;
};

HPOZimlet.prototype.status =
  function(text, type) {
    var transitions = [ ZmToast.FADE_IN, ZmToast.PAUSE, ZmToast.PAUSE, ZmToast.PAUSE, ZmToast.FADE_OUT ];
    appCtxt.getAppController().setStatusMsg(text, type, null, transitions);
  };


HPOZimlet.prototype._closeBtnListener = function() {
   //Check for changes in the notes fields, throw away w/p confirmation if there is no change
   try { 
      var targetHTMLId = appCtxt.getCurrentController()._composeView._apptEditView._notesHtmlEditor.__internalId;
      
      //Get active content maybe changed by user
      var notesFieldsContent = tinyMCE.editors['HPOZimletTextAreaPurpose'+targetHTMLId].getContent();
      notesFieldsContent += tinyMCE.editors['HPOZimletTextAreaDecisions'+targetHTMLId].getContent();
      
      //Get content as it was before the user may have changed it
      var originalNotesContent = document.getElementById('HPOZimletTextAreaPurposeOriginal'+targetHTMLId).value +document.getElementById('HPOZimletTextAreaDecisionsOriginal'+targetHTMLId).value;
   
      if(notesFieldsContent == originalNotesContent)
      {
         this._closeBtnOKListener();
         return;
      }
   
      if(notesFieldsContent.length < 24)
      {
         this._closeBtnOKListener();
         return;      
      }
      
      this._deleteConfirmationDialog = new ZmDialog({
         title: ZmMsg.confirm,
         parent: this.getShell(),
         standardButtons: [DwtDialog.OK_BUTTON, DwtDialog.CANCEL_BUTTON],
         disposeOnPopDown: true
      });
      var html = ZmMsg.apptSignificantChangesAttendee;
   
      this._deleteConfirmationDialog.setContent(html);
      this._deleteConfirmationDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this, this._closeBtnOKListener));
      this._deleteConfirmationDialog.setButtonListener(DwtDialog.CANCEL_BUTTON, new AjxListener(this, this._closeBtnCANCELListener));
      this._deleteConfirmationDialog._tabGroup.addMember(document.getElementById(this._deleteConfirmationDialog._button[1].__internalId));
      this._deleteConfirmationDialog._tabGroup.addMember(document.getElementById(this._deleteConfirmationDialog._button[2].__internalId));
      this._deleteConfirmationDialog._baseTabGroupSize = 2;        
      this._deleteConfirmationDialog.popup();
   } catch(err)
   {
      appCtxt.getCurrentController()._closeView();
   }
};

HPOZimlet.prototype._closeBtnOKListener = function() {
   var targetHTMLId = appCtxt.getCurrentController()._composeView._apptEditView._notesHtmlEditor.__internalId;
   var id = 'HPOZimlet-ApptFields'+targetHTMLId;
   tinyMCE.execCommand("mceRemoveEditor",false,'HPOZimletTextAreaPurpose'+targetHTMLId);
   tinyMCE.execCommand("mceRemoveEditor",false,'HPOZimletTextAreaDecisions'+targetHTMLId);
   document.getElementById(id).parentNode.removeChild(document.getElementById(id));
   try{
      this._deleteConfirmationDialog.popdown();
   } catch (err) {}   
   appCtxt.getCurrentController().closeView();
};

HPOZimlet.prototype._closeBtnCANCELListener = 
function () {
   this._deleteConfirmationDialog.popdown();
};

HPOZimlet.prototype._originalSaveBtnClicker = function() {
   //yes we do it twice on purpose, this is not a typo.
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SAVE').click();
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SAVE').click();
};

HPOZimlet.prototype._originalSendBtnClicker = function() {
   //yes we do it twice on purpose, this is not a typo.
   try{
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SEND_INVITE').click();
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__SEND_INVITE').click();
   }catch(err){}
};

HPOZimlet.prototype._originalCloseBtnClicker = function() {
   //yes we do it twice on purpose, this is not a typo.
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__CANCEL').click();
   document.getElementById('zb__'+appCtxt.getCurrentController()._currentViewId+'__CANCEL').click();
};

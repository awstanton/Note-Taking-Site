"use strict";
/******************** S A V E   C H A N G E S ********************/
var pendingSave = false;
var pendingResponse = false;
var pendingRefresh = false;
var pendingLogout = false;
var refreshing = false;
(function() {
	
	function refresh(event) {
		if (!pendingRefresh) {
			if (pendingResponse || pendingSave) {
				pendingRefresh = true;
				refreshing = true;
				document.getElementById("body").classList.add("displayNone");
				document.getElementById("loading").classList.remove("displayNone");
			}
			else {
				window.location.reload();
			}
		}
		else {
			window.location.reload();
		}
		event.preventDefault();
	}
	
	function outerRefresh(event) {
		if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
			refresh(event);
		}
	}
	document.addEventListener("keydown", outerRefresh);
	
	function outerSave(event) {
		if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
			save(event);
		}
	}
	
	function save(event) {
//			console.log("saving state.changesMap:");
//			console.log(state.changesMap);
//			console.log("pendingResponse: " + pendingResponse);
//			console.log("pendingSave: " + pendingSave);
		
		if (!pendingResponse) {
//				console.log("not pending response");
			pendingSave = false;
			
			if (state.changesMap.size > 0) {
//					console.log("request queue not empty");
				pendingResponse = true;
				
				var formData = new FormData();
				var i = 0;
				state.changesMap.forEach((value, key, map) => {
					var removedTags = "";
					for (var j = 0; j < value.oldTags.length - 1; ++j) {
						removedTags += value.oldTags[j] + ",";
					}
					if (value.oldTags.length > 0) {
						removedTags += value.oldTags[j];
					}
					var addedTags = "";
					for (var k = 0; k < value.newTags.length - 1; ++k) {
						addedTags += value.newTags[k] + ",";
					}
					if (value.newTags.length > 0) {
						addedTags += value.newTags[k];
					}
					
					formData.append("updateItems[" + i + "].type", value.action);
					formData.append("updateItems[" + i + "].oldName", value.oldItemName);
					formData.append("updateItems[" + i + "].newName", value.newItemName);
					formData.append("updateItems[" + i + "].oldList", value.oldListName);
					formData.append("updateItems[" + i + "].newList", value.newListName);
					formData.append("updateItems[" + i + "].description", value.description);
					formData.append("updateItems[" + i + "].removedTags", removedTags);
					formData.append("updateItems[" + i + "].addedTags", addedTags);
					formData.append("updateItems[" + i + "].modified", value.modified);
					
					++i;
				});
				
				var headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' });
				headers.append(document.getElementById("_csrf_header").content, document.getElementById("_csrf").content);
				
				state.changesMap.clear();
				
				fetch('https://localhost:8443/SpringMVCExperiment/updateItem',
				    { method: 'POST',
				  	  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				  	  headers:  headers,
				  	  body: new URLSearchParams(formData)
				    })
				.then(response => {
//						console.log(response);
					pendingResponse = false;
					if (pendingSave) {
						save();
					}
					else {
						if (pendingLogout) {
							pendingLogout = false;
							var evt = { target: { id: "logoutLink" } };
							logout(evt);
						}
						else if (pendingRefresh) {
							pendingRefresh = false;
							refresh();
						}
					}
				});
//					state.changesMap.clear(); // THIS SHOULD BE GUARANTEED TO RUN BEFORE THEN IS EXECUTED - BUT I PUT IT ABOVE TO BE SAFE
			}
			else {
//					console.log("request size is empty");
				pendingResponse = false;
			}
		}
		else {
//				console.log("pending response");
			if (state.changesMap.size > 0) {
				pendingSave = true;
			}
		}
		
		if (event) {
			event.preventDefault();
		}
	}
	document.addEventListener("keydown", outerSave);
	//brings up prompt for user to confirm exit 
	function preventDefaultBeforeUnload(event) {
		if (!refreshing) {
			event.preventDefault();
		}
	};
	window.addEventListener("beforeunload", preventDefaultBeforeUnload);
	
	function logout(event) {
//		console.log("logout()");
		if (pendingResponse || pendingSave) {
			pendingLogout = true;
			document.getElementById("body").classList.add("displayNone");
			document.getElementById("loading").classList.remove("displayNone");
		}
		else {
			pendingLogout = false;
//			console.log("should exit");
			window.removeEventListener("beforeunload", preventDefaultBeforeUnload);
//			console.log("state.changesMap:");
//			console.log(state.changesMap);
//			console.log("in logout function");
			if (event.target.id === "logoutLink") {
	//				console.log("event target id is logoutLink");
				// save and then log out
				if (state.changesMap.size > 0) {
	//					console.log("state.changesMap size is greater than 0");
					var i = 0;
					var logoutForm = document.getElementById("logoutForm");
					
					state.changesMap.forEach(
						(value, key, map) => {
							// prepare removedTags string
							var removedTags = "";
							for (var j = 0; j < value.oldTags.length - 1; ++j) {
								removedTags += value.oldTags[j] + ",";
							}
							if (value.oldTags.length > 0) {
								removedTags += value.oldTags[j];
							}
							// prepare addedTags string
							var addedTags = "";
							for (var k = 0; k < value.newTags.length - 1; ++k) {
								addedTags += value.newTags[k] + ",";
							}
							if (value.newTags.length > 0) {
								addedTags += value.newTags[k];
							}
							
							// prepare form for submission
							var input1 = document.createElement("input");
							input1.name = "updateItems[" + i + "].type";
							input1.value = value.action;
							var input2 = document.createElement("input");
							input2.name = "updateItems[" + i + "].oldName";
							input2.value = value.oldItemName;
							var input3 = document.createElement("input");
							input3.name = "updateItems[" + i + "].newName";
							input3.value = value.newItemName;
							var input4 = document.createElement("input");
							input4.name = "updateItems[" + i + "].oldList";
							input4.value = value.oldListName;
							var input5 = document.createElement("input");
							input5.name = "updateItems[" + i + "].newList";
							input5.value = value.newListName;
							var input6 = document.createElement("input");
							input6.name = "updateItems[" + i + "].description";
							input6.value = value.description;
							var input7 = document.createElement("input");
							input7.name = "updateItems[" + i + "].removedTags";
							input7.value = removedTags;
							var input8 = document.createElement("input");
							input8.name = "updateItems[" + i + "].addedTags";
							input8.value = addedTags;
							var input9 = document.createElement("input");
							input9.name = "updateItems[" + i + "].modified";
							input9.value = value.modified;
							
							logoutForm.appendChild(input1);
							logoutForm.appendChild(input2);
							logoutForm.appendChild(input3);
							logoutForm.appendChild(input4);
							logoutForm.appendChild(input5);
							logoutForm.appendChild(input6);
							logoutForm.appendChild(input7);
							logoutForm.appendChild(input8);
							logoutForm.appendChild(input9);
							
							++i;
						}
					);
	//					console.log("logoutForm:");
	//					console.log(logoutForm);
	//					console.log("submitting form");
					logoutForm.submit();
				}
				// nothing to save; just log out
				else {
					var logoutForm = document.getElementById("logoutForm");
					logoutForm.action = "/SpringMVCExperiment/logout";
					logoutForm.method = "post";
					logoutForm.submit();
				}
			}
		}
	}
	document.getElementById("logoutLink").addEventListener("click", logout);
	
})();



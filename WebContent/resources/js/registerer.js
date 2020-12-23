"use strict";

//register given event handlers for given event type on given elements
function registerHandlers(elements, eventType, eventHandler) {
	for (var i = 0; i < elements.length; ++i) {
		elements[i].addEventListener(eventType, eventHandler)
	}
}

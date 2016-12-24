/**
 * Chrome Extensions don't have access to events when not being in the page scope.
 * So we inject the main functions into the page.
 *
 * @author 	Jacob Groß
 * @date   	2016-03-01
 */
(function (document) {
	'use strict'

	var s = document.createElement('script')
	s.src = chrome.extension.getURL('main.js')
	s.onload = function () {
		this.parentNode.removeChild(this)
		s = undefined
	}
	document.documentElement.appendChild(s)
}(window.document));

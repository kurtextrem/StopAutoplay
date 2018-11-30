/**
 * Chrome Extensions don't have access to `window` props when not being in the page scope.
 * So we inject the main functions into the page in order to have access to 'onYouTubePlayerReady'
 *
 * @author 	Jacob Groß
 * @date   	2016-03-01
 */
;(function inject(document) {
	'use strict'

	const s = document.createElement('script')
	s.src = chrome.extension.getURL('main.js')
	// s.async = true // it's async by default
	//s.onload = function onload() {
	//this.parentNode.removeChild(this)
	//	s = null // GC
	//}
	document.documentElement.appendChild(s)
})(window.document)

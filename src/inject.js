var s = document.createElement('script')
s.src = chrome.extension.getURL('main.js')
s.onload = function () {
	this.parentNode.removeChild(this)
}
document.documentElement.appendChild(s)

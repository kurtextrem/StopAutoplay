+function (window) {
	'use strict';

	var document = window.document, location = document.location

	var StopAutoplay = function () {
		this.player = null
		this.html5 = false
		this.last = -1
		this.count = 0

		this.init()
		this.bind()
	}

	//StopAutoplay.VERSION = 1.5

	StopAutoplay.prototype.init = function () {
		if (!this.isWatchPage()) return
		this.updatePlayer()
		if (!document.hasFocus())
			this.stop()
	}

	StopAutoplay.prototype.updatePlayer = function () {
		this.player = document.getElementById('movie_player')
		if (this.player.className.indexOf('html5-video-player') !== -1) {
			this.html5 = true
			this.player = document.getElementsByTagName('video')[0]
			this.player.getCurrentTimeVideo = function () {
				return this.currentTime
			}
		}
	}

	StopAutoplay.prototype.stop = function () {
		this.pause()
		if (this.count < 8) {
			window.setTimeout(function () {
				if (document.hasFocus()) return
				var last = this.getTime()
				if (last === undefined)
					return this.stop()
				if (this.last !== last) {
					this.last = last
				} else {
					this.count++
				}
				this.stop()
			}.bind(this), 4)
		}
	}

	StopAutoplay.prototype._exec = function (which) {
		var action = this.html5 ? which + 'Video' : which
		return this.player[action] !== undefined ? this.player[action]() : 0
	}

	StopAutoplay.prototype.getTime = function () {
		return this._exec('getCurrentTime')
	}

	StopAutoplay.prototype.pause = function () {
		this._exec('pause')
	}

	StopAutoplay.prototype.play = function () {
		this._exec('play')
	}

	StopAutoplay.prototype.handleVisibilityChange = function () {
		if (!this.isWatchPage()) return
		window.setTimeout(function () {
			if (!document.hidden)
				this.play()
		}.bind(this), 60)
	}

	StopAutoplay.prototype.bind = function () {
		window.addEventListener('focus', this.handleVisibilityChange.bind(this), false) // automatic playback
		window.addEventListener('popstate', this.init.bind(this), false) // user back / for navigation
		document.documentElement.addEventListener('transitionend', function (event) { // after ajax navigation, only works while tab is active: https://stackoverflow.com/questions/18397962/chrome-extension-is-not-loading-on-browser-navigation-at-youtube/18398921#18398921
			if (event.propertyName === 'width' && event.target.id === 'progress') {
				this.init()
			}
		}.bind(this), false)
	}

	StopAutoplay.prototype.isWatchPage = function () {
		return location.pathname === '/watch'
	}

	// start
	new StopAutoplay()
}(window);

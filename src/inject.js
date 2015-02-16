+function (window) {
	'use strict';

	var document = window.document,
		location = window.location

	var StopAutoplay = function () {
		/** @type {Object}	Contains the current video player */
		this.player = null
		/** @type {Boolean}	Whether the page uses the flash player or not (rarely used) */
		this.flash = false
		/** @type {Number} 	Counter in the stop loop */
		this.count = 0
		/** @type {Number}	Needed because there can be two 'video' elements on the page  */
		this.playerCount = 0

		this.init()
		this.bind()
	}

	//StopAutoplay.VERSION = '1.8'

	StopAutoplay.prototype.init = function () {
		if (!this.isWatchPage() && !this.isChannelPage()) return
		this.updatePlayer()
		if (!document.hasFocus())
			this.stop()
	}

	StopAutoplay.prototype.updatePlayer = function () {
		console.log('update player')
		this.flash = false
		this.player = document.getElementsByTagName('video')[this.playerCount] // without an id the fastest method
		if (!this.player) {
			var player = document.getElementById('movie_player')
			if (!player.classList.contains('html5-video-player')) {
				console.log('flash')
				this.flash = true
				this.player = player
			}
		}
	}

	StopAutoplay.prototype.stop = function () {
		this.pause()
		if (this.count < 14) {
			window.setTimeout(function () {
				if (document.hasFocus()) return;
				++this.count
				this.stop()
			}.bind(this), 4)
		}
	}

	// html5: pause(), play(), getCurrentTime
	// flash: pauseVideo(), playVideo(), getCurrentTime()
	StopAutoplay.prototype._exec = function (which) {
		var action = this.flash ? which + 'Video' : which
		if (this.player[action] !== undefined)
			this.player[action]()
	}

	StopAutoplay.prototype.pause = function () {
		this._exec('pause')
	}

	StopAutoplay.prototype.play = function () {
		this._exec('play')
	}

	StopAutoplay.prototype.handleVisibilityChange = function () {
		window.setTimeout(function () {
			if (!document.hidden)
				this.play()
		}.bind(this), 60)
	}

	StopAutoplay.prototype.bind = function () {
		window.addEventListener('focus', this.handleVisibilityChange.bind(this), false) // extended version: automatic playback

		window.addEventListener('spfdone', function (e) {
			console.log('spfdone', e.detail.url)
			this.player = null
			this.count = 0
			this.playerCount = 0
			this.init()
		}.bind(this))
	}

	StopAutoplay.prototype.isWatchPage = function () {
		return location.pathname === '/watch' && location.search.indexOf('list=') === -1 // Playlist
	}

	StopAutoplay.prototype.isChannelPage = function () {
		if (location.pathname.indexOf('/channel/') === -1 && location.pathname.indexOf('/user/') === -1) return false
		if (this.playerCount) return true

		this.count = 0
		this.playerCount = 1
		window.setTimeout(this.init.bind(this), 2250)

		return false
	}

	// start
	new StopAutoplay()
}(window);

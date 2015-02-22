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
		/** @type {Boolean} Whether the video has started playing already  */
		this.alreadyStarted = false

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
			console.log('flash')
			this.flash = true
			this.player = document.getElementById('movie_player')
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
		if (this.player !== undefined && this.player[action] !== undefined)
			this.player[action]()
	}

	StopAutoplay.prototype.pause = function () {
		this._exec('pause')
	}

	StopAutoplay.prototype.play = function () {
		this.alreadyStarted = true
		this._exec('play')
	}

	StopAutoplay.prototype.handleVisibilityChange = function (e) {
		window.setTimeout(function () {
			if (!document.hidden && !this.alreadyStarted)
				this.play()
		}.bind(this), 60)
	}

	StopAutoplay.prototype.bind = function () {
		document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), false) // extended version: automatic playback

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

		console.log('channel')
		var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					if (mutation.addedNodes[i].nodeName === 'VIDEO' || mutation.addedNodes[i].nodeName === 'EMBED') {
						console.log('mutation', mutation.addedNodes[i])
						if (!this.playerCount) {
							return this.playerCount = 1
						}
						observer.disconnect()
						return this.init()
						//return window.setTimeout(this.init.bind(this), 1000)
					}
				}
			}.bind(this))
		}.bind(this))
		observer.observe(document.body, { childList: true, subtree: true })

		return false
	}

	// start
	new StopAutoplay()
}(window);

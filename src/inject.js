+function (window) {
	'use strict';

	var document = window.document,
		location = window.location

	var StopAutoplay = function () {
		this.player = null
		this.flash = false
		this.playerCount = 0
		this.count = 0

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
		this.player = document.getElementsByTagName('video')[this.playerCount] // without an id the fastest method
		if (!this.player) {
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
		new MutationObserver(function (mutations) { // AJAX: non player page -> player page or player page -> profile page w/ player
			mutations.forEach(function (mutation) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					if (mutation.addedNodes[i].nodeName === 'VIDEO' || mutation.addedNodes[i].nodeName === 'EMBED') {
						console.log('channel')
						this.player = null
						this.flash = false
						this.playerCount = 0
						this.count = 0

						return this.init()
					}
				}
			}.bind(this))
		}.bind(this)).observe(document.body, { childList: true, subtree: true })
		new MutationObserver(function (mutations) { // AJAX: player -> player
			if (this.player && this.player.dataset.youtubeId !== mutations[0].oldValue) { // mutation event fired even though same value
				console.log('player')
				this.count = 0
				this.init()
			}
		}.bind(this)).observe(this.player, { attributes: true, attributeFilter: ['data-youtube-id'], attributeOldValue: true })
	}

	StopAutoplay.prototype.isWatchPage = function () {
		return location.pathname === '/watch' && location.search.indexOf('list=') === -1 // Playlist
	}

	StopAutoplay.prototype.isChannelPage = function () {
		if (location.pathname.indexOf('/channel/') === -1 && location.pathname.indexOf('/user/') === -1) return false // Channel page
		if (this.playerCount) return true
		this.playerCount = 1
		window.setTimeout(this.init.bind(this), 1000)
		return false
	}

	// start
	new StopAutoplay()
}(window);

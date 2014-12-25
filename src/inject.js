+function (window) {
	'use strict';

	var document = window.document,
		location = window.location

	var StopAutoplay = function () {
		this.player = null
		this.flash = false
		this.count = 0

		this.init()
		this.bind()
	}

	//StopAutoplay.VERSION = '1.8'

	StopAutoplay.prototype.init = function () {
		if (!this.isWatchPage()) return
		this.updatePlayer()
		if (!document.hasFocus())
			this.stop()
	}

	StopAutoplay.prototype.updatePlayer = function () {
		this.player = document.getElementsByTagName('video')[0] // without an id the fastest method
		if (!this.player) {
			this.flash = true
			this.player = document.getElementById('movie_player')
		}
	}

	StopAutoplay.prototype.stop = function () {
		this.pause()
		if (this.count < 10) {
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
		if (!this.isWatchPage()) return
		window.setTimeout(function () {
			if (!document.hidden)
				this.play()
		}.bind(this), 60)
	}

	StopAutoplay.prototype.bind = function () {
		window.addEventListener('focus', this.handleVisibilityChange.bind(this), false) // extended version: automatic playback
		new MutationObserver(this.init.bind(this)).observe(document.body, { attributes: true })
	}

	StopAutoplay.prototype.isWatchPage = function () {
		return (location.pathname === '/watch' && location.search.indexOf('list=') === -1) || (location.pathname.indexOf('/channel/') !== -1 || location.pathname.indexOf('/user/') !== -1) // Playlist or channel page
	}

	// start
	new StopAutoplay()
}(window);

+function(window) {
	'use strict';
	var StopAutoplay = function() {
		this.updatePlayer()
		if (!document.hasFocus())
			this.stop()
		this.bind()
	}

	StopAutoplay.prototype = {
		construct: StopAutoplay,

		player: null,
		html5: false,
		last: -1,
		count: 0,

		html5action: {
			play: 'play',
			pause: 'pause',
			time: 'getCurrentTime'
		},
		action: {
			play: 'playVideo',
			pause: 'pauseVideo',
			time: 'getCurrentTime'
		},

		updatePlayer: function() {
			this.player = document.getElementById('movie_player')
			if (this.player.className.indexOf('html5-video-player') !== -1) {
				this.html5 = true
				this.player = document.getElementsByTagName('video')[0]
				this.player.getCurrentTime = function() { return this.currentTime }
			}
		},

		stop: function() {
			this.pause()
			if  (this.count < 8) {
				window.setTimeout(function() {
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
		},

		_exec: function(which) {
			var action = this.html5 ? this.html5action[which] : this.action[which]
			return this.player[action] !== undefined ? this.player[action]() : undefined
		},

		getTime: function() {
			return this._exec('time')
		},

		pause: function() {
			this._exec('pause')
		},

		play: function() {
			this._exec('play')
		},

		handleVisibilityChange: function() {
			window.setTimeout(function() {
				if (!document.hidden)
					this.play()
			}.bind(this), 60)
		},

		bind: function() {
			window.addEventListener('focus', this.handleVisibilityChange.bind(this), false)
			window.addEventListener('popstate', this.updatePlayer.bind(this), false)
		}
	}

	window.StopAutoplay = StopAutoplay
}(window);

// start
if (location.href.indexOf('watch?') !== -1)
	new StopAutoplay()

+function(window) {
	'use strict';
	var StopAutoplay = function() {
		this.init()
		this.bind()
	}

	StopAutoplay.prototype = {
		construct: StopAutoplay,

		player: null,
		html5: false,
		last: -1,
		count: 0,
		_focus: null,

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

		init: function() {
			if (!this.isWatchPage()) return
			this.updatePlayer()
			if (!document.hasFocus())
				this.stop()
			this.bindPlayer()
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
			if (!this.isWatchPage()) return
			window.setTimeout(function() {
				if (!document.hidden)
					this.play()
			}.bind(this), 60)
		},

		bindPlayer: function() { // When player is there
			if (!this._focus)
				this._focus = window.addEventListener('focus', this.handleVisibilityChange.bind(this), false)
		},

		bind: function() { // When player isn't there
			window.addEventListener('popstate', this.init.bind(this), false) // user back / for navigation
			document.body.addEventListener('transitionend', function(event) { // after ajax navigation, only works while tab is active: https://stackoverflow.com/questions/18397962/chrome-extension-is-not-loading-on-browser-navigation-at-youtube/18398921#18398921
			    	if (event.propertyName === 'width' && event.target.id === 'progress') {
			        		this.init()
			    	}
			}.bind(this), true)
		},

		isWatchPage: function() {
			return location.pathname === '/watch'
		}
	}

	window.StopAutoplay = StopAutoplay
}(window);

// start
new StopAutoplay()

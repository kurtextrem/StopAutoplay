+function (window) {
	'use strict'

	var document = window.document,
		location = window.location

	/**
	 * The constructor, binds and initializes vars.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	var StopAutoplay = function () {
		/** @type {Object}	Contains the current video player */
		this.player = []
		/** @type {Boolean}	Needed because the channel player is a c4 and not a movie player.  */
		this.channelPlayer = false

		this.bind()
	}

	// StopAutoplay.VERSION = '1.81'

	/**
	 * Main function to determine following actions.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @param	{Boolean}	bypass	Whether to bypass the page check or not.
	 */
	StopAutoplay.prototype.init = function (bypass) {
		if (!bypass && !this.isWatchPage() && !this.isChannelPage()) return
		this.updatePlayer()
		this.stop()
	}

	/**
	 * Updates the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-15
	 */
	StopAutoplay.prototype.updatePlayer = function () {
		console.log('update player')
		this.player = document.getElementById('c4-player') || document.getElementById('movie_player') ||  []
	}

	/**
	 * Stops the player.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-16
	 */
	StopAutoplay.prototype.stop = function () {
		// if (!document.hasFocus())
			this.pause()
	}

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.pause = function () {
		console.log('pause')
		this.player.pauseVideo()
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.play = function () {
		console.log('play')
		this.player.playVideo()
	}

	/**
	 * Event handler when the tab gets visible.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.handleVisibilityChange = function () {
		window.setTimeout(function () {
			if (!document.hidden)
				this.play()
		}.bind(this), 60)
	}

	/**
	 * Binds event handlers.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.bind = function () {
		// wait for youtube
		var original = window.onYouTubePlayerReady // safety
		window.onYouTubePlayerReady = function () {
			console.log('player ready')
			this.updatePlayer()
			this.player.addEventListener('onStateChange', 'playerStateChange')
			this.player.addEventListener('onReady', 'onPlayerReady')
			this.init(true)
			if (original) original()
		}.bind(this)

		window.playerStateChange = function (e) {
			console.log('state change', e)
		}

		window.onPlayerReady = function () {
			console.log('rdy')
		}

		window.addEventListener('focus', this.handleVisibilityChange.bind(this), false) // extended version: automatic playback

		window.addEventListener('spfdone', function (e) { // needed for player -> player
			console.log('spfdone', e.detail.url)
			this.init()
		}.bind(this))
	}

	/**
	 * Whether the current page is a main video.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @return 	{Boolean}
	 */
	StopAutoplay.prototype.isWatchPage = function () {
		return location.pathname === '/watch' && location.search.indexOf('list=') === -1 // Playlist
	}

	/**
	 * Whether the current page is a channel page.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-15
	 * @return 	{Boolean}
	 */
	StopAutoplay.prototype.isChannelPage = function () {
		return location.pathname.indexOf('/channel/') === -1 || location.pathname.indexOf('/user/') !== -1
	}

	// start
	new StopAutoplay()
}(window);

console.log('loaded')
debugger;

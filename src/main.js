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
	 */
	StopAutoplay.prototype.init = function () {
		if (!this.isWatchPage() && !this.isChannelPage()) return
		this.updatePlayer()
		if (!document.hasFocus())
			this.pause()
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
			this.init()
			if (original) original()
		}.bind(this)

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

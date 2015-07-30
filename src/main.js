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
		/** @type {Object}	Contains the current video player. */
		this.player = {}
		/** @type {Boolean}  	Whether the current page is a /watch page or not. */
		this.isWatch = this.isWatchPage()
		/** @type {Number}  	Holds the previous player state. */
		this.prevState = 0

		this.bind()
	}

	// StopAutoplay.VERSION = '2.0'

	/**
	 * Sets the player and adds listeners.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.initPlayer = function (player) {
		console.log('update player', player)
		this.player = player
		this.player.addEventListener('onStateChange', 'playerStateChange')
		this.player.addEventListener('onReady', 'onPlayerReady')
	}

	/**
	 * Binds event handlers.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.bind = function () {
		// wait for youtube
		var original = window.onYouTubePlayerReady

		/** Called upon /watch player init */
		window.onYouTubePlayerReady = function (player) {
			console.log('player ready', player, player.getPlayerState())

			this.initPlayer(player)
			this.stop()

			if (original) original()
		}.bind(this)

		/** Called whenever the player is ready for the first time (usually page load, or channel player init)*/
		window.onPlayerReady = function (player) {
			console.log('rdy', player, player.getPlayerState())
			this.stop()
		}.bind(this)

		/** Called whenever the player changes its state. */
		window.playerStateChange = function (state) {
			if (!this.prevState) return // prevent stopping when manually clicking the video timeline
			if (this.prevState === 3 && state === 1) {
				this.stop()
				this.prevState = 0 // prevent stopping when manually clicking the video timeline
				return
			}
			this.prevState = state
			console.log('state change', state)
		}.bind(this)

		/** Called whenever a page transition is done. */
		window.addEventListener('spfdone', function (e) {
			console.log('spfdone', e.detail.url)
			this.prevState = 1 // activate playerStateChange

			if (!this.isWatch && this.isWatchPage()) {
				this.initPlayer(document.getElementById('movie_player'))
				this.isWatch = true
				return
			}
			if (this.isChannelPage())
				this.isWatch = false
		}.bind(this))
	}

	/**
	 * Stops the player.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.stop = function () {
		if (!document.hasFocus()) {
			this._pause()
		}
	}

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype._pause = function () {
		console.log('pause')
		this.player.pauseVideo()
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype._play = function () {
		console.log('play')
		this.player.playVideo()
	}

	/**
	 * Event handler when the tab gets visible.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.handleVisibilityChange = function () {
		window.setTimeout(function () {
			if (!document.hidden)
				this._play()
		}.bind(this), 60)
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

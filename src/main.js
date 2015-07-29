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
		this.player = []
		/** @type {Object}	Helper for channels with promo videos (holds the /watch player). */
		this.holder = []

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
		if (document.getElementById('c4-player') === null && this.player.length > 0) return
		this.holder = player
		this.player = player
		this.player.addEventListener('onStateChange', 'playerStateChange')
		this.player.addEventListener('onReady', 'onPlayerReady') // @todo: if state = 3 when firing => internet slow  = stop fails? investigate
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

		window.onYouTubePlayerReady = function (player) {
			console.log('player ready', player)

			this.initPlayer(player)
			this.stop()

			if (original) original()
		}.bind(this)

		window.onPlayerReady = function (player) { // sometimes fired
			console.log('rdy', player)
			this.stop()
		}.bind(this)

		window.playerStateChange = function (state) {
			console.log('state change', state)
		}.bind(this)

		// channel -> watch [x]
		// channel -> channel [x]
		// watch -> channel [x]
		// channel -> channel -> channel [x]
		// goal: keep main player (like yt does, it loads the /watch video player on every load and keeps it over spf; Other players get reinited every time)
		window.addEventListener('spfdone', function (e) {
			console.log('spfdone', e.detail.url)
			if (this.holder.length < 0) return
			if (this.isWatchPage()) {
				this.player = this.holder
				this.holder = []
				return
			}
			if (this.isChannelPage()) {
				this.player = this.holder
			}
		}.bind(this))

		window.addEventListener('focus', this.handleVisibilityChange.bind(this)) // extended version: automatic playback
	}

	/**
	 * Stops the player.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.stop = function () {
		//if (!document.hasFocus()) {
			this._pause()
		//}
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
		//this.player.playVideo()
	}

	/**
	 * Event handler when the tab gets visible.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.handleVisibilityChange = function () {
		return;
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

+function (window) {
	'use strict'

	var document = window.document,
		location = window.location,
		yt = window.onYouTubePlayerReady // safety

	/**
	 * The constructor, binds and initializes vars.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	var StopAutoplay = function () {
		/** @type {Object}	Contains the current video player */
		this.player = document.getElementById('movie_player')

		this.init()
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
		if (!document.hasFocus())
			this.pause()
	}

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.pause = function () {
		this.player.pauseVideo()
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.play = function () {
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
		window.addEventListener('focus', this.handleVisibilityChange.bind(this), false) // extended version: automatic playback

		window.addEventListener('spfdone', function (e) {
			console.log('spfdone', e.detail.url)
			this.player = null
			this.count = 0
			this.playerCount = 0
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
	 * If there is no player, this method waits for the channel player to initialize.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @return 	{Boolean}
	 */
	StopAutoplay.prototype.isChannelPage = function () {
		if (location.pathname.indexOf('/channel/') === -1 && location.pathname.indexOf('/user/') === -1) return false
		if (this.playerCount) return true // player already found

		console.log('channel')
		var observer = new MutationObserver(function (mutations) { // player not found, let's wait for the init
			// console.log(mutations)
			mutations.forEach(function (mutation) {
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					if (mutation.addedNodes[i].nodeName === 'VIDEO' || mutation.addedNodes[i].nodeName === 'EMBED') { // check for flash or html5
						console.log('mutation', mutation.addedNodes[i])

						if (!this.playerCount) {
							this.playerCount = 1
							return
						}

						observer.disconnect() // waiting is over
						return this.init()
					}
				}
			}.bind(this))
		}.bind(this))
		observer.observe(document.body, { childList: true, subtree: true })

		return false
	}

	// start
	window.onYouTubePlayerReady = function () {
		console.log('called')
		new StopAutoplay()
		yt()
	}

}(window);
console.log('loaded')
debugger;

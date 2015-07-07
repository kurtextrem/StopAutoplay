/* global console */
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
		/** @type {Boolean}	Whether the page uses the flash player or not (rarely used) */
		this.flash = false
		/** @type {Number} 	Counter in the stop loop */
		this.count = 0
		/** @type {Number}	Needed because there can be two 'video' elements on the page  */
		this.playerCount = 0

		this.init()
		this.bind()
	}

	//StopAutoplay.VERSION = '1.8'

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
			this.stop()
	}

	/**
	 * Updates the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
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

	/**
	 * Tries to pause the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
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

	/**
	 * Executes an command on the player element.
	 * html5: pause(), play(), getCurrentTime
	 * flash: pauseVideo(), playVideo(), getCurrentTime()
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @param  	{String}    	which 	Action to fulfill.
	 */
	StopAutoplay.prototype._exec = function (which) {
		var action = this.flash ? which + 'Video' : which
		if (this.player[action] !== undefined)
			this.player[action]()
	}

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.pause = function () {
		this._exec('pause')
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype.play = function () {
		this._exec('play')
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
			console.log(mutations)
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
	new StopAutoplay()
}(window);

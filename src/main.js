+function (window) {
	'use strict'

	var document = window.document

	/**
	 * The constructor, binds and initializes vars.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	var StopAutoplay = function () {
		this.waitForPlayer()
		this.bindGeneral()
	}

	// StopAutoplay.VERSION = '3.01'

	/**
	 * Installs an observer which waits for video elements.
	 *
	 * @author 	Jacob Groß
	 * @date   	2016-01-17
	 */
	StopAutoplay.prototype.waitForPlayer = function () {
		var that = this
		var observer = new MutationObserver(function (mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var mutation = mutations[i].addedNodes
				for (var x = 0; x < mutation.length; x++) {
					if (mutation[x].nodeName !== 'VIDEO' && mutation[x].nodeName !== 'OBJECT') continue

					console.log('mutation', mutation[x])

					observer.disconnect() // waiting is over
					return that.bindPlayer(mutation[x])
				}
			}
		})
		observer.observe(document, { childList: true, subtree: true })
	}

	/**
	 * Binds player specific events.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-08-25
	 * @param  	{Object}   	player
	 */
	StopAutoplay.prototype.bindPlayer = function (player) {
		console.log('binding', player)

		// while buffering
		if (player.readyState > 1) {
			this.stopAutoplay(player)
		}

		console.log('add debug', this.addDebugListener.apply(this, [player]))
		player.addEventListener('canplaythrough', this.stopAutoplay.bind(this, player))

		/** Handler for the "Extended" version. */
		window.addEventListener('focus', this.handleVisibilityChange.bind(this, player))
	}

	/**
	 * Adds listeners for debugging purposes.
	 *
	 * @author 	Jacob Groß
	 * @date   	2016-01-17
	 * @param  	{Object}   	player
	 */
	StopAutoplay.prototype.addDebugListener = function (player) {
		player.addEventListener('canplay', function () {
			console.log('canplay')
		})
		player.addEventListener('canplaythrough', function () {
			console.log('canplaythrough')
		})
		player.addEventListener('durationchange', function () {
			console.log('durationchange')
		})
		player.addEventListener('loadeddata', function () {
			console.log('loadeddata')
		})
		player.addEventListener('loadedmetadata', function () {
			console.log('loadedmetadata')
		})
		player.addEventListener('playing', function () {
			console.log('playing')
		})
	}


	/**
	 * Binds non /watch / channel specific event handlers.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-08-25
	 */
	StopAutoplay.prototype.bindGeneral = function () {
		// safety, if there is any other extension for example.
		var original = window.onYouTubePlayerReady

		/** Stops videos on channels. */
		window.onYouTubePlayerReady = function (player) {
			console.log('player ready', player, player.getPlayerState(), player.getCurrentTime())

			this.stopAutoplay(player)

			console.log(player.getCurrentTime())

			if (original) original()
		}.bind(this)
	}

	/**
	 * Stops the player, when the tab has focus.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.stopAutoplay = function (player) {
		console.log('stopAutoplay', player)
		if (!document.hasFocus()) {
			this._pause(player)
		}
	}

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype._pause = function (player) {
		console.log('pause', player)
		if (player.pause)
			return player.pause()
		player.pauseVideo()
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	StopAutoplay.prototype._play = function (player) {
		console.log('play', player)
		if (player.play)
			return player.play()
		player.playVideo()
	}

	/**
	 * Event handler when the tab gets visible.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.handleVisibilityChange = function (player) {
		window.setTimeout(function () {
			if (!document.hidden)
				this._play(player)
		}.bind(this), 60)
	}

	// start
	new StopAutoplay()

	console.log('loaded')
}(window);

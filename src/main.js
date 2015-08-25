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
		this.waitForPlayer()
		this.bindGeneral()
	}

	// StopAutoplay.VERSION = '3.0'

	StopAutoplay.prototype.waitForPlayer = function () {
		var observer = new MutationObserver(function (mutations) {
			Object.keys(mutations).map(function (key) {
				var mutation = mutations[key].addedNodes
				for (var i = 0; i < mutation.length; i++) {
					if (mutation[i].nodeName !== 'VIDEO') continue

					console.log('mutation', mutation[i])

					observer.disconnect() // waiting is over
					return this.bindPlayer(mutation[i])
				}
			}.bind(this))
		}.bind(this))
		observer.observe(document, { childList: true, subtree: true })
	}

	StopAutoplay.prototype.bindPlayer = function (player) {
		console.log('binding', player)

		if (player.readyState > 1) {
			this.stopAutoplay(player)
		}

		player.addEventListener('canplay', this.stopAutoplay.bind(this, player))

		/** Handler for the "Extended" version. */
		window.addEventListener('focus', this.handleVisibilityChange.bind(this, player))
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

		/** Called whenever a page transition is done. */
		window.addEventListener('spfdone', function (e) {
			console.log('spfdone', e.detail.url)
		}.bind(this))
	}

	/**
	 * Stops the player.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	StopAutoplay.prototype.stopAutoplay = function (player) {
		console.log('stopAutoplay')
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
		console.log('pause')
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
		console.log('play')
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
}(window);

console.log('loaded')

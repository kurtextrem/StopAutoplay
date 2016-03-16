!function (window) {
	'use strict'

	var document = window.document,
		extended = true

	// StopAutoplay.VERSION = '4.00'

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	function _pause(player) {
		console.log('pause', player)
		if (player.pause)
			return player.pause()
		player.pauseVideo()
	}

	/**
	 * Stops the player, when the tab has focus.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 */
	function stopAutoplay(player) {
		console.log('stopAutoplay', player)
		if (!document.hasFocus()) {
			_pause(player)
		}
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	function _play(player) {
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
	function handleVisibilityChange(player) {
		window.setTimeout(function () {
			if (!document.hidden)
				_play(player)
		}, 60)
	}

	/**
	 * Adds listeners for debugging purposes.
	 *
	 * @author 	Jacob Groß
	 * @date   	2016-01-17
	 * @param  	{Object}   	player
	 */
	function addDebugListener(player) {
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
	 * Binds player specific events.
	 *
	 * @author 	Jacob Groß
	 * @date   	2016-03-16
	 * @param  	{Object}   	player
	 */
	function bindPlayer(player) {
		console.log('binding', player)

		var ad = player.parentNode.parentNode
		console.log('parent', ad)
		if (ad.classList.contains('ad-created')) {
			console.log('ad muted')
			// ignored when the real video starts playing
			player.muted = true
			ad = true
		}

		// don't pause while buffering
		if (player.readyState > 1 && !ad) {
			stopAutoplay(player)
		}

		console.log('add debug', addDebugListener.apply(null, [player]))

		player.addEventListener('canplaythrough', function canplaythrough() {
			if (!ad.classList.contains('ad-created'))
				stopAutoplay(player)
		})
		// YouTube experiment which sets a timeout and afterwards plays the video
		player.addEventListener('playing', function playing() {
			stopAutoplay(player)
			player.removeEventListener('playing', playing)
		})

		/** Handler for the "Extended" version. */
		if (extended)
			window.addEventListener('focus', handleVisibilityChange.bind(null, player))
	}

	/**
	 * The constructor, binds and initializes vars.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 */
	function StopAutoplay() {
		this.waitForPlayer()
		this.bindGeneral()
	}

	/**
	 * Installs an observer which waits for video elements.
	 *
	 * @author 	Jacob Groß
	 * @date   	2016-01-17
	 */
	StopAutoplay.prototype.waitForPlayer = function () {
		var observer = new MutationObserver(function (mutations) {
			for (var i = 0; i < mutations.length; i++) {
				var mutation = mutations[i].addedNodes
				for (var x = 0; x < mutation.length; x++) {
					if (mutation[x].nodeName !== 'VIDEO' && mutation[x].nodeName !== 'OBJECT') continue
					console.log('mutation', mutation[x])

					observer.disconnect() // waiting is over
					return bindPlayer(mutation[x])
				}
			}
		})
		observer.observe(document, { childList: true, subtree: true })
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

		/** Stops videos on channels; only fired once when a player is ready (e.g. doesn't fire on AJAX navigation watch -> watch) */
		window.onYouTubePlayerReady = function (player) {
			console.log('player ready', player, player.getPlayerState(), player.getCurrentTime())

			stopAutoplay(player)

			console.log(player.getCurrentTime())

			if (original) original()
		}.bind(this)
	}

	// start
	new StopAutoplay()

	console.log('loaded')
}(window);

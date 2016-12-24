(function (window) {
	'use strict'

	/** @version 4.0.4 **/
	var document = window.document,
		extended = false

	/**
	 * Non-Extended: When a tab has been opened as background tab for the first time, the video is loaded when the tab receives focus (Chrome native feature)
	 * @type 	{boolean}
	 */
	var focusStop = !extended

	/**
	 * Issues the pause command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @param  	{Object}   	player
	 */
	function _pause(player) {
		console.log('pause', player)
		if (player.pause)
			return player.pause()
		player.pauseVideo()
	}

	/**
	 * Stops the player, when the tab has focus or looping is enabled.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 * @param  	{Object}   	player
	 */
	function stopAutoplay(player) {
		console.log('stopAutoplay', !player.loop, !document.hasFocus(), focusStop, player)
		if (!player.loop && !document.hasFocus() || focusStop) {
			focusStop = false
			_pause(player)
		}
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-07
	 * @param  	{Object}   	player
	 */
	function _play(player) {
		console.log('play', player)
		if (player.play)
			return player.play()
		player.playVideo()
	}

	/**
	 * Event handler when the tab becomes visible.
	 *
	 * @author 	Jacob Groß
	 * @date   	2015-07-29
	 * @param  	{Object}   	player
	 */
	function handleVisibilityChange(player) {
		console.log('handleVisibilityChange', player, player.readyState)
		// if (player.readyState < 1) return; // bail out, if event triggered too early
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
		player.addEventListener('loadstart', function () {
			console.log('loadstart')
		})
		player.addEventListener('playing', function () {
			console.log('playing')
		})
		player.addEventListener('play', function () {
			console.log('play')
		})
		player.addEventListener('waiting', function () {
			console.log('waiting')
		})
		player.addEventListener('stalled', function () {
			// console.log('stalled')
		})
		player.addEventListener('seeking', function () {
			console.log('seeking')
		})
		player.addEventListener('seeked', function () {
			console.log('seeked')
		})
		player.addEventListener('timeupdate', function () {
			// console.log('timeupdate')
		})
		window.addEventListener('focus', function () { // tells me the timestamp I've focused
			console.info('now')
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
		console.info('binding', player)

		// don't pause while buffering
		console.log(player.readyState, player.networkState)
		if (player.readyState > 1) {
			stopAutoplay(player)
		}

		console.info('add debug', addDebugListener.apply(null, [player]))

		/**Main stop function */
		player.addEventListener('canplaythrough', stopAutoplay.bind(null, player))

		/** Stops on watch -> watch navigation */
		var i = 0
		player.addEventListener('playing', function playing() {
			console.log('stop on playing event')

			stopAutoplay(player)
			if (++i === 2)
				player.removeEventListener('playing', playing)
		})

		player.addEventListener('loadeddata', function () {
			console.log('loadeddata -> reset counter')

			i = 0 // reset; watch -> watch navigation
		})

		/** Handler for the "Extended" version. */
		if (extended)
			window.addEventListener('focus', handleVisibilityChange.bind(null, player))
	}

	/**
	 * The constructor binds and initializes vars.
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
	 * @return  	{Object}   	player 		Player DOM Node
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

		/**
		 * Stops videos on channels.
		 * Only fired once when a player is ready (e.g. doesn't fire on AJAX navigation /watch -> /watch)
		 *
		 * @author 	Jacob Groß
		 * @date   	2016-03-22
		 * @param 	{Object}    	player 		The Youtube Player API Object
		 */
		window.onYouTubePlayerReady = function (player) {
			console.log('player ready', player, player.getPlayerState(), player.getCurrentTime())

			if (player.getPlayerState() !== 3) { // don't pause too early
				stopAutoplay(player)
				console.log(player.getCurrentTime())
			}

			if (original) original()
		}
	}

	// start
	new StopAutoplay()

	console.info('loaded')
}(window));

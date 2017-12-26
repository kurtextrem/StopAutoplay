;(function StopAutoplay(window) {
	'use strict'

	/** @version 4.1.0 **/
	const document = window.document,
		extended = true

	/**
	 * Non-Extended: When a tab has been opened as background tab for the first time, the video is loaded when the tab receives focus (Chrome native feature)
	 * @type {Boolean}
	 */
	let focusStop = false,
		seeked = false

	/**
	 * Issues the pause command on the player element.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function _pause(player) {
		console.log('pause', player, player.getCurrentTime())

		if (player.pause !== undefined) return player.pause()
		player.pauseVideo()
	}

	/**
	 * Stops the player, when user didn't seek, the tab does not have focus, looping is disabled and it isn't a playlist page.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function stopAutoplay(player) {
		console.log('stopAutoplay', !player.loop, document.location.search.indexOf('list=') === -1, !document.hasFocus(), focusStop, player)
		if (seeked) {
			console.log('stopAutoplay seeked')
			seeked = false
			return seeked // false
		}

		if (
			!player.loop && document.location.search.indexOf('list=') === -1 // we don't want to stop looping videos or playlists
			&& !document.hasFocus() // is video in background?
			|| focusStop // bg tab override
		) {
			_pause(player)
			return true
		}

		return false
	}

	/**
	 * Issues the play command on the player element.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function _play(player) {
		console.log('play', player)

		if (player.play !== undefined) return player.play() // may return a Promise
		player.playVideo()
	}

	/**
	 * Plays a video when the tab is not hidden.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function _playIfNotHidden(player) {
		if (!document.hidden) _play(player)
	}

	/**
	 * Event handler when the tab becomes visible.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function handleVisibilityChange(player) {
		console.log('handleVisibilityChange', player, player.readyState)
		// if (player.readyState < 1) return; // bail out, if event triggered too early
		window.setTimeout(_playIfNotHidden.bind(undefined, player), 60)
	}

	/**
	 * Adds listeners for debugging purposes.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function addDebugListener(player) {
		player.addEventListener('canplay', function() {
			console.log('canplay')
		})
		player.addEventListener('canplaythrough', function() {
			console.log('canplaythrough')
		})
		player.addEventListener('durationchange', function() {
			console.log('durationchange')
		})
		player.addEventListener('loadeddata', function() {
			console.log('loadeddata')
		})
		player.addEventListener('loadedmetadata', function() {
			console.log('loadedmetadata')
		})
		player.addEventListener('loadstart', function() {
			console.log('loadstart')
		})
		player.addEventListener('playing', function() {
			console.log('playing')
		})
		player.addEventListener('play', function() {
			console.log(player.readyState, player.networkState)
			console.log('play')
		})
		player.addEventListener('waiting', function() {
			console.log('waiting')
		})
		player.addEventListener('stalled', function() {
			// console.log('stalled')
		})
		player.addEventListener('seeking', function() {
			console.log('seeking')
		})
		player.addEventListener('seeked', function() {
			// user seeked forward / backward
			console.log('seeked')
		})
		player.addEventListener('timeupdate', function() {
			// console.log('timeupdate')
		})
		window.addEventListener('focus', function() {
			// tells me the timestamp I've focused
			console.info('focus now')
		})
		document.addEventListener('visibilitychange', function() {
			// tells me the timestamp I've focused
			console.info('visibilitychange now')
		})
	}

	const boundPlayers = new WeakSet()

	/**
	 * Binds player specific events.
	 *
	 * @param {HTMLVideoElement} player
	 */
	function bindPlayer(player) {
		if (boundPlayers.has(player)) return
		boundPlayers.add(player)

		console.info('binding', player)

		// don't pause while buffering
		console.log(player.readyState, player.networkState)
		if (player.readyState > 1) {
			stopAutoplay(player)
		}

		console.info('add debug', addDebugListener(player))

		/** Main stop function */
		player.addEventListener('canplaythrough', stopAutoplay.bind(undefined, player))

		/** Stops on watch -> watch navigation */
		let i = 0
		player.addEventListener('playing', function playing() {
			console.log('stop on playing event')

			stopAutoplay(player)
			if (++i === 2) player.removeEventListener('playing', playing)
		})

		player.addEventListener('loadeddata', function() {
			console.log('loadeddata -> reset counter')

			i = 0 // reset; watch -> watch navigation
		})

		/** Handler for the "Extended" version. */
		if (extended) window.addEventListener('focus', handleVisibilityChange.bind(undefined, player))
		else {
			/** Shouldn't stop when seeking */
			const seekedTrue = () => {
				if (player.readyState > 1) seeked = true
			}
			const onfocus = function() {
				focusStop = true
				player.addEventListener('playing', () => {
					focusStop = false
				}, { once: true })

				/** Shouldn't stop when clicking play for the first time */
				player.addEventListener('play', seekedTrue, { once: true })
				player.addEventListener('seeked', seekedTrue)
				/** Don't pause when slow internet speed */
				player.addEventListener('waiting', seekedTrue)
			}

			/** When a tab has been opened as background tab for the first time, the video is loaded when the tab receives focus (Chrome native feature) */
			document.hasFocus() ? onfocus() : window.addEventListener('focus', onfocus, { once: true })
		}
	}

	/**
	 * Installs an observer which waits for video elements.
	 */
	function waitForPlayer() {
		const observer = new MutationObserver(function(mutations) {
			for (let i = 0; i < mutations.length; ++i) {
				var mutation = mutations[i].addedNodes
				for (var x = 0; x < mutation.length; ++x) {
					if (mutation[x].nodeName !== 'VIDEO' && mutation[x].nodeName !== 'OBJECT') continue
					console.log('mutation', mutation[x])

					observer.disconnect() // waiting is over
					bindPlayer(mutation[x])
					return
				}
			}
		})
		observer.observe(document, { childList: true, subtree: true })
	}

	/**
	 * Binds non /watch / channel specific event handlers.
	 */
	function bindGeneral() {
		// safety, if there is any other extension for example.
		const original = window.onYouTubePlayerReady // onYoutubeIframeAPIReady

		/**
		 * Stops videos on channels.
		 * Only fired once when a player is ready (e.g. doesn't fire on AJAX navigation /watch -> /watch)
		 *
		 * @param {Object} player The Youtube Player API Object
		 */
		window.onYouTubePlayerReady = function onYouTubePlayerReady(player) {
			console.log('player ready', player, player.getPlayerState(), player.getCurrentTime())

			if (player.getPlayerState() !== 3) {
				// don't pause too early
				console.log(player.getCurrentTime())
				bindPlayer(document.getElementsByTagName('video')[0])
			}

			if (original !== undefined) original()
		}
	}

	// start
	let video = document.getElementsByTagName('video')
	if (video.length !== 0) {
		bindPlayer(video[0])
		video = null // GC
	}	else waitForPlayer()

	bindGeneral()

	console.info('started')
})(window)

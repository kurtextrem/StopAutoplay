	StopAutoplay.prototype._exec = function (which, addition) {
		var action = which + addition
		if (this.player[action] !== undefined)
			return this.player[action]()
		this._exec(which, 'Video') // flash
	}

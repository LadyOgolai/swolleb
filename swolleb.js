(() => {
  'use strict'
  const e = new class {
    Log (...e) {console.log('swolleb |', ...e)}

    LogDebug (...e) {console.debug('swolleb DBG |', ...e)}

    LogError (...e) {console.error('swolleb ERR |', ...e)}
  }

  class t {
    constructor () {this.playersMap = new Map}

    static async initializeApi () {
      if (t.instance) throw new Error('Cannot initialize YoutubeIframeApi more than once!')
      return new Promise((i => {
        var a
        if (window.onYouTubeIframeAPIReady = function () {t.instance = new t, e.LogDebug('YoutubeIframeApi successfully initialized'), i()}, !$('#yt-api-script').length) {
          const t = document.createElement('script')
          t.id = 'yt-api-script', t.src = 'https://www.youtube.com/iframe_api', t.type = 'text/javascript'
          const i = document.getElementsByTagName('script')[0]
          null === (a = i.parentNode) || void 0 === a || a.insertBefore(t, i), e.LogDebug('Downloading YoutubeIframeApi...')
        }
      }))
    }

    static getInstance () {
      if (!t.instance) throw new Error('Tried to get YoutubeIframeApi before initialization!')
      return this.instance
    }

    getPlayer (e, t) {
      const i = this.getIdString(e, t)
      return this.playersMap.get(i)
    }

    async createPlayer (e, t) {
      const i = this.getIdString(e, t)
      if (this.playersMap.has(i)) throw new Error('Player already exists for this audio container!')
      return new Promise(((e, a) => {
        const s = function (e) {
          let t
          switch (e.data) {
            case 2:
              t = 'Invalid videoId value.'
              break
            case 5:
              t = 'The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.'
              break
            case 100:
              t = 'Video not found; It may have been deleted or marked as private.'
              break
            case 101:
            case 150:
              t = 'Embedding is not supported for this video.'
              break
            default:
              t = 'Unspecified Error'
          }
          a(t)
        }
        $('body').append(`<div class="yt-player" id="${i}"></div>`)
        console.log(`swolleb | if you see a message saying "Failed to execute 'postMessage' on 'DOMWindow'" - it's okay, ignore it`)
        const r = new YT.Player(i, {
          height: '270px',
          width: '480px',
          videoId: t,
          playerVars: { loop: 1, playlist: t },
          events: {
            onReady: function () {this.playersMap.set(i, r), r.removeEventListener('onError', s), e(r)}.bind(this),
            onError: s.bind(this)
          }
        })
      }))
    }

    async createPlaylistPlayer (e, t) {
      const i = this.getIdString(e, t)
      if (this.playersMap.has(i)) throw new Error('Player already exists for this audio container!')
      return new Promise(((e, a) => {
        const s = function (e) {
          let t
          switch (e.data) {
            case 2:
              t = 'Invalid videoId value.'
              break
            case 5:
              t = 'The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.'
              break
            case 100:
              t = 'Video not found; It may have been deleted or marked as private.'
              break
            case 101:
            case 150:
              t = 'Embedding is not supported for this video.'
              break
            default:
              t = 'Unspecified Error'
          }
          a(t)
        }
        $('body').append(`<div class="yt-player" id="${i}"></div>`)
        const r = new YT.Player(i, {
          height: '270px',
          width: '480px',
          playerVars: { listType: 'playlist', list: t },
          events: {
            onReady: function () {this.playersMap.set(i, r), r.removeEventListener('onError', s), e(r)}.bind(this),
            onError: s.bind(this)
          }
        })
      }))
    }

    async destroyPlayer (e, t) {
      const i = this.getIdString(e, t), a = this.playersMap.get(i)
      if (!a) throw new Error('Player does not exist!')
      1 === a.getPlayerState() && a.stopVideo(), this.playersMap.delete(i), a.destroy(), $(`div#${i}`).remove()
    }

    getIdString (e, t) {return `swolleb-yt-iframe-${e}-${t}`}
  }

  var i
  !function (e) {e[void 0] = '', e.youtube = 'youtube'}(i || (i = {}))

  class a {
    extractPlaylistKey (e) {
      if (!e || 0 === e.length) return
      const t = /list=([a-zA-Z0-9_-]+)/.exec(e)
      return t ? t[1] : e.match(/^[a-zA-Z0-9_-]+$/)[0]
    }

    async getPlaylistInfo (e) {
      if (!e) throw new Error('Empty playlist key')
      const i = t.getInstance()
      this._player = await i.createPlaylistPlayer(-1, e)
      try {return await this.scrapeVideoNames()} finally {i.destroyPlayer(-1, e), this._player = void 0}
    }

    async createFoundryVTTPlaylist (e, t, a) {
      if (!e || '[object String]' !== Object.prototype.toString.call(e)) throw new Error('Enter playlist name')
      const s = await Playlist.create({ name: e, shuffle: !1 }), r = AudioHelper.inputToVolume(a), o = []
      for (let e = 0; e < t.length; e++) o.push({
        name: t[e].title,
        lvolume: a,
        volume: r,
        path: 'streamed.mp3',
        repeat: !1,
        flags: { bIsStreamed: !0, streamingApi: i.youtube, streamingId: t[e].id }
      })
      await (null == s ? void 0 : s.createEmbeddedEntity('PlaylistSound', o))
    }

    async scrapeVideoNames () {
      var t
      if (!(null === (t = this._player) || void 0 === t ? void 0 : t.getPlaylist())) throw new Error('Invalid Playlist')
      const i = []
      for (let t = 0; t < 3; t++) try {
        await this.getTrack(0)
        break
      } catch (i) {
        if (2 == t) throw i
        e.LogDebug('getNextTrack timed out, retrying...')
      }
      for (let e = 0; e < this._player.getPlaylist().length; e++) {
        await this.getTrack(e)
        const t = this._player.getVideoData()
        i.push({ id: t.video_id, title: t.title })
      }
      return i
    }

    async getTrack (e) {
      const t = new Promise((t => {
        var i, a
        null === (i = this._player) || void 0 === i || i.addEventListener('onStateChange', (e => {-1 == e.data && (e.target.removeEventListener('onStateChange'), t(e.data))})), null === (a = this._player) || void 0 === a || a.playVideoAt(e)
      })), i = new Promise(((e, t) => {const i = setTimeout((() => {clearTimeout(i), t('timed out')}), 1e3)}))
      return Promise.race([t, i])
    }
  }

  class s extends FormApplication {
    constructor (e, t) {t.height = 'auto', super(e, t), this._working = !1, this._playlistItems = [], this._youtubePlaylistImportService = new a}

    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        title: game.i18n.localize('swolleb.ImportPlaylist.Title'),
        template: '/modules/swolleb/templates/apps/import-youtube-playlist.hbs'
      })
    }

    activateListeners (e) {super.activateListeners(e), e.find('button[id=\'swolleb-yt-import-btn-import\']').on('click', (e => this._onImport.call(this, e))), e.find}

    getData () {return { working: this._working, playlistItems: this._playlistItems }}

    async importPlaylist (t) {
      var i, a, s
      const r = this._youtubePlaylistImportService.extractPlaylistKey(t)
      if (r) try {this._playlistItems = await this._youtubePlaylistImportService.getPlaylistInfo(r)} catch (t) {'Invalid Playlist' == t ? null === (a = ui.notifications) || void 0 === a || a.error(game.i18n.format('swolleb.ImportPlaylist.Messages.KeyNotFound', { playlistKey: r })) : (null === (s = ui.notifications) || void 0 === s || s.error(game.i18n.localize('swolleb.ImportPlaylist.Messages.Error')), e.LogError(t))} else null === (i = ui.notifications) || void 0 === i || i.error(game.i18n.localize('swolleb.ImportPlaylist.Messages.InvalidKey'))
    }

    async _onImport (e) {
      var t
      if (this._working) return void (null === (t = ui.notifications) || void 0 === t || t.error(game.i18n.localize('swolleb.ImportPlaylist.Messages.AlreadyWorking')))
      this._working = !0, this._playlistItems = []
      const i = $(e.currentTarget).siblings('input[id=\'swolleb-yt-import-url-text').val()
      await this.rerender(), await this.importPlaylist(i), this._working = !1, await this.rerender()
    }

    async rerender () {await this._render(!1), this.setPosition()}

    async _updateObject (t, i) {
      var a, s
      try {await this._youtubePlaylistImportService.createFoundryVTTPlaylist(i.playlistname, this._playlistItems, i.playlistvolume), null === (a = ui.notifications) || void 0 === a || a.info(game.i18n.format('swolleb.ImportPlaylist.Messages.ImportComplete', { playlistName: i.playlistname }))} catch (t) {e.LogError(t), null === (s = ui.notifications) || void 0 === s || s.error(game.i18n.localize('swolleb.ImportPlaylist.Messages.Error'))}
    }
  }

  class r {
    extract (e) {
      const t = /^[a-zA-Z0-9_-]+$/
      if (!e || 0 === e.length) throw new Error('Cannot extract an empty URI')
      const i = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)[\w=]*)?/.exec(e)
      if (i) return i[1]
      {
        const i = e.match(t)
        if (i) return i[0]
        throw new Error('Invalid video Id')
      }
    }
  }

  class o {
    static getStreamIdExtractor (e) {
      switch (e) {
        case i.youtube:
          return new r
        default:
          throw new Error('No extractor is registered for given StreamType')
      }
    }
  }

  class n {
    constructor (e, t = !1) {
      this.loaded = !1, this._loop = !1, this._scheduledEvents = new Set, this._eventHandlerId = 1, this._volume = 0, this.events = {
        stop: {},
        start: {},
        end: {},
        pause: {},
        load: {}
      }, this.src = e, this.id = ++Sound._nodeId, this.loaded = t
    }

    get volume () {return this._player ? this._player.getVolume() / 100 : this._volume}

    set volume (e) {this._player && this._player.setVolume(100 * e), this._volume = e}

    get currentTime () {if (this._player) return this.pausedTime ? this.pausedTime : this._player.getCurrentTime()}

    get duration () {
      var e, t
      return this._player && null !== (t = null === (e = this._player) || void 0 === e ? void 0 : e.getDuration()) && void 0 !== t ? t : 0
    }

    get playing () {
      var e, t
      return null !== (t = 1 == (null === (e = this._player) || void 0 === e ? void 0 : e.getPlayerState())) && void 0 !== t && t
    }

    get loop () {return this._loop}

    set loop (e) {this._loop = e, this._player && this._player.setLoop(e)}

    async fade (e, { duration: t = 1e3, from: i }) {
      if (!this._player) return
      const a = null != i ? i : this._player.getVolume(), s = e - a
      if (0 == s) return Promise.resolve()
      this._fadeIntervalHandler && clearInterval(this._fadeIntervalHandler)
      const r = Math.floor(t / 100)
      let o = 1
      return new Promise((e => {
        this._fadeIntervalHandler = window.setInterval((() => {
          var t
          null === (t = this._player) || void 0 === t || t.setVolume(a + this._sinEasing(o / r) * s), ++o === r + 1 && (clearInterval(this._fadeIntervalHandler), this._fadeIntervalHandler = void 0, e())
        }), 100)
      }))
    }

    async load ({
      autoplay: t = !1,
      autoplayOptions: i = {}
    } = {}) {return game.audio.locked && (e.LogDebug(`Delaying load of youtube stream sound ${this.src} until after first user gesture`), await new Promise((e => game.audio.pending.push(e)))), this.loaded = !0, t && this.play(i), new Promise((e => {e(this)}))}

    async play ({ loop: i = !1, offset: a, volume: s, fade: r = 0 } = {}) {
      var o, n, l
      if (game.audio.locked) return e.LogDebug(`Delaying playback of youtube stream sound ${this.src} until after first user gesture`), game.audio.pending.push((() => this.play({
        loop: i,
        offset: a,
        volume: s,
        fade: r
      })))
      this.loading instanceof Promise && await this.loading, this._player || (this.loading = t.getInstance().createPlayer(this.id, this.src), this.loading.then((e => {this._player = e})).catch((t => {e.LogError(`Failed to load track ${this.src} - ${t}`)})).finally((() => {this.loading = void 0}))), await this.loading
      const d = () => {
        if (this.loop = i, void 0 !== s && s !== this.volume) {
          if (r) return this.fade(s, { duration: r })
          this.volume = s
        }
      }
      if (this.playing) {
        if (void 0 === a) return d()
        this.stop()
      }
      a = null !== (o = null != a ? a : this.pausedTime) && void 0 !== o ? o : 0, this.startTime = this.currentTime, this.pausedTime = void 0, this.volume = 0, null === (n = this._player) || void 0 === n || n.seekTo(a, !0), null === (l = this._player) || void 0 === l || l.addEventListener('onStateChange', this._onEnd.bind(this)), d(), this._onStart()
    }

    pause () {
      var e
      this.pausedTime = this.currentTime, this.startTime = void 0, null === (e = this._player) || void 0 === e || e.pauseVideo(), this._onPause()
    }

    stop () {
      var e
      !1 !== this.playing && (this.pausedTime = void 0, this.startTime = void 0, null === (e = this._player) || void 0 === e || e.stopVideo(), t.getInstance().destroyPlayer(this.id, this.src).then((() => {this._player = void 0, this._onStop()})))
    }

    schedule (e, t) {
      var i
      const a = null !== (i = this.currentTime) && void 0 !== i ? i : 0;
      (t = Math.clamped(t, 0, this.duration)) < a && (t += this.duration)
      const s = 1e3 * (t - a)
      return new Promise((t => {
        const i = setTimeout((() => (this._scheduledEvents.delete(i), e(this), t())), s)
        this._scheduledEvents.add(i)
      }))
    }

    emit (e) {
      const t = this.events[e]
      if (t) for (const [e, i] of Object.entries(t)) i.fn(this), i.once && delete t[e]
    }

    off (e, t) {
      const i = this.events[e]
      if (i) {
        Number.isNumeric(t) && delete i[t]
        for (const [e, a] of Object.entries(i)) if (a === t) {
          delete i[e]
          break
        }
      }
    }

    on (e, t, { once: i = !1 } = {}) {return this._registerForEvent(e, { fn: t, once: i })}

    _registerForEvent (e, t) {
      const i = this.events[e]
      if (!i) return
      const a = this._eventHandlerId++
      return i[a] = t, a
    }

    _sinEasing (e) {return 1 - Math.cos(e * Math.PI / 2)}

    _clearEvents () {
      for (const e of this._scheduledEvents) window.clearTimeout(e)
      this._scheduledEvents.clear()
    }

    _onEnd (e) {0 == e.data && (this.loop || (this._clearEvents(), game.audio.playing.delete(this.id), t.getInstance().destroyPlayer(this.id, this.src).then((() => {this._player = void 0})), this.emit('end')))}

    _onLoad () {this.emit('load')}

    _onPause () {this._clearEvents(), this.emit('pause')}

    _onStart () {game.audio.playing.set(this.id, this), this.emit('start')}

    _onStop () {this._clearEvents(), game.audio.playing.delete(this.id), this.emit('stop')}
  }

  class l {
    static getStreamSound (e, t, a = !1) {
      switch (e) {
        case i.youtube:
          return new n(t, a)
        default:
          throw new Error('No Stream Sound is registered for given StreamType')
      }
    }
  }

  Hooks.once('init', (async () => {
    e.Log('Initializing swolleb - The lungs of the Foundry!'), class {static registerSettings () {}}.registerSettings(), class {
      static patchFoundryClassFunctions () {
        (class {
          static patch () {
            const t = PlaylistSound.prototype._createSound
            PlaylistSound.prototype._createSound = function () {
              if (!hasProperty(this, 'data.flags.bIsStreamed') || !this.data.flags.bIsStreamed) return t.apply(this)
              const e = l.getStreamSound(this.data.flags.streamingApi, this.data.flags.streamingId)
              return e.on('start', this._onStart.bind(this)), e.on('end', this._onEnd.bind(this)), e.on('stop', this._onStop.bind(this)), e
            }
            const a = PlaylistSoundConfig.prototype._updateObject
            PlaylistSoundConfig.prototype._updateObject = function (t, s) {
              var r
              if (!(null === (r = game.user) || void 0 === r ? void 0 : r.isGM)) throw new Error('You do not have the ability to configure a PlaylistSound object.')
              if (!s.streamed) return void a.apply(this, [t, s])
              const n = i[s.streamtype], l = o.getStreamIdExtractor(n)
              let d
              try {d = l.extract(s.streamurl)} catch (t) {throw e.LogError(t), new Error(game.i18n.localize('swolleb.PlaylistConfig.Errors.InvalidUri'))}
              return s.volume = AudioHelper.inputToVolume(s.lvolume), s.path = `${d}.mp3`, s.flags = {
                bIsStreamed: s.streamed,
                streamingApi: n,
                streamingId: d
              }, this.object.id ? this.object.update(s) : this.object.constructor.create(s, { parent: this.object.parent })
            }, Hooks.on('renderPlaylistSoundConfig', ((e, t, i) => {
              const a = (i.data.flags || {}).bIsStreamed || !1, s = (i.data.flags || {}).streamingId || '',
                r = $(t).find('div.form-fields input[name=\'path\']').parent().parent()
              r.before(`\n            <div class="form-group">\n                <label>${game.i18n.localize('swolleb.PlaylistConfig.Labels.Streamed')}</label>\n                <input type="checkbox" name="streamed" data-dtype="Boolean" ${a ? 'checked' : ''} />\n            </div>`), r.after(`\n            <div class="form-group">\n                <label>\n                    ${game.i18n.localize('swolleb.PlaylistConfig.Labels.AudioUrl')}\n                </label>\n                <input type="text" name="streamurl" data-dtype="Url" value="${s}" />\n            </div>\n            `), r.after(`\n            <div class="form-group">\n                <label>\n                    ${game.i18n.localize('swolleb.PlaylistConfig.Labels.StreamType')}\n                </label>\n                <select name="streamtype">\n                    <option value="youtube" selected>${game.i18n.localize('swolleb.PlaylistConfig.Selects.StreamTypes.Youtube')}</option>\n                </select>\n            </div>\n            `)
              const o = $(t).find('input[name=\'streamed\']'), n = $(t).find('input[name=\'streamurl\']'),
                l = $(t).find('select[name=\'streamtype\']'),
                d = e => {r.css('display', e ? 'none' : 'flex'), n.parent().css('display', e ? 'flex' : 'none'), l.parent().css('display', e ? 'flex' : 'none')}
              o.on('change', (t => {d(t.target.checked), e.setPosition()})), d(a), e.options.height = 'auto', e.setPosition()
            }))
          }
        }).patch(), class {
          static patch () {
            const t = AmbientSound.prototype._createSound
            AmbientSound.prototype._createSound = function () {return hasProperty(this, 'data.flags.bIsStreamed') && this.data.flags.bIsStreamed ? l.getStreamSound(this.data.flags.streamingApi, this.data.flags.streamingId, !0) : t.apply(this)}
            const a = AmbientSoundConfig.prototype._updateObject
            AmbientSoundConfig.prototype._updateObject = function (t, s) {
              var r
              if (!(null === (r = game.user) || void 0 === r ? void 0 : r.isGM)) throw new Error('You do not have the ability to configure a AmbientSound object.')
              if (!s.streamed) return void a.apply(this, [t, s])
              const n = i[s.streamtype], l = o.getStreamIdExtractor(n)
              let d
              try {d = l.extract(s.streamurl)} catch (t) {throw e.LogError(t), new Error(game.i18n.localize('swolleb.PlaylistConfig.Errors.InvalidUri'))}
              return s.path = `${d}.mp3`, s.flags = {
                bIsStreamed: s.streamed,
                streamingApi: n,
                streamingId: d
              }, this.object.id ? this.object.update(s) : this.object.constructor.create(s, { parent: this.object.parent })
            }, Hooks.on('renderAmbientSoundConfig', ((e, t, i) => {
              const a = (i.data.flags || {}).bIsStreamed || !1, s = (i.data.flags || {}).streamingId || '',
                r = $(t).find('div.form-fields input[name=\'path\']').parent().parent()
              r.before(`\n            <div class="form-group">\n                <label>${game.i18n.localize('swolleb.PlaylistConfig.Labels.Streamed')}</label>\n                <input type="checkbox" name="streamed" data-dtype="Boolean" ${a ? 'checked' : ''} />\n            </div>`), r.after(`\n            <div class="form-group">\n                <label>\n                    ${game.i18n.localize('swolleb.PlaylistConfig.Labels.AudioUrl')}\n                </label>\n                <input type="text" name="streamurl" data-dtype="Url" value="${s}" />\n            </div>\n            `), r.after(`\n            <div class="form-group">\n                <label>\n                    ${game.i18n.localize('swolleb.PlaylistConfig.Labels.StreamType')}\n                </label>\n                <select name="streamtype">\n                    <option value="youtube" selected>${game.i18n.localize('swolleb.PlaylistConfig.Selects.StreamTypes.Youtube')}</option>\n                </select>\n            </div>\n            `)
              const o = $(t).find('input[name=\'streamed\']'), n = $(t).find('input[name=\'streamurl\']'),
                l = $(t).find('select[name=\'streamtype\']'),
                d = e => {r.css('display', e ? 'none' : 'flex'), n.parent().css('display', e ? 'flex' : 'none'), l.parent().css('display', e ? 'flex' : 'none')}
              o.on('change', (t => {d(t.target.checked), e.setPosition()})), d(a), e.options.height = 'auto', e.setPosition()
            }))
          }
        }.patch()
      }
    }.patchFoundryClassFunctions(), await class {static async preloadHandlebarsTemplates () {return loadTemplates([])}}.preloadHandlebarsTemplates()
  })), class {
    static hooks () {
      Hooks.once('init', (async () => {e.LogDebug('Initializing YoutubeApi Feature'), await t.initializeApi()})), Hooks.on('renderPlaylistDirectory', ((e, t) => {
        var i
        if (!(null === (i = game.user) || void 0 === i ? void 0 : i.isGM)) return
        const a = $(`\n                <button class="import-yt-playlist">\n                    <i class="fas fa-cloud-download-alt"></i> ${game.i18n.localize('swolleb.ImportPlaylist.Title')}\n                </button>`)
        t.find('.directory-footer').append(a), a.on('click', (() => {new s({}, {}).render(!0)}))
      }))
    }
  }.hooks()
})()

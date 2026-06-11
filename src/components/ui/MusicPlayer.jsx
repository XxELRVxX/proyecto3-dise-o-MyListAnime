import { useState, useEffect, useRef, useCallback } from 'react'

export default function MusicPlayer() {
  const audioRef            = useRef(null)
  const [playlist, setPlaylist]   = useState([])
  const [trackIdx, setTrackIdx]   = useState(0)
  const [playing, setPlaying]     = useState(false)
  const [volume, setVolume]       = useState(0.3)
  const [minimized, setMinimized] = useState(true)
  const [showVolume, setShowVolume] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [duration, setDuration]   = useState(0)
  const [loaded, setLoaded]       = useState(false)

  // Shuffle array
  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5)

  // Cargar y mezclar playlist
  useEffect(() => {
    fetch('/music/playlist.json')
      .then(r => {
        if (!r.ok) throw new Error('No se encontró playlist.json')
        return r.json()
      })
      .then(data => {
        const normalized = data.map(item =>
          typeof item === 'string'
            ? {
                title: item
                  .replace(/\.mp3$/i, '')
                  .replace(/_/g, ' ')
                  .trim(),
                file: `/music/${item}`
              }
            : item
        )
        // Mezclar aleatoriamente
        const shuffled = shuffleArray(normalized)
        setPlaylist(shuffled)
        setLoaded(true)
      })
      .catch(err => {
        console.warn('MusicPlayer:', err.message)
        setLoaded(true)
      })
  }, [])

  // Cuando cambia la pista: cargar src y reproducir si estaba playing
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return
    const audio = audioRef.current
    audio.src = playlist[trackIdx].file
    audio.volume = volume
    audio.load()
    if (playing) {
      audio.play().catch(() => setPlaying(false))
    }
  }, [trackIdx, playlist])

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  function togglePlay() {
    if (!audioRef.current || playlist.length === 0) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }

  function nextTrack() {
    setTrackIdx(i => (i + 1) % playlist.length)
  }

  function prevTrack() {
    setTrackIdx(i => (i - 1 + playlist.length) % playlist.length)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    setProgress(audioRef.current.currentTime)
    setDuration(audioRef.current.duration || 0)
  }

  function handleSeek(e) {
    const val = parseFloat(e.target.value)
    setProgress(val)
    if (audioRef.current) audioRef.current.currentTime = val
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const track = playlist[trackIdx]

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={nextTrack}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
      />

      <div
        className={`fixed bottom-6 right-6 z-[200] transition-all duration-300 ${minimized ? 'w-14' : 'w-72'}`}
        style={{ filter: 'drop-shadow(0 0 16px rgba(93,230,255,0.3))' }}
      >
        <div className="glass-card rounded-2xl border border-secondary/25 overflow-hidden">

          {/* Cabecera — siempre visible */}
          <div className="flex items-center justify-between px-3 py-2.5">
            {!minimized && track && (
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className={`text-secondary text-lg flex-shrink-0 ${playing ? 'animate-[spin-slow_3s_linear_infinite]' : ''}`}>
                  🎵
                </span>
                <p className="text-xs text-on-surface truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {track.title}
                </p>
              </div>
            )}
            <button
              onClick={() => setMinimized(m => !m)}
              className="btn-ghost p-1 flex-shrink-0"
              title={minimized ? 'Abrir reproductor' : 'Minimizar'}
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">
                {minimized ? 'music_note' : 'remove'}
              </span>
            </button>
          </div>

          {/* Panel expandido */}
          {!minimized && (
            <div className="px-3 pb-3 flex flex-col gap-2">

              {/* Progreso */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-on-surface-variant w-7 text-right" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {formatTime(progress)}
                </span>
                <input
                  type="range" min={0} max={duration || 100} step={0.1} value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 accent-secondary" style={{ cursor: 'none' }}
                />
                <span className="text-[10px] text-on-surface-variant w-7" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={prevTrack} className="btn-ghost p-1.5" title="Anterior">
                  <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                </button>

                <button
                  onClick={togglePlay}
                  disabled={!loaded || playlist.length === 0}
                  className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary hover:bg-secondary/30 hover:shadow-[0_0_12px_rgba(93,230,255,0.5)] transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playing ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button onClick={nextTrack} className="btn-ghost p-1.5" title="Siguiente">
                  <span className="material-symbols-outlined text-[20px]">skip_next</span>
                </button>

                <button onClick={() => setShowVolume(v => !v)} className="btn-ghost p-1.5" title="Volumen">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                  </span>
                </button>
              </div>

              {/* Volumen */}
              {showVolume && (
                <div className="flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant">volume_mute</span>
                  <input
                    type="range" min={0} max={1} step={0.01} value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 accent-primary" style={{ cursor: 'none' }}
                  />
                  <span className="text-[10px] text-primary w-8 text-right" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              )}

              {/* Info pista */}
              <p className="text-center text-[10px] text-on-surface-variant" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {!loaded
                  ? 'Cargando...'
                  : playlist.length === 0
                  ? 'Sin canciones'
                  : `${trackIdx + 1} / ${playlist.length} • Aleatorio`}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

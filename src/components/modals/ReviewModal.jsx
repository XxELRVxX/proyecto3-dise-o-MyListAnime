// modo para escribir o editar una resenna de una entrada de anime o manga
// sigue la misma estructura y patrones visuales que AddToListModal.jsx
// logica de Firestore esta aislada en handleSave, lo que facilita su reemplazo por un servicio real posteriormente

import { useEffect, useRef, useState } from 'react'
import StarRating from '../ui/StarRating'

// -- Constants ------------------------------------------------------------------

const MIN_CHARS  = 20   // longitud minima de la resenna para poder enviarla
const MAX_CHARS  = 1500 // limite de caracteres para el cuerpo de la resenna

// opciones de etiquetas para la resenna
const REVIEW_TAGS = [
  { value: 'recomendado',      label: ' Recomendado'    },
  { value: 'historia',         label: ' Historia'       },
  { value: 'personajes',       label: ' Personajes'     },
  { value: 'animacion',        label: ' Animación'      },
  { value: 'musica',           label: ' Música'         },
  { value: 'final_satisfecho', label: ' Buen final'     },
  { value: 'lento',            label: ' Ritmo lento'    },
  { value: 'recomienda_manga', label: ' Lee el manga'   },
]

// -- funcion de guardado simulado --------------------------------------------------------─
// reemplazar esta funcion con la llamada real a firestore cuando se este en el backend
// firma esperada saveReview(userId, reviewData) => Promise
async function mockSaveReview(_uid, data) {
  await new Promise(r => setTimeout(r, 800)) // simula retraso de red
  console.log('[ReviewModal] Review saved (mock):', data)
}

// -- componente ----------------------------------------------------------------─

/**
 * propiedades:
 *  - entry    (object)  - el anime o manga que se esta resennando
 *                         { id, type, title, imagen, episodios?, capitulos? }
 *  - onClose  (func)    - se llama cuando el usuario cierra
 *  - userId   (string)  - uid al usuario (se pasa desde AuthContext)
 *                         por defecto se usa mock-uid para las pruebas sin autenticacion
 *  - existing (object)  - resenna existente opcional para prellenar:
 *                         { puntuacion, cccuerpo, etiquetas, contieneSpoilers }
 */
export default function ReviewModal({
  entry,
  onClose,
  userId = 'mock-uid',
  existing = null,
}) {
  // -- Form state --------------------------------------------------------------
  const [score,            setScore]            = useState(existing?.score            ?? 0)
  const [body,             setBody]             = useState(existing?.body             ?? '')
  const [tags,             setTags]             = useState(existing?.tags             ?? [])
  const [containsSpoilers, setContainsSpoilers] = useState(existing?.containsSpoilers ?? false)
  const [saving,           setSaving]           = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [error,            setError]            = useState(null)

  const textareaRef = useRef(null)

  // auto ajusta la altura del textarea al escribir
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [body])

  // bloquea el desplazamiento del fondo
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // cierra con escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // -- Estado derivado ------------------------------------------------------------
  const charsLeft    = MAX_CHARS - body.length
  const isValid      = score > 0 && body.trim().length >= MIN_CHARS
  const isEditing    = Boolean(existing)

  // -- TToggle de etiquetas --------------------------------------------------------------─
  function toggleTag(value) {
    setTags(prev =>
      prev.includes(value)
        ? prev.filter(t => t !== value)
        : [...prev, value]
    )
  }

  // -- subir ------------------------------------------------------------------─
  async function handleSave() {
    if (!isValid || saving) return
    setSaving(true)
    setError(null)
    try {
      const reviewData = {
        entryId:          entry.id,
        entryType:        entry.type,
        entryTitle:       entry.title,
        score,
        body:             body.trim(),
        tags,
        containsSpoilers,
        updatedAt:        new Date().toISOString(),
      }
      // -- reemplaza mockSaveReview por el real cuando tengamos la funcion real --
      await mockSaveReview(userId, reviewData)
      setSaved(true)
      setTimeout(onClose, 1000) // breve momento de confirmacion antes de cerrar
    } catch (err) {
      console.error('[ReviewModal] Save failed:', err)
      setError('No se pudo guardar la reseña. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // -- Render ------------------------------------------------------------------─
  return (
    <div
      className="fixed inset-0 z-[100] modal-backdrop flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full sm:max-w-lg glass-card rounded-t-2xl sm:rounded-2xl border border-primary/20 shadow-2xl animate-slide-up overflow-hidden">

        {/* -- Header -- */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            {entry.image && (
              <img
                src={entry.image}
                alt={entry.title}
                className="w-10 h-14 object-cover rounded shrink-0"
              />
            )}
            <div>
              <h3
                id="review-modal-title"
                className="font-semibold text-on-surface text-sm line-clamp-2"
              >
                {entry.title}
              </h3>
              <span className="text-xs text-on-surface-variant capitalize">
                {isEditing ? 'Editar reseña' : `Escribir reseña · ${entry.type}`}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1 rounded-full shrink-0"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* -- Body -- */}
        <div className="p-5 flex flex-col gap-5 max-h-[70dvh] overflow-y-auto">

          {/* Score */}
          <div>
            <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3 block">
              Tu calificación <span className="text-tertiary">*</span>
            </label>
            <StarRating value={score} onChange={setScore} size="md" />
            {score === 0 && (
              <p className="text-xs text-outline mt-1">Seleccioná una calificación para continuar</p>
            )}
          </div>

          {/* Review text */}
          <div>
            <label
              htmlFor="review-body"
              className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2 block"
            >
              Reseña <span className="text-tertiary">*</span>
            </label>
            <div className="relative">
              <textarea
                id="review-body"
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value.slice(0, MAX_CHARS))}
                placeholder={`¿Qué te pareció ${entry.title}? Compartí tu opinión (mínimo ${MIN_CHARS} caracteres)…`}
                rows={4}
                className="input-field resize-none w-full min-h-[100px]"
              />
              {/* Character counter */}
              <span
                className={`absolute bottom-2 right-3 text-[11px] tabular-nums transition-colors
                  ${charsLeft < 100 ? 'text-tertiary' : 'text-outline'}`}
              >
                {charsLeft}
              </span>
            </div>
            {body.trim().length > 0 && body.trim().length < MIN_CHARS && (
              <p className="text-xs text-outline mt-1">
                {MIN_CHARS - body.trim().length} caracteres más para habilitar el envío
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-3 block">
              Etiquetas <span className="text-outline font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => {
                const isActive = tags.includes(tag.value)
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleTag(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150
                      ${isActive
                        ? 'bg-secondary/15 text-secondary border-secondary/40'
                        : 'border-outline-variant/40 text-on-surface-variant hover:border-outline hover:text-on-surface'
                      }`}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Spoiler toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={containsSpoilers}
                onChange={e => setContainsSpoilers(e.target.checked)}
              />
              {/* Custom toggle track */}
              <div
                className={`w-10 h-6 rounded-full border transition-all duration-200
                  ${containsSpoilers
                    ? 'bg-tertiary/20 border-tertiary/50'
                    : 'bg-surface-container-high border-outline-variant/40 group-hover:border-outline'
                  }`}
              />
              {/* Toggle thumb */}
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow transition-all duration-200
                  ${containsSpoilers
                    ? 'translate-x-4 bg-tertiary'
                    : 'translate-x-0 bg-outline'
                  }`}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-on-surface">Contiene spoilers</span>
              <p className="text-[11px] text-outline leading-tight">
                Se mostrará una advertencia antes de la reseña
              </p>
            </div>
          </label>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
        </div>

        {/* -- Footer / Actions -- */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="btn-ghost px-4 py-2.5"
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={!isValid || saving || saved}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              // Success state
              <>
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                ¡Reseña guardada!
              </>
            ) : saving ? (
              // Loading state
              <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              // Default state
              <>
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                {isEditing ? 'Actualizar reseña' : 'Publicar reseña'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
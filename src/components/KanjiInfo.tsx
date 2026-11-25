import { KANJI_MAP } from '../data/kanji'
import { parts } from '../data/strokes'
import { navigate } from '../lib/router'
import { PART_COLORS } from './KanjiStrokes'
import { Reading, SpeakButton } from './ui'

/** Bedeutung, Lesungen, Eselsbrücke, Bausteine und Beispiele eines Kanji. */
export function KanjiInfo({ char, showParts = true, linkParts = false }: { char: string; showParts?: boolean; linkParts?: boolean }) {
  const k = KANJI_MAP[char]
  const ps = parts(char).filter((p) => p.el !== char)
  return (
    <div className="kanji-info stack">
      <div className="readings">
        {k.kun.length > 0 && (
          <div className="reading-row">
            <span className="r-tag kun">Kun</span>
            <div className="r-list">
              {k.kun.map((r) => (
                <span key={r} className="r-chip">
                  <Reading r={r} />
                </span>
              ))}
            </div>
            <SpeakButton text={k.kun[0].replace(/[.-]/g, '')} small />
          </div>
        )}
        {k.on.length > 0 && (
          <div className="reading-row">
            <span className="r-tag on">On</span>
            <div className="r-list">
              {k.on.map((r) => (
                <span key={r} className="r-chip">
                  {r}
                </span>
              ))}
            </div>
            <SpeakButton text={k.on[0]} small />
          </div>
        )}
        <p className="tiny faint" style={{ margin: '2px 2px 0' }}>
          Kun = japanische Lesung (Hiragana) · On = sino-japanische Lesung (Katakana)
        </p>
      </div>

      <div className="mnemonic">
        <span className="mn-icon" aria-hidden="true">
          💡
        </span>
        <div>
          <div className="tiny bold" style={{ letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.7 }}>
            Eselsbrücke
          </div>
          {k.mnemonic}
        </div>
      </div>

      {showParts && ps.length > 0 && (
        <div className="parts-row">
          <span className="small bold muted">Bausteine:</span>
          {ps.map((p, i) => {
            const known = !!KANJI_MAP[p.el]
            return (
              <button
                key={p.el + i}
                className="part-chip jp"
                style={{ borderColor: PART_COLORS[i % PART_COLORS.length], color: PART_COLORS[i % PART_COLORS.length] }}
                disabled={!linkParts || !known}
                onClick={() => navigate(`/kanji/${p.el}`)}
              >
                {p.el}
                {known && <span className="tiny"> {KANJI_MAP[p.el].meanings[0]}</span>}
              </button>
            )
          })}
        </div>
      )}

      {k.examples.length > 0 && (
      <div className="examples">
        {k.examples.map((ex) => (
          <div key={ex.w} className="example">
            <span className="ex-word jp">
              {[...ex.w].map((ch, i) => (
                <span key={i} className={ch === char ? 'hl' : ''}>
                  {ch}
                </span>
              ))}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ex-reading">{ex.r}</div>
              <div className="small muted">{ex.m}</div>
            </div>
            <SpeakButton text={ex.r} small />
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

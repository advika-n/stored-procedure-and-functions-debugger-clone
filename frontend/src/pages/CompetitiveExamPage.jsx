import { useState } from 'react'
import COMPETITIVE_EXAM_QUESTIONS from '../competitiveExamQuestions'

// Competitive Exam -- a fixed, hand-written bank of 15 exam-style PL/SQL
// questions (transactions, cursors, exception handling, triggers), shown
// as a static expandable reference list -- NOT a quiz. Distinct from AI
// Practice (PracticePage.jsx): the question SOURCE here is static data
// (competitiveExamQuestions.js), never Gemini, and unlike AI Practice
// there's no click-to-answer/scoring interaction at all -- every question
// is visible up front, collapsed to just its prompt (plus a code snippet,
// if it has one, which stays visible even while collapsed -- only the
// options/explanation are hidden). Expanding a card reveals its options
// with the correct one already marked (reference/study material, not
// something you click to "check") plus the explanation.
//
// (An earlier version of this page WAS a one-question-at-a-time quiz with
// a two-attempt retry flow and a score screen, matching AI Practice's
// interaction pattern -- replaced with this simpler static list; see
// PROMPT_LOG.md for the fix that changed it.)
//
// Its own top-level nav entry (Layout.jsx, "/practice/competitive-exam").
//
// `expanded` is a Set of question ids currently open. Multiple cards can
// be open at once -- not a strict single-open accordion, per the spec
// ("either is fine, your call") -- toggled by clicking anywhere on a
// card's header button.

function CompetitiveExamPage() {
  const [expanded, setExpanded] = useState(() => new Set())

  function toggle(id) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className="practice-page">
      <h1>Competitive Exam</h1>

      <ul className="competitive-exam-list">
        {COMPETITIVE_EXAM_QUESTIONS.map((q, index) => {
          const isOpen = expanded.has(q.id)
          const answerId = `${q.id}-answer`

          return (
            <li key={q.id} className="competitive-exam-card">
              <button
                type="button"
                className="competitive-exam-card-header"
                onClick={() => toggle(q.id)}
                aria-expanded={isOpen}
                aria-controls={answerId}
              >
                <span className="competitive-exam-question">
                  {index + 1}. {q.question}
                </span>
                <span className="competitive-exam-chevron" aria-hidden="true">
                  {isOpen ? '▾' : '▸'}
                </span>
              </button>

              {q.code && <pre className="theory-code competitive-exam-code">{q.code}</pre>}

              {isOpen && (
                <div className="competitive-exam-answer" id={answerId}>
                  <ul className="practice-review-options">
                    {q.options.map((option, oIndex) => {
                      const isCorrect = oIndex === q.correctIndex
                      return (
                        <li
                          key={oIndex}
                          className={`practice-review-option${isCorrect ? ' practice-review-option-correct' : ''}`}
                        >
                          {option}
                          {isCorrect && <span className="practice-review-mark">&#10003; correct answer</span>}
                        </li>
                      )
                    })}
                  </ul>
                  <p className="practice-review-explanation">{q.explanation}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default CompetitiveExamPage

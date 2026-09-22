// Competitive Exam -- a fixed, hand-written bank of 15 exam-style PL/SQL
// questions (transactions, cursors, exception handling, triggers). Unlike
// AI Practice (PracticePage.jsx, Gemini-generated), this set never goes
// through the AI -- it's static data, checked in, identical every time.
// See CompetitiveExamPage.jsx for the page that renders it. (Formerly
// named "Hard Practice" -- ids below keep their original `hp-` prefix,
// internal-only, not user-facing, not worth the churn of renaming.)
//
// Shape: { id, question, code (optional -- a PL/SQL snippet, rendered in
// its own monospace block), options: string[4], correctIndex, explanation }

const COMPETITIVE_EXAM_QUESTIONS = [
  {
    id: 'hp-01',
    question: 'What happens if no row matches this SELECT INTO?',
    code: `BEGIN
  SELECT salary INTO v_sal FROM employees WHERE emp_id = 9999;
END;`,
    options: ['v_sal is set to NULL', 'NO_DATA_FOUND is raised', 'The block silently exits', 'TOO_MANY_ROWS is raised'],
    correctIndex: 1,
    explanation:
      'SELECT INTO expects exactly one row; zero rows raises NO_DATA_FOUND, more than one raises TOO_MANY_ROWS.',
  },
  {
    id: 'hp-02',
    question: 'Which is true of this cursor FOR loop?',
    code: `FOR rec IN (SELECT * FROM employees) LOOP
  ...
END LOOP;`,
    options: [
      'You must explicitly OPEN/CLOSE the cursor',
      'The loop implicitly opens, fetches, and closes the cursor',
      'It fails to compile without a cursor declaration',
      'It only works with explicit cursors',
    ],
    correctIndex: 1,
    explanation:
      'A cursor FOR loop is implicit -- Oracle handles open, repeated fetch, and close automatically, even for the inline query form.',
  },
  {
    id: 'hp-03',
    question:
      'For an explicit cursor that has been opened but not yet fetched, what does cur%ROWCOUNT return?',
    options: ['NULL', '0', 'Raises INVALID_CURSOR', '1'],
    correctIndex: 1,
    explanation:
      'After OPEN but before any FETCH, %ROWCOUNT is 0, not NULL. (NULL is what %FOUND/%NOTFOUND return in that state.)',
  },
  {
    id: 'hp-04',
    question:
      "If the calling transaction later does ROLLBACK, what happens to the row logged by this autonomous transaction?",
    code: `PROCEDURE log_msg(msg VARCHAR2) IS
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  INSERT INTO logs VALUES(msg);
  COMMIT;
END;`,
    options: [
      "It's rolled back too",
      "It stays committed -- autonomous transactions are independent",
      "It's rolled back only if the log table has no primary key",
      'Undefined behavior',
    ],
    correctIndex: 1,
    explanation: 'An autonomous transaction commits/rolls back independently of the parent transaction.',
  },
  {
    id: 'hp-05',
    question: 'What does this block print?',
    code: `BEGIN
  BEGIN
    RAISE VALUE_ERROR;
  END;
EXCEPTION
  WHEN VALUE_ERROR THEN
    DBMS_OUTPUT.PUT_LINE('caught');
END;`,
    options: [
      "Compile error -- inner block needs its own handler",
      '"caught" is printed -- the exception propagates to the enclosing block',
      'The exception is silently ignored',
      'Runtime error: unhandled exception',
    ],
    correctIndex: 1,
    explanation:
      'An exception with no handler in its own block propagates outward to the nearest enclosing block that does handle it.',
  },
  {
    id: 'hp-06',
    question: 'Which error code range is valid for RAISE_APPLICATION_ERROR?',
    options: ['-1 to -100', '-20000 to -20999', 'Any negative number', '20000 to 20999 (positive)'],
    correctIndex: 1,
    explanation: 'Oracle reserves -20000 to -20999 for user-defined application errors raised this way.',
  },
  {
    id: 'hp-07',
    question:
      "A row-level trigger on AFTER UPDATE OF salary ON employees tries to SELECT from employees inside its body. What's the likely result?",
    options: ['Works fine', 'ORA-04091: table is mutating', 'Silently returns 0 rows', 'Only fails in BEFORE triggers, not AFTER'],
    correctIndex: 1,
    explanation:
      "Querying (or modifying) the same table a row-level trigger is firing on raises the mutating-table error, since the table's state is inconsistent mid-statement.",
  },
  {
    id: 'hp-08',
    question: 'Can a regular (non-autonomous) trigger contain a COMMIT statement?',
    options: [
      'Yes, always',
      'No -- it raises an error unless the trigger uses PRAGMA AUTONOMOUS_TRANSACTION',
      'Yes, but only in BEFORE triggers',
      'Yes, but only once per trigger',
    ],
    correctIndex: 1,
    explanation:
      "Triggers can't commit/rollback the enclosing transaction directly; it needs to be made autonomous first.",
  },
  {
    id: 'hp-09',
    question:
      "A function that performs an UPDATE on a table is called directly inside a SELECT statement's column list. What happens?",
    options: [
      'Works, updates happen row by row',
      "Raises an error -- functions called from SQL can't modify database state (WNDS violation)",
      'Only works in Oracle 19c+',
      'Works only if AUTONOMOUS_TRANSACTION is used',
    ],
    correctIndex: 1,
    explanation:
      'Calling a function that writes to the database from a SQL query fails the WNDS (Writes No Database State) restriction, unless the function is made autonomous.',
  },
  {
    id: 'hp-10',
    question: 'For an explicit cursor, right after OPEN cur; but before any FETCH, what does cur%FOUND return?',
    options: ['FALSE', 'NULL', 'Raises INVALID_CURSOR', 'TRUE'],
    correctIndex: 1,
    explanation: '%FOUND and %NOTFOUND are NULL until at least one FETCH has been attempted.',
  },
  {
    id: 'hp-11',
    question: 'What does cur%ISOPEN return if called before the cursor is ever opened?',
    options: ['NULL', 'Raises INVALID_CURSOR', 'FALSE', 'TRUE'],
    correctIndex: 2,
    explanation: "%ISOPEN is the one cursor attribute that's safe to call before OPEN -- it simply returns FALSE.",
  },
  {
    id: 'hp-12',
    question: 'In an AFTER UPDATE row-level trigger, can you modify :NEW.column_value?',
    options: ['Yes, freely', 'No -- raises ORA-04084; :NEW is read-only in AFTER triggers', 'Only for numeric columns', 'Only if the trigger is also INSTEAD OF'],
    correctIndex: 1,
    explanation:
      ':NEW values can only be modified in BEFORE row-level triggers; by the AFTER stage the row is already written.',
  },
  {
    id: 'hp-13',
    question: 'Why is this exception handler considered bad practice?',
    code: `EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('error occurred');
END;`,
    options: [
      "It's a syntax error",
      'It swallows the original exception, hiding the real error and error code',
      'It only catches predefined exceptions',
      "It's fine, no issue",
    ],
    correctIndex: 1,
    explanation:
      'A bare WHEN OTHERS with no RAISE, or logging of SQLCODE/SQLERRM, discards diagnostic information about what actually failed.',
  },
  {
    id: 'hp-14',
    question: "What's in t after this runs?",
    code: `INSERT INTO t VALUES(1);
SAVEPOINT sp1;
INSERT INTO t VALUES(2);
ROLLBACK TO sp1;
COMMIT;`,
    options: ['Both rows', 'Only row 1', 'Neither row', 'Only row 2'],
    correctIndex: 1,
    explanation:
      'ROLLBACK TO SAVEPOINT undoes changes made after the savepoint but keeps the transaction open and earlier changes intact; the final COMMIT then persists row 1 only.',
  },
  {
    id: 'hp-15',
    question: 'If row 3 out of 10 fails a constraint, what happens to the other 9?',
    code: `FORALL i IN 1..arr.COUNT SAVE EXCEPTIONS
  INSERT INTO t VALUES(arr(i));`,
    options: [
      'The whole FORALL aborts, nothing is inserted',
      'Rows 1-2 insert, then it stops',
      'All valid rows insert; failures are collected in SQL%BULK_EXCEPTIONS and an error is raised after completion',
      'It silently skips failures with no error at all',
    ],
    correctIndex: 2,
    explanation:
      'SAVE EXCEPTIONS lets FORALL continue past individual failures, batching them into SQL%BULK_EXCEPTIONS and raising ORA-24381 only after all iterations complete.',
  },
]

export default COMPETITIVE_EXAM_QUESTIONS

# CodeReview Arena 🧠 - תוכנית עבודה מעודכנת (Action Plan)

**מטרת הפלטפורמה:** סימולטור מתקדם לאימון מפתחים בקריאת קוד וביצוע Code Review מקצועי (GitHub PR-style), עם הערכה מיידית מבוססת AI.

---

## 1. סטטוס התשתית - הושלם בהצלחה (Production Verified) ✅

כל 4 השירותים מחוברים, מוגנים ומדברים ביניהם ב-Production:

| שירות | טכנולוגיה | סטטוס | תפקיד |
| :--- | :--- | :---: | :--- |
| **Frontend** | React 18 + Vite + TypeScript (GitHub Pages) | ✅ פעיל | ממשק משתמש ו-IDE לביצוע ביקורת קוד |
| **Backend** | Hono + Cloudflare Workers (Serverless Edge) | ✅ פעיל | API גלובלי מהיר ללא Cold Starts |
| **Database** | Supabase (PostgreSQL Cloud) | ✅ פעיל | 35 אתגרים מאוחסנים ומאומתים |
| **AI Judge** | Google Gemini 3.5 Flash Lite | ✅ פעיל | מודל שפיטה מהיר וזול עם Structured Output |

* **Frontend URL:** [https://davidkorenblit.github.io/Train-Youre-Brain/](https://davidkorenblit.github.io/Train-Youre-Brain/)
* **Backend API URL:** `https://train-youre-brain.dycoren18.workers.dev`
* **בדיקת אינטגרציה מקצה לקצה:** הושלמה בהצלחה (1.78 שניות למעגל מלא של 4 השירותים).

---

## 2. משימות Backend (Cloudflare Workers + Supabase + Gemini) 🛠️

### משימה ב.1: מנוע השפיטה `ai_judge.ts`
- [ ] יצירת מודול `backend/src/services/ai_judge.ts`.
- [ ] הגדרת מבנה JSON Schema נוקשה לתשובת המודל:
  ```ts
  interface ReviewEvaluation {
    score: number;             // 0-100
    true_positives: string[];  // באגים שאותרו נכון
    false_positives: string[]; // הערות שווא שמורידות ציון (Noise)
    false_negatives: string[]; // באגים אמיתיים שפוספסו
    snr_rating: "Excellent" | "Good" | "Needs Improvement";
    ai_feedback: string;       // הסבר בונה בעברית
    suggested_fix_review: string;
  }
  ```
- [ ] מודל הגנה רב-שכבתי מפני Prompt Injection (Defense-in-Depth):
  1. **הפרדת רשויות ב-Gemini API:** הוראות השפיטה וה-`golden_bug` מוגדרים אך ורק ב-`systemInstruction` (עדיפות עליונה ב-RLHF של גוגל).
  2. **תיחום דינמי ב-Nonce אקראי:** קלט המשתמש עטוף ב-`<<<USER_DATA_${crypto.randomUUID()}>>>` למניעת סגירת תגיות ידנית.
  3. **סניטציה והגבלת קלט ב-Backend:** הגבלת אורך תווים (עד 350 לתווית), אימות שמספרי השורות קיימים בקוד, וסינון תבניות עקיפה נפוצות.
  4. **כפיית JSON Schema מוחלטת:** שימוש ב-`responseSchema` של Gemini (המודל אינו יכול לפלוט טקסט חופשי).
  5. **בקרת שפיות פוסט-עיבוד (Sanity Check):** בדיקת תקינות בקוד השרת (לדוגמה: אם `score > 0` אך `true_positives` ריק – ההגשה נחסמת אוטומטית כניסיון מניפולציה).

### משימה ב.2: נקודות קצה ב-API (Hono Routes)
- [ ] `GET /api/challenges`:
  - מחזיר את כל 35 התרגילים (מזהה, שם, רמה, שפה, הקשר – ללא פתרון הייחוס).
- [ ] `GET /api/challenges/:id`:
  - מחזיר תרגיל בודד עם ה-README והקוד הפגום (`buggy_code`).
- [ ] `POST /api/challenges/:id/submit`:
  - מקבל מערך של הערות המשתמש (שורה, חומרה, תיאור, הצעה לתיקון).
  - שולף את ה-`golden_bug` של האתגר מ-Supabase.
  - מריץ את `ai_judge` מול Gemini 3.5 Flash Lite.
  - שומר את ההגשה בטבלת `submissions` ב-Supabase.
  - מחזיר את הציון, המשוב, ואת פתרון הייחוס (`solution_code`).
- [ ] `GET /api/submissions/:id`:
  - שליפת היסטוריית הגשה לצפייה חוזרת.

---

## 3. משימות Frontend (React + Monaco Editor + GitHub Pages) 🎨

### משימה ג.1: שילוב עורך הקוד Monaco Editor
- [ ] התקנת `@monaco-editor/react`.
- [ ] הגדרת העורך במצב `readOnly: true` עם Theme כהה (VS Code Dark).
- [ ] הוספת מנגנון סימון שורות (Glyph Margin) עם אייקון כחול `+` שמופיע במעבר עכבר (Hover) על כל שורה – בדיוק כמו ב-GitHub Pull Requests.
- [ ] לחיצה על `+` פותחת טופס הוספת הערה (Inline Comment Form) צמוד לאותה שורה.

### משימה ג.2: טופס ומבנה הממצאים (Review Findings Drawer)
- [ ] טופס הוספת ממצא כולל:
  - מספר שורה (נקבע אוטומטית לפי הלחיצה).
  - דרגת חומרה: `Critical` 🔴, `High` 🟠, `Medium` 🟡, `Low` 🔵.
  - תיאור הכשל (Textarea).
  - הצעת קוד מתקן (אופציונלי).
- [ ] תצוגת רשימת הערות פעילות בצד המסך עם אפשרות עריכה ומחיקה לפני שליחה.

### משימה ג.3: סרגל ניווט ובחירת אתגרים (Challenge Explorer)
- [ ] סרגל צדדי לבחירת אתגר מתוך 35 התרגילים.
- [ ] סינון לפי רמות:
  - 🟢 **Level 1: Fundamentals** (15 אתגרי לוגיקה ואלגוריתמיקה)
  - 🟡 **Level 2: Software Engineering** (10 אתגרי OOP ותבניות עיצוב)
  - 🔴 **Level 3: Real-World Backend** (10 אתגרי Production & Security)
- [ ] אינדיקציה ויזואלית לאתגרים שכבר נפתרו (V ירוק + ציון).

### משימה ג.4: מסך תוצאות ומשוב (Scorecard & Diff Viewer)
- [ ] מסך סיכום מעוצב שנפתח מיד לאחר לחיצה על "שלח ביקורת":
  - מד ציון משוקלל (0–100) עם אנימציית מד מהירות/טבעת.
  - פירוק SNR: פגיעות מדויקות מול הערות סרק.
  - כרטיסיית פידבק מילולי אישי מ-Gemini AI.
  - השוואת קוד (Diff Viewer): הצגת הקוד הפגום מול פתרון הייחוס התקין.

---

## 4. מפת דרכים ליישום (Execution Sequence)

1. **שלב 1 (Backend Core):** הוספת מסלולי ה-API ב-Worker וחיבור ה-AI Judge להערכת ביקורת.
2. **שלב 2 (Frontend Layout):** שילוב Monaco Editor וסרגל בחירת אתגרים מ-Supabase.
3. **שלב 3 (Interaction Flow):** מימוש מנגנון הוספת הערות שורה (PR Comments) ושליחתן ל-API.
4. **שלב 4 (Score & Polish):** מסך תוצאות, חשיפת הפתרון וליטוש עיצובי מלא.

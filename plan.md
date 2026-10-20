# CodeReview Arena - תוכנית עבודה (Action Plan)

**מטרת הפלטפורמה:** סימולטור אימון ותרגול בקריאת קוד וביצוע Code Review (ללא צורך בסביבת הרצה או קומפילציה).
**סטטוס נוכחי:** נוצר דאטה-סט מלא של 35 תרגילים עם באגים מושתלים ופתרונות ייחוס.

---

## 1. החלטה ארכיטקטונית: מסד נתונים (Database Decision)

**ההחלטה:** שימוש ב-**Supabase (Managed PostgreSQL)** במסלול החינמי (Free Tier), עם תמיכה מקומית ב-`docker-compose.yml` לעבודה אופליין.

### הנימוקים:
1. **ממשק ניהול ויזואלי (Table Editor):** צפייה נוחה בעמודות `JSONB` מורכבות (`golden_bugs`, `user_claims`, `ai_evaluation`) וניהול תרגילים קל.
2. **אימות מובנה (Built-in Auth):** תמיכה מיידית ב-OAuth (GitHub, Google, Email) עם טוקנים של JWT, ללא צורך בכתיבת קוד אבטחה וניהול Sessions מחדש בשרת.
3. **חיבור PostgreSQL תקני:** חיבור ישיר ב-Connection String רגיל (`postgresql://...`). כל שכבת ה-DB ב-Python נכתבת לפי תקן רגיל (AsyncPG / SQLAlchemy), כך שהמעבר בין סופהבייס לדוקר מקומי הוא שינוי של משתנה סביבה אחד בלבד (`DATABASE_URL`).
4. **חיסכון במשאבים מקומיים:** מונע עומס על זיכרון המחשב (WSL2 / Docker Desktop).

---

## 2. סטטוס הדאטה-סט (35 תרגילים מוכנים)

כל תרגיל מאורגן בתיקייה משלו ומכיל 4 קבצים:
- `README.md` – הקשר עסקי ודגשי סקירה.
- `solution.py` – פתרון הייחוס התקין.
- `buggy.py` – קוד פגום (מאומת תחבירית) עם באג בודד.
- `golden_bug.json` – שורה, חומרה, תיאור הבאג ותיקון מוצע.

| רמה | כמות | מקור | סוגי הכשלים שהושתלו |
| :--- | :---: | :--- | :--- |
| **Level 1: Fundamentals** | 15 | `exercism/python` | לוגיקה, Off-by-one, טיפול במחרוזות, חזקות, היפוך אופרנדים, הסתעפויות חוסמות. |
| **Level 2: Software Engineering** | 10 | `faif/python-patterns` | תבניות עיצוב ו-OOP: Mutable Default Arguments, Class vs Instance Variable, בליעת חריגות, שבירת אנקפסולציה, העתקה שטחית. |
| **Level 3: Real-World Backend** | 10 | `nsidnev/fastapi-realworld-example-app` | כשלי Production: השבתת חתימות JWT, הזרקת SQL, עקיפת הרשאות (BOLA/IDOR), דליפת חיבורי DB, חסימת ה-Event Loop. |

---

## 3. שלבי העבודה הבאים (Roadmap)

### שלב א': הקמת תשתית מסד הנתונים והזרעת מידע (Database Setup & Seeding)
- [ ] פתיחת פרויקט חדש ב-Supabase (או הרצת Postgres מקומי).
- [ ] יצירת הסכמה לפי ה-PRD:
  - טבלת `challenges` (מזהה, שם, רמה, שפה, הקשר, קוד פגום, קוד תקין, `golden_bugs` ב-JSONB).
  - טבלת `users` (מזהה, אימייל, שם, רמה, XP, יחס אות לרעש SNR).
  - טבלת `submissions` (מזהה הגשה, משתמש, תרגיל, טענות המשתמש, הערכת AI, ציון סופי).
- [ ] כתיבת סקריפט `seed_challenges.py`: קריאת 35 התרגילים מתיקיית `dataset/` והזרקתם ל-DB.

---

### שלב ב': מנוע ההערכה מבוסס AI (The Core AI Judge)
- [ ] כתיבת מודול `ai_judge.py`:
  - חיבור ל-API של `gemini-2.5-flash` (או מודל מהיר וזול תומך Structured Outputs).
  - הגדרת Pydantic Schema מובנה לפלט ההערכה:
    - `total_score` (0–100 משוקלל).
    - `true_positives` (באגים שזוהו נכון).
    - `false_positives` (הערות סרק שגורעות מציון ה-SNR).
    - `false_negatives` (באגים אמיתיים שפוספסו).
    - `feedback` (הסבר בונה ומקצועי למפתח).
  - הגנת Prompt Injection (תחימת קלט משתמש בתגיות XML והתעלמות מהוראות זדוניות).
- [ ] כיול הפרומפט מול 3 תרחישי בדיקה (תשובה מושלמת, תשובה חלקית, תשובה שגויה לחלוטין).

---

### שלב ג': שרת ה-Backend ב-FastAPI
- [ ] הקמת שלד פרויקט FastAPI מודולרי:
  - `GET /api/challenges` – רשימת תרגילים מסוננת לפי רמה ונושא.
  - `GET /api/challenges/{id}` – קבלת תרגיל (הקשר וקוד פגום בלבד, ללא פתרון הייחוס).
  - `POST /api/challenges/{id}/submit` – קבלת ביקורת הקוד מהמשתמש, הרצת השופט האוטומטי ושמירת התוצאות ב-DB.
  - `GET /api/submissions/{id}` – שליפת פידבק מלא ופתרון הייחוס לאחר סיום ההגשה.
  - `GET /api/users/profile` – מעקב XP, דרגות (Junior Reviewer עד Principal) ו-Streak יומי.

---

### שלב ד': ממשק המשתמש (Frontend MVP)
- [ ] הקמת אפליקציית React + TypeScript + Vite.
- [ ] הטמעת Monaco Editor במצב `readOnly: true` עם מספור שורות ו-Syntax Highlighting.
- [ ] הוספת מנגנון סימון שורות ולחיצה להוספת ממצא (Inline Comments בדומה ל-GitHub PR).
- [ ] טופס מובנה: מספר שורה, חומרה (`Low`, `Medium`, `High`, `Critical`), תיאור הבאג, והצעת תיקון.
- [ ] מסך משוב: הצגת ציון, ניתוח פגיעות נכונות/פספוסים, וחשיפת קוד הפתרון.

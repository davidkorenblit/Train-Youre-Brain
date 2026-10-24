# CodeReview Arena - אפיון ותיעוד מנגנון משתמשים והרשמה (Auth Roadmap) 🔐

מסמך זה מתעד את הצורך, הארכיטקטורה והשלבים העתידיים להטמעת מערכת הרשמה וניהול משתמשים בפלטפורמה.

---

## 1. למה המערכת זקוקה למנגנון משתמשים? (The Need)

כיום הפלטפורמה פועלת במצב אורח (Guest Mode) בלבד, וההתקדמות נשמרת אך ורק מקומית ב-`localStorage`. כתוצאה מכך:
* **אין שמירה אמינה מכניסה לכניסה:** איפוס Cache, גלישה בסתר, או כניסה ממכשיר/דפדפן אחר מאפסים את רשימת האתגרים שנפתרו והציונים.
* **אין סנכרון ענן (Cloud Persistence):** אין יכולת לגשת להיסטוריית הגשות או לשחזר התקדמות ללא חשבון משתמש מקושר.
2. **מנגנון גיימיפיקציה ומוניטין (Gamification & Progression):**
   * צבירת נקודות ניסיון (XP), מעקב אחר ימי רצף (Streak Days), וחישוב מדד SNR אישי מצטבר.
   * לוח מובילים ציבורי (Global Leaderboard) המדרג סוקרי קוד מובילים.
3. **אבטחה והגבלת משאבים פר משתמש (Fair Use & Token Economy):**
   * אכיפת מגבלת קריאות AI אישית לכל מפתח במקום להסתמך רק על כתובת IP (הגנה מפני שריפת טוקנים של Gemini).
4. **פרופיל מקצועי לשיתוף (Developer Portfolio):**
   * דף פרופיל ציבורי המציג את הישגי המפתח בביצוע Code Review (אידיאלי להצגה בקו"ח ובלינקדאין).

---

## 2. התשתית הקיימת במסד הנתונים (Database Readiness)

בסיס הנתונים ב-Supabase כבר כולל תמיכה מובנית במשתמשים מתוך `scripts/schema.sql`:

* **טבלת `public.users`:**
  * `id` (UUID - מפתח ראשי).
  * `email` (VARCHAR).
  * `username` (VARCHAR).
  * `current_level` (INT - רמה 1, 2, או 3).
  * `xp` (INT).
  * `snr_score` (FLOAT - ממוצע יחס אות לרעש).
  * `streak_days` (INT).
* **קישור בטבלת `public.submissions`:**
  * עמודת `user_id` כבר מוגדרת כ-Foreign Key ל-`users(id)` (כיום מקבלת `NULL` עבור אורחים).

---

## 3. אפשרויות מימוש מומלצות (Recommended Architecture)

### אפשרות מועדפת: Supabase Auth + GitHub OAuth 🐙
* **מדוע?** הפלטפורמה מיועדת למפתחים. התחברות בלחיצה אחת דרך GitHub היא טבעית, מהירה ומייצרת אפס חיכוך.
* **איך זה עובד?**
  1. המשתמש לוחץ "התחבר עם GitHub" ב-Frontend.
  2. Supabase מטפל ב-OAuth Flow ומחזיר JWT מאובטח.
  3. ה-Frontend שומר את ה-Session ומעביר את ה-Token ב-Header (`Authorization: Bearer <token>`).
  4. ה-Backend ב-Cloudflare Worker מאמת את ה-Token ושומר את ה-`user_id` ב-`submissions`.

---

## 4. משימות ליישום עתידי (Future Action Items)

- [ ] **הגדרת OAuth ב-Supabase Dashboard:**
  - יצירת GitHub OAuth App והזנת Client ID & Secret.
- [ ] **עדכון ה-Frontend:**
  - התקנת `@supabase/supabase-js` בפרונטאנד.
  - הוספת כפתור "התחבר עם GitHub" ב-Header עם תמונת אווטאר של המשתמש.
  - מסך פרופיל אישי המציג ציונים והיסטוריית סקירות.
- [ ] **עדכון ה-Backend:**
  - חילוץ ה-`user_id` מה-JWT ב-`POST /api/challenges/:id/submit`.
  - עדכון שדות ה-XP ומדד ה-SNR בטבלת `users` לאחר כל שפיטה מוצלחת.

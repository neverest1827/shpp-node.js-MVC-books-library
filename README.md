# Інструкції з запуску

1. **Встановлення Node.js та npm:**
   Впевніться, що ви маєте встановлені Node.js, npm та MySql на вашому комп'ютері.

2. **Встановлення залежностей:**
   Використовуйте команду `npm i`, щоб встановити необхідні залежності.

3. **Компіляція проекту:**
   Використовуйте команду `npm run bc`, щоб скомпілювати проект (.ts -> .js) та скопіювати інші файли в папку `dist`.

4. **Налаштування для з'єднання з БД:**
   Встановіть налаштування для з'єднання з БД в файлі `src/configs/db_connect_config.json`.

5. **Виконання файлу міграції для БД:**  
   5.1. Використовуйте `npm run m-ls`, щоб переглянути доступні файли міграції.  
   5.2. Якщо список порожній, створіть новий файл міграції npm run m-сreate <назва_міграції>  
   (якщо потрібно, змініть дирикторію зберігання файлів міграцій `src/configs/migrate_config.ts`).  
   5.3. Скопіюйте назву зі списку та виконайте міграцію за допомогою команд:
    - `npm run m-up <назва_міграції>`
    - `npm run m-down <назва_міграції>`.

7. **Запуск проекту:**
   Використовуйте `npm run start`, щоб запустити проект.

8. **Перегляд сторінки:**
   Перейдіть на сторінку [http://localhost:3000/](http://localhost:3000/)  
   (якщо потрібно, змініть порт у файлі `src/configs/app_config.ts`).
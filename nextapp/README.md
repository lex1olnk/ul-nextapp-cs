# CS2 Fastcup Leaderboard 🏆

[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?logo=nextdotjs)](https://nextjs.org/)

**Визуализация топ-игроков Counter-Strike 2 (CS2), сыгравших в миксах и турнирах на платформе Fasctup.** Система автоматически обновляет данные игроков через Google Sheets и предоставляет API для доступа к статистике.

## DEMO [ulmixcup.ru](ulmixcup.ru)

## 🌟 Основные возможности

- **Топ игроков CS2** по ключевым метрикам (рейтинг, K/D, победы и т.д.)
- **Два режима фильтрации:**
  - 🎮 **Миксы** (стандартные 5v5 матчи)
  - 🏆 **Турнирные игры** (фильтрация по уникальным UUID матчей)
- **Добавление матчей через веб-интерфейс** (с автоматическим созданием игроков)
- **Автоматическое обновление** данных игроков через Google Sheets
- **RESTful API** для интеграции (отдельный репозиторий)

<img width="1301" height="656" alt="image" src="https://github.com/user-attachments/assets/346bcef6-b4ec-4543-a665-3bbdf92f67d1" />

<img width="1131" height="826" alt="image" src="https://github.com/user-attachments/assets/d27cc88e-cec1-4d60-9bad-9cf48bd73a60" />

## Технологии
- Frontend:
  - Next.js
  - Tailwind.js
  - Chart.js
  - Axios.js
- Backend:
  - Go
  - GORM (Serverless Postgres)
  - Google Sheets Api
- Базы данных:
  - Neon-Postgres

## ⚙️ Рабочий процесс

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant DB
    participant Google Sheets
    
    Frontend->>Backend: Добавление нового матча (тип/UUID)
    Backend->>DB: Проверка игроков
    alt Игрок не найден
        Backend->>DB: Автоматическое создание игрока
    end
    Backend->>DB: Сохранение данных матча
    Google Sheets->>Backend: Периодическая синхронизация
    Backend->>Frontend: Актуальный топ игроков

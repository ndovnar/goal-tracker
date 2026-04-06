import { useMemo } from "react";

import { useAppStore } from "@/store/useAppStore";
import type {
  AppLocale,
  DailyDerivedStatus,
  SyncState,
} from "@/shared/types/domain";

type TranslationLeaf = string;

type TranslationTree = {
  [key: string]: TranslationLeaf | TranslationTree;
};

const translations = {
  en: {
    common: {
      appName: "Goal Tracker Challenge",
      day: "Day",
      days: "days",
      saveChangesAuto: "Changes save automatically after each update.",
      futureDaysLocked: "Future days stay locked until their date arrives.",
      notYet: "Not yet",
      loadingTracker: "Preparing your local tracker...",
      language: "Language",
      languageEnglish: "English",
      languageRussian: "Russian",
      optional: "Optional",
      required: "Required",
      to: "to",
      allChallenges: "All challenges",
      challenge: "Challenge",
      close: "Close",
      syncComplete: "Sync complete.",
    },
    nav: {
      home: "Home",
      create: "Create",
      history: "History",
      settings: "Settings",
    },
    localeSwitcher: {
      en: "EN",
      ru: "RU",
    },
    welcome: {
      eyebrow: "Goal Tracker Challenge",
      title: "Daily consistency with an offline safety net.",
      description:
        "Create 30, 60, or 90-day challenges, backfill missed days, review streaks, and keep your data backed up to Google Drive without needing a backend.",
      offlineFirst: "Offline-first",
      cloudBackup: "Cloud backup",
      dailyCheckIns: "Daily check-ins",
      autosave: "Autosave",
      connectError: "Unable to connect Google right now.",
    },
    signIn: {
      eyebrow: "Offline first. Google sync when you want it.",
      title: "Build momentum one day at a time.",
      description:
        "Your challenges live locally in IndexedDB first, then sync to a hidden Google Drive app folder in the background when you connect your account.",
      connectGoogle: "Connect Google Drive",
      connectingGoogle: "Connecting Google...",
      continueLocalOnly: "Continue local-only",
      missingConfig:
        "Add `VITE_GOOGLE_CLIENT_ID` to enable Google sign-in and Drive backup.",
    },
    auth: {
      logIn: "Log in",
      logOut: "Log out",
      loggingIn: "Logging in...",
      loggingOut: "Logging out...",
    },
    dashboard: {
      title: "Your challenge dashboard",
      description:
        "See what is due today, how your active streaks are holding up, and where you have recovery work left.",
      today: "Today",
      openHistory: "Open history",
      nothingDueTitle: "Nothing due right now",
      nothingDueDescription:
        "Every active challenge is either complete for today or still waiting for its start date.",
      activeChallenges: "Active challenges",
      createNew: "Create new",
      noActiveTitle: "No active challenges yet",
      noActiveDescription:
        "Create your first challenge to start tracking daily consistency.",
      createChallenge: "Create challenge",
      completed: "Completed",
      completeForToday: "{{value}}% complete for today",
      stats: {
        activeChallenges: "Active challenges",
        completedChallenges: "Completed challenges",
        completedDays: "Completed days",
        failedDays: "Failed days",
        averageCompletion: "Average completion",
        bestCurrentStreak: "Best current streak",
      },
      card: {
        completion: "Complete",
        currentStreak: "Current streak",
        failedDays: "Failed days",
      },
    },
    createChallenge: {
      title: "Create a challenge",
      description:
        "Build a repeatable daily checklist, choose the duration, and let the app handle streaks, failures, and progress for you.",
      created: "Challenge created.",
      createError: "Unable to create the challenge.",
      form: {
        challengeTitle: "Challenge title",
        challengeTitlePlaceholder: "60-day reset",
        description: "Description",
        descriptionPlaceholder: "What does success look like?",
        durationDays: "Duration in days",
        startDate: "Start date",
        dailyChecklist: "Daily checklist",
        dailyChecklistDescription:
          "Add the habits you want to repeat every day.",
        addItem: "Add item",
        habit: "Habit {{value}}",
        habitPlaceholder: "Read 20 minutes",
        remove: "Remove",
        requiredForCompleteDay: "Required for a complete day",
        creatingChallenge: "Creating challenge...",
        createChallenge: "Create challenge",
      },
    },
    editChallenge: {
      loadingTitle: "Edit challenge",
      title: "Edit challenge",
      description:
        "Update challenge settings and checklist items. Changes apply immediately and sync in the background.",
      updated: "Challenge updated.",
      updateError: "Unable to update the challenge.",
      form: {
        savingChallenge: "Saving changes...",
        saveChallenge: "Save changes",
      },
    },
    challengeDetail: {
      loadingTitle: "Challenge detail",
      completion: "Completion",
      completedDays: "Completed days",
      currentStreak: "Current streak",
      longestStreak: "Longest streak",
      editChallenge: "Edit challenge",
      deleteChallenge: "Delete challenge",
      deletingChallenge: "Deleting...",
      deleteConfirm:
        'Delete "{{title}}"? This also removes its checklist items and daily history.',
      deleteSuccess: "Challenge deleted.",
      deleteError: "Unable to delete the challenge.",
      timeline: "Timeline",
      timelineDescription:
        "Jump between days to review history or update a backfill check-in.",
      habitAdherence: "Habit adherence",
      habitAdherenceDescription:
        "See which habits are staying consistent across eligible days.",
      habitDays: "{{completed}} / {{eligible}} days",
      dayProgress: "Day {{current}} / {{duration}}",
    },
    checkIn: {
      pickDay: "Pick a day to start a check-in.",
      title: "Daily check-in",
      dailyNote: "Daily note",
      dailyNotePlaceholder: "What helped today?",
    },
    history: {
      title: "History",
      description:
        "Review every finished day across your challenges and narrow the list down to missed or completed days.",
      challengeFilter: "Challenge filter",
      statusFilter: "Status filter",
      noEntriesTitle: "No history entries match",
      noEntriesDescription:
        "Try changing the filters or keep checking in to build out your timeline.",
      requiredHabitsCompleted:
        "{{checked}} / {{required}} required habits completed",
    },
    settings: {
      title: "Settings",
      description:
        "Manage Google Drive backup, inspect sync state, and move data in or out of the app.",
      languageTitle: "Language",
      languageDescription: "Choose the interface language for the app.",
      accountTitle: "Account",
      accountDescription:
        "Connect Google only if you want cloud backup. Local storage works either way.",
      disconnect: "Disconnect",
      connectGoogleDrive: "Connect Google Drive",
      connectGoogleError: "Unable to connect Google.",
      disconnected: "Google account disconnected.",
      syncTitle: "Sync",
      syncDescription:
        "Local writes always happen first. Sync runs in the background when you are online and connected.",
      syncStatus: "Sync status",
      pendingChanges: "Pending changes",
      lastSynced: "Last synced",
      lastError: "Last error",
      noSyncErrors: "No sync errors",
      syncNow: "Sync now",
      dataToolsTitle: "Data tools",
      dataToolsDescription:
        "Export a snapshot, import another snapshot, or clear all local data.",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      resetLocalData: "Reset local data",
      currentSnapshot: "Current local snapshot",
      snapshotSummary:
        "{{challenges}} challenges, {{items}} checklist items, {{entries}} saved entries",
      importMerged: "Import merged into local data.",
      importError: "Unable to import this file.",
      resetConfirm:
        "Reset all local challenges and check-ins? This cannot be undone.",
      resetDone: "Local data reset.",
    },
    statuses: {
      active: "active",
      archived: "archived",
      completed: "completed",
      complete: "complete",
      partial: "partial",
      failed: "failed",
      upcoming: "upcoming",
      idle: "idle",
      syncing: "syncing",
      success: "success",
      error: "error",
    },
    validation: {
      addHabitName: "Add a habit name.",
      habitNameMax: "Keep habit names under 80 characters.",
      titleMin: "Use at least 2 characters.",
      titleMax: "Keep the title under 80 characters.",
      descriptionMax: "Keep the description under 280 characters.",
      durationMin: "Use at least 7 days.",
      durationMax: "Keep the challenge within 365 days.",
      checklistMin: "Add at least one daily habit.",
      noteMax: "Keep the note under 300 characters.",
    },
    errors: {
      challengeNotFound: "Challenge not found.",
      missingGoogleClientId:
        "Missing VITE_GOOGLE_CLIENT_ID. Add it to your environment before connecting Google.",
      googleScriptFailed: "Google Identity script failed to load.",
      googleUnavailable: "Google Identity Services is unavailable.",
      userProfileFailed: "Unable to fetch Google account profile.",
      driveFetchFailed: "Unable to fetch app data from Google Drive.",
      driveQueryFailed: "Unable to query Google Drive app data folder.",
      driveUploadFailed: "Unable to upload app data to Google Drive.",
      driveMissingFileId: "Google Drive did not return a file id.",
      connectGoogleFirst: "Connect Google Drive first.",
      syncFailed: "Sync failed.",
      loadDataFailed: "Unable to load data.",
    },
  },
  ru: {
    common: {
      appName: "Goal Tracker Challenge",
      day: "День",
      days: "дней",
      saveChangesAuto:
        "Изменения сохраняются автоматически после каждого обновления.",
      futureDaysLocked: "Будущие дни заблокированы до наступления их даты.",
      notYet: "Пока нет",
      loadingTracker: "Подготавливаем ваш локальный трекер...",
      language: "Язык",
      languageEnglish: "Английский",
      languageRussian: "Русский",
      optional: "Необязательно",
      required: "Обязательно",
      to: "по",
      allChallenges: "Все челленджи",
      challenge: "Челлендж",
      close: "Закрыть",
      syncComplete: "Синхронизация завершена.",
    },
    nav: {
      home: "Главная",
      create: "Создать",
      history: "История",
      settings: "Настройки",
    },
    localeSwitcher: {
      en: "EN",
      ru: "RU",
    },
    welcome: {
      eyebrow: "Goal Tracker Challenge",
      title: "Ежедневная дисциплина с офлайн-страховкой.",
      description:
        "Создавайте челленджи на 30, 60 или 90 дней, заполняйте пропущенные дни задним числом, следите за стриками и храните резервную копию в Google Drive без отдельного бэкенда.",
      offlineFirst: "Сначала офлайн",
      cloudBackup: "Облачный бэкап",
      dailyCheckIns: "Ежедневные отметки",
      autosave: "Автосохранение",
      connectError: "Сейчас не удалось подключить Google.",
    },
    signIn: {
      eyebrow: "Сначала офлайн. Синхронизация Google по желанию.",
      title: "Наращивайте темп день за днем.",
      description:
        "Ваши челленджи сначала сохраняются локально в IndexedDB, а затем синхронизируются в скрытую папку приложения в Google Drive после подключения аккаунта.",
      connectGoogle: "Подключить Google Drive",
      connectingGoogle: "Подключаем Google...",
      continueLocalOnly: "Продолжить только локально",
      missingConfig:
        "Добавьте `VITE_GOOGLE_CLIENT_ID`, чтобы включить вход через Google и резервное копирование в Drive.",
    },
    auth: {
      logIn: "Войти",
      logOut: "Выйти",
      loggingIn: "Вход...",
      loggingOut: "Выход...",
    },
    dashboard: {
      title: "Панель челленджей",
      description:
        "Смотрите, что нужно отметить сегодня, как держатся активные стрики и где еще остались дни на восстановление.",
      today: "Сегодня",
      openHistory: "Открыть историю",
      nothingDueTitle: "Сейчас ничего не требуется",
      nothingDueDescription:
        "Все активные челленджи либо уже закрыты на сегодня, либо еще не начались.",
      activeChallenges: "Активные челленджи",
      createNew: "Создать",
      noActiveTitle: "Активных челленджей пока нет",
      noActiveDescription:
        "Создайте первый челлендж, чтобы начать отслеживать ежедневную дисциплину.",
      createChallenge: "Создать челлендж",
      completed: "Завершенные",
      completeForToday: "{{value}}% выполнено на сегодня",
      stats: {
        activeChallenges: "Активные челленджи",
        completedChallenges: "Завершенные челленджи",
        completedDays: "Выполненных дней",
        failedDays: "Проваленных дней",
        averageCompletion: "Среднее выполнение",
        bestCurrentStreak: "Лучший текущий стрик",
      },
      card: {
        completion: "Выполнено",
        currentStreak: "Текущий стрик",
        failedDays: "Провалы",
      },
    },
    createChallenge: {
      title: "Создать челлендж",
      description:
        "Соберите повторяемый ежедневный чеклист, выберите длительность, а приложение само посчитает стрики, провалы и прогресс.",
      created: "Челлендж создан.",
      createError: "Не удалось создать челлендж.",
      form: {
        challengeTitle: "Название челленджа",
        challengeTitlePlaceholder: "60-дневный перезапуск",
        description: "Описание",
        descriptionPlaceholder: "Как выглядит успех?",
        durationDays: "Длительность в днях",
        startDate: "Дата старта",
        dailyChecklist: "Ежедневный чеклист",
        dailyChecklistDescription:
          "Добавьте привычки, которые хотите повторять каждый день.",
        addItem: "Добавить пункт",
        habit: "Привычка {{value}}",
        habitPlaceholder: "Читать 20 минут",
        remove: "Удалить",
        requiredForCompleteDay: "Обязательно для полного дня",
        creatingChallenge: "Создаем челлендж...",
        createChallenge: "Создать челлендж",
      },
    },
    editChallenge: {
      loadingTitle: "Редактирование челленджа",
      title: "Редактировать челлендж",
      description:
        "Обновляйте параметры челленджа и пункты чеклиста. Изменения применяются сразу и синхронизируются в фоне.",
      updated: "Челлендж обновлен.",
      updateError: "Не удалось обновить челлендж.",
      form: {
        savingChallenge: "Сохраняем изменения...",
        saveChallenge: "Сохранить изменения",
      },
    },
    challengeDetail: {
      loadingTitle: "Детали челленджа",
      completion: "Выполнение",
      completedDays: "Выполненные дни",
      currentStreak: "Текущий стрик",
      longestStreak: "Лучший стрик",
      editChallenge: "Редактировать",
      deleteChallenge: "Удалить челлендж",
      deletingChallenge: "Удаление...",
      deleteConfirm:
        'Удалить "{{title}}"? Вместе с ним будут удалены чеклист и история по дням.',
      deleteSuccess: "Челлендж удален.",
      deleteError: "Не удалось удалить челлендж.",
      timeline: "Таймлайн",
      timelineDescription:
        "Переходите между днями, чтобы просмотреть историю или заполнить отметку задним числом.",
      habitAdherence: "Соблюдение привычек",
      habitAdherenceDescription:
        "Смотрите, какие привычки держатся стабильнее всего на доступных днях.",
      habitDays: "{{completed}} / {{eligible}} дней",
      dayProgress: "День {{current}} / {{duration}}",
    },
    checkIn: {
      pickDay: "Выберите день, чтобы начать отметку.",
      title: "Ежедневная отметка",
      dailyNote: "Заметка за день",
      dailyNotePlaceholder: "Что сегодня помогло?",
    },
    history: {
      title: "История",
      description:
        "Просматривайте все завершенные дни по челленджам и фильтруйте список по пропускам или выполненным дням.",
      challengeFilter: "Фильтр по челленджу",
      statusFilter: "Фильтр по статусу",
      noEntriesTitle: "Нет записей под текущие фильтры",
      noEntriesDescription:
        "Попробуйте изменить фильтры или продолжайте отмечаться, чтобы наполнить таймлайн.",
      requiredHabitsCompleted:
        "{{checked}} / {{required}} обязательных привычек выполнено",
    },
    settings: {
      title: "Настройки",
      description:
        "Управляйте резервным копированием в Google Drive, проверяйте состояние синхронизации и переносите данные в приложение и из него.",
      languageTitle: "Язык",
      languageDescription: "Выберите язык интерфейса приложения.",
      accountTitle: "Аккаунт",
      accountDescription:
        "Подключайте Google только если нужен облачный бэкап. Локальное хранение работает в любом случае.",
      disconnect: "Отключить",
      connectGoogleDrive: "Подключить Google Drive",
      connectGoogleError: "Не удалось подключить Google.",
      disconnected: "Аккаунт Google отключен.",
      syncTitle: "Синхронизация",
      syncDescription:
        "Локальные записи всегда сохраняются первыми. Синхронизация работает в фоне, когда вы онлайн и подключили аккаунт.",
      syncStatus: "Статус синхронизации",
      pendingChanges: "Ожидающие изменения",
      lastSynced: "Последняя синхронизация",
      lastError: "Последняя ошибка",
      noSyncErrors: "Ошибок синхронизации нет",
      syncNow: "Синхронизировать сейчас",
      dataToolsTitle: "Инструменты данных",
      dataToolsDescription:
        "Экспортируйте снимок, импортируйте другой снимок или очистите все локальные данные.",
      exportJson: "Экспорт JSON",
      importJson: "Импорт JSON",
      resetLocalData: "Сбросить локальные данные",
      currentSnapshot: "Текущий локальный снимок",
      snapshotSummary:
        "{{challenges}} челленджей, {{items}} пунктов чеклиста, {{entries}} сохраненных записей",
      importMerged: "Импорт объединен с локальными данными.",
      importError: "Не удалось импортировать этот файл.",
      resetConfirm:
        "Сбросить все локальные челленджи и отметки? Это действие нельзя отменить.",
      resetDone: "Локальные данные сброшены.",
    },
    statuses: {
      active: "активный",
      archived: "в архиве",
      completed: "завершен",
      complete: "выполнен",
      partial: "частично",
      failed: "провален",
      upcoming: "впереди",
      idle: "ожидание",
      syncing: "синхронизация",
      success: "успешно",
      error: "ошибка",
    },
    validation: {
      addHabitName: "Добавьте название привычки.",
      habitNameMax: "Название привычки должно быть короче 80 символов.",
      titleMin: "Введите минимум 2 символа.",
      titleMax: "Название должно быть короче 80 символов.",
      descriptionMax: "Описание должно быть короче 280 символов.",
      durationMin: "Минимум 7 дней.",
      durationMax: "Челлендж должен быть не длиннее 365 дней.",
      checklistMin: "Добавьте хотя бы одну ежедневную привычку.",
      noteMax: "Заметка должна быть короче 300 символов.",
    },
    errors: {
      challengeNotFound: "Челлендж не найден.",
      missingGoogleClientId:
        "Отсутствует VITE_GOOGLE_CLIENT_ID. Добавьте его в окружение перед подключением Google.",
      googleScriptFailed: "Не удалось загрузить скрипт Google Identity.",
      googleUnavailable: "Google Identity Services недоступен.",
      userProfileFailed: "Не удалось получить профиль аккаунта Google.",
      driveFetchFailed:
        "Не удалось получить данные приложения из Google Drive.",
      driveQueryFailed:
        "Не удалось запросить скрытую папку приложения в Google Drive.",
      driveUploadFailed:
        "Не удалось загрузить данные приложения в Google Drive.",
      driveMissingFileId: "Google Drive не вернул идентификатор файла.",
      connectGoogleFirst: "Сначала подключите Google Drive.",
      syncFailed: "Синхронизация завершилась с ошибкой.",
      loadDataFailed: "Не удалось загрузить данные.",
    },
  },
} as const satisfies Record<AppLocale, TranslationTree>;

type TranslationKey = string;

function getValueByPath(
  locale: AppLocale,
  key: TranslationKey,
): string | undefined {
  const segments = key.split(".");
  let currentValue: TranslationTree | TranslationLeaf | undefined =
    translations[locale];
  for (const segment of segments) {
    if (typeof currentValue === "string") {
      return undefined;
    }
    currentValue = currentValue[segment];
    if (!currentValue) {
      return undefined;
    }
  }
  return typeof currentValue === "string" ? currentValue : undefined;
}

function interpolate(
  template: string,
  values?: Record<string, string | number>,
): string {
  if (!values) {
    return template;
  }
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

export function t(
  locale: AppLocale,
  key: TranslationKey,
  values?: Record<string, string | number>,
): string {
  const localizedValue =
    getValueByPath(locale, key) ?? getValueByPath("en", key) ?? key;
  return interpolate(localizedValue, values);
}

export function useI18n(): {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
} {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const translate = useMemo(
    () => (key: TranslationKey, values?: Record<string, string | number>) =>
      t(locale, key, values),
    [locale],
  );
  return {
    locale,
    setLocale,
    t: translate,
  };
}

export function translateCurrent(
  key: TranslationKey,
  values?: Record<string, string | number>,
): string {
  return t(useAppStore.getState().locale, key, values);
}

export function getStatusTranslationKey(
  value: DailyDerivedStatus | SyncState | "active" | "archived" | "completed",
): TranslationKey {
  return `statuses.${value}`;
}

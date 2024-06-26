import { type Lesson, MutableDailyGoal } from "@keybr/lesson";
import {
  MutableKeyStatsMap,
  MutableStreakList,
  MutableSummaryStats,
  type Result,
} from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { DailyGoalEvents } from "./event-source-daily-goal.ts";
import { LetterEvents } from "./event-source-letter.ts";
import { TopScoreEvents } from "./event-source-top-score.ts";
import { TopSpeedEvents } from "./event-source-top-speed.ts";
import type { LessonEventListener, LessonEventSource } from "./event-types.ts";

export class Progress {
  readonly #settings: Settings;
  readonly #lesson: Lesson;
  readonly #results: Result[];
  readonly #keyStatsMap: MutableKeyStatsMap;
  readonly #summaryStats: MutableSummaryStats;
  readonly #streakList: MutableStreakList;
  readonly #dailyGoal: MutableDailyGoal;
  readonly #events: LessonEventSource;

  constructor(settings: Settings, lesson: Lesson) {
    this.#settings = settings;
    this.#lesson = lesson;
    this.#results = [];
    this.#keyStatsMap = new MutableKeyStatsMap(this.#lesson.letters);
    this.#summaryStats = new MutableSummaryStats();
    this.#streakList = new MutableStreakList();
    this.#dailyGoal = new MutableDailyGoal(this.#settings);

    const letter = new LetterEvents(this.#lesson, this.#keyStatsMap);
    const topSpeed = new TopSpeedEvents();
    const topScore = new TopScoreEvents();
    const dailyGoal = new DailyGoalEvents(this.#dailyGoal);
    this.#events = new (class implements LessonEventSource {
      append(result: Result, listener: LessonEventListener): void {
        letter.append(result, listener);
        topSpeed.append(result, listener);
        topScore.append(result, listener);
        dailyGoal.append(result, listener);
      }
    })();
  }

  seed(results: readonly Result[]) {
    // We assume that the given array of results is append-only,
    // so finding new results is a matter of comparing the array lengths.
    for (const result of results.slice(this.#results.length)) {
      this.append(result);
    }
  }

  append(result: Result, listener: LessonEventListener = () => {}) {
    this.#results.push(result);
    this.#keyStatsMap.append(result);
    this.#summaryStats.append(result);
    this.#streakList.append(result);
    this.#dailyGoal.append(result);
    this.#events.append(result, listener);
  }

  get settings() {
    return this.#settings;
  }

  get lesson() {
    return this.#lesson;
  }

  get keyStatsMap() {
    return this.#keyStatsMap;
  }

  get summaryStats() {
    return this.#summaryStats;
  }

  get streakList() {
    return this.#streakList;
  }

  get dailyGoal() {
    return this.#dailyGoal;
  }
}

type Appointment = {
  appointmentId: string;
  patientName: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  clinic: string;
};

type Intent =
  | "wrong_number"
  | "confirm"
  | "cancel"
  | "reschedule"
  | "ask_time"
  | "ask_date"
  | "ask_address"
  | "ask_doctor";

type Question = Extract<Intent, `ask_${string}`>;

const KEYWORDS: Record<Intent, string[]> = {
  wrong_number: ["ошиблись", "не туда", "не тот", "не та"],
  cancel: ["отмен", "не приду", "не смогу"],
  reschedule: ["перенес", "другое время", "другой день"],
  confirm: ["да ", "приду", "буду", "конечно"],
  ask_time: ["во сколько", "какое время"],
  ask_date: ["когда", "какого числа", "какая дата"],
  ask_address: ["адрес", "куда"],
  ask_doctor: ["врач", "доктор"],
};

const QUESTIONS: Question[] = [
  "ask_time",
  "ask_date",
  "ask_address",
  "ask_doctor",
];

declare function say(text: string): void;
declare function listen(): string;
declare function transferToOperator(): void;
declare function updateAppointment(
  id: string,
  action: "confirm" | "cancel" | "reschedule",
): void;

function detectIntents(reply: string): Intent[] {
  const text = ` ${reply.toLowerCase().replace(/[^а-яё0-9]+/g, " ")} `;
  const intents = Object.keys(KEYWORDS) as Intent[];

  return intents.filter((intent) =>
    KEYWORDS[intent].some((keyword) => text.includes(` ${keyword}`)),
  );
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function answer(question: Question, a: Appointment): string {
  switch (question) {
    case "ask_time":
      return `Ваш приём в ${a.time}.`;
    case "ask_date":
      return `Ваш приём ${formatDate(a.date)}.`;
    case "ask_address":
      return `Адрес: ${a.clinic}.`;
    case "ask_doctor":
      return `Вас примет ${a.doctor}, ${a.specialty}.`;
    default: {
      const unreachable: never = question;
      return unreachable;
    }
  }
}

type State =
  | "greeting"
  | "listening"
  | "ask_again"
  | "clarify"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "wrong_number"
  | "operator"
  | "end";

const MAX_MISSES = 2;

function run(a: Appointment): void {
  let state: State = "greeting";
  let misses = 0;

  while (state !== "end") {
    switch (state) {
      case "greeting":
        say(
          `Здравствуйте, ${a.patientName}! Напоминаем, что вы записаны к врачу ` +
            `${a.doctor}, ${a.specialty}, на ${formatDate(a.date)} в ${a.time}, ` +
            `${a.clinic}. Вы придёте?`,
        );
        state = "listening";
        break;

      case "listening": {
        const intents = detectIntents(listen());

        if (intents.includes("wrong_number")) {
          state = "wrong_number";
          break;
        }

        QUESTIONS.filter((q) => intents.includes(q)).forEach((q) =>
          say(answer(q, a)),
        );

        if (intents.includes("cancel")) state = "cancelled";
        else if (intents.includes("reschedule")) state = "rescheduled";
        else if (intents.includes("confirm")) state = "confirmed";
        else if (intents.length > 0) state = "ask_again";
        else if (misses + 1 >= MAX_MISSES) state = "operator";
        else state = "clarify";
        break;
      }

      case "ask_again":
        misses = 0;
        say("Подскажите, вы придёте на приём?");
        state = "listening";
        break;

      case "clarify":
        misses += 1;
        say(
          "Извините, не расслышал. Вы придёте, хотите отменить или перенести запись?",
        );
        state = "listening";
        break;

      case "confirmed":
        updateAppointment(a.appointmentId, "confirm");
        say("Отлично, ждём вас. До свидания!");
        state = "end";
        break;

      case "cancelled":
        updateAppointment(a.appointmentId, "cancel");
        say("Запись отменена. До свидания!");
        state = "end";
        break;

      case "rescheduled":
        updateAppointment(a.appointmentId, "reschedule");
        say(
          "Передам администратору, он перезвонит и подберёт новое время. До свидания!",
        );
        state = "end";
        break;

      case "wrong_number":
        say("Извините за беспокойство. До свидания!");
        state = "end";
        break;

      case "operator":
        say("Не могу вас понять. Соединяю с администратором.");
        transferToOperator();
        state = "end";
        break;

      default: {
        const unreachable: never = state;
        return unreachable;
      }
    }
  }
}

run({
  appointmentId: "A-10245",
  patientName: "Анна",
  doctor: "Иванов Сергей Петрович",
  specialty: "терапевт",
  date: "2026-10-12",
  time: "15:30",
  clinic: "Клиника на Ленина, 15",
});

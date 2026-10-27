import { Appointment } from "../types";
import { formatDate } from "../utils";

(() => {
  const generateNotifyMessage = ({
    name,
    doctor,
    specialty,
    date,
    time,
  }: {
    name: string;
    doctor: string;
    specialty: string;
    date: string;
    time: string;
  }) =>
    `${name}, вы записаны к врачу ${doctor}, ${specialty}, на ${formatDate(date)} в ${time}.`;

  const appointment = {
    patientName: "Анна",
    doctor: "Иванов Сергей Петрович",
    specialty: "терапевт",
    date: "2026-10-12",
    time: "15:30",
  };

  console.log(
    generateNotifyMessage({
      ...appointment,
      name: appointment.patientName,
    }),
  );
})();

import { ApiResponse, AppointmentShort } from "../types";

(async () => {
  const response: ApiResponse = {
    success: true,
    appointments: [
      {
        id: "A-101",
        doctor: "Иванов",
        time: "10:00",
      },
      {
        id: "A-102",
        doctor: "Петров",
        time: "14:30",
      },
    ],
  };

  const fetchAppointments = (): Promise<ApiResponse> =>
    new Promise((resolve) => setTimeout(() => resolve(response), 0));

  const handleApiResponse = (appointments: Array<AppointmentShort>) =>
    appointments.map(
      (appointment) => `${appointment.doctor} - ${appointment.time}`,
    );

  const data = await fetchAppointments();
  if (!data.success) throw new Error("api failed");

  console.log(handleApiResponse(data.appointments));
})();

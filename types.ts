export type Appointment = {
  appointmentId: string;
  patientName: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  clinic: string;
};

export type AppointmentShort = { id: string; doctor: string; time: string };

export type ApiResponse = {
  success: boolean;
  appointments: Array<AppointmentShort>;
};

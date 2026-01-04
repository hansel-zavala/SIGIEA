import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import eventService from "../services/eventService";
import { areDatesValidRange, isBeforeToday } from "../utils/eventDateUtils";

// Definimos el esquema
const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "El título es obligatorio")
      .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,#\-°]+$/, "Caracteres no permitidos"),
    categoryId: z.string().min(1, "La categoría es obligatoria"),
    // CAMBIO: Quitamos .default(false) para que el tipo sea 'boolean' estricto
    isAllDay: z.boolean(),
    location: z.string().min(1, "Ubicación obligatoria"),
    startDate: z.string().min(1, "Fecha inicio obligatoria"),
    endDate: z.string().min(1, "Fecha fin obligatoria"),
    audience: z.string().min(1, "Público obligatorio"),
    description: z.string().min(1, "Descripción obligatoria"),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      areDatesValidRange(data.startDate, data.endDate),
    {
      message: "La fecha fin no puede ser antes de inicio",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => !data.startDate || !isBeforeToday(data.startDate, data.isAllDay),
    {
      message: "La fecha inicio no puede ser anterior a hoy",
      path: ["startDate"],
    }
  );

// Exportamos el tipo inferido
export type EventFormData = z.infer<typeof eventSchema>;

export const useEventForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formMethods = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      isAllDay: false, // Aquí ya estamos controlando el valor por defecto
      location: "",
      audience: "",
      categoryId: "",
    },
  });

  const submitEvent = async (data: EventFormData) => {
    try {
      const dataToSend = { ...data, categoryId: parseInt(data.categoryId, 10) };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await eventService.createEvent(dataToSend as any);
      showToast({ message: `Evento "${data.title}" creado correctamente.` });
      navigate("/events");
    } catch (err) {
      console.error(err);
      showToast({ message: "Error al crear evento", type: "error" });
    }
  };

  return {
    formMethods,
    submitEvent,
  };
};
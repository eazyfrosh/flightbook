import { z } from "zod";

export const cardPaymentSchema = z.object({
  cardholderName: z.string().min(2, "Enter the name on the card"),
  cardNumber: z
    .string()
    .regex(/^[0-9\s]{13,19}$/, "Enter a valid card number")
    .transform((v) => v.replace(/\s/g, "")),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Use MM/YY"),
  cvv: z.string().regex(/^[0-9]{3,4}$/, "Enter a valid CVV"),
  savePaymentMethod: z.boolean().optional(),
});

export type CardPaymentValues = z.infer<typeof cardPaymentSchema>;

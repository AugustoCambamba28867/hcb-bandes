import { z } from "zod";

// Regex telefone Angola (opcional): aceita +244 e formatos locais com 9 dígitos iniciando por 9.
const phoneRegex = /^(\+?244\s?)?[9]\d{8}$|^(\+?\d{7,15})$/;

export const contactSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." })
    .max(100, { message: "O nome deve ter no máximo 100 caracteres." })
    .regex(/^[\p{L}\s'.-]+$/u, { message: "O nome contém caracteres inválidos." }),
  empresa: z
    .string()
    .trim()
    .max(120, { message: "O nome da empresa é demasiado longo." })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Indique um e-mail válido." })
    .max(255, { message: "O e-mail é demasiado longo." }),
  telefone: z
    .string()
    .trim()
    .max(20, { message: "O telefone é demasiado longo." })
    .refine((v) => v === "" || phoneRegex.test(v.replace(/\s/g, "")), {
      message: "Indique um telefone válido (ex: +244 952 300 277).",
    })
    .optional()
    .or(z.literal("")),
  perfil: z.enum(
    [
      "Empresa empregadora",
      "Banco / Instituição financeira",
      "Promotor imobiliário",
      "Trabalhador / Cliente final",
      "Outro",
    ],
    { message: "Seleccione o seu perfil." },
  ),
  mensagem: z
    .string()
    .trim()
    .min(10, { message: "A mensagem deve ter pelo menos 10 caracteres." })
    .max(1000, { message: "A mensagem deve ter no máximo 1000 caracteres." }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

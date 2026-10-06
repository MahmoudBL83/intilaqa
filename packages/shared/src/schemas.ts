import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const appSettingsSchema = z.object({
  appArabicName: z.string().min(1),
  appEnglishName: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  defaultLanguage: z.enum(["ar", "en"]),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(1),
  role: z.enum(["admin", "client", "company_admin", "employee"]),
});

export const clientSchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  contactEmail: z.string().email(),
  isActive: z.boolean().default(true),
});

export const companySchema = z.object({
  name: z.string().min(1),
  clientId: z.string(),
  address: z.string().optional(),
  industry: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const employeeSchema = z.object({
  userId: z.string(),
  companyId: z.string(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().optional(),
  joinDate: z.string(),
  salary: z.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;

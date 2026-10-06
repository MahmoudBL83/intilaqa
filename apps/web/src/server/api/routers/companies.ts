import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import * as companyService from "../../services/company-service";

export const companiesRouter = router({
  list: adminProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional(), search: z.string().optional(), clientId: z.string().optional() }))
    .query(async ({ input }) => companyService.getCompanies(input)),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => companyService.getCompanyById(input.id)),

  create: adminProcedure
    .input(z.object({ name: z.string().min(1), clientId: z.string(), address: z.string().optional(), industry: z.string().optional() }))
    .mutation(async ({ input }) => companyService.createCompany(input)),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), address: z.string().optional(), industry: z.string().optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return companyService.updateCompany(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => companyService.deleteCompany(input.id)),

  stats: adminProcedure
    .query(async () => companyService.getCompanyStats()),
});

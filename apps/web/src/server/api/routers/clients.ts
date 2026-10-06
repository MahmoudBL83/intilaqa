import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import * as clientService from "../../services/client-service";

export const clientsRouter = router({
  list: adminProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional(), search: z.string().optional() }))
    .query(async ({ input }) => clientService.getClients(input)),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => clientService.getClientById(input.id)),

  create: adminProcedure
    .input(z.object({ name: z.string().min(1), domain: z.string().optional(), contactEmail: z.string().email() }))
    .mutation(async ({ input }) => clientService.createClient(input)),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), domain: z.string().optional(), contactEmail: z.string().email().optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return clientService.updateClient(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => clientService.deleteClient(input.id)),

  stats: adminProcedure
    .query(async () => clientService.getClientStats()),
});

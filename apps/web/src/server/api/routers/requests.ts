import { z } from "zod";
import { router, protectedProcedure, companyAdminProcedure } from "../trpc";
import * as requestService from "../../services/request-service";

export const requestsRouter = router({
  list: protectedProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional(), employeeId: z.string().optional(), type: z.string().optional(), status: z.string().optional() }))
    .query(async ({ input }) => requestService.getRequests(input)),

  pendingCount: protectedProcedure
    .query(async () => requestService.getPendingRequestCount()),

  approve: companyAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => requestService.approveRequest(input.id)),

  reject: companyAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => requestService.rejectRequest(input.id)),
});

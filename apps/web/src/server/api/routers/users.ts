import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import * as userService from "../../services/user-service";

const roleSchema = z.enum(["admin", "client", "company_admin", "employee"]);

export const usersRouter = router({
  list: adminProcedure
    .input(
      z.object({
        take: z.number().optional(),
        skip: z.number().optional(),
        search: z.string().optional(),
        role: roleSchema.optional(),
        status: z.enum(["active", "inactive"]).optional(),
        clientId: z.string().optional(),
        companyId: z.string().optional(),
      })
    )
    .query(async ({ input }) => userService.getUsers(input)),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => userService.getUserById(input.id)),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        role: roleSchema,
        password: z.string().min(6),
        isActive: z.boolean().optional(),
        clientId: z.string().optional(),
        companyId: z.string().optional(),
        departmentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => userService.createUser(input)),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: roleSchema.optional(),
        password: z.string().min(6).optional(),
        isActive: z.boolean().optional(),
        clientId: z.string().optional(),
        companyId: z.string().optional(),
        departmentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return userService.updateUser(id, data);
    }),
});

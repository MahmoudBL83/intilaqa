import { initTRPC, TRPCError } from "@trpc/server";
import { auth as getAuth } from "@intilaqa/auth";
import superjson from "superjson";
import type { Role } from "@intilaqa/shared";

export async function createTRPCContext() {
  const session = await getAuth();
  return {
    session,
    user: session?.user as { id?: string; name?: string; email?: string; role?: Role } | undefined,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

const enforceAuth = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

const enforceRole = (...roles: Role[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user?.role || !roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  });

export const adminProcedure = protectedProcedure.use(enforceRole("admin"));
export const companyAdminProcedure = protectedProcedure.use(enforceRole("admin", "company_admin"));

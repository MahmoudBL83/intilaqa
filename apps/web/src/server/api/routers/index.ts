import { router } from "../trpc";
import { clientsRouter } from "./clients";
import { companiesRouter } from "./companies";
import { employeesRouter } from "./employees";
import { attendanceRouter } from "./attendance";
import { requestsRouter } from "./requests";
import { usersRouter } from "./users";
import { notificationsRouter } from "./notifications";

export const appRouter = router({
  clients: clientsRouter,
  companies: companiesRouter,
  employees: employeesRouter,
  attendance: attendanceRouter,
  requests: requestsRouter,
  users: usersRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;

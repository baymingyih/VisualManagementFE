import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import actionRouter from "./routes/actions";
import metricDataRouter from "./routes/metricData";
import teamsRouter from "./routes/teams";
import metricsRouter from "./routes/metrics";
import projectsRouter from "./routes/projects";
import usersRouter from "./routes/users";
import organisationsRouter from "./routes/organisations";
import billingsRouter from "./routes/billings";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors())
app.use(bodyParser.json())

app.use("/actions", actionRouter)
app.use("/metricData", metricDataRouter)
app.use("/teams", teamsRouter)
app.use("/metrics", metricsRouter)
app.use("/projects", projectsRouter)
app.use("/users", usersRouter)
app.use("/org", organisationsRouter)
app.use("/billing", billingsRouter)

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

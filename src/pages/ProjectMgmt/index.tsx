import SharedLayout from "@/components/SharedLayout/SharedLayout";
import { ReactElement } from "react";
import store from "../../../redux/store";

import ProjectsWrapper from "./ProjDashboard/ProjectsWrapper";
import { Provider } from "react-redux";

function ProjectMgmt() {
  return (
    <Provider store={store}>
      <ProjectsWrapper />
    </Provider>
  )
}

ProjectMgmt.getLayout = function getLayout(page: ReactElement) {
  return <SharedLayout>{page}</SharedLayout>;
};

export default ProjectMgmt

import SharedLayout from "@/components/SharedLayout/SharedLayout";
import { ReactElement } from "react";
import axios from "axios";

import ProjectsDetailWrapper from "./ProjDetails/ProjectsDetailWrapper";

export async function getStaticProps() {
    return { props: {} };
}

export async function getStaticPaths() {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/projects/ids`);
    const projectids: Array<{ id: number }> = res.data;

    const paths = projectids.map((projectid) => ({
        params: { projId: projectid.id.toString() },
    }));

    return { paths, fallback: true };
}

function ProjectDetails() {
    return <ProjectsDetailWrapper />;
}

ProjectDetails.getLayout = function getLayout(page: ReactElement) {
    return <SharedLayout>{page}</SharedLayout>;
};

export default ProjectDetails;

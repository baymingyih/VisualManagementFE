import SharedLayout from "@/components/SharedLayout/SharedLayout";
import { ReactElement } from "react";

import Tracker from './Tracker'

function ActionTracker() {
  return (
    <Tracker />
  )
}

ActionTracker.getLayout = function getLayout(page: ReactElement) {
  return <SharedLayout>{page}</SharedLayout>;
};

export default ActionTracker

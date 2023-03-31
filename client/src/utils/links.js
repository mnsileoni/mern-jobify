/** @format */

import {
  BsFillClipboard2DataFill,
  BsFillClipboard2CheckFill,
  BsFillPersonLinesFill,
  BsFillClipboardPlusFill,
} from "react-icons/bs";

const links = [
  {
    id: 1,
    text: "stats",
    path: "/",
    icon: <BsFillClipboard2DataFill />,
  },
  {
    id: 2,
    text: "all jobs",
    path: "all-jobs",
    icon: <BsFillClipboard2CheckFill />,
  },
  {
    id: 3,
    text: "add job",
    path: "add-job",
    icon: <BsFillClipboardPlusFill />,
  },
  {
    id: 4,
    text: "profile",
    path: "profile",
    icon: <BsFillPersonLinesFill />,
  },
];

export default links;

import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  MdHome,
} from "react-icons/md";

import MainDashboard from "views/admin/default";
import DllReport from "views/admin/dllinstance";
import DllDetails from "views/admin/dll";
import Patch from "views/admin/patch";
import CompareDllReport from "views/admin/compare";
import roadmap from "views/admin/roadmap";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    component: MainDashboard,
  },
  {
    name: "DLL Instance",
    layout: "/admin",
    path: "/dllinstance",
    icon: (
      <Icon
        as={MdHome}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: DllReport,
    secondary: true,
  },
  {
    name: "Compare",
    layout: "/admin",
    path: "/dll",
    icon: (
      <Icon
        as={MdHome}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: DllDetails,
    secondary: true,
  },
  {
    name: "Compare",
    layout: "/admin",
    path: "/compare",
    icon: (
      <Icon
        as={MdHome}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: CompareDllReport,
    secondary: true,
  },
  {
    name: "Patch",
    layout: "/admin",
    path: "/patch",
    icon: (
      <Icon
        as={MdHome}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: Patch,
    secondary: true,
  },
  {
    name: "Roadmap",
    layout: "/admin",
    path: "/roadmap",
    icon: (
      <Icon
        as={MdHome}
        width='20px'
        height='20px'
        color='inherit'
      />
    ),
    component: roadmap,
    secondary: true,
  },
];

export default routes;

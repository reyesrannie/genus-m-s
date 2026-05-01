import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import React, { useEffect, useRef } from "react";

import "../styles/MobileNavigation.scss";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import SystemNavigation from "../../services/constant/SystemNavigation";
import {
  setHiddenNavigation,
  setIsButtomNavActivate,
} from "../../services/server/slice/drawerSlice";
import { filterNavigationByAccess } from "../../services/constant/checkValue";

const MobileNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const location = useLocation();
  const { navigation } = SystemNavigation();

  const fileredNavigation = filterNavigationByAccess(
    navigation,
    userData?.role?.access_permission,
  );

  const paperRef = useRef(null);

  const currentPath = location?.pathname.split("/").slice(1)[0];

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, overflow: "auto", width: "100%" }}
      ref={paperRef}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={`/${currentPath}`}
        sx={{
          width: "100%",
          justifyContent: "start",
          m: 1,
        }}
      >
        {fileredNavigation?.map((route, index) => (
          <BottomNavigationAction
            key={route.route || index}
            label={route.route === `/${currentPath}` ? route.title : ""}
            icon={route.icon}
            value={route.route}
            onClick={() => {
              navigate(route?.route);
              dispatch(setIsButtomNavActivate(false));
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation;

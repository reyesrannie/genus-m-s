import { Box, Divider, Stack, Typography, useMediaQuery } from "@mui/material";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import React from "react";
import { useSelector } from "react-redux";

const OrderStatusChanger = ({ onStatusChange, params, header = [] }) => {
  const mode = useSelector((state) => state.theme.mode);
  const isLaptop = useMediaQuery("(min-width:1024px)");

  return (
    <Box width={"fit-content"}>
      <Stack
        flexDirection={isLaptop ? "row" : "column"}
        overflow={"hidden"}
        borderRadius={1}
        display={isLaptop ? "flex" : "grid"}
        gap={isLaptop ? 0 : 1}
        gridTemplateColumns={!isLaptop ? "repeat(2, minmax(50px, 1fr))" : "1fr"}
      >
        {header?.map((item, i) => {
          return (
            <Box
              key={i}
              backgroundColor={
                params?.status === item?.value
                  ? "background.paper"
                  : mode === "dark"
                    ? "background.paper"
                    : "white"
              }
              padding={1}
              sx={{
                cursor:
                  params?.status === item?.value ? "not-allowed" : "pointer",
              }}
              onClick={() => {
                onStatusChange(item?.value);
              }}
            >
              <Stack
                flexDirection="row"
                gap={1}
                sx={{
                  opacity: params?.status === item?.value ? 1 : 0.2,
                }}
              >
                <CheckCircleOutlineOutlinedIcon
                  sx={{
                    color:
                      params?.status === item?.value ? "#299826" : "#000000",
                    fontSize: "14px",
                  }}
                />
                <Typography
                  fontSize={"12px"}
                  color={
                    params?.status === item?.value ? "textPrimary" : "#000000"
                  }
                >
                  {item.label}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default OrderStatusChanger;

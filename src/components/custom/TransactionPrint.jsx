import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetModal } from "../../services/server/slice/modalSlice";
import { useReactToPrint } from "react-to-print";
import logoRdf from "../../assets/logoRdf.png";

import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined";
import CloseIcon from "@mui/icons-material/Close";

import TableGrid from "./TableGrid";
import dayjs from "dayjs";

const TransactionPrint = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userData);
  const access = user?.role?.access_permission?.map((item) => item?.trim());
  const printableModal = useSelector((state) => state.modal.printableModal);
  const ordering = useSelector((state) => state.modal.ordering);
  const mapOrder = { data: ordering?.order };
  const contentRef = useRef();

  const header = [
    { name: "No.", type: "index" },
    {
      name: "Item",
      type: "order-print",

      children: [
        {
          value: "material",
          child: "name",
          orderBy: 1,
        },
        {
          value: "material",
          child: "code",
          orderBy: 2,
        },

        {
          value: "uom",
          child: "code",
          orderBy: 3,
        },
      ],
    },
    { name: "Qty.", value: "quantity" },
    { name: "Qty. Served", value: "quantity_serve", type: "qty" },
    {
      name: "Account Title",
      value: "account_title",
      child: "name",
      type: "parent",
    },
    {
      name: "Asset Tag",
      value: "asset",
      child: "tag_number",
      type: "parent",
    },

    { name: "Remarks", value: "remarks" },
  ];

  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <Dialog
      open={printableModal}
      onClose={() => dispatch(resetModal())}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "unset",
          width: "800px",
        },
      }}
    >
      <DialogContent ref={contentRef}>
        <Stack position={"absolute"} top={0} right={2}>
          <IconButton onClick={() => dispatch(resetModal())}>
            <CloseIcon
              sx={{
                fontSize: "20px",
                "@media print": {
                  display: "none",
                },
              }}
            />
          </IconButton>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mb={2}>
          <Stack>
            <img
              src={logoRdf}
              style={{
                width: "100px",
              }}
            />
          </Stack>
          <Stack>
            <Typography
              fontSize={"16px"}
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
              }}
            >
              Material Issuance Request
            </Typography>
            <Typography fontSize={"10px"}>
              {`MIR No: ${ordering?.id}`}
            </Typography>
          </Stack>
        </Stack>
        <Stack flexDirection={"row"} justifyContent={"space-between"} mb={2}>
          <Stack gap={0.3}>
            <Stack flexDirection={"row"} gap={0.5}>
              <Typography
                fontSize={"12px"}
                fontWeight={700}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                Requested By:
              </Typography>
              <Typography
                fontSize={"12px"}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                {ordering?.requestor?.name?.toLowerCase()}
              </Typography>
            </Stack>

            {ordering?.updated_by !== null && (
              <Stack flexDirection={"row"} gap={0.5} alignItems={"center"}>
                <Typography fontSize={"12px"} fontWeight={700}>
                  Updated By:
                </Typography>
                <Typography
                  fontSize={"12px"}
                  sx={{
                    textTransform: "capitalize",
                  }}
                  color="warning"
                >
                  {ordering?.updated_by?.toLowerCase()}
                </Typography>
              </Stack>
            )}

            <Stack flexDirection={"row"} gap={0.5} alignItems={"center"}>
              <Typography fontSize={"12px"} fontWeight={700}>
                Status:
              </Typography>
              <Typography
                fontSize={"12px"}
                sx={{
                  color:
                    {
                      approved: "#065F46",
                      served: "#1E40AF",
                    }[ordering?.status?.toLowerCase()] || "#A0A0A0",
                  textTransform: "capitalize",
                }}
              >
                {ordering?.status?.toLowerCase()}
              </Typography>
            </Stack>

            <Stack>
              <Typography
                fontSize={"12px"}
                fontWeight={700}
                sx={{
                  textTransform: "capitalize",
                }}
              >
                Date information
              </Typography>
              <Stack flexDirection={"row"} gap={0.5}>
                <Typography fontSize={"8px"}>Ordered at</Typography>
                <Typography fontSize={"8px"} fontWeight={700}>
                  {dayjs(ordering?.date_orderd).format("MMMM DD, YYYY")}
                </Typography>
              </Stack>
              <Stack flexDirection={"row"} gap={0.5}>
                <Typography fontSize={"8px"}>Needed on</Typography>
                <Typography fontSize={"8px"} fontWeight={700}>
                  {dayjs(ordering?.date_needed).format("MMMM DD, YYYY")}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            bgcolor={"#F4F6F8"}
            flexDirection={"row"}
            gap={1}
            padding={1}
            borderRadius={2}
          >
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                backgroundColor: "#3F51B5",
                width: "12px",
                ml: 1,
              }}
            />
            <Stack
              sx={{
                minWidth: "300px",
              }}
            >
              <Typography fontSize={"14px"} fontWeight={700} color="#1F2937">
                Charging
              </Typography>
              <Typography
                fontSize={"10px"}
                fontWeight={700}
                color="#111827"
              >{`${ordering?.charging?.code} - ${ordering?.charging?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Company: ${ordering?.company?.code} - ${ordering?.company?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Business Unit: ${ordering?.business_unit?.code} - ${ordering?.business_unit?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Department: ${ordering?.department?.code} - ${ordering?.department?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Unit: ${ordering?.department_unit?.code} - ${ordering?.department_unit?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Sub Unit: ${ordering?.sub_unit?.code} - ${ordering?.sub_unit?.name}`}</Typography>
              <Typography
                fontSize={"8px"}
                color="#4B5563"
              >{`Location: ${ordering?.location?.code} - ${ordering?.location?.name}`}</Typography>
            </Stack>
          </Stack>
        </Stack>

        <TableGrid header={header} items={mapOrder} />
        <Typography fontSize={"10px"} fontWeight={700}>
          MIS-FRM-19-2001
        </Typography>
      </DialogContent>
      {access?.includes("printing") && (
        <DialogActions
          sx={{
            "@media print": {
              display: "none",
            },
          }}
        >
          <Button
            color="info"
            startIcon={<LocalPrintshopOutlinedIcon />}
            onClick={reactToPrintFn}
          >
            Print
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TransactionPrint;

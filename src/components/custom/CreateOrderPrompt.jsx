import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPrompt } from "../../services/server/slice/promptSlice";

import SwapHorizontalCircleOutlinedIcon from "@mui/icons-material/SwapHorizontalCircleOutlined";
import DoDisturbAltOutlinedIcon from "@mui/icons-material/DoDisturbAltOutlined";
import TableGrid from "./TableGrid";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "../../services/server/api/orderingAPI";
import { useSnackbar } from "notistack";
import { resetModal } from "../../services/server/slice/modalSlice";
import { singleError } from "../../services/functions/errorResponse";
import {
  useApproveOrderMutation,
  useRejectOrderMutation,
  useReturnOrderMutation,
} from "../../services/server/api/approverAPI";
import nameOnlySchema from "../schema/nameOnlySchema";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AppTextBox from "./AppTextBox";
import {
  useServeOrderMutation,
  useServeUpdateOrderMutation,
} from "../../services/server/api/orderTakerAPI";

const CreateOrderPrompt = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const create = useSelector((state) => state.prompt.create);
  const update = useSelector((state) => state.prompt.update);
  const approve = useSelector((state) => state.prompt.approve);
  const serve = useSelector((state) => state.prompt.serve);
  const archive = useSelector((state) => state.prompt.archive);
  const reset = useSelector((state) => state.prompt.reset);
  const isNotMatched = useSelector((state) => state.prompt.isNotMatched);

  const payloadData = useSelector((state) => state.prompt.payloadData);
  const ordering = useSelector((state) => state.modal.ordering);

  const mapOrder = { data: payloadData?.order };

  const [createOrder, { isLoading: loadingCreate }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: loadingUpdate }] = useUpdateOrderMutation();
  const [returnOrder, { isLoading: loadingReturn }] = useReturnOrderMutation();
  const [rejectOrder, { isLoading: loadingReject }] = useRejectOrderMutation();
  const [serveOrder, { isLoading: loadingServe }] = useServeOrderMutation();
  const [updateServeOrder, { isLoading: loadingUpdateServe }] =
    useServeUpdateOrderMutation();

  const [approveOrder, { isLoading: loadingApprove }] =
    useApproveOrderMutation();

  const header = [
    { name: "No.", type: "index" },
    { name: "Code", value: "material", child: "code", type: "parent" },
    { name: "Material", value: "material", child: "name", type: "parent" },
    { name: "Uom", value: "uom", child: "code", type: "parent" },
    { name: "Quantity", value: "quantity" },
    {
      name: "Account Title",
      value: "account_title",
      child: "name",
      type: "parent",
    },
    {
      name: "Asset Tag",
      value: "asset",
      child: "tag",
      type: "parent",
    },

    { name: "Remarks", value: "remarks" },
  ];

  const {
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(nameOnlySchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit = async () => {
    try {
      const res =
        ordering === null
          ? await createOrder({ ...payloadData, status: "PENDING" }).unwrap()
          : await updateOrder({ ...payloadData, status: "PENDING" }).unwrap();
      enqueueSnackbar(res?.message, {
        variant: "success",
      });
      dispatch(resetPrompt());
      dispatch(resetModal());
    } catch (error) {
      singleError(error, enqueueSnackbar);
    }
  };

  const handleApproveOrder = async () => {
    const payload = {
      ...payloadData,
    };

    try {
      if (isNotMatched) {
        await updateOrder(payload).unwrap();
      }
      const res = await approveOrder(payload).unwrap();
      enqueueSnackbar(res?.message, { variant: "success" });
      dispatch(resetPrompt());
      dispatch(resetModal());
    } catch (error) {
      singleError(error, enqueueSnackbar);
    }
  };

  const handleResetOrder = async () => {
    const payload = {
      ...payloadData,
      reason: watch("name"),
    };

    if (watch("name") === "") {
      setError("name", {
        type: "validation",
        message: "Remarks is required",
      });
    } else {
      try {
        const res = await returnOrder(payload).unwrap();
        enqueueSnackbar(res?.message, { variant: "success" });
        dispatch(resetPrompt());
        dispatch(resetModal());
      } catch (error) {
        singleError(error, enqueueSnackbar);
      }
    }
  };

  const handleRejectOrder = async () => {
    const payload = {
      ...payloadData,
      reason: watch("name"),
    };

    if (watch("name") === "") {
      setError("name", {
        type: "validation",
        message: "Remarks is required",
      });
    } else {
      try {
        const res = await rejectOrder(payload).unwrap();
        enqueueSnackbar(res?.message, { variant: "success" });
        dispatch(resetPrompt());
        dispatch(resetModal());
      } catch (error) {
        singleError(error, enqueueSnackbar);
      }
    }
  };

  const handleServe = async () => {
    const payload = {
      ...payloadData,
    };
    try {
      if (isNotMatched) {
        await updateServeOrder(payload).unwrap();
      }
      const res = await serveOrder(payload).unwrap();
      enqueueSnackbar(res?.message, { variant: "success" });
      dispatch(resetPrompt());
      dispatch(resetModal());
    } catch (error) {
      singleError(error, enqueueSnackbar);
    }
  };

  return (
    <Dialog
      open={create || update || archive || reset || approve || serve}
      onClose={() => dispatch(resetPrompt())}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "80%",
          borderRadius: 2,
          overflowY: "hidden",
          paddingTop: 2,
        },
      }}
    >
      <DialogContent
        sx={{ minHeight: `${reset || archive ? "400px" : "200px"}` }}
      >
        <Stack gap={1}>
          <Typography fontWeight={700} fontSize={20}>
            {approve && "Approve Order"}
            {create && "Create Order"}
            {update && "Update Order"}
            {reset && "Return Order"}
            {archive && "Archive/Reject Order"}
            {serve && "Serve Order"}
          </Typography>
          <Typography>
            Would you like to {approve && "approve"}
            {create && "create"}
            {update && "update"}
            {reset && "return"}
            {archive && "archive/reject"}
            {serve && "serve"} this order?
          </Typography>
          <TableGrid header={header} items={mapOrder} />
          <Stack>
            <Typography>{`Customer: ${payloadData?.customer?.code} - ${payloadData?.customer?.name}`}</Typography>
            <Typography>{`Date Needed: ${payloadData?.date_needed}`}</Typography>
            <Typography>
              {`Charging: ${payloadData?.charging?.code} - ${payloadData?.charging?.name}`}
            </Typography>
            <Typography>
              {`Company: ${payloadData?.company?.code} - ${payloadData?.company?.name}`}
            </Typography>
            <Typography>
              {`Business Unit: ${payloadData?.business_unit?.code} - ${payloadData?.business_unit?.name}`}
            </Typography>
            <Typography>
              {`Department: ${payloadData?.department?.code} - ${payloadData?.department?.name}`}
            </Typography>
            <Typography>
              {`Unit: ${payloadData?.department_unit?.code} - ${payloadData?.department_unit?.name}`}
            </Typography>
            <Typography>
              {`Sub Unit: ${payloadData?.sub_unit?.code} - ${payloadData?.sub_unit?.name}`}
            </Typography>
            <Typography>
              {`Location: ${payloadData?.location?.code} - ${payloadData?.location?.name}`}
            </Typography>
          </Stack>
          {(reset || archive) && (
            <Stack>
              <AppTextBox
                control={control}
                name="name"
                label="Remarks"
                placeholder="Enter remarks here"
                multiline
                rows={2}
                error={Boolean(errors?.name)}
                helperText={errors?.name?.message}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack
          display="flex"
          flexDirection="row"
          gap={1}
          alignSelf={"flex-end"}
          padding={2}
        >
          <Button
            onClick={() => {
              (create || update) && handleSubmit();
              reset && handleResetOrder();
              archive && handleRejectOrder();
              approve && handleApproveOrder();
              serve && handleServe();
            }}
            className="change-password-button"
            loading={
              loadingCreate ||
              loadingUpdate ||
              loadingApprove ||
              loadingReject ||
              loadingServe ||
              loadingUpdateServe ||
              loadingReturn
            }
            loadingPosition="start"
            startIcon={<SwapHorizontalCircleOutlinedIcon />}
            variant="contained"
            size="small"
            color="success"
          >
            Yes, {approve && "approve"}
            {create && "create"}
            {update && "update"}
            {reset && "return"}
            {archive && "archive"}
            {serve && "serve"} it!
          </Button>
          <Button
            className="change-password-button"
            disabled={
              loadingCreate ||
              loadingUpdate ||
              loadingApprove ||
              loadingReject ||
              loadingServe ||
              loadingUpdateServe ||
              loadingReturn
            }
            onClick={() => {
              dispatch(resetPrompt());
            }}
            loadingPosition="start"
            startIcon={<DoDisturbAltOutlinedIcon />}
            variant="contained"
            size="small"
            color="error"
          >
            No, discard
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderPrompt;

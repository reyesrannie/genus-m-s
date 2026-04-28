import {
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  TextField as MuiTextField,
  IconButton,
  Divider,
  useMediaQuery,
  DialogActions,
  Box,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetModal,
  setHasRun,
  setOrderingMobile,
  setSelectedIndex,
} from "../../services/server/slice/modalSlice";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";

import "../styles/ChangePassword.scss";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import orderingSchema from "../schema/orderingSchema";

import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import CloseIcon from "@mui/icons-material/Close";

import AppTextBox from "../custom/AppTextBox";
import { decodeUser, getCustomer } from "../../services/functions/saveUser";
import Autocomplete from "../custom/AutoComplete";
import dayjs from "dayjs";
import {
  useLazyMaterialsQuery,
  useMaterialsQuery,
} from "../../services/server/api/materialsAPI";
import useParamsHook from "../../services/hooks/useParamsHook";
import EnterRemarks from "../custom/EnterRemarks";

import {
  handleScroll,
  hasOrderChanged,
  hasOrderChangedApprover,
} from "../../services/functions/reusableFunctions";

import {
  mapOrderingData,
  mapOrderingPayload,
} from "../../services/functions/dataMapping";

import { useSnackbar } from "notistack";
import {
  setApprove,
  setArchive,
  setCreate,
  setIsNotMatch,
  setPayloadData,
  setReset,
  setServe,
  setUpdate,
} from "../../services/server/slice/promptSlice";
import CreateOrderPrompt from "../custom/CreateOrderPrompt";
import {
  setAssetData,
  setChargingData,
  setMaterialsData,
} from "../../services/server/slice/valuesSlice";
import {
  useLazyOneChargingQuery,
  useOneChargingQuery,
} from "../../services/server/api/oneChargingAPI";
import useParamsHookOrdering from "../../services/hooks/useParamsHookOrdering";

import warningImg from "../../assets/svg/warning.svg";
import AppPrompt from "../custom/AppPrompt";
import {
  resetPrompt,
  setWarning,
} from "../../services/server/slice/promptSlice";
import {
  cutOffGet,
  disableApprove,
} from "../../services/functions/dateChecker";
import {
  useAssetsQuery,
  useLazyAssetsQuery,
} from "../../services/server/api/assetsAPI";
import { FetchDataFn } from "../../services/functions/FetchDataFn";
import OrderingModalMobile from "./OrderingModalMobile";

const OrderingModal = () => {
  const dispatch = useDispatch();
  const { multipleOrderFetch } = FetchDataFn();

  const [openPicker, setOpenPicker] = useState(false);
  const [openRemarks, setOpenRemarks] = useState(false);

  const debounceTimeout = useRef(null);
  const running = useRef(false);

  const customers = getCustomer();
  const user = decodeUser();

  const access = user?.role?.access_permission?.map((item) => item?.trim());
  const createOrdering = useSelector((state) => state.modal.createOrdering);
  const updateOrdering = useSelector((state) => state.modal.updateOrdering);
  const approveOrdering = useSelector((state) => state.modal.approveOrdering);
  const serveOrdering = useSelector((state) => state.modal.serveOrdering);
  const hasRun = useSelector((state) => state.modal.hasRun);

  const viewOrdering = useSelector((state) => state.modal.viewOrdering);
  const ordering = useSelector((state) => state.modal.ordering);
  const selectedIndex = useSelector((state) => state.modal.selectedIndex);
  const materialsData = useSelector((state) => state.values.materialsData);
  const assetData = useSelector((state) => state.values.assetData);
  const chargingData = useSelector((state) => state.values.chargingData);
  const warning = useSelector((state) => state.prompt.warning);

  // const isLaptop = useMediaQuery("(min-width:1024px)");

  const {
    params: paramsMaterials,
    onSearchData: searchMaterials,
    onSelectPage: onSelectPageMaterials,
    onReset: resetMaterials,
  } = useParamsHookOrdering();

  const {
    params: paramsAssets,
    onSearchData: searchAssets,
    onSelectPage: onSelectPageAssets,
    onReset: resetAssets,
  } = useParamsHookOrdering();

  const { params: paramsCharging, onSearchData: searchCharging } =
    useParamsHook();

  const { data: materials, isError: errorMaterials } =
    useMaterialsQuery(paramsMaterials);

  const [getMaterials, { data: materialsFetch }] = useLazyMaterialsQuery();

  const { data: asset, isError: errorAssets } = useAssetsQuery(paramsAssets);

  const [getAssets, { data: assetFetch }] = useLazyAssetsQuery();

  const { data: charging } = useOneChargingQuery(paramsCharging);
  const [getCharging, { data: chargingFetch }] = useLazyOneChargingQuery();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderingSchema),
    defaultValues: {
      order_no: "",
      cip_no: "",
      helpdesk_no: "",
      rush: "",
      reason: "",
      customer: null,
      charging: null,
      date_needed: null,
      order: [
        {
          id: new Date(),
          material: null,
          category: null,
          uom: null,
          quantity: "",
          account_title: null,
          remarks: "",
          asset: null,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "order",
  });

  const submitHandler = async (submitData) => {
    const items = {
      ...submitData,
      charging: approveOrdering
        ? submitData?.charging
        : chargingData?.find(
            (charge) => charge?.code === submitData?.charging?.charging_code
          ),
    };

    const payload = {
      ...mapOrderingPayload(items),
      id: ordering !== null ? ordering?.id : null,
    };

    dispatch(setPayloadData(payload));
    dispatch(setIsNotMatch(hasOrderChangedApprover(ordering, payload)));

    createOrdering && dispatch(setCreate(true));
    updateOrdering && dispatch(setUpdate(true));
    approveOrdering && dispatch(setApprove(true));
  };

  const handleServe = async () => {
    const payload = {
      ...mapOrderingPayload(getValues()),
      id: ordering !== null ? ordering?.id : null,
    };

    dispatch(setIsNotMatch(hasOrderChangedApprover(ordering, payload)));
    dispatch(setPayloadData(payload));
    dispatch(setServe(true));
  };

  const handleReturn = async () => {
    const payload = {
      ...mapOrderingPayload(getValues()),
      id: ordering !== null ? ordering?.id : null,
    };
    dispatch(setPayloadData(payload));
    dispatch(setReset(true));
  };

  const handleReject = async () => {
    const payload = {
      ...mapOrderingPayload(getValues()),
      id: ordering !== null ? ordering?.id : null,
    };
    dispatch(setPayloadData(payload));
    dispatch(setArchive(true));
  };

  const mapTransaction = () => {
    if (hasRun) return;
    const data = {
      ...mapOrderingData(
        ordering,
        approveOrdering,
        viewOrdering,
        serveOrdering,
        chargingData,
        customers,
        materialsData,
        assetData
      ),
    };

    Object.entries(data).forEach(([key, value]) => {
      setValue(key, value);
    });
    dispatch(setHasRun(true));
  };

  const handleCheckCharging = () => {
    const matchedCustomer = chargingData?.some(
      (item) => item?.code === ordering?.customer?.code
    );
    const matchedCharging = chargingData?.some(
      (item) => item?.code === ordering?.charging?.code
    );

    return matchedCharging && matchedCustomer;
  };

  const handleCheckMaterial = () => {
    const matched = ordering?.order?.every((mats) =>
      materialsData?.some((material) => material?.code === mats?.material?.code)
    );
    return matched;
  };

  const handleCheckAsset = () => {
    const matched = ordering?.order?.every((ass) =>
      assetData?.some((asset) => asset?.asset_tag === ass?.asset?.tag_number)
    );
    return matched;
  };

  const getValue = useCallback(
    (e, func) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        func(e.target.value);
      }, 500);
    },
    [serveOrdering]
  );

  useEffect(() => {
    if (materials?.result?.data) {
      dispatch(setMaterialsData(materials?.result?.data));
    }
    if (materialsFetch?.result?.data) {
      dispatch(setMaterialsData(materialsFetch?.result?.data));
    }
    if (charging?.result?.data) {
      dispatch(setChargingData(charging?.result?.data));
    }
    if (chargingFetch?.result?.data) {
      dispatch(setChargingData(chargingFetch?.result?.data));
    }
    if (asset?.result?.data) {
      dispatch(setAssetData(asset?.result?.data));
    }
    if (assetFetch?.result?.data) {
      dispatch(setAssetData(assetFetch?.result?.data));
    }
  }, [materials, charging, asset, materialsFetch, assetFetch, chargingFetch]);

  useEffect(() => {
    if (ordering !== null) {
      multipleOrderFetch(
        ordering?.order?.map((items) => items?.material?.code),
        handleCheckMaterial,
        getMaterials,
        setMaterialsData,
        running
      );
      multipleOrderFetch(
        ordering?.order?.map((items) => items?.asset?.tag_number || ""),
        handleCheckAsset,
        getAssets,
        setAssetData,
        running
      );
      multipleOrderFetch(
        [ordering?.charging?.code, ordering?.customer?.code],
        handleCheckCharging,
        getCharging,
        setChargingData,
        running
      );
    }
  }, [ordering]);

  useEffect(() => {
    if (
      ordering !== null &&
      handleCheckCharging() &&
      handleCheckMaterial() &&
      chargingData &&
      (viewOrdering ||
        createOrdering ||
        updateOrdering ||
        approveOrdering ||
        serveOrdering)
    ) {
      mapTransaction();
    }
  }, [
    ordering,
    viewOrdering,
    createOrdering,
    updateOrdering,
    approveOrdering,
    serveOrdering,
    chargingData,
  ]);

  useEffect(() => {
    if (ordering === null) {
      reset();
      setValue(
        "customer",
        customers?.find((cust) => cust.charging_code === user?.charging?.code)
      );
    }
  }, [ordering, createOrdering, serveOrdering, approveOrdering]);

  useEffect(() => {
    if (customers?.length === 1 && !hasRun && createOrdering) {
      setValue("charging", customers[0]);

      getCharging({
        status: "active",
        search: customers[0]?.charging_code,
      });

      dispatch(setHasRun(true));
    }
  }, [customers, hasRun, createOrdering]);

  return (
    <Dialog
      open={
        viewOrdering ||
        createOrdering ||
        updateOrdering ||
        approveOrdering ||
        serveOrdering
      }
      onClose={() => {
        dispatch(setHasRun(false));
        viewOrdering && reset();
        !viewOrdering && dispatch(setWarning(true));
        viewOrdering && dispatch(resetModal());
      }}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "80%",
          borderRadius: 2,
          // overflow: isLaptop ? "hidden" : "auto",
          overflowY: "hidden",
          paddingTop: 2,
        },
      }}
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogContent>
          <Stack position={"absolute"} top={0} right={2}>
            <IconButton onClick={() => dispatch(setWarning(true))}>
              <CloseIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          </Stack>
          <Stack
            gap={1}
            sx={{
              overflow: "hidden",
            }}
          >
            <Divider orientation="horizontal" />

            <Stack
              // display={isLaptop ? "grid" : "flex"}
              display={"grid"}
              // gridTemplateColumns={
              //   isLaptop ? "repeat(3, minmax(250px, 1fr))" : ""
              // }
              gridTemplateColumns={"repeat(3, minmax(250px, 1fr))"}
              columnGap={2}
              gap={1}
            >
              <AppTextBox
                disabled={approveOrdering || viewOrdering || serveOrdering}
                control={control}
                name="order_no"
                label="Order No."
                error={Boolean(errors?.order_no)}
                helperText={errors?.order_no?.message}
              />
              {/* {isLaptop && ( */}
              <Autocomplete
                disabled
                control={control}
                name={"customer"}
                options={
                  approveOrdering || viewOrdering || serveOrdering
                    ? chargingData
                    : customers || []
                }
                getOptionLabel={(option) => {
                  const optName =
                    approveOrdering || viewOrdering || serveOrdering
                      ? option?.name
                      : option?.charging_name;
                  const optCode =
                    approveOrdering || viewOrdering || serveOrdering
                      ? option?.code
                      : option?.charging_code;

                  return `${optCode} - ${optName}`;
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Customer"
                    size="small"
                    variant="outlined"
                    error={Boolean(errors.customer)}
                    helperText={errors.customer?.message}
                  />
                )}
              />
              {/* )} */}
              <Autocomplete
                disabled={viewOrdering}
                control={control}
                name={"charging"}
                options={
                  approveOrdering || viewOrdering || serveOrdering
                    ? chargingData
                    : customers || []
                }
                getOptionLabel={(option) => {
                  const optName =
                    approveOrdering || viewOrdering || serveOrdering
                      ? option?.name
                      : option?.charging_name;
                  const optCode =
                    approveOrdering || viewOrdering || serveOrdering
                      ? option?.code
                      : option?.charging_code;

                  return `${optCode} - ${optName}`;
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                onClose={() => {
                  getCharging({
                    status: "active",
                    search: watch("charging")?.charging_name,
                  });
                }}
                onKeyUp={(e) => {
                  if (e?.target?.value === "") {
                  } else {
                    getValue(e, getCharging);
                  }
                }}
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Charging"
                    size="small"
                    variant="outlined"
                    error={Boolean(errors.charging)}
                    helperText={errors.charging?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="date_needed"
                render={({ field }) => (
                  <MobileDatePicker
                    disabled={viewOrdering || serveOrdering}
                    open={openPicker}
                    onOpen={() => setOpenPicker(true)}
                    onClose={() => setOpenPicker(false)}
                    minDate={cutOffGet()}
                    maxDate={dayjs().add(1, "year")}
                    label="Date Needed"
                    value={field.value}
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        size: "small",
                        InputProps: {
                          style: {
                            fontSize: "12px",
                            paddingTop: "3px",
                            paddingBottom: "3px",

                            borderRadius: "6px",
                          },
                        },
                        onClick: () =>
                          !approveOrdering &&
                          !viewOrdering &&
                          setOpenPicker(true),
                        error: Boolean(errors?.date_needed),
                        helperText: errors?.date_needed?.message,
                      },
                    }}
                  />
                )}
              />
              <AppTextBox
                disabled={viewOrdering || serveOrdering}
                control={control}
                name="helpdesk_no"
                label="Helpdesk No."
                error={Boolean(errors?.helpdesk_no)}
                helperText={errors?.helpdesk_no?.message}
              />
              <AppTextBox
                disabled={viewOrdering || serveOrdering}
                control={control}
                name="cip_no"
                label="Cip No."
                error={Boolean(errors?.cip_no)}
                helperText={errors?.cip_no?.message}
              />
            </Stack>
            {/* {isLaptop ? ( */}
            <Stack
              sx={{
                border: "1px solid #A0A0A0",
                display: "flex",
                flexDirection: "column",
                minHeight: "400px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: 2,
                bgcolor: "#F5F5F5",
              }}
            >
              <Typography fontWeight={700}>Cart</Typography>
              {fields.map((item, index) => {
                return (
                  <Stack key={item?.id} gap={1}>
                    <Stack
                      paddingLeft={1}
                      gap={1}
                      flexDirection="row"
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Autocomplete
                        disabled={viewOrdering}
                        control={control}
                        name={`order.${index}.material`}
                        options={materialsData || []}
                        getOptionLabel={(option) =>
                          `${option?.code} - ${option?.name}`
                        }
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                        getOptionDisabled={(option) => {
                          return watch("order")?.some(
                            (order) => order.material?.id === option.id
                          );
                        }}
                        scrollChange={(e) =>
                          handleScroll(e, () =>
                            onSelectPageMaterials(paramsMaterials?.page + 1)
                          )
                        }
                        onKeyUp={(e) => {
                          if (e?.target?.value === "") {
                            resetMaterials();
                          } else {
                            getValue(e, searchMaterials);
                          }
                        }}
                        noOptionsText={
                          errorMaterials
                            ? "No materials found"
                            : "Searching materials..."
                        }
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            sx={{
                              minWidth: "300px",
                            }}
                            size="small"
                            label="Material"
                            variant="filled"
                            error={
                              Boolean(errors.order?.[index]?.material) ||
                              Boolean(errors.order?.[index]?.material?.code)
                            }
                            helperText={
                              errors.order?.[index]?.material?.message ||
                              errors.order?.[index]?.material?.code?.message
                            }
                          />
                        )}
                      />
                      <Autocomplete
                        disabled={viewOrdering}
                        control={control}
                        name={`order.${index}.account_title`}
                        options={
                          watch(`order.${index}.material`)?.account_title || []
                        }
                        getOptionLabel={(option) =>
                          `${option?.account_title.code} - ${option?.account_title?.name}`
                        }
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            sx={{
                              minWidth: "300px",
                            }}
                            size="small"
                            label="Account Title"
                            variant="filled"
                            error={
                              Boolean(errors.order?.[index]?.account_title) ||
                              Boolean(
                                errors.order?.[index]?.account_title?.code
                              )
                            }
                            helperText={
                              errors.order?.[index]?.account_title?.message ||
                              errors.order?.[index]?.account_title?.code
                                ?.message
                            }
                          />
                        )}
                      />
                      <Autocomplete
                        disabled={viewOrdering || serveOrdering}
                        control={control}
                        name={`order.${index}.asset`}
                        options={assetData || []}
                        getOptionLabel={(option) =>
                          `${option?.asset_tag} - ${option?.description}`
                        }
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id
                        }
                        scrollChange={(e) =>
                          handleScroll(e, () =>
                            onSelectPageAssets(paramsAssets?.page + 1)
                          )
                        }
                        onKeyUp={(e) => {
                          if (e?.target?.value === "") {
                            resetAssets();
                          } else {
                            getValue(e, searchAssets);
                          }
                        }}
                        noOptionsText={
                          errorAssets ? "No asset found" : "Searching assets..."
                        }
                        renderInput={(params) => (
                          <MuiTextField
                            {...params}
                            size="small"
                            sx={{
                              minWidth: "250px",
                            }}
                            label="Asset"
                            variant="filled"
                            error={
                              Boolean(errors.order?.[index]?.asset) ||
                              Boolean(errors.order?.[index]?.asset?.code)
                            }
                            helperText={
                              errors.order?.[index]?.asset?.message ||
                              errors.order?.[index]?.asset?.code?.message
                            }
                          />
                        )}
                      />
                      <AppTextBox
                        disabled={viewOrdering || serveOrdering}
                        control={control}
                        name={`order.${index}.quantity`}
                        size="small"
                        variant="filled"
                        label="Quantity"
                        sx={{
                          minWidth: "100px",

                          "& .MuiFilledInput-input": {
                            fontSize: "12px",
                          },
                        }}
                        endIcon={
                          <Typography>
                            {watch(`order.${index}.material`)?.uom?.code}
                          </Typography>
                        }
                        error={Boolean(errors.order?.[index]?.quantity)}
                        helperText={errors.order?.[index]?.quantity?.message}
                      />
                      <AppTextBox
                        control={control}
                        name={`order.${index}.remarks`}
                        size="small"
                        variant="filled"
                        sx={{
                          minWidth: "100px",

                          "& .MuiFilledInput-root": {
                            backgroundColor: "#0000001f",
                          },
                          "& .MuiFilledInput-input": {
                            fontSize: "12px",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            cursor: "pointer",
                          },
                        }}
                        label="Remarks"
                        onClick={() => {
                          dispatch(setSelectedIndex(index));
                          setOpenRemarks(true);
                        }}
                        inputProps={{
                          readOnly: true,
                        }}
                        error={Boolean(errors.order?.[index]?.remarks)}
                        helperText={errors.order?.[index]?.remarks?.message}
                      />
                      {(createOrdering || updateOrdering) && (
                        <IconButton
                          disabled={watch("order")?.length === 1}
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <RemoveCircleOutlineOutlinedIcon
                            color={
                              watch("order")?.length === 1
                                ? "disabled"
                                : `error`
                            }
                          />
                        </IconButton>
                      )}
                    </Stack>
                    <Divider
                      orientation="horizontal"
                      sx={{
                        borderColor: "#A0A0A0",
                        marginBottom: 1.5,
                      }}
                    />
                  </Stack>
                );
              })}
              {(createOrdering || updateOrdering) && (
                <Button
                  variant="contained"
                  onClick={() => {
                    append({
                      id: new Date(),
                    });
                  }}
                >
                  Add Order
                </Button>
              )}
            </Stack>
            {/* ) : (
              (createOrdering || updateOrdering) && (
                <Stack>
                  {fields?.map((item, index) => {
                    return <Box key={index}>1</Box>;
                  })}
                  <Button
                    variant="contained"
                    onClick={() => {
                      dispatch(setOrderingMobile(true));
                    }}
                  >
                    Add Order
                  </Button>
                </Stack>
              )
            )} */}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack padding={1}>
            {(createOrdering || updateOrdering) && (
              <Stack flexDirection={"row"} gap={1} alignItems="center">
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  disabled={
                    fields.length === 0 ||
                    watch("order_no") === "" ||
                    watch("customer") === null ||
                    watch("charging") === null ||
                    watch("date_needed") === null
                  }
                  startIcon={<ShoppingCartCheckoutOutlinedIcon />}
                  size="small"
                  sx={{
                    textTransform: "uppercase",
                  }}
                >
                  Check out
                </Button>
                {updateOrdering && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverOutlinedIcon />}
                    size="small"
                    sx={{
                      textTransform: "uppercase",
                    }}
                    onClick={() => {
                      handleReject();
                    }}
                  >
                    Archive
                  </Button>
                )}
              </Stack>
            )}

            {approveOrdering && (
              <Stack flexDirection={"row"} gap={2} alignItems="center">
                <Button
                  disabled={disableApprove(watch("date_needed"))}
                  variant="contained"
                  color="success"
                  type="submit"
                  startIcon={<ThumbUpOutlinedIcon />}
                  size="small"
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<UpdateOutlinedIcon />}
                  size="small"
                  onClick={() => {
                    handleReturn();
                  }}
                >
                  Return
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RemoveCircleOutlineOutlinedIcon />}
                  size="small"
                  onClick={() => {
                    handleReject();
                  }}
                >
                  Reject
                </Button>
              </Stack>
            )}

            {serveOrdering && (
              <Stack flexDirection={"row"} gap={2} alignItems="center">
                {access?.includes("order_taker") && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUpOutlinedIcon />}
                    size="small"
                    onClick={() => {
                      handleServe();
                    }}
                  >
                    Done
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </DialogActions>
      </form>

      <EnterRemarks
        currentValue={watch(`order.${selectedIndex}.remarks`)}
        open={openRemarks}
        submitData={(e) => {
          setValue(`order.${selectedIndex}.remarks`, e);
        }}
        setOpen={setOpenRemarks}
      />

      <CreateOrderPrompt />
      <OrderingModalMobile append={append} remove={remove} fields={fields} />

      <AppPrompt
        open={warning}
        image={warningImg}
        title={`Warning`}
        message={`All changes that have not been saved will be discarded upon closing.`}
        confirmButton={`Yes, Close it!`}
        cancelButton={`No, Keep it! `}
        confirmOnClick={() => {
          dispatch(resetPrompt());
          reset();
          dispatch(resetModal());
        }}
      />
    </Dialog>
  );
};

export default OrderingModal;

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

import "../styles/ChangePassword.scss";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { decodeUser, getCustomer } from "../../services/functions/saveUser";

import {
  useLazyMaterialsQuery,
  useMaterialsQuery,
} from "../../services/server/api/materialsAPI";

import useParamsHookOrdering from "../../services/hooks/useParamsHookOrdering";

import {
  useAssetsQuery,
  useLazyAssetsQuery,
} from "../../services/server/api/assetsAPI";
import {
  setOrderingMobile,
  setOrderingMobileData,
} from "../../services/server/slice/modalSlice";
import Autocomplete from "../custom/AutoComplete";
import { handleScroll } from "../../services/functions/reusableFunctions";
import {
  setAssetData,
  setMaterialsData,
} from "../../services/server/slice/valuesSlice";
import AppTextBox from "../custom/AppTextBox";
import { enqueueSnackbar } from "notistack";

const OrderingModalMobile = ({ append, remove, fields }) => {
  const dispatch = useDispatch();

  const debounceTimeout = useRef(null);
  const running = useRef(false);

  const user = decodeUser();

  const access = user?.role?.access_permission?.map((item) => item?.trim());
  const orderingMobile = useSelector((state) => state.modal.orderingMobile);
  const orderingMobileData = useSelector(
    (state) => state.modal.orderingMobileData
  );

  const serveOrdering = useSelector((state) => state.modal.serveOrdering);
  const hasRun = useSelector((state) => state.modal.hasRun);

  const materialsData = useSelector((state) => state.values.materialsData);
  const assetData = useSelector((state) => state.values.assetData);
  const isLaptop = useMediaQuery("(min-width:1024px)");

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

  const { data: materials, isError: errorMaterials } =
    useMaterialsQuery(paramsMaterials);

  const [getMaterials, { data: materialsFetch }] = useLazyMaterialsQuery();

  const { data: asset, isError: errorAssets } = useAssetsQuery(paramsAssets);

  const [getAssets, { data: assetFetch }] = useLazyAssetsQuery();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id: new Date(),
      material: null,
      category: null,
      uom: null,
      quantity: "",
      account_title: null,
      remarks: "",
      asset: null,
    },
  });

  useEffect(() => {
    if (materials?.result?.data) {
      dispatch(setMaterialsData(materials?.result?.data));
    }
    if (materialsFetch?.result?.data) {
      dispatch(setMaterialsData(materialsFetch?.result?.data));
    }

    if (asset?.result?.data) {
      dispatch(setAssetData(asset?.result?.data));
    }
    if (assetFetch?.result?.data) {
      dispatch(setAssetData(assetFetch?.result?.data));
    }
  }, [materials, asset, materialsFetch, assetFetch]);

  const submitHandler = async (submitData) => {
    try {
      const payload = {
        material: {
          id: submitData?.material?.id,
          code: submitData?.material?.code,
          name: submitData?.material?.name,
        },
        category: {
          id: submitData?.material?.category?.id,
          name: submitData?.material?.category?.name,
        },
        uom: {
          id: submitData?.material?.uom?.id,
          code: submitData?.material?.uom?.code,
          description: submitData?.material?.uom?.description,
        },
        account_title: {
          id: submitData?.account_title?.account_title?.id,
          code: submitData?.account_title?.account_title?.code,
          name: submitData?.account_title?.account_title?.name,
        },
        asset: {
          tag: submitData?.asset?.asset_tag || "",
          name: submitData?.asset?.description || "",
        },
        quantity: submitData?.quantity,
        remarks: submitData?.remarks || "",
      };

      append({ ...payload, id: submitData?.id });

      dispatch(setOrderingMobile(false));
      dispatch(setOrderingMobileData(null));
    } catch (error) {
      console.log(error);
      enqueueSnackbar("something went wrong...", { variant: "error" });
    }
  };

  const getValue = useCallback(
    (e, func) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        const payload = {
          status: "active",
          search: e?.target?.value,
        };
        serveOrdering ? func(payload) : func(e.target.value);
      }, 500);
    },
    [serveOrdering]
  );

  return (
    <Dialog
      open={orderingMobile}
      onClose={() => {
        dispatch(setOrderingMobileData(null));
        reset();
        dispatch(setOrderingMobile(false));
      }}
    >
      <form>
        <DialogContent>
          <Stack gap={1}>
            <Autocomplete
              control={control}
              name={`material`}
              options={materialsData || []}
              getOptionLabel={(option) => `${option?.code} - ${option?.name}`}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
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
                errorMaterials ? "No materials found" : "Searching materials..."
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    minWidth: "300px",
                  }}
                  size="small"
                  label="Material"
                  error={
                    Boolean(errors?.material) || Boolean(errors?.material?.code)
                  }
                  helperText={
                    errors?.material?.message || errors?.material?.code?.message
                  }
                />
              )}
            />
            <Autocomplete
              control={control}
              name={`account_title`}
              options={watch(`material`)?.account_title || []}
              getOptionLabel={(option) =>
                `${option?.account_title.code} - ${option?.account_title?.name}`
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{
                    minWidth: "300px",
                  }}
                  size="small"
                  label="Account Title"
                  error={
                    Boolean(errors?.account_title) ||
                    Boolean(errors?.account_title?.code)
                  }
                  helperText={
                    errors?.account_title?.message ||
                    errors?.account_title?.code?.message
                  }
                />
              )}
            />
            <Autocomplete
              control={control}
              name={`asset`}
              options={assetData || []}
              getOptionLabel={(option) =>
                `${option?.asset_tag} - ${option?.description}`
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
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
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    minWidth: "250px",
                  }}
                  label="Asset"
                  error={Boolean(errors?.asset) || Boolean(errors?.asset?.code)}
                  helperText={
                    errors?.asset?.message || errors?.asset?.code?.message
                  }
                />
              )}
            />
            <AppTextBox
              control={control}
              name={`quantity`}
              size="small"
              label="Quantity"
              type="number"
              sx={{
                minWidth: "100px",
                "& .MuiFilledInput-input": {
                  fontSize: "12px",
                },
              }}
              endIcon={<Typography>{watch(`material`)?.uom?.code}</Typography>}
              error={Boolean(errors?.quantity)}
              helperText={errors?.quantity?.message}
            />
            <AppTextBox
              control={control}
              name={`remarks`}
              size="small"
              multiline
              sx={{
                minWidth: "100px",
                "& .MuiFilledInput-input": {
                  fontSize: "12px",
                },
              }}
              label="Remarks"
              error={Boolean(errors?.remarks)}
              helperText={errors?.remarks?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={
              watch("material") === null ||
              watch("account_title") === null ||
              watch("quantity") === ""
            }
            variant="contained"
            size="small"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => {
              handleSubmit(submitHandler)();
            }}
          >
            Add to cart
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderingModalMobile;

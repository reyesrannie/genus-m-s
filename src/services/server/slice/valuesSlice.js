import { createSlice } from "@reduxjs/toolkit";
import { mergeUniqueByKey } from "../../functions/reusableFunctions";

const initialState = {
  chargingData: [],
  rolesData: [],
  categoryData: [],
  uomData: [],
  warehouseData: [],
  accountTitleData: [],
  userData: [],
  assetData: [],
  materialsData: [],
};

const valuesSlice = createSlice({
  name: "values",
  initialState,
  reducers: {
    setChargingData: (state, action) => {
      state.chargingData = mergeUniqueByKey(
        state.chargingData,
        action.payload,
        "code"
      );
    },
    setRolesData: (state, action) => {
      state.rolesData = mergeUniqueByKey(state.rolesData, action.payload, "id");
    },
    setCategoryData: (state, action) => {
      state.categoryData = mergeUniqueByKey(
        state.categoryData,
        action.payload,
        "id"
      );
    },
    setUomData: (state, action) => {
      state.uomData = mergeUniqueByKey(state.uomData, action.payload, "id");
    },
    setWarehouseData: (state, action) => {
      state.warehouseData = mergeUniqueByKey(
        state.warehouseData,
        action.payload,
        "id"
      );
    },
    setAccountTitleData: (state, action) => {
      state.accountTitleData = mergeUniqueByKey(
        state.accountTitleData,
        action.payload,
        "id"
      );
    },
    setUserData: (state, action) => {
      state.userData = mergeUniqueByKey(state.userData, action.payload, "id");
    },
    setAssetData: (state, action) => {
      state.assetData = mergeUniqueByKey(state.assetData, action.payload, "id");
    },
    setMaterialsData: (state, action) => {
      state.materialsData = mergeUniqueByKey(
        state.materialsData,
        action.payload,
        "id"
      );
    },

    resetValues: () => {
      return initialState;
    },
  },
});

export const {
  resetValues,
  setChargingData,
  setCategoryData,
  setUomData,
  setRolesData,
  setWarehouseData,
  setAccountTitleData,
  setUserData,
  setAssetData,
  setMaterialsData,
} = valuesSlice.actions;

export default valuesSlice.reducer;

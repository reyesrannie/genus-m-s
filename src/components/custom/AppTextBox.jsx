import React, { useState } from "react";

import { Controller } from "react-hook-form";
import { IconButton, TextField } from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined";
import InputAdornment from "@mui/material/InputAdornment";

const AppTextBox = ({
  control,
  name,
  icon,
  endIcon,
  handleRemove,
  remove,
  secure,
  ...textField
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const { ref, value, onChange } = field;
        return (
          <TextField
            {...textField}
            inputRef={ref}
            onKeyDown={(e) => {
              if (e?.key === "Enter") {
                e.preventDefault();
              }
            }}
            size="small"
            value={value}
            onChange={onChange}
            type={showPassword ? "text" : textField?.type}
            InputProps={{
              startAdornment: icon && (
                <InputAdornment position="start">{icon}</InputAdornment>
              ),
              endAdornment: secure ? (
                <InputAdornment position="end">
                  {remove ? (
                    <IconButton onClick={handleRemove} edge="end">
                      <DoNotDisturbOnOutlinedIcon color="error" />
                    </IconButton>
                  ) : (
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </InputAdornment>
              ) : (
                <InputAdornment position="end">{endIcon}</InputAdornment>
              ),
              autoComplete: "off",
            }}
          />
        );
      }}
    />
  );
};

export default AppTextBox;

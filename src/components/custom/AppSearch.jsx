import { Box, IconButton, InputBase } from "@mui/material";
import React, { useCallback, useRef, useState } from "react";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "../styles/AppSearch.scss";

const AppSearch = ({ onSearch }) => {
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);

  const getValue = useCallback((e) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onSearch(e.target.value);
    }, 500);
  }, []);

  return (
    <Box
      display={"flex"}
      bgcolor={"background.paper"}
      alignItems={"center"}
      borderRadius={1}
      maxWidth={180}
    >
      <IconButton>
        <SearchOutlinedIcon sx={{ fontSize: "16px" }} />
      </IconButton>

      <InputBase
        inputRef={inputRef}
        onKeyUp={(e) => {
          if (e?.target?.value === "") {
            onSearch("");
          } else {
            getValue(e);
          }
        }}
        placeholder="Search..."
        size="small"
        sx={{
          "& input": {
            fontSize: "14px",
          },
          "& input::placeholder": {
            fontSize: "12px",
          },
        }}
      />
    </Box>
  );
};

export default AppSearch;

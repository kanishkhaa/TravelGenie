import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";

function SearchBar({ value, onChange, onSearch }) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSearch();
        }
      }}
      placeholder="Search destinations, states or districts..."
      variant="outlined"
      size="medium"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          backgroundColor: "#fff",
          height: "58px",
        },
      }}
    />
  );
}

export default SearchBar;
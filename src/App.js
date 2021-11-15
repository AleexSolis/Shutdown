import { useState } from "react";
import moment from "moment";
import {
  Box,
  Button,
  Container,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import { TimePicker, ConfirmDialog } from "./components";
import "./App.css";

const { exec } = window.require("child_process");
const os = window.require("os");

function App() {
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [alert, setAlert] = useState(undefined);
  const [alertInfo, setAlertInfo] = useState(false);

  const onChange = (time) => {
    setTime(time);
  };

  const confirmShutdown = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setOpenCancel(false);
  };

  const onConfirm = () => {
    let command;
    if (os.platform() === 'win32' || os.platform() === 'Windows_NT'){
      command = `shutdown -s -t ${moment(time).diff(new Date(), "s")}`;
    } else {
      command = `sudo shutdown -h ${moment(time).format("HH:mm")}`;
    }
    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        setAlert({
          severity: "error",
          description:
            "Error when trying to program the shutdown of your computer.",
        });
        setAlertInfo(false);
      }
    });
    setAlert({
      severity: "success",
      description: `Your computer will be shutdown at ${moment(time).format(
        "LT"
      )}.`,
    });

    onClose();
    setAlertInfo(true);
  };

  const onConfirmCancel = () => {
    let command;
    if (os.platform() === 'win32' || os.platform() === 'Windows_NT'){
      command = `shutdown -a`;
    } else {
      command = "sudo killall shutdown";
    }
    exec(command, (error, stdout, stderr) => {
      console.log(error);
      console.log(stderr);
      if (error || stderr) {
        setAlert({
          severity: "error",
          title: "Error",
          description:
            "Error when trying to program the shutdown of your computer.",
        });
      }

      onClose();
      setAlertInfo(false);
      setAlert(undefined);
    });
  };

  return (
    <Container maxWidth="sm">
      {alertInfo && <Alert
        severity="info"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onConfirmCancel}
          >
            <BlockIcon fontSize="inherit" />
          </IconButton>
        }
      >
        This computer is scheduled to shut down.
      </Alert>}
      {alert && (
        <Alert
          severity={alert.severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setAlert(undefined);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alert.description}
        </Alert>
      )}
      <Box>
        <TimePicker value={time} onChange={onChange} />
      </Box>
      <Box style={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" onClick={confirmShutdown}>
          Schedule
        </Button>
      </Box>
      <ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Confirm Shutdown"
        description={`You are sure you want your computer to shut down at ${moment(
          time
        ).format("LT")}?`}
      />
      <ConfirmDialog
        open={openCancel}
        onClose={onClose}
        onConfirm={onConfirmCancel}
        title="Stop Shutdown"
        description={`Are you sure you want to cancel the shutdown?`}
      />
    </Container>
  );
}

export default App;

"use client";

import {
  Brightness4,
  Brightness7,
  Close,
  Computer,
  Logout,
  PowerSettingsNew,
  Settings
} from "@mui/icons-material";
import ComputerIcon from "@mui/icons-material/Computer";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import ComputerCard from "./components/ComputerCard";
import ComputerCardSkeleton from "./components/ComputerCardSkeleton";
import RefreshIcon from '@mui/icons-material/Refresh';
import { getComputers, removeComputer, shutdownAll, shutdownComputer, } from "./lib/api";
import { checkSessionExpiry, generateSessionKey, validateEncryptedKey } from "./lib/sessionKeyHelper";

const generateMockComputers = (count = 20) => {
  const computers = [];
  const statuses = ["online", "offline"];

  for (let i = 1; i <= count; i++) {
    const isOnline = Math.random() > 0.3;
    const status = isOnline ? "online" : "offline";
    const uptime = isOnline ? Math.floor(Math.random() * 86400) : 0;

    computers.push({
      computer_name: `LAB-${i.toString().padStart(2, "0")}`,
      ip: `192.168.1.${i}`,
      start_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - (isOnline ? 0 : Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
      uptime_seconds: uptime,
      status: status
    });
  }
  return computers;
};

export default function Home() {
  const [computers, setComputers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingShutdownComputer, setPendingShutdownComputer] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeMode, setThemeMode] = useState("system");
  const [darkMode, setDarkMode] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const correctUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_ACCESS;
  const accessPassword = process.env.NEXT_PUBLIC_ACCESS_FUNCTION;

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  }), [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = sessionStorage.getItem("authToken");
      const storedTheme = localStorage.getItem("themeMode");
      if (storedToken) {
        const isValid = await validateEncryptedKey(storedToken);
        if (isValid) {
          setAuthenticated(true);
        } else {
          sessionStorage.clear();
        }
      }

      if (storedTheme) {
        setThemeMode(storedTheme);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (themeMode === "system") {
        setDarkMode(e.matches);
      }
    };

    if (themeMode === "system") {
      setDarkMode(mediaQuery.matches);
    } else {
      setDarkMode(themeMode === "dark");
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode]);

  useEffect(() => {
    if (!authenticated) return;
    const fetchComputers = async () => {
      try {
        const data = await getComputers();
        setComputers(Array.isArray(data) ? data : []);
        setFetchError("");
        setIsBackendDown(false);
        setIsLoading(true)
      } catch (error) {
        console.error("Failed to fetch computers:", error);
        setFetchError("Failed to load computers. Please try again later.");
        setComputers([]);
        setIsBackendDown(true);
        setIsLoading(true)
      }
    };
    fetchComputers();
    const interval = setInterval(fetchComputers, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === correctUsername && password === correctPassword) {
      const encryptedSessionKey = await generateSessionKey();
      sessionStorage.setItem("authToken", encryptedSessionKey);
      setAuthenticated(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Incorrect username or password.");
    }
  };

  const handleLogout = (title, icon) => {
    Swal.fire({
      title: title,
      icon: icon,
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true
    });

    setTimeout(() => {
      setAuthenticated(false);
      sessionStorage.clear();
      setUsername("");
      setPassword("");
      handleMenuClose();
    }, 1500);
  };

  const sessionLogout = () => {
    setShowPasswordModal(false)
    setOpenConfirm(false)
    Swal.fire({
      title: "Session expired...",
      icon: "error",
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true
    });

    setTimeout(() => {
      sessionStorage.clear();
      setUsername("");
      setPassword("");
      handleMenuClose();
      setAuthenticated(false);
    }, 1500);
  };

  const checkSession = async () => {
    const sessionValid = await checkSessionExpiry();
    return sessionValid;
  };


  const handleRetry = async () => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    try {
      Swal.fire({
        title: "Reconnecting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const data = await getComputers();
      setComputers(data);
      setFetchError("");
      setIsBackendDown(false);
      setShowPasswordModal(false);
      Swal.fire({
        title: "Connected!",
        icon: "success",
        timer: 1000,
        showConfirmButton: false
      });
    } catch (error) {
      setFetchError("Still unable to connect to backend. Please check your connection.");
      Swal.fire({
        title: "Failed!",
        text: "Still unable to connect to backend.",
        icon: "error"
      });
    }
  };

  const handleShutdownClick = async (computerName) => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    setPendingShutdownComputer(computerName);
    setPasswordInput("");
    setPasswordError("");
    setShowPasswordModal(true);
  };


  const confirmShutdown = async () => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    if (passwordInput === accessPassword) {
      try {
        Swal.fire({
          title: "Shutting down...",
          html: `Sending shutdown command to ${pendingShutdownComputer}`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await shutdownComputer(pendingShutdownComputer);

        if (response && response.ok) {
          setShowPasswordModal(false);
          Swal.fire({
            title: "Success!",
            text: `Shutdown command sent for ${pendingShutdownComputer}.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error("Failed to shutdown computer");
        }
      } catch (error) {
        console.error("Shutdown error:", error);
        Swal.fire({
          title: "Failed!",
          text: error.message || "Failed to shut down the computer. Please try again.",
          icon: "error"
        });
      } finally {
        setShowPasswordModal(false);
        setPendingShutdownComputer(null);
      }
    } else {
      setPasswordError("Incorrect password.");
    }
  };

  const handleShutdownAll = async () => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    setPendingShutdownComputer("ALL");
    setPasswordInput("");
    setPasswordError("");
    setShowPasswordModal(true);
    handleMenuClose();
  };

  const confirmShutdownAll = async () => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    if (passwordInput === accessPassword) {
      try {
        Swal.fire({
          title: "Shutting down all...",
          html: "Sending shutdown command to all computers",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await shutdownAll();

        if (response && response.ok) {
          setShowPasswordModal(false);
          Swal.fire({
            title: "Success!",
            text: "Shutdown command sent to all computers.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error("Failed to shutdown all computers");
        }
      } catch (error) {
        console.error("Shutdown all error:", error);
        Swal.fire({
          title: "Failed!",
          text: error.message || "Failed to shut down all computers. Please try again.",
          icon: "error"
        });
      } finally {
        setShowPasswordModal(false);
        setPendingShutdownComputer(null);
      }
    } else {
      setPasswordError("Incorrect password.");
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem("themeMode", mode);
    handleMenuClose();
  };

  const handleRemoveClick = async (computerName) => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    setDeviceToRemove(computerName);
    setOpenConfirm(true);
  };

  const handleConfirmRemove = async () => {
    const check = await checkSession()
    console.log(check)
    if (check) {
      sessionLogout()
      return;
    }

    try {
      Swal.fire({
        title: "Removing device...",
        html: "Sending remove command...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await removeComputer(deviceToRemove);
      if (response && response.ok) {
        setOpenConfirm(false);
        Swal.fire({
          title: "Success!",
          text: "Device removed",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        const data = await getComputers();
        setComputers(data);
      } else {
        throw new Error("Failed to remove device");
      }
    } catch (error) {
      console.error("Failed to remove device:", error);
      Swal.fire({
        title: "Failed!",
        text: error.message || "Failed to remove device. Please try again.",
        icon: "error"
      });
    } finally {
      setOpenConfirm(false);
    }
  };


  if (isCheckingAuth) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!authenticated ?
        <Container maxWidth="xs" sx={{ height: "100vh", display: "flex", alignItems: "center" }}>
          <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Login
            </Typography>
            {loginError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {loginError}
              </Typography>
            )}
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>
            </Box>
          </Paper>
        </Container>
        :
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Computer sx={{ mr: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  gap: {
                    xs: "0px",
                    sm: "10px",
                  },
                  flexGrow: 1,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                }}
              >
                <Typography variant="h6" component="div">
                  PC Dashboard
                </Typography>

                {Array.isArray(computers) && computers.some(c => c.status === "online") && (
                  <Button
                    onClick={handleShutdownAll}
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{
                      marginBottom: {
                        xs: "5px",
                        sm: "0px",
                      }
                    }}
                    startIcon={<PowerSettingsNew />}
                  >
                    Shutdown All
                  </Button>
                )}
              </Box>

              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
              >
                <Settings />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleThemeChange("system")}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Brightness4 sx={{ mr: 1 }} />
                    <Typography>System Theme</Typography>
                    {themeMode === "system" && <Box sx={{ flexGrow: 1, textAlign: "right" }}>✓</Box>}
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange("light")}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Brightness7 sx={{ mr: 1 }} />
                    <Typography>Light Mode</Typography>
                    {themeMode === "light" && <Box sx={{ flexGrow: 1, textAlign: "right" }}>✓</Box>}
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange("dark")}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Brightness4 sx={{ mr: 1 }} />
                    <Typography>Dark Mode</Typography>
                    {themeMode === "dark" && <Box sx={{ flexGrow: 1, textAlign: "right" }}>✓</Box>}
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleLogout("Logging out...", "success")}>
                  <Logout sx={{ mr: 1 }} />
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ py: 3, flex: 1, pt: "80px" }}>
            {fetchError && (
              <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: "error.light" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>{fetchError}</Typography>
                  <Button onClick={handleRetry} variant="contained" color="error">
                    Retry
                  </Button>
                </Box>
              </Paper>
            )}

            {isBackendDown ? (
              <Box textAlign="center" py={10}>
                <Typography variant="h6" gutterBottom>
                  Backend service is currently unavailable
                </Typography>
                <Button
                  onClick={handleRetry}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Retry Connection
                </Button>
              </Box>
            ) : (
              <>
                {isLoading ? (
                  <Grid container spacing={2}>
                    {computers && computers?.length > 0 ? (
                      computers?.map((comp) => (
                        <Grid container key={comp.ip} columns={{ xs: 12, sm: 6, md: 4 }} >
                          <ComputerCard
                            computerName={comp.computer_name}
                            ip={comp.ip}
                            startTime={comp.start_time}
                            lastSeen={comp.lastSeen}
                            uptimeSec={comp.uptime_seconds}
                            status={comp.status}
                            onShutdown={() => handleShutdownClick(comp.computer_name)}
                            onRemove={() => handleRemoveClick(comp.computer_name)}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Box sx={{
                        width: "100%"
                      }}>
                        <Card
                          sx={{
                            width: "100%",
                            p: 5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                          }}
                        >
                          <CardContent>
                            <Box
                              width="100%"
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap={2}
                            >
                              <ComputerIcon
                                fontSize="large"
                                color="disabled"
                                sx={{ opacity: 0.6 }}
                              />
                              <Typography variant="h5" color="textSecondary">
                                No computers found
                              </Typography>
                              <Typography variant="body2" color="text.disabled">
                                Agent is offline
                              </Typography>
                              <Button onClick={() => handleRetry()}>
                                <RefreshIcon />
                                <span style={{ marginLeft: "5px" }}>Refresh</span>
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>

                    )}
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    {[...Array(20)].map((_, index) => (
                      <Grid container key={index} columns={{ xs: 12, sm: 6, md: 4 }}>
                        <ComputerCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                )}

              </>
            )}
          </Container>

          <Box component="footer" sx={{ py: 1, px: 2, textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              V.5.1.0
            </Typography>
          </Box>
          <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                pendingShutdownComputer === "ALL"
                  ? confirmShutdownAll()
                  : confirmShutdown();
              }}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                backgroundColor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {pendingShutdownComputer === "ALL"
                    ? " Confirm Shutdown All"
                    : " Confirm Shutdown"}
                </Typography>
                <IconButton onClick={() => setShowPasswordModal(false)}>
                  <Close />
                </IconButton>
              </Box>
              <Typography variant="body1" gutterBottom>
                {pendingShutdownComputer === "ALL"
                  ? ` Enter password to shut down all computers:`
                  : ` Enter password to shut down ${pendingShutdownComputer}:`}
              </Typography>
              <TextField
                fullWidth
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                margin="normal"
                error={!!passwordError}
                helperText={passwordError}
              />
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button onClick={() => setShowPasswordModal(false)} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="error">
                  Confirm
                </Button>
              </Box>
            </Box>
          </Modal>
          <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
            <DialogTitle>Confirm Device Removal</DialogTitle>
            <DialogContent>
              Are you sure you want to remove {deviceToRemove} from management?
              <br />
              <Typography variant="caption" color="textSecondary" mb={1}>
                Note: Devices that come online will be added automatically.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
              <Button onClick={handleConfirmRemove} color="error">Remove</Button>
            </DialogActions>
          </Dialog>
        </Box>
      }
    </ThemeProvider >
  );
}
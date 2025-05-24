"use client";

import { Delete, PowerSettingsNew } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useState } from 'react';

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
};

export default function ComputerCard({
  computerName,
  ip,
  startTime,
  lastSeen,
  status,
  uptimeSec,
  onShutdown,
  onRemove,
}) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    if (status === 'online') return theme.palette.success.main;
    if (status === 'offline') return theme.palette.error.main;
    return theme.palette.warning.main;
  };

  const getStatusTextColor = () => {
    if (status === 'online') return theme.palette.success.dark;
    if (status === 'offline') return theme.palette.error.dark;
    return theme.palette.warning.dark;
  };

  return (
    <Card
      sx={{
        width: 320,
        minHeight: 400,
        borderRadius: 2,
        boxShadow: isHovered ? theme.shadows[8] : theme.shadows[2],
        position: 'relative',
        overflow: 'visible',
        backgroundColor: theme.palette.background.paper,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status indicator bar */}
      <Box sx={{
        height: 6,
        width: '100%',
        backgroundColor: getStatusColor(),
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }} />

      <CardContent sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}>
        {/* Header section */}
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: 2,
        }}>
          <Avatar sx={{
            bgcolor: getStatusColor(),
            width: 48,
            height: 48,
            mr: 2,
            boxShadow: theme.shadows[2],
          }}>
            <PowerSettingsNew fontSize="medium" sx={{ color: 'white' }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h2"
              noWrap
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {computerName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontFamily: 'monospace',
                  backgroundColor: theme.palette.mode === 'dark'
                    ? theme.palette.grey[800]
                    : theme.palette.grey[100],
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {ip}
              </Typography>
            </Box>
          </Box>


        </Box>

        {/* Status chip */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: theme.palette.mode === 'dark'
                ? `${getStatusColor()}30`
                : `${getStatusColor()}20`,
              color: getStatusTextColor(),
              fontWeight: 600,
              px: 1,
            }}
          />
        </Box>

        <Divider
          sx={{
            my: 1,
            borderColor: theme.palette.mode === 'dark'
              ? theme.palette.grey[700]
              : theme.palette.grey[300],
          }}
        />

        {/* Info section */}
        <Box sx={{ mb: 2, flexGrow: 1 }}>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              UPTIME
            </Typography>
            <Typography variant="body1" fontFamily="monospace" fontWeight={500}>
              {formatUptime(uptimeSec)}
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              LAST SEEN
            </Typography>
            <Typography variant="body1" color="text.primary">
              {new Date(lastSeen).toLocaleTimeString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              STARTED
            </Typography>
            <Typography variant="body1" color="text.primary">
              {new Date(startTime).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          display: 'flex',
          gap: 2,
          mt: 'auto',
          minHeight: 36,
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          {status === "online" ? (
            <>
              <Tooltip title="Shutdown Device">
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<PowerSettingsNew fontSize="small" />}
                  onClick={onShutdown}
                  sx={{
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                      backgroundColor: theme.palette.error.dark,
                    }
                  }}
                >
                  Shutdown
                </Button>
              </Tooltip>
            </>
          ) : (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: '100%' }} // or a fixed width if needed
            >
              {/* Text on the left */}
              <Typography variant="body2" color="text.secondary">
                Device is offline
              </Typography>

              {/* Delete button on the right */}
              <Tooltip title="Remove device from management">
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: theme.palette.mode === 'dark'
                      ? theme.palette.grey[600]
                      : theme.palette.grey[400],
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.error.light
                      : theme.palette.error.dark,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.error.dark + '20'
                        : theme.palette.error.light + '20',
                      borderColor: theme.palette.error.main,
                    }
                  }}
                  onClick={() => onRemove(computerName)}
                >
                  <Delete fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, Skeleton, Box, Avatar, Divider, useTheme } from "@mui/material";

const ComputerCardSkeleton = () => {
    const theme = useTheme();
    return (
        <Card
            sx={{
                width: 320,
                minHeight: 400,
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                position: "relative",
                overflow: "visible",
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Box
                sx={{
                    height: 6,
                    width: "100%",
                    backgroundColor: theme.palette.grey[300],
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
            />
            <CardContent
                sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                    <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" height={35} width="80%" />
                        <Skeleton variant="text" height={35} width="60%" sx={{ mt: 1 }} />
                    </Box>
                </Box>
                <Skeleton variant="rectangular" height={24} width={80}
                    sx={{
                        mb: 1,
                        borderRadius: 5,
                        backgroundColor: theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.grey[200],
                    }} />
                <Divider sx={{
                    my: 1,
                    borderColor:
                        theme.palette.mode === "dark"
                            ? theme.palette.grey[700]
                            : theme.palette.grey[300],
                }} />

                <Box sx={{ mb: 3, flexGrow: 1 }}>
                    {[...Array(3)].map((_, index) => (
                        <Box sx={{ mb: 1.5 }} key={index}>
                            <Skeleton variant="text" height={20} width="30%" />
                            <Skeleton variant="text" height={24} width="50%" />
                        </Box>
                    ))}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        mt: "auto",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Skeleton variant="rectangular" height={30} width="100%" />
                </Box>
            </CardContent>
        </Card>
    );
};
export default ComputerCardSkeleton;

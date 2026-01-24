import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Container,
    Box,
    Checkbox,
    FormControlLabel,
    Paper,
    CircularProgress,
    Snackbar,
    Alert,
    Divider,
    Chip,
    Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import PageLayout from '../common/components/PageLayout';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

const ModulesPage = () => {
    const { classes } = useSettingsStyles();
    const t = useTranslation();
    const { id } = useParams();
    const location = useLocation();

    // Determine entity type from URL path
    const entityType = location.pathname.includes('/user/') ? 'user' : 'group';

    const [allModules, setAllModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Organize modules into hierarchy
    const { parentModules, childModulesMap } = useMemo(() => {
        const parents = [];
        const childrenMap = {};

        allModules.forEach((module) => {
            if (!module.parentCode) {
                // This is a parent module
                parents.push(module);
                if (!childrenMap[module.code]) {
                    childrenMap[module.code] = [];
                }
            } else {
                // This is a child module
                if (!childrenMap[module.parentCode]) {
                    childrenMap[module.parentCode] = [];
                }
                childrenMap[module.parentCode].push(module);
            }
        });

        // Sort parents alphabetically
        parents.sort((a, b) => a.name.localeCompare(b.name));

        // Sort children alphabetically within each parent
        Object.keys(childrenMap).forEach((key) => {
            childrenMap[key].sort((a, b) => a.name.localeCompare(b.name));
        });

        return { parentModules: parents, childModulesMap: childrenMap };
    }, [allModules]);

    // Fetch modules
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                if (entityType === 'group') {
                    // For groups, fetch all modules and assigned modules separately
                    const allModulesResponse = await fetchOrThrow('/api/company/modules');
                    const allModulesData = await allModulesResponse.json();

                    const assignedResponse = await fetchOrThrow(`/api/groups/${id}/modules`);
                    const assignedModulesData = await assignedResponse.json();
                    const assignedIds = new Set(assignedModulesData.map((m) => m.id));

                    // Mark which modules are assigned to the group
                    const modulesWithStatus = allModulesData.map((module) => ({
                        ...module,
                        directlyAssigned: assignedIds.has(module.id),
                        inheritedFrom: [],
                    }));

                    setAllModules(modulesWithStatus);
                } else {
                    // For users, use the detailed endpoint that shows direct vs inherited
                    const response = await fetchOrThrow(`/api/modules/user/${id}/detailed`);
                    const detailedModules = await response.json();
                    setAllModules(detailedModules);
                }
            } catch (error) {
                console.error('Failed to fetch modules:', error);
                setSnackbar({
                    open: true,
                    message: t('errorGeneral') || 'Error loading modules',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, entityType, t]);

    const handleToggleModule = async (moduleId, isCurrentlyDirectlyAssigned) => {
        setSaving(true);
        try {
            const endpoint = entityType === 'group'
                ? `/api/groups/${id}/modules/${moduleId}`
                : `/api/modules/user/${id}/module/${moduleId}`;

            const method = isCurrentlyDirectlyAssigned ? 'DELETE' : 'POST';

            await fetchOrThrow(endpoint, { method });

            // Update local state
            setAllModules((prev) =>
                prev.map((module) =>
                    module.id === moduleId
                        ? { ...module, directlyAssigned: !isCurrentlyDirectlyAssigned }
                        : module
                )
            );

            setSnackbar({
                open: true,
                message: t('sharedSaved') || 'Saved',
                severity: 'success',
            });
        } catch (error) {
            console.error('Failed to update module assignment:', error);
            setSnackbar({
                open: true,
                message: t('errorGeneral') || 'Error saving module assignment',
                severity: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    const getBreadcrumbs = () => {
        if (entityType === 'group') {
            return ['settingsTitle', 'settingsGroups', 'sharedModules'];
        }
        return ['settingsTitle', 'settingsUser', 'sharedModules'];
    };

    const renderPermissionBadges = (module) => {
        const badges = [];

        if (module.directlyAssigned) {
            badges.push(
                <Tooltip key="direct" title={t('moduleDirectAssignment') || 'Directly assigned to this user'}>
                    <Chip
                        icon={<PersonIcon />}
                        label={t('moduleDirect') || 'Direct'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                </Tooltip>
            );
        }

        if (module.inheritedFrom && module.inheritedFrom.length > 0) {
            const groupNames = module.inheritedFrom.map((g) => g.groupName).join(', ');
            badges.push(
                <Tooltip key="inherited" title={`${t('moduleInheritedFrom') || 'Inherited from groups'}: ${groupNames}`}>
                    <Chip
                        icon={<GroupIcon />}
                        label={`${t('moduleInherited') || 'Inherited'} (${module.inheritedFrom.length})`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                </Tooltip>
            );
        }

        return badges;
    };

    const hasAccess = (module) => {
        return module.directlyAssigned || (module.inheritedFrom && module.inheritedFrom.length > 0);
    };

    const renderModuleCheckbox = (module, isChild = false) => {
        const isAssigned = module.directlyAssigned;
        const hasInheritedAccess = module.inheritedFrom && module.inheritedFrom.length > 0;
        const hasAnyAccess = hasAccess(module);

        return (
            <Box
                key={module.id}
                sx={{
                    ml: isChild ? 4 : 0,
                    mb: 1.5,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: hasAnyAccess ? 'action.selected' : 'transparent',
                    border: hasInheritedAccess && !isAssigned ? '1px dashed' : 'none',
                    borderColor: 'secondary.main',
                }}
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isAssigned}
                            indeterminate={!isAssigned && hasInheritedAccess}
                            disabled={saving}
                            onChange={() => handleToggleModule(module.id, isAssigned)}
                            size={isChild ? 'small' : 'medium'}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography
                                variant={isChild ? 'body2' : 'body1'}
                                component="span"
                                sx={{ fontWeight: isChild ? 400 : 500 }}
                            >
                                {module.name}
                            </Typography>
                            {entityType === 'user' && renderPermissionBadges(module)}
                        </Box>
                    }
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        '& .MuiCheckbox-root': { mt: -0.5 },
                    }}
                />
                {module.description && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', ml: 4 }}
                    >
                        {module.description}
                    </Typography>
                )}
                {entityType === 'user' && hasInheritedAccess && !isAssigned && (
                    <Typography
                        variant="caption"
                        color="secondary.main"
                        sx={{ display: 'block', ml: 4, mt: 0.5, fontStyle: 'italic' }}
                    >
                        {t('moduleAccessViaGroup') || 'Access granted via group membership'}
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <PageLayout
            menu={<SettingsMenu />}
            breadcrumbs={getBreadcrumbs()}
        >
            <Container maxWidth="md" className={classes.container}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">
                            {entityType === 'group' ? t('settingsGroups') : t('settingsUser')} - {t('sharedModules') || 'Modules'}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {entityType === 'user' && (
                            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1, opacity: 0.9 }}>
                                <Typography variant="body2" color="info.contrastText">
                                    <strong>{t('moduleLegend') || 'Legend'}:</strong>
                                    {' '}
                                    <Chip icon={<PersonIcon />} label={t('moduleDirect') || 'Direct'} size="small" color="primary" variant="outlined" sx={{ mx: 0.5 }} />
                                    {t('moduleDirectDesc') || '= Assigned directly'}
                                    {' | '}
                                    <Chip icon={<GroupIcon />} label={t('moduleInherited') || 'Inherited'} size="small" color="secondary" variant="outlined" sx={{ mx: 0.5 }} />
                                    {t('moduleInheritedDesc') || '= From group membership'}
                                </Typography>
                            </Box>
                        )}
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                {parentModules.length === 0 ? (
                                    <Typography color="text.secondary" align="center">
                                        {t('sharedNoData') || 'No modules available'}
                                    </Typography>
                                ) : (
                                    parentModules.map((parentModule, index) => {
                                        const children = childModulesMap[parentModule.code] || [];
                                        return (
                                            <Box key={parentModule.id}>
                                                {index > 0 && <Divider sx={{ my: 2 }} />}

                                                {/* Parent Module */}
                                                {renderModuleCheckbox(parentModule, false)}

                                                {/* Child Modules (Sub-permissions) */}
                                                {children.length > 0 && (
                                                    <Box sx={{
                                                        ml: 2,
                                                        pl: 2,
                                                        borderLeft: '2px solid',
                                                        borderColor: 'divider',
                                                    }}>
                                                        {children.map((child) => renderModuleCheckbox(child, true))}
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })
                                )}
                            </Paper>
                        )}
                    </AccordionDetails>
                </Accordion>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageLayout>
    );
};

export default ModulesPage;

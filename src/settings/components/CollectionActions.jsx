import { useState } from 'react';
import {
  IconButton, Menu, MenuItem, useMediaQuery, useTheme,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import RemoveDialog from '../../common/components/RemoveDialog';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useHasModule, useModules } from '../../common/util/useModules';

const useStyles = makeStyles()(() => ({
  row: {
    display: 'flex',
  },
}));

const CollectionActions = ({
  itemId, editPath, endpoint, setTimestamp, customActions, readonly,
}) => {
  const theme = useTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleEdit = () => {
    navigate(`${editPath}/${itemId}`);
    setMenuAnchorEl(null);
  };

  const handleRemove = () => {
    setRemoving(true);
    setMenuAnchorEl(null);
  };

  const handleCustom = (action) => {
    action.handler(itemId);
    setMenuAnchorEl(null);
  };

  const handleRemoveResult = (removed) => {
    setRemoving(false);
    if (removed) {
      setTimestamp(Date.now());
    }
  };

  const handleNavigateToModules = () => {
    navigate(`${editPath}/${itemId}/modules`);
  }

  let moduleUpdate;
  let moduleDelete;

  const currentPath = window.location.pathname;

  switch (currentPath) {
    case '/settings/devices':
      moduleUpdate = 'DEVICES_UPDATE';
      moduleDelete = 'DEVICES_DELETE';
      break;
    case '/settings/groups':
      moduleUpdate = 'GROUPS_UPDATE';
      moduleDelete = 'GROUPS_DELETE';
      break;
    case '/settings/users':
      moduleUpdate = 'USERS_UPDATE';
      moduleDelete = 'USERS_DELETE';
      break;

    case '/settings/calendars':
      moduleUpdate = 'CALENDAR_UPDATE';
      moduleDelete = 'CALENDAR_DELETE';
      break;

    case '/settings/fines':
      moduleUpdate = 'FINES_UPDATE';
      moduleDelete = 'FINES_DELETE';
      break;

    case '/settings/maintenances':
      console.log("MAINTENANCE HERE!");
      moduleUpdate = 'MAINTENANCE_UPDATE';
      moduleDelete = 'MAINTENANCE_DELETE';
      break;

    case '/settings/drivers':
      moduleUpdate = 'DRIVERS_UPDATE';
      moduleDelete = 'DRIVERS_DELETE';
      break;

    case '/settings/notifications':
      moduleUpdate = 'NOTIFICATIONS_UPDATE';
      moduleDelete = 'NOTIFICATIONS_DELETE';
      break;

    case '/settings/attributes':
      moduleUpdate = 'ATTRIBUTES_UPDATE';
      moduleDelete = 'ATTRIBUTES_DELETE';
      break;
    default:
      break;
  }

  const hasModuleUpdate = useHasModule(moduleUpdate);
  const hasModuleDelete = useHasModule(moduleDelete);

  const allUserModules = useModules();

  console.log("URL: ", currentPath);

  return (
    <>
      {phone ? (
        <>
          <IconButton size="small" onClick={(event) => setMenuAnchorEl(event.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu open={!!menuAnchorEl} anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)}>
            {customActions && customActions.map((action) => (
              <MenuItem onClick={() => handleCustom(action)} key={action.key}>{action.title}</MenuItem>
            ))}
            {!readonly && hasModuleDelete && (
              <>
                {editPath && <MenuItem onClick={handleEdit}>{t('sharedEdit')}</MenuItem>}
                <MenuItem onClick={handleRemove}>{t('sharedRemove')}</MenuItem>
              </>
            )}
          </Menu>
        </>
      ) : (
        <div className={classes.row}>
          {customActions && hasModuleUpdate && customActions.map((action) => (
            <Tooltip title={action.title} key={action.key}>
              <IconButton size="small" onClick={() => handleCustom(action)}>
                {action.icon}
              </IconButton>
            </Tooltip>
          ))}
          {!readonly && (
            <>

              {editPath && hasModuleUpdate && (
                <Tooltip title={t('sharedEdit')}>
                  <IconButton size="small" onClick={handleEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {hasModuleDelete && (
                <Tooltip title={t('sharedRemove')}>
                  <IconButton size="small" onClick={handleRemove}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
          <>
            <Tooltip title={t('sharedEdit')}>
              <IconButton size="small" onClick={handleNavigateToModules}>
                <span>Módulos</span>
              </IconButton>
            </Tooltip>
          </>
        </div>
      )}
      <RemoveDialog style={{ transform: 'none' }} open={removing} endpoint={endpoint} itemId={itemId} onResult={handleRemoveResult} />
    </>
  );
};

export default CollectionActions;

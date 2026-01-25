import { Fab } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';
import { useHasModule } from '../../common/util/useModules';

const useStyles = makeStyles()((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(2)})`,
    },
  },
}));

const CollectionFab = ({ editPath, disabled }) => {

  let moduleCreate = null;

  const currentPath = window.location.pathname;

  switch (currentPath) {
    case '/settings/devices':
      moduleCreate = 'DEVICES_CREATE';
      break;
    case '/settings/groups':
      moduleCreate = 'GROUPS_CREATE';
      break;
    case '/settings/users':
      moduleCreate = 'USERS_CREATE';
      break;

    case '/settings/fines':
      moduleCreate = 'FINES_CREATE';
      break;

    case '/settings/calendars':
      moduleCreate = 'CALENDAR_CREATE';
      break;

    case '/settings/maintenances':
      moduleCreate = 'MAINTENANCE_CREATE';
      break;

    case '/settings/drivers':
      moduleCreate = 'DRIVERS_CREATE';
      break;

    case '/settings/notifications':
      moduleCreate = 'NOTIFICATIONS_CREATE';
      break;
    case '/settings/attributes':
      console.log("attributes");
      moduleCreate = 'ATTRIBUTES_CREATE';
      break;
    default:
      break;
  }

  const { classes } = useStyles();
  const navigate = useNavigate();

  const hasModuleCreate = useHasModule(moduleCreate);

  const readonly = useRestriction('readonly');

  if (!readonly && !disabled && hasModuleCreate) {
    return (
      <div className={classes.fab}>
        <Fab size="medium" color="primary" onClick={() => navigate(editPath)}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
  return '';
};

export default CollectionFab;

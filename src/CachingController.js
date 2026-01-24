import { useDispatch, useSelector, connect } from 'react-redux';
import {
  geofencesActions, groupsActions, driversActions, maintenancesActions, calendarsActions,
} from './store';
import { useEffectAsync } from './reactHelper';
import fetchOrThrow from './common/util/fetchOrThrow';
import { useHasModule } from './common/util/useModules';

const CachingController = () => {

  //Modules access
  const hasCalendarModule = useHasModule('CALENDAR');
  const hasGeofenceModule = useHasModule('GEOFENCES');
  const hasGroupModule = useHasModule('GROUPS');
  const hasDriverModule = useHasModule('DRIVERS');
  const hasMaintenanceModule = useHasModule('MAINTENANCE');

  const authenticated = useSelector((state) => !!state.session.user);
  const dispatch = useDispatch();

  useEffectAsync(async () => {
    if (authenticated && hasGeofenceModule) {
      const response = await fetchOrThrow('/api/geofences');
      dispatch(geofencesActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated && hasGroupModule) {
      const response = await fetchOrThrow('/api/groups');
      dispatch(groupsActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated && hasDriverModule) {
      const response = await fetchOrThrow('/api/drivers');
      dispatch(driversActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated && hasMaintenanceModule) {
      const response = await fetchOrThrow('/api/maintenance');
      dispatch(maintenancesActions.refresh(await response.json()));
    }
  }, [authenticated]);

  useEffectAsync(async () => {
    if (authenticated && hasCalendarModule) {
      const response = await fetchOrThrow('/api/calendars');
      dispatch(calendarsActions.refresh(await response.json()));
    }
  }, [authenticated]);

  return null;
};

export default connect()(CachingController);

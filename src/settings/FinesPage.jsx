import { useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
    Table, TableRow, TableCell, TableHead, TableBody, Box, TextField,
    FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import { formatNumber } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import SelectField from '../common/components/SelectField';
import fetchOrThrow from '../common/util/fetchOrThrow';

const FinesPage = () => {
    const { classes } = useSettingsStyles();
    const t = useTranslation();

    const devices = useSelector((state) => state.devices.items);

    const [timestamp, setTimestamp] = useState(Date.now());
    const [items, setItems] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [deviceFilter, setDeviceFilter] = useState(null);
    const [driverFilter, setDriverFilter] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [paidFilter, setPaidFilter] = useState('all');
    const [drivers, setDrivers] = useState([]);

    useEffectAsync(async () => {
        setLoading(true);
        try {
            const response = await fetchOrThrow('/api/fines');
            setItems(await response.json());
        } finally {
            setLoading(false);
        }
    }, [timestamp]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '';
        return `R$ ${formatNumber(value, 2)}`;
    };

    const getDeviceName = (deviceId) => {
        const device = Object.values(devices).find((d) => d.id === deviceId);
        return device ? device.name : '-';
    };

    const getDriverName = (driverId) => {
        const driver = drivers.find((d) => d.id === driverId);
        return driver ? driver.name : '-';
    };

    const filteredItems = items
        .filter(filterByKeyword(searchKeyword))
        .filter((item) => !deviceFilter || item.deviceId === deviceFilter)
        .filter((item) => !driverFilter || item.driverId === driverFilter)
        .filter((item) => !dateFrom || item.date >= dateFrom)
        .filter((item) => !dateTo || item.date <= dateTo)
        .filter((item) => {
            if (paidFilter === 'all') return true;
            if (paidFilter === 'paid') return item.paid === true;
            if (paidFilter === 'unpaid') return item.paid === false;
            return true;
        });

    return (
        <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedFines']}>
            <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2 }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <SelectField
                        fullWidth
                        label={t('sharedDevice')}
                        value={deviceFilter}
                        onChange={(e) => setDeviceFilter(e.target.value)}
                        data={Object.values(devices)}
                        keyGetter={(item) => item.id}
                        titleGetter={(item) => item.name}
                    />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <SelectField
                        fullWidth
                        endpoint="/api/drivers"
                        label={t('sharedDriver')}
                        value={driverFilter}
                        onChange={(e) => setDriverFilter(e.target.value)}
                        data={drivers}
                        keyGetter={(item) => item.id}
                        titleGetter={(item) => item.name}
                    />
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                    <TextField
                        fullWidth
                        type="date"
                        label={t('reportFrom')}
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                    <TextField
                        fullWidth
                        type="date"
                        label={t('reportTo')}
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>{t('finePaid')}</InputLabel>
                        <Select
                            label={t('finePaid')}
                            value={paidFilter}
                            onChange={(e) => setPaidFilter(e.target.value)}
                        >
                            <MenuItem value="all">{t('eventAll')}</MenuItem>
                            <MenuItem value="paid">{t('sharedYes')}</MenuItem>
                            <MenuItem value="unpaid">{t('sharedNo')}</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('sharedName')}</TableCell>
                        <TableCell>{t('sharedDevice')}</TableCell>
                        <TableCell>{t('sharedDriver')}</TableCell>
                        <TableCell>{t('fineValue')}</TableCell>
                        <TableCell>{t('fineDate')}</TableCell>
                        <TableCell>{t('finePaid')}</TableCell>
                        <TableCell className={classes.columnAction} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!loading ? filteredItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{getDeviceName(item.deviceId)}</TableCell>
                            <TableCell>{getDriverName(item.driverId)}</TableCell>
                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                            <TableCell>{formatDate(item.violationDate)}</TableCell>
                            <TableCell>{item.paid ? t('sharedYes') : t('sharedNo')}</TableCell>
                            <TableCell className={classes.columnAction} padding="none">
                                <CollectionActions itemId={item.id} editPath="/settings/fine" endpoint="fines" setTimestamp={setTimestamp} />
                            </TableCell>
                        </TableRow>
                    )) : (<TableShimmer columns={7} endAction />)}
                </TableBody>
            </Table>
            <CollectionFab editPath="/settings/fine" />
        </PageLayout>
    );
};

export default FinesPage;

import { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditItemView from './components/EditItemView';
import SelectField from '../common/components/SelectField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';

const FinePage = () => {
    const { classes } = useSettingsStyles();
    const t = useTranslation();

    const [item, setItem] = useState();

    const validate = () => item && item.driverId && item.deviceId && item.violationType && item.amount;

    const violationTypes = [
        { key: 'speeding', name: t('fineViolationSpeeding') },
        { key: 'redLight', name: t('fineViolationRedLight') },
        { key: 'parking', name: t('fineViolationParking') },
        { key: 'seatbelt', name: t('fineViolationSeatbelt') },
        { key: 'phone', name: t('fineViolationPhone') },
        { key: 'other', name: t('fineViolationOther') },
    ];

    const statusOptions = [
        { key: 'pending', name: t('fineStatusPending') },
        { key: 'paid', name: t('fineStatusPaid') },
        { key: 'contested', name: t('fineStatusContested') },
        { key: 'cancelled', name: t('fineStatusCancelled') },
    ];

    const currencyOptions = [
        { key: 'BRL', name: 'BRL - Real Brasileiro' },
        { key: 'USD', name: 'USD - US Dollar' },
        { key: 'EUR', name: 'EUR - Euro' },
    ];

    return (
        <EditItemView
            endpoint="fines"
            item={item}
            setItem={setItem}
            validate={validate}
            menu={<SettingsMenu />}
            breadcrumbs={['settingsTitle', 'sharedFine']}
        >
            {item && (
                <>
                    {/* Required Fields */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">
                                {t('sharedRequired')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <SelectField
                                value={item.driverId || 0}
                                onChange={(e) => setItem({ ...item, driverId: Number(e.target.value) })}
                                endpoint="/api/drivers"
                                label={t('sharedDriver')}
                            />
                            <SelectField
                                value={item.deviceId || 0}
                                onChange={(e) => setItem({ ...item, deviceId: Number(e.target.value) })}
                                endpoint="/api/devices"
                                label={t('sharedDevice')}
                            />
                            <TextField
                                select
                                value={item.violationType || ''}
                                onChange={(e) => setItem({ ...item, violationType: e.target.value })}
                                label={t('fineViolationType')}
                            >
                                {violationTypes.map((type) => (
                                    <MenuItem key={type.key} value={type.key}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                type="number"
                                value={item.amount || ''}
                                onChange={(e) => setItem({ ...item, amount: Number(e.target.value) })}
                                label={t('fineAmount')}
                                inputProps={{ step: '0.01', min: '0' }}
                            />
                            <TextField
                                select
                                value={item.currency || 'BRL'}
                                onChange={(e) => setItem({ ...item, currency: e.target.value })}
                                label={t('fineCurrency')}
                            >
                                {currencyOptions.map((currency) => (
                                    <MenuItem key={currency.key} value={currency.key}>
                                        {currency.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                value={item.status || 'pending'}
                                onChange={(e) => setItem({ ...item, status: e.target.value })}
                                label={t('fineStatus')}
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status.key} value={status.key}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </AccordionDetails>
                    </Accordion>

                    {/* Violation Details */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">
                                {t('fineViolationDetails')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <TextField
                                type="datetime-local"
                                value={item.violationDate ? item.violationDate.slice(0, 16) : ''}
                                onChange={(e) => setItem({ ...item, violationDate: `${e.target.value}:00Z` })}
                                label={t('fineViolationDate')}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="datetime-local"
                                value={item.violationTime ? item.violationTime.slice(0, 16) : ''}
                                onChange={(e) => setItem({ ...item, violationTime: `${e.target.value}:00Z` })}
                                label={t('fineViolationTime')}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                value={item.description || ''}
                                onChange={(e) => setItem({ ...item, description: e.target.value })}
                                label={t('sharedDescription')}
                                multiline
                                rows={3}
                            />
                            <TextField
                                value={item.issuingAuthority || ''}
                                onChange={(e) => setItem({ ...item, issuingAuthority: e.target.value })}
                                label={t('fineIssuingAuthority')}
                            />
                        </AccordionDetails>
                    </Accordion>

                    {/* Location Details */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">
                                {t('sharedLocation')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <TextField
                                value={item.address || ''}
                                onChange={(e) => setItem({ ...item, address: e.target.value })}
                                label={t('fineAddress')}
                            />
                            <TextField
                                type="number"
                                value={item.latitude || ''}
                                onChange={(e) => setItem({ ...item, latitude: Number(e.target.value) })}
                                label={t('positionLatitude')}
                                inputProps={{ step: 'any' }}
                            />
                            <TextField
                                type="number"
                                value={item.longitude || ''}
                                onChange={(e) => setItem({ ...item, longitude: Number(e.target.value) })}
                                label={t('positionLongitude')}
                                inputProps={{ step: 'any' }}
                            />
                        </AccordionDetails>
                    </Accordion>
                </>
            )}
        </EditItemView>
    );
};

export default FinePage;

import { useSelector } from 'react-redux';

export const useModules = () => {
    const modules = useSelector((state) => state.session.modules);
    return modules || [];
};

export const useHasModule = (code) => {
    const modules = useModules();
    return modules.includes(code);
};

export default useModules;

import { useEffect, useRef } from "react";

const Layout = ({ children }) => {
    const hasInitialized = useRef(false);
    useEffect(() => {
        if (!hasInitialized.current) {
            window.onload = () => setTimeout(() => window.WidgetApp?.mount("header-bar"), 500);
            hasInitialized.current = true;
        }
    }, []);
    return (
        <>
            <div id="header-bar"></div>
            {children}
        </>
    );
};

export default Layout;
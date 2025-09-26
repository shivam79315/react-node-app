import { BrowserRouter, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider } from "./components/providers/QueryProvider";
import { PolarisProvider } from "./components/providers/PolarisProvider";

import { AppProvider } from '@shopify/polaris';
import enTranslations from "@shopify/polaris/locales/en.json";


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  console.log([...document.styleSheets].map(s => s.href || "[inline]"));

  const { t } = useTranslation();

  return (
     <AppProvider i18n={enTranslations} theme={{ colorScheme: "dark-experimental" }}>
        <BrowserRouter>
          <QueryProvider>
            <NavMenu>
              <Link to="/" rel="home">
                Home
              </Link>
              <Link to="/pricing">{t("NavigationMenu.pricing")}</Link>
            </NavMenu>
            <Routes pages={pages} />
          </QueryProvider>
        </BrowserRouter>
    </AppProvider>
  );
}
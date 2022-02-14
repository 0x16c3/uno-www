import { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CssBaseline>
      <SnackbarProvider maxSnack={6}>
        <Component {...pageProps} />
      </SnackbarProvider>
    </CssBaseline>
  );
}

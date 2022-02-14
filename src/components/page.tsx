import Head from 'next/head';
import { Container } from '@mui/material';

export default function Page({
  title = 'UNO - 0x16c3',
  center = true,
  children,
}: {
  title?: string;
  center?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Container sx={{ width: '100vw', height: '100vh' }}>
      <Container
        sx={
          center
            ? {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }
            : {
                display: 'flex',
                height: '100%',
              }
        }
      >
        <Container sx={{ width: '100%', maxWidth: '900px' }}>
          <Head>
            <title>{title}</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main>{children}</main>
        </Container>
      </Container>
    </Container>
  );
}

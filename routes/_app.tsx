import { AppProps } from "$fresh/server.ts";

const App = ({ Component }: AppProps) => (
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>AAA Multiplayer for Web Apps (and Games)</title>
    </head>
    <body>
      <Component />
    </body>
  </html>
);

export default App;

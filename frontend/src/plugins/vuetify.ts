/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from "vuetify";
// Styles
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "systockTheme",
    themes: {
      systockTheme: {
        dark: false,
        colors: {
          primary: "#002855", // Azul escuro institucional
          secondary: "#7b0323", // Verde para métricas e sucessos
          accent: "#00B0FF", // Azul claro para links ou interações
          error: "#D32F2F", // Vermelho padrão para rupturas
          info: "#1976D2",
          success: "#2E7D32",
          warning: "#FFA000",
          background: "#FFFFFF", // Fundo limpo como o do site
          surface: "#F8F9FA", // Superfície de cards
        },
      },
    },
  },
});

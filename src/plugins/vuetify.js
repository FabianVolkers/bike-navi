import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: colors.green.lighten1,
                secondary: colors.green.darken4,
                accent: colors.teal,
            }
        }
    }
});

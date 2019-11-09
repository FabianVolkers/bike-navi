<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img alt="Bike Navi Logo" class="shrink mr-2" contain src="././assets/bike-navi.png"
          transition="scale-transition" width="40" />
        <!--
        <v-img
          alt="Bike Navi Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"
          width="100"
        />
        -->
      </div>

      <v-spacer></v-spacer>
      <!--
      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
      -->
    </v-app-bar>

    <v-content style="max-height:80vh">
      <Navigation v-on:got-route='routeLoader($event)' />
      <Map v-bind:routes='routes' />
    </v-content>
  </v-app>
</template>

<script>
  import Navigation from './components/Navigation';
  import Map from './components/Map';

  export default {
    name: 'App',

    components: {
      Navigation,
      Map
    },

    data: () => ({
        routes: {
        },

        }),
      methods: {
        routeLoader(routes) {
          //console.log(JSON.stringify(routes))
          this.routes = routes
          //this.geoJSONroute = route
          //console.log(this.geoJSONroute)
          //this.$forceUpdate
        }

      },
    };
</script>
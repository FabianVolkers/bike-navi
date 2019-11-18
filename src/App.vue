<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img alt="Bike Navi Logo" class="shrink mr-2" contain src="././assets/bike-navi.png"
          transition="scale-transition" width="40" />
        <h1 class="mr-2">bike.berlin</h1>
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

    <v-content style="max-height:100vh">
      <!-- <Navigation v-on:got-route='routeLoader($event)' 
    for Map v-bind:routes='routes' />-->
      <Search v-on:got-results='resultLoader($event)' v-bind:icons="icons" v-bind:viewbox="viewbox" />
      <Map v-on:changed-view='viewLoader($event)' v-bind:search-results='searchResults' v-bind:icons="icons"/>
    </v-content>
  </v-app>
</template>

<script>
  import Navigation from './components/Navigation';
  import Map from './components/Map';
  import Search from './components/Search';

  export default {
    name: 'App',

    components: {
      Navigation,
      Map,
      Search
    },

    data: () => ({
      nominatimURL: 'http://localhost:7070/',
      openRouteServiceURL: 'https://api.openrouteservice.org/v2/directions/cycling-regular/geojson',
      routes: {},
      viewbox: [],
      hallo: {},
      searchResults: {},
      icons: {
        "university": "mdi-school",
        "bus_stop": "mdi-bus-stop",
        "tram_stop": "mdi-tram",
        "park": "mdi-nature",
        "residential": "mdi-home",
        "house": "mdi-home",
        "fast_food": "mdi-food",
        "aerodrome": "mdi-skull-crossbones",
        'supermarket' : 'mdi-cart',
        "cafe" : 'mdi-coffee',
      }
    }),
    methods: {
      routeLoader(routes) {
        //console.log(JSON.stringify(routes))
        this.routes = routes
        //this.geoJSONroute = route
        //console.log(this.geoJSONroute)
        //this.$forceUpdate
      },
      resultLoader(results) {
        this.searchResults = results
        this.$forceUpdate()
        console.log(results)
        //console.log(JSON.stringify(results))
      },
      viewLoader(viewbox) {
        this.viewbox = viewbox
        this.$forceUpdate()
        console.log(viewbox)
      }

    },
  };
</script>